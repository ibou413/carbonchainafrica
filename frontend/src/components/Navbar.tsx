import { useState, useEffect } from 'react';
import { Button } from './ui/button';
import { Leaf, Menu, X, Shield, Home, User } from 'lucide-react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { logout } from '../store/userSlice';
import Link from 'next/link';
import { useRouter } from 'next/router';

export function Navbar() {
  const [isOpen, setIsOpen] = useState(false);
  const [isMounted, setIsMounted] = useState(false);
  const { currentUser } = useSelector((state: RootState) => state.user);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    setIsMounted(true);
  }, []);

  const navLinks = [
    { name: 'Marketplace', href: '/marketplace' },
    { name: 'How it works', href: '/#how-it-works' },
    { name: 'Featured Credits', href: '/#featured' }
  ];

  const handleLogin = () => {
    router.push('/login');
    setIsOpen(false);
  }

  const handleLogout = () => {
    dispatch(logout());
    router.push('/');
    setIsOpen(false);
  };

  const visibleNavLinks = isMounted && currentUser 
    ? navLinks.filter(link => link.name === 'Marketplace') 
    : navLinks;

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-200">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-all group" title="Click to go home">
            <img src="/images/Logo.png" alt="CarbonChain Africa Logo" className="h-36" />
          </Link>
          {/* Desktop Navigation */}
          <div className="flex-1 flex items-center justify-center">
            <div className="hidden lg:flex items-center gap-8">
              {visibleNavLinks.map((link) => {
                if (link.name === 'Marketplace') {
                  return (
                    <Button asChild key={link.name} className="bg-emerald-600 hover:bg-emerald-700 text-white">
                      <Link href={link.href}>{link.name}</Link>
                    </Button>
                  );
                }
                return (
                  <Link key={link.name} href={link.href} className="text-gray-600 hover:text-emerald-600 transition-colors">
                    {link.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Desktop CTA */}
          <div className="hidden lg:flex items-center gap-4">
            {isMounted && (
              currentUser ? (
                <>
                  <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => router.push('/dashboard')}>
                    Dashboard
                  </Button>
                  <Button 
                    variant="outline"
                    className="border-red-500 text-red-500 hover:bg-red-50"
                    onClick={handleLogout}
                  >
                    Logout
                  </Button>
                </>
              ) : (
                <>
                  <Button 
                    variant="outline" 
                    className="border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                    onClick={handleLogin}
                  >
                    Login
                  </Button>
                  <Button 
                    className="bg-emerald-600 hover:bg-emerald-700 text-white"
                    onClick={() => router.push('/select-role')}
                  >
                    Sign Up
                  </Button>
                </>
              )
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="lg:hidden p-2 text-gray-600 hover:text-emerald-600"
            onClick={() => setIsOpen(!isOpen)}
          >
            {isOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isOpen && (
          <div className="lg:hidden py-4 border-t border-gray-200">
            <div className="flex flex-col space-y-4">
              {visibleNavLinks.map((link) => {
                if (link.name === 'Marketplace') {
                  return (
                    <Button asChild key={link.name} className="bg-emerald-600 hover:bg-emerald-700 text-white w-full" onClick={() => setIsOpen(false)}>
                      <Link href={link.href}>{link.name}</Link>
                    </Button>
                  );
                }
                return (
                  <Link key={link.name} href={link.href} className="text-gray-600 hover:text-emerald-600 transition-colors" onClick={() => setIsOpen(false)}>
                    {link.name}
                  </Link>
                );
              })}
              <div className="flex flex-col gap-2 pt-4 border-t border-gray-200">
                {isMounted && (
                  currentUser ? (
                    <>
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                        onClick={() => { router.push('/dashboard'); setIsOpen(false); }}
                      >
                        Dashboard
                      </Button>
                      <Button 
                        variant="outline"
                        className="border-red-500 text-red-500 hover:bg-red-50 w-full"
                        onClick={handleLogout}
                      >
                        Logout
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button 
                        variant="outline" 
                        className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 w-full"
                        onClick={handleLogin}
                      >
                        Login
                      </Button>
                      <Button 
                        className="bg-emerald-600 hover:bg-emerald-700 text-white w-full"
                        onClick={() => { router.push('/select-role'); setIsOpen(false); }}
                      >
                        Sign Up
                      </Button>
                    </>
                  )
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}