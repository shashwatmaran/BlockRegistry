// Contract addresses on Sepolia testnet
export const LAND_REGISTRY_ADDRESS = "0x5dcbc086ba6867e3c11aad2a5bcd7f55352699c4";
export const LAND_VERIFICATION_ADDRESS = "0xa267cbe01c92431b29073c81c142c81bc10f0462";

// Role hashes (keccak256)
export const ADMIN_ROLE = "0x0000000000000000000000000000000000000000000000000000000000000000";
export const VERIFIER_ROLE = "0x0ce23c3e399818cfee81a7ab0880f714e53d7672b08df0fa62f2843416e1ea09";
export const SUPER_ADMIN_ROLE = "0x7613a25ecc738585a232ad50a301178f12b3ba8887d13e138b523c4269c47689";

// Chain configuration
export const SEPOLIA_CHAIN_ID = 11155111;
export const SEPOLIA_RPC_URL = process.env.REACT_APP_RPC_URL || "https://sepolia.infura.io/v3/e96b2756d818441b843b172a1b622cd0";
