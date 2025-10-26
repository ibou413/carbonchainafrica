// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CarbonCreditNFT.sol";
import "./HederaTokenService.sol";
import "./HederaResponseCodes.sol";

// Interface pour interagir avec le contrat CarbonCreditNFT
interface ICarbonCreditNFT {
    function transferCredit(address receiver, int64 serialNumber) external returns (int);
}

contract CarbonCreditMarketplace is HederaTokenService {

    struct Listing {
        address seller;
        uint256 price; // in tinybars
        bool active;
        bool claimed; // Has the seller claimed their proceeds?
    }

    // Adresse du contrat NFT
    ICarbonCreditNFT public immutable carbonCreditNFT;
    address public nftTokenAddress;

    // Adresse pour collecter les frais de service
    address payable public feeAddress;
    uint256 public feePercent; // Example: 5 for 5%
    address public owner;
    address public escrowAddress;

    // Mapping de l'ID du NFT (serial number) vers sa mise en vente
    mapping(int64 => Listing) public listings;

    event CreditListed(int64 indexed serialNumber, address indexed seller, uint256 price);
    event CreditSold(int64 indexed serialNumber, address indexed seller, address indexed buyer, uint256 price);
    event CreditWithdrawn(int64 indexed serialNumber);
    event ProceedsClaimed(int64 indexed serialNumber, address indexed seller, uint256 amount);
    event TreasuryTransfer(address indexed to, int64 indexed serialNumber);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    modifier onlyEscrow() {
        require(msg.sender == escrowAddress, "Only Escrow can call this function");
        _;
    }

    constructor(address _nftContractAddress, address payable _feeAddress, uint256 _feePercent, address _escrowAddress) {
        owner = msg.sender;
        carbonCreditNFT = ICarbonCreditNFT(_nftContractAddress);
        feeAddress = _feeAddress;
        feePercent = _feePercent;
        escrowAddress = _escrowAddress;
    }

    function updateNftTokenAddress(address _newTokenAddress) external onlyOwner {
        nftTokenAddress = _newTokenAddress;
    }

    /**
     * @dev Transfers a newly minted NFT from the treasury (this contract) to the project proposer.
     * Can only be called by the Escrow contract.
     */
    function transferFromTreasury(address receiver, int64 serialNumber) external onlyEscrow {
        // Transfère le NFT DU CONTRAT (trésorier) vers le receveur
        int responseCode = HederaTokenService.transferNFT(nftTokenAddress, address(this), receiver, serialNumber);
        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert("Marketplace: Failed to transfer NFT from treasury");
        }
        emit TreasuryTransfer(receiver, serialNumber);
    }

    /**
     * @dev Associates the marketplace contract with a given token address.
     */
    function associateWithToken(address tokenAddress) external onlyOwner {
        int response = HederaTokenService.associateToken(address(this), tokenAddress);
        if (response != HederaResponseCodes.SUCCESS) {
            revert("Association failed");
        }
    }

    /**
     * @dev Met en vente un crédit carbone NFT qui a DEJA ETE DEPOSE dans ce contrat.
     * Le vendeur est enregistré comme le propriétaire initial qui a déposé le token.
     */
    function listDepositedCredit(int64 serialNumber, uint256 price) external {
        // The caller must be the one who deposited the token, but since the token is held
        // by the contract, we trust the caller is the legitimate seller who deposited it.
        // A more advanced implementation could track depositors.
        require(price > 0, "Price must be greater than zero");

        listings[serialNumber] = Listing({
            seller: msg.sender, // Use the caller as the seller
            price: price,
            active: true,
            claimed: false
        });

        emit CreditListed(serialNumber, msg.sender, price);
    }

    /**
     * @dev Achète un crédit carbone NFT listé. L'acheteur reçoit le NFT,
     * et les fonds sont conservés dans le contrat jusqu'à ce que le vendeur les réclame.
     */
    function buyCredit(int64 serialNumber) external payable {
        Listing storage listing = listings[serialNumber];
        require(listing.active, "Listing is not active");
        require(msg.value >= listing.price, "Insufficient payment sent");

        // Mark the sale as inactive to prevent re-selling
        listing.active = false;

        // Refund any overpayment to the buyer immediately
        if (msg.value > listing.price) {
            (bool refundSent, ) = payable(msg.sender).call{value: msg.value - listing.price}("");
            require(refundSent, "Marketplace: Failed to send refund");
        }

        // Transfer the NFT from this contract to the buyer
        int responseCode = HederaTokenService.transferNFT(nftTokenAddress, address(this), msg.sender, serialNumber);
        if (responseCode != HederaResponseCodes.SUCCESS) {
            // If NFT transfer fails, revert the whole transaction to return the buyer's funds
            revert("Marketplace: Failed to transfer NFT to buyer");
        }

        emit CreditSold(serialNumber, listing.seller, msg.sender, listing.price);
    }

    /**
     * @dev Permet au vendeur de réclamer les fonds d'une vente conclue.
     */
    function claimProceeds(int64 serialNumber) external {
        Listing storage listing = listings[serialNumber];
        require(!listing.active, "Listing must be sold to claim proceeds");
        require(!listing.claimed, "Proceeds already claimed");
        require(msg.sender == listing.seller, "Only the seller can claim proceeds");

        listing.claimed = true;

        // Calculate proceeds and fees
        uint256 fee = (listing.price * feePercent) / 100;
        uint256 sellerProceeds = listing.price - fee;

        // Send funds
        (bool feeSent, ) = feeAddress.call{value: fee}("");
        require(feeSent, "Marketplace: Failed to send fee");

        (bool sellerSent, ) = payable(listing.seller).call{value: sellerProceeds}("");
        require(sellerSent, "Marketplace: Failed to send proceeds to seller");

        emit ProceedsClaimed(serialNumber, listing.seller, sellerProceeds);
    }

    /**
     * @dev Permet à un vendeur de retirer un NFT invendu.
     */
    function withdrawCredit(int64 serialNumber) external {
        Listing storage listing = listings[serialNumber];
        require(listing.active, "Listing is not active");
        require(listing.seller == msg.sender, "Only the seller can withdraw");

        listing.active = false;

        // Transfère le NFT du contrat vers le vendeur
        int responseCode = HederaTokenService.transferNFT(nftTokenAddress, address(this), msg.sender, serialNumber);
        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert("Marketplace: Failed to withdraw NFT");
        }

        emit CreditWithdrawn(serialNumber);
    }

    // --- Test function ---
    function echoHbar() external payable {
        require(msg.value > 0, "Must send some Hbar");
        (bool sent, ) = msg.sender.call{value: msg.value}("");
        require(sent, "Echo failed");
    }

    // --- Fonctions de gestion des frais ---
    function setFeeAddress(address payable _newFeeAddress) external {
        // Ajouter une logique de contrôle d'accès (ex: onlyAdmin)
        feeAddress = _newFeeAddress;
    }

    function setFeePercent(uint256 _newFeePercent) external {
        // Ajouter une logique de contrôle d'accès
        require(_newFeePercent <= 100, "Fee cannot exceed 100%");
        feePercent = _newFeePercent;
    }

    // Fallback function to receive Hbar
    receive() external payable {}
}