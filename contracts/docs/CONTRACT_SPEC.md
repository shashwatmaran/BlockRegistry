# Land Registry Smart Contracts - Technical Specification

## Overview

The Land Registry system consists of two primary smart contracts that work together to manage land parcels as NFTs with government verification and dispute resolution.

---

## 1. LandRegistry.sol

### Purpose
ERC-721 based NFT contract for managing land parcels with a three-state verification workflow.

### Inheritance
- `ERC721URIStorage` - NFT functionality with URI storage
- `AccessControl` - Role-based permissions

### Contract Address
- **Sepolia Testnet:** TBD (deploy with `forge script`)
- **Verified on Etherscan:** TBD

---

### State Variables

```solidity
bytes32 public constant ADMIN_ROLE
bytes32 public constant VERIFIER_ROLE
uint256 private _nextTokenId
```

### Data Structures

#### VerificationStatus
```solidity
enum VerificationStatus {
    Pending,    // Initial state after registration
    Verified,   // Approved by government verifier
    Rejected    // Rejected by verifier
}
```

#### LandMetadata
```solidity
struct LandMetadata {
    string ipfsHash;           // IPFS document hash
    uint256 area;              // Area in square meters
    uint256 price;             // Price in wei
    string location;           // GPS coordinates
    address currentOwner;      // Current owner address
    VerificationStatus status; // Verification state
    uint256 registeredAt;      // Registration timestamp
    uint256 verifiedAt;        // Verification timestamp
    address verifiedBy;        // Verifier address
}
```

---

### Core Functions

#### registerLand()
**Signature:**
```solidity
function registerLand(
    string memory ipfsHash,
    uint256 area,
    uint256 price,
    string memory location
) public returns (uint256 tokenId)
```

**Purpose:** Register a new land parcel as NFT

**Access:** Public (any user)

**Validations:**
- IPFS hash cannot be empty
- Area must be greater than 0

**Effects:**
- Mints new NFT to caller
- Sets status to `Pending`
- Stores metadata
- Adds to owner's land list
- Emits `LandRegistered` event

**Gas Cost:** ~150,000 - 200,000 gas

---

#### verifyLand()
**Signature:**
```solidity
function verifyLand(uint256 tokenId) public onlyRole(VERIFIER_ROLE)
```

**Purpose:** Approve a pending land registration

**Access:** VERIFIER_ROLE only

**Validations:**
- Land must exist
- Status must be `Pending`

**Effects:**
- Sets status to `Verified`
- Records verifier address
- Records verification timestamp
- Emits `LandVerified` event

**Gas Cost:** ~50,000 gas

---

#### rejectLand()
**Signature:**
```solidity
function rejectLand(uint256 tokenId, string memory reason) public onlyRole(VERIFIER_ROLE)
```

**Purpose:** Reject a pending land registration

**Access:** VERIFIER_ROLE only

**Validations:**
- Land must exist
- Status must be `Pending`

**Effects:**
- Sets status to `Rejected`
- Emits `LandRejected` event with reason

**Gas Cost:** ~45,000 gas

---

#### transferLand()
**Signature:**
```solidity
function transferLand(address to, uint256 tokenId) public
```

**Purpose:** Transfer verified land to new owner

**Access:** Current owner only

**Validations:**
- Caller must be owner
- Land must be `Verified` status

**Effects:**
- Transfers NFT ownership
- Updates metadata currentOwner
- Updates owner land lists
- Emits `LandTransferred` event

**Gas Cost:** ~80,000 - 100,000 gas

---

#### updateMetadata()
**Signature:**
```solidity
function updateMetadata(uint256 tokenId, string memory newIpfsHash) public
```

**Purpose:** Update land documents (IPFS hash)

**Access:** Current owner only

**Validations:**
- Caller must be owner
- New IPFS hash cannot be empty

**Effects:**
- Updates IPFS hash in metadata
- Updates tokenURI
- Emits `MetadataUpdated` event

**Gas Cost:** ~35,000 gas

---

### View Functions

#### getLandDetails()
```solidity
function getLandDetails(uint256 tokenId) public view returns (LandMetadata memory)
```
Returns complete metadata for a land parcel.

#### getOwnerLands()
```solidity
function getOwnerLands(address owner) public view returns (uint256[] memory)
```
Returns array of token IDs owned by an address.

#### getTotalLands()
```solidity
function getTotalLands() public view returns (uint256)
```
Returns total number of registered lands.

---

### Events

```solidity
event LandRegistered(
    uint256 indexed tokenId,
    address indexed owner,
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
```

---

## 2. LandVerification.sol

### Purpose
Manages government verifiers and handles dispute resolution for the land registry system.

### Inheritance
- `AccessControl` - Role-based permissions

---

### State Variables

