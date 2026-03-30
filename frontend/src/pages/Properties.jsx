import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  Filter,
  MapPin,
  Building,
  DollarSign,
  Calendar,
  CheckCircle,
  Clock,
  AlertCircle,
  Eye,
  Download,
  Share2,
  Maximize,
  Loader2,
  Hash,
  ExternalLink,
  XCircle,
  RefreshCw,
} from 'lucide-react';
import { toast } from 'sonner';
import { explorerAPI } from '@/services/api';

// ── Helpers ───────────────────────────────────────────────────────────────────

/** Pick a placeholder image based on keywords found in the property title */
const getPropertyImage = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('warehouse') || t.includes('industrial') || t.includes('factory') || t.includes('plant')) {
    return '/assets/property_industrial.png';
  }
  if (
    t.includes('office') || t.includes('commercial') || t.includes('shop') ||
    t.includes('retail') || t.includes('showroom') || t.includes('mall')
  ) {
    return '/assets/property_commercial.png';
  }
  // default → residential
  return '/assets/property_residential.png';
};

/** Map blockchain_status to badge colour classes + icon */
const getStatusInfo = (status) => {
  switch (status) {
    case 'verified':
      return { class: 'bg-success/10 text-success border-success/30', icon: CheckCircle, label: 'Verified' };
    case 'pending':
      return { class: 'bg-warning/10 text-warning border-warning/30', icon: Clock, label: 'Pending' };
    case 'rejected':
      return { class: 'bg-destructive/10 text-destructive border-destructive/30', icon: XCircle, label: 'Rejected' };
    default: // not_minted
      return { class: 'bg-muted/60 text-muted-foreground border-border/50', icon: AlertCircle, label: 'Not Minted' };
  }
};

/** Guess property type from title */
const getPropertyType = (title = '') => {
  const t = title.toLowerCase();
  if (t.includes('warehouse') || t.includes('industrial') || t.includes('factory')) return 'Industrial';
  if (t.includes('office') || t.includes('commercial') || t.includes('shop') || t.includes('retail')) return 'Commercial';
  return 'Residential';
};

// ── Component ─────────────────────────────────────────────────────────────────

