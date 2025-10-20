import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import type { RootState } from './index';
import projectService from '../services/projectService';
import escrowService from '../services/escrowService';
import nftService from '../services/nftService';

// Types should ideally be in a separate types file
export type ProjectStatus = 'PENDING' | 'APPROVED' | 'REJECTED';
export type CreditStatus = 'MINTED' | 'LISTED' | 'SOLD';

export interface Project {
  id: number;
  name: string;
  description: string;
  location: string;
  tonnage: number;
  vintage: number;
  status: ProjectStatus;
  owner: any; 
  verifier?: any;
  projectId?: string;
  created_at: string;
}

export interface CarbonCredit {
  id: number;
  project: Project;
  owner: any;
  hedera_token_id: string;
  serial_number: number;
  status: CreditStatus;
  created_at: string;
}

export interface Listing {
    id: number;
    credit: CarbonCredit;
    price: string;
    is_active: boolean;
}

interface CarbonState {
  projects: Project[];
  carbonCredits: CarbonCredit[];
  listings: Listing[];
  isLoading: boolean;
  isError: boolean;
  message: string;
}

const initialState: CarbonState = {
  projects: [],
  carbonCredits: [],
  listings: [],
  isLoading: false,
  isError: false,
  message: '',
};

// ASYNC THUNKS
export const getProjects = createAsyncThunk(
  'carbon/getProjects',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.user.currentUser?.access;
      if (!token) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      return await projectService.getProjects(token);
    } catch (error: any) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getActiveListings = createAsyncThunk(
  'carbon/getActiveListings',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.user.currentUser?.access;
      if (!token) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      return await projectService.getActiveListings(token);
    } catch (error: any) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getCarbonCredits = createAsyncThunk(
  'carbon/getCarbonCredits',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.user.currentUser?.access;
      if (!token) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      return await projectService.getCarbonCredits(token);
    } catch (error: any) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const listCredit = createAsyncThunk(
  'carbon/listCredit',
  async (listingData: { credit: number; price: number }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.user.currentUser?.access;
      if (!token) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      return await projectService.listCredit(listingData, token);
    } catch (error: any) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const claimProceeds = createAsyncThunk(
  'carbon/claimProceeds',
  async (listingId: number, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.user.currentUser?.access;
      if (!token) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      return await projectService.claimProceeds(listingId, token);
    } catch (error: any) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const buyCredit = createAsyncThunk(
  'carbon/buyCredit',
  async (listing: Listing, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.user.currentUser?.access;
      const accountId = state.hashconnect.accountId;
      if (!token || !accountId) {
        return thunkAPI.rejectWithValue('User not authenticated or wallet not connected');
      }
      // 1. On-chain transaction
      await nftService.buyCreditOnChain(accountId, listing.credit.serial_number, listing.price);
      // 2. Off-chain update
      return await projectService.buyCreditOffChain(listing.id, token);
    } catch (error: any) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getPendingProjects = createAsyncThunk(
  'carbon/getPendingProjects',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.user.currentUser?.access;
      if (!token) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      return await projectService.getPendingProjects(token);
    } catch (error: any) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const getVerifierDashboardProjects = createAsyncThunk(
  'carbon/getVerifierDashboardProjects',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.user.currentUser?.access;
      if (!token) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      return await projectService.getVerifierDashboardProjects(token);
    } catch (error: any) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const addProject = createAsyncThunk(
  'carbon/addProject',
  async (projectData: Omit<Project, 'id' | 'created_at' | 'owner' | 'status'>, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.user.currentUser?.access;
      if (!token) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      return await projectService.addProject(projectData, token);
    } catch (error: any) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);


const carbonSlice = createSlice({
  name: 'carbon',
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(getProjects.pending, (state) => { state.isLoading = true; })
      .addCase(getProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(getProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(getActiveListings.pending, (state) => { state.isLoading = true; })
      .addCase(getActiveListings.fulfilled, (state, action: PayloadAction<Listing[]>) => {
        state.isLoading = false;
        state.listings = action.payload;
      })
      .addCase(getActiveListings.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(getCarbonCredits.pending, (state) => { state.isLoading = true; })
      .addCase(getCarbonCredits.fulfilled, (state, action: PayloadAction<CarbonCredit[]>) => {
        state.isLoading = false;
        state.carbonCredits = action.payload;
      })
      .addCase(getCarbonCredits.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(listCredit.pending, (state) => { state.isLoading = true; })
      .addCase(listCredit.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        const index = state.carbonCredits.findIndex(c => c.id === action.payload.credit.id);
        if (index !== -1) {
            state.carbonCredits[index].status = 'LISTED';
        }
      })
      .addCase(listCredit.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(claimProceeds.pending, (state) => { state.isLoading = true; })
      .addCase(claimProceeds.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
      })
      .addCase(claimProceeds.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(buyCredit.pending, (state) => { state.isLoading = true; })
      .addCase(buyCredit.fulfilled, (state, action: PayloadAction<any>) => {
        state.isLoading = false;
        state.listings = state.listings.filter(l => l.id !== action.payload.listing_id);
      })
      .addCase(buyCredit.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(getPendingProjects.pending, (state) => { state.isLoading = true; })
      .addCase(getPendingProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(getPendingProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(getVerifierDashboardProjects.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(getVerifierDashboardProjects.fulfilled, (state, action: PayloadAction<Project[]>) => {
        state.isLoading = false;
        state.projects = action.payload;
      })
      .addCase(getVerifierDashboardProjects.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(addProject.pending, (state) => { state.isLoading = true; })
      .addCase(addProject.fulfilled, (state, action: PayloadAction<Project>) => {
        state.isLoading = false;
        state.projects.push(action.payload);
      })
      .addCase(addProject.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      
  },
});

export default carbonSlice.reducer;