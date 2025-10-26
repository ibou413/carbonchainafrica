import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { HashConnectTypes } from 'hashconnect';
import { RootState } from './index';

interface HashConnectState {
  isLoading: boolean;
  isConnected: boolean;
  accountId: string;
  pairingData: HashConnectTypes.PairingData | null;
}

const initialState: HashConnectState = {
  isLoading: false,
  isConnected: false,
  accountId: '',
  pairingData: null,
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
    },
    setDisconnected: (state) => {
      state.isConnected = false;
      state.accountId = '';
      state.pairingData = null;
      state.isLoading = false;
    },
  },
});

export const { 
  setLoading, 
  setConnected, 
  setDisconnected, 
} = hashconnectSlice.actions;

export const selectHashConnect = (state: RootState) => state.hashconnect;

export default hashconnectSlice.reducer;