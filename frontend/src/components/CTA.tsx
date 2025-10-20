import { Button } from './ui/button';
import { ArrowRight, ShoppingBag } from 'lucide-react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useState } from 'react';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
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

export function CTA() {
  const router = useRouter();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const [dialogOpen, setDialogOpen] = useState(false);

  const handleStartNow = () => {
    if (currentUser) {
      router.push('/dashboard');
    } else {
      setDialogOpen(true);
    }
  };

  return (
    <>
      <section className="py-24 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center text-white">
          <h2 className="text-4xl lg:text-5xl mb-6">
            Prêt à Compenser votre Empreinte Carbone ?
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Rejoignez des centaines d'acheteurs et vendeurs sur la première marketplace décentralisée 
            de crédits carbone en Afrique.
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
            <Button 
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 text-lg px-8"
              onClick={handleStartNow}
            >
              <ShoppingBag className="w-5 h-5 mr-2" />
              Commencer Maintenant
            </Button>
            <Link href="/marketplace" passHref legacyBehavior>
              <Button 
                asChild
                size="lg"
                variant="outline"
                className="border-2 border-white text-white hover:bg-white/10 text-lg px-8"
              >
                  <a>
                      <ArrowRight className="w-5 h-5 mr-2" />
                      Explorer la Marketplace
                  </a>
              </Button>
            </Link>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div>
              <p className="text-3xl mb-1">45+</p>
              <p className="text-sm text-emerald-100">Projets Vérifiés</p>
            </div>
            <div>
              <p className="text-3xl mb-1">1.2M</p>
              <p className="text-sm text-emerald-100">Tonnes CO₂</p>
            </div>
            <div>
              <p className="text-3xl mb-1">3-5s</p>
              <p className="text-sm text-emerald-100">Transaction</p>
            </div>
            <div>
              <p className="text-3xl mb-1">100%</p>
              <p className="text-sm text-emerald-100">Sécurisé</p>
            </div>
          </div>
        </div>
      </section>

      <AlertDialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <AlertDialogContent className="bg-white">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-lg font-semibold text-gray-900">Avez-vous déjà un compte ?</AlertDialogTitle>
            <AlertDialogDescription className="text-base text-gray-600">
              Pour continuer, veuillez vous connecter ou créer un nouveau compte.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={() => router.push('/select-role')}>
              Non, créer un compte
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
