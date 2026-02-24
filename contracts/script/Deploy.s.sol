// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Script.sol";
import "../src/LandRegistry.sol";
import "../src/LandVerification.sol";

contract DeployScript is Script {
    function run() external {
        // Load private key from environment (handles both 0x and non-0x formats)
        string memory pkString = vm.envString("PRIVATE_KEY");
        uint256 deployerPrivateKey;
        
        // Check if private key has 0x prefix
        if (bytes(pkString).length > 2 && bytes(pkString)[0] == '0' && bytes(pkString)[1] == 'x') {
            deployerPrivateKey = vm.parseUint(pkString);
        } else {
            // Add 0x prefix if missing
            deployerPrivateKey = vm.parseUint(string(abi.encodePacked("0x", pkString)));
        }
        
        address deployer = vm.addr(deployerPrivateKey);
        
        console.log("Deploying contracts with account:", deployer);
        console.log("Account balance:", deployer.balance);
        
        vm.startBroadcast(deployerPrivateKey);
        
        // Deploy LandRegistry
        console.log("\nDeploying LandRegistry...");
        LandRegistry landRegistry = new LandRegistry();
        console.log("LandRegistry deployed at:", address(landRegistry));
        
        // Deploy LandVerification
        console.log("\nDeploying LandVerification...");
        LandVerification landVerification = new LandVerification();
        console.log("LandVerification deployed at:", address(landVerification));
        
        vm.stopBroadcast();
        
        console.log("\n=== Deployment Summary ===");
        console.log("LandRegistry:", address(landRegistry));
        console.log("LandVerification:", address(landVerification));
        console.log("\nSave these addresses for frontend integration!");
    }
}
