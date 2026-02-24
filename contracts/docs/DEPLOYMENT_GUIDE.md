# Smart Contract Deployment Guide

## Prerequisites

### 1. Environment Setup

Ensure you have the following installed:
- ✅ Foundry (forge, cast, anvil)
- ✅ Git
- ✅ MetaMask with Sepolia ETH

Verify Foundry installation:
```bash
forge --version
cast --version
```

### 2. Environment Variables

Create `.env` file in `contracts/` directory:

```bash
# Copy from template
cp .env.example .env
```

Fill in the required values:

```env
# Sepolia RPC URL (from Infura or Alchemy)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID

# Your deployment wallet private key (NEVER commit this!)
PRIVATE_KEY=0xYourPrivateKeyHere

# Etherscan API key for contract verification
ETHERSCAN_API_KEY=YourEtherscanApiKey
```

**Getting the values:**

- **SEPOLIA_RPC_URL**: Sign up at [Infura](https://infura.io) or [Alchemy](https://alchemy.com)
- **PRIVATE_KEY**: Export from MetaMask (Account Details → Export Private Key)
- **ETHERSCAN_API_KEY**: Get from [Etherscan](https://etherscan.io/myapikey)

---

## Step 1: Get Sepolia ETH

You'll need testnet ETH for deployment. Use these faucets:

1. **Alchemy Sepolia Faucet**: https://sepoliafaucet.com/
2. **Infura Sepolia Faucet**: https://www.infura.io/faucet/sepolia
3. **Chainlink Sepolia Faucet**: https://faucets.chain.link/sepolia

**Required:** ~0.1 Sepolia ETH for deployment

---

## Step 2: Create Deployment Script

Create `script/Deploy.s.sol`:

```solidity
// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/LandRegistry.sol";
import "../src/LandVerification.sol";

contract DeployScript is Script {
    function run() external {
        // Load private key from environment
        uint256 deployerPrivateKey = vm.envUint("PRIVATE_KEY");
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy LandRegistry
        LandRegistry landRegistry = new LandRegistry();
        console.log("LandRegistry deployed at:", address(landRegistry));
        
        // Deploy LandVerification
        LandVerification landVerification = new LandVerification();
        console.log("LandVerification deployed at:", address(landVerification));
        
        vm.stopBroadcast();
    }
}
```

---

## Step 3: Test Deployment Locally

Test deployment on local Anvil chain first:

```bash
# Terminal 1: Start local blockchain
anvil

# Terminal 2: Deploy to local chain
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast
```

**Expected output:**
```
LandRegistry deployed at: 0x5FbDB2315678afecb367f032d93F642f64180aa3
LandVerification deployed at: 0xe7f1725E7734CE288F8367e1Bb143E90bb3F0512
```

---

## Step 4: Deploy to Sepolia Testnet

### 4.1 Compile Contracts

```bash
forge build
```

**Expected output:**
```
[⠊] Compiling 46 files with Solc 0.8.24
[⠔] Solc 0.8.24 finished in 2.02s
✅ Compiler run successful!
```

### 4.2 Run Tests

```bash
forge test
```

Ensure all 54 tests pass before deploying.

### 4.3 Deploy to Sepolia

```bash
forge script script/Deploy.s.sol \
  --rpc-url $SEPOLIA_RPC_URL \
  --broadcast \
  --verify \
  -vvvv
```

**Flags explained:**
- `--broadcast`: Actually send transactions
- `--verify`: Auto-verify on Etherscan
- `-vvvv`: Verbose output for debugging

**Expected output:**
```
== Logs ==
LandRegistry deployed at: 0xABCD...1234
LandVerification deployed at: 0xEFGH...5678

##### sepolia
✅ [Success] Hash: 0x...
Contract Address: 0xABCD...1234
Block: 12345678
```

### 4.4 Save Deployment Info

Create `deployments/sepolia.json`:

```json
{
  "network": "sepolia",
  "chainId": 11155111,
  "deployedAt": "2024-02-15T06:00:00Z",
  "contracts": {
    "LandRegistry": {
      "address": "0xYourLandRegistryAddress",
      "etherscanUrl": "https://sepolia.etherscan.io/address/0xYourLandRegistryAddress"
    },
    "LandVerification": {
      "address": "0xYourLandVerificationAddress",
      "etherscanUrl": "https://sepolia.etherscan.io/address/0xYourLandVerificationAddress"
    }
  }
}
```

---

## Step 5: Verify Contracts on Etherscan

If auto-verification didn't work during deployment:

### Manual Verification

```bash
# Verify LandRegistry
forge verify-contract \
  <LAND_REGISTRY_ADDRESS> \
  src/LandRegistry.sol:LandRegistry \
  --chain sepolia \
  --etherscan-api-key $ETHERSCAN_API_KEY

# Verify LandVerification
forge verify-contract \
  <LAND_VERIFICATION_ADDRESS> \
  src/LandVerification.sol:LandVerification \
  --chain sepolia \
  --etherscan-api-key $ETHERSCAN_API_KEY
```

**Verification success:**
```
✅ Contract successfully verified
View at: https://sepolia.etherscan.io/address/0x.../contract
```

---

## Step 6: Export ABIs

Export contract ABIs for frontend integration:

```bash
# Create deployments directory
mkdir -p deployments/abis

# Export LandRegistry ABI
forge inspect LandRegistry abi > deployments/abis/LandRegistry.json

# Export LandVerification ABI
forge inspect LandVerification abi > deployments/abis/LandVerification.json
```

---

## Step 7: Post-Deployment Setup

### 7.1 Grant Verifier Role

Connect to the deployed LandRegistry contract and grant verifier role:

```bash
# Using cast
cast send <LAND_REGISTRY_ADDRESS> \
  "grantRole(bytes32,address)" \
  $(cast keccak "VERIFIER_ROLE()") \
  <VERIFIER_ADDRESS> \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

### 7.2 Add Verifiers to LandVerification

```bash
cast send <LAND_VERIFICATION_ADDRESS> \
  "addVerifier(address,string,string,string)" \
  <VERIFIER_ADDRESS> \
  "John Doe" \
  "GOV123456" \
  "New York" \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

### 7.3 Test Basic Functionality

Register a test land parcel:

```bash
cast send <LAND_REGISTRY_ADDRESS> \
  "registerLand(string,uint256,uint256,string)" \
  "QmTestIPFSHash123" \
  1000 \
  100000000000000000000 \
  "40.7128,-74.0060" \
  --rpc-url $SEPOLIA_RPC_URL \
  --private-key $PRIVATE_KEY
```

---

## Step 8: Frontend Integration

Update frontend `.env` file:

```env
REACT_APP_LAND_REGISTRY_ADDRESS=0xYourLandRegistryAddress
REACT_APP_LAND_VERIFICATION_ADDRESS=0xYourLandVerificationAddress
REACT_APP_CHAIN_ID=11155111
REACT_APP_RPC_URL=https://sepolia.infura.io/v3/YOUR_PROJECT_ID
```

Copy ABIs to frontend:

```bash
cp deployments/abis/*.json ../frontend/src/contracts/
```

---

## Troubleshooting

### Error: "Insufficient funds"
- **Solution**: Get more Sepolia ETH from faucets

### Error: "Nonce too low"
- **Solution**: Reset MetaMask account or specify nonce manually

### Error: "Contract verification failed"
- **Solution**: Wait 1-2 minutes, then try manual verification

### Error: "RPC URL connection failed"
- **Solution**: Check Infura/Alchemy project status and API key

### Transaction stuck pending
- **Solution**: Check [Sepolia block explorer](https://sepolia.etherscan.io/)

---

## Deployment Checklist

- [ ] ✅ Foundry installed and working
- [ ] ✅ `.env` file configured with all keys
- [ ] ✅ Sepolia ETH acquired (>0.1 ETH)
- [ ] ✅ All tests passing (`forge test`)
- [ ] ✅ Deployment script created (`script/Deploy.s.sol`)
- [ ] ✅ Deployed to Sepolia testnet
- [ ] ✅ Contracts verified on Etherscan
- [ ] ✅ ABIs exported to `deployments/abis/`
- [ ] ✅ Deployment info saved to `deployments/sepolia.json`
- [ ] ✅ Verifier roles granted
- [ ] ✅ Test transaction successful
- [ ] ✅ Frontend `.env` updated
- [ ] ✅ ABIs copied to frontend

---

## Next Steps

After successful deployment:

1. **Update Backend**: Configure Web3 provider with contract addresses
2. **Update Frontend**: Add contract interaction logic
3. **Test Integration**: End-to-end testing on testnet
4. **Documentation**: Update README with deployed contract addresses
5. **Monitoring**: Set up transaction monitoring and alerts

---

## Production Deployment (Ethereum Mainnet)

⚠️ **WARNING**: Only deploy to mainnet after thorough testing!

### Additional Steps:
1. **Security Audit**: Get contracts audited by professionals
2. **Gas Optimization**: Review and optimize gas usage
3. **Mainnet ETH**: Acquire sufficient ETH for deployment (~0.5-1 ETH)
4. **Multi-sig Wallet**: Use Gnosis Safe for admin operations
5. **Gradual Rollout**: Start with limited users
6. **Emergency Pause**: Implement pause functionality

---

## Support

- **Foundry Docs**: https://book.getfoundry.sh/
- **OpenZeppelin Docs**: https://docs.openzeppelin.com/
- **Sepolia Faucets**: https://sepoliafaucet.com/
- **Etherscan**: https://sepolia.etherscan.io/
