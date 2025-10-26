import React, { useEffect } from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { MapPin, TrendingUp, Award, Loader2 } from 'lucide-react';
import { useRouter } from 'next/router';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { getActiveListings } from '../store/carbonSlice';

export function FeaturedListings() {
  const router = useRouter();
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { listings, isLoading } = useSelector((state: RootState) => state.carbon);

  useEffect(() => {
    dispatch(getActiveListings());
  }, [dispatch]);

  const handleBuyNow = (listingId: number) => {
    if (currentUser) {
      router.push(`/marketplace?listing=${listingId}`);
    } else {
      router.push('/login');
    }
  };

  const featuredListings = listings.slice(0, 3);

  return (
    <section id="featured" className="py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-full mb-4">
            <TrendingUp className="w-4 h-4" />
            <span className="text-sm">Best Offers</span>
          </div>
          <h2 className="text-4xl text-gray-900 mb-4">Featured Carbon Credits</h2>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Discover the most popular projects on our marketplace
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 mb-8 min-h-[400px]">
          {isLoading ? (
            <div className="col-span-3 flex justify-center items-center">
              <Loader2 className="w-12 h-12 text-emerald-600 animate-spin" />
            </div>
          ) : featuredListings.length === 0 ? (
            <div className="col-span-3 text-center text-gray-500">
              <p>No featured listings at the moment.</p>
            </div>
          ) : (
            featuredListings.map((listing) => (
              <Card key={listing.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                <div className="bg-gray-200 h-48 flex items-center justify-center">
                  {listing.credit.project.image_cid ? (
                      <img 
                        src={`https://ipfs.io/ipfs/${listing.credit.project.image_cid}`}
                        alt={listing.credit.project.name} 
                        className="w-full h-full object-cover"
                      />
                  ) : (
                    <span className="text-8xl">🌍</span>
                  )}
                </div>

                <div className="p-6 space-y-4 flex flex-col flex-grow">
                  <div>
                    <div className="flex items-start justify-between mb-2">
                      <Badge className="bg-emerald-100 text-emerald-700">
                        <Award className="w-3 h-3 mr-1" />
                        {/* Assuming certification is part of project data - placeholder for now */}
                        VCS
                      </Badge>
                      <Badge variant="outline" className="border-emerald-600 text-emerald-600">
                        Vintage {listing.credit.project.vintage}
                      </Badge>
                    </div>
                    <h3 className="text-xl text-gray-900 mb-2">{listing.credit.project.name}</h3>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                      <MapPin className="w-4 h-4" />
                      {listing.credit.project.location}
                    </p>
                  </div>

                  <div className="flex items-center justify-between py-3 border-y border-gray-200">
                    <div>
                      <p className="text-xs text-gray-500">Available Tonnage</p>
                      <p className="text-lg text-gray-900">{listing.credit.project.tonnage.toLocaleString()} t</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gray-500">Price/ton</p>
                      <div className="flex items-center gap-2">
                        <p className="text-lg text-gray-900">{listing.price} HBAR</p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-auto">
                    <Button 
                      className="w-full bg-emerald-600 hover:bg-emerald-700 text-white"
                      onClick={() => handleBuyNow(listing.id)}
                    >
                      Buy Now
                    </Button>
                  </div>
                </div>
              </Card>
            ))
          )}
        </div>

        <div className="text-center">
            <Button
                size="lg"
                variant="outline"
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-50"
                onClick={() => router.push('/marketplace')}
            >
                See All Marketplace
            </Button>
        </div>
      </div>
    </section>
  );
}
