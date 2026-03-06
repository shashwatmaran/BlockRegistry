import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Search,
  Copy,
  ExternalLink,
  Clock,
  CheckCircle,
  Activity,
  Box,
  FileText,
  Zap,
  TrendingUp,
  Users,
  Building,
  Hash,
  Loader2,
  AlertCircle,
  Wifi,
  WifiOff,
  XCircle,
} from 'lucide-react';
import { toast } from 'sonner';
import { explorerAPI } from '@/services/api';

export const Explorer = () => {
  const [searchTerm, setSearchTerm] = useState('');

  // API state
  const [stats, setStats] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [properties, setProperties] = useState([]);
  const [network, setNetwork] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [statsData, txData, propsData, networkData] = await Promise.all([
          explorerAPI.getStats(),
          explorerAPI.getTransactions(),
          explorerAPI.getProperties(),
          explorerAPI.getNetwork(),
        ]);
        setStats(statsData);
        setTransactions(txData);
        setProperties(propsData);
        setNetwork(networkData);
      } catch (err) {
        console.error('Explorer fetch error:', err);
        setError('Failed to load explorer data.');
        toast.error('Failed to load blockchain explorer data');
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, []);

  const networkStats = stats
    ? [
      {
        label: 'Properties Registered',
        value: stats.total_properties.toLocaleString(),
        icon: Building,
        trend: `+${stats.total_properties}`,
        color: 'primary',
      },
      {
        label: 'Verified On-Chain',
        value: stats.verified_properties.toLocaleString(),
        icon: CheckCircle,
        trend: `${stats.verified_properties}`,
        color: 'success',
      },
      {
        label: 'Pending Review',
        value: stats.pending_properties.toLocaleString(),
        icon: Activity,
        trend: `${stats.pending_properties}`,
        color: 'secondary',
      },
      {
        label: 'Active Users',
        value: stats.active_users.toLocaleString(),
        icon: Users,
        trend: `+${stats.active_users}`,
        color: 'accent',
      },
    ]
    : [];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  // Filter helper
  const filterBySearch = (items, keys) => {
    if (!searchTerm.trim()) return items;
    const q = searchTerm.toLowerCase();
    return items.filter((item) =>
      keys.some((k) => String(item[k] ?? '').toLowerCase().includes(q))
    );
  };

  const filteredTxns = filterBySearch(transactions, ['hash', 'type', 'value', 'from']);
  const filteredProps = filterBySearch(properties, ['prop_id', 'title', 'address']);

  const statusIcon = (status) => {
    if (status === 'confirmed' || status === 'verified')
      return <CheckCircle className="h-3 w-3 mr-1" />;
    if (status === 'rejected')
      return <XCircle className="h-3 w-3 mr-1" />;
    return <Clock className="h-3 w-3 mr-1" />;
  };

  const statusClass = (status) => {
    if (status === 'confirmed' || status === 'verified')
      return 'bg-success/10 text-success border-success/30';
    if (status === 'rejected')
      return 'bg-destructive/10 text-destructive border-destructive/30';
    return 'bg-warning/10 text-warning border-warning/30';
  };

  const blockchainStatusClass = (s) => {
    if (s === 'verified') return 'bg-success/10 text-success border-success/30';
    if (s === 'rejected') return 'bg-destructive/10 text-destructive border-destructive/30';
    if (s === 'pending') return 'bg-warning/10 text-warning border-warning/30';
    return 'bg-muted/50 text-muted-foreground border-border/50';
  };

  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading blockchain explorer…</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <Card className="bg-card/50 backdrop-blur-sm max-w-md w-full">
            <CardContent className="py-12 flex flex-col items-center space-y-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-muted-foreground text-center">{error}</p>
              <Button variant="outline" onClick={() => window.location.reload()}>
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk']">
            Blockchain Explorer
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            View real-time blockchain activity, transactions, and property records on Sepolia
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by transaction hash, property ID, or address…"
                className="pl-12 h-12 text-base"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
              <Button
                variant="gradient"
                className="absolute right-2 top-1/2 transform -translate-y-1/2"
              >
                Search
              </Button>
            </div>
          </div>
        </div>

        {/* Network Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {networkStats.map((stat, index) => {
            const Icon = stat.icon;
            return (
              <Card
                key={index}
                className="relative overflow-hidden bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-2">
                    <div className={`p-2 rounded-lg bg-${stat.color}/10`}>
                      <Icon className={`h-5 w-5 text-${stat.color}`} />
                    </div>
                    <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                      {stat.trend}
                    </Badge>
                  </div>
                  <div className="text-2xl font-bold font-['Space_Grotesk'] mb-1">
                    {stat.value}
                  </div>
                  <div className="text-xs text-muted-foreground">{stat.label}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Main Content */}
        <Tabs defaultValue="transactions" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="network">
              <Zap className="h-4 w-4 mr-2" />
              Network
            </TabsTrigger>
            <TabsTrigger value="transactions">
              <Activity className="h-4 w-4 mr-2" />
              Transactions
            </TabsTrigger>
            <TabsTrigger value="properties">
              <Building className="h-4 w-4 mr-2" />
              Properties
            </TabsTrigger>
          </TabsList>

          {/* Network Overview Tab */}
          <TabsContent value="network" className="space-y-6">
            <div className="grid md:grid-cols-2 gap-6">
              {/* Live Sepolia Status */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    {network?.connected ? (
                      <Wifi className="h-5 w-5 mr-2 text-success" />
                    ) : (
                      <WifiOff className="h-5 w-5 mr-2 text-destructive" />
                    )}
                    Sepolia Network
                  </CardTitle>
                  <CardDescription>Live chain data from Web3 RPC</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Status</span>
                    <Badge
                      className={
                        network?.connected
                          ? 'bg-success/10 text-success border-success/30'
                          : 'bg-destructive/10 text-destructive border-destructive/30'
                      }
                    >
                      <div
                        className={`w-2 h-2 rounded-full mr-2 animate-pulse ${network?.connected ? 'bg-success' : 'bg-destructive'
                          }`}
                      />
                      {network?.connected ? 'Connected' : 'Disconnected'}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Network</span>
                    <span className="text-sm font-medium">{network?.network_name ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Chain ID</span>
                    <span className="text-sm font-mono">{network?.chain_id ?? '—'}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Latest Block</span>
                    <span className="text-sm font-mono font-medium">
                      {network?.latest_block != null
                        ? `#${network.latest_block.toLocaleString()}`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Gas Price</span>
                    <span className="text-sm font-medium">
                      {network?.gas_price_gwei != null
                        ? `${network.gas_price_gwei} Gwei`
                        : '—'}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Block Time</span>
                    <span className="text-sm font-medium">
                      {network?.block_time_seconds != null
                        ? `~${network.block_time_seconds}s`
                        : '~12s'}
                    </span>
                  </div>
                </CardContent>
              </Card>

              {/* Registry Stats */}
              <Card className="bg-card/50 backdrop-blur-sm">
                <CardHeader>
                  <CardTitle className="flex items-center text-lg">
                    <TrendingUp className="h-5 w-5 mr-2 text-primary" />
                    Registry Stats
                  </CardTitle>
                  <CardDescription>Land Registry smart contract statistics</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Total Properties</span>
                    <span className="text-sm font-bold">{stats?.total_properties ?? 0}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Verified</span>
                    <Badge className="bg-success/10 text-success border-success/30">
                      {stats?.verified_properties ?? 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Pending Review</span>
                    <Badge className="bg-warning/10 text-warning border-warning/30">
                      {stats?.pending_properties ?? 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Rejected</span>
                    <Badge className="bg-destructive/10 text-destructive border-destructive/30">
                      {stats?.rejected_properties ?? 0}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Active Users</span>
                    <span className="text-sm font-bold">{stats?.active_users ?? 0}</span>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Etherscan link */}
            <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
              <CardContent className="py-6 flex flex-col sm:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-3">
                  <Box className="h-6 w-6 text-primary" />
                  <div>
                    <p className="font-semibold">View on Etherscan</p>
                    <p className="text-sm text-muted-foreground">
                      Explore transactions directly on Sepolia Etherscan
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  onClick={() =>
                    window.open('https://sepolia.etherscan.io', '_blank', 'noopener')
                  }
                >
                  Open Etherscan
                  <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest land registry activity on the blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredTxns.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <Activity className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No transactions match your search.' : 'No transactions yet.'}
                    </p>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Tx / Land ID</TableHead>
                          <TableHead>Type</TableHead>
                          <TableHead>From</TableHead>
                          <TableHead>To</TableHead>
                          <TableHead>Property</TableHead>
                          <TableHead>Status</TableHead>
                          <TableHead>Time</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {filteredTxns.map((tx, i) => (
                          <TableRow
                            key={tx.hash || i}
                            className="hover:bg-muted/50 cursor-pointer transition-colors"
                          >
                            <TableCell>
                              <div className="flex items-center space-x-2">
                                <span className="font-mono text-xs truncate max-w-[100px]">
                                  {tx.hash
                                    ? `${tx.hash.slice(0, 10)}…${tx.hash.slice(-4)}`
                                    : tx.land_id}
                                </span>
                                {tx.hash && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() => copyToClipboard(tx.hash)}
                                  >
                                    <Copy className="h-3 w-3" />
                                  </Button>
                                )}
                                {tx.hash && tx.hash.startsWith('0x') && (
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-6 w-6"
                                    onClick={() =>
                                      window.open(
                                        `https://sepolia.etherscan.io/tx/${tx.hash}`,
                                        '_blank',
                                        'noopener'
                                      )
                                    }
                                  >
                                    <ExternalLink className="h-3 w-3" />
                                  </Button>
                                )}
                              </div>
                            </TableCell>
                            <TableCell>
                              <Badge variant="outline" className="text-xs whitespace-nowrap">
                                {tx.type}
                              </Badge>
                            </TableCell>
                            <TableCell className="font-mono text-xs">{tx.from}</TableCell>
                            <TableCell className="font-mono text-xs">{tx.to}</TableCell>
                            <TableCell className="font-medium text-xs">{tx.value}</TableCell>
                            <TableCell>
                              <Badge
                                variant="outline"
                                className={statusClass(tx.status)}
                              >
                                {statusIcon(tx.status)}
                                {tx.status}
                              </Badge>
                            </TableCell>
                            <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                              {tx.timestamp}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Property Records</CardTitle>
                <CardDescription>All land registrations on the blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                {filteredProps.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-12 space-y-2">
                    <Building className="h-8 w-8 text-muted-foreground" />
                    <p className="text-muted-foreground">
                      {searchTerm ? 'No properties match your search.' : 'No properties found.'}
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredProps.map((prop) => (
                      <div
                        key={prop.id}
                        className="p-4 rounded-lg border border-border/50 hover:border-primary/50 bg-muted/30 hover:bg-muted/50 transition-all duration-300 cursor-pointer"
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div className="space-y-2 flex-1 min-w-0">
                            <div className="flex items-center flex-wrap gap-2">
                              <Building className="h-4 w-4 text-primary shrink-0" />
                              <span className="font-semibold">{prop.prop_id}</span>
                              <span className="text-sm font-medium truncate">{prop.title}</span>
                              <Badge
                                variant="outline"
                                className={blockchainStatusClass(prop.blockchain_status)}
                              >
                                {prop.is_verified ? (
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                ) : prop.blockchain_status === 'rejected' ? (
                                  <XCircle className="h-3 w-3 mr-1" />
                                ) : (
                                  <Clock className="h-3 w-3 mr-1" />
                                )}
                                {prop.blockchain_status.replace('_', ' ')}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground truncate">{prop.address}</p>
                            <div className="flex items-center flex-wrap gap-4 text-xs text-muted-foreground">
                              {prop.token_id != null && (
                                <span className="flex items-center">
                                  <Hash className="h-3 w-3 mr-1" />
                                  Token #{prop.token_id}
                                </span>
                              )}
                              <span className="flex items-center">
                                <Clock className="h-3 w-3 mr-1" />
                                {prop.time_ago}
                              </span>
                              {prop.area > 0 && (
                                <span>{prop.area.toLocaleString()} sq ft</span>
                              )}
                            </div>
                          </div>
                          <div className="flex flex-col items-end gap-2 shrink-0">
                            {prop.price > 0 && (
                              <span className="font-bold text-primary text-sm">
                                ₹{(prop.price / 100000).toFixed(1)}L
                              </span>
                            )}
                            {prop.tx_hash && (
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() =>
                                  window.open(
                                    `https://sepolia.etherscan.io/tx/${prop.tx_hash}`,
                                    '_blank',
                                    'noopener'
                                  )
                                }
                              >
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Bottom Info Cards */}
        <div className="grid md:grid-cols-3 gap-6">
          <Card className="bg-gradient-to-br from-primary/10 to-secondary/10 border-primary/30">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <Zap className="h-5 w-5 mr-2 text-primary" />
                Network Status
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Status</span>
                  <Badge
                    className={
                      network?.connected
                        ? 'bg-success/10 text-success border-success/30'
                        : 'bg-destructive/10 text-destructive border-destructive/30'
                    }
                  >
                    <div
                      className={`w-2 h-2 rounded-full mr-2 ${network?.connected ? 'bg-success animate-pulse' : 'bg-destructive'
                        }`}
                    />
                    {network?.connected ? 'Active' : 'Offline'}
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Block Time</span>
                  <span className="text-sm font-medium">
                    {network?.block_time_seconds ? `~${network.block_time_seconds}s` : '~12s'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gas Price</span>
                  <span className="text-sm font-medium">
                    {network?.gas_price_gwei != null ? `${network.gas_price_gwei} Gwei` : '—'}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-secondary" />
                Registry Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Properties</span>
                  <span className="text-sm font-medium">+{stats?.total_properties ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Verified</span>
                  <span className="text-sm font-medium">+{stats?.verified_properties ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Wallets</span>
                  <span className="text-sm font-medium">+{stats?.active_users ?? 0}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2 text-accent" />
                Resources
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  size="sm"
                  onClick={() =>
                    window.open('https://sepolia.etherscan.io', '_blank', 'noopener')
                  }
                >
                  Sepolia Etherscan
                  <ExternalLink className="ml-auto h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  size="sm"
                  onClick={() =>
                    window.open('http://localhost:8000/docs', '_blank', 'noopener')
                  }
                >
                  API Documentation
                  <ExternalLink className="ml-auto h-3 w-3" />
                </Button>
                <Button
                  variant="ghost"
                  className="w-full justify-start text-sm"
                  size="sm"
                  onClick={() =>
                    window.open('https://ipfs.io', '_blank', 'noopener')
                  }
                >
                  IPFS Gateway
                  <ExternalLink className="ml-auto h-3 w-3" />
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};
