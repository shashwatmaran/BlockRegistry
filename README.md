# BlockRegistry — Blockchain Land Registry

A decentralized land registration and verification system built on the **Ethereum Sepolia testnet**. It uses smart contracts (ERC-721 NFTs) to represent land parcels, a FastAPI backend for business logic and IPFS integration, and a React frontend for citizen and verifier interactions.

![BlockRegistry preview](frontend\public\image.png)
---

## Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                     React Frontend                      │
│  (React 18, Tailwind CSS, ethers.js, Leaflet Maps)      │
└────────────────────────┬────────────────────────────────┘
                         │ REST API (JWT Auth)
┌────────────────────────▼────────────────────────────────┐
│                   FastAPI Backend                       │
│  (Python, MongoDB, Pinata IPFS, Web3.py)                │
└────────────────────────┬────────────────────────────────┘
                         │ Web3 / RPC
┌────────────────────────▼────────────────────────────────┐
│              Ethereum Sepolia Testnet                   │
│  LandRegistry.sol (ERC-721)  │  LandVerification.sol   │
└─────────────────────────────────────────────────────────┘
```

---

## Features

- **Land Registration** — Citizens submit land details (area, price, GPS location) which are stored on IPFS and minted as NFTs on-chain.
- **Verifier Dashboard** — Authorized verifiers can approve or reject pending land registrations directly on-chain.
- **Blockchain Explorer** — Browse all registered land parcels and their on-chain status (Pending / Verified / Rejected).
- **MetaMask Wallet Integration** — Connect your MetaMask wallet; automatic network detection and switching to Sepolia.
- **Role-Based Access** — JWT-authenticated user accounts with a separate `VERIFIER_ROLE` enforced by the smart contract.
- **Interactive Map** — Drop a pin on a Leaflet map during registration; reverse geocoding auto-fills country, state, and pincode.
- **IPFS Storage** — Land documents and metadata are pinned to IPFS via Pinata.

---

## Project Structure

```
Land_registry/
├── contracts/          # Solidity smart contracts (Foundry)
│   ├── src/
│   │   ├── LandRegistry.sol       # ERC-721 NFT for land parcels
│   │   └── LandVerification.sol   # Verifier role & verification logic
│   ├── script/         # Deployment scripts
│   ├── test/           # Foundry tests
│   └── foundry.toml
│
├── backend/            # FastAPI Python backend
│   ├── app/
│   │   ├── api/        # REST API endpoints
│   │   ├── services/   # blockchain.py, ipfs.py, etc.
│   │   ├── models/     # MongoDB document models
│   │   ├── schemas/    # Pydantic request/response schemas
│   │   └── core/       # Config, security, JWT
│   ├── requirements.txt
│   └── main.py
│
└── frontend/           # React frontend
    ├── src/
    │   ├── pages/      # Home, Dashboard, Register, Explorer, Verifier
    │   ├── components/ # Navbar, UI primitives (shadcn/ui)
    │   ├── contexts/   # AuthContext, WalletContext
    │   ├── services/   # Axios API client
    │   └── hooks/      # useUserRole, etc.
    └── package.json
```

---

## Tech Stack

| Layer | Technology |
|---|---|
| Smart Contracts | Solidity, Foundry, OpenZeppelin ERC-721 |
| Blockchain | Ethereum Sepolia Testnet |
| Backend | Python 3.11+, FastAPI, Uvicorn |
| Database | MongoDB (via Motor async driver) |
| IPFS | Pinata API |
| Blockchain Client | Web3.py, eth-account |
| Auth | JWT (python-jose), bcrypt |
| Frontend | React 18, React Router v7 |
| Styling | Tailwind CSS, shadcn/ui (Radix UI) |
| Web3 Frontend | ethers.js v6, MetaMask |
| Maps | Leaflet, react-leaflet |
| Forms | React Hook Form, Zod |

---

## Getting Started

### Prerequisites

- Node.js ≥ 18 & Yarn
- Python ≥ 3.11
- [Foundry](https://book.getfoundry.sh/getting-started/installation) (`forge`, `cast`)
- MongoDB Atlas account (or local MongoDB)
- [Pinata](https://pinata.cloud/) account for IPFS
- MetaMask browser extension with Sepolia ETH (get from a [faucet](https://sepoliafaucet.com/))

---

### 1. Smart Contracts

```bash
cd contracts

