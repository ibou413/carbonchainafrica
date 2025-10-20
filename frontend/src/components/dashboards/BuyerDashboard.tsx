import { useEffect } from 'react';
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

  const myCredits = carbonCredits.filter(
    (c) => c.owner?.username === currentUser?.user?.username
  );
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
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
            {myCredits.map((credit) => (
              <Card key={credit.id} className="p-6">
                <div className="space-y-3">
                  <div className="flex justify-between items-start">
                    <h3 className="text-gray-900">{credit.project.name}</h3>
                    <Badge className="bg-green-100 text-green-700">DÉTENU</Badge>
                  </div>
                  <p className="text-sm text-gray-600">{credit.project.location}</p>
                  <div className="text-xs text-gray-500 font-mono bg-gray-50 px-2 py-1 rounded">
                    #{credit.serial_number} • {credit.hedera_token_id}
                  </div>
                  <div className="pt-3 border-t border-gray-200">
                    <p className="text-sm text-gray-500">Acheté le</p>
                    <p className="text-sm text-gray-900">{new Date(credit.created_at).toLocaleDateString("fr-FR")}</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* ... (Impact Summary section as before) ... */}
    </div>
  );
}