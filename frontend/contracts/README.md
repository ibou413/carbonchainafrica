# CarbonChain-Africa Smart Contracts Documentation

This repository contains the smart contracts for CarbonChain-Africa, a decentralized carbon credit marketplace built on the Hedera blockchain. The system tokenizes verified carbon credit projects as NFTs and facilitates their trade in a secure and transparent manner.

## 📋 Table of Contents

- [Contract Overview](#contract-overview)
- [Core Contracts](#core-contracts)
- [Contract Architecture](#contract-architecture)
- [Deployment](#deployment)
- [Usage Flow](#usage-flow)

## 🏗️ Contract Overview

The CarbonChain-Africa platform consists of three main contracts and several helper contracts inherited from the Hedera Token Service examples.

### Core Contracts
1.  **`CarbonCreditNFT.sol`** - Manages the creation and minting of carbon credit NFTs.
2.  **`CarbonProjectEscrow.sol`** - Handles the submission, verification, and tokenization of carbon credit projects.
3.  **`CarbonCreditMarketplace.sol`** - A marketplace for listing, buying, and selling the carbon credit NFTs.

### Helper Contracts
The system also relies on standard helper contracts for interacting with the Hedera Token Service (HTS), including `HederaTokenService.sol`, `ExpiryHelper.sol`, `KeyHelper.sol`, etc.

---

## Core Contracts

### 1. CarbonCreditNFT Contract (`CarbonCreditNFT.sol`)

**Purpose**: Creates the NFT collection that represents all verified carbon credits and mints individual NFTs as projects are approved.

#### Key Features:
-   **NFT Collection Creation**: Deploys a new NFT collection on Hedera with a defined name, symbol, and max supply.
-   **Controlled Minting**: Only the owner (the `CarbonProjectEscrow` contract) can mint new NFTs.
-   **Ownership Management**: The contract's ownership is transferred to the `CarbonProjectEscrow` contract upon deployment, ensuring a secure minting process.

#### Main Functions:

```solidity
// Creates the NFT collection for all carbon credits
function createNftCollection(
    string memory name,
    string memory symbol,
    string memory memo,
    int64 maxSupply
) external payable onlyOwner returns (address)
```

```solidity
// Mints a new carbon credit NFT with associated metadata
function mintCredit(bytes[] memory metadata) external onlyOwner returns (int64)
```

```solidity
// Transfers a minted NFT to a new owner
function transferCredit(address receiver, int64 serialNumber) external onlyOwner returns (int)
```

---

### 2. CarbonProjectEscrow Contract (`CarbonProjectEscrow.sol`)

**Purpose**: Manages the lifecycle of a carbon credit project, from submission to the final tokenization (minting) of the NFT.

#### Key Features:
-   **Project Submission**: Allows project proposers to submit their projects for verification by paying a fee.
-   **Verification Flow**: A designated `verifierAddress` can approve or reject submitted projects.
-   **Automated Tokenization**: Upon approval, the contract calls the `CarbonCreditNFT` contract to mint a new NFT and transfers it to the project proposer.
-   **Fee Management**: Collects tokenization fees and handles refunds for rejected projects.

#### Project States:
-   `Pending`: A project has been submitted and is awaiting review.
-   `Approved`: The project was approved, the fee was collected, and the NFT was minted and sent to the proposer.
-   `Rejected`: The project was rejected, and the fee was refunded to the proposer.

#### Main Functions:

```solidity
// A project proposer submits their project with a fee
function submitProject(string memory _metadataCid, uint256 _tokenizationFee) external payable
```

```solidity
// The verifier approves or rejects a project
function reviewProject(uint256 _projectId, bool _approved) external onlyVerifier returns (int64)
```

---

### 3. CarbonCreditMarketplace Contract (`CarbonCreditMarketplace.sol`)

**Purpose**: A decentralized marketplace for trading the verified carbon credit NFTs.

#### Key Features:
-   **NFT Deposit and Listing**: Sellers deposit their NFT into the contract and list it for sale at a set price.
-   **Purchasing**: Buyers can purchase a listed NFT. The contract handles the transfer of the NFT to the buyer and holds the funds.
-   **Secure Fund Claiming**: Sellers must call a separate function to claim their proceeds from a sale, working around Hedera EVM limitations.
-   **Service Fees**: The marketplace takes a percentage-based fee on each sale.

#### Main Functions:

```solidity
// A seller lists their deposited NFT for sale
function listDepositedCredit(int64 serialNumber, uint256 price) external
```

```solidity
// A buyer purchases a listed NFT
function buyCredit(int64 serialNumber) external payable
```

```solidity
// The seller claims their funds after a sale is complete
function claimProceeds(int64 serialNumber) external
```

---

## 🏛️ Contract Architecture

The three core contracts interact to manage the lifecycle of a carbon credit from project submission to secondary market trading.

1.  **Deployment**: All three contracts are deployed. The `CarbonProjectEscrow` contract is given ownership of the `CarbonCreditNFT` contract.
2.  **Project Submission**: A user calls `submitProject` on the `CarbonProjectEscrow` contract.
3.  **Approval & Minting**: A verifier calls `reviewProject` on the `CarbonProjectEscrow` contract. If approved, the `Escrow` contract calls `mintCredit` on the `CarbonCreditNFT` contract. The new NFT is then transferred to the project proposer.
4.  **Marketplace Listing**: The project proposer (now an NFT owner) deposits their NFT into the `CarbonCreditMarketplace` and calls `listDepositedCredit`.
5.  **Trading**: A buyer calls `buyCredit` to purchase the NFT. The seller then calls `claimProceeds` to receive their funds.

---

## 🚀 Deployment

The contracts are deployed and configured using the `deployNewArchitecture.ts` script.

```bash
# 1. Compile all contracts
npm run compile:new

# 2. Run the deployment script
npx tsx scripts/deployNewArchitecture.ts --network testnet
```

The script performs the following key steps:
- Deploys all three core contracts.
- Transfers ownership of the `CarbonCreditNFT` contract to the `CarbonProjectEscrow` contract.
- Initializes the NFT collection via the `CarbonProjectEscrow` contract.
- Associates the `CarbonCreditMarketplace` with the newly created NFT token type.
- Saves all resulting contract and token addresses to `deployment-new-architecture.json`.

---

## 💡 Usage Flow

The `testProjectFlow.ts` script provides a full end-to-end example of the application's logic, from project submission to a successful marketplace sale.

```bash
# Run the full application flow test
npx tsx scripts/testProjectFlow.ts --network testnet
```
