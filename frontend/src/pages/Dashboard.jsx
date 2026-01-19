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
} from 'lucide-react';
import { landAPI } from '@/services/api';
import { toast } from 'sonner';
import { useNavigate } from 'react-router-dom';

export const Dashboard = () => {
  const navigate = useNavigate();
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [lands, setLands] = useState([]);
  const [loading, setLoading] = useState(true);

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

  const getStatusBadge = (status) => {
    const variants = {
      verified: 'bg-success/10 text-success border-success/30',
      approved: 'bg-success/10 text-success border-success/30',
      pending: 'bg-warning/10 text-warning border-warning/30',
      'in-progress': 'bg-info/10 text-info border-info/30',
    };
    return variants[status] || variants.pending;
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
                      lands.map((land) => {
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
                            key={property.id}
                            className="p-4 rounded-lg border border-border/50 hover:border-primary/50 bg-muted/30 hover:bg-muted/50 transition-all duration-300 cursor-pointer"
                            onClick={() => setSelectedProperty(property)}
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="space-y-1">
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold">{property.id}</h3>
                                  <Badge variant="outline" className={getStatusBadge(property.status)}>
                                    {property.status === 'verified' || property.status === 'approved' ? (
                                      <CheckCircle className="h-3 w-3 mr-1" />
                                    ) : (
                                      <Clock className="h-3 w-3 mr-1" />
                                    )}
                                    {property.status}
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
                            </div>
                          </div>
                        );
                      })
                    )}
                  </TabsContent>

                  <TabsContent value="verified" className="space-y-4">
                    {lands.filter((p) => p.status === 'approved').length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No verified properties yet.</p>
                    ) : (
                      lands
                        .filter((p) => p.status === 'approved')
                        .map((land) => {
                          const property = {
                            id: land.id.substring(0, 12).toUpperCase(),
                            address: land.location?.address || 'Address not available',
                            status: land.status || 'pending',
                          };
                          return (
                            <div
                              key={property.id}
                              className="p-4 rounded-lg border border-border/50 bg-muted/30"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold">{property.id}</h3>
                                  <p className="text-sm text-muted-foreground">{property.address}</p>
                                </div>
                                <Badge variant="outline" className={getStatusBadge(property.status)}>
                                  <CheckCircle className="h-3 w-3 mr-1" />
                                  {property.status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })
                    )}
                  </TabsContent>

                  <TabsContent value="pending" className="space-y-4">
                    {lands.filter((p) => p.status === 'pending').length === 0 ? (
                      <p className="text-center text-muted-foreground py-8">No pending properties.</p>
                    ) : (
                      lands
                        .filter((p) => p.status === 'pending')
                        .map((land) => {
                          const property = {
                            id: land.id.substring(0, 12).toUpperCase(),
                            address: land.location?.address || 'Address not available',
                            status: land.status || 'pending',
                          };
                          return (
                            <div
                              key={property.id}
                              className="p-4 rounded-lg border border-border/50 bg-muted/30"
                            >
                              <div className="flex items-center justify-between">
                                <div>
                                  <h3 className="font-semibold">{property.id}</h3>
                                  <p className="text-sm text-muted-foreground">{property.address}</p>
                                </div>
                                <Badge variant="outline" className={getStatusBadge(property.status)}>
                                  <Clock className="h-3 w-3 mr-1" />
                                  {property.status}
                                </Badge>
                              </div>
                            </div>
                          );
                        })
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
                <Button variant="outline" className="w-full justify-start">
                  <FileCheck className="mr-2 h-4 w-4" />
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
