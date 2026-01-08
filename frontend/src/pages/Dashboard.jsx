import React, { useState } from 'react';
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
} from 'lucide-react';

export const Dashboard = () => {
  const [selectedProperty, setSelectedProperty] = useState(null);

  const dashboardStats = [
    {
      title: 'Total Properties',
      value: '12',
      change: '+2',
      trend: 'up',
      icon: Building,
      color: 'primary',
    },
    {
      title: 'Verified Assets',
      value: '10',
      change: '+1',
      trend: 'up',
      icon: CheckCircle,
      color: 'success',
    },
    {
      title: 'Pending Actions',
      value: '3',
      change: '-1',
      trend: 'down',
      icon: Clock,
      color: 'warning',
    },
    {
      title: 'Total Value',
      value: '$2.4M',
      change: '+5.2%',
      trend: 'up',
      icon: TrendingUp,
      color: 'secondary',
    },
  ];

  const recentProperties = [
    {
      id: 'PROP-2024-001',
      address: '123 Blockchain Avenue, District 5',
      status: 'verified',
      area: '2,500 sq ft',
      value: '$450,000',
      date: '2024-01-15',
      txHash: '0x7f3e9a2b8c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
    },
    {
      id: 'PROP-2024-002',
      address: '456 Ethereum Street, Zone 12',
      status: 'pending',
      area: '3,200 sq ft',
      value: '$620,000',
      date: '2024-01-18',
      txHash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
    },
    {
      id: 'PROP-2024-003',
      address: '789 Smart Contract Lane, Sector 8',
      status: 'verified',
      area: '1,800 sq ft',
      value: '$380,000',
      date: '2024-01-20',
      txHash: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
    },
  ];

  const recentActivity = [
    {
      type: 'registration',
      title: 'Property Registered',
      property: 'PROP-2024-003',
      timestamp: '2 hours ago',
      status: 'completed',
    },
    {
      type: 'verification',
      title: 'Ownership Verified',
      property: 'PROP-2024-001',
      timestamp: '5 hours ago',
      status: 'completed',
    },
    {
      type: 'pending',
      title: 'Pending Approval',
      property: 'PROP-2024-002',
      timestamp: '1 day ago',
      status: 'pending',
    },
    {
      type: 'transfer',
      title: 'Transfer Initiated',
      property: 'PROP-2023-145',
      timestamp: '2 days ago',
      status: 'in-progress',
    },
  ];

  const getStatusBadge = (status) => {
    const variants = {
      verified: 'bg-success/10 text-success border-success/30',
      pending: 'bg-warning/10 text-warning border-warning/30',
      'in-progress': 'bg-info/10 text-info border-info/30',
    };
    return variants[status] || variants.pending;
  };

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
          <Button variant="gradient">
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
                    className={`${
                      stat.trend === 'up'
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
                    {recentProperties.map((property) => (
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
                                {property.status === 'verified' ? (
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
                          <div className="flex items-center space-x-1 font-mono">
                            <FileText className="h-3 w-3" />
                            <span className="truncate max-w-[120px]">{property.txHash}</span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                  
                  <TabsContent value="verified" className="space-y-4">
                    {recentProperties
                      .filter((p) => p.status === 'verified')
                      .map((property) => (
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
                      ))}
                  </TabsContent>
                  
                  <TabsContent value="pending" className="space-y-4">
                    {recentProperties
                      .filter((p) => p.status === 'pending')
                      .map((property) => (
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
                      ))}
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
                {recentActivity.map((activity, index) => (
                  <div
                    key={index}
                    className="flex items-start space-x-3 pb-4 border-b border-border/50 last:border-0 last:pb-0"
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        activity.status === 'completed'
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
                ))}
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
