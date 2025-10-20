import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, TrendingUp, Award } from 'lucide-react';
import { useRouter } from 'next/router';
import { useSelector } from 'react-redux';
import { RootState } from '../store';

export function FeaturedListings() {
  const router = useRouter();
  const { currentUser } = useSelector((state: RootState) => state.user);

  const handleBuyNow = () => {
    if (currentUser) {
      router.push('/marketplace'); // Or marketplace/id
    } else {
      router.push('/login');
    }
  };

  const featuredListings = [
    {
      id: 1,
      projectName: "Reforestation Massif Itombwe",
      location: "RDC, Sud-Kivu",
      tonnage: 15000,
      price: 12.50,
      priceChange: "+5.2%",
      vintage: 2024,
      certification: "VCS",
      image: "🌳"
    },
    {
      id: 2,
      projectName: "Cuisinières Écologiques Nairobi",
      location: "Kenya, Nairobi",
      tonnage: 4500,
      price: 10.80,
      priceChange: "+2.1%",
      vintage: 2024,
      certification: "Gold Standard",
      image: "🔥"
    },
    {
      id: 3,
      projectName: "Énergie Solaire Sahel",
      location: "Mali, Bamako",
      tonnage: 8200,
      price: 11.20,
      priceChange: "+3.8%",
      vintage: 2024,
      certification: "VCS",
      image: "☀️"
    }
  ];

  return (
    <section className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Meilleures Offres</span>
          </div>
          <h2 className="text-4xl text-gray-900 mb-4">Crédits Carbone en Vedette</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Découvrez les projets les plus populaires sur notre marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8">
          {featuredListings.map((listing) => (
            <Card key={listing.id} className="overflow-hidden hover:shadow-xl transition-shadow">
              {/* Image/Icon Section */}
              <div className="bg-gradient-to-br from-emerald-500 to-teal-500 h-48 flex items-center justify-center">
                <span className="text-8xl">{listing.image}</span>
              </div>

              <div className="p-6 space-y-4">
                {/* Header */}
                <div>
                  <div className="flex items-start justify-between mb-2">
                    <Badge className="bg-emerald-100 text-emerald-700">
                      <Award className="w-3 h-3 mr-1" />
                      {listing.certification}
                    </Badge>
                    <Badge variant="outline" className="border-emerald-600 text-emerald-600">
                      Vintage {listing.vintage}
                    </Badge>
                  </div>
                  <h3 className="text-xl text-gray-900 mb-2">{listing.projectName}</h3>
                  <p className="text-sm text-gray-600 flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {listing.location}
                  </p>
                </div>

                {/* Stats */}
                <div className="flex items-center justify-between py-3 border-y border-gray-200">
                  <div>
                    <p className="text-xs text-gray-500">Tonnage Disponible</p>
                    <p className="text-lg text-gray-900">{listing.tonnage.toLocaleString()} t</p>
                  </div>
                  <div className="text-right">
                    <p className="text-xs text-gray-500">Prix/tonne</p>
                    <div className="flex items-center gap-2">
                      <p className="text-lg text-gray-900">${listing.price}</p>
                      <span className="text-xs text-emerald-600">{listing.priceChange}</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Button 
                  className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                  onClick={handleBuyNow}
                >
                  Acheter Maintenant
                </Button>
              </div>
            </Card>
          ))}
        </div>

        <div className="text-center">
            <Button
                size="lg"
                variant="outline"
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                onClick={() => router.push('/marketplace')}
            >
                Voir Toute la Marketplace
            </Button>
        </div>
      </div>
    </section>
  );
}
