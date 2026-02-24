import React, { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Eye, CheckCircle, XCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

import { verifierAPI } from '@/services/api';

export const VerifierDashboard = () => {
    const [allLands, setAllLands] = useState([]);
    const [loading, setLoading] = useState(true);
    const navigate = useNavigate();

    const fetchLands = useCallback(async () => {
        try {
            setLoading(true);
            const lands = await verifierAPI.getAllPendingLands();
            setAllLands(lands);
        } catch (error) {
            console.error('Error fetching lands:', error);
            const msg = error.response?.data?.detail || 'Failed to fetch lands';
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => {
        fetchLands();
    }, [fetchLands]);

    // not_minted = submitted by user, docs uploaded, pending verifier review
    const pendingReview = allLands.filter(l => l.blockchain_status === 'not_minted');
    // pending = minted on-chain, awaiting verify/reject decision
    const needsVerification = allLands.filter(l => l.blockchain_status === 'pending');

    const getStatusBadge = (status) => {
        const map = {
            'not_minted': { label: 'Under Review', variant: 'secondary', icon: AlertCircle },
            'pending': { label: 'Awaiting Decision', variant: 'outline', icon: AlertCircle },
            'verified': { label: 'Verified', variant: 'success', icon: CheckCircle },
            'rejected': { label: 'Rejected', variant: 'destructive', icon: XCircle },
        };
        const { label, variant, icon: Icon } = map[status] || map['not_minted'];
        return (
            <Badge variant={variant} className="flex items-center gap-1">
                <Icon className="w-3 h-3" />
                {label}
            </Badge>
        );
    };

    const LandCard = ({ land }) => (
        <Card key={land.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
                <div className="flex justify-between items-start">
                    <CardTitle className="text-base leading-snug">
                        {land.title || `Land #${land.token_id ?? land.id.slice(-6)}`}
                    </CardTitle>
                    {getStatusBadge(land.blockchain_status)}
                </div>
                <CardDescription className="line-clamp-1">
                    {land.location?.address || land.location || 'No address'}
                </CardDescription>
            </CardHeader>
            <CardContent>
                <div className="space-y-2 text-sm mb-4">
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Area</span>
                        <span className="font-medium">{land.area} sq m</span>
                    </div>
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Price</span>
                        <span className="font-medium">₹{land.price?.toLocaleString()}</span>
                    </div>
                    {land.token_id != null && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Token ID</span>
                            <span className="font-mono">#{land.token_id}</span>
                        </div>
                    )}
                    <div className="flex justify-between">
                        <span className="text-muted-foreground">Submitted</span>
                        <span>{new Date(land.created_at).toLocaleDateString()}</span>
                    </div>
                    {land.documents?.length > 0 && (
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Documents</span>
                            <span className="text-primary font-medium">{land.documents.length} file(s) uploaded</span>
                        </div>
                    )}
                </div>

                <Button
                    onClick={() => navigate(`/verifier/review/${land.id}`)}
                    className="w-full"
                >
                    <Eye className="w-4 h-4 mr-2" />
                    {land.blockchain_status === 'not_minted' ? 'Review Documents' : 'Review & Verify'}
                </Button>
            </CardContent>
        </Card>
    );

    const EmptyState = ({ icon: Icon, title, desc }) => (
        <Card>
            <CardContent className="py-12 text-center">
                <Icon className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-xl font-semibold mb-2">{title}</h3>
                <p className="text-muted-foreground">{desc}</p>
            </CardContent>
        </Card>
    );

    const LandGrid = ({ lands, emptyTitle, emptyDesc, hint }) => {
        if (loading) return (
            <div className="text-center py-12">
                <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-primary" />
                <p className="mt-4 text-muted-foreground">Loading applications...</p>
            </div>
        );
        if (lands.length === 0) return <EmptyState icon={CheckCircle} title={emptyTitle} desc={emptyDesc} />;
        return (
            <>
                {hint && <p className="text-sm text-muted-foreground mb-4">{hint}</p>}
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    {lands.map(land => <LandCard key={land.id} land={land} />)}
                </div>
            </>
        );
    };

    return (
        <div className="container mx-auto py-8 px-4">
            {/* Header */}
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-4xl font-bold mb-1">Verifier Dashboard</h1>
                    <p className="text-muted-foreground">Review and verify land registration applications</p>
                </div>
                <Button variant="outline" onClick={fetchLands} disabled={loading}>
                    <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mb-8">
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold">{allLands.length}</p>
                        <p className="text-sm text-muted-foreground mt-1">Total in Queue</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-yellow-500">{pendingReview.length}</p>
                        <p className="text-sm text-muted-foreground mt-1">Pending Review</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardContent className="pt-6 text-center">
                        <p className="text-3xl font-bold text-blue-500">{needsVerification.length}</p>
                        <p className="text-sm text-muted-foreground mt-1">Needs Verification</p>
                    </CardContent>
                </Card>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="review" className="w-full">
                <TabsList className="grid w-full grid-cols-3 max-w-lg">
                    <TabsTrigger value="review">
                        Pending Review ({pendingReview.length})
                    </TabsTrigger>
                    <TabsTrigger value="verify">
                        Needs Verification ({needsVerification.length})
                    </TabsTrigger>
                    <TabsTrigger value="disputes">
                        Disputes (0)
                    </TabsTrigger>
                </TabsList>

                <TabsContent value="review" className="mt-6">
                    <LandGrid
                        lands={pendingReview}
                        emptyTitle="No Applications Pending Review"
                        emptyDesc="No new land registrations to review right now."
                        hint="These applications have been submitted by landowners. Review the uploaded documents, then mint the land to the blockchain to proceed."
                    />
                </TabsContent>

                <TabsContent value="verify" className="mt-6">
                    <LandGrid
                        lands={needsVerification}
                        emptyTitle="No Lands Awaiting Verification"
                        emptyDesc="All minted lands have been reviewed."
                        hint="These lands are minted on-chain. Open each one to approve or reject the registration."
                    />
                </TabsContent>

                <TabsContent value="disputes" className="mt-6">
                    <EmptyState
                        icon={AlertCircle}
                        title="No Active Disputes"
                        desc="Dispute resolution feature coming soon."
                    />
                </TabsContent>
            </Tabs>
        </div>
    );
};

export default VerifierDashboard;
