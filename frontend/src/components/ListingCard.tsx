import React from 'react';
import { Card } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { toast } from 'sonner';
import { Listing } from '../store/carbonSlice';

interface ListingCardProps {
  listing: Listing;
  hbarToUsdRate: number | null;
}

export const ListingCard = React.memo(({ listing, hbarToUsdRate }: ListingCardProps) => {
    const handleWithdraw = () => {
        toast.info("The withdrawal function is not yet implemented.");
    }

    const usdPrice = hbarToUsdRate ? (parseFloat(listing.price) * hbarToUsdRate).toFixed(2) : '...';

    return (
        <Card className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
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
                        <h3 className="text-xl text-gray-900 mb-2">Credit #{listing.credit.serial_number}</h3>
                        <Badge className='bg-yellow-100 text-yellow-700'>FOR SALE</Badge>
                    </div>
                    <p className="text-sm text-gray-600 flex items-center gap-1">
                        Project: {listing.credit.project.name}
                    </p>
                </div>

                <div className="flex items-center justify-between py-3 border-y border-gray-200">
                    <div>
                        <p className="text-xs text-gray-500">Price</p>
                        <p className="text-lg text-gray-900">{listing.price} HBAR</p>
                    </div>
                    <div className="text-right">
                        <p className="text-xs text-gray-500">USD Equivalent</p>
                        <p className="text-lg text-gray-900">${usdPrice}</p>
                    </div>
                </div>

                <div className="mt-auto flex justify-end gap-2">
                    <Button onClick={handleWithdraw} variant="outline">Withdraw from sale</Button>
                </div>
            </div>
        </Card>
    );
});
