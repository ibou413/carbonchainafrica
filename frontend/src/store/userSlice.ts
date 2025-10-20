import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import authService from '../services/authService';
import type { RootState } from './index';

// --- TYPES ---
export type UserRole = 'BUYER' | 'SELLER' | 'VERIFIER' | 'ADMIN' | null;

interface UserProfile {
  role: UserRole;
  hedera_account_id?: string;
}

interface User {
  id: number;
  username: string;
  email: string;
  profile: UserProfile;
  access?: string;
  refresh?: string;
}

interface UserState {
  currentUser: User | null;
  isError: boolean;
  isSuccess: boolean;
  isLoading: boolean;
  message: string;
}

// --- INITIAL STATE ---
const storedUser: User | null = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('user') || 'null') : null;

const initialState: UserState = {
  currentUser: storedUser,
  isError: false,
  isSuccess: false,
  isLoading: false,
  message: '',
};


// --- ASYNC THUNKS (for Auth) ---
export const register = createAsyncThunk('user/register', async (userData: any, thunkAPI) => {
  try {
    const response = await authService.register(userData);
    return response.data;
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const login = createAsyncThunk('user/login', async (userData: any, thunkAPI) => {
  try {
    const response = await authService.login(userData);
    return response.data;
  } catch (error: any) {
    const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
    return thunkAPI.rejectWithValue(message);
  }
});

export const logout = createAsyncThunk('user/logout', async () => {
  await authService.logout();
});


// --- SLICE DEFINITION ---
const userSlice = createSlice({
  name: 'user',
  initialState,
  reducers: {
    // Auth state reset
    reset: (state) => {
      state.isLoading = false;
      state.isSuccess = false;
      state.isError = false;
      state.message = '';
    },
    // Reducer to update hedera account ID on the user object
    // This can be dispatched from the hashconnect logic later
    setHederaAccountId: (state, action: PayloadAction<string>) => {
        if (state.currentUser) {
            state.currentUser.profile.hedera_account_id = action.payload;
            localStorage.setItem('user', JSON.stringify(state.currentUser));
        }
    },
    clearHederaAccountId: (state) => {
        if (state.currentUser) {
            state.currentUser.profile.hedera_account_id = undefined;
            localStorage.setItem('user', JSON.stringify(state.currentUser));
        }
    }
  },
  extraReducers: (builder) => {
    builder
      // Register
      .addCase(register.pending, (state) => { state.isLoading = true; })
      .addCase(register.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentUser = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(register.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.currentUser = null;
        localStorage.removeItem('user');
      })
      // Login
      .addCase(login.pending, (state) => { state.isLoading = true; })
      .addCase(login.fulfilled, (state, action: PayloadAction<User>) => {
        state.isLoading = false;
        state.isSuccess = true;
        state.currentUser = action.payload;
        localStorage.setItem('user', JSON.stringify(action.payload));
      })
      .addCase(login.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
        state.currentUser = null;
        localStorage.removeItem('user');
      })
      // Logout
      .addCase(logout.fulfilled, (state) => {
        state.currentUser = null;
        localStorage.removeItem('user');
      });
  },
});

// --- EXPORTS ---
export const { 
  reset,
  setHederaAccountId,
  clearHederaAccountId
} = userSlice.actions;

export const selectCurrentUser = (state: RootState) => state.user.currentUser;

export default userSlice.reducer;