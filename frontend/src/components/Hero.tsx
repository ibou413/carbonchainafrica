import { Button } from './ui/button';
import { ArrowRight, ShoppingBag, TrendingUp, Shield } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import { toast } from 'sonner';
import { useState } from 'react';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export function Hero() {
  const router = useRouter();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleStartSelling = () => {
    if (!currentUser) {
      setDialogOpen(true);
    } else if (currentUser.user.profile.role === 'SELLER') {
      router.push('/dashboard');
    } else {
      toast.info('Cette action est réservée aux vendeurs.', {
        description: 'Veuillez vous connecter avec un compte vendeur pour continuer.',
      });
    }
  };

  return (
    <>
      <section 
        className="relative pt-32 pb-20 overflow-hidden"
        style={{
          backgroundImage: `
            linear-gradient(to bottom right, rgba(236, 253, 245, 0.8), rgba(240, 253, 250, 0.8), rgba(239, 246, 255, 0.8)),
            url(https://images.unsplash.com/photo-1448375240586-882707db888b?q=80&w=1920)
          `,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Background Pattern */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 left-0 w-96 h-96 bg-emerald-500 rounded-full filter blur-3xl"></div>
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-blue-500 rounded-full filter blur-3xl"></div>
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-4xl mx-auto">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-white rounded-full shadow-sm mb-6">
              <ShoppingBag className="w-4 h-4 text-emerald-600" />
              <span className="text-sm text-gray-700">Marketplace de Crédits Carbone</span>
            </div>

            <h1 className="text-5xl lg:text-7xl text-gray-900 mb-6">
              Achetez & Vendez des{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-600">
                Crédits Carbone
              </span>
            </h1>

            <p className="text-xl text-gray-600 leading-relaxed mb-8 max-w-2xl mx-auto">
              La première marketplace décentralisée de crédits carbone en Afrique. 
              Compensez votre empreinte carbone ou monétisez vos projets verts.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Link href="/marketplace" passHref legacyBehavior>
                <Button 
                  asChild
                  size="lg"
                  className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white text-lg px-8"
                >
                  <a>
                    Explorer la Marketplace
                    <ArrowRight className="w-5 h-5 ml-2" />
                  </a>
                </Button>
              </Link>
              <Button 
                size="lg"
                variant="outline"
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50 text-lg px-8"
                onClick={handleStartSelling}
              >
                Commencer à Vendre
              </Button>
            </div>

            {/* Trust Indicators */}
            <div className="grid grid-cols-3 gap-8 max-w-3xl mx-auto">
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-3">
                  <Shield className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-900">Vérifié & Certifié</p>
                <p className="text-xs text-gray-500">Standards internationaux</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-3">
                  <TrendingUp className="w-8 h-8 text-emerald-600" />
                </div>
                <p className="text-sm text-gray-900">Prix Transparents</p>
                <p className="text-xs text-gray-500">Blockchain Hedera</p>
              </div>
              <div className="flex flex-col items-center">
                <div className="w-16 h-16 bg-white rounded-full shadow-md flex items-center justify-center mb-3">
                  <span className="text-2xl">⚡</span>
                </div>
                <p className="text-sm text-gray-900">Transactions Rapides</p>
                <p className="text-xs text-gray-500">Confirmation en 3-5s</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">Devenir un vendeur</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600">
              Avez-vous déjà un compte sur CarbonChain Africa ?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/register?role=SELLER')}>
              Non, créer un compte Vendeur
            </AlertDialogAction>
            <AlertDialogAction onClick={() => router.push('/login')}>
              Oui, se connecter
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}