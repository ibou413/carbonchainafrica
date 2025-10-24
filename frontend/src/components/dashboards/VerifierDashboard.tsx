import { useEffect, useState, useMemo } from 'react';
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
import { CheckCircle, XCircle, TrendingUp, Calendar, MapPin, Clock, FileText, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { VerificationProgress } from '../VerificationProgress';

export function VerifierDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { projects, isLoading } = useSelector((state: RootState) => state.carbon);

  const [activeFilter, setActiveFilter] = useState<'PENDING' | 'APPROVED' | 'REJECTED'>('PENDING');

  useEffect(() => {
    if (currentUser) {
      dispatch(getVerifierDashboardProjects());
    }
  }, [dispatch, currentUser]);

  const [selectedProject, setSelectedProject] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [action, setAction] = useState<'approve' | 'reject'>('approve');
  const [projectsPage, setProjectsPage] = useState(1);
  const itemsPerPage = 6;

  const pendingProjects = useMemo(() => projects.filter(p => p.status === 'PENDING'), [projects]);
  const projectsHandledByVerifier = useMemo(() => projects.filter(p => p.verifier?.username === currentUser?.user?.username), [projects, currentUser]);
  const approvedProjects = useMemo(() => projectsHandledByVerifier.filter(p => p.status === 'APPROVED'), [projectsHandledByVerifier]);
  const rejectedProjects = useMemo(() => projectsHandledByVerifier.filter(p => p.status === 'REJECTED'), [projectsHandledByVerifier]);

  const filteredProjects = useMemo(() => {
    switch (activeFilter) {
      case 'APPROVED':
        return approvedProjects;
      case 'REJECTED':
        return rejectedProjects;
      case 'PENDING':
      default:
        return pendingProjects;
    }
  }, [activeFilter, pendingProjects, approvedProjects, rejectedProjects]);

  // Pagination for projects
  const paginatedProjects = useMemo(() => {
    const startIndex = (projectsPage - 1) * itemsPerPage;
    return filteredProjects.slice(startIndex, startIndex + itemsPerPage);
  }, [filteredProjects, projectsPage, itemsPerPage]);

  const totalProjectPages = Math.ceil(filteredProjects.length / itemsPerPage);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStep, setVerificationStep] = useState(0);
  const [errorStep, setErrorStep] = useState<number | null>(null);
  const [notes, setNotes] = useState('');

  const handleVerify = async () => {
    if (!selectedProject) return;
    const token = currentUser?.access;
    if (!token) {
      toast.error("Session invalide. Veuillez vous reconnecter.");
      return;
    }
    const dbProjectId = selectedProject.id;
    const submitTxId = selectedProject.projectId;
    if (!submitTxId) {
        toast.error("L'ID de transaction de la soumission est introuvable pour ce projet.");
        return;
    }

    setIsVerifying(true);
    setVerificationStep(0);
    setErrorStep(null);

    try {
      if (action === 'approve') {
        setVerificationStep(0);
        await dispatch(approveProject({ dbProjectId, submitTransactionId: submitTxId, token })).unwrap();
      } else {
        setVerificationStep(0);
        await dispatch(rejectProject({ dbProjectId, submitTransactionId: submitTxId, token })).unwrap();
      }

      setVerificationStep(1);
      // The slice already shows toasts, so we just need to update the step
      setVerificationStep(2);

      toast.success(`Projet ${action === 'approve' ? 'approuvé' : 'rejeté'} avec succès !`);
      setSelectedProject(null);
      setNotes('');
      dispatch(getVerifierDashboardProjects());
      setDialogOpen(false);
    } catch (error: any) {
      setErrorStep(verificationStep);
      console.error("Verification error during dispatch:", error);
    } finally {
      setIsVerifying(false);
    }
  };

  const openDialog = (project: any, actionType: 'approve' | 'reject') => {
    setSelectedProject(project);
    setAction(actionType);
    setDialogOpen(true);
    setIsVerifying(false);
    setVerificationStep(0);
    setErrorStep(null);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl text-gray-900">Dashboard Vérificateur</h1>
        <p className="text-gray-600">Vérifiez et certifiez les projets carbone</p>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-4 gap-4">
        <Card 
          className={`p-6 cursor-pointer transition-all ${activeFilter === 'PENDING' ? 'ring-2 ring-yellow-500' : 'hover:shadow-md'}`}
          onClick={() => setActiveFilter('PENDING')}
        >
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
        <Card 
          className={`p-6 cursor-pointer transition-all ${activeFilter === 'APPROVED' ? 'ring-2 ring-emerald-500' : 'hover:shadow-md'}`}
          onClick={() => setActiveFilter('APPROVED')}
        >
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
        <Card 
          className={`p-6 cursor-pointer transition-all ${activeFilter === 'REJECTED' ? 'ring-2 ring-red-500' : 'hover:shadow-md'}`}
          onClick={() => setActiveFilter('REJECTED')}
        >
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
        <Card className="p-6 bg-gray-50">
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

      <div className="space-y-4">
        <h2 className="text-2xl text-gray-900">Projets - {activeFilter}</h2>
        {isLoading ? (
            <div className="col-span-full flex justify-center items-center p-12">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
            </div>
        ) : filteredProjects.length === 0 ? (
          <Card className="p-12 text-center">
            <p className="text-gray-600">Aucun projet dans cette catégorie.</p>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {paginatedProjects.map(project => (
              <Card key={project.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
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
                            <Badge className={
                                project.status === 'APPROVED' ? 'bg-emerald-100 text-emerald-700' :
                                project.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700' :
                                'bg-red-100 text-red-700'
                            }>{project.status}</Badge>
                        </div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <MapPin className="w-4 h-4" /> {project.location}
                        </p>
                    </div>

                    <div className="flex items-center justify-between py-3 border-y border-gray-200">
                        <div>
                            <p className="text-xs text-gray-500">Tonnage</p>
                            <p className="text-lg text-gray-900">{project.tonnage.toLocaleString()} t</p>
                        </div>
                        <div className="text-right">
                            <p className="text-xs text-gray-500">Vintage</p>
                            <p className="text-lg text-gray-900">{project.vintage}</p>
                        </div>
                    </div>
                    
                    <div className="text-xs text-gray-500">
                      Soumis par: <span className="font-medium text-gray-700">{project.owner.username}</span>
                    </div>

                    {project.status === 'PENDING' && (
                        <div className="mt-auto flex flex-col gap-2">
                            <Button 
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                                onClick={() => openDialog(project, 'approve')}
                            >
                                <CheckCircle className="w-4 h-4 mr-2" />
                                Approuver
                            </Button>
                            <Button 
                                variant="outline" 
                                className="w-full border-red-600 text-red-600 hover:bg-red-50"
                                onClick={() => openDialog(project, 'reject')}
                            >
                                <XCircle className="w-4 h-4 mr-2" />
                                Rejeter
                            </Button>
                        </div>
                    )}
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
      {totalProjectPages > 1 && (
        <div className="flex justify-center items-center gap-4 mt-8">
          <Button onClick={() => setProjectsPage(p => Math.max(1, p - 1))} disabled={projectsPage === 1}>Précédent</Button>
          <span>Page {projectsPage} sur {totalProjectPages}</span>
          <Button onClick={() => setProjectsPage(p => Math.min(totalProjectPages, p + 1))} disabled={projectsPage === totalProjectPages}>Suivant</Button>
        </div>
      )}

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
          {isVerifying ? (
            <VerificationProgress currentStep={verificationStep} errorStep={errorStep} onClose={() => setDialogOpen(false)} />
          ) : (
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
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}