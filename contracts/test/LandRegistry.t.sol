// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/LandRegistry.sol";

contract LandRegistryTest is Test {
    LandRegistry public landRegistry;
    
    address public owner = address(1);
    address public verifier = address(2);
    address public user1 = address(3);
    address public user2 = address(4);
    
    string constant IPFS_HASH = "QmTest123456789";
    uint256 constant LAND_AREA = 1000; // 1000 sq meters
    uint256 constant LAND_PRICE = 100 ether;
    string constant LOCATION = "40.7128,-74.0060";
    
    function setUp() public {
        // Deploy contract as owner
        vm.startPrank(owner);
        landRegistry = new LandRegistry();
        
        // Grant verifier role
        landRegistry.grantRole(landRegistry.VERIFIER_ROLE(), verifier);
        vm.stopPrank();
    }
    
    // ============ Registration Tests ============
    
    function testRegisterLand() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(
            IPFS_HASH,
            LAND_AREA,
            LAND_PRICE,
            LOCATION
        );
        
        assertEq(tokenId, 0, "First token ID should be 0");
        assertEq(landRegistry.ownerOf(tokenId), user1, "Owner should be user1");
        
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
        uint256 tokenId1 = landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        uint256 tokenId2 = landRegistry.registerLand(IPFS_HASH, LAND_AREA * 2, LAND_PRICE * 2, LOCATION);
        vm.stopPrank();
        
        assertEq(tokenId1, 0, "First token ID should be 0");
        assertEq(tokenId2, 1, "Second token ID should be 1");
        assertEq(landRegistry.getTotalLands(), 2, "Total lands should be 2");
    }
    
    function testRegisterLandRevertsWithEmptyIPFS() public {
        vm.prank(user1);
        vm.expectRevert("IPFS hash cannot be empty");
        landRegistry.registerLand("", LAND_AREA, LAND_PRICE, LOCATION);
    }
    
    function testRegisterLandRevertsWithZeroArea() public {
        vm.prank(user1);
        vm.expectRevert("Area must be greater than 0");
        landRegistry.registerLand(IPFS_HASH, 0, LAND_PRICE, LOCATION);
    }
    
    function testGetOwnerLands() public {
        vm.startPrank(user1);
        landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
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
        uint256 tokenId = landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        // Verify land
        vm.prank(verifier);
        landRegistry.verifyLand(tokenId);
        
        LandRegistry.LandMetadata memory metadata = landRegistry.getLandDetails(tokenId);
        assertTrue(
            metadata.status == LandRegistry.VerificationStatus.Verified,
            "Status should be Verified"
        );
        assertEq(metadata.verifiedBy, verifier, "Verifier mismatch");
        assertGt(metadata.verifiedAt, 0, "Verified at should be set");
    }
    
    function testVerifyLandRevertsForNonVerifier() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(user2);
        vm.expectRevert();
        landRegistry.verifyLand(tokenId);
    }
    
    function testVerifyLandRevertsForNonExistentLand() public {
        vm.prank(verifier);
        vm.expectRevert("Land does not exist");
        landRegistry.verifyLand(999);
    }
    
    function testRejectLand() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(verifier);
        landRegistry.rejectLand(tokenId, "Invalid documents");
        
        LandRegistry.LandMetadata memory metadata = landRegistry.getLandDetails(tokenId);
        assertTrue(
            metadata.status == LandRegistry.VerificationStatus.Rejected,
            "Status should be Rejected"
        );
    }
    
    function testCannotVerifyAlreadyVerifiedLand() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(verifier);
        landRegistry.verifyLand(tokenId);
        
        vm.prank(verifier);
        vm.expectRevert("Land is not pending verification");
        landRegistry.verifyLand(tokenId);
    }
    
    // ============ Transfer Tests ============
    
    function testTransferVerifiedLand() public {
        // Register and verify land
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(verifier);
        landRegistry.verifyLand(tokenId);
        
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
        uint256 tokenId = landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(user1);
        vm.expectRevert("Only verified lands can be transferred");
        landRegistry.transferLand(user2, tokenId);
    }
    
    function testTransferRevertsForNonOwner() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(verifier);
        landRegistry.verifyLand(tokenId);
        
        vm.prank(user2);
        vm.expectRevert("You are not the owner");
        landRegistry.transferLand(user2, tokenId);
    }
    
    // ============ Metadata Update Tests ============
    
    function testUpdateMetadata() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        string memory newIPFS = "QmNewHash987654";
        vm.prank(user1);
        landRegistry.updateMetadata(tokenId, newIPFS);
        
        LandRegistry.LandMetadata memory metadata = landRegistry.getLandDetails(tokenId);
        assertEq(metadata.ipfsHash, newIPFS, "IPFS hash should be updated");
    }
    
    function testUpdateMetadataRevertsForNonOwner() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(user2);
        vm.expectRevert("You are not the owner");
        landRegistry.updateMetadata(tokenId, "QmNewHash");
    }
    
    function testUpdateMetadataRevertsWithEmptyHash() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(user1);
        vm.expectRevert("IPFS hash cannot be empty");
        landRegistry.updateMetadata(tokenId, "");
    }
    
    // ============ Event Tests ============
    
    function testLandRegisteredEvent() public {
        vm.prank(user1);
        vm.expectEmit(true, true, false, true);
        emit LandRegistry.LandRegistered(0, user1, IPFS_HASH, LAND_AREA, LAND_PRICE);
        landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
    }
    
    function testLandVerifiedEvent() public {
        vm.prank(user1);
        uint256 tokenId = landRegistry.registerLand(IPFS_HASH, LAND_AREA, LAND_PRICE, LOCATION);
        
        vm.prank(verifier);
        vm.expectEmit(true, true, false, true);
        emit LandRegistry.LandVerified(tokenId, verifier, block.timestamp);
        landRegistry.verifyLand(tokenId);
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
            landRegistry.hasRole(landRegistry.VERIFIER_ROLE(), verifier),
            "Verifier should have verifier role"
        );
    }
}
