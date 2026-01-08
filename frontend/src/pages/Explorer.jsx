import React, { useState } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

export const Explorer = () => {
  const [searchTerm, setSearchTerm] = useState('');

  const networkStats = [
    {
      label: 'Total Blocks',
      value: '1,234,567',
      icon: Box,
      trend: '+142',
      color: 'primary',
    },
    {
      label: 'Total Transactions',
      value: '25,430',
      icon: Activity,
      trend: '+89',
      color: 'secondary',
    },
    {
      label: 'Properties Registered',
      value: '10,245',
      icon: Building,
      trend: '+23',
      color: 'accent',
    },
    {
      label: 'Active Users',
      value: '5,230',
      icon: Users,
      trend: '+156',
      color: 'success',
    },
  ];

  const recentBlocks = [
    {
      number: 1234567,
      hash: '0x7f3e9a2b8c1d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f',
      timestamp: '12 seconds ago',
      transactions: 42,
      validator: '0x1a2b...3c4d',
      size: '128 KB',
    },
    {
      number: 1234566,
      hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6b7c8d9e0f1a2b',
      timestamp: '24 seconds ago',
      transactions: 38,
      validator: '0x5e6f...7a8b',
      size: '116 KB',
    },
    {
      number: 1234565,
      hash: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b3a2f1e0d9c8b7a6f5e4d3c2b1a0f9e8d',
      timestamp: '36 seconds ago',
      transactions: 51,
      validator: '0x9c0d...1e2f',
      size: '142 KB',
    },
    {
      number: 1234564,
      hash: '0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c',
      timestamp: '48 seconds ago',
      transactions: 29,
      validator: '0x3a4b...5c6d',
      size: '98 KB',
    },
  ];

  const recentTransactions = [
    {
      hash: '0x7f3e9a2b8c1d4e5f6a7b8c9d0e1f2a3b',
      type: 'Property Registration',
      from: '0x1a2b...3c4d',
      to: 'Registry Contract',
      value: 'PROP-2024-001',
      timestamp: '5 seconds ago',
      status: 'confirmed',
    },
    {
      hash: '0x1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d',
      type: 'Ownership Transfer',
      from: '0x5e6f...7a8b',
      to: '0x9c0d...1e2f',
      value: 'PROP-2023-890',
      timestamp: '18 seconds ago',
      status: 'confirmed',
    },
    {
      hash: '0x9e8d7c6b5a4f3e2d1c0b9a8f7e6d5c4b',
      type: 'Document Update',
      from: '0x3a4b...5c6d',
      to: 'Registry Contract',
      value: 'PROP-2024-002',
      timestamp: '32 seconds ago',
      status: 'confirmed',
    },
    {
      hash: '0x3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e',
      type: 'Verification',
      from: 'Validator',
      to: '0x7e8f...9a0b',
      value: 'PROP-2024-003',
      timestamp: '45 seconds ago',
      status: 'pending',
    },
  ];

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="min-h-screen py-8">
      <div className="container mx-auto px-4 space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <h1 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk']">
            Blockchain Explorer
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            View real-time blockchain activity, transactions, and property records
          </p>

          {/* Search */}
          <div className="max-w-2xl mx-auto">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                placeholder="Search by block number, transaction hash, or property ID..."
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
        <Tabs defaultValue="blocks" className="w-full">
          <TabsList className="grid w-full grid-cols-3 max-w-md mx-auto">
            <TabsTrigger value="blocks">
              <Box className="h-4 w-4 mr-2" />
              Blocks
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

          {/* Blocks Tab */}
          <TabsContent value="blocks" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Blocks</CardTitle>
                <CardDescription>Latest blocks added to the blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Block</TableHead>
                        <TableHead>Hash</TableHead>
                        <TableHead>Transactions</TableHead>
                        <TableHead>Validator</TableHead>
                        <TableHead>Size</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentBlocks.map((block) => (
                        <TableRow
                          key={block.number}
                          className="hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <TableCell className="font-mono">
                            <Badge variant="outline" className="bg-primary/10 text-primary">
                              #{block.number}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs truncate max-w-[120px]">
                                {block.hash}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(block.hash)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-6 w-6">
                                <ExternalLink className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{block.transactions} txns</Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{block.validator}</TableCell>
                          <TableCell className="text-muted-foreground text-sm">
                            {block.size}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center text-xs text-muted-foreground">
                              <Clock className="h-3 w-3 mr-1" />
                              {block.timestamp}
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Transactions Tab */}
          <TabsContent value="transactions" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Transactions</CardTitle>
                <CardDescription>Latest blockchain transactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Tx Hash</TableHead>
                        <TableHead>Type</TableHead>
                        <TableHead>From</TableHead>
                        <TableHead>To</TableHead>
                        <TableHead>Value</TableHead>
                        <TableHead>Status</TableHead>
                        <TableHead>Time</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {recentTransactions.map((tx) => (
                        <TableRow
                          key={tx.hash}
                          className="hover:bg-muted/50 cursor-pointer transition-colors"
                        >
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <span className="font-mono text-xs truncate max-w-[100px]">
                                {tx.hash}
                              </span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6"
                                onClick={() => copyToClipboard(tx.hash)}
                              >
                                <Copy className="h-3 w-3" />
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="text-xs">
                              {tx.type}
                            </Badge>
                          </TableCell>
                          <TableCell className="font-mono text-xs">{tx.from}</TableCell>
                          <TableCell className="font-mono text-xs">{tx.to}</TableCell>
                          <TableCell className="font-medium">{tx.value}</TableCell>
                          <TableCell>
                            <Badge
                              variant="outline"
                              className={
                                tx.status === 'confirmed'
                                  ? 'bg-success/10 text-success border-success/30'
                                  : 'bg-warning/10 text-warning border-warning/30'
                              }
                            >
                              {tx.status === 'confirmed' ? (
                                <CheckCircle className="h-3 w-3 mr-1" />
                              ) : (
                                <Clock className="h-3 w-3 mr-1" />
                              )}
                              {tx.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-xs text-muted-foreground">
                            {tx.timestamp}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Properties Tab */}
          <TabsContent value="properties" className="space-y-6">
            <Card className="bg-card/50 backdrop-blur-sm">
              <CardHeader>
                <CardTitle>Recent Property Records</CardTitle>
                <CardDescription>Latest property registrations on blockchain</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div
                      key={i}
                      className="p-4 rounded-lg border border-border/50 hover:border-primary/50 bg-muted/30 hover:bg-muted/50 transition-all duration-300 cursor-pointer"
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-2 flex-1">
                          <div className="flex items-center space-x-2">
                            <Building className="h-4 w-4 text-primary" />
                            <span className="font-semibold">PROP-2024-00{i}</span>
                            <Badge variant="outline" className="bg-success/10 text-success">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Verified
                            </Badge>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            Residential Property - District {i}
                          </p>
                          <div className="flex items-center space-x-4 text-xs text-muted-foreground">
                            <span className="flex items-center">
                              <Hash className="h-3 w-3 mr-1" />
                              Block #1234{567 - i}
                            </span>
                            <span className="flex items-center">
                              <Clock className="h-3 w-3 mr-1" />
                              {i * 15} mins ago
                            </span>
                          </div>
                        </div>
                        <Button variant="outline" size="sm">
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Network Info */}
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
                  <Badge className="bg-success/10 text-success border-success/30">
                    <div className="w-2 h-2 bg-success rounded-full animate-pulse mr-2"></div>
                    Active
                  </Badge>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Block Time</span>
                  <span className="text-sm font-medium">~12 seconds</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Gas Price</span>
                  <span className="text-sm font-medium">15 Gwei</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-secondary/10 to-accent/10 border-secondary/30">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <TrendingUp className="h-5 w-5 mr-2 text-secondary" />
                24h Statistics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">New Properties</span>
                  <span className="text-sm font-medium">+142</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Transactions</span>
                  <span className="text-sm font-medium">+1,234</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-sm text-muted-foreground">Active Wallets</span>
                  <span className="text-sm font-medium">+89</span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-accent/10 to-primary/10 border-accent/30">
            <CardHeader>
              <CardTitle className="flex items-center text-lg">
                <FileText className="h-5 w-5 mr-2 text-accent" />
                Documentation
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  API Documentation
                  <ExternalLink className="ml-auto h-3 w-3" />
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  Smart Contracts
                  <ExternalLink className="ml-auto h-3 w-3" />
                </Button>
                <Button variant="ghost" className="w-full justify-start text-sm" size="sm">
                  Developer Guide
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
