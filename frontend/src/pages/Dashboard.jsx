import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Building,
  FileCheck,
  Clock,
  TrendingUp,
  AlertCircle,
  CheckCircle,
  Activity,
  DollarSign,
  Map,
  FileText,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Loader2,
  ShieldCheck,
  X,
  Link,
  ExternalLink,
  Hash,
  Trash2,
  User,
  ShieldAlert,
  ShieldOff,
  Send,
  Mail,
  Tag,
  Ban,
  ThumbsUp,
} from 'lucide-react';
import { landAPI, userAPI } from '@/services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

  // Verify Ownership Modal state
  const [verifyModalOpen, setVerifyModalOpen] = useState(false);
  const [verifyLandId, setVerifyLandId] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [verifyResult, setVerifyResult] = useState(null);
  const [verifyError, setVerifyError] = useState(null);

  // Escrow Transfers State
  const [transfers, setTransfers] = useState({ incoming: [], outgoing: [] });
  const [transferModalOpen, setTransferModalOpen] = useState(false);
  const [transferLandId, setTransferLandId] = useState('');
  const [transferEmail, setTransferEmail] = useState('');
  const [transferring, setTransferring] = useState(false);
  const [verifiedUser, setVerifiedUser] = useState(null);
  const [verifyingUser, setVerifyingUser] = useState(false);

  const handleDeleteRejected = async (landId) => {
    if (!window.confirm("Are you sure you want to delete this rejected application? You can register it again later.")) return;
    try {
      await landAPI.deleteLand(landId);
      toast.success('Rejected application deleted successfully');
      fetchDashboardData();
    } catch (err) {
      toast.error(err?.response?.data?.detail || 'Failed to delete application');
    }
  };

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [landsData, transfersData] = await Promise.all([
        landAPI.getMyLands(),
        landAPI.getMyTransfers()
      ]);
      setLands(landsData);
      setTransfers(transfersData);
    } catch (err) {
      console.error('Failed to fetch dashboard data:', err);
      toast.error('Failed to load dashboard data');
    } finally {
      setLoading(false);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchDashboardData();
  }, []);

  const dashboardStats = [
    {
      title: 'Total Properties',
      value: lands.length.toString(),
      change: `+${lands.length}`,
      trend: 'up',
      icon: Building,
      color: 'primary',
    },
    {
      title: 'Verified Assets',
      value: lands.filter(l => l.status === 'approved').length.toString(),
      change: '+0',
      trend: 'up',
      icon: CheckCircle,
      color: 'success',
    },
    {
      title: 'Pending Actions',
      value: lands.filter(l => l.status === 'pending').length.toString(),
      change: '0',
      trend: 'down',
      icon: Clock,
      color: 'warning',
    },
    {
      title: 'Total Value',
      value: `₹${(lands.reduce((sum, land) => sum + (land.price || 0), 0) / 100000).toFixed(1)}L`,
      change: '+0%',
      trend: 'up',
      icon: TrendingUp,
      color: 'secondary',
    },
  ];

  const recentActivity = lands.slice(0, 4).map((land) => ({
    type: land.status === 'pending' ? 'pending' : 'registration',
    title: land.status === 'pending' ? 'Pending Approval' : 'Property Registered',
    property: land.id.substring(0, 12).toUpperCase(),
    timestamp: new Date(land.created_at).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }),
    status: land.status === 'pending' ? 'pending' : 'completed',
  }));

  const isVerified = (status) => status === 'approved' || status === 'verified';

  const getStatusBadge = (status) => {
    if (isVerified(status)) return 'bg-success/10 text-success border-success/30';
    if (status === 'rejected') return 'bg-destructive/10 text-destructive border-destructive/30';
    return 'bg-warning/10 text-warning border-warning/30';
  };

  const getStatusLabel = (status) => {
    if (isVerified(status)) return 'Verified';
    if (status === 'rejected') return 'Rejected';
    return 'Pending';
  };

  // ── Verify Ownership handlers ────────────────────────────────────────────
  const openVerifyModal = () => {
    setVerifyLandId(lands.length > 0 ? lands[0].id : '');
    setVerifyResult(null);
    setVerifyError(null);
    setVerifyModalOpen(true);
  };

  const handleVerifyOwnership = async () => {
    if (!verifyLandId) return;
    setVerifying(true);
    setVerifyResult(null);
    setVerifyError(null);
    try {
      const result = await landAPI.verifyOwnership(verifyLandId);
      setVerifyResult(result);
    } catch (err) {
      const msg = err?.response?.data?.detail || 'Verification failed. Please try again.';
      setVerifyError(msg);
      toast.error(msg);
    } finally {
      setVerifying(false);
    }
  };

  // ── Escrow & Marketplace Handlers ────────────────────────────────────────

  const handleToggleForSale = async (landId, currentStatus) => {
    try {
      await landAPI.toggleForSale(landId, !currentStatus);
      toast.success(!currentStatus ? 'Property active on Marketplace' : 'Property unlisted');
      fetchDashboardData();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Failed to update sale status'); }
  };

  const handleMarkPaid = async (landId) => {
    try {
      await landAPI.markTransferPaid(landId);
      toast.success('Transfer marked as paid! Waiting for seller release.');
      fetchDashboardData();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Failed to mark as paid'); }
  };

  const handleRelease = async (landId) => {
    try {
      await landAPI.releaseTransfer(landId);
      toast.success('Property successfully transferred to buyer!');
      fetchDashboardData();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Failed to release property'); }
  };

  const handleDispute = async (landId) => {
    try {
      await landAPI.disputeTransfer(landId, "Buyer disputes that seller has not released property after payment.");
      toast.success('Dispute raised successfully. Admin will intervene.');
      fetchDashboardData();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Failed to raise dispute'); }
  };

  const executeTransfer = async () => {
    if (!transferEmail) return toast.error('Please enter buyer email');
    try {
      setTransferring(true);
      await landAPI.initiateTransfer(transferLandId, transferEmail);
      toast.success('Transfer initiated. Property is locked until buyer pays.');
      setTransferModalOpen(false);
      setTransferEmail('');
      fetchDashboardData();
    } catch (err) { toast.error(err?.response?.data?.detail || 'Failed to initiate transfer'); }
    finally { setTransferring(false); }
  };

  const handleVerifyEmail = async () => {
    if (!transferEmail) return;
    setVerifyingUser(true);
    setVerifiedUser(null);
    try {
      const user = await userAPI.lookupUserByEmail(transferEmail);
      setVerifiedUser(user);
    } catch (err) {
      toast.error('User not found with that email address');
    } finally {
      setVerifyingUser(false);
    }
  };

  // ── VerifyOwnershipModal ─────────────────────────────────────────────────
  const blockchainStatusConfig = {
    verified: { label: 'Verified', icon: ShieldCheck, cls: 'bg-success/10 text-success border-success/30' },
    pending: { label: 'Pending', icon: ShieldAlert, cls: 'bg-warning/10 text-warning border-warning/30' },
    not_minted: { label: 'Not Minted', icon: ShieldOff, cls: 'bg-muted/60 text-muted-foreground border-border' },
    rejected: { label: 'Rejected', icon: AlertCircle, cls: 'bg-destructive/10 text-destructive border-destructive/30' },
  };

  const renderVerifyOwnershipModal = () => {
    if (!verifyModalOpen) return null;
    const cfg = blockchainStatusConfig[verifyResult?.blockchain_status] || blockchainStatusConfig.not_minted;
    const StatusIcon = cfg.icon;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-background/80 backdrop-blur-sm"
          onClick={() => setVerifyModalOpen(false)}
        />
        {/* Panel */}
        <div className="relative z-10 w-full max-w-lg rounded-xl border border-border/60 bg-card shadow-2xl">
          {/* Header */}
          <div className="flex items-center justify-between border-b border-border/50 px-6 py-4">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-5 w-5 text-primary" />
              <h2 className="text-lg font-semibold font-['Space_Grotesk']">Verify Property Ownership</h2>
            </div>
            <button
              onClick={() => setVerifyModalOpen(false)}
              className="rounded-md p-1 text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="px-6 py-5 space-y-5">
            {/* Property selector */}
            <div className="space-y-2">
              <label className="text-sm font-medium text-muted-foreground">Select Property</label>
              {lands.length === 0 ? (
                <p className="text-sm text-muted-foreground">No properties registered yet.</p>
              ) : (
                <select
                  value={verifyLandId}
                  onChange={(e) => { setVerifyLandId(e.target.value); setVerifyResult(null); setVerifyError(null); }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                >
                  {lands.map((land) => (
                    <option key={land.id} value={land.id}>
                      {land.title} — {land.id.substring(0, 12).toUpperCase()}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Verify button */}
            <Button
              variant="gradient"
              className="w-full"
              disabled={!verifyLandId || verifying}
              onClick={handleVerifyOwnership}
            >
              {verifying ? (
                <><Loader2 className="mr-2 h-4 w-4 animate-spin" /> Verifying on Blockchain...</>
              ) : (
                <><ShieldCheck className="mr-2 h-4 w-4" /> Verify Ownership</>
              )}
            </Button>

            {/* Error */}
            {verifyError && (
              <div className="rounded-lg border border-destructive/30 bg-destructive/10 px-4 py-3 text-sm text-destructive flex items-start gap-2">
                <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
                <span>{verifyError}</span>
              </div>
            )}

            {/* Result */}
            {verifyResult && (
              <div className="space-y-4 rounded-lg border border-border/60 bg-muted/30 p-4">
                {/* Status row */}
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium">{verifyResult.title}</span>
                  <Badge variant="outline" className={cfg.cls}>
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {cfg.label}
                  </Badge>
                </div>

                <div className="divide-y divide-border/40 space-y-0">
                  {/* Token ID */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Hash className="h-3 w-3" /> Token ID</span>
                    <span className="text-xs font-mono font-medium">{verifyResult.token_id ?? '—'}</span>
                  </div>

                  {/* On-chain owner */}
                  <div className="flex items-center justify-between py-2 gap-4">
                    <span className="text-xs text-muted-foreground flex items-center gap-1 shrink-0"><User className="h-3 w-3" /> On-chain Owner</span>
                    <span className="text-xs font-mono truncate max-w-[220px] text-right">
                      {verifyResult.on_chain_owner
                        ? `${verifyResult.on_chain_owner.substring(0, 8)}…${verifyResult.on_chain_owner.slice(-6)}`
                        : '—'}
                    </span>
                  </div>

                  {/* Ownership badge */}
                  <div className="flex items-center justify-between py-2">
                    <span className="text-xs text-muted-foreground">Ownership</span>
                    <Badge variant="outline" className={verifyResult.is_owned_by_current_user
                      ? 'bg-success/10 text-success border-success/30'
                      : 'bg-destructive/10 text-destructive border-destructive/30'}>
                      {verifyResult.is_owned_by_current_user ? '✓ Confirmed Owner' : '✗ Not Your Property'}
                    </Badge>
                  </div>

                  {/* IPFS */}
                  {verifyResult.ipfs_url && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Link className="h-3 w-3" /> IPFS Document</span>
                      <a
                        href={verifyResult.ipfs_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary underline underline-offset-2 flex items-center gap-1 hover:text-primary/80"
                      >
                        View on IPFS <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Etherscan */}
                  {verifyResult.etherscan_url && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><ExternalLink className="h-3 w-3" /> Transaction</span>
                      <a
                        href={verifyResult.etherscan_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-xs text-primary underline underline-offset-2 flex items-center gap-1 hover:text-primary/80"
                      >
                        View on Etherscan <ExternalLink className="h-3 w-3" />
                      </a>
                    </div>
                  )}

                  {/* Verified at */}
                  {verifyResult.verified_at && (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="h-3 w-3" /> Verified At</span>
                      <span className="text-xs">{new Date(verifyResult.verified_at).toLocaleString('en-IN')}</span>
                    </div>
                  )}

                  {/* Rejection reason */}
                  {verifyResult.rejection_reason && (
                    <div className="pt-2">
                      <p className="text-xs text-destructive flex items-start gap-1">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        <span><span className="font-medium">Rejection reason:</span> {verifyResult.rejection_reason}</span>
                      </p>
                    </div>
                  )}

                  {/* Not minted message */}
                  {verifyResult.blockchain_status === 'not_minted' && (
                    <div className="pt-2">
                      <p className="text-xs text-muted-foreground flex items-start gap-1">
                        <Clock className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        This property hasn't been minted on-chain yet. It is awaiting verifier action.
                      </p>
                    </div>
                  )}

                  {/* Pending verification message */}
                  {verifyResult.blockchain_status === 'pending' && (
                    <div className="pt-2">
                      <p className="text-xs text-warning flex items-start gap-1">
                        <AlertCircle className="h-3.5 w-3.5 mt-0.5 shrink-0" />
                        This property is pending independent verifications. Current progress: <strong>{verifyResult.verification_count || 0} / 3 Approvals</strong>. It will be fully completed upon the 3rd approval.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  };



  // ── InitiateTransferModal ────────────────────────────────────────────────
  const renderInitiateTransferModal = () => {
    if (!transferModalOpen) return null;
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-background/80 backdrop-blur-sm" onClick={() => setTransferModalOpen(false)} />
        <div className="relative z-10 w-full max-w-sm rounded-xl border border-border/60 bg-card p-6 shadow-2xl">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-xl font-bold font-['Space_Grotesk']">Initiate Transfer</h2>
            <button onClick={() => setTransferModalOpen(false)}><X className="h-4 w-4" /></button>
          </div>
          <p className="text-sm text-muted-foreground mb-4">
            Enter the buyer's email address and verify it. Once initiated, the property will be locked for them to manually pay you offline.
          </p>
          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Buyer Email</label>
              <div className="flex gap-2 mt-1">
                <input
                  type="email"
                  placeholder="buyer@example.com"
                  value={transferEmail}
                  onChange={(e) => {
                    setTransferEmail(e.target.value);
                    setVerifiedUser(null);
                  }}
                  className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm"
                />
                <Button variant="outline" onClick={handleVerifyEmail} disabled={!transferEmail || verifyingUser}>
                  {verifyingUser ? <Loader2 className="h-4 w-4 animate-spin" /> : "Verify"}
                </Button>
              </div>
              {verifiedUser && (
                <div className="text-xs text-success flex items-center mt-2">
                  <CheckCircle className="h-3 w-3 mr-1" />
                  Verified User: {verifiedUser.full_name}
                </div>
              )}
            </div>
            <Button variant="gradient" className="w-full" disabled={transferring || !verifiedUser} onClick={executeTransfer}>
              {transferring ? <Loader2 className="h-4 w-4 animate-spin mr-2" /> : <Send className="h-4 w-4 mr-2" />}
              Send Transfer Request
            </Button>
          </div>
        </div>
      </div>
    );
  };

  const PropertyCard = ({ land, onClick, children }) => {
    const verified = isVerified(land.status);
    const rejected = land.status === 'rejected';
    const property = {
      id: land.id.substring(0, 12).toUpperCase(),
      address: land.location?.address || 'Address not available',
      status: land.status || 'pending',
      area: `${land.area.toLocaleString()} sq ft`,
      value: `₹${(land.price / 100000).toFixed(2)}L`,
      date: new Date(land.created_at).toLocaleDateString('en-IN'),
    };
    return (
      <div
        className={`p-4 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-all duration-300 cursor-pointer border-l-4 ${verified
          ? 'border-border/50 border-l-success hover:border-l-success'
          : rejected
            ? 'border-border/50 border-l-destructive hover:border-l-destructive'
            : 'border-border/50 border-l-warning hover:border-l-warning'
          } ${onClick ? 'hover:border-primary/50' : ''}`}
        onClick={onClick}
      >
        <div className="flex items-start justify-between mb-3">
          <div className="space-y-1">
            <div className="flex items-center space-x-2">
              <h3 className="font-semibold">{property.id}</h3>
              <Badge variant="outline" className={getStatusBadge(property.status)}>
                {verified ? (
                  <CheckCircle className="h-3 w-3 mr-1" />
                ) : rejected ? (
                  <X className="h-3 w-3 mr-1" />
                ) : (
                  <Clock className="h-3 w-3 mr-1" />
                )}
                {getStatusLabel(property.status)}
                {property.status === 'pending' && property.verification_count !== undefined ? ` (${property.verification_count}/3)` : ''}
              </Badge>
            </div>
            <p className="text-sm text-muted-foreground">{property.address}</p>
          </div>
          <div className="text-right">
            <div className="font-bold text-primary">{property.value}</div>
            <div className="text-xs text-muted-foreground">{property.area}</div>
          </div>
        </div>
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <div className="flex items-center space-x-1">
            <Calendar className="h-3 w-3" />
            <span>{property.date}</span>
          </div>
          {!verified && !rejected && (
            <span className="text-warning text-xs font-medium flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Awaiting approval
            </span>
          )}
          {rejected && (
            <span className="text-destructive text-xs font-medium flex items-center gap-1">
              <X className="h-3 w-3" /> Rejected
            </span>
          )}
        </div>
        {children && (
          <div className="mt-4 pt-4 border-t border-border/50" onClick={(e) => e.stopPropagation()}>
            {children}
          </div>
        )}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4">
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="py-12">
              <div className="flex flex-col items-center justify-center space-y-4">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
                <p className="text-muted-foreground">Loading your properties...</p>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      {renderVerifyOwnershipModal()}
      {renderInitiateTransferModal()}
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] mb-2">
              Dashboard
            </h1>
            <p className="text-muted-foreground">
              Welcome back! Here's an overview of your property portfolio.
            </p>
          </div>
          <Button variant="gradient" onClick={() => navigate('/register')}>
            <Building className="mr-2 h-4 w-4" />
            Register New Property
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {dashboardStats.map((stat, index) => (
            <Card
              key={index}
              className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300"
            >
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                  <stat.icon className={`h-4 w-4 text-${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex items-baseline justify-between">
                  <div className="text-2xl font-bold font-['Space_Grotesk']">{stat.value}</div>
                  <Badge
                    variant="outline"
                    className={`${stat.trend === 'up'
                      ? 'bg-success/10 text-success border-success/30'
                      : 'bg-destructive/10 text-destructive border-destructive/30'
                      }`}
                  >
                    {stat.trend === 'up' ? (
                      <ArrowUpRight className="h-3 w-3 mr-1" />
                    ) : (
                      <ArrowDownRight className="h-3 w-3 mr-1" />
                    )}
                    {stat.change}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Main Content Grid */}
        <div className="grid lg:grid-cols-3 gap-6">
          {/* Properties List */}
          <div className="lg:col-span-2">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>My Properties</CardTitle>
                <CardDescription>Recent property registrations and updates</CardDescription>
              </CardHeader>
              <CardContent>
                <Tabs defaultValue="all" className="w-full">
                  <TabsList className="grid w-full grid-cols-6 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="verified">Verified</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
                    <TabsTrigger value="rejected">Rejected</TabsTrigger>
                    <TabsTrigger value="incoming">Incoming</TabsTrigger>
                    <TabsTrigger value="outgoing">Outgoing</TabsTrigger>
                  </TabsList>

                  <TabsContent value="all" className="space-y-4">
                    {lands.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No properties yet. Register your first property!</p>
                    ) : (
                      lands.map((land) => (
                        <PropertyCard
                          key={land.id}
                          land={land}
                          onClick={() =>
                            setSelectedProperty({
                              id: land.id.substring(0, 12).toUpperCase(),
                              address: land.location?.address || 'Address not available',
                              status: land.status || 'pending',
                            })
                          }
                        />
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="verified" className="space-y-4">
                    {lands.filter((p) => isVerified(p.status)).length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No verified properties yet.</p>
                    ) : (
                      lands
                        .filter((p) => isVerified(p.status))
                        .map((land) => (
                          <PropertyCard key={land.id} land={land}>
                            <div className="flex gap-2">
                              {land.transfer_status === 'none' && (
                                <>
                                  <Button 
                                    variant={land.is_for_sale ? "outline" : "default"} 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => handleToggleForSale(land.id, land.is_for_sale)}
                                  >
                                    <Tag className="h-4 w-4 mr-2" />
                                    {land.is_for_sale ? "Unlist from Marketplace" : "List on Marketplace"}
                                  </Button>
                                  <Button 
                                    variant="secondary" 
                                    size="sm" 
                                    className="flex-1"
                                    onClick={() => { setTransferLandId(land.id); setTransferModalOpen(true); }}
                                  >
                                    <Send className="h-4 w-4 mr-2" />
                                    Transfer Property
                                  </Button>
                                </>
                              )}
                              {land.transfer_status !== 'none' && (
                                <p className="text-sm font-medium text-warning w-full text-center">
                                  Property is currently locked in an escrow transfer.
                                </p>
                              )}
                            </div>
                          </PropertyCard>
                        ))
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-4">
                    {lands.filter((p) => !isVerified(p.status) && p.status !== 'rejected').length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No pending properties.</p>
                    ) : (
                      lands
                        .filter((p) => !isVerified(p.status) && p.status !== 'rejected')
                        .map((land) => <PropertyCard key={land.id} land={land} />)
                    )}
                  </TabsContent>

                  <TabsContent value="rejected" className="space-y-4">
                    {lands.filter((p) => p.status === 'rejected').length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No rejected properties.</p>
                    ) : (
                      lands
                        .filter((p) => p.status === 'rejected')
                        .map((land) => (
                          <PropertyCard key={land.id} land={land}>
                            {land.rejection_reason && (
                              <div className="bg-destructive/10 rounded-md p-3 mb-3 border border-destructive/20 text-destructive text-sm flex items-start">
                                <AlertCircle className="w-4 h-4 mr-2 shrink-0 mt-0.5" />
                                <div>
                                  <div className="font-semibold mb-1">Rejection Reason:</div>
                                  <div>{land.rejection_reason}</div>
                                </div>
                              </div>
                            )}
                            <Button 
                              variant="destructive" 
                              size="sm" 
                              className="w-full mt-2" 
                              onClick={(e) => { e.stopPropagation(); handleDeleteRejected(land.id); }}
                            >
                              <Trash2 className="h-4 w-4 mr-2" />
                              Delete Application
                            </Button>
                          </PropertyCard>
                        ))
                    )}
                  </TabsContent>

                  <TabsContent value="incoming" className="space-y-4">
                    {transfers.incoming.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No incoming transfer requests.</p>
                    ) : (
                      transfers.incoming.map((land) => (
                        <PropertyCard key={land.id} land={land}>
                          <div className="bg-primary/5 rounded-md p-3 mb-3 border border-primary/20">
                            <h4 className="text-sm font-semibold mb-1">Transfer Request Received</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              The seller has locked this property for you. Please proceed to pay them manually, then click "Mark as Paid".
                            </p>
                            <div className="flex gap-2">
                              {land.transfer_status === 'pending' && (
                                <Button variant="gradient" size="sm" className="w-full" onClick={() => handleMarkPaid(land.id)}>
                                  <ThumbsUp className="h-4 w-4 mr-2" />
                                  I Have Paid
                                </Button>
                              )}
                              {land.transfer_status === 'paid' && (
                                <Button variant="outline" size="sm" className="w-full" disabled>
                                  <Clock className="h-4 w-4 mr-2" /> Waiting for Seller Release...
                                </Button>
                              )}
                              {land.transfer_status === 'paid' && (
                                <Button variant="destructive" size="sm" onClick={() => handleDispute(land.id)} title="Seller didn't release?">
                                  <Ban className="h-4 w-4" />
                                </Button>
                              )}
                              {land.transfer_status === 'disputed' && (
                                <div className="text-destructive text-sm font-semibold text-center w-full">In Dispute - Admin will mediate</div>
                              )}
                            </div>
                          </div>
                        </PropertyCard>
                      ))
                    )}
                  </TabsContent>

                  <TabsContent value="outgoing" className="space-y-4">
                    {transfers.outgoing.length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No outgoing transfer requests.</p>
                    ) : (
                      transfers.outgoing.map((land) => (
                        <PropertyCard key={land.id} land={land}>
                          <div className="bg-secondary/5 rounded-md p-3 mb-3 border border-secondary/20">
                            <h4 className="text-sm font-semibold mb-1">Outgoing Escrow Transfer</h4>
                            <p className="text-xs text-muted-foreground mb-3">
                              This property is locked for the buyer. After you receive full offline payment, release it to them.
                            </p>
                            <div className="flex gap-2">
                              {land.transfer_status === 'pending' && (
                                <Button variant="outline" size="sm" className="w-full" disabled>
                                  <Clock className="h-4 w-4 mr-2" /> Waiting for Buyer Payment...
                                </Button>
                              )}
                              {land.transfer_status === 'paid' && (
                                <Button variant="success" size="sm" className="w-full bg-success hover:bg-success/90 text-white" onClick={() => handleRelease(land.id)}>
                                  <CheckCircle className="h-4 w-4 mr-2" />
                                  Verify Payment & Release Property
                                </Button>
                              )}
                              {land.transfer_status === 'disputed' && (
                                <div className="text-destructive text-sm font-semibold text-center w-full">In Dispute - Admin will mediate</div>
                              )}
                            </div>
                          </div>
                        </PropertyCard>
                      ))
                    )}
                  </TabsContent>
                </Tabs>
              </CardContent>
            </Card>
          </div>

          {/* Activity Sidebar */}
          <div className="space-y-6">
            {/* Recent Activity */}
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Activity className="h-5 w-5 mr-2 text-primary" />
                  Recent Activity
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                {recentActivity.length > 0 ? (
                  recentActivity.map((activity, index) => (
                    <div
                      key={index}
                      className="flex items-start space-x-3 pb-4 border-b border-border/50 last:border-0 last:pb-0"
                    >
                      <div
                        className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${activity.status === 'completed'
                          ? 'bg-success/10 text-success'
                          : activity.status === 'pending'
                            ? 'bg-warning/10 text-warning'
                            : 'bg-info/10 text-info'
                          }`}
                      >
                        {activity.status === 'completed' ? (
                          <CheckCircle className="h-4 w-4" />
                        ) : activity.status === 'pending' ? (
                          <Clock className="h-4 w-4" />
                        ) : (
                          <Activity className="h-4 w-4" />
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium">{activity.title}</p>
                        <p className="text-xs text-muted-foreground">{activity.property}</p>
                        <p className="text-xs text-muted-foreground mt-1">{activity.timestamp}</p>
                      </div>
                    </div>
                  ))
                ) : (
                  <p className="text-center text-muted-foreground py-4">No recent activity.</p>
                )}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="bg-gradient-to-br from-primary/10 via-secondary/10 to-accent/10 border-primary/30">
              <CardHeader>
                <CardTitle>Quick Actions</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Map className="mr-2 h-4 w-4" />
                  View Property Map
                </Button>
                <Button variant="outline" className="w-full justify-start" onClick={openVerifyModal}>
                  <ShieldCheck className="mr-2 h-4 w-4" />
                  Verify Ownership
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <DollarSign className="mr-2 h-4 w-4" />
                  Request Valuation
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};
