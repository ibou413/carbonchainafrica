import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import {TokenId, AccountId, TransferTransaction, ContractExecuteTransaction, ContractFunctionParameters, NftId, Hbar } from '@hashgraph/sdk';
import type { RootState } from './index';
import projectService from '../services/projectService';
import escrowService from '../services/escrowService';
import nftService from '../services/nftService';
import { getHashConnect } from '../services/hashconnect';
import deploymentData from '../../deployment-new-architecture.json';
import { useSelector } from 'react-redux';

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
  metadata_cid?: string; // New field for IPFS CID of metadata JSON
  image_cid?: string;    // New field for IPFS CID of project image
  document_cid?: string; // New field for IPFS CID of project document
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
    seller: any;
    credit: CarbonCredit;
    price: string;
    is_active: boolean;
    claimed: boolean; // Added to track if proceeds have been claimed
    created_at: string;
}

interface CarbonState {
  projects: Project[];
  carbonCredits: CarbonCredit[];
  listings: Listing[]; // For public marketplace
  myListings: Listing[]; // For seller dashboard
  isLoading: boolean;
  isError: boolean;
  message: string;
}

const initialState: CarbonState = {
  projects: [],
  carbonCredits: [],
  listings: [],
  myListings: [],
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
      return await projectService.getActiveListings();
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

export const getMyListings = createAsyncThunk(
  'carbon/getMyListings',
  async (_, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.user.currentUser?.access;
      if (!token) {
        return thunkAPI.rejectWithValue('User not authenticated');
      }
      return await projectService.getMyListings(token);
    } catch (error: any) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const listCredit = createAsyncThunk(
  'carbon/listCredit',
  async (listingData: { creditId: number; serialNumber: number; price: number }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.user.currentUser?.access;
      const accountId = state.hashconnect.accountId;
      if (!token || !accountId) {
        return thunkAPI.rejectWithValue('User not authenticated or wallet not connected');
      }

      // --- ON-CHAIN LOGIC --- 
      const hc = await getHashConnect();
      if (!hc) throw new Error("HashConnect not initialized");

      const signer = hc.getSigner(accountId);
      const userAccountId = AccountId.fromString(accountId);
      const marketplaceContractId = deploymentData.marketplaceContractId;
      const nftTokenId = TokenId.fromString(deploymentData.nftTokenAddress);
      const nftId = new NftId(nftTokenId, listingData.serialNumber);
      const priceInHbar = new Hbar(listingData.price);

      // 1. Transfer NFT to marketplace contract
      const transferTx = await new TransferTransaction()
        .addNftTransfer(nftId, userAccountId, marketplaceContractId)
        .freezeWithSigner(signer);
      const transferResponse = await transferTx.executeWithSigner(signer);
      // @ts-ignore
      await transferResponse.getReceiptWithSigner(signer);

      // 2. Call listDepositedCredit
      const listTx = await new ContractExecuteTransaction()
        // @ts-ignore
        .setContractId(marketplaceContractId)
        .setGas(1000000)
        .setFunction("listDepositedCredit", new ContractFunctionParameters()
            .addInt64(listingData.serialNumber)
            .addUint256(priceInHbar.toTinybars())
        )
        .freezeWithSigner(signer);
      
      const listResponse = await listTx.executeWithSigner(signer);
      // @ts-ignore
      await listResponse.getReceiptWithSigner(signer);
      // --- END ON-CHAIN LOGIC ---

      // --- OFF-CHAIN LOGIC (only if on-chain succeeds) ---
      const offChainData = { credit: listingData.creditId, price: listingData.price };
      return await projectService.listCredit(offChainData, token);

    } catch (error: any) {
      const message = (error.response && error.response.data && error.response.data.message) || error.message || error.toString();
      return thunkAPI.rejectWithValue(message);
    }
  }
);

export const claimProceeds = createAsyncThunk(
  'carbon/claimProceeds',
  async ({ listingId, serialNumber }: { listingId: number, serialNumber: number }, thunkAPI) => {
    try {
      const state = thunkAPI.getState() as RootState;
      const token = state.user.currentUser?.access;
      const accountId = state.hashconnect.accountId;

      if (!token || !accountId) {
        return thunkAPI.rejectWithValue('User not authenticated or wallet not connected');
      }

      // --- ON-CHAIN LOGIC ---
      const hc = await getHashConnect();
      if (!hc) throw new Error("HashConnect not initialized");

      const signer = hc.getSigner(accountId);
      const marketplaceContractId = deploymentData.marketplaceContractId;

      const claimTx = await new ContractExecuteTransaction()
        // @ts-ignore
        .setContractId(marketplaceContractId)
        .setGas(1000000) // Adjust gas as needed
        .setFunction("claimProceeds", new ContractFunctionParameters()
            .addInt64(serialNumber)
        )
        .freezeWithSigner(signer);

      const claimResponse = await claimTx.executeWithSigner(signer);
      // @ts-ignore
      await claimResponse.getReceiptWithSigner(signer);
      // --- END ON-CHAIN LOGIC ---

      // --- OFF-CHAIN LOGIC (only if on-chain succeeds) ---
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

      // --- ON-CHAIN LOGIC ---
      const hc = await getHashConnect();
      if (!hc) throw new Error("HashConnect not initialized");

      const signer = hc.getSigner(accountId);
      const priceInHbar = Hbar.fromString(listing.price);
      const marketplaceContractId = deploymentData.marketplaceContractId;

      const tx = await new ContractExecuteTransaction()
        // @ts-ignore
        .setContractId(marketplaceContractId)
        .setGas(2000000)
        .setPayableAmount(priceInHbar)
        .setFunction("buyCredit", new ContractFunctionParameters()
            .addInt64(listing.credit.serial_number)
        )
        .freezeWithSigner(signer);
      
      const response = await tx.executeWithSigner(signer);
      // @ts-ignore
      await response.getReceiptWithSigner(signer);
      // --- END ON-CHAIN LOGIC ---

      // --- OFF-CHAIN LOGIC ---
      return await nftService.buyCreditOffChain(listing.id, token);
      
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
      .addCase(getMyListings.pending, (state) => { state.isLoading = true; })
      .addCase(getMyListings.fulfilled, (state, action: PayloadAction<Listing[]>) => {
        state.isLoading = false;
        state.myListings = action.payload;
      })
      .addCase(getMyListings.rejected, (state, action) => {
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
      .addCase(claimProceeds.fulfilled, (state, action: PayloadAction<Listing>) => {
        state.isLoading = false;
        const index = state.myListings.findIndex(l => l.id === action.payload.id);
        if (index !== -1) {
            state.myListings[index] = action.payload; // Update the listing with the new claimed status
        }
      })
      .addCase(claimProceeds.rejected, (state, action) => {
        state.isLoading = false;
        state.isError = true;
        state.message = action.payload as string;
      })
      .addCase(buyCredit.pending, (state) => { state.isLoading = true; })
      .addCase(buyCredit.fulfilled, (state, action) => {
        state.isLoading = false;
        // Use the ID from the original argument passed to the thunk for a reliable optimistic update
        state.listings = state.listings.filter(l => l.id !== action.meta.arg.id);
      })
      .addCase(buyCredit.rejected, (state, action) => {
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