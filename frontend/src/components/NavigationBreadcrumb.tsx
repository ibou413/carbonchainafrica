import { Home, ChevronRight } from 'lucide-react';
import { useSelector } from 'react-redux';
import { RootState } from '../../store';
import Link from 'next/link';

export function NavigationBreadcrumb() {
  const { currentUser } = useSelector((state: RootState) => state.user);

  if (!currentUser || !currentUser.role) return null;

  const roleNames = {
    BUYER: 'Acheteur',
    SELLER: 'Vendeur',
    VERIFIER: 'Vérificateur',
    ADMIN: 'Administrateur'
  };

  return (
    <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
      <Link href="/" className="flex items-center gap-1 hover:text-emerald-600 transition-colors" legacyBehavior>
        <>
          <Home className="w-4 h-4" />
          <span>Accueil</span>
        </>
      </Link>
      <ChevronRight className="w-4 h-4" />
      <span className="text-gray-900">{roleNames[currentUser.role]}</span>
    </div>
  );
}
