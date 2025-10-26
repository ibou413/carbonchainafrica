import {
    Client,
    AccountId,
    PrivateKey,
    ContractId,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    ContractCallQuery,
    Hbar,
    TokenAssociateTransaction,
    TransferTransaction,
    TokenNftInfoQuery,
    AccountBalanceQuery,
    TokenId,
    NftId,
    TransactionRecordQuery
} from "@hashgraph/sdk";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({ path: './scripts/.env' });

async function main() {
    console.log("🚀 Starting full project and marketplace flow test...");

    // 1. --- Configuration ---
    if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY || !process.env.PROPOSER_KEY || !process.env.BUYER_KEY) {
        throw new Error("Required environment variables OPERATOR_ID, OPERATOR_KEY, PROPOSER_KEY, or BUYER_KEY are missing.");
    }

    // Verifier (Operator)
    const verifierId = AccountId.fromString(process.env.OPERATOR_ID);
    const verifierKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
    const verifierClient = Client.forTestnet().setOperator(verifierId, verifierKey);

    // Project Proposer
    const proposerId = AccountId.fromString(process.env.PROPOSER_ID!);
    const proposerKey = PrivateKey.fromStringECDSA(process.env.PROPOSER_KEY);
    const proposerClient = Client.forTestnet().setOperator(proposerId, proposerKey);

    // Buyer
    const buyerId = AccountId.fromString(process.env.BUYER_ID!);
    const buyerKey = PrivateKey.fromStringECDSA(process.env.BUYER_KEY);
    const buyerClient = Client.forTestnet().setOperator(buyerId, buyerKey);

    console.log(`- Verifier: ${verifierId}`);
    console.log(`- Proposer: ${proposerId}`);
    console.log(`- Buyer: ${buyerId}`);

    // --- Fund the verifier account ---
    console.log("\n--- STEP 0: Funding Verifier Account ---");
    const fundTx = await new TransferTransaction()
        .addHbarTransfer(proposerId, new Hbar(-20)) // Sending 20 Hbar
        .addHbarTransfer(verifierId, new Hbar(20))  // Receiving 20 Hbar
        .freezeWith(proposerClient);
    await (await fundTx.sign(proposerKey)).execute(proposerClient);
    console.log("✅ Verifier account funded with 20 Hbar from Proposer.");

    // Verify verifier balance
    const verifierBalance = await new AccountBalanceQuery().setAccountId(verifierId).execute(verifierClient);
    console.log(`✅ Verifier current balance: ${verifierBalance.hbars.toString()}`);

    // Load deployment data
    const deploymentData = JSON.parse(fs.readFileSync("./deployment-new-architecture.json", "utf8"));
    const escrowContractId = ContractId.fromString(deploymentData.escrowContractId);
    const marketplaceContractId = ContractId.fromString(deploymentData.marketplaceContractId);
    const nftTokenId = TokenId.fromString(deploymentData.nftTokenAddress);

    console.log("- Loaded contracts:");
    console.log(`  - Escrow: ${escrowContractId}`);
    console.log(`  - Marketplace: ${marketplaceContractId}`);
    console.log(`  - NFT Token: ${nftTokenId}`);

    let mintedSerialNumber: number;

    try {
        // 2. --- Project Submission & Approval Flow ---
        console.log("\n--- STEP 1: Project Submission & Approval ---");

        // Proposer must associate with the token before being able to receive it.
        console.log(`Proposer associating with token ${nftTokenId}...`);
        const associateTx = await new TokenAssociateTransaction()
            .setAccountId(proposerId)
            .setTokenIds([nftTokenId])
            .freezeWith(proposerClient);
        await (await associateTx.sign(proposerKey)).execute(proposerClient);
        console.log("✅ Proposer associated with token.");

        // Add a delay to allow for propagation
        console.log("Waiting 5 seconds for network propagation...");
        await new Promise((resolve) => setTimeout(resolve, 5000));

        // --- Get the next project ID from the contract --- 
        const query = new ContractCallQuery()
            .setContractId(escrowContractId)
            .setGas(100_000)
            .setFunction("nextProjectId");
        const queryResult = await query.execute(verifierClient);
        const projectIdToReview = queryResult.getUint256(0);

        const tokenizationFee = new Hbar(1); // 1 Hbar

        console.log(`Submitting project (will be ID: ${projectIdToReview})...`);
        const submitTx = await new ContractExecuteTransaction()
            .setContractId(escrowContractId)
            .setGas(1_000_000)
            .setPayableAmount(tokenizationFee)
            .setFunction("submitProject", new ContractFunctionParameters()
                .addString("ipfs://some-metadata-cid-for-test")
                .addUint256(tokenizationFee.toTinybars().toNumber())
            )
            .execute(proposerClient);
        await submitTx.getReceipt(proposerClient);
        console.log("✅ Project submitted successfully.");

        console.log(`Approving project ${projectIdToReview} from verifier ${verifierId}...`);
        const approveTx = await new ContractExecuteTransaction()
            .setContractId(escrowContractId)
            .setGas(1_500_000) // Last attempt with reduced gas
            .setFunction("reviewProject", new ContractFunctionParameters()
                .addUint256(projectIdToReview) // Use dynamic project ID
                .addBool(true)
            )
            .execute(verifierClient);
        
        const approveRecord = await approveTx.getRecord(verifierClient);
        mintedSerialNumber = approveRecord.contractFunctionResult!.getInt64(0).toNumber();
        console.log(`✅ Project approved. Minted NFT with Serial Number: ${mintedSerialNumber}`);

        // 3. --- Marketplace Flow ---
        console.log("\n--- STEP 2: Marketplace Listing & Purchase ---");
        const nftId = new NftId(nftTokenId, mintedSerialNumber);
        const salePrice = new Hbar(5); // 5 Hbar

        // Proposer deposits the NFT into the marketplace contract
        console.log(`Proposer depositing NFT ${nftId} into marketplace...`);
        const transferTx = await new TransferTransaction()
            .addNftTransfer(nftId, proposerId, AccountId.fromString(marketplaceContractId.toString()))
            .freezeWith(proposerClient);
        const transferSubmit = await (await transferTx.sign(proposerKey)).execute(proposerClient);
        await transferSubmit.getReceipt(proposerClient);
        console.log("✅ NFT deposited.");

        // Listing the deposited NFT on marketplace
        console.log(`Proposer listing deposited NFT for ${salePrice.toString()}...`);
        const listTx = await new ContractExecuteTransaction()
            .setContractId(marketplaceContractId)
            .setGas(1_000_000)
            .setFunction("listDepositedCredit", new ContractFunctionParameters()
                .addInt64(mintedSerialNumber)
                .addUint256(salePrice.toTinybars())
            )
            .execute(proposerClient); // Proposer (seller) sets the listing
        await listTx.getReceipt(proposerClient);
        console.log("✅ NFT listed on the marketplace.");

        // Buyer associates and buys
        console.log(`Buyer associating with token and purchasing...`);
        const buyerAssociateTx = await new TokenAssociateTransaction()
            .setAccountId(buyerId)
            .setTokenIds([nftTokenId])
            .freezeWith(buyerClient);
        await (await buyerAssociateTx.sign(buyerKey)).execute(buyerClient);
        console.log("✅ Buyer associated with token.");

        const buyerInitialBalance = await new AccountBalanceQuery().setAccountId(buyerId).execute(buyerClient);

        const buyTx = await new ContractExecuteTransaction()
            .setContractId(marketplaceContractId)
            .setGas(2_000_000)
            .setPayableAmount(salePrice)
            .setFunction("buyCredit", new ContractFunctionParameters().addInt64(mintedSerialNumber))
            .execute(buyerClient);
        await buyTx.getReceipt(buyerClient);
        console.log("✅ NFT purchased by buyer.");

        // --- Seller claims proceeds ---
        console.log(`\nSeller (proposer) claiming proceeds for sale of NFT ${nftId}...`);
        const claimTx = await new ContractExecuteTransaction()
            .setContractId(marketplaceContractId)
            .setGas(1_000_000)
            .setFunction("claimProceeds", new ContractFunctionParameters().addInt64(mintedSerialNumber))
            .execute(proposerClient); // Seller executes this
        await claimTx.getReceipt(proposerClient);
        console.log("✅ Seller claimed proceeds successfully.");

        // 4. --- Verification ---
        console.log("\n--- STEP 3: Verification ---");

        // Check NFT owner
        const nftInfo = await new TokenNftInfoQuery().setNftId(nftId).execute(verifierClient);
        if (nftInfo[0].accountId.toString() === buyerId.toString()) {
            console.log(`✅ Ownership Verified: NFT owner is now the buyer (${buyerId}).`);
        } else {
            throw new Error(`❌ Ownership Failed: Expected owner ${buyerId}, found ${nftInfo[0].accountId}.`);
        }

        // Check buyer balance
        const buyerFinalBalance = await new AccountBalanceQuery().setAccountId(buyerId).execute(buyerClient);
        if (buyerFinalBalance.hbars.toTinybars().lessThan(buyerInitialBalance.hbars.toTinybars())) {
            console.log("✅ Buyer Balance Verified: Buyer's HBAR balance has decreased.");
        } else {
            throw new Error("❌ Buyer Balance Failed: Buyer's balance did not decrease.");
        }

        console.log("\n🎉 Full project and marketplace flow test completed successfully!");

    } catch (error: any) {
        console.error("\n❌ An error occurred during the test flow:", error.message);
        // Try to get more detailed logs if the error is a transaction failure
        if (error.transactionId) {
            try {
                console.log("\n🔍 Fetching transaction record for more details...");
                const record = await new TransactionRecordQuery()
                    .setTransactionId(error.transactionId)
                    .execute(verifierClient);
                console.log("Transaction contract function result logs:");
                record.contractFunctionResult?.logs.forEach((log: { data: { toString: () => any; }; }, i: any) => {
                    console.log(`  - Log ${i}: ${log.data.toString()}`);
                });
            } catch (recordError) {
                console.error("Could not fetch transaction record:", recordError);
            }
        }
        process.exit(1);
    }
}

main();