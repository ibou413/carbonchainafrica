import { useEffect, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getHashConnect } from '../services/hashconnect';
import { setLoading, setConnected, setDisconnected } from '../store/hashconnectSlice';
import { HashConnect } from 'hashconnect';

export const useHashConnect = () => {
  const dispatch = useDispatch();
  const [hc, setHc] = useState<HashConnect | null>(null);

  // useEffect to initialize and set up listeners once
  useEffect(() => {
    const setupHashConnect = async () => {
      try {
        const hcInstance = await getHashConnect();
        setHc(hcInstance);

        // Clear any old listeners before attaching new ones
        hcInstance.pairingEvent.off();
        hcInstance.connectionStatusChangeEvent.off();

        // Attach listeners
        hcInstance.pairingEvent.on(pairingData => {
          if (pairingData.accountIds.length > 0) {
            dispatch(setConnected({ 
              accountId: pairingData.accountIds[0],
              pairingData: pairingData 
            }));
          }
        });

        hcInstance.connectionStatusChangeEvent.on(status => {
          if (status === 'Disconnected') {
            dispatch(setDisconnected());
          }
        });

        // Initialize and check for saved pairings
        const initData = await hcInstance.init();
        if (initData && initData.savedPairings.length > 0) {
          const pairingData = initData.savedPairings[0];
          dispatch(setConnected({ 
            accountId: pairingData.accountIds[0], 
            pairingData: pairingData 
          }));
        }
      } catch (error) {
        console.error("Error initializing HashConnect:", error);
      }
    };

    if (typeof window !== 'undefined') {
      setupHashConnect();
    }

  }, [dispatch]);

  const connect = useCallback(() => {
    if (!hc) {
      console.error("HashConnect not initialized, cannot open pairing modal.");
      return;
    }
    dispatch(setLoading(true));
    hc.openPairingModal();
  }, [hc, dispatch]);

  const disconnect = useCallback(async () => {
    if (!hc) {
      dispatch(setDisconnected());
      return;
    }
    try {
      if (hc.hcData.topic) {
        await hc.disconnect(hc.hcData.topic);
      }
      hc.clearConnectionsAndData();
      // Force clear localStorage to prevent any stale data from persisting
      localStorage.removeItem('hashconnectData');
    } catch(error) {
        console.error("Error during full disconnect:", error);
    } finally {
        // Always update the state to disconnected
        dispatch(setDisconnected());
    }
  }, [dispatch, hc]);

  return { connect, disconnect };
};