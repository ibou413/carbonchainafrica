import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Wallet } from 'lucide-react';
import { Button } from './ui/button';

interface WalletAlertProps {
  onConnect: () => void;
}

export function WalletAlert({ onConnect }: WalletAlertProps) {
  return (
    <Alert className="border-emerald-200 bg-emerald-50">
      <Wallet className="h-4 w-4 text-emerald-600" />
      <AlertTitle className="text-emerald-900">Wallet Hedera Non Connecté</AlertTitle>
      <AlertDescription className="text-emerald-700">
        <p className="mb-3">
          Pour effectuer des transactions sur la blockchain (minting, listing, achat), 
          vous devez connecter votre wallet Hedera.
        </p>
        <Button
          size="sm"
          onClick={onConnect}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connecter Maintenant
        </Button>
      </AlertDescription>
    </Alert>
  );
}
