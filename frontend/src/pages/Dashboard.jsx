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
  User,
  ShieldAlert,
  ShieldOff,
} from 'lucide-react';
import { landAPI } from '@/services/api';
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

  // Fetch lands on mount
  useEffect(() => {
    const fetchLands = async () => {
      try {
        setLoading(true);
        const data = await landAPI.getMyLands();
        setLands(data);
      } catch (err) {
        console.error('Failed to fetch lands:', err);
        toast.error('Failed to load your properties');
      } finally {
        setLoading(false);
      }
    };
    fetchLands();
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

  const getStatusBadge = (status) =>
    isVerified(status)
      ? 'bg-success/10 text-success border-success/30'
      : 'bg-warning/10 text-warning border-warning/30';

  const getStatusLabel = (status) => (isVerified(status) ? 'Verified' : 'Pending');

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

  // ── VerifyOwnershipModal ─────────────────────────────────────────────────
  const blockchainStatusConfig = {
    verified: { label: 'Verified', icon: ShieldCheck, cls: 'bg-success/10 text-success border-success/30' },
    pending: { label: 'Pending', icon: ShieldAlert, cls: 'bg-warning/10 text-warning border-warning/30' },
    not_minted: { label: 'Not Minted', icon: ShieldOff, cls: 'bg-muted/60 text-muted-foreground border-border' },
    rejected: { label: 'Rejected', icon: AlertCircle, cls: 'bg-destructive/10 text-destructive border-destructive/30' },
  };

  const VerifyOwnershipModal = () => {
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



  const PropertyCard = ({ land, onClick }) => {
    const verified = isVerified(land.status);
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
          {!verified && (
            <span className="text-warning text-xs font-medium flex items-center gap-1">
              <AlertCircle className="h-3 w-3" /> Awaiting approval
            </span>
          )}
        </div>
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
      <VerifyOwnershipModal />
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
                  <TabsList className="grid w-full grid-cols-3 mb-4">
                    <TabsTrigger value="all">All</TabsTrigger>
                    <TabsTrigger value="verified">Verified</TabsTrigger>
                    <TabsTrigger value="pending">Pending</TabsTrigger>
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
                        .map((land) => <PropertyCard key={land.id} land={land} />)
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-4">
                    {lands.filter((p) => !isVerified(p.status)).length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No pending properties.</p>
                    ) : (
                      lands
                        .filter((p) => !isVerified(p.status))
                        .map((land) => <PropertyCard key={land.id} land={land} />)
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
