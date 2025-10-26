import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import escrowService from '../services/escrowService';
import axios from 'axios';
import { toast } from 'sonner';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

export const approveProject = createAsyncThunk(
  'escrow/approveProject',
  async ({ dbProjectId, submitTransactionId, token }: { dbProjectId: number, submitTransactionId: string, token: string }, { rejectWithValue }) => {
    try {
      toast.info('Approbation de la transaction sur la Hedera...');
      const { serialNumber, tokenAddress } = await escrowService.reviewProject(submitTransactionId, true);
      toast.success('Transaction Hedera réussie!');

      toast.info('Mise à jour du statut du projet...');
      const response = await axios.patch(`${API_URL}/projects/${dbProjectId}/review/`, { 
        status: 'APPROVED', 
        serial_number: serialNumber, 
        token_address: tokenAddress 
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Projet approuvé avec succès!');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Une erreur inconnue est survenue.';
      toast.error("Erreur lors de l'approbation du projet.", {
        description: errorMessage,
      });
      return rejectWithValue(errorMessage);
    }
  }
);

export const rejectProject = createAsyncThunk(
  'escrow/rejectProject',
  async ({ dbProjectId, submitTransactionId, token }: { dbProjectId: number, submitTransactionId: string, token: string }, { rejectWithValue }) => {
    try {
      toast.info('Envoi de la transaction de rejet sur la Hedera...');
      await escrowService.reviewProject(submitTransactionId, false);
      toast.success('Transaction Hedera réussie!');

      toast.info('Mise à jour du statut du projet...');
      const response = await axios.patch(`${API_URL}/projects/${dbProjectId}/review/`, { 
        status: 'REJECTED' 
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      toast.success('Projet rejeté avec succès!');
      return response.data;
    } catch (error: any) {
      const errorMessage = error.response?.data?.detail || error.message || 'Une erreur inconnue est survenue.';
      toast.error('Erreur lors du rejet du projet.', {
        description: errorMessage,
      });
      return rejectWithValue(errorMessage);
    }
  }
);

const escrowSlice = createSlice({
  name: 'escrow',
  initialState: {
    loading: false,
    error: null as string | null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(approveProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(approveProject.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(approveProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(rejectProject.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(rejectProject.fulfilled, (state) => {
        state.loading = false;
      })
      .addCase(rejectProject.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default escrowSlice.reducer;