```solidity
bytes32 public constant SUPER_ADMIN_ROLE
bytes32 public constant VERIFIER_ROLE
uint256 private _disputeIdCounter
```

### Data Structures

#### Verifier
```solidity
struct Verifier {
    address verifierAddress;
    string name;
    string governmentId;
    string jurisdiction;
    bool isActive;
    uint256 addedAt;
    uint256 verificationCount;
}
```

#### Dispute
```solidity
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
```

---

### Core Functions

#### addVerifier()
**Signature:**
```solidity
function addVerifier(
    address verifierAddress,
    string memory name,
    string memory governmentId,
    string memory jurisdiction
) public onlyRole(SUPER_ADMIN_ROLE)
```

**Purpose:** Add new government verifier

**Access:** SUPER_ADMIN_ROLE only

**Validations:**
- Address cannot be zero
- Cannot be duplicate
- Name cannot be empty

**Gas Cost:** ~120,000 gas

---

#### removeVerifier()
**Signature:**
```solidity
function removeVerifier(address verifierAddress) public onlyRole(SUPER_ADMIN_ROLE)
```

**Purpose:** Permanently remove a verifier

**Access:** SUPER_ADMIN_ROLE only

**Gas Cost:** ~40,000 gas

---

#### deactivateVerifier() / reactivateVerifier()
**Purpose:** Temporarily disable/enable a verifier

**Access:** SUPER_ADMIN_ROLE only

**Gas Cost:** ~30,000 gas

---

#### createDispute()
**Signature:**
```solidity
function createDispute(uint256 landTokenId, string memory reason) public returns (uint256 disputeId)
```

**Purpose:** File a dispute against a land parcel

**Access:** Public (any user)

**Validations:**
- Reason cannot be empty

**Gas Cost:** ~70,000 gas

---

#### resolveDispute()
**Signature:**
```solidity
function resolveDispute(uint256 disputeId, string memory resolution) public onlyRole(VERIFIER_ROLE)
```

**Purpose:** Resolve a pending dispute

**Access:** VERIFIER_ROLE only

**Validations:**
- Dispute must exist
- Cannot be already resolved
- Resolution cannot be empty

**Gas Cost:** ~55,000 gas

---

### View Functions

#### getVerifier()
```solidity
function getVerifier(address verifierAddress) public view returns (Verifier memory)
```

#### getAllVerifiers()
```solidity
function getAllVerifiers() public view returns (address[] memory)
```

#### isActiveVerifier()
```solidity
function isActiveVerifier(address verifierAddress) public view returns (bool)
```

#### getDispute()
```solidity
function getDispute(uint256 disputeId) public view returns (Dispute memory)
```

#### getPendingDisputes()
```solidity
function getPendingDisputes() public view returns (uint256[] memory)
```

---

## Security Considerations

### Access Control
- ✅ Role-based permissions using OpenZeppelin AccessControl
- ✅ Admin can grant/revoke verifier roles
- ✅ Verifiers can only verify, not transfer

### Reentrancy
- ✅ No external calls that could lead to reentrancy
- ✅ State changes before any transfers

### Integer Overflow
- ✅ Using Solidity 0.8.24+ (built-in overflow protection)

### Front-Running
- ⚠️ Land registration is first-come-first-served
- ✅ Verification requires admin approval

### Gas Optimization
- ✅ Optimizer enabled (200 runs)
- ✅ Efficient data structures
- ✅ Minimal storage operations

---

## Integration Guide

### Web3.js Example

```javascript
const web3 = new Web3(RPC_URL);
const contract = new web3.eth.Contract(ABI, CONTRACT_ADDRESS);

// Register land
const tx = await contract.methods.registerLand(
    ipfsHash,
    area,
    price,
    location
).send({ from: userAddress });

// Get land details
const metadata = await contract.methods.getLandDetails(tokenId).call();
```

### Ethers.js Example

```javascript
const provider = new ethers.JsonRpcProvider(RPC_URL);
const contract = new ethers.Contract(ADDRESS, ABI, provider);

// Query owner's lands
const lands = await contract.getOwnerLands(ownerAddress);
```

---

## Gas Estimates

| Function | Gas Cost |
|----------|----------|
| registerLand() | ~180,000 |
| verifyLand() | ~50,000 |
| rejectLand() | ~45,000 |
| transferLand() | ~90,000 |
| updateMetadata() | ~35,000 |
| addVerifier() | ~120,000 |
| createDispute() | ~70,000 |
| resolveDispute() | ~55,000 |

*Estimates on Sepolia testnet with 200 optimizer runs*

---

## Version History

- **v0.1.0** - Initial implementation with Foundry
  - ERC-721 based land registry
  - Three-state verification workflow
  - Verifier management
  - Dispute resolution
