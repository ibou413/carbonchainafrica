import { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getVerifierDashboardProjects } from '../../store/carbonSlice';
import { approveProject, rejectProject } from '../../store/escrowSlice';

import { Button } from '../ui/button';
import { Card } from '../ui/card';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '../ui/dialog';
import { Textarea } from '../ui/textarea';
import { Label } from '../ui/label';
import { WalletAlert } from '../WalletAlert';
import { CheckCircle, XCircle, TrendingUp, Calendar, MapPin, Clock, FileText } from 'lucide-react';
import { toast } from 'sonner';



export function VerifierDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { projects } = useSelector((state: RootState) => state.carbon);

  console.log("Verifier Dashboard - Projects from store:", projects);
  console.log("Verifier Dashboard - Current user from store:", currentUser);

  useEffect(() => {
    if (currentUser) {
      dispatch(getVerifierDashboardProjects())
        .unwrap()
        .then(payload => console.log('getVerifierDashboardProjects fulfilled payload:', payload))
        .catch(error => console.error('getVerifierDashboardProjects rejected error:', error));
    }
  }, [dispatch, currentUser]);

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [notes, setNotes] = useState('');

  const pendingProjects = projects.filter(p => p.status === 'PENDING');
  const projectsHandledByVerifier = projects.filter(p => p.verifier?.username === currentUser?.user?.username);
  const approvedProjects = projectsHandledByVerifier.filter(p => p.status === 'APPROVED');
  const rejectedProjects = projectsHandledByVerifier.filter(p => p.status === 'REJECTED');

  console.log("Verifier Dashboard - Pending projects:", pendingProjects);
  console.log("Verifier Dashboard - Projects handled by verifier:", projectsHandledByVerifier);

  const handleVerify = async () => {
    console.log("handleVerify function called.");

    if (!selectedProject) {
      console.error("Verification stopped: No project selected.");
      return;
    }
    console.log("Selected project for verification:", selectedProject);

    const token = currentUser?.access;
    if (!token) {
      console.error("Verification stopped: User token not found.");
      toast.error("Session invalide. Veuillez vous reconnecter.");
      return;
    }
    console.log("User token found.");

    const dbProjectId = selectedProject.id;
    const submitTxId = selectedProject.projectId;
    if (!submitTxId) {
        console.error(`Verification stopped: Project ID (Transaction ID) is missing for project:`, selectedProject);
        toast.error("L'ID de transaction de la soumission est introuvable pour ce projet.");
        return;
    }
    console.log(`Found DB Project ID: ${dbProjectId} and Transaction ID: ${submitTxId} for action: ${action}`);

    try {
      if (action === 'approve') {
        console.log("Dispatching approveProject...");
        await dispatch(approveProject({ dbProjectId, submitTransactionId: submitTxId, token })).unwrap();
      } else {
        console.log("Dispatching rejectProject...");
        await dispatch(rejectProject({ dbProjectId, submitTransactionId: submitTxId, token })).unwrap();
      }

      console.log("Verification action dispatched successfully.");
      setDialogOpen(false);
      setSelectedProject(null);
      setNotes('');
      dispatch(getVerifierDashboardProjects());

    } catch (error: any) {
      console.error("Verification error during dispatch:", error);
    }
  };

  const openDialog = (project: any, actionType: 'approve' | 'reject') => {
    setSelectedProject(project);
    setAction(actionType);
    setDialogOpen(true);
  };

  if (!currentUser) {
    return (
      <div className="text-center">
        <p>Veuillez vous connecter pour accéder à votre tableau de bord.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Header */}
      <div>
        <h1 className="text-3xl text-gray-900">Dashboard Vérificateur</h1>
        <p className="text-gray-600">Vérifiez et certifiez les projets carbone</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">En Attente</p>
              <p className="text-2xl text-gray-900">{pendingProjects.length}</p>
            </div>
            <div className="w-12 h-12 bg-yellow-100 rounded-lg flex items-center justify-center">
              <Clock className="w-6 h-6 text-yellow-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Approuvés</p>
              <p className="text-2xl text-gray-900">{approvedProjects.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Rejetés</p>
              <p className="text-2xl text-gray-900">{rejectedProjects.length}</p>
            </div>
            <div className="w-12 h-12 bg-red-100 rounded-lg flex items-center justify-center">
              <XCircle className="w-6 h-6 text-red-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Tonnage Approuvé</p>
              <p className="text-2xl text-gray-900">
                {approvedProjects.reduce((sum, p) => sum + p.tonnage, 0).toLocaleString()}
              </p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Pending Projects */}
      <div className="space-y-4">
        <h2 className="text-2xl text-gray-900">Projets en Attente de Vérification</h2>
        {pendingProjects.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">Aucun projet en attente de vérification</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {pendingProjects.map(project => (
              <Card key={project.id} className="p-6">
              {project.image_cid && (
                <img 
                  src={`https://ipfs.io/ipfs/${project.image_cid}`}
                  alt={project.name} 
                  className="w-full h-48 object-cover rounded-md mb-4"
                />
              )}
              <div className="flex flex-col lg:flex-row gap-6">
                <div className="flex-1 space-y-4">
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <h3 className="text-gray-900">{project.name}</h3>
                      <p className="text-gray-600 mt-1">{project.description}</p>
                    </div>
                    <Badge className="bg-yellow-100 text-yellow-700">PENDING</Badge>
                  </div>
                  
                  <div className="flex flex-wrap gap-4 text-sm text-gray-600">
                    <div className="flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {project.location}
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="w-4 h-4" />
                      {project.tonnage.toLocaleString()} tonnes CO₂
                    </div>
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Vintage {project.vintage}
                    </div>
                    {project.document_cid && (
                        <a 
                            href={`https://ipfs.io/ipfs/${project.document_cid}`}
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-blue-600 hover:underline"
                        >
                            <FileText className="w-4 h-4" />
                            Voir Document
                        </a>
                    )}
                  </div>

                  <div className="text-sm text-gray-500">
                    Soumis par: <span className="text-gray-700">{project.owner.username}</span>
                    <span className="mx-2">•</span>
                    {new Date(project.created_at).toLocaleDateString('fr-FR')}
                  </div>
                </div>

                <div className="lg:w-48 flex flex-col gap-2">
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => openDialog(project, 'approve')}
                    disabled={!currentUser}
                  >
                    <CheckCircle className="w-4 h-4 mr-2" />
                    Approuver
                  </Button>
                  <Button 
                    variant="outline" 
                    className="border-red-600 text-red-600 hover:bg-red-50"
                    onClick={() => openDialog(project, 'reject')}
                    disabled={!currentUser}
                  >
                    <XCircle className="w-4 h-4 mr-2" />
                    Rejeter
                  </Button>
                </div>
              </div>
            </Card>
          ))}
          </div>
        )}
      </div>

      {/* Verification Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {action === 'approve' ? 'Approuver' : 'Rejeter'} le Projet
            </DialogTitle>
            <DialogDescription>
              Vérifiez les détails du projet ci-dessous et confirmez votre décision. Des notes optionnelles peuvent être ajoutées.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            {selectedProject && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                <h4 className="text-gray-900">{selectedProject.name}</h4>
                <p className="text-sm text-gray-600">{selectedProject.location}</p>
                <p className="text-sm text-gray-600">
                  {selectedProject.tonnage.toLocaleString()} tonnes CO₂
                </p>
              </div>
            )}
            <div>
              <Label htmlFor="notes">Notes de Vérification (Optionnel)</Label>
              <Textarea
                id="notes"
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ajoutez vos commentaires..."
                rows={4}
              />
            </div>
            <div className="flex justify-end gap-2">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>
                Annuler
              </Button>
              <Button 
                className={
                  action === 'approve' 
                    ? 'bg-emerald-600 hover:bg-emerald-700 text-white'
                    : 'bg-red-600 hover:bg-red-700 text-white'
                }
                onClick={handleVerify}
              >
                {action === 'approve' ? 'Approuver' : 'Rejeter'}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}