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

  const [hbarToUsdRate, setHbarToUsdRate] = useState<number | null>(null);

  useEffect(() => {
    const fetchHbarPrice = async () => {
      try {
        const response = await fetch('https://api.coingecko.com/api/v3/simple/price?ids=hedera-hashgraph&vs_currencies=usd');
        const data = await response.json();
        setHbarToUsdRate(data['hedera-hashgraph'].usd);
      } catch (error) {
        console.error('Error fetching HBAR price:', error);
      }
    };

    fetchHbarPrice();
  }, []);

  useEffect(() => {
    if (currentUser) {
      dispatch(getCarbonCredits());
    }
  }, [dispatch, currentUser]);

  const [creditsPage, setCreditsPage] = useState(1);
  const itemsPerPage = 6;

  const myCredits = carbonCredits.filter(
    (c) => c.owner?.username === currentUser?.user?.username
  ).sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());

  // Pagination for credits
  const paginatedCredits = useMemo(() => {
    const startIndex = (creditsPage - 1) * itemsPerPage;
    return myCredits.slice(startIndex, startIndex + itemsPerPage);
  }, [myCredits, creditsPage, itemsPerPage]);

  const totalCreditPages = Math.ceil(myCredits.length / itemsPerPage);

  const totalTonnes = myCredits.reduce((sum, credit) => sum + credit.project.tonnage, 0);
  const totalSpent = 0; // This needs to be calculated from actual purchase price, which is not stored yet.

const [showFullDescription, setShowFullDescription] = useState(false);

  return (
    <div className="space-y-6">
      {!isConnected && <WalletAlert onConnect={connect} />}

      <div>
        <h1 className="text-3xl text-gray-900">Buyer Dashboard</h1>
        <p className="text-gray-600">Track your carbon credits and environmental impact</p>
      </div>

      {/* ... (Stats section as before, using myCredits) ... */}
      <div className="grid md:grid-cols-3 gap-4">
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Credits</p>
              <p className="text-2xl text-gray-900">{myCredits.length}</p>
            </div>
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <Leaf className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </Card>
        <Card className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500">Total Tonnes Offset</p>
              <p className="text-2xl text-gray-900">{totalTonnes.toLocaleString()}</p>
            </div>
            <div className="w-12 h-12 bg-emerald-100 rounded-lg flex items-center justify-center">
              <TrendingDown className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </Card>
      </div>

      <div className="space-y-4">
        <h2 className="text-2xl text-gray-900">My Portfolio</h2>
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
                              <h3 className="text-xl text-gray-900 mb-2">Credit #{credit.serial_number}</h3>
                              <Badge className="bg-emerald-100 text-emerald-700">OWNED</Badge>
                          </div>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                             Project: {credit.project.name}
                          </p>
                          <p className="text-sm text-gray-500 mt-2">
                              {showFullDescription ? credit.project.description : `${credit.project.description.substring(0, 100)}${credit.project.description.length > 100 ? '...' : ''}`}
                              {credit.project.description.length > 100 && (
                                  <Button variant="link" className="text-emerald-600" onClick={() => setShowFullDescription(!showFullDescription)}>
                                      {showFullDescription ? 'Read less' : 'Read more'}
                                  </Button>
                              )}
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
                        Acquired on {new Date(credit.created_at).toLocaleDateString("en-US")}
                      </div>
                  </div>
                </Card>
              ))}
            </div>
            {totalCreditPages > 1 && (
              <div className="flex justify-center items-center gap-4 mt-8">
                <Button onClick={() => setCreditsPage(p => Math.max(1, p - 1))} disabled={creditsPage === 1}>Previous</Button>
                <span>Page {creditsPage} of {totalCreditPages}</span>
                <Button onClick={() => setCreditsPage(p => Math.min(totalCreditPages, p + 1))} disabled={creditsPage === totalCreditPages}>Next</Button>
              </div>
            )}
          </>
        )}
      </div>

      {/* ... (Impact Summary section as before) ... */}
    </div>
  );
}