# Install dependencies
forge install

# Run tests
forge test

# Deploy to Sepolia (set env vars first)
cp .env.example .env
# Edit .env with your PRIVATE_KEY and SEPOLIA_RPC_URL
forge script script/Deploy.s.sol --rpc-url $SEPOLIA_RPC_URL --broadcast
```

Note the deployed contract addresses — you'll need them for the backend `.env`.

---

### 2. Backend

```bash
cd backend

# Create and activate virtual environment
python -m venv venv
venv\Scripts\activate        # Windows
# source venv/bin/activate   # macOS/Linux

# Install dependencies
pip install -r requirements.txt

# Configure environment
cp .env.example .env
# Edit .env with your values (see Environment Variables section)

# Start the server
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

API docs available at: `http://localhost:8000/docs`

---

### 3. Frontend

```bash
cd frontend

# Install dependencies
yarn install

# Configure environment
cp .env.example .env
# Edit .env with your backend URL and chain config

# Start development server
yarn start
```

App runs at: `http://localhost:3000`

---

## Environment Variables

### Backend (`backend/.env`)

```env
# MongoDB
MONGO_URL=mongodb+srv://<user>:<password>@cluster.mongodb.net/
DB_NAME=land_registry

# Pinata IPFS
PINATA_API_KEY=your_pinata_api_key
PINATA_SECRET_API_KEY=your_pinata_secret_key

# Blockchain (Sepolia)
SEPOLIA_RPC_URL=https://sepolia.infura.io/v3/YOUR_INFURA_PROJECT_ID
LAND_REGISTRY_ADDRESS=0x...
LAND_VERIFICATION_ADDRESS=0x...
ADMIN_PRIVATE_KEY=0x...   # ⚠️ Keep secret, never commit

# JWT
JWT_SECRET_KEY=your-secret-key
JWT_ALGORITHM=HS256
JWT_ACCESS_TOKEN_EXPIRE_MINUTES=30

# CORS
CORS_ORIGINS=http://localhost:3000
```

### Frontend (`frontend/.env`)

```env
REACT_APP_BACKEND_URL=http://localhost:8000
REACT_APP_CHAIN_ID=11155111
REACT_APP_CHAIN_NAME=Sepolia
REACT_APP_RPC_URL=https://rpc.sepolia.org
```

---

## User Roles

| Role | Description |
|---|---|
| **Citizen** | Register land, view own properties, browse explorer |
| **Verifier** | All citizen access + approve/reject pending registrations on-chain |
| **Admin** | Deploys contracts, grants `VERIFIER_ROLE` via smart contract |

To grant verifier role, use `cast` or a script:
```bash
cast send $LAND_REGISTRY_ADDRESS "grantRole(bytes32,address)" \
  $(cast keccak "VERIFIER_ROLE") <verifier_address> \
  --private-key $ADMIN_PRIVATE_KEY --rpc-url $SEPOLIA_RPC_URL
```

---

## Smart Contracts

| Contract | Description |
|---|---|
| `LandRegistry.sol` | ERC-721 NFT contract. Each token = one land parcel. Stores IPFS hash, area, price, location, owner, and verification status. |
| `LandVerification.sol` | Manages verifier roles and verification workflow (Pending → Verified / Rejected). |

---

## Testing

### Smart Contracts
```bash
cd contracts
forge test -v
```

### Backend
```bash
cd backend
pip install -r requirements-dev.txt
pytest
```

---

## Security Notes

- **Never commit** your `ADMIN_PRIVATE_KEY` or `JWT_SECRET_KEY` to version control.
- The admin private key is used server-side to mint NFTs on behalf of users. Use a dedicated wallet with minimal funds.
- This project is deployed on **Sepolia testnet** and is intended for educational/demonstration purposes.

---

## License

This project is for educational purposes. No license is currently specified.
