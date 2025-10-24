import React, { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getProjects, addProject, getCarbonCredits, listCredit, claimProceeds, CarbonCredit, getMyListings, Listing } from '../../store/carbonSlice';
import ipfsService from '../../services/ipfsService';
import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../ui/tabs';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '../ui/dialog';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Textarea } from '../ui/textarea';
import { WalletAlert } from '../WalletAlert';
import { Plus, Leaf, Check, Clock, ShoppingCart, Loader2, XCircle } from 'lucide-react';
import { toast } from 'sonner';
import escrowService from '../../services/escrowService';
import { selectHashConnect } from '../../store/hashconnectSlice';
import { useHashConnect } from '../../hooks/useHashConnect';
import { SubmissionProgress } from '../SubmissionProgress';

export function SellerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { projects, carbonCredits, myListings, isLoading } = useSelector((state: RootState) => state.carbon);
  const { isConnected, accountId } = useSelector(selectHashConnect);
  const { connect } = useHashConnect();

  const [activeProjectFilter, setActiveProjectFilter] = useState<'ALL' | 'PENDING' | 'APPROVED' | 'REJECTED'>('ALL');
  const [activeCreditFilter, setActiveCreditFilter] = useState<'MINTED' | 'LISTED' | 'SOLD'>('MINTED');















  const [formData, setFormData] = useState({ name: '', description: '', location: '', tonnage: '', vintage: '2024' });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  useEffect(() => {
    if (currentUser) {
        dispatch(getProjects());
        dispatch(getCarbonCredits());
        dispatch(getMyListings());
    }
  }, [dispatch, currentUser]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submissionStep, setSubmissionStep] = useState(0);
  const [errorStep, setErrorStep] = useState<number | null>(null);

  const [isListingOpen, setIsListingOpen] = useState(false);
  const [selectedCreditForListing, setSelectedCreditForListing] = useState<CarbonCredit | null>(null);
  const [listingPrice, setListingPrice] = useState('');
  const [isListing, setIsListing] = useState(false);
  const [listingStep, setListingStep] = useState(0);
  const [listingErrorStep, setListingErrorStep] = useState<number | null>(null);

  const [isClaimingOpen, setIsClaimingOpen] = useState(false);
  const [selectedCreditForClaiming, setSelectedCreditForClaiming] = useState<CarbonCredit | null>(null);
  const [isClaiming, setIsClaiming] = useState(false);
  const [claimStep, setClaimStep] = useState(0);
  const [claimErrorStep, setClaimErrorStep] = useState<number | null>(null);

  // Data derived for Projects
  const myProjects = useMemo(() => projects.filter(p => p.owner?.username === currentUser?.user?.username), [projects, currentUser]);
  const pendingProjects = useMemo(() => myProjects.filter(p => p.status === 'PENDING'), [myProjects]);
  const approvedProjects = useMemo(() => myProjects.filter(p => p.status === 'APPROVED'), [myProjects]);
  const rejectedProjects = useMemo(() => myProjects.filter(p => p.status === 'REJECTED'), [myProjects]);

  const filteredProjects = useMemo(() => {
    switch (activeProjectFilter) {
      case 'PENDING': return pendingProjects;
      case 'APPROVED': return approvedProjects;
      case 'REJECTED': return rejectedProjects;
      case 'ALL':
      default: return myProjects;
    }
  }, [activeProjectFilter, myProjects, pendingProjects, approvedProjects, rejectedProjects]);

  // Data derived for Credits
  const mintedCredits = useMemo(() => carbonCredits.filter(c => c.owner?.username === currentUser?.user?.username && c.status === 'MINTED'), [carbonCredits, currentUser]);
  const myActiveListings = useMemo(() => myListings.filter(l => l.seller?.username === currentUser?.user?.username && l.is_active), [myListings, currentUser]);
  const mySoldListings = useMemo(() => myListings.filter(l => l.seller?.username === currentUser?.user?.username && !l.is_active), [myListings, currentUser]);

