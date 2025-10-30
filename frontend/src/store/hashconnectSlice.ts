import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HashConnectTypes } from 'hashconnect';
import { RootState } from './index';

interface HashConnectState {
  isLoading: boolean;
  isConnected: boolean;
  accountId: string;
  pairingData: HashConnectTypes.PairingData | null;
  error: string | null;
}

const initialState: HashConnectState = {
  isLoading: false,
  isConnected: false,
  accountId: '',
  pairingData: null,
  error: null,
};

const hashconnectSlice = createSlice({
  name: 'hashconnect',
  initialState,
  reducers: {
    setLoading: (state, action: PayloadAction<boolean>) => {
      state.isLoading = action.payload;
    },
    setConnected: (state, action: PayloadAction<{ accountId: string; pairingData: HashConnectTypes.PairingData }>) => {
      state.isConnected = true;
      state.accountId = action.payload.accountId;
      state.pairingData = action.payload.pairingData;
      state.isLoading = false;
      state.error = null; // Clear any error on successful connection
    },
    setDisconnected: (state) => {
      state.isConnected = false;
      state.accountId = '';
      state.pairingData = null;
      state.isLoading = false;
      state.error = null; // Clear any error on disconnection
    },
    setError: (state, action: PayloadAction<string | null>) => {
      state.error = action.payload;
      state.isLoading = false; // Stop loading on error
    },
  },
});

export const { 
  setLoading, 
  setConnected, 
  setDisconnected, 
  setError,
} = hashconnectSlice.actions;

export const selectHashConnect = (state: RootState) => state.hashconnect;

export default hashconnectSlice.reducer;