export const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [filterType, setFilterType] = useState('all');
  const [sortBy, setSortBy] = useState('recent');
  const [viewMode, setViewMode] = useState('grid');

  // API state
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await explorerAPI.getProperties();
      setProperties(data);
    } catch (err) {
      console.error('Failed to fetch properties:', err);
      setError('Failed to load properties from the server.');
      toast.error('Could not load properties');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProperties();
  }, []);

  // ── Filtering & sorting ────────────────────────────────────────────────────
  const filtered = properties
    .filter((p) => {
      const q = searchTerm.toLowerCase();
      const matchSearch =
        !q ||
        (p.prop_id || '').toLowerCase().includes(q) ||
        (p.title || '').toLowerCase().includes(q) ||
        (p.address || '').toLowerCase().includes(q);

      const matchStatus = filterStatus === 'all' || p.blockchain_status === filterStatus;

      const type = getPropertyType(p.title);
      const matchType =
        filterType === 'all' ||
        filterType.toLowerCase() === type.toLowerCase();

      return matchSearch && matchStatus && matchType;
    })
    .sort((a, b) => {
      if (sortBy === 'value-high') return (b.price || 0) - (a.price || 0);
      if (sortBy === 'value-low') return (a.price || 0) - (b.price || 0);
      if (sortBy === 'area') return (b.area || 0) - (a.area || 0);
      // default: recent (order from API)
      return 0;
    });

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <div className="flex flex-col items-center space-y-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-muted-foreground">Loading properties…</p>
          </div>
        </div>
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────────────────────
  if (error) {
    return (
      <div className="min-h-screen py-8">
        <div className="container mx-auto px-4 flex items-center justify-center min-h-[60vh]">
          <Card className="bg-card/50 backdrop-blur-sm max-w-md w-full">
            <CardContent className="py-12 flex flex-col items-center space-y-4">
              <AlertCircle className="h-10 w-10 text-destructive" />
              <p className="text-muted-foreground text-center">{error}</p>
              <Button variant="outline" onClick={fetchProperties}>
                <RefreshCw className="mr-2 h-4 w-4" />
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 space-y-8">

        {/* Header */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk'] mb-2">
              Properties
            </h1>
            <p className="text-muted-foreground">
              Browse and manage blockchain-verified properties.
            </p>
          </div>
          <Button variant="gradient" onClick={fetchProperties}>
            <RefreshCw className="mr-2 h-4 w-4" />
            Refresh
          </Button>
        </div>

        {/* Filters and Search */}
        <Card className="bg-card/50 backdrop-blur-sm">
          <CardContent className="pt-6">
            <div className="flex flex-col lg:flex-row gap-4">
              {/* Search */}
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by ID, title, or address…"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[160px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="not_minted">Not Minted</SelectItem>
                    <SelectItem value="rejected">Rejected</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={filterType} onValueChange={setFilterType}>
                  <SelectTrigger className="w-[160px]">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={sortBy} onValueChange={setSortBy}>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="value-high">Value: High–Low</SelectItem>
                    <SelectItem value="value-low">Value: Low–High</SelectItem>
                    <SelectItem value="area">Area Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results count + view toggle */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filtered.length} of {properties.length} properties
              </p>
              <div className="flex gap-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  Grid
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'ghost'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  List
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Properties Grid / List */}
        {filtered.length > 0 ? (
          <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
            {filtered.map((property) => {
              const statusInfo = getStatusInfo(property.blockchain_status);
              const StatusIcon = statusInfo.icon;
              const propType = getPropertyType(property.title);
              const propImage = getPropertyImage(property.title);
              const formattedPrice =
                property.price > 0
                  ? `₹${(property.price / 100000).toFixed(1)}L`
                  : '—';
              const formattedArea =
                property.area > 0
                  ? `${Number(property.area).toLocaleString()} sq ft`
                  : '—';

              return (
                <Card
                  key={property.id}
                  className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)] overflow-hidden"
                >
                  {/* Property Image */}
                  <div className="relative h-48 overflow-hidden">
                    <img
                      src={propImage}
                      alt={property.title}
                      className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent" />

                    {/* Status Badge */}
                    <Badge
                      variant="outline"
                      className={`absolute top-3 right-3 ${statusInfo.class}`}
                    >
                      <StatusIcon className="h-3 w-3 mr-1" />
                      {statusInfo.label}
                    </Badge>

                    {/* Property Type */}
                    <Badge className="absolute top-3 left-3 bg-background/60 backdrop-blur-sm text-foreground">
                      {propType}
                    </Badge>
                  </div>

                  <CardHeader>
                    <div className="flex items-start justify-between">
                      <div className="space-y-1 flex-1 min-w-0">
                        <CardTitle className="text-lg group-hover:text-primary transition-colors truncate">
                          {property.title || 'Untitled Property'}
                        </CardTitle>
                        <CardDescription className="flex items-start">
                          <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                          <span className="text-xs line-clamp-1">{property.address || '—'}</span>
                        </CardDescription>
                      </div>
                    </div>
                  </CardHeader>

                  <CardContent className="space-y-4">
                    {/* Details */}
                    <div className="grid grid-cols-2 gap-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <Maximize className="h-4 w-4 text-primary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Area</p>
                          <p className="text-sm font-semibold">{formattedArea}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center flex-shrink-0">
                          <DollarSign className="h-4 w-4 text-secondary" />
                        </div>
                        <div>
                          <p className="text-xs text-muted-foreground">Value</p>
                          <p className="text-sm font-semibold">{formattedPrice}</p>
                        </div>
                      </div>
                    </div>

                    {/* Token ID (if minted) */}
                    {property.token_id != null && (
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <Hash className="h-3 w-3" />
                        <span>Token #{property.token_id}</span>
                      </div>
                    )}

                    {/* Footer */}
                    <div className="pt-4 border-t border-border/50 space-y-2">
                      <div className="flex items-center justify-between text-xs text-muted-foreground">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {property.time_ago}
                        </span>
                        <span className="font-mono truncate max-w-[120px]">{property.prop_id}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex gap-2 pt-2">
                      <Button variant="default" size="sm" className="flex-1">
                        <Eye className="h-3 w-3 mr-1" />
                        View Details
                      </Button>
                      {property.tx_hash && property.tx_hash.startsWith('0x') && (
                        <Button
                          variant="ghost"
                          size="sm"
                          title="View on Etherscan"
                          onClick={() =>
                            window.open(
                              `https://sepolia.etherscan.io/tx/${property.tx_hash}`,
                              '_blank',
                              'noopener'
                            )
                          }
                        >
                          <ExternalLink className="h-4 w-4" />
                        </Button>
                      )}
                      <Button variant="ghost" size="sm" title="Share">
                        <Share2 className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" title="Download">
                        <Download className="h-4 w-4" />
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">
                {properties.length === 0
                  ? 'No properties have been registered yet.'
                  : 'Try adjusting your search or filters'}
              </p>
              {properties.length > 0 && (
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('');
                    setFilterStatus('all');
                    setFilterType('all');
                  }}
                >
                  Clear Filters
                </Button>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
