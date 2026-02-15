# 🏗️ Land Registry Smart Contracts (Foundry)

Solidity smart contracts for the blockchain-based land registry system using Foundry toolkit.

## ✅ Installation Complete

- **Foundry** v1.6.0-rc1 installed
- **OpenZeppelin Contracts** v5.x installed
- **Forge Standard Library** installed

## 📂 Project Structure

```
contracts/
├── src/                    # Smart contracts
│   └── Counter.sol        # Example contract (to be replaced)
├── test/                   # Contract tests  
│   └── Counter.t.sol      # Example test
├── script/                 # Deployment scripts
│   └── Counter.s.sol      # Example script
├── lib/                    # Dependencies
│   ├── forge-std/         # Forge standard library
│   └── openzeppelin-contracts/  # OpenZeppelin contracts
├── foundry.toml            # Foundry configuration
└── .env.example            # Environment variables template
```

## 🚀 Quick Start

### 1. Configure Environment

Copy `.env.example` to `.env` and fill in your values:

```bash
cp .env.example .env
```

Required variables:
- `SEPOLIA_RPC_URL` - Get from [Infura](https://infura.io) or [Alchemy](https://alchemy.com)
- `PRIVATE_KEY` - Export from MetaMask (NEVER commit this!)
- `ETHERSCAN_API_KEY` - Get from [Etherscan](https://etherscan.io/myapikey)

### 2. Build Contracts

```bash
forge build
```

### 3. Run Tests

```bash
forge test
```

### 4. Deploy to Sepolia

```bash
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify
```

## 🧪 Available Commands

```bash
# Compile contracts
forge build

# Run tests
forge test

# Run tests with gas report
forge test --gas-report

# Run tests with coverage
forge coverage

# Format code
forge fmt

# Deploy to local network (anvil)
forge script script/Deploy.s.sol --rpc-url http://localhost:8545 --broadcast

# Deploy to Sepolia testnet
forge script script/Deploy.s.sol --rpc-url sepolia --broadcast --verify

# Verify contract on Etherscan
forge verify-contract <CONTRACT_ADDRESS> src/LandRegistry.sol:LandRegistry --chain sepolia
```

## 📋 Next Steps

1. ✅ Foundry environment setup complete
2. ⏳ Create `LandRegistry.sol` (ERC-721 based)
3. ⏳ Create `LandVerification.sol` (RBAC)
4. ⏳ Write comprehensive tests
5. ⏳ Deploy to Sepolia testnet
6. ⏳ Verify contracts on Etherscan

## 🔗 Resources

- [Foundry Book](https://book.getfoundry.sh/)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com/contracts)
- [Solidity Documentation](https://docs.soliditylang.org)

## 🛠️ Troubleshooting

### OpenZeppelin imports not found?

Add this to your import statements:
```solidity
import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
```

The `@openzeppelin/` remapping is configured in `foundry.toml`.

### RPC connection issues?

Make sure your `.env` file has valid `SEPOLIA_RPC_URL`. Test with:
```bash
cast block-number --rpc-url $SEPOLIA_RPC_URL
```
