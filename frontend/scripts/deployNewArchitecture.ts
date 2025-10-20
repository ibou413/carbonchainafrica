// scripts/deployNewArchitecture.ts
import {
    Client,
    AccountId,
    PrivateKey,
    ContractCreateFlow,
    ContractExecuteTransaction,
    ContractFunctionParameters,
    Hbar,
    ContractInfoQuery,
    ContractId,
} from "@hashgraph/sdk";
import * as dotenv from "dotenv";
import * as fs from "fs";

dotenv.config({ path: "./scripts/.env" });

async function main() {
    console.log("🚀 Starting new architecture deployment...");

    // 1. Get operator credentials
    if (!process.env.OPERATOR_ID || !process.env.OPERATOR_KEY) {
        throw new Error("Environment variables OPERATOR_ID and OPERATOR_KEY must be present");
    }
    console.log("Using OPERATOR account as payer for deployment...");
    const operatorId = AccountId.fromString(process.env.OPERATOR_ID);
    const operatorKey = PrivateKey.fromStringECDSA(process.env.OPERATOR_KEY);
    const client = Client.forTestnet().setOperator(operatorId, operatorKey);

    try {
        // --- DEPLOY CarbonCreditNFT CONTRACT ---
        console.log("\n📦 Deploying CarbonCreditNFT contract...");
        const nftContractBytecode = fs.readFileSync("./contracts/build/contracts_CarbonCreditNFT_sol_CarbonCreditNFT.bin");
        const nftContractCreate = new ContractCreateFlow()
            .setGas(4_000_000) // Reverted gas
            .setAdminKey(operatorKey) // Set the admin key for the contract
            .setBytecode(nftContractBytecode);
        const nftContractTxResponse = await nftContractCreate.execute(client);
        const nftContractReceipt = await nftContractTxResponse.getReceipt(client);
        const nftContractId = nftContractReceipt.contractId;
        if (!nftContractId) {
            throw new Error("Failed to deploy CarbonCreditNFT contract");
        }
        console.log(`✅ CarbonCreditNFT contract deployed with ID: ${nftContractId}`);

        // --- DEPLOY CarbonProjectEscrow CONTRACT ---
        console.log("\n📦 Deploying CarbonProjectEscrow contract...");
        const escrowContractBytecode = fs.readFileSync("./contracts/build/contracts_CarbonProjectEscrow_sol_CarbonProjectEscrow.bin");
        const escrowContractCreate = new ContractCreateFlow()
            .setGas(4_000_000) // Reverted gas
            .setBytecode(escrowContractBytecode)
            .setConstructorParameters(
                new ContractFunctionParameters()
                    .addAddress(nftContractId.toSolidityAddress())
            );
        const escrowContractTxResponse = await escrowContractCreate.execute(client);
        const escrowContractReceipt = await escrowContractTxResponse.getReceipt(client);
        const escrowContractId = escrowContractReceipt.contractId;
        if (!escrowContractId) {
            throw new Error("Failed to deploy CarbonProjectEscrow contract");
        }
        console.log(`✅ CarbonProjectEscrow contract deployed with ID: ${escrowContractId}`);

        // --- DEPLOY CarbonCreditMarketplace CONTRACT ---
        console.log("\n📦 Deploying CarbonCreditMarketplace contract...");
        const marketplaceBytecode = fs.readFileSync("./contracts/build/contracts_CarbonCreditMarketplace_sol_CarbonCreditMarketplace.bin");
        const feePercent = 0; // 0% fee to bypass problematic feeAddress
        const marketplaceCreate = new ContractCreateFlow()
            .setGas(4_000_000) // Reverted gas
            .setAdminKey(operatorKey) // Set the admin key for the contract
            .setBytecode(marketplaceBytecode)
            .setConstructorParameters(
                new ContractFunctionParameters()
                    .addAddress(nftContractId.toSolidityAddress())
                    .addAddress(operatorId.toSolidityAddress())
                    .addUint256(feePercent)
                    .addAddress(escrowContractId.toSolidityAddress())
            );
        const marketplaceTxResponse = await marketplaceCreate.execute(client);
        const marketplaceReceipt = await marketplaceTxResponse.getReceipt(client);
        const marketplaceContractId = marketplaceReceipt.contractId;
        if (!marketplaceContractId) {
            throw new Error("Failed to deploy CarbonCreditMarketplace contract");
        }
        console.log(`✅ CarbonCreditMarketplace contract deployed with ID: ${marketplaceContractId}`);

        // --- LINK CONTRACTS ---
        console.log("\n🔗 Linking Escrow to Marketplace...");
        const setMarketplaceTx = new ContractExecuteTransaction()
            .setContractId(escrowContractId)
            .setGas(4_000_000) // Reverted gas
            .setFunction("setMarketplaceContract", new ContractFunctionParameters().addAddress(marketplaceContractId.toSolidityAddress()));
        const setMarketplaceSubmit = await setMarketplaceTx.execute(client);
        const setMarketplaceRx = await setMarketplaceSubmit.getReceipt(client);
        if (setMarketplaceRx.status.toString() !== "SUCCESS") {
            throw new Error("Failed to link Escrow to Marketplace");
        }
        console.log(`✅ Escrow contract linked to ${marketplaceContractId}`);

        console.log("\n🔗 Linking contracts by transferring ownership of NFT contract...");
        const transferOwnershipTx = new ContractExecuteTransaction()
            .setContractId(nftContractId)
            .setGas(4_000_000) // Reverted gas
            .setFunction("transferOwnership", new ContractFunctionParameters().addAddress(escrowContractId.toSolidityAddress()));
        const transferOwnershipSubmit = await transferOwnershipTx.execute(client);
        const transferOwnershipRx = await transferOwnershipSubmit.getReceipt(client);
        if (transferOwnershipRx.status.toString() !== "SUCCESS") {
            throw new Error("Failed to transfer ownership of NFT contract");
        }
        console.log(`✅ Ownership of CarbonCreditNFT transferred to ${escrowContractId}`);

        // --- INITIALIZE NFT COLLECTION ---
        console.log("\n🪙 Initializing NFT collection via Escrow contract...");
        const initCollectionTx = new ContractExecuteTransaction()
            .setContractId(escrowContractId)
            .setGas(4_000_000) // Reverted gas
            .setPayableAmount(new Hbar(20)) // Reverted fee
            .setFunction("initCollection", new ContractFunctionParameters()
                .addString("Verified Carbon Credit")
                .addString("VCC")
                .addString("A verified carbon credit from the registry")
                .addInt64(10000)
            );
        const initCollectionSubmit = await initCollectionTx.execute(client);
        const initCollectionRecord = await initCollectionSubmit.getRecord(client);
        const nftTokenAddress = initCollectionRecord.contractFunctionResult?.getAddress(0);
        if (!nftTokenAddress) {
            throw new Error("Failed to get NFT token address from collection initialization");
        }
        console.log(`✅ NFT collection created successfully! Token Address: 0.0.${AccountId.fromSolidityAddress(nftTokenAddress).num}`);


        // --- ASSOCIATE & UPDATE MARKETPLACE ---
        console.log("\n🔗 Associating Marketplace with NFT Token and updating address...");

        // Associate the marketplace with the new NFT
        const associateMarketplaceTx = new ContractExecuteTransaction()
            .setContractId(marketplaceContractId)
            .setGas(1_000_000)
            .setFunction("associateWithToken", new ContractFunctionParameters().addAddress(nftTokenAddress));
        const associateMarketplaceSubmit = await associateMarketplaceTx.execute(client);
        const associateMarketplaceRx = await associateMarketplaceSubmit.getReceipt(client);
        if (associateMarketplaceRx.status.toString() !== "SUCCESS") {
            throw new Error(`Failed to associate marketplace with token ${nftTokenAddress}`);
        }
        console.log(`✅ Marketplace contract associated with token 0.0.${AccountId.fromSolidityAddress(nftTokenAddress).num}`);

        // Update the marketplace with the new NFT address
        const updateMarketplaceTx = new ContractExecuteTransaction()
            .setContractId(marketplaceContractId)
            .setGas(1_000_000)
            .setFunction("updateNftTokenAddress", new ContractFunctionParameters().addAddress(nftTokenAddress));
        const updateMarketplaceSubmit = await updateMarketplaceTx.execute(client);
        const updateMarketplaceRx = await updateMarketplaceSubmit.getReceipt(client);
        if (updateMarketplaceRx.status.toString() !== "SUCCESS") {
            throw new Error(`Failed to update marketplace with token address ${nftTokenAddress}`);
        }
        console.log(`✅ Marketplace contract updated with token address 0.0.${AccountId.fromSolidityAddress(nftTokenAddress).num}`);


        // --- SAVE RESULTS ---
        const output = {
            operatorId: operatorId.toString(),
            nftContractId: nftContractId.toString(),
            escrowContractId: escrowContractId.toString(),
            marketplaceContractId: marketplaceContractId.toString(),
            nftTokenAddress: `0.0.${AccountId.fromSolidityAddress(nftTokenAddress).num}`,
            marketplaceFeePercent: feePercent,
        };
        fs.writeFileSync("./deployment-new-architecture.json", JSON.stringify(output, null, 2));
        console.log("\n💾 Deployment data saved to deployment-new-architecture.json");
        console.log("🎉 New architecture deployed successfully!");

    } catch (error: any) {
        console.error("\n❌ An error occurred during the new deployment:");
        if (error.status && error.status._code) {
            console.error(`Hedera SDK Error: ${error.status.toString()}`);
            if (error.transactionId) {
                console.error(`Transaction ID: ${error.transactionId.toString()}`);
            }
            if (error.contractFunctionResult?.errorMessage) {
                console.error("Contract Revert Reason:", error.contractFunctionResult.errorMessage);
            }
        } else {
            console.error(error);
        }
        process.exit(1);
    }
}

main();
