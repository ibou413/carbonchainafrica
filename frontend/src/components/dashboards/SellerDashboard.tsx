import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getProjects, addProject, getCarbonCredits, listCredit, claimProceeds, CarbonCredit } from '../../store/carbonSlice';
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
import nftService from '../../services/nftService';
import { selectHashConnect } from '../../store/hashconnectSlice';

import { useHashConnect } from '../../hooks/useHashConnect';

export function SellerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { projects, carbonCredits } = useSelector((state: RootState) => state.carbon);
  const { isConnected, accountId } = useSelector(selectHashConnect);
  const { connect } = useHashConnect();

  console.log("--- SellerDashboard Rerender ---");
  console.log("Projects from store:", projects);
  console.log("Carbon credits from store:", carbonCredits);
  console.log("Current user from store:", currentUser);

  useEffect(() => {
    if (currentUser) {
        console.log("Dispatching getProjects and getCarbonCredits");
        dispatch(getProjects())
            .unwrap()
            .then(payload => console.log('getProjects fulfilled payload:', payload))
            .catch(error => console.error('getProjects rejected error:', error));
        dispatch(getCarbonCredits())
            .unwrap()
            .then(payload => console.log('getCarbonCredits fulfilled payload:', payload))
            .catch(error => console.error('getCarbonCredits rejected error:', error));
    }
  }, [dispatch, currentUser]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const myProjects = projects.filter(p => p.owner?.username === currentUser?.user?.username);
  const pendingProjects = myProjects.filter(p => p.status === 'PENDING');
  const approvedProjects = myProjects.filter(p => p.status === 'APPROVED');
  const rejectedProjects = myProjects.filter(p => p.status === 'REJECTED');

  const mintedCredits = carbonCredits.filter(c => c.status === 'MINTED');
  const listedCredits = carbonCredits.filter(c => c.status === 'LISTED');
  const soldCredits = carbonCredits.filter(c => c.status === 'SOLD');

  console.log("My projects after filter:", myProjects);
  console.log("Minted credits after filter:", mintedCredits);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    location: '',
    tonnage: '',
    vintage: '2024',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!isConnected || !accountId) {
      toast.error('Connectez votre wallet pour soumettre un projet');
      return;
    }

    try {
      toast.info("Veuillez approuver la transaction dans votre portefeuille...");
      
      // TODO: This is a temporary fix. In a real application, the full metadata object
      // should be uploaded to IPFS, and the resulting CID (hash) should be used here.
      // Using the full JSON string exceeds the 100-byte metadata limit for Hedera NFTs.
      const metadataCid = formData.name;

      const fee = 50; 

      const transactionId = await escrowService.submitProject(accountId, metadataCid, fee);
      toast.success("Transaction Hedera réussie !");

      const projectData = {
          name: formData.name,
          description: formData.description,
          location: formData.location,
          tonnage: parseInt(formData.tonnage),
          vintage: parseInt(formData.vintage),
          projectId: transactionId,
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

  const handleApproveMarketplace = async () => {
    if (!isConnected || !accountId) {
      toast.error('Connectez votre wallet pour approuver la marketplace');
      return;
    }
    try {
        toast.info("Veuillez approuver la transaction dans votre portefeuille...");
        await nftService.approveMarketplace(accountId);
        toast.success("Marketplace approuvée avec succès !");
    } catch (error: any) {
        const errorMessage = error.message || "An unknown error occurred.";
        console.error("Error approving marketplace:", error);
        toast.error("Erreur lors de l'approbation:", {
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
            <TabsContent value="all" className="space-y-4">
            {myProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
            </TabsContent>
            <TabsContent value="pending" className="space-y-4">
            {pendingProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
            </TabsContent>
            <TabsContent value="approved" className="space-y-4">
            {approvedProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
            </TabsContent>
            <TabsContent value="rejected" className="space-y-4">
            {rejectedProjects.map(project => (
                <ProjectCard key={project.id} project={project} />
            ))}
            </TabsContent>
        </Tabs>
      </div>

      {/* Carbon Credits Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl text-gray-900">Mes Crédits Carbone</h2>
            <Button onClick={handleApproveMarketplace} variant="outline">
                <Check className="w-4 h-4 mr-2" />
                Activer la Marketplace (action unique)
            </Button>
        </div>
        <Tabs defaultValue="minted" className="space-y-4">
            <TabsList>
                <TabsTrigger value="minted">Disponibles ({mintedCredits.length})</TabsTrigger>
                <TabsTrigger value="listed">En Vente ({listedCredits.length})</TabsTrigger>
                <TabsTrigger value="sold">Vendus ({soldCredits.length})</TabsTrigger>
            </TabsList>
            <TabsContent value="minted" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {mintedCredits.map(credit => (
                    <CreditCard key={credit.id} credit={credit} />
                ))}
            </TabsContent>
            <TabsContent value="listed" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {listedCredits.map(credit => (
                    <CreditCard key={credit.id} credit={credit} />
                ))}
            </TabsContent>
            <TabsContent value="sold" className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
                {soldCredits.map(credit => (
                    <CreditCard key={credit.id} credit={credit} />
                ))}
            </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

function ProjectCard({ project }: { project: any }) {
    const getStatusColor = (status: string) => {
        switch (status) {
        case 'APPROVED': return 'bg-emerald-100 text-emerald-700';
        case 'PENDING': return 'bg-yellow-100 text-yellow-700';
        case 'REJECTED': return 'bg-red-100 text-red-700';
        default: return 'bg-gray-100 text-gray-700';
        }
    };

    return (
        <Card className="p-6">
        <div className="flex justify-between">
            <div>
            <h3 className="text-lg font-semibold">{project.name}</h3>
            <p className="text-sm text-gray-500">{project.location}</p>
            </div>
            <Badge className={getStatusColor(project.status)}>{project.status}</Badge>
        </div>
        <div className="mt-4">
            <p>{project.description}</p>
        </div>
        </Card>
    );
}

function CreditCard({ credit }: { credit: CarbonCredit }) {
    const dispatch = useDispatch<AppDispatch>();
    const { accountId } = useSelector(selectHashConnect);
    const [isListingOpen, setIsListingOpen] = useState(false);
    const [price, setPrice] = useState('');

    const handleListCredit = async () => {
        if (!accountId) {
            toast.error("Veuillez connecter votre portefeuille.");
            return;
        }
        try {
            toast.info("Veuillez approuver les transactions dans votre portefeuille pour lister le crédit...");
            await nftService.listCreditOnChain(accountId, credit.serial_number, parseFloat(price));
            toast.success("Crédit listé sur la marketplace avec succès !");
            dispatch(listCredit({ credit: credit.id, price: parseFloat(price) }));
            setIsListingOpen(false);
        } catch (error: any) {
            const errorMessage = error.message || "An unknown error occurred.";
            console.error("Error listing credit:", error);
            toast.error("Erreur lors de la mise en vente:", {
                description: errorMessage,
            });
        }
    }

    const handleClaimProceeds = () => {
        toast.info("La réclamation des fonds n'est pas encore implémentée.");
    }

    return (
        <>
            <Card className="p-6 flex flex-col justify-between">
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
                        <Button onClick={handleClaimProceeds}>Réclamer les fonds</Button>
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
}