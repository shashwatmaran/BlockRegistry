// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title LandRegistry
 * @dev ERC-721 based land registry system with verification workflow
 * @notice This contract manages land parcels as NFTs with government verification
 */
contract LandRegistry is ERC721URIStorage, AccessControl {
    
    // Roles
    bytes32 public constant ADMIN_ROLE = keccak256("ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Required number of verifications before minting
    uint256 public constant REQUIRED_VERIFICATIONS = 3;
    
    // Token ID counter (replaces Counters library)
    uint256 private _nextTokenId;
    
    // Land verification status
    enum VerificationStatus {
        Pending,
        Verified,
        Rejected
    }
    
    // Land metadata structure
    struct LandMetadata {
        string propertyId;         // Unique property identifier (14 chars)
        string ipfsHash;           // IPFS hash of land documents
        uint256 area;              // Area in square meters
        uint256 price;             // Price in wei
        string location;           // Location coordinates or address
        address currentOwner;      // Current owner address
        VerificationStatus status; // Verification status
        uint256 registeredAt;      // Registration timestamp
        uint256 verifiedAt;        // Verification timestamp
        address verifiedBy;        // Verifier address
    }
    
    // Mapping from token ID to land metadata
    mapping(uint256 => LandMetadata) private _landMetadata;
    
    // Mapping to track if a property ID is already registered
    mapping(string => bool) private _isPropertyRegistered;
    
    // Mapping from owner to list of owned token IDs
    mapping(address => uint256[]) private _ownedLands;
    
    // Mapping to track number of verifications per token
    mapping(uint256 => uint256) private _verificationCounts;
    
    // Mapping to track which validator verified which token
    mapping(uint256 => mapping(address => bool)) private _hasVerified;
    
    // Events
    event LandRegistered(
        uint256 indexed tokenId,
        address indexed owner,
        string propertyId,
        string ipfsHash,
        uint256 area,
        uint256 price
    );
    
    event LandVerified(
        uint256 indexed tokenId,
        address indexed verifier,
        uint256 timestamp
    );
    
    event LandRejected(
        uint256 indexed tokenId,
        address indexed verifier,
        string reason
    );
    
    event LandTransferred(
        uint256 indexed tokenId,
        address indexed from,
        address indexed to,
        uint256 timestamp
    );
    
    event MetadataUpdated(
        uint256 indexed tokenId,
        string newIpfsHash
    );
    
    /**
     * @dev Constructor to initialize the contract
     */
    constructor() ERC721("LandRegistry", "LAND") {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(ADMIN_ROLE, msg.sender);
        _grantRole(VERIFIER_ROLE, msg.sender);
    }
    
    /**
     * @dev Register a new land parcel
     * @param propertyId Unique 14-character alphanumeric ID
     * @param ipfsHash IPFS hash containing land documents
     * @param area Area of land in square meters
     * @param price Price of land in wei
     * @param location Location coordinates or address
     * @return tokenId The ID of the newly minted land NFT
     */
    function registerLand(
        string memory propertyId,
        string memory ipfsHash,
        uint256 area,
        uint256 price,
        string memory location
    ) public returns (uint256) {
        require(bytes(propertyId).length == 14, "Property ID must be exactly 14 characters");
        require(!_isPropertyRegistered[propertyId], "Property ID is already registered");
        require(bytes(ipfsHash).length > 0, "IPFS hash cannot be empty");
        require(area > 0, "Area must be greater than 0");
        
        uint256 tokenId = _nextTokenId++;
        
        // Mark property as registered to prevent duplicates
        _isPropertyRegistered[propertyId] = true;
        
        // Token is NOT minted yet; it will be minted after 3 verifications
        // _safeMint and _setTokenURI are delayed to verifyLand
        
        // Store land metadata
        _landMetadata[tokenId] = LandMetadata({
            propertyId: propertyId,
            ipfsHash: ipfsHash,
            area: area,
            price: price,
            location: location,
            currentOwner: msg.sender,
            status: VerificationStatus.Pending,
            registeredAt: block.timestamp,
            verifiedAt: 0,
            verifiedBy: address(0)
        });
        
        // Add to owner's land list
        _ownedLands[msg.sender].push(tokenId);
        
        emit LandRegistered(tokenId, msg.sender, propertyId, ipfsHash, area, price);
        
        return tokenId;
    }
    
    /**
     * @dev Verify a land parcel (only verifiers)
     * @param tokenId ID of the land to verify
     */
    function verifyLand(uint256 tokenId, address verifierAddress) public onlyRole(VERIFIER_ROLE) {
        require(_landMetadata[tokenId].currentOwner != address(0), "Land does not exist");
        require(
            _landMetadata[tokenId].status == VerificationStatus.Pending,
            "Land is not pending verification"
        );
        require(!_hasVerified[tokenId][verifierAddress], "You have already verified this land");
        
        _hasVerified[tokenId][verifierAddress] = true;
        _verificationCounts[tokenId]++;
        
        if (_verificationCounts[tokenId] == REQUIRED_VERIFICATIONS) {
            // Mint NFT to the owner finally
            _safeMint(_landMetadata[tokenId].currentOwner, tokenId);
            _setTokenURI(tokenId, _landMetadata[tokenId].ipfsHash);
            
            _landMetadata[tokenId].status = VerificationStatus.Verified;
            _landMetadata[tokenId].verifiedAt = block.timestamp;
            _landMetadata[tokenId].verifiedBy = verifierAddress;
            
            emit LandVerified(tokenId, verifierAddress, block.timestamp);
        } else {
            // Partial Verification
            _landMetadata[tokenId].verifiedBy = verifierAddress;
        }
    }
    
    /**
     * @dev Reject a land parcel (only verifiers)
     * @param tokenId ID of the land to reject
     * @param reason Reason for rejection
     */
    function rejectLand(uint256 tokenId, string memory reason) 
        public 
        onlyRole(VERIFIER_ROLE) 
    {
        require(_landMetadata[tokenId].currentOwner != address(0), "Land does not exist");
        require(
            _landMetadata[tokenId].status == VerificationStatus.Pending,
            "Land is not pending verification"
        );
        
        _landMetadata[tokenId].status = VerificationStatus.Rejected;
        
        emit LandRejected(tokenId, msg.sender, reason);
    }
    
    /**
     * @dev Transfer land ownership (only verified lands can be transferred)
     * @param to Address of the new owner
     * @param tokenId ID of the land to transfer
     */
    function transferLand(address to, uint256 tokenId) public {
        require(_landMetadata[tokenId].currentOwner == msg.sender, "You are not the owner");
        require(
            _landMetadata[tokenId].status == VerificationStatus.Verified,
            "Only verified lands can be transferred"
        );
        
        address from = msg.sender;
        
        // Remove from previous owner's list
        _removeFromOwnedLands(from, tokenId);
        
        // Add to new owner's list
        _ownedLands[to].push(tokenId);
        
        // Update current owner in metadata
        _landMetadata[tokenId].currentOwner = to;
        
        // Transfer the NFT
        _transfer(from, to, tokenId);
        
        emit LandTransferred(tokenId, from, to, block.timestamp);
    }
    
    /**
     * @dev Update land metadata IPFS hash (only owner)
     * @param tokenId ID of the land
     * @param newIpfsHash New IPFS hash
     */
    function updateMetadata(uint256 tokenId, string memory newIpfsHash) 
        public 
    {
        require(_landMetadata[tokenId].currentOwner == msg.sender, "You are not the owner");
        require(bytes(newIpfsHash).length > 0, "IPFS hash cannot be empty");
        
        _landMetadata[tokenId].ipfsHash = newIpfsHash;
        if (_landMetadata[tokenId].status == VerificationStatus.Verified) {
            _setTokenURI(tokenId, newIpfsHash);
        }
        
        emit MetadataUpdated(tokenId, newIpfsHash);
    }
    
    /**
     * @dev Get land details
     * @param tokenId ID of the land
     * @return Land metadata
     */
    function getLandDetails(uint256 tokenId) 
        public 
        view 
        returns (LandMetadata memory) 
    {
        require(_landMetadata[tokenId].currentOwner != address(0), "Land does not exist");
        return _landMetadata[tokenId];
    }
    
    /**
     * @dev Get total number of verifications for a land
     * @param tokenId ID of the land
     * @return Number of verifications
     */
    function getVerificationCount(uint256 tokenId) public view returns (uint256) {
        return _verificationCounts[tokenId];
    }
    
    /**
     * @dev Get all lands owned by an address
     * @param owner Address of the owner
     * @return Array of token IDs
     */
    function getOwnerLands(address owner) 
        public 
        view 
        returns (uint256[] memory) 
    {
        return _ownedLands[owner];
    }
    
    /**
     * @dev Get total number of registered lands
     * @return Total count
     */
    function getTotalLands() public view returns (uint256) {
        return _nextTokenId;
    }
    
    /**
     * @dev Internal function to remove token from owner's list
     * @param owner Address of the owner
     * @param tokenId ID of the token to remove
     */
    function _removeFromOwnedLands(address owner, uint256 tokenId) private {
        uint256[] storage lands = _ownedLands[owner];
        for (uint256 i = 0; i < lands.length; i++) {
            if (lands[i] == tokenId) {
                lands[i] = lands[lands.length - 1];
                lands.pop();
                break;
            }
        }
    }
    
    /**
     * @dev Override required by Solidity for multiple inheritance
     */
    function supportsInterface(bytes4 interfaceId)
        public
        view
        override(ERC721URIStorage, AccessControl)
        returns (bool)
    {
        return super.supportsInterface(interfaceId);
    }
}
