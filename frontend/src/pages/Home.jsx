import React from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Shield,
  Lock,
  Zap,
  Globe,
  FileText,
  CheckCircle,
  Search,
  Building,
  Users,
  TrendingUp,
  ArrowRight,
  Landmark,
  FileCheck,
  Clock,
} from 'lucide-react';

export const Home = () => {
  const features = [
    {
      icon: Shield,
      title: 'Immutable Records',
      description: 'Land records stored permanently on blockchain, preventing fraud and tampering.',
    },
    {
      icon: Lock,
      title: 'Secure Ownership',
      description: 'Cryptographic verification ensures only rightful owners can transfer property.',
    },
    {
      icon: Zap,
      title: 'Instant Verification',
      description: 'Real-time property verification in seconds, not weeks.',
    },
    {
      icon: FileText,
      title: 'Smart Contracts',
      description: 'Automated property transfers with programmable conditions.',
    },
    {
      icon: Globe,
      title: 'Global Access',
      description: 'Access your property records from anywhere in the world.',
    },
    {
      icon: CheckCircle,
      title: 'Transparent History',
      description: 'Complete audit trail of all property transactions and ownership changes.',
    },
  ];

  const stats = [
    { icon: Building, value: '10,000+', label: 'Properties Registered' },
    { icon: Users, value: '5,000+', label: 'Active Users' },
    { icon: FileCheck, value: '25,000+', label: 'Verified Transactions' },
    { icon: Clock, value: '< 2 min', label: 'Average Processing' },
  ];

  const howItWorks = [
    {
      step: '01',
      title: 'Connect Your Wallet',
      description: 'Link your blockchain wallet to access the platform securely.',
    },
    {
      step: '02',
      title: 'Register Property',
      description: 'Submit property details and required documentation for verification.',
    },
    {
      step: '03',
      title: 'Blockchain Verification',
      description: 'Smart contracts verify and record your property on the blockchain.',
    },
    {
      step: '04',
      title: 'Instant Access',
      description: 'Access your digital property records anytime, anywhere.',
    },
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background">
          <div className="absolute inset-0 opacity-30">
            <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
          </div>
        </div>

        <div className="relative container mx-auto px-4 py-20 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Content */}
            <div className="space-y-8">
              <Badge className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20">
                <Landmark className="w-3 h-3 mr-1" />
                Next-Gen Land Registry
              </Badge>
              
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-['Space_Grotesk'] leading-tight">
                Secure Land Ownership on{' '}
                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                  Blockchain
                </span>
              </h1>
              
              <p className="text-lg text-muted-foreground leading-relaxed">
                Transform property ownership with immutable blockchain records. Register, verify, 
                and transfer land titles with unprecedented security and transparency.
              </p>

              {/* Search Bar */}
              <div className="flex flex-col sm:flex-row gap-3 p-2 bg-card/50 backdrop-blur-sm border border-border rounded-lg shadow-lg">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Search by property ID, address, or owner..."
                    className="pl-10 border-0 bg-transparent focus-visible:ring-0"
                  />
                </div>
                <Button variant="gradient" size="lg">
                  Search Properties
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4">
                <Link to="/register">
                  <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                    Register Property
                  </Button>
                </Link>
                <Link to="/explorer">
                  <Button variant="outline" size="lg" className="w-full sm:w-auto">
                    Explore Blockchain
                  </Button>
                </Link>
              </div>
            </div>

            {/* Hero Visual */}
            <div className="relative">
              <div className="relative z-10">
                <Card className="bg-card/50 backdrop-blur-sm border-primary/30 shadow-2xl">
                  <CardHeader>
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-xl">Live Blockchain Activity</CardTitle>
                      <Badge variant="outline" className="bg-success/10 text-success border-success/30">
                        <div className="w-2 h-2 bg-success rounded-full animate-pulse mr-2"></div>
                        Live
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {[1, 2, 3].map((i) => (
                      <div
                        key={i}
                        className="flex items-center space-x-3 p-3 bg-muted/50 rounded-lg border border-border/50 hover:border-primary/50 transition-all duration-300"
                      >
                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center flex-shrink-0">
                          <FileCheck className="w-5 h-5 text-background" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">Property Registered</p>
                          <p className="text-xs text-muted-foreground font-mono truncate">
                            0x7f3...ab{i}2
                          </p>
                        </div>
                        <Badge variant="outline" className="text-xs">Just now</Badge>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
              
              {/* Glow Effect */}
              <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-3xl -z-10 animate-pulse"></div>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-card/30 backdrop-blur-sm border-y border-border/40">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
            {stats.map((stat, index) => (
              <div key={index} className="text-center space-y-2">
                <div className="inline-flex items-center justify-center w-12 h-12 rounded-lg bg-primary/10 text-primary mb-2">
                  <stat.icon className="w-6 h-6" />
                </div>
                <div className="text-3xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-secondary/10 text-secondary border-secondary/30">Features</Badge>
            <h2 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk']">
              Why Choose BlockRegistry?
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Built on cutting-edge blockchain technology to provide the most secure and efficient 
              land registry system available.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((feature, index) => (
              <Card
                key={index}
                className="group bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300 hover:shadow-[0_0_30px_hsl(var(--primary)/0.1)]"
              >
                <CardHeader>
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <CardTitle className="text-xl">{feature.title}</CardTitle>
                  <CardDescription>{feature.description}</CardDescription>
                </CardHeader>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-muted/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16 space-y-4">
            <Badge className="bg-accent/10 text-accent border-accent/30">Process</Badge>
            <h2 className="text-3xl md:text-4xl font-bold font-['Space_Grotesk']">
              How It Works
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Get started with blockchain-based property registration in four simple steps.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            {howItWorks.map((item, index) => (
              <div key={index} className="relative">
                <Card className="h-full bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300">
                  <CardHeader>
                    <div className="text-5xl font-bold font-['Space_Grotesk'] text-primary/20 mb-4">
                      {item.step}
                    </div>
                    <CardTitle className="text-xl mb-2">{item.title}</CardTitle>
                    <CardDescription>{item.description}</CardDescription>
                  </CardHeader>
                </Card>
                {index < howItWorks.length - 1 && (
                  <div className="hidden lg:block absolute top-1/2 -right-3 transform -translate-y-1/2 z-10">
                    <ArrowRight className="w-6 h-6 text-primary/50" />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative py-20 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-primary/10 via-secondary/10 to-accent/10"></div>
        <div className="relative container mx-auto px-4 text-center">
          <div className="max-w-3xl mx-auto space-y-8">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-['Space_Grotesk']">
              Ready to Secure Your Property on the Blockchain?
            </h2>
            <p className="text-lg text-muted-foreground">
              Join thousands of property owners who trust BlockRegistry for secure, transparent land ownership.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link to="/register">
                <Button variant="gradient" size="lg" className="w-full sm:w-auto">
                  Get Started Now
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Button>
              </Link>
              <Button variant="outline" size="lg" className="w-full sm:w-auto">
                Schedule a Demo
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
};
