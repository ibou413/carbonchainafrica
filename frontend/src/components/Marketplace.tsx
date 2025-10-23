import React, { useEffect, useMemo } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingBag, MapPin, TrendingUp, Filter, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { getActiveListings, buyCredit, Listing } from '../store/carbonSlice';
import { toast } from 'sonner';

export function Marketplace() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { listings, isLoading } = useSelector((state: RootState) => state.carbon);
  const dispatch = useDispatch<AppDispatch>();
  const router = useRouter();

  useEffect(() => {
    dispatch(getActiveListings());
  }, [dispatch]);

  const handleBuy = (listing: Listing) => {
    if (!currentUser) {
      toast.error("Veuillez vous connecter pour acheter un crédit.");
      router.push('/login');
      return;
    }
    
    toast.info("Achat en cours...", {
      description: "Veuillez approuver la transaction dans votre portefeuille.",
    });

    dispatch(buyCredit(listing));
  };

  // Calculate stats dynamically
  const stats = useMemo(() => {
    if (!listings || listings.length === 0) {
      return {
        activeProjects: 0,
        availableTons: 0,
        avgPrice: 0,
      };
    }

    const activeProjectIds = new Set(listings.map(l => l.credit.project.id));
    const availableTons = listings.reduce((sum, l) => sum + l.credit.project.tonnage, 0);
    const totalPrice = listings.reduce((sum, l) => sum + parseFloat(l.price), 0);
    const avgPrice = totalPrice / listings.length;

    return {
      activeProjects: activeProjectIds.size,
      availableTons,
      avgPrice,
    };
  }, [listings]);

  // Static for now, but count is dynamic
  const categories = [
    { name: "Tous", count: listings.length, active: true },
    { name: "Reforestation", count: 0 },
    { name: "Énergie Renouvelable", count: 0 },
    { name: "Agriculture Durable", count: 0 },
    { name: "Cuisinières Propres", count: 0 }
  ];

  return (
    <section id="marketplace" className="py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full mb-4">
            <ShoppingBag className="w-4 h-4" />
            <span className="text-sm">Marketplace</span>
          </div>
          <h2 className="text-4xl text-gray-900 mb-4">
            Crédits Carbone Disponibles
          </h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Parcourez notre sélection de crédits carbone vérifiés issus de projets africains
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-wrap items-center gap-3 mb-8">
          <Button variant="outline" size="sm">
            <Filter className="w-4 h-4 mr-2" />
            Filtres
          </Button>
          {categories.map((category, index) => (
            <Button
              key={index}
              variant={category.active ? "default" : "outline"}
              size="sm"
              className={category.active ? "bg-emerald-600 hover:bg-emerald-700 text-white" : ""}
            >
              {category.name} ({category.count})
            </Button>
          ))}
        </div>

        {/* Listings Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 min-h-[300px]">
          {isLoading ? (
            <div className="col-span-full flex justify-center items-center">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
            </div>
          ) : listings.length === 0 ? (
            <div className="col-span-full text-center text-gray-500">
              <p>Aucune annonce disponible pour le moment.</p>
            </div>
          ) : (
            listings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <div className="bg-gray-200 h-40 flex items-center justify-center">
                  {listing.credit.project.image_cid ? (
                    <img 
                      src={`https://ipfs.io/ipfs/${listing.credit.project.image_cid}`}
                      alt={listing.credit.project.name} 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <span className="text-6xl">🌍</span>
                  )}
                </div>

                <div className="p-4 space-y-3">
                  <div>
                    <Badge className="bg-emerald-100 text-emerald-700 mb-2">
                      ✓ Vérifié
                    </Badge>
                    <h3 className="text-lg text-gray-900">{listing.credit.project.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {listing.credit.project.location}
                    </p>
                  </div>

                  <div className="border-t border-gray-200 pt-3">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-gray-500">Prix</span>
                      <span className="text-lg text-gray-900">{listing.price} HBAR</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">Disponible</span>
                      <span className="text-sm text-gray-700">{listing.credit.project.tonnage.toLocaleString()} t</span>
                    </div>
                  </div>

                  <Button 
                    className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                    size="sm"
                    onClick={() => handleBuy(listing)}
                  >
                    <ShoppingBag className="w-4 h-4 mr-2" />
                    Acheter
                  </Button>
                </div>
              </Card>
            ))
          )}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-3xl">{stats.activeProjects}</span>
            </div>
            <p className="text-sm text-gray-600">Projets Actifs</p>
          </div>
          <div className="text-center border-x border-emerald-200">
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
              <span className="text-3xl">
                {stats.availableTons > 1000000 
                  ? `${(stats.availableTons / 1000000).toFixed(1)}M` 
                  : stats.availableTons.toLocaleString()}
              </span>
            </div>
            <p className="text-sm text-gray-600">Tonnes CO₂ Disponibles</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
              <span className="text-3xl">{stats.avgPrice.toFixed(2)} HBAR</span>
            </div>
            <p className="text-sm text-gray-600">Prix Moyen/tonne</p>
          </div>
        </div>
      </div>
    </section>
  );
}
