import { useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { setCurrentUser, UserRole } from '../store/userSlice';
import { Button } from './ui/button';
import { Card } from './ui/card';
import { Leaf, ShoppingBag, ShieldCheck, User, Shield } from 'lucide-react';

export function RoleSelector() {
  const dispatch = useDispatch();
  const router = useRouter();

  const handleRoleSelection = (role: UserRole) => {
    if (role) {
        router.push(`/register?role=${role}`);
    }
  };

  const roles = [
    { role: 'BUYER' as UserRole, title: 'Buyer', description: 'Buy credits to offset', icon: ShoppingBag, color: 'blue' },
    { role: 'SELLER' as UserRole, title: 'Seller', description: 'Sell credits from your projects', icon: Leaf, color: 'emerald' },
    { role: 'VERIFIER' as UserRole, title: 'Verifier', description: 'Validate carbon projects', icon: ShieldCheck, color: 'yellow' },
    { role: 'ADMIN' as UserRole, title: 'Admin', description: 'Manage the platform', icon: Shield, color: 'purple' },
  ];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="max-w-5xl w-full text-center">
        <div className="w-20 h-20 bg-emerald-500 rounded-full flex items-center justify-center mx-auto mb-6">
            <User className="w-10 h-10 text-white" />
        </div>
        <h1 className="text-4xl text-gray-900 mb-4">Who are you?</h1>
        <p className="text-xl text-gray-600 mb-12">Select a role to access your dashboard.</p>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
          {roles.map(({ role, title, description, icon: Icon, color }) => (
            <Card key={role} className="p-8 text-center hover:shadow-xl hover:-translate-y-2 transition-all cursor-pointer border-2" onClick={() => handleRoleSelection(role)}>
              <div className={`w-16 h-16 bg-${color}-100 rounded-full flex items-center justify-center mx-auto mb-6`}>
                <Icon className={`w-8 h-8 text-${color}-600`} />
              </div>
              <h2 className="text-2xl text-gray-900 mb-2">{title}</h2>
              <p className="text-gray-600">{description}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
