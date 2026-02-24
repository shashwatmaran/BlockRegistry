// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import "forge-std/Test.sol";
import "../src/LandVerification.sol";

contract LandVerificationTest is Test {
    LandVerification public landVerification;
    
    address public superAdmin = address(1);
    address public verifier1 = address(2);
    address public verifier2 = address(3);
    address public user1 = address(4);
    
    function setUp() public {
        vm.prank(superAdmin);
        landVerification = new LandVerification();
    }
    
    // ============ Verifier Management Tests ============
    
    function testAddVerifier() public {
        vm.prank(superAdmin);
        landVerification.addVerifier(
            verifier1,
            "John Doe",
            "GOV123456",
            "New York"
        );
        
        assertTrue(
            landVerification.hasRole(landVerification.VERIFIER_ROLE(), verifier1),
            "Verifier1 should have verifier role"
        );
        
        LandVerification.Verifier memory verifierInfo = landVerification.getVerifier(verifier1);
        assertEq(verifierInfo.name, "John Doe", "Name mismatch");
        assertEq(verifierInfo.governmentId, "GOV123456", "Government ID mismatch");
        assertEq(verifierInfo.jurisdiction, "New York", "Jurisdiction mismatch");
        assertTrue(verifierInfo.isActive, "Verifier should be active");
    }
    
    function testAddVerifierRevertsForNonAdmin() public {
        vm.prank(user1);
        vm.expectRevert();
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
    }
    
    function testAddVerifierRevertsForZeroAddress() public {
        vm.prank(superAdmin);
        vm.expectRevert("Invalid address");
        landVerification.addVerifier(address(0), "John Doe", "GOV123", "NY");
    }
    
    function testAddVerifierRevertsForEmptyName() public {
        vm.prank(superAdmin);
        vm.expectRevert("Name cannot be empty");
        landVerification.addVerifier(verifier1, "", "GOV123", "NY");
    }
    
    function testAddVerifierRevertsForDuplicate() public {
        vm.startPrank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        
        vm.expectRevert("Already a verifier");
        landVerification.addVerifier(verifier1, "Jane Doe", "GOV456", "CA");
        vm.stopPrank();
    }
    
    function testRemoveVerifier() public {
        vm.startPrank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        landVerification.removeVerifier(verifier1);
        vm.stopPrank();
        
        assertFalse(
            landVerification.hasRole(landVerification.VERIFIER_ROLE(), verifier1),
            "Verifier1 should not have verifier role"
        );
    }
    
    function testRemoveVerifierRevertsForNonVerifier() public {
        vm.prank(superAdmin);
        vm.expectRevert("Not a verifier");
        landVerification.removeVerifier(user1);
    }
    
    function testDeactivateVerifier() public {
        vm.startPrank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        landVerification.deactivateVerifier(verifier1);
        vm.stopPrank();
        
        assertFalse(
            landVerification.isActiveVerifier(verifier1),
            "Verifier should be inactive"
        );
    }
    
    function testReactivateVerifier() public {
        vm.startPrank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        landVerification.deactivateVerifier(verifier1);
        landVerification.reactivateVerifier(verifier1);
        vm.stopPrank();
        
        assertTrue(
            landVerification.isActiveVerifier(verifier1),
            "Verifier should be active"
        );
    }
    
    function testDeactivateVerifierRevertsWhenAlreadyInactive() public {
        vm.startPrank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        landVerification.deactivateVerifier(verifier1);
        
        vm.expectRevert("Already inactive");
        landVerification.deactivateVerifier(verifier1);
        vm.stopPrank();
    }
    
    function testReactivateVerifierRevertsWhenAlreadyActive() public {
        vm.startPrank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        
        vm.expectRevert("Already active");
        landVerification.reactivateVerifier(verifier1);
        vm.stopPrank();
    }
    
    function testGetAllVerifiers() public {
        vm.startPrank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        landVerification.addVerifier(verifier2, "Jane Doe", "GOV456", "CA");
        vm.stopPrank();
        
        address[] memory verifiers = landVerification.getAllVerifiers();
        assertEq(verifiers.length, 2, "Should have 2 verifiers");
        assertEq(verifiers[0], verifier1, "First verifier should be verifier1");
        assertEq(verifiers[1], verifier2, "Second verifier should be verifier2");
    }
    
    // ============ Dispute Tests ============
    
    function testCreateDispute() public {
        vm.prank(user1);
        uint256 disputeId = landVerification.createDispute(1, "Ownership contested");
        
        assertEq(disputeId, 0, "First dispute ID should be 0");
        
        LandVerification.Dispute memory dispute = landVerification.getDispute(disputeId);
        assertEq(dispute.landTokenId, 1, "Land token ID mismatch");
        assertEq(dispute.disputedBy, user1, "Disputed by mismatch");
        assertEq(dispute.reason, "Ownership contested", "Reason mismatch");
        assertFalse(dispute.isResolved, "Dispute should not be resolved");
    }
    
    function testCreateDisputeRevertsWithEmptyReason() public {
        vm.prank(user1);
        vm.expectRevert("Reason cannot be empty");
        landVerification.createDispute(1, "");
    }
    
    function testResolveDispute() public {
        // Add verifier first
        vm.prank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        
        // Create dispute
        vm.prank(user1);
        uint256 disputeId = landVerification.createDispute(1, "Ownership contested");
        
        // Resolve dispute
        vm.prank(verifier1);
        landVerification.resolveDispute(disputeId, "Verified ownership, dispute invalid");
        
        LandVerification.Dispute memory dispute = landVerification.getDispute(disputeId);
        assertTrue(dispute.isResolved, "Dispute should be resolved");
        assertEq(dispute.resolvedBy, verifier1, "Resolved by mismatch");
        assertEq(dispute.resolution, "Verified ownership, dispute invalid", "Resolution mismatch");
        assertGt(dispute.resolvedAt, 0, "Resolved at should be set");
    }
    
    function testResolveDisputeRevertsForNonVerifier() public {
        vm.prank(user1);
        uint256 disputeId = landVerification.createDispute(1, "Ownership contested");
        
        vm.prank(user1);
        vm.expectRevert();
        landVerification.resolveDispute(disputeId, "Resolution");
    }
    
    function testResolveDisputeRevertsForNonExistentDispute() public {
        vm.prank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        
        vm.prank(verifier1);
        vm.expectRevert("Dispute does not exist");
        landVerification.resolveDispute(999, "Resolution");
    }
    
    function testResolveDisputeRevertsWhenAlreadyResolved() public {
        vm.prank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        
        vm.prank(user1);
        uint256 disputeId = landVerification.createDispute(1, "Ownership contested");
        
        vm.prank(verifier1);
        landVerification.resolveDispute(disputeId, "First resolution");
        
        vm.prank(verifier1);
        vm.expectRevert("Dispute already resolved");
        landVerification.resolveDispute(disputeId, "Second resolution");
    }
    
    function testResolveDisputeRevertsWithEmptyResolution() public {
        vm.prank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        
        vm.prank(user1);
        uint256 disputeId = landVerification.createDispute(1, "Ownership contested");
        
        vm.prank(verifier1);
        vm.expectRevert("Resolution cannot be empty");
        landVerification.resolveDispute(disputeId, "");
    }
    
    function testGetAllDisputes() public {
        vm.startPrank(user1);
        landVerification.createDispute(1, "Dispute 1");
        landVerification.createDispute(2, "Dispute 2");
        vm.stopPrank();
        
        uint256[] memory disputes = landVerification.getAllDisputes();
        assertEq(disputes.length, 2, "Should have 2 disputes");
    }
    
    function testGetPendingDisputes() public {
        vm.prank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        
        vm.startPrank(user1);
        uint256 disputeId1 = landVerification.createDispute(1, "Dispute 1");
        uint256 disputeId2 = landVerification.createDispute(2, "Dispute 2");
        uint256 disputeId3 = landVerification.createDispute(3, "Dispute 3");
        vm.stopPrank();
        
        // Resolve one dispute
        vm.prank(verifier1);
        landVerification.resolveDispute(disputeId2, "Resolved");
        
        uint256[] memory pending = landVerification.getPendingDisputes();
        assertEq(pending.length, 2, "Should have 2 pending disputes");
        assertEq(pending[0], disputeId1, "First pending should be disputeId1");
        assertEq(pending[1], disputeId3, "Second pending should be disputeId3");
    }
    
    // ============ Event Tests ============
    
    function testVerifierAddedEvent() public {
        vm.prank(superAdmin);
        vm.expectEmit(true, false, false, true);
        emit LandVerification.VerifierAdded(verifier1, "John Doe", "New York");
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "New York");
    }
    
    function testVerifierRemovedEvent() public {
        vm.startPrank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        
        vm.expectEmit(true, false, false, true);
        emit LandVerification.VerifierRemoved(verifier1, block.timestamp);
        landVerification.removeVerifier(verifier1);
        vm.stopPrank();
    }
    
    function testDisputeCreatedEvent() public {
        vm.prank(user1);
        vm.expectEmit(true, true, true, true);
        emit LandVerification.DisputeCreated(0, 1, user1, "Ownership contested");
        landVerification.createDispute(1, "Ownership contested");
    }
    
    function testDisputeResolvedEvent() public {
        vm.prank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        
        vm.prank(user1);
        uint256 disputeId = landVerification.createDispute(1, "Dispute");
        
        vm.prank(verifier1);
        vm.expectEmit(true, true, false, true);
        emit LandVerification.DisputeResolved(disputeId, verifier1, "Resolution");
        landVerification.resolveDispute(disputeId, "Resolution");
    }
    
    // ============ Access Control Tests ============
    
    function testSuperAdminRole() public {
        assertTrue(
            landVerification.hasRole(landVerification.SUPER_ADMIN_ROLE(), superAdmin),
            "Super admin should have super admin role"
        );
    }
    
    function testIsActiveVerifier() public {
        vm.prank(superAdmin);
        landVerification.addVerifier(verifier1, "John Doe", "GOV123", "NY");
        
        assertTrue(
            landVerification.isActiveVerifier(verifier1),
            "Verifier1 should be active"
        );
        
        assertFalse(
            landVerification.isActiveVerifier(user1),
            "User1 should not be an active verifier"
        );
    }
}
