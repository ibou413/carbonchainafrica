import { AccountId, AccountAllowanceApproveTransaction, TransferTransaction, ContractExecuteTransaction, ContractFunctionParameters, NftId, Hbar } from '@hashgraph/sdk';
import deploymentData from '../../deployment-new-architecture.json';
import axios from 'axios';
import { getHashConnect } from './hashconnect';

const API_BASE_URL = 'http://127.0.0.1:8000/api';
const marketplaceContractId = AccountId.fromString(deploymentData.marketplaceContractId);
const nftTokenId = deploymentData.nftTokenAddress;

class NftService {

  async buyCreditOffChain(listingId: number, token: string) {
    const config = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    };
    const response = await axios.post(`${API_BASE_URL}/listings/${listingId}/buy/`, {}, config);
    return response.data;
  }
}

const nftService = new NftService();
export default nftService;