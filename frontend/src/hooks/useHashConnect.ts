import { useEffect, useCallback, useState } from 'react';
import { useDispatch } from 'react-redux';
import { getHashConnect, getInitPromise } from '../services/hashconnect';
import { setLoading, setConnected, setDisconnected } from '../store/hashconnectSlice';
import { HashConnect } from 'hashconnect';

export const useHashConnect = () => {
  const dispatch = useDispatch();
  const [hc, setHc] = useState<HashConnect | null>(null);

  useEffect(() => {
    const setup = async () => {
      try {
        const hcInstance = await getHashConnect();
        setHc(hcInstance);
        const initData = await getInitPromise();
        
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
      setup();
    }
  }, [dispatch]);

  const connect = useCallback(async () => {
    if (!hc) return;
    dispatch(setLoading(true));
    try {
      hc.openPairingModal();
    } catch (error) {
      console.error('Connection failed:', error);
    }
  }, [dispatch, hc]);

  const disconnect = useCallback(async () => {
    if (!hc) return;
    try {
      if (hc.hcData.topic) {
        hc.disconnect(hc.hcData.topic);
      }
    } catch(error) {
        console.error("Error disconnecting from wallet:", error);
    } finally {
        dispatch(setDisconnected());
    }
  }, [dispatch, hc]);

  return { connect, disconnect };
};