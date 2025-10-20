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

class EscrowService {

  async submitProject(accountId: string, metadataCid: string, feeInHbar: number): Promise<string> {
    const hc = await getHashConnect();
    if (!hc) throw new Error("HashConnect not initialized");

    const signer = hc.getSigner(accountId);
    const feeAsHbar = new Hbar(feeInHbar);

    console.log("Proceeding with project submission...");
    const tx = new ContractExecuteTransaction()
      .setContractId(escrowContractId)
      .setGas(1000000)
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

            console.log(`Successfully parsed Transaction ID: ${transactionId.toString()}`);

    

        } catch (error) {

            console.error("Failed to parse transaction ID string:", error);

            throw new Error(`Invalid transaction ID format: '${submitTransactionId}'. Expected 'account_id@seconds.nanos'.`);

        }

    

        console.log("Step 3: Waiting for 10 seconds for transaction record to propagate on the network...");

        await new Promise(resolve => setTimeout(resolve, 10000));

    

        try {

            console.log(`Step 4: Fetching transaction record for ID: ${transactionId.toString()}`);

            // Explicitly set a query payment to prevent any fee-related issues.

            const record = await new TransactionRecordQuery()

                .setTransactionId(transactionId)

                .setQueryPayment(new Hbar(1))

                .execute(client);

    

            if (!record.contractFunctionResult) {

                throw new Error("Could not find contract function result in the transaction record.");

            }

            

            const projectId = record.contractFunctionResult.getUint256(0);

            console.log(`Step 5: Retrieved real on-chain projectId from record: ${projectId}`);

    

            console.log(`Step 6: Executing reviewProject function on-chain with approve=${approve}`);

            const tx = new ContractExecuteTransaction()

              .setContractId(escrowContractId)

              .setGas(1500000) // Gas limit for the review transaction

              .setFunction("reviewProject", new ContractFunctionParameters()

                  .addUint256(projectId)

                  .addBool(approve)

              );

    

            const response = await tx.execute(client);

            const reviewRecord = await response.getRecord(client);

            console.log("Step 7: reviewProject transaction executed and record retrieved.");

    

            if (!reviewRecord.contractFunctionResult) {

                throw new Error("Could not find contract function result in the review transaction record.");

            }

    

            const serialNumber = reviewRecord.contractFunctionResult.getInt64(0).toNumber();

            const tokenAddress = `0.0.${AccountId.fromSolidityAddress(reviewRecord.contractFunctionResult.getAddress(1)).num}`;

            

            console.log(`Step 8: On-chain review complete. Serial: ${serialNumber}, Token Address: ${tokenAddress}`);

            return { serialNumber, tokenAddress };

    

        } catch (error) {

            console.error(`Error querying transaction record for ${transactionId.toString()}:`, error);

            throw new Error(`Failed to retrieve transaction record. Please verify the transaction ID on a block explorer. Error: ${error}`);

        }

      }

}

const escrowService = new EscrowService();
export default escrowService;