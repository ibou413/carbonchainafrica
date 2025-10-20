
import React, { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { HashConnect, HashConnectTypes } from 'hashconnect';
import { LedgerId } from '@hashgraph/sdk';

interface IHashConnectContext {
  hc: HashConnect | null;
  pairingData: HashConnectTypes.SavedPairingData | null;
  isConnected: boolean;
  accountId: string;
  connectToExtension: () => void;
  disconnect: () => void;
}

const HashConnectContext = createContext<IHashConnectContext | null>(null);

const appMetadata: HashConnectTypes.AppMetadata = {
  name: "CarbonChain Africa",
  description: "A dApp for carbon credits",
  icon: "https://www.hashpack.app/img/logo.svg",
};

// This will hold the singleton instance
let hashconnect: HashConnect;

export const HashConnectProvider = ({ children }: { children: ReactNode }) => {
  const [pairingData, setPairingData] = useState<HashConnectTypes.SavedPairingData | null>(null);
  const [accountId, setAccountId] = useState<string>('');

  // Initialize HashConnect only once
  useEffect(() => {
    if (!hashconnect) {
        console.log("⚡️ Initializing HashConnect...");
        hashconnect = new HashConnect(
            LedgerId.TESTNET,
            process.env.NEXT_PUBLIC_DAPP_ID!,
            appMetadata,
            true // Enable debug mode
        );

        // --- Event Listeners ---
        hashconnect.pairingEvent.on((newPairing) => {
            console.log("Pairing event:", newPairing);
            // This might contain multiple accounts, we'll use the first one
            setPairingData(newPairing);
            setAccountId(newPairing.accountIds[0]);
        });

        hashconnect.connectionStatusChangeEvent.on((status) => {
            console.log("HashConnect connection status change:", status);
            if (status === 'Disconnected') {
                setPairingData(null);
                setAccountId('');
            }
        });

        // --- Initialization ---
        const initialize = async () => {
            await hashconnect.init();
            const savedPairingData = hashconnect.getPairedAccounts();
            if (savedPairingData.length > 0) {
                console.log("Found existing pairing:", savedPairingData[0]);
                setPairingData(savedPairingData[0]);
                setAccountId(savedPairingData[0].accountIds[0]);
            }
        };

        initialize();
    }
  }, []);

  const connectToExtension = () => {
    if (hashconnect) {
        console.log("Opening HashConnect pairing modal...");
        hashconnect.connectToLocalWallet();
    }
  };

  const disconnect = () => {
    if (hashconnect && pairingData) {
        console.log("Disconnecting...");
        hashconnect.disconnect(pairingData.topic);
        setPairingData(null);
        setAccountId('');
    }
  }

  const value = {
    hc: hashconnect,
    pairingData,
    isConnected: !!pairingData && accountId !== '',
    accountId,
    connectToExtension,
    disconnect
  };

  return (
    <HashConnectContext.Provider value={value}>
      {children}
    </HashConnectContext.Provider>
  );
};

export const useHashConnect = () => {
  const context = useContext(HashConnectContext);
  if (!context) {
    throw new Error('useHashConnect must be used within a HashConnectProvider');
  }
  return context;
};
