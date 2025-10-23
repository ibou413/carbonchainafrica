import React, { useEffect, useState } from 'react';
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
import { Plus, Leaf, Check } from 'lucide-react';
import { toast } from 'sonner';
import escrowService from '../../services/escrowService';
import { selectHashConnect } from '../../store/hashconnectSlice';
import { useHashConnect } from '../../hooks/useHashConnect';

export function SellerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { projects, carbonCredits, myListings, isLoading } = useSelector((state: RootState) => state.carbon);
  const { isConnected, accountId } = useSelector(selectHashConnect);
  const { connect } = useHashConnect();

  useEffect(() => {
    if (currentUser) {
        dispatch(getProjects());
        dispatch(getCarbonCredits()); // Still needed for the 'Disponibles' tab
        dispatch(getMyListings()).unwrap()
            .then(payload => console.log('### getMyListings fulfilled payload:', payload))
            .catch(error => console.error('### getMyListings rejected error:', error));
    }
  }, [dispatch, currentUser]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  // Data derived from state
  const myProjects = projects.filter(p => p.owner?.username === currentUser?.user?.username);
  const pendingProjects = myProjects.filter(p => p.status === 'PENDING');
  const approvedProjects = myProjects.filter(p => p.status === 'APPROVED');
  const rejectedProjects = myProjects.filter(p => p.status === 'REJECTED');

  const mintedCredits = carbonCredits.filter(c => c.status === 'MINTED');
  const myActiveListings = myListings.filter(l => l.is_active);
  const mySoldListings = myListings.filter(l => !l.is_active);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    tonnage: '',
    vintage: '2024',
  });
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [documentFile, setDocumentFile] = useState<File | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !accountId) {
      toast.error('Connectez votre wallet pour soumettre un projet');
      return;
    }

    try {
      toast.info("Veuillez approuver la transaction dans votre portefeuille...");

      let imageCid = '';
      if (imageFile) {
        toast.info("Téléchargement de l'image du projet sur IPFS...");
        imageCid = await ipfsService.uploadFileToIpfs(imageFile);
        toast.success(`Image du projet téléchargée sur IPFS: ${imageCid}`);
      }

      let documentCid = '';
      if (documentFile) {
        toast.info("Téléchargement du document du projet sur IPFS...");
        documentCid = await ipfsService.uploadFileToIpfs(documentFile);
        toast.success(`Document du projet téléchargé sur IPFS: ${documentCid}`);
      }

      // 1. Construct metadata JSON
      const projectMetadata = {
        name: formData.name,
        description: formData.description,
        location: formData.location,
        tonnage: parseInt(formData.tonnage),
        vintage: parseInt(formData.vintage),
        imageCid: imageCid, // Include image CID in metadata
        documentCid: documentCid, // Include document CID in metadata
      };

      // 2. Upload metadata JSON to IPFS
      toast.info("Téléchargement des métadonnées du projet sur IPFS...");
      const metadataCid = await ipfsService.uploadJsonToIpfs(projectMetadata);
      toast.success(`Métadonnées du projet téléchargées sur IPFS: ${metadataCid}`);

      const fee = 10; 
      const transactionId = await escrowService.submitProject(accountId, metadataCid, fee);
      toast.success("Transaction Hedera réussie !");

      const projectData = {
          name: formData.name,
          description: formData.description,
          location: formData.location,
          tonnage: parseInt(formData.tonnage),
          vintage: parseInt(formData.vintage),
          projectId: transactionId,
          metadata_cid: metadataCid, // Store the CID in your backend as well
          image_cid: imageCid, // Store image CID in backend
          document_cid: documentCid, // Store document CID in backend
      };

      await dispatch(addProject(projectData));
      toast.success(`Projet soumis pour vérification !`);
      setFormData({ name: '', description: '', location: '', tonnage: '', vintage: '2024' });
      setIsDialogOpen(false);

    } catch (error: any) {
      const errorMessage = error.message || "An unknown error occurred.";
      console.error("Error submitting project:", error);
      toast.error("Erreur lors de la soumission:", {
        description: errorMessage,
      });
    }
  };

  return (
    <div className="space-y-6">
      {!isConnected && (
        <WalletAlert onConnect={connect} />
      )}

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl text-gray-900">Dashboard Vendeur</h1>
          <p className="text-gray-600">Gérez vos projets et crédits carbone</p>
        </div>
        <Button 
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
          onClick={() => setIsDialogOpen(true)}
        >
          <Plus className="w-4 h-4 mr-2" />
          Nouveau Projet
        </Button>
        
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Soumettre un nouveau projet</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Nom du projet</Label>
                <Input id="name" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} required />
              </div>
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea id="description" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} required />
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
          </DialogContent>
        </Dialog>
      </div>

      {/* Projects Section */}
      <div className="space-y-4">
        <h2 className="text-2xl text-gray-900">Mes Projets</h2>
        <Tabs defaultValue="all" className="space-y-4">
            <TabsList>
            <TabsTrigger value="all">Tous ({myProjects.length})</TabsTrigger>
            <TabsTrigger value="pending">En Attente ({pendingProjects.length})</TabsTrigger>
            <TabsTrigger value="approved">Approuvés ({approvedProjects.length})</TabsTrigger>
            <TabsTrigger value="rejected">Rejetés ({rejectedProjects.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="all" key="all-projects-content" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
                <p>Chargement des projets...</p>
            ) : myProjects.length === 0 ? (
                <p>Aucun projet trouvé.</p>
            ) : (
                myProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))
            )}
            </TabsContent>
            <TabsContent value="pending" key="pending-projects-content" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
                <p>Chargement des projets en attente...</p>
            ) : pendingProjects.length === 0 ? (
                <p>Aucun projet en attente.</p>
            ) : (
                pendingProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))
            )}
            </TabsContent>
            <TabsContent value="approved" key="approved-projects-content" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
                <p>Chargement des projets approuvés...</p>
            ) : approvedProjects.length === 0 ? (
                <p>Aucun projet approuvé.</p>
            ) : (
                approvedProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))
            )}
            </TabsContent>
            <TabsContent value="rejected" key="rejected-projects-content" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {isLoading ? (
                <p>Chargement des projets rejetés...</p>
            ) : rejectedProjects.length === 0 ? (
                <p>Aucun projet rejeté.</p>
            ) : (
                rejectedProjects.map(project => (
                    <ProjectCard key={project.id} project={project} />
                ))
            )}
            </TabsContent>
        </Tabs>
      </div>

      {/* Carbon Credits Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl text-gray-900">Mes Crédits Carbone</h2>
        </div>
        <Tabs defaultValue="minted" className="space-y-4">
            <TabsList>
                <TabsTrigger value="minted">Disponibles ({mintedCredits.length})</TabsTrigger>
                <TabsTrigger value="listed">En Vente ({myActiveListings.length})</TabsTrigger>
                <TabsTrigger value="sold">Vendus ({mySoldListings.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="minted" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <p>Chargement des crédits disponibles...</p>
                ) : mintedCredits.length === 0 ? (
                    <p>Aucun crédit disponible.</p>
                ) : (
                    mintedCredits.map(credit => (
                        <CreditCard key={credit.id} credit={credit} />
                    ))
                )}
            </TabsContent>
            <TabsContent value="listed" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <p>Chargement des crédits en vente...</p>
                ) : myActiveListings.length === 0 ? (
                    <p>Aucun crédit en vente.</p>
                ) : (
                    myActiveListings.map(listing => (
                        <ListingCard key={listing.id} listing={listing} />
                    ))
                )}
            </TabsContent>
            <TabsContent value="sold" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {isLoading ? (
                    <p>Chargement des crédits vendus...</p>
                ) : mySoldListings.length === 0 ? (
                    <p>Aucun crédit vendu.</p>
                ) : (
                    mySoldListings.map(listing => (
                        <CreditCard key={listing.id} credit={listing.credit} listingId={listing.id} />
                    ))
                )}
            </TabsContent>
        </Tabs>
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
        <Card className="p-6 flex flex-col justify-between">
        {project.image_cid && (
            <img 
                src={`https://ipfs.io/ipfs/${project.image_cid}`}
                alt={project.name} 
                className="w-full h-48 object-cover rounded-md mb-4"
            />
        )}
        <div>
            <div className="flex justify-between items-start">
                <div>
                <h3 className="text-lg font-semibold">{project.name}</h3>
                <p className="text-sm text-gray-500">{project.location}</p>
                </div>
                <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
            </div>
            <div className="mt-4">
                <p>{project.description}</p>
            </div>
            <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                <div>
                    <p className="text-gray-500">Tonnage</p>
                    <p>{project.tonnage} tCO₂</p>
                </div>
                <div>
                    <p className="text-gray-500">Vintage</p>
                    <p>{project.vintage}</p>
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
        <Card className="p-6 flex flex-col justify-between bg-yellow-50 border-yellow-200">
            {listing.credit.project.image_cid && (
                <img 
                    src={`https://ipfs.io/ipfs/${listing.credit.project.image_cid}`}
                    alt={listing.credit.project.name} 
                    className="w-full h-48 object-cover rounded-md mb-4"
                />
            )}
            <div>
                <div className="flex justify-between items-start">
                    <h3 className="text-lg font-semibold text-gray-900">Crédit #{listing.credit.serial_number}</h3>
                    <Badge className='bg-yellow-100 text-yellow-700'>EN VENTE</Badge>
                </div>
                <p className="text-sm text-gray-500 mt-1">Projet: {listing.credit.project.name}</p>
            </div>
            <div className="mt-4">
                <p className="text-lg font-bold text-gray-900">{listing.price} HBAR</p>
            </div>
            <div className="mt-4 flex justify-end gap-2">
                <Button onClick={handleWithdraw} variant="outline">Retirer</Button>
            </div>
        </Card>
    );
});

const CreditCard = React.memo(({ credit, listingId }: { credit: CarbonCredit, listingId?: number }) => {
    const dispatch = useDispatch<AppDispatch>();
    const { accountId } = useSelector(selectHashConnect);
    const { myListings } = useSelector((state: RootState) => state.carbon); // Get myListings from Redux state
    const [isListingOpen, setIsListingOpen] = useState(false);
    const [price, setPrice] = useState('');

    // Find the current listing to check its claimed status
    const currentListing = myListings.find(l => l.id === listingId);
    const isClaimed = currentListing?.claimed || false;

    const handleListCredit = async () => {
        if (!accountId) {
            toast.error("Veuillez connecter votre portefeuille.");
            return;
        }

        const parsedPrice = parseFloat(price);
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            toast.error("Prix invalide", {
                description: "Veuillez entrer un prix valide et supérieur à zéro.",
            });
            return;
        }

        try {
            toast.info("Veuillez approuver les transactions dans votre portefeuille pour lister le crédit...");
            
            await dispatch(listCredit({
                creditId: credit.id,
                serialNumber: credit.serial_number,
                price: parsedPrice
            })).unwrap();

            toast.success("Crédit listé sur la marketplace avec succès !");
            setIsListingOpen(false);
        } catch (error: any) {
            const errorMessage = error.message || "An unknown error occurred.";
            console.error("Error listing credit:", error);
            toast.error("Erreur lors de la mise en vente:", {
                description: errorMessage,
            });
        }
    }

    const handleClaimProceeds = async () => {
        if (!listingId) {
            toast.error("Impossible de réclamer les fonds: ID de listing manquant.");
            return;
        }
        try {
            toast.info("Veuillez approuver la transaction dans votre portefeuille pour réclamer les fonds...");
            await dispatch(claimProceeds({ listingId, serialNumber: credit.serial_number })).unwrap();
            toast.success("Fonds réclamés avec succès !");
        } catch (error: any) {
            const errorMessage = error.message || "Une erreur inconnue est survenue.";
            console.error("Error claiming proceeds:", error);
            toast.error("Erreur lors de la réclamation des fonds:", {
                description: errorMessage,
            });
        }
    }

    return (
        <>
            <Card className="p-6 flex flex-col justify-between">
                {credit.project.image_cid && (
                    <img 
                        src={`https://ipfs.io/ipfs/${credit.project.image_cid}`}
                        alt={credit.project.name} 
                        className="w-full h-48 object-cover rounded-md mb-4"
                    />
                )}
                <div>
                    <div className="flex justify-between items-start">
                        <h3 className="text-lg font-semibold text-gray-900">Crédit #{credit.serial_number}</h3>
                        <Badge className={
                            credit.status === 'MINTED' ? 'bg-blue-100 text-blue-700' :
                            credit.status === 'LISTED' ? 'bg-yellow-100 text-yellow-700' :
                            'bg-gray-100 text-gray-700'
                        }>{credit.status}</Badge>
                    </div>
                    <p className="text-sm text-gray-500 mt-1">Projet: {credit.project.name}</p>
                </div>
                <div className="mt-4 grid grid-cols-2 gap-2 text-sm">
                    <div>
                        <p className="text-gray-500">Token ID</p>
                        <p className="font-mono text-xs">{credit.hedera_token_id}</p>
                    </div>
                    <div>
                        <p className="text-gray-500">Tonnage</p>
                        <p>{credit.project.tonnage} tCO₂</p>
                    </div>
                </div>
                <div className="mt-4 flex justify-end gap-2">
                    {credit.status === 'MINTED' && (
                        <Button onClick={() => setIsListingOpen(true)}>Mettre en vente</Button>
                    )}
                    {credit.status === 'SOLD' && (
                        <Button onClick={handleClaimProceeds} disabled={isClaimed}>
                            {isClaimed ? "Fonds récupérés" : "Réclamer les fonds"}
                        </Button>
                    )}
                </div>
            </Card>
            <Dialog open={isListingOpen} onOpenChange={setIsListingOpen}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Mettre en vente le crédit #{credit.serial_number}</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                        <div>
                            <Label htmlFor="price">Prix de vente (en HBAR)</Label>
                            <Input id="price" type="number" value={price} onChange={(e) => setPrice(e.target.value)} />
                        </div>
                        <Button onClick={handleListCredit} className="w-full">Confirmer la mise en vente</Button>
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
});