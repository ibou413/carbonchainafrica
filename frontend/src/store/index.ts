import { configureStore } from '@reduxjs/toolkit';
import userReducer from './userSlice';
import carbonReducer from './carbonSlice';
import hashconnectReducer from './hashconnectSlice';
import escrowReducer from './escrowSlice';

export const store = configureStore({
  reducer: {
    user: userReducer,
    carbon: carbonReducer,
    hashconnect: hashconnectReducer,
    escrow: escrowReducer,
  },
});

// Infer the `RootState` and `AppDispatch` types from the store itself
export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;
