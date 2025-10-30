import { Alert, AlertDescription, AlertTitle } from './ui/alert';
import { Wallet, TriangleAlert } from 'lucide-react';
import { Button } from './ui/button';
import { useSelector } from 'react-redux';
import { selectHashConnect } from '../store/hashconnectSlice';

interface WalletAlertProps {
  onConnect: () => void;
}

export function WalletAlert({ onConnect }: WalletAlertProps) {
  const { error } = useSelector(selectHashConnect);

  if (error) {
    return (
      <Alert className="border-red-400 bg-red-50">
        <TriangleAlert className="h-4 w-4 text-red-600" />
        <AlertTitle className="text-red-900">Connection Error</AlertTitle>
        <AlertDescription className="text-red-700">
          <p className="mb-3">
            {error}
          </p>
          <Button
            size="sm"
            onClick={onConnect}
            className="bg-red-600 hover:bg-red-700 text-white"
          >
            <Wallet className="w-4 h-4 mr-2" />
            Try Connecting Again
          </Button>
        </AlertDescription>
      </Alert>
    );
  }

  return (
    <Alert className="border-emerald-200 bg-emerald-50">
      <Wallet className="h-4 w-4 text-emerald-600" />
      <AlertTitle className="text-emerald-900">Hedera Wallet Not Connected</AlertTitle>
      <AlertDescription className="text-emerald-700">
        <p className="mb-3">
          To perform transactions on the blockchain (minting, listing, buying), 
          you must connect your Hedera wallet.
        </p>
        <Button
          size="sm"
          onClick={onConnect}
          className="bg-emerald-600 hover:bg-emerald-700 text-white"
        >
          <Wallet className="w-4 h-4 mr-2" />
          Connect Now
        </Button>
      </AlertDescription>
    </Alert>
  );
}
