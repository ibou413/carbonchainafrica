
pragma solidity ^0.8.0;

import "./HederaTokenService.sol";
import "./HederaResponseCodes.sol";
import "./ExpiryHelper.sol";

contract CarbonCreditNFT is ExpiryHelper {
    address public owner; // The Escrow contract that will control minting
    address public tokenAddress;

    event NftCollectionCreated(address indexed tokenAddress);
    event CreditMinted(address indexed tokenAddress, int64 indexed serialNumber);
    event NftCreationDebug(int responseCode);

    modifier onlyOwner() {
        require(msg.sender == owner, "Only owner can call this function");
        _;
    }

    constructor() {
        owner = msg.sender; // Temporarily set owner to deployer
    }

    // Function to transfer ownership to the Escrow contract
    function transferOwnership(address newOwner) external onlyOwner {
        owner = newOwner;
    }

    function createNftCollection(
        string memory name,
        string memory symbol,
        string memory memo,
        int64 maxSupply
    ) external payable onlyOwner returns (address) {
        require(tokenAddress == address(0), "Collection already created");

        IHederaTokenService.TokenKey[] memory keys = new IHederaTokenService.TokenKey[](1);
        // Set this contract as the SUPPLY key to allow minting
        keys[0] = getSingleKey(KeyType.SUPPLY, KeyValueType.CONTRACT_ID, address(this));

        IHederaTokenService.HederaToken memory token;
        token.name = name;
        token.symbol = symbol;
        token.memo = memo;
        token.treasury = address(this); // The contract holds the tokens initially
        token.tokenSupplyType = true; // FINITE
        token.maxSupply = maxSupply;
        token.tokenKeys = keys;

        (int responseCode, address createdTokenAddress) = HederaTokenService.createNonFungibleToken(token);

        emit NftCreationDebug(responseCode);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert("CarbonCreditNFT: Failed to create non-fungible token type");
        }

        tokenAddress = createdTokenAddress;
        emit NftCollectionCreated(createdTokenAddress);
        return createdTokenAddress;
    }

    function mintCredit(bytes[] memory metadata) external onlyOwner returns (int64, address) {
        require(tokenAddress != address(0), "Collection not created yet");
        (int responseCode, , int64[] memory serialNumbers) = HederaTokenService.mintToken(tokenAddress, 0, metadata);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert("CarbonCreditNFT: Failed to mint new credit token");
        }

        int64 newSerial = serialNumbers[0];
        emit CreditMinted(tokenAddress, newSerial);
        return (newSerial, tokenAddress);
    }

    function transferCredit(address receiver, int64 serialNumber) external onlyOwner returns (int) {
        require(tokenAddress != address(0), "Collection not created yet");

        // Call the transferNFT precompile
        int responseCode = HederaTokenService.transferNFT(tokenAddress, address(this), receiver, serialNumber);

        if (responseCode != HederaResponseCodes.SUCCESS) {
            revert("CarbonCreditNFT: Failed to transfer NFT from contract");
        }
        return responseCode;
    }
}
