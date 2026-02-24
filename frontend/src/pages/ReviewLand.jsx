import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

import { CheckCircle, XCircle, MapPin, FileText, DollarSign, User, Calendar, ArrowLeft, ExternalLink, Cpu, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { landAPI, verifierAPI } from '@/services/api';
import { MapView } from '@/components/MapView';

export const ReviewLand = () => {
    const { tokenId: landId } = useParams(); // This is actually the land ID from MongoDB
    const navigate = useNavigate();
    const [land, setLand] = useState(null);
    const [loading, setLoading] = useState(true);
    const [processing, setProcessing] = useState(false);
    const [minting, setMinting] = useState(false);
    const [showRejectDialog, setShowRejectDialog] = useState(false);
    const [showVerifyDialog, setShowVerifyDialog] = useState(false);
    const [rejectionReason, setRejectionReason] = useState('');

    const fetchLandDetails = useCallback(async () => {
        try {
            setLoading(true);

            // Fetch land details from backend
            const landData = await landAPI.getLandById(landId);
            setLand(landData);
        } catch (error) {
            console.error('Error fetching land details:', error);
            toast.error('Failed to fetch land details from backend');
        } finally {
            setLoading(false);
        }
    }, [landId]);

    useEffect(() => {
        fetchLandDetails();
    }, [fetchLandDetails]);

    const handleVerify = async () => {
        try {
            setProcessing(true);
            toast.loading('Submitting verification to blockchain...', { id: 'verify' });

            const result = await verifierAPI.verifyLand(landId);

            toast.success(
                <div>
                    <p>Land verified successfully!</p>
                    {result.etherscan_url && (
                        <a
                            href={result.etherscan_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline"
                        >
                            View on Etherscan ↗
                        </a>
                    )}
                </div>,
                { id: 'verify', duration: 5000 }
            );

            setShowVerifyDialog(false);

            setTimeout(() => navigate('/verifier/dashboard'), 2000);
        } catch (error) {
            console.error('Error verifying land:', error);
            const errorMsg = error.response?.data?.detail || 'Failed to verify land';
            toast.error(errorMsg, { id: 'verify' });
        } finally {
            setProcessing(false);
        }
    };

    const handleMint = async () => {
        try {
            setMinting(true);
            toast.loading('Minting land NFT on blockchain...', { id: 'mint' });

            const result = await verifierAPI.mintLand(landId);

            toast.success(
                <div>
                    <p>Land minted! Token #{result.token_id}</p>
                    <a
                        href={result.etherscan_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs underline"
                    >
                        View on Etherscan ↗
                    </a>
                </div>,
                { id: 'mint', duration: 5000 }
            );

            // Refresh so sidebar switches to verify/reject
            await fetchLandDetails();
        } catch (error) {
            console.error('Minting error:', error);
            const msg = error.response?.data?.detail || 'Minting failed';
            toast.error(msg, { id: 'mint' });
        } finally {
            setMinting(false);
        }
    };

    const handleReject = async () => {
        if (!rejectionReason.trim()) {
            toast.error('Please enter a rejection reason');
            return;
        }

        try {
            setProcessing(true);
            toast.loading('Processing rejection...', { id: 'reject' });

            const result = await verifierAPI.rejectLand(landId, rejectionReason);

            toast.success(
                <div>
                    <p>Land application rejected.</p>
                    {result.etherscan_url && (
                        <a
                            href={result.etherscan_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-xs underline"
                        >
                            View on Etherscan ↗
                        </a>
                    )}
                </div>,
                { id: 'reject', duration: 5000 }
            );

            setShowRejectDialog(false);
            setRejectionReason('');

            setTimeout(() => navigate('/verifier/dashboard'), 2000);
        } catch (error) {
            console.error('Error rejecting land:', error);
            const errorMsg = error.response?.data?.detail || 'Failed to reject land';
            toast.error(errorMsg, { id: 'reject' });
        } finally {
            setProcessing(false);
        }
    };

    const getStatusBadge = (status) => {
        const statusMap = {
            'pending': { label: 'Pending', variant: 'secondary' },
            'verified': { label: 'Verified', variant: 'success' },
            'rejected': { label: 'Rejected', variant: 'destructive' },
            'not_minted': { label: 'Not Minted', variant: 'outline' }
        };
        const { label, variant } = statusMap[status] || statusMap['pending'];
        return <Badge variant={variant}>{label}</Badge>;
    };

    if (loading) {
        return (
            <div className="container mx-auto py-12 text-center">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
                <p className="mt-4 text-muted-foreground">Loading land details...</p>
            </div>
        );
    }

    if (!land) {
        return (
            <div className="container mx-auto py-12 text-center">
                <XCircle className="w-16 h-16 mx-auto text-destructive mb-4" />
                <h2 className="text-2xl font-bold mb-2">Land Not Found</h2>
                <Button onClick={() => navigate('/verifier/dashboard')} className="mt-4">
                    Back to Dashboard
                </Button>
            </div>
        );
    }

    const isPending = land.blockchain_status === 'pending';

    return (
        <div className="container mx-auto py-8 px-4">
            <Button
                variant="ghost"
                onClick={() => navigate('/verifier/dashboard')}
                className="mb-6"
            >
                <ArrowLeft className="w-4 h-4 mr-2" />
                Back to Dashboard
            </Button>

            <div className="grid lg:grid-cols-3 gap-6">
                {/* Land Details */}
                <div className="lg:col-span-2 space-y-6">
                    <Card>
                        <CardHeader>
                            <div className="flex justify-between items-start">
                                <div>
                                    <CardTitle className="text-3xl">{land.title || `Land #${land.token_id || land.id}`}</CardTitle>
                                    <CardDescription>Registration Details</CardDescription>
                                </div>
                                {getStatusBadge(land.blockchain_status)}
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid md:grid-cols-2 gap-6">
                                <div className="flex items-start gap-3">
                                    <MapPin className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Location</p>
                                        <p className="font-medium">{land.location?.address || land.location || 'N/A'}</p>
                                        {land.location?.lat && land.location?.lng && (
                                            <p className="text-xs text-muted-foreground mt-1">
                                                {land.location.lat.toFixed(6)}, {land.location.lng.toFixed(6)}
                                            </p>
                                        )}
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <FileText className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Area</p>
                                        <p className="font-medium">{land.area} sq meters</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Land parcel size
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <DollarSign className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Price</p>
                                        <p className="font-medium">${land.price?.toLocaleString()}</p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            Estimated value
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-start gap-3">
                                    <Calendar className="w-5 h-5 text-primary mt-0.5" />
                                    <div>
                                        <p className="text-sm text-muted-foreground">Registered At</p>
                                        <p className="font-medium">
                                            {new Date(land.created_at).toLocaleDateString()}
                                        </p>
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {new Date(land.created_at).toLocaleTimeString()}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {land.description && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Description</p>
                                        <p className="text-sm">{land.description}</p>
                                    </div>
                                </>
                            )}

                            <Separator />

                            {land.token_id !== null && (
                                <div>
                                    <p className="text-sm text-muted-foreground mb-2">Token ID</p>
                                    <div className="bg-muted p-3 rounded-md">
                                        <p className="font-mono text-sm">#{land.token_id}</p>
                                    </div>
                                </div>
                            )}

                            {/* Location Map */}
                            <Card>
                                <CardHeader>
                                    <CardTitle className="flex items-center gap-2">
                                        <MapPin className="w-5 h-5 text-primary" />
                                        Property Location
                                    </CardTitle>
                                    <CardDescription>
                                        {land.location?.address || land.location || 'Location coordinates from registration'}
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <MapView
                                        lat={land.location?.lat}
                                        lng={land.location?.lng}
                                        address={land.location?.address || land.location}
                                        zoom={14}
                                        className="h-72 w-full"
                                    />
                                    {land.location?.lat && land.location?.lng && (
                                        <p className="text-xs text-muted-foreground mt-2 font-mono">
                                            Coordinates: {land.location.lat.toFixed(6)}, {land.location.lng.toFixed(6)}
                                        </p>
                                    )}
                                </CardContent>
                            </Card>

                            {land.documents && land.documents.length > 0 && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-3">Uploaded Documents</p>
                                        <div className="space-y-2">
                                            {land.documents.map((doc, idx) => (
                                                <div key={idx} className="bg-muted p-3 rounded-md">
                                                    <div className="flex items-center justify-between">
                                                        <div>
                                                            <p className="font-medium text-sm">{doc.name}</p>
                                                            <p className="font-mono text-xs text-muted-foreground mt-1">
                                                                {doc.ipfs_hash}
                                                            </p>
                                                        </div>
                                                        <a
                                                            href={`https://gateway.pinata.cloud/ipfs/${doc.ipfs_hash}`}
                                                            target="_blank"
                                                            rel="noopener noreferrer"
                                                            className="text-primary hover:underline text-sm flex items-center gap-1"
                                                        >
                                                            View <ExternalLink className="w-3 h-3" />
                                                        </a>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                </>
                            )}

                            {land.blockchain_tx_hash && (
                                <>
                                    <Separator />
                                    <div>
                                        <p className="text-sm text-muted-foreground mb-2">Transaction Hash</p>
                                        <div className="bg-muted p-3 rounded-md">
                                            <p className="font-mono text-xs break-all">{land.blockchain_tx_hash}</p>
                                        </div>
                                        <a
                                            href={`https://sepolia.etherscan.io/tx/${land.blockchain_tx_hash}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-sm text-primary hover:underline mt-2 inline-flex items-center gap-1"
                                        >
                                            View on Etherscan <ExternalLink className="w-3 h-3" />
                                        </a>
                                    </div>
                                </>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Actions */}
                <div>
                    <Card className="sticky top-4">
                        <CardHeader>
                            <CardTitle>
                                {land.blockchain_status === 'not_minted'
                                    ? 'Step 1 — Review & Mint'
                                    : land.blockchain_status === 'pending'
                                        ? 'Step 2 — Verify or Reject'
                                        : 'Verification Complete'}
                            </CardTitle>
                            <CardDescription>
                                {land.blockchain_status === 'not_minted'
                                    ? 'Review the uploaded documents, then mint to blockchain'
                                    : land.blockchain_status === 'pending'
                                        ? 'Approve or reject this land registration on-chain'
                                        : 'This application has been finalised'}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            {land.blockchain_status === 'not_minted' ? (
                                <>
                                    <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground">
                                        <p className="font-medium text-foreground mb-1">Step 1 — Review Documents</p>
                                        <p>Check all uploaded files on the left. Once satisfied, mint the land to the blockchain.</p>
                                    </div>
                                    <Button
                                        onClick={handleMint}
                                        disabled={minting}
                                        className="w-full"
                                        size="lg"
                                    >
                                        {minting ? (
                                            <>
                                                <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                                                Minting...
                                            </>
                                        ) : (
                                            <>
                                                <Cpu className="w-4 h-4 mr-2" />
                                                Mint to Blockchain
                                            </>
                                        )}
                                    </Button>

                                    <Button
                                        onClick={() => setShowRejectDialog(true)}
                                        disabled={minting || processing}
                                        variant="destructive"
                                        className="w-full"
                                        size="lg"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject Application
                                    </Button>

                                    <div className="pt-2 border-t">
                                        <p className="text-xs text-muted-foreground">
                                            Mint to approve and move to verification, or reject to decline
                                            this submission immediately.
                                        </p>
                                    </div>
                                </>
                            ) : land.blockchain_status === 'pending' ? (
                                <>
                                    <div className="p-3 bg-muted rounded-md text-sm text-muted-foreground mb-2">
                                        <p className="font-medium text-foreground mb-1">Step 2 — Approve or Reject</p>
                                        <p>This land is minted on-chain (Token #{land.token_id}). Sign the transaction to complete verification.</p>
                                    </div>
                                    <Button
                                        onClick={() => setShowVerifyDialog(true)}
                                        disabled={processing}
                                        className="w-full"
                                        size="lg"
                                    >
                                        <CheckCircle className="w-4 h-4 mr-2" />
                                        Approve & Verify
                                    </Button>

                                    <Button
                                        onClick={() => setShowRejectDialog(true)}
                                        disabled={processing}
                                        variant="destructive"
                                        className="w-full"
                                        size="lg"
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject Application
                                    </Button>

                                    <div className="pt-4 border-t">
                                        <p className="text-sm text-muted-foreground">
                                            <strong>Note:</strong> This action will be recorded on the blockchain
                                            and cannot be undone.
                                        </p>
                                    </div>
                                </>
                            ) : (
                                <div className="text-center py-6">
                                    <p className="text-muted-foreground">
                                        This land has been <strong>{land.blockchain_status}</strong>
                                    </p>
                                    {land.verified_by && (
                                        <div className="mt-4 text-sm">
                                            <p className="text-muted-foreground">Verified by:</p>
                                            <p className="font-mono text-xs break-all mt-1">{land.verified_by}</p>
                                        </div>
                                    )}
                                    {land.verified_at && (
                                        <div className="mt-2 text-sm">
                                            <p className="text-muted-foreground">Verified on:</p>
                                            <p className="text-xs mt-1">{new Date(land.verified_at).toLocaleString()}</p>
                                        </div>
                                    )}
                                    {land.rejection_reason && (
                                        <div className="mt-4 p-3 bg-destructive/10 rounded-md">
                                            <p className="text-sm text-muted-foreground mb-1">Rejection Reason:</p>
                                            <p className="text-sm">{land.rejection_reason}</p>
                                        </div>
                                    )}
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
            </div>

            {/* Verify Dialog */}
            <Dialog open={showVerifyDialog} onOpenChange={setShowVerifyDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Confirm Verification</DialogTitle>
                        <DialogDescription>
                            This will verify the land on the Sepolia blockchain using the platform's
                            admin wallet. The transaction is irreversible.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-2">
                        <p className="text-sm text-muted-foreground">
                            Land: <span className="font-medium text-foreground">{land?.title || `#${land?.token_id}`}</span>
                        </p>
                        <p className="text-sm text-muted-foreground mt-1">
                            Token ID: <span className="font-mono text-foreground">#{land?.token_id}</span>
                        </p>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => setShowVerifyDialog(false)}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleVerify}
                            disabled={processing}
                        >
                            {processing ? 'Processing...' : 'Confirm Verification'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Rejection Dialog */}
            <Dialog open={showRejectDialog} onOpenChange={setShowRejectDialog}>
                <DialogContent>
                    <DialogHeader>
                        <DialogTitle>Reject Land Application</DialogTitle>
                        <DialogDescription>
                            Provide a reason for rejection. This will be recorded and the applicant will be notified.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="py-4 space-y-4">
                        <div>
                            <Textarea
                                id="reason"
                                placeholder="Enter rejection reason (e.g., Invalid documents, Boundary dispute, Missing information)"
                                value={rejectionReason}
                                onChange={(e) => setRejectionReason(e.target.value)}
                                rows={4}
                            />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            variant="outline"
                            onClick={() => {
                                setShowRejectDialog(false);
                                setRejectionReason('');
                            }}
                            disabled={processing}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleReject}
                            disabled={processing || !rejectionReason.trim()}
                        >
                            {processing ? 'Submitting...' : 'Confirm Rejection'}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    );
};

export default ReviewLand;
