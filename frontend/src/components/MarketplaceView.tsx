import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../store';
import { getActiveListings, buyCredit, Listing } from '../store/carbonSlice';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";

export function MarketplaceView() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { listings } = useSelector((state: RootState) => state.carbon);

  useEffect(() => {
    dispatch(getActiveListings());
  }, [dispatch]);

  const handlePurchase = (listing: Listing) => {
    if (currentUser?.user.profile.role !== 'BUYER') {
      toast.error("Action Not Allowed", {
        description: "Only buyers can purchase carbon credits.",
      });
      return;
    }
    
    toast.info("Achat en cours...", {
      description: "Veuillez approuver la transaction dans votre portefeuille.",
    });

    dispatch(buyCredit(listing));
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {listings.map((listing) => (
        <Card key={listing.id}>
          <CardHeader>
            <CardTitle>{listing.credit.project.name}</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Tonnage: {listing.credit.project.tonnage} tons CO2</p>
            <p>Price: {listing.price} HBAR</p>
            <p>Seller: {listing.credit.owner.username}</p>
            <Button onClick={() => handlePurchase(listing)} className="mt-4">
              Purchase
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};