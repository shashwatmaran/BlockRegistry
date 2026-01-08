import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
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
} from 'lucide-react';

export const Properties = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  const properties = [
    {
      id: 'PROP-2024-001',
      title: 'Modern Residential Property',
      address: '123 Blockchain Avenue, District 5',
      type: 'Residential',
      status: 'verified',
      area: '2,500 sq ft',
      value: '$450,000',
      owner: '0x7f3e...8e9f',
      registrationDate: '2024-01-15',
      image: 'https://images.unsplash.com/photo-1600596542815-ffad4c1539a9?w=800&q=80',
      features: ['3 Bedrooms', '2 Bathrooms', 'Garden', 'Parking'],
    },
    {
      id: 'PROP-2024-002',
      title: 'Commercial Office Space',
      address: '456 Ethereum Street, Zone 12',
      type: 'Commercial',
      status: 'pending',
      area: '3,200 sq ft',
      value: '$620,000',
      owner: '0x1a2b...1a2b',
      registrationDate: '2024-01-18',
      image: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
      features: ['Open Floor', 'Conference Room', 'Parking', 'Security'],
    },
    {
      id: 'PROP-2024-003',
      title: 'Urban Apartment Complex',
      address: '789 Smart Contract Lane, Sector 8',
      type: 'Residential',
      status: 'verified',
      area: '1,800 sq ft',
      value: '$380,000',
      owner: '0x9e8d...9e8d',
      registrationDate: '2024-01-20',
      image: 'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
      features: ['2 Bedrooms', '1 Bathroom', 'Balcony', 'Gym Access'],
    },
    {
      id: 'PROP-2024-004',
      title: 'Industrial Warehouse',
      address: '321 DeFi Boulevard, Industrial Park',
      type: 'Industrial',
      status: 'verified',
      area: '5,000 sq ft',
      value: '$850,000',
      owner: '0x4c5d...7e8f',
      registrationDate: '2024-01-22',
      image: 'https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?w=800&q=80',
      features: ['High Ceiling', 'Loading Bay', 'Office Area', 'Security'],
    },
    {
      id: 'PROP-2024-005',
      title: 'Luxury Villa',
      address: '555 Crypto Heights, Premium District',
      type: 'Residential',
      status: 'verified',
      area: '4,200 sq ft',
      value: '$1,200,000',
      owner: '0x2b3c...4d5e',
      registrationDate: '2024-01-25',
      image: 'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&q=80',
      features: ['5 Bedrooms', '4 Bathrooms', 'Pool', 'Smart Home'],
    },
    {
      id: 'PROP-2024-006',
      title: 'Retail Shop Space',
      address: '888 Token Plaza, Shopping District',
      type: 'Commercial',
      status: 'pending',
      area: '1,500 sq ft',
      value: '$320,000',
      owner: '0x6f7a...8b9c',
      registrationDate: '2024-01-28',
      image: 'https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=800&q=80',
      features: ['Street Facing', 'Storage', 'Display Windows', 'HVAC'],
    },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      verified: { class: 'bg-success/10 text-success border-success/30', icon: CheckCircle },
      pending: { class: 'bg-warning/10 text-warning border-warning/30', icon: Clock },
      disputed: { class: 'bg-destructive/10 text-destructive border-destructive/30', icon: AlertCircle },
    };
    return variants[status] || variants.pending;
  };

  const filteredProperties = properties.filter((property) => {
    const matchesSearch =
      property.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
      property.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || property.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

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
          <Button variant="gradient">
            <Building className="mr-2 h-4 w-4" />
            Add New Property
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
                  placeholder="Search by ID, address, or owner..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>

              {/* Filters */}
              <div className="flex flex-wrap gap-3">
                <Select value={filterStatus} onValueChange={setFilterStatus}>
                  <SelectTrigger className="w-[150px]">
                    <Filter className="h-4 w-4 mr-2" />
                    <SelectValue placeholder="Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="verified">Verified</SelectItem>
                    <SelectItem value="pending">Pending</SelectItem>
                    <SelectItem value="disputed">Disputed</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Property Type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Types</SelectItem>
                    <SelectItem value="residential">Residential</SelectItem>
                    <SelectItem value="commercial">Commercial</SelectItem>
                    <SelectItem value="industrial">Industrial</SelectItem>
                  </SelectContent>
                </Select>

                <Select>
                  <SelectTrigger className="w-[150px]">
                    <SelectValue placeholder="Sort By" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="recent">Most Recent</SelectItem>
                    <SelectItem value="value-high">Value: High-Low</SelectItem>
                    <SelectItem value="value-low">Value: Low-High</SelectItem>
                    <SelectItem value="area">Area Size</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            {/* Results Count */}
            <div className="mt-4 flex items-center justify-between">
              <p className="text-sm text-muted-foreground">
                Showing {filteredProperties.length} of {properties.length} properties
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

        {/* Properties Grid */}
        <div className={viewMode === 'grid' ? 'grid md:grid-cols-2 lg:grid-cols-3 gap-6' : 'space-y-4'}>
          {filteredProperties.map((property) => {
            const statusInfo = getStatusBadge(property.status);
            const StatusIcon = statusInfo.icon;

            return (
              <Card
                key={property.id}
                className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)] overflow-hidden"
              >
                {/* Property Image */}
                <div className="relative h-48 overflow-hidden">
                  <img
                    src={property.image}
                    alt={property.title}
                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-background/80 to-transparent"></div>
                  
                  {/* Status Badge */}
                  <Badge
                    variant="outline"
                    className={`absolute top-3 right-3 ${statusInfo.class}`}
                  >
                    <StatusIcon className="h-3 w-3 mr-1" />
                    {property.status}
                  </Badge>

                  {/* Property Type */}
                  <Badge className="absolute top-3 left-3 bg-background/50 backdrop-blur-sm">
                    {property.type}
                  </Badge>
                </div>

                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-1 flex-1">
                      <CardTitle className="text-lg group-hover:text-primary transition-colors">
                        {property.title}
                      </CardTitle>
                      <CardDescription className="flex items-start">
                        <MapPin className="h-3 w-3 mr-1 mt-0.5 flex-shrink-0" />
                        <span className="text-xs">{property.address}</span>
                      </CardDescription>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  {/* Property Details */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                        <Maximize className="h-4 w-4 text-primary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Area</p>
                        <p className="text-sm font-semibold">{property.area}</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className="w-8 h-8 rounded-lg bg-secondary/10 flex items-center justify-center">
                        <DollarSign className="h-4 w-4 text-secondary" />
                      </div>
                      <div>
                        <p className="text-xs text-muted-foreground">Value</p>
                        <p className="text-sm font-semibold">{property.value}</p>
                      </div>
                    </div>
                  </div>

                  {/* Features */}
                  <div className="flex flex-wrap gap-2">
                    {property.features.slice(0, 3).map((feature, idx) => (
                      <Badge key={idx} variant="outline" className="text-xs">
                        {feature}
                      </Badge>
                    ))}
                    {property.features.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{property.features.length - 3} more
                      </Badge>
                    )}
                  </div>

                  {/* Footer Info */}
                  <div className="pt-4 border-t border-border/50 space-y-2">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span className="flex items-center">
                        <Calendar className="h-3 w-3 mr-1" />
                        {property.registrationDate}
                      </span>
                      <span className="font-mono">{property.owner}</span>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="flex gap-2 pt-2">
                    <Button variant="default" size="sm" className="flex-1">
                      <Eye className="h-3 w-3 mr-1" />
                      View Details
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Share2 className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm">
                      <Download className="h-4 w-4" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Empty State */}
        {filteredProperties.length === 0 && (
          <Card className="bg-card/50 backdrop-blur-sm">
            <CardContent className="py-16 text-center">
              <Building className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">No properties found</h3>
              <p className="text-muted-foreground mb-4">
                Try adjusting your search or filters
              </p>
              <Button variant="outline" onClick={() => { setSearchTerm(''); setFilterStatus('all'); }}>
                Clear Filters
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
};
