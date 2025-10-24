import { useEffect, useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { RootState, AppDispatch } from '../../store';
import { getCarbonCredits } from '../../store/carbonSlice';
import { Card } from "../ui/card";
import { Badge } from "../ui/badge";
import { WalletAlert } from "../WalletAlert";
import {
  Leaf,
  ShoppingCart,
  TrendingDown,
  DollarSign,
} from "lucide-react";

import { useHashConnect } from "../../hooks/useHashConnect";
import { Button } from '../ui/button';

export function BuyerDashboard() {
  const dispatch = useDispatch<AppDispatch>();
  const { currentUser } = useSelector((state: RootState) => state.user);
  const { carbonCredits } = useSelector((state: RootState) => state.carbon);
  const { isConnected } = useSelector((state: RootState) => state.hashconnect);
  const { connect } = useHashConnect();

  useEffect(() => {
    if (currentUser) {
      dispatch(getCarbonCredits());
    }
  }, [dispatch, currentUser]);

  const [creditsPage, setCreditsPage] = useState(1);
  const itemsPerPage = 6;

  const myCredits = carbonCredits.filter(
    (c) => c.owner?.username === currentUser?.user?.username
  );

  // Pagination for credits
  const paginatedCredits = useMemo(() => {
    const startIndex = (creditsPage - 1) * itemsPerPage;
    return myCredits.slice(startIndex, startIndex + itemsPerPage);
  }, [myCredits, creditsPage, itemsPerPage]);

  const totalCreditPages = Math.ceil(myCredits.length / itemsPerPage);

  const totalTonnes = myCredits.reduce((sum, credit) => sum + credit.project.tonnage, 0);
  const totalSpent = 0; // This needs to be calculated from actual purchase price, which is not stored yet.

  return (
    <div className="space-y-6">
      {!isConnected && <WalletAlert onConnect={connect} />}

      <div>
        <h1 className="text-3xl text-gray-900">Dashboard Acheteur</h1>
        <p className="text-gray-600">Suivez vos crédits carbone et votre impact environnemental</p>
      </div>

      {/* ... (Stats section as before, using myCredits) ... */}

      <div className="space-y-4">
        <h2 className="text-2xl text-gray-900">Mon Portfolio</h2>
        {myCredits.length === 0 ? (
          <Card className="p-12 text-center">
            {/* ... (empty state) ... */}
          </Card>
        ) : (
          <>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              {paginatedCredits.map((credit) => (
                <Card key={credit.id} className="overflow-hidden hover:shadow-xl transition-shadow flex flex-col">
                  <div className="bg-gray-200 h-48 flex items-center justify-center">
                      {credit.project.image_cid ? (
                          <img 
                              src={`https://ipfs.io/ipfs/${credit.project.image_cid}`}
                              alt={credit.project.name} 
                              className="w-full h-full object-cover"
                          />
                      ) : (
                          <span className="text-8xl">🌍</span>
                      )}
                  </div>
                  <div className="p-6 space-y-4 flex flex-col flex-grow">
                      <div>
                          <div className="flex items-start justify-between mb-2">
                              <h3 className="text-xl text-gray-900 mb-2">Crédit #{credit.serial_number}</h3>
                              <Badge className="bg-emerald-100 text-emerald-700">DÉTENU</Badge>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                             Projet: {credit.project.name}
                          </p>
                      </div>
  
                      <div className="flex items-center justify-between py-3 border-y border-gray-200">
                          <div>
                              <p className="text-xs text-gray-500">Token ID</p>
                              <p className="text-sm font-mono">{credit.hedera_token_id}</p>
                          </div>
                          <div className="text-right">
                              <p className="text-xs text-gray-500">Tonnage</p>
                              <p className="text-lg text-gray-900">{credit.project.tonnage.toLocaleString()} t</p>
                          </div>
                      </div>
  
                      <div className="mt-auto text-xs text-gray-500">
                        Acquis le {new Date(credit.created_at).toLocaleDateString("fr-FR")}
                      </div>
                  </div>
                </Card>
              ))}
            </div>
            {totalCreditPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button onClick={() => setCreditsPage(p => Math.max(1, p - 1))} disabled={creditsPage === 1}>Précédent</Button>
                <span>Page {creditsPage} sur {totalCreditPages}</span>
                <Button onClick={() => setCreditsPage(p => Math.min(totalCreditPages, p + 1))} disabled={creditsPage === totalCreditPages}>Suivant</Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ... (Impact Summary section as before) ... */}
    </div>
  );
}