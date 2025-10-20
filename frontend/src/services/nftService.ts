import { AccountId, AccountAllowanceApproveTransaction, TransferTransaction, ContractExecuteTransaction, ContractFunctionParameters, NftId, Hbar } from '@hashgraph/sdk';
import deploymentData from '../../deployment-new-architecture.json';

const marketplaceContractId = AccountId.fromString(deploymentData.marketplaceContractId);
const nftTokenId = deploymentData.nftTokenAddress;

import { getHashConnect } from './hashconnect';

class NftService {

  async approveMarketplace(accountId: string): Promise<void> {
    const hc = await getHashConnect();
    if (!hc) throw new Error("HashConnect not initialized");

    const signer = hc.getSigner(accountId);
    const userAccountId = AccountId.fromString(accountId);

    const approveTx = await new AccountAllowanceApproveTransaction()
      .approveTokenNftAllowanceAllSerials(nftTokenId, userAccountId, marketplaceContractId)
      .freezeWithSigner(signer);

    const response = await approveTx.executeWithSigner(signer);
    
    // @ts-ignore
    await response.getReceiptWithSigner(signer);
  }

  async listCreditOnChain(accountId: string, serialNumber: number, price: number): Promise<void> {
    const hc = await getHashConnect();
    if (!hc) throw new Error("HashConnect not initialized");

    const signer = hc.getSigner(accountId);
    const userAccountId = AccountId.fromString(accountId);
    const nftId = new NftId(nftTokenId, serialNumber);
    const priceInHbar = new Hbar(price);

    // Step 1: Transfer NFT to marketplace contract
    const transferTx = await new TransferTransaction()
      .addNftTransfer(nftId, userAccountId, marketplaceContractId)
      .freezeWithSigner(signer);
    const transferResponse = await transferTx.executeWithSigner(signer);
    // @ts-ignore
    await transferResponse.getReceiptWithSigner(signer);

    // Step 2: Call listDepositedCredit
    const listTx = await new ContractExecuteTransaction()
      .setContractId(marketplaceContractId)
      .setGas(1000000)
      .setFunction("listDepositedCredit", new ContractFunctionParameters()
          .addInt64(serialNumber)
          .addUint256(priceInHbar.toTinybars())
      )
      .freezeWithSigner(signer);
    
    const listResponse = await listTx.executeWithSigner(signer);
    // @ts-ignore
    await listResponse.getReceiptWithSigner(signer);
  }

  async buyCreditOnChain(accountId: string, serialNumber: number, price: string): Promise<void> {
    const hc = await getHashConnect();
    if (!hc) throw new Error("HashConnect not initialized");

    const signer = hc.getSigner(accountId);
    const priceInHbar = Hbar.fromString(price);

    const tx = await new ContractExecuteTransaction()
      .setContractId(marketplaceContractId)
      .setGas(2000000)
      .setPayableAmount(priceInHbar)
      .setFunction("buyCredit", new ContractFunctionParameters()
          .addInt64(serialNumber)
      )
      .freezeWithSigner(signer);
    
    const response = await tx.executeWithSigner(signer);
    // @ts-ignore
    await response.getReceiptWithSigner(signer);
  }
}

const nftService = new NftService();
export default nftService;