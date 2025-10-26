import { useState } from 'react';
import { Card } from '../ui/card';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Label } from '../ui/label';
import { Badge } from '../ui/badge';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '../ui/dialog';
import { ShieldCheck, UserPlus, Trash2, Mail, Building, MapPin, CheckCircle } from 'lucide-react';
import { toast } from 'sonner';

// This component is now self-contained with mock data.
// In a real app, this data would come from and be managed by a Redux slice.

interface Verifier {
  id: number;
  email: string;
  name: string;
  organization: string;
  location: string;
  hederaAccountId?: string;
  isActive: boolean;
  addedAt: string;
}

export function AdminDashboard() {
  const [verifiers, setVerifiers] = useState<Verifier[]>([
    {
      id: 1,
      email: 'verified@carbon-standard.org',
      name: 'Dr. Jean Mukendi',
      organization: 'Verified Carbon Standard',
      location: 'RDC, Kinshasa',
      hederaAccountId: '0.0.123456',
      isActive: true,
      addedAt: '2024-01-10'
    },
    {
      id: 2,
      email: 'cert@goldstandard.org',
      name: 'Dr. Amina Diallo',
      organization: 'Gold Standard',
      location: 'Sénégal, Dakar',
      hederaAccountId: '0.0.789012',
      isActive: true,
      addedAt: '2024-02-15'
    }
  ]);

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    name: '',
    organization: '',
    location: ''
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newVerifier: Verifier = {
      id: verifiers.length + 1,
      ...formData,
      isActive: true,
      addedAt: new Date().toISOString().split('T')[0]
    };

    setVerifiers([...verifiers, newVerifier]);
    toast.success(`Verifier ${formData.name} added successfully!`);
    
    setFormData({ email: '', name: '', organization: '', location: '' });
    setIsDialogOpen(false);
  };

  const handleToggleStatus = (id: number) => {
    setVerifiers(verifiers.map(v => 
      v.id === id ? { ...v, isActive: !v.isActive } : v
    ));
    const verifier = verifiers.find(v => v.id === id);
    toast.info(`Verifier ${verifier?.name} ${verifier?.isActive ? 'disabled' : 'enabled'}`);
  };

  const handleDelete = (id: number) => {
    const verifier = verifiers.find(v => v.id === id);
    setVerifiers(verifiers.filter(v => v.id !== id));
    toast.error(`Verifier ${verifier?.name} deleted`);
  };

  const activeVerifiers = verifiers.filter(v => v.isActive);
  const inactiveVerifiers = verifiers.filter(v => !v.isActive);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-3xl text-gray-900 mb-2">Administration</h1>
          <p className="text-gray-600">Manage the platform's verifiers</p>
        </div>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-purple-600 hover:bg-purple-700 text-white">
              <UserPlus className="w-4 h-4 mr-2" />
              Add a Verifier
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add a New Verifier</DialogTitle>
              <DialogDescription>
                Add an accredited certification body to the platform
              </DialogDescription>
            </DialogHeader>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="Dr. John Doe"
                  required
                />
              </div>

              <div>
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="john@organization.org"
                  required
                />
              </div>

              <div>
                <Label htmlFor="organization">Organization</Label>
                <Input
                  id="organization"
                  value={formData.organization}
                  onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                  placeholder="Verified Carbon Standard"
                  required
                />
              </div>

              <div>
                <Label htmlFor="location">Location</Label>
                <Input
                  id="location"
                  value={formData.location}
                  onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                  placeholder="Kenya, Nairobi"
                  required
                />
              </div>

              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700 text-white">
                  Add Verifier
                </Button>
              </DialogFooter>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Active Verifiers</p>
              <p className="text-2xl text-gray-900">{activeVerifiers.length}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Verifiers</p>
              <p className="text-2xl text-gray-900">{verifiers.length}</p>
            </div>
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Disabled</p>
              <p className="text-2xl text-gray-900">{inactiveVerifiers.length}</p>
            </div>
            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center">
              <ShieldCheck className="w-6 h-6 text-gray-600" />
            </div>
          </div>
        </Card>
      </div>

      {/* Active Verifiers */}
      <div className="space-y-4">
        <h2 className="text-2xl text-gray-900">Active Verifiers</h2>
        <div className="grid gap-4">
          {activeVerifiers.map(verifier => (
            <Card key={verifier.id} className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex items-start gap-4 flex-1">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center flex-shrink-0">
                    <ShieldCheck className="w-6 h-6 text-purple-600" />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-gray-900">{verifier.name}</h3>
                      <Badge className="bg-emerald-100 text-emerald-700">ACTIVE</Badge>
                    </div>
                    
                    <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                      <p className="flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {verifier.email}
                      </p>
                      <p className="flex items-center gap-2">
                        <Building className="w-4 h-4" />
                        {verifier.organization}
                      </p>
                      <p className="flex items-center gap-2">
                        <MapPin className="w-4 h-4" />
                        {verifier.location}
                      </p>
                      {verifier.hederaAccountId && (
                        <p className="font-mono text-xs">
                          Hedera: {verifier.hederaAccountId}
                        </p>
                      )}
                    </div>
                    
                    <p className="text-xs text-gray-500 mt-3">
                      Added on {new Date(verifier.addedAt).toLocaleDateString('en-US')}
                    </p>
                  </div>
                </div>

                <div className="flex gap-2 ml-4">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleToggleStatus(verifier.id)}
                  >
                    Disable
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                    onClick={() => handleDelete(verifier.id)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>

      {/* Inactive Verifiers */}
      {inactiveVerifiers.length > 0 && (
        <div className="space-y-4">
          <h2 className="text-2xl text-gray-900">Disabled Verifiers</h2>
          <div className="grid gap-4">
            {inactiveVerifiers.map(verifier => (
              <Card key={verifier.id} className="p-6 bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-4 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex items-center justify-center flex-shrink-0">
                      <ShieldCheck className="w-6 h-6 text-gray-500" />
                    </div>
                    
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="text-gray-700">{verifier.name}</h3>
                        <Badge className="bg-gray-200 text-gray-700">INACTIVE</Badge>
                      </div>
                      
                      <div className="grid md:grid-cols-2 gap-3 text-sm text-gray-600">
                        <p className="flex items-center gap-2">
                          <Mail className="w-4 h-4" />
                          {verifier.email}
                        </p>
                        <p className="flex items-center gap-2">
                          <Building className="w-4 h-4" />
                          {verifier.organization}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-2 ml-4">
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50"
                      onClick={() => handleToggleStatus(verifier.id)}
                    >
                      Reactivate
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      onClick={() => handleDelete(verifier.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {verifiers.length === 0 && (
        <Card className="p-12 text-center">
          <ShieldCheck className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-gray-900 mb-2">No verifiers</h3>
          <p className="text-gray-600 mb-6">
            Start by adding your first accredited verifier
          </p>
          <Button 
            className="bg-purple-600 hover:bg-purple-700 text-white"
            onClick={() => setIsDialogOpen(true)}
          >
            <UserPlus className="w-4 h-4 mr-2" />
            Add a Verifier
          </Button>
        </Card>
      )}
    </div>
  );
}
