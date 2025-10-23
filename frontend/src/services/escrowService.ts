import { 
    ContractExecuteTransaction, 
    ContractFunctionParameters, 
    Hbar, 
    AccountId, 
    PrivateKey, 
    Client, 
    TransactionRecordQuery,
    TransactionId,
    Timestamp
} from '@hashgraph/sdk';
import deploymentData from '../../deployment-new-architecture.json';
import { getHashConnect } from './hashconnect';

const escrowContractId = deploymentData.escrowContractId;
console.log("Using Escrow Contract ID:", escrowContractId);

// Helper function to poll for the transaction record
async function getRecordWithRetry(client: Client, transactionId: TransactionId, retries = 7, delay = 4000) {
    for (let i = 0; i < retries; i++) {
        try {
            console.log(`Attempt ${i + 1}/${retries}: Fetching transaction record for ID: ${transactionId.toString()}`);
            const record = await new TransactionRecordQuery()
                .setTransactionId(transactionId)
                .setQueryPayment(new Hbar(1)) // Ensure query payment is set
                .execute(client);
            
            console.log("Record found!");
            return record; // Success, return the record
        } catch (error: any) {
            if (error.toString().includes('RECEIPT_NOT_FOUND') || error.toString().includes('RECORD_NOT_FOUND') || error.toString().includes('UNKNOWN')) {
                if (i < retries - 1) {
                    console.log(`Record not found yet. Retrying in ${delay / 1000} seconds...`);
                    await new Promise(resolve => setTimeout(resolve, delay));
                } else {
                    console.error("Could not retrieve transaction record after all retries.");
                    throw error; // All retries failed, throw the last error
                }
            } else {
                // Another error occurred, throw it immediately
                throw error;
            }
        }
    }
    throw new Error("Failed to retrieve transaction record after all retries.");
}

class EscrowService {

  async submitProject(accountId: string, metadataCid: string, feeInHbar: number): Promise<string> {
    const hc = await getHashConnect();
    if (!hc) throw new Error("HashConnect not initialized");

    const signer = hc.getSigner(accountId);
    const feeAsHbar = new Hbar(feeInHbar);

    console.log("Proceeding with project submission...");
    const tx = new ContractExecuteTransaction()
      .setContractId(escrowContractId)
      .setGas(3000000)
      .setPayableAmount(feeAsHbar)
      .setFunction("submitProject", new ContractFunctionParameters()
          .addString(metadataCid)
          .addUint256(feeAsHbar.toTinybars().toNumber())
      );

    const frozenTx = await tx.freezeWithSigner(signer);
    const response = await frozenTx.executeWithSigner(signer);

    console.log("Project submission transaction sent. Waiting for receipt...");
    // @ts-ignore
    const receipt = await response.getReceiptWithSigner(signer);
    console.log(`Submission receipt status: ${receipt.status.toString()}`);
    if (receipt.status.toString() !== 'SUCCESS') {
        throw new Error(`Project submission failed with status: ${receipt.status.toString()}`);
    }

    // Only return the transaction ID string
    return response.transactionId.toString();
  }

  async reviewProject(submitTransactionId: string, approve: boolean): Promise<{ serialNumber: number; tokenAddress: string; }> {
    if (!process.env.NEXT_PUBLIC_OPERATOR_ID || !process.env.NEXT_PUBLIC_OPERATOR_KEY) {
        throw new Error("Verifier credentials (Operator ID and Key) are not configured in .env.local");
    }

    console.log("Step 1: Initializing client with verifier credentials.");
    const operatorId = AccountId.fromString(process.env.NEXT_PUBLIC_OPERATOR_ID);
    const operatorKey = PrivateKey.fromString(process.env.NEXT_PUBLIC_OPERATOR_KEY);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    console.log(`Step 2: Cleaning and parsing Transaction ID string: ${submitTransactionId}`);
    let transactionId;
    try {
        const cleanedTxId = submitTransactionId.replace(/\s/g, '');
        transactionId = TransactionId.fromString(cleanedTxId);
    } catch (error) {
        console.error("Failed to parse transaction ID string:", error);
        throw new Error(`Invalid transaction ID format: '${submitTransactionId}'. Expected 'account_id@seconds.nanos'.`);
    }

    try {
        console.log("Step 3: Fetching transaction record with retry logic...");
        const record = await getRecordWithRetry(client, transactionId);

        if (!record.contractFunctionResult) {
            throw new Error("Could not find contract function result in the transaction record.");
        }
        
        const projectId = record.contractFunctionResult.getUint256(0);
        console.log(`Step 4: Retrieved real on-chain projectId from record: ${projectId}`);

        console.log(`Step 5: Executing reviewProject function on-chain with approve=${approve}`);
        const tx = new ContractExecuteTransaction()
          .setContractId(escrowContractId)
          .setGas(1500000)
          .setFunction("reviewProject", new ContractFunctionParameters()
              .addUint256(projectId)
              .addBool(approve)
          );

        const response = await tx.execute(client);
        const reviewRecord = await response.getRecord(client);
        console.log("Step 6: reviewProject transaction executed and record retrieved.");

        if (!reviewRecord.contractFunctionResult) {
            throw new Error("Could not find contract function result in the review transaction record.");
        }

        const serialNumber = reviewRecord.contractFunctionResult.getInt64(0).toNumber();
        const tokenAddress = `0.0.${AccountId.fromSolidityAddress(reviewRecord.contractFunctionResult.getAddress(1)).num}`;
        
        console.log(`Step 7: On-chain review complete. Serial: ${serialNumber}, Token Address: ${tokenAddress}`);
        return { serialNumber, tokenAddress };

    } catch (error) {
        console.error(`Error during review process for ${transactionId.toString()}:`, error);
        throw new Error(`Failed to retrieve transaction record or execute review. Please verify the transaction ID on a block explorer. Error: ${error}`);
    }
  }
}

const escrowService = new EscrowService();
export default escrowService;