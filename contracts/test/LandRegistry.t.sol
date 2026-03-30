// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/LandRegistry.sol";

contract LandRegistryTest is Test {
    LandRegistry public landRegistry;
    
    address public owner = address(1);
    address public verifier1 = address(2);
    address public verifier2 = address(5);
    address public verifier3 = address(6);
    address public user1 = address(3);
    address public user2 = address(4);
    
    // The backend uses a single admin wallet to relay txs on behalf of verifiers
    address public adminRelayer = address(10);
    
    string constant IPFS_HASH = "QmTest123456789";
    uint256 constant LAND_AREA = 1000; // 1000 sq meters
    uint256 constant LAND_PRICE = 100 ether;
    string constant LOCATION = "40.7128,-74.0060";
    string constant PROP_ID_1 = "1234567890ABCD";
    string constant PROP_ID_2 = "2234567890ABCD";
    string constant PROP_ID_3 = "3234567890ABCD";
    string constant PROP_ID_4 = "4234567890ABCD";
    string constant PROP_ID_5 = "5234567890ABCD";
    string constant PROP_ID_6 = "6234567890ABCD";
    string constant PROP_ID_7 = "7234567890ABCD";
    string constant PROP_ID_8 = "8234567890ABCD";
    
    function setUp() public {
        // Deploy contract as owner
        vm.startPrank(owner);
        landRegistry = new LandRegistry();
        
        // Grant verifier role to the relayer
        landRegistry.grantRole(landRegistry.VERIFIER_ROLE(), adminRelayer);
        
        // You generally only need VERIFIER_ROLE for the msg.sender calling verifyLand.
        vm.stopPrank();
    }
    
    function _fullyVerify(uint256 tokenId) internal {
        vm.prank(adminRelayer);
        landRegistry.verifyLand(tokenId, verifier1);
        vm.prank(adminRelayer);
        landRegistry.verifyLand(tokenId, verifier2);
        vm.prank(adminRelayer);
        landRegistry.verifyLand(tokenId, verifier3);
    }
    
    // ============ Registration Tests ============
    
    function testRegisterLand() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(
            PROP_ID_1,
            IPFS_HASH,
            LAND_AREA,
            LAND_PRICE,
            LOCATION
        );
        
        assertEq(tokenId, 0, "First token ID should be 0");
        
        // Token is not minted yet
        vm.expectRevert();
        landRegistry.ownerOf(tokenId);
        
        LandRegistry.LandMetadata memory metadata = landRegistry.getLandDetails(tokenId);
        assertEq(metadata.ipfsHash, IPFS_HASH, "IPFS hash mismatch");
        assertEq(metadata.area, LAND_AREA, "Area mismatch");
        assertEq(metadata.price, LAND_PRICE, "Price mismatch");
        assertEq(metadata.location, LOCATION, "Location mismatch");
        assertEq(metadata.currentOwner, user1, "Current owner mismatch");
        assertTrue(
            metadata.status == LandRegistry.VerificationStatus.Pending,
            "Status should be Pending"
        );
    }
    
    function testRegisterMultipleLands() public {
        vm.startPrank(user1);
        uint256 tokenId1 = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        uint256 tokenId2 = landRegistry.registerLand(PROP_ID_2, IPFS_HASH, LAND_AREA * 2, LAND_PRICE * 2, LOCATION);
        vm.stopPrank();
        
        assertEq(tokenId1, 0, "First token ID should be 0");
        assertEq(tokenId2, 1, "Second token ID should be 1");
        assertEq(landRegistry.getTotalLands(), 2, "Total lands should be 2");
    }
    
    function testRegisterLandRevertsWithEmptyIPFS() public {
        vm.prank(user1);
        vm.expectRevert("IPFS hash cannot be empty");
        landRegistry.registerLand(PROP_ID_1, "", LAND_AREA, LAND_PRICE, LOCATION);
    }
    
    function testRegisterLandRevertsWithZeroArea() public {
        vm.prank(user1);
        vm.expectRevert("Area must be greater than 0");
        landRegistry.registerLand(PROP_ID_1, IPFS_HASH, 0, LAND_PRICE, LOCATION);
    }
    
    function testGetOwnerLands() public {
        vm.startPrank(user1);
        landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        landRegistry.registerLand(PROP_ID_2, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        vm.stopPrank();
        
        uint256[] memory lands = landRegistry.getOwnerLands(user1);
        assertEq(lands.length, 2, "User1 should own 2 lands");
        assertEq(lands[0], 0, "First land ID should be 0");
        assertEq(lands[1], 1, "Second land ID should be 1");
    }
    
    // ============ Verification Tests ============
    
    function testVerifyLand() public {
        // Register land
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        // 1st Verification
        vm.prank(adminRelayer);
        landRegistry.verifyLand(tokenId, verifier1);
        assertEq(landRegistry.getVerificationCount(tokenId), 1);
        
        LandRegistry.LandMetadata memory metadata = landRegistry.getLandDetails(tokenId);
        assertTrue(metadata.status == LandRegistry.VerificationStatus.Pending);
        
        // 2nd Verification
        vm.prank(adminRelayer);
        landRegistry.verifyLand(tokenId, verifier2);
        assertEq(landRegistry.getVerificationCount(tokenId), 2);
        
        // 3rd Verification
        vm.prank(adminRelayer);
        landRegistry.verifyLand(tokenId, verifier3);
        assertEq(landRegistry.getVerificationCount(tokenId), 3);
        
        metadata = landRegistry.getLandDetails(tokenId);
        assertTrue(
            metadata.status == LandRegistry.VerificationStatus.Verified,
            "Status should be Verified"
        );
        assertEq(metadata.verifiedBy, verifier3, "Verifier mismatch (should be final verifier)");
        assertGt(metadata.verifiedAt, 0, "Verified at should be set");
        
        // Verify NFT is minted
        assertEq(landRegistry.ownerOf(tokenId), user1);
    }
    
    function testVerifyLandRevertsForNonVerifier() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(user2); // Not admin Relayer!
        vm.expectRevert();
        landRegistry.verifyLand(tokenId, verifier1);
    }
    
    function testVerifyLandRevertsForNonExistentLand() public {
        vm.prank(adminRelayer);
        vm.expectRevert("Land does not exist");
        landRegistry.verifyLand(999, verifier1);
    }
    
    function testRejectLand() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(adminRelayer);
        landRegistry.rejectLand(tokenId, "Invalid documents");
        
        LandRegistry.LandMetadata memory metadata = landRegistry.getLandDetails(tokenId);
        assertTrue(
            metadata.status == LandRegistry.VerificationStatus.Rejected,
            "Status should be Rejected"
        );
    }
    
    function testCannotVerifyAlreadyVerifiedLand() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        _fullyVerify(tokenId);
        
        vm.prank(adminRelayer);
        vm.expectRevert("Land is not pending verification");
        landRegistry.verifyLand(tokenId, address(99));
    }
    
    function testCannotVerifyTwice() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(adminRelayer);
        landRegistry.verifyLand(tokenId, verifier1);
        
        vm.prank(adminRelayer);
        vm.expectRevert("You have already verified this land");
        landRegistry.verifyLand(tokenId, verifier1);
    }
    
    // ============ Transfer Tests ============
    
    function testTransferVerifiedLand() public {
        // Register and fully verify land
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        _fullyVerify(tokenId);
        
        // Transfer land
        vm.prank(user1);
        landRegistry.transferLand(user2, tokenId);
        
        assertEq(landRegistry.ownerOf(tokenId), user2, "Owner should be user2");
        
        LandRegistry.LandMetadata memory metadata = landRegistry.getLandDetails(tokenId);
        assertEq(metadata.currentOwner, user2, "Current owner should be user2");
        
        // Check owner lists
        uint256[] memory user1Lands = landRegistry.getOwnerLands(user1);
        uint256[] memory user2Lands = landRegistry.getOwnerLands(user2);
        assertEq(user1Lands.length, 0, "User1 should own 0 lands");
        assertEq(user2Lands.length, 1, "User2 should own 1 land");
    }
    
    function testTransferRevertsForUnverifiedLand() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(user1);
        vm.expectRevert("Only verified lands can be transferred");
        landRegistry.transferLand(user2, tokenId);
    }
    
    function testTransferRevertsForNonOwner() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        _fullyVerify(tokenId);
        
        vm.prank(user2);
        vm.expectRevert("You are not the owner");
        landRegistry.transferLand(user2, tokenId);
    }
    
    // ============ Metadata Update Tests ============
    
    function testUpdateMetadata() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        string memory newIPFS = "QmNewHash987654";
        vm.prank(user1);
        landRegistry.updateMetadata(tokenId, newIPFS);
        
        LandRegistry.LandMetadata memory metadata = landRegistry.getLandDetails(tokenId);
        assertEq(metadata.ipfsHash, newIPFS, "IPFS hash should be updated");
    }
    
    function testUpdateMetadataRevertsForNonOwner() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(user2);
        vm.expectRevert("You are not the owner");
        landRegistry.updateMetadata(tokenId, "QmNewHash");
    }
    
    function testUpdateMetadataRevertsWithEmptyHash() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(user1);
        vm.expectRevert("IPFS hash cannot be empty");
        landRegistry.updateMetadata(tokenId, "");
    }
    
    // ============ Event Tests ============
    
    function testLandRegisteredEvent() public {
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit LandRegistry.LandRegistered(0, user1, PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE);
        landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
    }
    
    function testLandVerifiedEvent() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(PROP_ID_1, IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(adminRelayer);
        landRegistry.verifyLand(tokenId, verifier1);
        vm.prank(adminRelayer);
        landRegistry.verifyLand(tokenId, verifier2);
        
        vm.prank(adminRelayer);
        vm.expectEmit(true, true, false, true);
        emit LandRegistry.LandVerified(tokenId, verifier3, block.timestamp);
        landRegistry.verifyLand(tokenId, verifier3);
    }
    
    // ============ Access Control Tests ============
    
    function testAdminRole() public {
        assertTrue(
            landRegistry.hasRole(landRegistry.DEFAULT_ADMIN_ROLE(), owner),
            "Owner should have admin role"
        );
    }
    
    function testVerifierRole() public {
        assertTrue(
            landRegistry.hasRole(landRegistry.VERIFIER_ROLE(), adminRelayer),
            "adminRelayer should have verifier role"
        );
    }
}
