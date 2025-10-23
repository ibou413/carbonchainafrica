import { ReactNode } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useRouter } from 'next/router';
import { RootState, AppDispatch } from '../../store';
import { logout } from '../store/userSlice';
import { selectHashConnect } from '../store/hashconnectSlice';
import { useHashConnect } from '../hooks/useHashConnect';
import { Button } from './ui/button';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from './ui/dropdown-menu';
import { Leaf, Home, ShoppingCart, LogOut, Wallet, CheckCircle, User, LayoutDashboard } from 'lucide-react';
import { WelcomeTooltip } from './WelcomeTooltip';
import { NavigationBreadcrumb } from './NavigationBreadcrumb';
import Link from 'next/link';

interface DashboardLayoutProps {
  children: ReactNode;
}

export function DashboardLayout({ children }: DashboardLayoutProps) {
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();
  
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { isConnected, accountId, isLoading } = useSelector(selectHashConnect);

  const { connect, disconnect } = useHashConnect();

  const handleLogout = () => {
    dispatch(logout());
    disconnect();
    router.push('/');
  };

  const handleHomeClick = () => {
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <WelcomeTooltip />
      
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center gap-3">
                <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all group" title="Cliquez pour retourner à l'accueil">
                    <div className="w-10 h-10 bg-emerald-500 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                      <Leaf className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <span className="text-xl text-gray-900 group-hover:text-emerald-600 transition-colors">CarbonChain Africa</span>

                    </div>
                </Link>
            </div>

                        <div className="flex items-center gap-3">

                                        {currentUser?.user?.profile?.role !== 'VERIFIER' && (

                                                          <>

                                                            <Button

                                                              size="sm"

                                                              onClick={() => router.push('/dashboard')}

                                                              variant={router.pathname === '/dashboard' ? 'default' : 'outline'}

                                                              className={router.pathname === '/dashboard' 

                                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 

                                                                : 'text-gray-600 hover:text-emerald-600'}

                                                              title="Aller au tableau de bord"

                                                            >

                                                              <LayoutDashboard className="w-4 h-4 sm:mr-2" />

                                                              <span className="hidden sm:inline">Tableau de bord</span>

                                                            </Button>

                                                            <Button

                                                              size="sm"

                                                              onClick={() => router.push('/marketplace')}

                                                              variant={router.pathname === '/marketplace' ? 'default' : 'outline'}

                                                              className={router.pathname === '/marketplace' 

                                                                ? 'bg-emerald-600 hover:bg-emerald-700 text-white' 

                                                                : 'text-gray-600 hover:text-emerald-600'}

                                                              title="Aller à la Marketplace"

                                                            >

                                                              <ShoppingCart className="w-4 h-4 sm:mr-2" />

                                                              <span className="hidden sm:inline">Marketplace</span>

                                                            </Button>

                                                          </>

                                        )}

            

                          {isConnected ? (

                            <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-50 border border-emerald-200 rounded-lg">

                              <CheckCircle className="w-4 h-4 text-emerald-600" />

                              <span className="text-sm text-emerald-700 font-mono">

                                {accountId.substring(0, 12)}...

                              </span>

                              <button

                                onClick={disconnect}

                                className="ml-1 text-emerald-600 hover:text-emerald-800"

                                title="Déconnecter wallet"

                              >

                                ×

                              </button>

                            </div>

                          ) : (

                            currentUser?.user?.profile?.role !== 'VERIFIER' && (

                              <Button

                                variant="outline"

                                size="sm"

                                onClick={connect}

                                disabled={isLoading}

                                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"

                              >

                                <Wallet className="w-4 h-4 mr-2" />

                                {isLoading ? 'Connexion...' : 'Connecter Wallet'}

                              </Button>

                            )

                          )}

                          

                          <DropdownMenu>

                            <DropdownMenuTrigger asChild>

                              <Button variant="outline" size="icon" className="rounded-full">

                                <User className="w-4 h-4" />

                              </Button>

                            </DropdownMenuTrigger>

                            <DropdownMenuContent align="end">

                              <DropdownMenuLabel>{currentUser?.user?.username}</DropdownMenuLabel>

                              <DropdownMenuSeparator />

                              <DropdownMenuItem onClick={handleLogout}>

                                <LogOut className="w-4 h-4 mr-2" />

                                <span>Déconnexion</span>

                              </DropdownMenuItem>

                            </DropdownMenuContent>

                          </DropdownMenu>

                        </div>
          </div>
        </div>
      </nav>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 min-h-[calc(100vh-16rem)]">
        <NavigationBreadcrumb />
        {children}
      </div>

      <footer className="bg-white border-t border-gray-200 mt-auto">
        {/* Footer content */}
      </footer>
    </div>
  );
}