const [projectsPage, setProjectsPage] = useState(1);                                                                      
const [creditsPage, setCreditsPage] = useState(1);                                                                        
const itemsPerPage = 6;  


  // Pagination for projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (projectsPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, projectsPage, itemsPerPage]);

  // Pagination for credits
  const paginatedCredits = useMemo(() => {
    const startIndex = (creditsPage - 1) * itemsPerPage;
    let creditsToPaginate = [];
    switch (activeCreditFilter) {
      case 'MINTED':
        creditsToPaginate = mintedCredits;
        break;
      case 'LISTED':
        creditsToPaginate = myActiveListings;
        break;
      case 'SOLD':
        creditsToPaginate = mySoldListings.map(l => l.credit);
        break;
    }
    return creditsToPaginate.slice(startIndex, startIndex + itemsPerPage);
  }, [activeCreditFilter, creditsPage, itemsPerPage, mintedCredits, myActiveListings, mySoldListings]);

  const totalProjectPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const totalCreditPages = Math.ceil(
    (activeCreditFilter === 'MINTED' ? mintedCredits.length :
    activeCreditFilter === 'LISTED' ? myActiveListings.length :
    mySoldListings.length) / itemsPerPage
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !accountId) {
      toast.error('Connectez votre wallet pour soumettre un projet');
      return;
    }

    setIsSubmitting(true);
    setSubmissionStep(0);
    setErrorStep(null);

    try {
      let imageCid = '';
      if (imageFile) {
        setSubmissionStep(0);
        imageCid = await ipfsService.uploadFileToIpfs(imageFile);
      }

      let documentCid = '';
      if (documentFile) {
        setSubmissionStep(1);
        documentCid = await ipfsService.uploadFileToIpfs(documentFile);
      }

      setSubmissionStep(2);
      const projectMetadata = { name: formData.name, description: formData.description, location: formData.location, tonnage: parseInt(formData.tonnage), vintage: parseInt(formData.vintage), imageCid: imageCid, documentCid: documentCid };
      const metadataCid = await ipfsService.uploadJsonToIpfs(projectMetadata);

      setSubmissionStep(3);
      const fee = 10;
      
      if (!isConnected || !accountId) {
        throw new Error("Wallet session may have timed out during IPFS upload.");
      }

      const transactionId = await escrowService.submitProject(accountId, metadataCid, fee);
      
      setSubmissionStep(4);
      const projectData = { name: formData.name, description: formData.description, location: formData.location, tonnage: parseInt(formData.tonnage), vintage: parseInt(formData.vintage), projectId: transactionId, metadata_cid: metadataCid, image_cid: imageCid, document_cid: documentCid };
      await dispatch(addProject(projectData));

      setSubmissionStep(5);
      toast.success(`Projet soumis pour vérification !`);

      dispatch(getProjects());
      setFormData({ name: '', description: '', location: '', tonnage: '', vintage: '2024' });
      setImageFile(null);
      setDocumentFile(null);
      setIsDialogOpen(false);
    } catch (error: any) {
      setErrorStep(submissionStep);
      const errorMessage = error.message || "An unknown error occurred.";
      console.error("Error submitting project:", error);
      toast.error("Erreur lors de la soumission:", { description: errorMessage });
    } finally {
      setIsSubmitting(false);
    }
  };

  const openListingDialog = (credit: CarbonCredit) => {
    setSelectedCreditForListing(credit);
    setIsListingOpen(true);
    setListingPrice(''); // Reset price when opening dialog
    setIsListing(false); // Reset listing state
    setListingStep(0);
    setListingErrorStep(null);
  };

  const handleListCredit = async () => {
    if (!accountId) {
      toast.error("Veuillez connecter votre portefeuille.");
      return;
    }
    if (!selectedCreditForListing) {
      toast.error("Aucun crédit sélectionné pour la mise en vente.");
      return;
    }
    const parsedPrice = parseFloat(listingPrice);
    if (isNaN(parsedPrice) || parsedPrice <= 0) {
      toast.error("Prix invalide", { description: "Veuillez entrer un prix valide et supérieur à zéro." });
      return;
    }

    setIsListing(true);
    setListingStep(0);
    setListingErrorStep(null);

    try {
      setListingStep(0);
      await dispatch(listCredit({ creditId: selectedCreditForListing.id, serialNumber: selectedCreditForListing.serial_number, price: parsedPrice })).unwrap();
      
      setListingStep(1);
      setListingStep(2);
      setListingStep(3);
      toast.success("Crédit listé sur la marketplace avec succès !");

      dispatch(getCarbonCredits());
      dispatch(getMyListings());
      setIsListingOpen(false); // Close dialog on success

    } catch (error: any) {
      setListingErrorStep(listingStep);
      const errorMessage = error.message || "An unknown error occurred.";
      console.error("Error listing credit:", error);
      toast.error("Erreur lors de la mise en vente:", { description: errorMessage });
    } finally {
      setIsListing(false);
    }
  };

  const openClaimingDialog = (credit: CarbonCredit, listingId: number) => {
    setSelectedCreditForClaiming(credit);
    setIsClaimingOpen(true);
    setIsClaiming(false); // Reset claiming state
    setClaimStep(0);
    setClaimErrorStep(null);
  };

  const handleClaimProceeds = async () => {
    if (!accountId) {
      toast.error("Veuillez connecter votre portefeuille.");
      return;
    }
    if (!selectedCreditForClaiming) {
      toast.error("Aucun crédit sélectionné pour la réclamation.");
      return;
    }
    const currentListing = myListings.find(l => l.credit.id === selectedCreditForClaiming.id);
    if (!currentListing) {
      toast.error("Listing introuvable pour ce crédit.");
      return;
    }

    setIsClaiming(true);
    setClaimStep(0);
    setClaimErrorStep(null);

    try {
      setClaimStep(0);
      await dispatch(claimProceeds({ listingId: currentListing.id, serialNumber: selectedCreditForClaiming.serial_number })).unwrap();
      
      setClaimStep(1);
      setClaimStep(2);

      toast.success("Fonds réclamés avec succès !");
      dispatch(getMyListings());
      setIsClaimingOpen(false); // Close dialog on success

    } catch (error: any) {
      setClaimErrorStep(claimStep);
      const errorMessage = error.message || "An unknown error occurred.";
      console.error("Error claiming proceeds:", error);
      toast.error("Erreur lors de la réclamation des fonds:", { description: errorMessage });
    } finally {
      setIsClaiming(false);
    }
  };

  return (
    <div className="space-y-6">
      {!isConnected && <WalletAlert onConnect={connect} />}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-gray-900">Dashboard Vendeur</h1>
          <p className="text-gray-600">Gérez vos projets et crédits carbone</p>
        </div>
        <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => setIsDialogOpen(true)}>
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Projet
        </Button>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Soumettre un nouveau projet</DialogTitle>
            </DialogHeader>
            {isSubmitting ? (
              <SubmissionProgress currentStep={submissionStep} errorStep={errorStep} onClose={() => setIsDialogOpen(false)} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <Label htmlFor="name">Nom du projet</Label>
                  <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData.description, description: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="location">Localisation</Label>
                  <Input id="location" value={formData.location} onChange={(e) => setFormData({ ...formData, location: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="tonnage">Tonnage de CO2</Label>
                  <Input id="tonnage" type="number" value={formData.tonnage} onChange={(e) => setFormData({ ...formData, tonnage: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="vintage">Année de création (Vintage)</Label>
                  <Input id="vintage" type="number" value={formData.vintage} onChange={(e) => setFormData({ ...formData, vintage: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="image">Image du projet</Label>
                  <Input id="image" type="file" accept="image/*" onChange={(e) => setImageFile(e.target.files ? e.target.files[0] : null)} />
                </div>
                <div>
                  <Label htmlFor="document">Document du projet</Label>
                  <Input id="document" type="file" accept=".pdf,.doc,.docx" onChange={(e) => setDocumentFile(e.target.files ? e.target.files[0] : null)} />
                </div>
                <Button type="submit" className="w-full">Soumettre le projet</Button>
              </form>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isListingOpen} onOpenChange={setIsListingOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Mettre en vente le crédit #{selectedCreditForListing?.serial_number}</DialogTitle>
            </DialogHeader>
            {isListing ? (
              <ListingProgress currentStep={listingStep} errorStep={listingErrorStep} onClose={() => setIsListingOpen(false)} />
            ) : (
              <div className="space-y-4">
                {selectedCreditForListing && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h4 className="text-gray-900">Projet: {selectedCreditForListing.project.name}</h4>
                    <p className="text-sm text-gray-600">Tonnage: {selectedCreditForListing.project.tonnage.toLocaleString()} t</p>
                  </div>
                )}
                <div>
                  <Label htmlFor="price">Prix de vente (en HBAR)</Label>
                  <Input id="price" type="number" value={listingPrice} onChange={(e) => setListingPrice(e.target.value)} />
                </div>
                <Button onClick={handleListCredit} className="w-full">Confirmer la mise en vente</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>

        <Dialog open={isClaimingOpen} onOpenChange={setIsClaimingOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Réclamer les fonds pour le crédit #{selectedCreditForClaiming?.serial_number}</DialogTitle>
            </DialogHeader>
            {isClaiming ? (
              <ClaimProgress currentStep={claimStep} errorStep={claimErrorStep} onClose={() => setIsClaimingOpen(false)} />
            ) : (
              <div className="space-y-4">
                {selectedCreditForClaiming && (
                  <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                    <h4 className="text-gray-900">Projet: {selectedCreditForClaiming.project.name}</h4>
                    <p className="text-sm text-gray-600">Tonnage: {selectedCreditForClaiming.project.tonnage.toLocaleString()} t</p>
                  </div>
                )}
                <p>Voulez-vous vraiment réclamer les fonds pour cette vente ?</p>
                <Button onClick={handleClaimProceeds} className="w-full">Confirmer la réclamation</Button>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Section */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card 
          className={`p-6 cursor-pointer transition-all ${activeProjectFilter === 'PENDING' ? 'ring-2 ring-yellow-500' : 'hover:shadow-md'}`}
          onClick={() => setActiveProjectFilter('PENDING')}
        >
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Projets en Attente</p><p className="text-2xl text-gray-900">{pendingProjects.length}</p></div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center"><Clock className="w-6 h-6 text-yellow-600" /></div>
          </div>
        </Card>
        <Card 
          className={`p-6 cursor-pointer transition-all ${activeProjectFilter === 'APPROVED' ? 'ring-2 ring-emerald-500' : 'hover:shadow-md'}`}
          onClick={() => setActiveProjectFilter('APPROVED')}
        >
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Projets Approuvés</p><p className="text-2xl text-gray-900">{approvedProjects.length}</p></div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center"><Check className="w-6 h-6 text-emerald-600" /></div>
          </div>
        </Card>
        <Card 
          className={`p-6 cursor-pointer transition-all ${activeProjectFilter === 'REJECTED' ? 'ring-2 ring-red-500' : 'hover:shadow-md'}`}
          onClick={() => setActiveProjectFilter('REJECTED')}
        >
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Projets Rejetés</p><p className="text-2xl text-gray-900">{rejectedProjects.length}</p></div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center"><XCircle className="w-6 h-6 text-red-600" /></div>
          </div>
        </Card>
        <Card className="p-6 bg-gray-50">
          <div className="flex items-center justify-between">
            <div><p className="text-sm text-gray-500">Crédits en Vente</p><p className="text-2xl text-gray-900">{myActiveListings.length}</p></div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center"><ShoppingCart className="w-6 h-6 text-purple-600" /></div>
          </div>
        </Card>
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl text-gray-900">Mes Projets ({activeProjectFilter})</h2>
            <Button variant="ghost" onClick={() => setActiveProjectFilter('ALL')} className={activeProjectFilter === 'ALL' ? 'text-emerald-600 font-bold' : 'text-gray-500'}>Voir tout ({myProjects.length})</Button>
        </div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[300px]">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center p-12"><Loader2 className="w-8 h-8 animate-spin"/></div>
          ) : paginatedProjects.length === 0 ? (
            <div className="col-span-full text-center p-12"><p>Aucun projet dans cette catégorie.</p></div>
          ) : (
            paginatedProjects.map(project => (
              <ProjectCard key={project.id} project={project} />
            ))
          )}
        </div>
        {totalProjectPages > 1 && (
          <div className="flex justify-center items-center gap-4 mt-8">
            <Button onClick={() => setProjectsPage(p => Math.max(1, p - 1))} disabled={projectsPage === 1}>Précédent</Button>
            <span>Page {projectsPage} sur {totalProjectPages}</span>
            <Button onClick={() => setProjectsPage(p => Math.min(totalProjectPages, p + 1))} disabled={projectsPage === totalProjectPages}>Suivant</Button>
          </div>
        )}
      </div>

      {/* Carbon Credits Section */}
      <div className="space-y-4">
        <h2 className="text-2xl text-gray-900">Mes Crédits Carbone</h2>
        
        {/* Stats Cards / Filters for Credits */}
        <div className="grid md:grid-cols-3 gap-4">
          <Card 
            className={`p-6 cursor-pointer transition-all ${activeCreditFilter === 'MINTED' ? 'ring-2 ring-blue-500' : 'hover:shadow-md'}`}
            onClick={() => setActiveCreditFilter('MINTED')}
          >
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Crédits Disponibles</p><p className="text-2xl text-gray-900">{mintedCredits.length}</p></div>
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center"><Leaf className="w-6 h-6 text-blue-600" /></div>
            </div>
          </Card>
          <Card 
            className={`p-6 cursor-pointer transition-all ${activeCreditFilter === 'LISTED' ? 'ring-2 ring-yellow-500' : 'hover:shadow-md'}`}
            onClick={() => setActiveCreditFilter('LISTED')}
          >
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Crédits en Vente</p><p className="text-2xl text-gray-900">{myActiveListings.length}</p></div>
              <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center"><ShoppingCart className="w-6 h-6 text-yellow-600" /></div>
            </div>
          </Card>
          <Card 
            className={`p-6 cursor-pointer transition-all ${activeCreditFilter === 'SOLD' ? 'ring-2 ring-gray-500' : 'hover:shadow-md'}`}
            onClick={() => setActiveCreditFilter('SOLD')}
          >
            <div className="flex items-center justify-between">
              <div><p className="text-sm text-gray-500">Crédits Vendus</p><p className="text-2xl text-gray-900">{mySoldListings.length}</p></div>
              <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center"><Check className="w-6 h-6 text-gray-600" /></div>
            </div>
          </Card>
        </div>

        {/* Filtered Credits Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 min-h-[300px]">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center p-12"><Loader2 className="w-8 h-8 animate-spin"/></div>
          ) : (
            <>
              {activeCreditFilter === 'MINTED' && (paginatedCredits.length === 0 ? <p className="col-span-full text-center">Aucun crédit disponible.</p> : paginatedCredits.map(c => <CreditCard key={c.id} credit={c} onOpenListingDialog={openListingDialog} onOpenClaimingDialog={openClaimingDialog} />))}
              {activeCreditFilter === 'LISTED' && (paginatedCredits.length === 0 ? <p className="col-span-full text-center">Aucun crédit en vente.</p> : paginatedCredits.map(l => <ListingCard key={l.id} listing={l} />))}
              {activeCreditFilter === 'SOLD' && (mySoldListings.length === 0 ? <p className="col-span-full text-center">Aucun crédit vendu.</p> : mySoldListings.map(l => <CreditCard key={l.id} credit={l.credit} listingId={l.id} onOpenListingDialog={openListingDialog} onOpenClaimingDialog={openClaimingDialog} />))}
            </>
          )}
        </div>
        {totalCreditPages > 1 && (
            <div className="flex justify-center items-center gap-4 mt-8">
              <Button onClick={() => setCreditsPage(p => Math.max(1, p - 1))} disabled={creditsPage === 1}>Précédent</Button>
              <span>Page {creditsPage} sur {totalCreditPages}</span>
              <Button onClick={() => setCreditsPage(p => Math.min(totalCreditPages, p + 1))} disabled={creditsPage === totalCreditPages}>Suivant</Button>
            </div>
          )}
      </div>
    </div>
  );
}

const ProjectCard = React.memo(({ project }: { project: any }) => {
    const getStatusColor = (status: string) => {
        switch (status) {
        case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
        case 'PENDING': return 'bg-yellow-100 text-yellow-700';
        case 'REJECTED': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
            <div className="bg-gray-200 h-48 flex items-center justify-center">
                {project.image_cid ? (
                    <img 
                        src={`https://ipfs.io/ipfs/${project.image_cid}`}
                        alt={project.name} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-8xl">🌍</span>
                )}
            </div>
            <div className="p-6 space-y-4 flex flex-col flex-grow">
                <div>
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl text-gray-900 mb-2">{project.name}</h3>
                        <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                        {/* Assuming location is available, if not, this can be removed */}
                        {project.location}
                    </p>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-gray-200 mt-auto">
                    <div>
                        <p className="text-xs text-gray-500">Tonnage</p>
                        <p className="text-lg text-gray-900">{project.tonnage.toLocaleString()} t</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Vintage</p>
                        <p className="text-lg text-gray-900">{project.vintage}</p>
                    </div>
                </div>
            </div>
        </Card>
    );
});

const ListingCard = React.memo(({ listing }: { listing: Listing }) => {
    const handleWithdraw = () => {
        toast.info("La fonction de retrait n'est pas encore implémentée.");
    }

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
            <div className="bg-gray-200 h-48 flex items-center justify-center">
                {listing.credit.project.image_cid ? (
                    <img 
                        src={`https://ipfs.io/ipfs/${listing.credit.project.image_cid}`}
                        alt={listing.credit.project.name} 
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <span className="text-8xl">🌍</span>
                )}
            </div>
            <div className="p-6 space-y-4 flex flex-col flex-grow">
                <div>
                    <div className="flex items-start justify-between mb-2">
                        <h3 className="text-xl text-gray-900 mb-2">Crédit #{listing.credit.serial_number}</h3>
                        <Badge className='bg-yellow-100 text-yellow-700'>EN VENTE</Badge>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                        Projet: {listing.credit.project.name}
                    </p>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-gray-200">
                    <div>
                        <p className="text-xs text-gray-500">Prix</p>
                        <p className="text-lg text-gray-900">{listing.price} HBAR</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">Tonnage</p>
                        <p className="text-lg text-gray-900">{listing.credit.project.tonnage.toLocaleString()} t</p>
                    </div>
                </div>

                <div className="mt-auto flex justify-end gap-2">
                    <Button onClick={handleWithdraw} variant="outline">Retirer de la vente</Button>
                </div>
            </div>
        </Card>
    );
});

import { ListingProgress } from '../ListingProgress';
import { ClaimProgress } from '../ClaimProgress';

const CreditCard = React.memo(({ credit, listingId, onOpenListingDialog, onOpenClaimingDialog }: { credit: CarbonCredit, listingId?: number, onOpenListingDialog: (credit: CarbonCredit) => void, onOpenClaimingDialog: (credit: CarbonCredit, listingId: number) => void }) => {

    const dispatch = useDispatch<AppDispatch>();

    const { accountId } = useSelector(selectHashConnect);

    const { myListings } = useSelector((state: RootState) => state.carbon);



    const currentListing = myListings.find(l => l.id === listingId);

    const isClaimed = currentListing?.claimed || false;



    return (

        <>

            <Card className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col">

                <div className="bg-gray-200 h-48 flex items-center justify-center">

                    {credit.project.image_cid ? (

                        <img 

                            src={`https://ipfs.io/ipfs/${credit.project.image_cid}`}

                            alt={credit.project.name} 

                            className="w-full h-full object-cover"

                        />

                    ) : (

                        <span className="text-8xl">🌍</span>

                    )}

                </div>

                <div className="p-6 space-y-4 flex flex-col flex-grow">

                    <div>

                        <div className="flex items-start justify-between mb-2">

                            <h3 className="text-xl text-gray-900 mb-2">Crédit #{credit.serial_number}</h3>

                            <Badge className={

                                credit.status === 'MINTED' ? 'bg-blue-100 text-blue-700' :

                                credit.status === 'LISTED' ? 'bg-yellow-100 text-yellow-700' :

                                'bg-gray-100 text-gray-700'

                            }>{credit.status}</Badge>

                        </div>

                        <p className="text-sm text-gray-600 flex items-center gap-1">

                           Projet: {credit.project.name}

                        </p>

                    </div>



                    <div className="flex items-center justify-between py-3 border-y border-gray-200">

                        <div>

                            <p className="text-xs text-gray-500">Token ID</p>

                            <p className="text-sm font-mono">{credit.hedera_token_id}</p>

                        </div>

                        <div className="text-right">

                            <p className="text-xs text-gray-500">Tonnage</p>

                            <p className="text-lg text-gray-900">{credit.project.tonnage.toLocaleString()} t</p>

                        </div>

                    </div>



                    <div className="mt-auto flex justify-end gap-2">

                        {credit.status === 'MINTED' && (

                            <Button onClick={() => onOpenListingDialog(credit)} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">Mettre en vente</Button>

                        )}

                        {credit.status === 'SOLD' && (

                            <Button onClick={() => onOpenClaimingDialog(credit, listingId!)} disabled={isClaimed} className="w-full bg-emerald-600 hover:bg-emerald-700 text-white">

                                {isClaimed ? "Fonds récupérés" : "Réclamer les fonds"}

                            </Button>

                        )}

                    </div>

                </div>

            </Card>

        </>

    );

});