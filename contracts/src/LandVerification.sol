// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "@openzeppelin/contracts/access/AccessControl.sol";

/**
 * @title LandVerification
 * @dev Manages verifier roles and dispute resolution for land registry
 * @notice This contract handles government verifier management and disputes
 */
contract LandVerification is AccessControl {
    
    // Roles
    bytes32 public constant SUPER_ADMIN_ROLE = keccak256("SUPER_ADMIN_ROLE");
    bytes32 public constant VERIFIER_ROLE = keccak256("VERIFIER_ROLE");
    
    // Verifier information
    struct Verifier {
        address verifierAddress;
        string name;
        string governmentId;
        string jurisdiction;
        bool isActive;
        uint256 addedAt;
        uint256 verificationCount;
    }
    
    // Dispute information
    struct Dispute {
        uint256 landTokenId;
        address disputedBy;
        string reason;
        uint256 createdAt;
        bool isResolved;
        address resolvedBy;
        uint256 resolvedAt;
        string resolution;
    }
    
    // Mappings
    mapping(address => Verifier) private _verifiers;
    mapping(uint256 => Dispute) private _disputes;
    
    // Arrays for iteration
    address[] private _verifierAddresses;
    uint256[] private _disputeIds;
    
    // Counters
    uint256 private _disputeIdCounter;
    
    // Events
    event VerifierAdded(
        address indexed verifierAddress,
        string name,
        string jurisdiction
    );
    
    event VerifierRemoved(
        address indexed verifierAddress,
        uint256 timestamp
    );
    
    event VerifierDeactivated(
        address indexed verifierAddress,
        uint256 timestamp
    );
    
    event VerifierReactivated(
        address indexed verifierAddress,
        uint256 timestamp
    );
    
    event DisputeCreated(
        uint256 indexed disputeId,
        uint256 indexed landTokenId,
        address indexed disputedBy,
        string reason
    );
    
    event DisputeResolved(
        uint256 indexed disputeId,
        address indexed resolvedBy,
        string resolution
    );
    
    /**
     * @dev Constructor
     */
    constructor() {
        _grantRole(DEFAULT_ADMIN_ROLE, msg.sender);
        _grantRole(SUPER_ADMIN_ROLE, msg.sender);
    }
    
    /**
     * @dev Add a new verifier
     * @param verifierAddress Address of the verifier
     * @param name Name of the verifier
     * @param governmentId Government ID of the verifier
     * @param jurisdiction Jurisdiction area
     */
    function addVerifier(
        address verifierAddress,
        string memory name,
        string memory governmentId,
        string memory jurisdiction
    ) public onlyRole(SUPER_ADMIN_ROLE) {
        require(verifierAddress != address(0), "Invalid address");
        require(!hasRole(VERIFIER_ROLE, verifierAddress), "Already a verifier");
        require(bytes(name).length > 0, "Name cannot be empty");
        
        _verifiers[verifierAddress] = Verifier({
            verifierAddress: verifierAddress,
            name: name,
            governmentId: governmentId,
            jurisdiction: jurisdiction,
            isActive: true,
            addedAt: block.timestamp,
            verificationCount: 0
        });
        
        _verifierAddresses.push(verifierAddress);
        _grantRole(VERIFIER_ROLE, verifierAddress);
        
        emit VerifierAdded(verifierAddress, name, jurisdiction);
    }
    
    /**
     * @dev Remove a verifier
     * @param verifierAddress Address of the verifier to remove
     */
    function removeVerifier(address verifierAddress) 
        public 
        onlyRole(SUPER_ADMIN_ROLE) 
    {
        require(hasRole(VERIFIER_ROLE, verifierAddress), "Not a verifier");
        
        _revokeRole(VERIFIER_ROLE, verifierAddress);
        _verifiers[verifierAddress].isActive = false;
        
        emit VerifierRemoved(verifierAddress, block.timestamp);
    }
    
    /**
     * @dev Deactivate a verifier (temporary)
     * @param verifierAddress Address of the verifier
     */
    function deactivateVerifier(address verifierAddress) 
        public 
        onlyRole(SUPER_ADMIN_ROLE) 
    {
        require(hasRole(VERIFIER_ROLE, verifierAddress), "Not a verifier");
        require(_verifiers[verifierAddress].isActive, "Already inactive");
        
        _verifiers[verifierAddress].isActive = false;
        
        emit VerifierDeactivated(verifierAddress, block.timestamp);
    }
    
    /**
     * @dev Reactivate a verifier
     * @param verifierAddress Address of the verifier
     */
    function reactivateVerifier(address verifierAddress) 
        public 
        onlyRole(SUPER_ADMIN_ROLE) 
    {
        require(hasRole(VERIFIER_ROLE, verifierAddress), "Not a verifier");
        require(!_verifiers[verifierAddress].isActive, "Already active");
        
        _verifiers[verifierAddress].isActive = true;
        
        emit VerifierReactivated(verifierAddress, block.timestamp);
    }
    
    /**
     * @dev Create a dispute for a land parcel
     * @param landTokenId Token ID of the disputed land
     * @param reason Reason for the dispute
     * @return disputeId The ID of the created dispute
     */
    function createDispute(uint256 landTokenId, string memory reason) 
        public 
        returns (uint256) 
    {
        require(bytes(reason).length > 0, "Reason cannot be empty");
        
        uint256 disputeId = _disputeIdCounter++;
        
        _disputes[disputeId] = Dispute({
            landTokenId: landTokenId,
            disputedBy: msg.sender,
            reason: reason,
            createdAt: block.timestamp,
            isResolved: false,
            resolvedBy: address(0),
            resolvedAt: 0,
            resolution: ""
        });
        
        _disputeIds.push(disputeId);
        
        emit DisputeCreated(disputeId, landTokenId, msg.sender, reason);
        
        return disputeId;
    }
    
    /**
     * @dev Resolve a dispute
     * @param disputeId ID of the dispute
     * @param resolution Resolution details
     */
    function resolveDispute(uint256 disputeId, string memory resolution) 
        public 
        onlyRole(VERIFIER_ROLE) 
    {
        require(disputeId < _disputeIdCounter, "Dispute does not exist");
        require(!_disputes[disputeId].isResolved, "Dispute already resolved");
        require(bytes(resolution).length > 0, "Resolution cannot be empty");
        
        _disputes[disputeId].isResolved = true;
        _disputes[disputeId].resolvedBy = msg.sender;
        _disputes[disputeId].resolvedAt = block.timestamp;
        _disputes[disputeId].resolution = resolution;
        
        emit DisputeResolved(disputeId, msg.sender, resolution);
    }
    
    /**
     * @dev Increment verification count for a verifier
     * @param verifierAddress Address of the verifier
     */
    function incrementVerificationCount(address verifierAddress) 
        external 
        onlyRole(VERIFIER_ROLE) 
    {
        require(hasRole(VERIFIER_ROLE, verifierAddress), "Not a verifier");
        _verifiers[verifierAddress].verificationCount++;
    }
    
    /**
     * @dev Get verifier details
     * @param verifierAddress Address of the verifier
     * @return Verifier information
     */
    function getVerifier(address verifierAddress) 
        public 
        view 
        returns (Verifier memory) 
    {
        require(hasRole(VERIFIER_ROLE, verifierAddress), "Not a verifier");
        return _verifiers[verifierAddress];
    }
    
    /**
     * @dev Get all verifiers
     * @return Array of verifier addresses
     */
    function getAllVerifiers() public view returns (address[] memory) {
        return _verifierAddresses;
    }
    
    /**
     * @dev Check if a verifier is active
     * @param verifierAddress Address to check
     * @return bool True if active
     */
    function isActiveVerifier(address verifierAddress) 
        public 
        view 
        returns (bool) 
    {
        return hasRole(VERIFIER_ROLE, verifierAddress) && 
               _verifiers[verifierAddress].isActive;
    }
    
    /**
     * @dev Get dispute details
     * @param disputeId ID of the dispute
     * @return Dispute information
     */
    function getDispute(uint256 disputeId) 
        public 
        view 
        returns (Dispute memory) 
    {
        require(disputeId < _disputeIdCounter, "Dispute does not exist");
        return _disputes[disputeId];
    }
    
    /**
     * @dev Get all dispute IDs
     * @return Array of dispute IDs
     */
    function getAllDisputes() public view returns (uint256[] memory) {
        return _disputeIds;
    }
    
    /**
     * @dev Get pending disputes
     * @return Array of pending dispute IDs
     */
    function getPendingDisputes() public view returns (uint256[] memory) {
        uint256 pendingCount = 0;
        
        // Count pending disputes
        for (uint256 i = 0; i < _disputeIds.length; i++) {
            if (!_disputes[_disputeIds[i]].isResolved) {
                pendingCount++;
            }
        }
        
        // Create array of pending dispute IDs
        uint256[] memory pending = new uint256[](pendingCount);
        uint256 index = 0;
        
        for (uint256 i = 0; i < _disputeIds.length; i++) {
            if (!_disputes[_disputeIds[i]].isResolved) {
                pending[index] = _disputeIds[i];
                index++;
            }
        }
        
        return pending;
    }
}
