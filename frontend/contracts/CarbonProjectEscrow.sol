// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

import "./CarbonCreditNFT.sol";

interface IMarketplace {
    function transferFromTreasury(address receiver, int64 serialNumber) external;
}

contract CarbonProjectEscrow {
    enum ProjectState { Pending, Approved, Rejected }

    struct Project {
        uint256 id;
        address proposer;
        string metadataCid;
        uint256 verificationFee;
        uint256 tokenizationFee;
        ProjectState state;
    }

    CarbonCreditNFT public nftContract;
    IMarketplace public marketplaceContract;
    address public verifierAddress;
    address public registryAddress; // Address to receive tokenization fees

    mapping(uint256 => Project) public projects;
    uint256 public nextProjectId;

    event ProjectSubmitted(
        uint256 indexed projectId,
        address indexed proposer,
        string metadataCid,
        uint256 verificationFee,
        uint256 tokenizationFee
    );
    event ProjectReviewed(
        uint256 indexed projectId,
        ProjectState state,
        int64 serialNumber
    );
    event DebugAddresses(address sender, address registry);
    event EscrowDebug(string message);

    modifier onlyVerifier() {
        require(msg.sender == verifierAddress, "Only Verifier can call this function");
        _;
    }

    constructor(address _nftContractAddress) {
        nftContract = CarbonCreditNFT(_nftContractAddress);
        verifierAddress = msg.sender;
        registryAddress = msg.sender;
        nextProjectId = 1;
    }

    function setMarketplaceContract(address _marketplaceAddress) external onlyVerifier {
        marketplaceContract = IMarketplace(_marketplaceAddress);
    }

    function initCollection(string memory name, string memory symbol, string memory memo, int64 maxSupply) external payable returns (address) {
        emit DebugAddresses(msg.sender, registryAddress);
        require(msg.sender == registryAddress, "Only Registry can initialize the collection");
        address tokenAddress = nftContract.createNftCollection{value: msg.value}(name, symbol, memo, maxSupply);
        return tokenAddress;
    }

    function submitProject(string memory _metadataCid, uint256 _tokenizationFee) external payable returns (uint256) {
        require(msg.value == _tokenizationFee, "Incorrect tokenization fee amount sent");

        // Store project details and hold tokenization fee in escrow
        uint256 projectId = nextProjectId++;
        projects[projectId] = Project(
            projectId,
            msg.sender,
            _metadataCid,
            0, // No verification fee
            _tokenizationFee,
            ProjectState.Pending
        );

        emit ProjectSubmitted(projectId, msg.sender, _metadataCid, 0, _tokenizationFee);
        return projectId;
    }

    function reviewProject(uint256 _projectId, bool _approved) external onlyVerifier returns (int64, address) {
        Project storage project = projects[_projectId];
        require(project.state == ProjectState.Pending, "Project already reviewed");

        int64 mintedSerialNumber = 0;
        address tokenAddress = address(0);

        if (_approved) {
            emit EscrowDebug("reviewProject: starting approval");
            project.state = ProjectState.Approved;

            // Transfer the tokenization fee to the registry
            (bool sent, ) = registryAddress.call{value: project.tokenizationFee}("");
            require(sent, "Failed to send tokenization fee to registry");
            emit EscrowDebug("reviewProject: fee sent");

            // Mint the carbon credit NFT via the NFT contract
            bytes[] memory metadata = new bytes[](1);
            metadata[0] = bytes(project.metadataCid);
            (mintedSerialNumber, tokenAddress) = nftContract.mintCredit(metadata);
            emit EscrowDebug("reviewProject: mintCredit called");

            // Transfer the newly minted NFT to the project proposer
            nftContract.transferCredit(project.proposer, mintedSerialNumber);
            emit EscrowDebug("reviewProject: transferFromTreasury called");

        } else {
            project.state = ProjectState.Rejected;

            // Refund the tokenization fee to the project proposer
            (bool sent, ) = project.proposer.call{value: project.tokenizationFee}("");
            require(sent, "Failed to refund tokenization fee");
        }

        emit ProjectReviewed(_projectId, project.state, mintedSerialNumber);
        return (mintedSerialNumber, tokenAddress);
    }

    // Fallback function to receive Hbar
    receive() external payable {}
}