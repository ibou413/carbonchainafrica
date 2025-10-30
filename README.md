# CarbonChain-Africa: A Decentralized Carbon Credit Marketplace

CarbonChain-Africa is a decentralized platform built on Hedera Hashgraph that connects carbon credit projects across Africa with global buyers. Our mission is to bring transparency, liquidity, and accessibility to the African carbon market, empowering local projects and enabling corporations to verifiably offset their carbon footprint.

This repository contains the entire project, including the Django backend, the Next.js frontend, and the Hedera smart contracts.

## 📋 Table of Contents

- [The Problem & Our Solution](#the-problem--our-solution)
- [Live Demo](#live-demo)
- [Project Architecture](#project-architecture)
- [Application Workflow](#application-workflow)
- [Getting Started](#getting-started)
  - [Prerequisites](#prerequisites)
  - [Backend Setup](#backend-setup)
  - [Frontend Setup](#frontend-setup)
- [Technology Stack](#technology-stack)
- [Hackathon Tracks](#hackathon-tracks)

## The Problem & Our Solution

Africa possesses vast potential for carbon reduction projects, yet its carbon market remains fragmented and underdeveloped. Project developers often face significant barriers, including high costs, a lack of transparency, and complex verification processes, hindering their access to global carbon markets.

CarbonChain-Africa is a revolutionary dApp leveraging Hedera blockchain technology to transform Africa's carbon credit market through **transparency, inclusion, and technological innovation**. Our platform directly addresses critical legal, financial, technical, and governance challenges that currently impede the emergence of a credible and inclusive carbon market across the continent.

We achieve this by:
> - **Immutable Registry & Tokenized Credits (HTS, HCS):** Transforming carbon credits into tradeable, traceable HTS tokens and leveraging HCS to create an unchangeable record, ensuring permanent transparency, trust, and authenticity.
> - **Smart Automation (HSCS):** Deploying Hedera Smart Contract Service (HSCS) contracts to automate project management, verification, and trading processes with minimal human intervention, reducing administrative overhead.
> - **Transparent Marketplace:** Providing a secure, efficient, and transparent marketplace for trading these tokenized credits, connecting project developers directly with global buyers.
> - **Stakeholder Integration:** Fostering a unified, collaborative ecosystem that connects local communities, authorities, investors, verifiers, and end buyers.

## 🎥 Live Demo

> **[IMPORTANT]** Please replace `[Link to your 3-minute video presentation]` with the actual link to your video presentation.

## 🏛️ Project Architecture

The application is built with a modern, decoupled architecture, ensuring scalability, security, and maintainability. It comprises distinct layers that interact to deliver a seamless decentralized experience:

> -   **Frontend Layer (Next.js dApp)**: Provides the user interface for all interactions, including project submission, verification, and marketplace trading. It integrates directly with user wallets via HashConnect for secure on-chain actions and communicates with the Backend API for off-chain data.
> -   **Backend Services Layer (Django REST API)**: Acts as the central data management layer, handling user accounts, roles, project details, and off-chain marketplace data. It records the outcomes of on-chain Hedera events and provides robust API endpoints for the frontend.
> -   **Hedera SDK Integration Layer**: Facilitates direct interaction with the Hedera network using various SDK services (HTS, HCS, HSCS) for tokenization, consensus, and smart contract execution.
> -   **Hedera Network Layer**: The underlying blockchain infrastructure providing high throughput, fast finality, and enterprise-grade security for all on-chain operations.
> -   **IPFS (Decentralized Storage)**: Utilized for secure and immutable storage of project documents and metadata, ensuring data integrity and availability.

> **Data Flow & Security Highlights:**
User interactions flow from the Frontend, through secure wallet connections, to Hedera for blockchain operations, or to the Backend for data management. Critical operations leverage Hedera's native security features, smart contract access controls, and client-side transaction signing to ensure no private keys are exposed.

```
┌─────────────────────────────────────────────────────────────┐
│                 CarbonChain-Africa Platform                 │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  ┌─────────────────┐         ┌──────────────────────────┐   │
│  │    Frontend     │◄────────┤         Backend          │   │
│  │  (Next.js dApp) │         │   (Django REST API)      │   │
│  │                 │         │                          │   │
│  │ • User Interface│         │ • User Management        │   │
│  │ • Wallet Connect│         │ • Project Data Mgmt      │   │
│  │ • Marketplace   │         │ • Listing Data Mgmt      │   │
│  └─────────────────┘         └──────────────────────────┘   │
│           │                              │                  │
│           └──────────────┬───────────────┘                  │
│                          │                                  │
│  ┌───────────────────────▼──────────────────────────────┐   │
│  │                    Hedera Network                    │   │
│  │                                                      │   │
│  │ ┌─────────────────┐ ┌──────────────────────────────┐ │   │
│  │ │      IPFS       │ │       Smart Contracts        │ │   │
│  │ │                 │ │                              │ │   │
│  │ │ • Doc Storage   │ │ • CarbonCreditNFT            │ │   │
│  │ │ • Metadata      │ │ • CarbonProjectEscrow        │ │   │
│  │ └─────────────────┘ │ • CarbonCreditMarketplace    │ │   │
│  │                     │ • Helper Contracts (HTS, etc)│ │   │
│  │                     └──────────────────────────────┘ │   │
│  └──────────────────────────────────────────────────────┘   │
│                                                             │
│  ┌────────────────────────────────────────────────────────┐   │
│  │                     Database                           │   │
│  │              (PostgreSQL/SQLite)                       │   │
│  └────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────┘
```

## 💡 Application Workflow

> 1.  **Project Submission**: A project developer (Seller) submits their project details and documents via the dApp. The documents are uploaded to IPFS, and a submission transaction is sent to the `CarbonProjectEscrow` smart contract.
> 2.  **Verification**: A designated Verifier reviews the project on their dashboard. If approved, they trigger a transaction that tells the escrow contract to proceed.
> 3.  **Tokenization (Minting)**: The escrow contract automatically calls the `CarbonCreditNFT` contract, which mints a unique NFT representing the project's carbon tonnage. This NFT is transferred to the Seller's wallet.
> 4.  **Marketplace Listing**: The Seller lists their NFT for sale on the marketplace. This involves depositing the NFT into the `CarbonCreditMarketplace` contract.
> 5.  **Purchase**: A Buyer discovers the project and purchases the NFT directly from the marketplace contract.
> 6.  **Settlement**: The NFT is transferred to the Buyer, and the Seller can claim their proceeds from the sale.

## 🚀 Getting Started

To get CarbonChain-Africa up and running, follow these steps:

### Prerequisites

- Node.js (v18.17+ or v20+)
- Python (3.10, 3.11, or 3.12)
- A registered Hedera testnet account
- HashConnect wallet extension (e.g., Blade, HashPack)
- Git

### Backend Setup

Refer to the [Backend README](./backend/README.md) for detailed setup and installation instructions, including environment variable configuration and running the Django server.

### Frontend Setup

Refer to the [Frontend README](./frontend/README.md) for detailed setup and installation instructions, including environment variable configuration, smart contract deployment, and running the Next.js development server.


## 🛠️ Technology Stack

> - **Blockchain**: Hedera (Smart Contracts, HTS, HCS, HSCS)
> - **Frontend**: Next.js, React, TypeScript, TailwindCSS, Radix UI, Redux Toolkit, Ethers.js, HashConnect, Axios
> - **Backend**: Django, Django REST Framework, Python 3.10+, PostgreSQL/SQLite, JWT (djangorestframework_simplejwt)
> - **Decentralized Storage**: IPFS
> - **Authentication**: JWT (Backend) & HashConnect (Hedera)

## 💰 Revenue Streams & Business Model

CarbonChain-Africa is designed with a sustainable business model to ensure its long-term viability and impact:

> -   **Marketplace Transaction Fee (On-chain)**: A percentage-based fee (`feePercent` defined in `CarbonCreditMarketplace.sol`) is automatically deducted from the sale proceeds when a seller claims funds after a successful NFT sale. This ensures a direct and transparent revenue stream for the platform.
> -   **Credit Certification Fees**: Pricing for project submission, token minting, and verification report integration, with differentiated rates based on project complexity and scale.
> -   **Premium Services**: Advanced offerings could include real-time auditing, customized reporting, and enhanced integration with international carbon markets.
> -   **Strategic Partnerships**: Collaboration with NGOs, financial institutions, and regulatory bodies to secure grants and pilot project funding opportunities.

## 🏆 Hackathon Tracks

This project aligns with the following Hedera Africa Hackathon tracks:
> - **DeFi & Payments**: By creating a new financial primitive (tokenized carbon credits) and a marketplace for their exchange.
> - **Sustainability & ESG**: By directly addressing environmental sustainability and providing a transparent mechanism for ESG-conscious buyers.
> - **Web3 Infrastructure**: By building a foundational platform for the African carbon market on Web3 rails.
