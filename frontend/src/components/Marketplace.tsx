import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { ShoppingBag, MapPin, TrendingUp, Filter } from 'lucide-react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export function Marketplace() {
  const { currentUser } = useSelector((state: RootState) => state.user);
  const router = useRouter();

  const handleBuy = () => {
    if (currentUser) {
      router.push('/marketplace');
    } else {
      router.push('/login');
    }
  };

  const categories = [
    { name: "Tous", count: 45, active: true },
    { name: "Reforestation", count: 18 },
    { name: "Énergie Renouvelable", count: 12 },
    { name: "Agriculture Durable", count: 10 },
    { name: "Cuisinières Propres", count: 5 }
  ];

  const listings = [
    {
      id: 1,
      name: "Reforestation Congo Basin",
      location: "RDC, Équateur",
      price: 11.50,
      available: 25000,
      image: "🌲",
      category: "Reforestation",
      verified: true
    },
    {
      id: 2,
      name: "Parc Éolien Sahara",
      location: "Maroc, Laayoune",
      price: 13.20,
      available: 18000,
      image: "💨",
      category: "Énergie",
      verified: true
    },
    {
      id: 3,
      name: "Agriculture Régénérative",
      location: "Côte d'Ivoire, Bouaké",
      price: 9.80,
      available: 12000,
      image: "🌾",
      category: "Agriculture",
      verified: true
    },
    {
      id: 4,
      name: "Cuisinières Efficientes",
      location: "Éthiopie, Addis-Abeba",
      price: 8.50,
      available: 8000,
      image: "🔥",
      category: "Énergie",
      verified: true
    }
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
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {listings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-lg transition-shadow">
              {/* Image */}
              <div className="bg-gradient-to-br from-emerald-400 to-teal-400 h-40 flex items-center justify-center">
                <span className="text-6xl">{listing.image}</span>
              </div>

              {/* Content */}
              <div className="p-4 space-y-3">
                <div>
                  {listing.verified && (
                    <Badge className="bg-emerald-100 text-emerald-700 mb-2">
                      ✓ Vérifié
                    </Badge>
                  )}
                  <h3 className="text-lg text-gray-900">{listing.name}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-3 h-3" />
                    {listing.location}
                  </p>
                </div>

                <div className="border-t border-gray-200 pt-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-500">Prix/tonne</span>
                    <span className="text-lg text-gray-900">${listing.price}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-gray-500">Disponible</span>
                    <span className="text-sm text-gray-700">{listing.available.toLocaleString()} t</span>
                  </div>
                </div>

                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  size="sm"
                  onClick={handleBuy}
                >
                  <ShoppingBag className="w-4 h-4 mr-2" />
                  Acheter
                </Button>
              </div>
            </Card>
          ))}
        </div>

        {/* Stats Bar */}
        <div className="grid grid-cols-3 gap-6 bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-8">
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
              <TrendingUp className="w-5 h-5" />
              <span className="text-3xl">45</span>
            </div>
            <p className="text-sm text-gray-600">Projets Actifs</p>
          </div>
          <div className="text-center border-x border-emerald-200">
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
              <span className="text-3xl">1.2M</span>
            </div>
            <p className="text-sm text-gray-600">Tonnes CO₂ Disponibles</p>
          </div>
          <div className="text-center">
            <div className="flex items-center justify-center gap-2 text-emerald-600 mb-2">
              <span className="text-3xl">$10.5</span>
            </div>
            <p className="text-sm text-gray-600">Prix Moyen/tonne</p>
          </div>
        </div>
      </div>
    </section>
  );
}
