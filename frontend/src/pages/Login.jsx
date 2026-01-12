import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from 'sonner';
import {
    Shield,
    Lock,
    Mail,
    User,
    Eye,
    EyeOff,
    Landmark,
    CheckCircle,
    ArrowRight,
    Wallet,
    AlertCircle,
} from 'lucide-react';

export const Login = () => {
    const navigate = useNavigate();
    const { login, register } = useAuth();
    const [isLogin, setIsLogin] = useState(true);
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');
    const [formData, setFormData] = useState({
        email: '',
        password: '',
        confirmPassword: '',
        fullName: '',
        walletAddress: '',
    });

    const handleInputChange = (e) => {
        setError('');
        setFormData({
            ...formData,
            [e.target.name]: e.target.value,
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (isLogin) {
            // Handle Login
            const result = await login(formData.email, formData.password);
            if (result.success) {
                toast.success('Login successful! Welcome back.', {
                    description: 'Redirecting to home page...',
                });
                setTimeout(() => {
                    navigate('/home');
                }, 1000);
            } else {
                setError(result.error);
                toast.error('Login failed', {
                    description: result.error || 'Please check your credentials and try again.',
                });
            }
        } else {
            // Handle Registration
            if (formData.password !== formData.confirmPassword) {
                setError('Passwords do not match');
                toast.error('Registration failed', {
                    description: 'Passwords do not match.',
                });
                return;
            }

            // Call API to register
            const result = await register({
                email: formData.email,
                password: formData.password,
                fullName: formData.fullName,
                walletAddress: formData.walletAddress,
            });

            if (result.success) {
                toast.success('Registration successful!', {
                    description: 'You can now log in with your credentials.',
                });
                setIsLogin(true);
                setFormData({
                    email: '',
                    password: '',
                    confirmPassword: '',
                    fullName: '',
                    walletAddress: '',
                });
            } else {
                setError(result.error);
                toast.error('Registration failed', {
                    description: result.error || 'Please try again.',
                });
            }
        }
    };

    const features = [
        {
            icon: Shield,
            title: 'Secure Authentication',
            description: 'Military-grade encryption protects your data',
        },
        {
            icon: Lock,
            title: 'Blockchain-Verified',
            description: 'Your identity is secured on the blockchain',
        },
        {
            icon: CheckCircle,
            title: 'Instant Access',
            description: 'Access your properties from anywhere',
        },
    ];

    return (
        <div className="min-h-screen relative overflow-hidden">
            {/* Animated Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-background via-muted/30 to-background">
                <div className="absolute inset-0 opacity-30">
                    <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-primary/20 rounded-full blur-3xl animate-pulse"></div>
                    <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-secondary/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
                    <div className="absolute top-1/2 left-1/2 w-96 h-96 bg-accent/20 rounded-full blur-3xl animate-pulse delay-500"></div>
                </div>
            </div>

            <div className="relative container mx-auto px-4 py-12 lg:py-16">
                <div className="grid lg:grid-cols-2 gap-12 items-center max-w-6xl mx-auto">
                    {/* Left Side - Branding & Features */}
                    <div className="space-y-8 lg:pr-8">
                        {/* Logo & Title */}
                        <div className="space-y-4">
                            <Link to="/" className="inline-block">
                                <Badge className="bg-primary/10 text-primary border-primary/30 hover:bg-primary/20 mb-4">
                                    <Landmark className="w-3 h-3 mr-1" />
                                    BlockRegistry
                                </Badge>
                            </Link>

                            <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold font-['Space_Grotesk'] leading-tight">
                                Welcome to the Future of{' '}
                                <span className="bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                                    Land Ownership
                                </span>
                            </h1>

                            <p className="text-lg text-muted-foreground leading-relaxed">
                                Secure your properties on the blockchain. Immutable, transparent, and accessible anywhere in the world.
                            </p>
                        </div>

                        {/* Features List */}
                        <div className="space-y-4">
                            {features.map((feature, index) => (
                                <Card
                                    key={index}
                                    className="bg-card/50 backdrop-blur-sm border-border/50 hover:border-primary/50 transition-all duration-300"
                                >
                                    <CardContent className="flex items-start space-x-4 p-4">
                                        <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-primary/20 to-secondary/20 flex items-center justify-center flex-shrink-0">
                                            <feature.icon className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold mb-1">{feature.title}</h3>
                                            <p className="text-sm text-muted-foreground">{feature.description}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 pt-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    10K+
                                </div>
                                <div className="text-xs text-muted-foreground">Properties</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    5K+
                                </div>
                                <div className="text-xs text-muted-foreground">Users</div>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                                    25K+
                                </div>
                                <div className="text-xs text-muted-foreground">Transactions</div>
                            </div>
                        </div>
                    </div>

                    {/* Right Side - Form */}
                    <div className="relative">
                        {/* Glow Effect */}
                        <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-secondary/20 to-accent/20 blur-3xl -z-10 animate-pulse"></div>

                        <Card className="bg-card/80 backdrop-blur-xl border-border/50 shadow-2xl">
                            <CardHeader className="space-y-3">
                                <div className="flex items-center justify-center space-x-2">
                                    <Button
                                        variant={isLogin ? 'default' : 'ghost'}
                                        className={`flex-1 ${isLogin ? 'bg-gradient-to-r from-primary to-secondary' : ''}`}
                                        onClick={() => setIsLogin(true)}
                                    >
                                        Login
                                    </Button>
                                    <Button
                                        variant={!isLogin ? 'default' : 'ghost'}
                                        className={`flex-1 ${!isLogin ? 'bg-gradient-to-r from-primary to-secondary' : ''}`}
                                        onClick={() => setIsLogin(false)}
                                    >
                                        Register
                                    </Button>
                                </div>

                                <div className="text-center">
                                    <CardTitle className="text-2xl font-['Space_Grotesk']">
                                        {isLogin ? 'Welcome Back' : 'Create Account'}
                                    </CardTitle>
                                    <CardDescription>
                                        {isLogin
                                            ? 'Enter your credentials to access your account'
                                            : 'Join the blockchain revolution today'}
                                    </CardDescription>
                                </div>
                            </CardHeader>

                            <CardContent>
                                {/* Error Message */}
                                {error && (
                                    <div className="mb-4 p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                                        <div className="flex items-center space-x-2">
                                            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0" />
                                            <p className="text-sm text-destructive">{error}</p>
                                        </div>
                                    </div>
                                )}

                                <form onSubmit={handleSubmit} className="space-y-4">
                                    {/* Full Name - Register Only */}
                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <Label htmlFor="fullName" className="text-sm font-medium">
                                                Full Name
                                            </Label>
                                            <div className="relative">
                                                <User className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="fullName"
                                                    name="fullName"
                                                    type="text"
                                                    placeholder="John Doe"
                                                    value={formData.fullName}
                                                    onChange={handleInputChange}
                                                    className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                                                    required={!isLogin}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Email */}
                                    <div className="space-y-2">
                                        <Label htmlFor="email" className="text-sm font-medium">
                                            Email Address
                                        </Label>
                                        <div className="relative">
                                            <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                placeholder="you@example.com"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                                                required
                                            />
                                        </div>
                                    </div>

                                    {/* Wallet Address - Register Only */}
                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <Label htmlFor="walletAddress" className="text-sm font-medium">
                                                Wallet Address
                                                <span className="text-xs text-muted-foreground ml-2">(Optional)</span>
                                            </Label>
                                            <div className="relative">
                                                <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="walletAddress"
                                                    name="walletAddress"
                                                    type="text"
                                                    placeholder="0x..."
                                                    value={formData.walletAddress}
                                                    onChange={handleInputChange}
                                                    className="pl-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all font-mono text-sm"
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Password */}
                                    <div className="space-y-2">
                                        <Label htmlFor="password" className="text-sm font-medium">
                                            Password
                                        </Label>
                                        <div className="relative">
                                            <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                            <Input
                                                id="password"
                                                name="password"
                                                type={showPassword ? 'text' : 'password'}
                                                placeholder="••••••••"
                                                value={formData.password}
                                                onChange={handleInputChange}
                                                className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                                                required
                                            />
                                            <button
                                                type="button"
                                                onClick={() => setShowPassword(!showPassword)}
                                                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                                            >
                                                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                                            </button>
                                        </div>
                                    </div>

                                    {/* Confirm Password - Register Only */}
                                    {!isLogin && (
                                        <div className="space-y-2">
                                            <Label htmlFor="confirmPassword" className="text-sm font-medium">
                                                Confirm Password
                                            </Label>
                                            <div className="relative">
                                                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                                <Input
                                                    id="confirmPassword"
                                                    name="confirmPassword"
                                                    type={showPassword ? 'text' : 'password'}
                                                    placeholder="••••••••"
                                                    value={formData.confirmPassword}
                                                    onChange={handleInputChange}
                                                    className="pl-10 pr-10 bg-background/50 border-border/50 focus:border-primary/50 transition-all"
                                                    required={!isLogin}
                                                />
                                            </div>
                                        </div>
                                    )}

                                    {/* Remember Me & Forgot Password - Login Only */}
                                    {isLogin && (
                                        <div className="flex items-center justify-between text-sm">
                                            <label className="flex items-center space-x-2 cursor-pointer">
                                                <input
                                                    type="checkbox"
                                                    className="w-4 h-4 rounded border-border/50 bg-background/50 text-primary focus:ring-primary/50"
                                                />
                                                <span className="text-muted-foreground">Remember me</span>
                                            </label>
                                            <Link to="/forgot-password" className="text-primary hover:text-primary/80 transition-colors">
                                                Forgot password?
                                            </Link>
                                        </div>
                                    )}

                                    {/* Submit Button */}
                                    <Button
                                        type="submit"
                                        className="w-full bg-gradient-to-r from-primary via-secondary to-accent hover:opacity-90 transition-all duration-300"
                                        size="lg"
                                    >
                                        {isLogin ? 'Sign In' : 'Create Account'}
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>

                                    {/* Divider */}
                                    <div className="relative my-6">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-border/50"></div>
                                        </div>
                                        <div className="relative flex justify-center text-xs uppercase">
                                            <span className="bg-card px-2 text-muted-foreground">Or continue with</span>
                                        </div>
                                    </div>

                                    {/* Web3 Wallet Connection */}
                                    <Button
                                        type="button"
                                        variant="outline"
                                        className="w-full border-border/50 hover:border-primary/50 hover:bg-primary/5 transition-all"
                                        size="lg"
                                    >
                                        <Wallet className="mr-2 h-4 w-4" />
                                        Connect Wallet
                                    </Button>

                                    {/* Terms & Privacy - Register Only */}
                                    {!isLogin && (
                                        <p className="text-xs text-muted-foreground text-center">
                                            By creating an account, you agree to our{' '}
                                            <Link to="/terms" className="text-primary hover:underline">
                                                Terms of Service
                                            </Link>{' '}
                                            and{' '}
                                            <Link to="/privacy" className="text-primary hover:underline">
                                                Privacy Policy
                                            </Link>
                                        </p>
                                    )}

                                    {/* Toggle Login/Register */}
                                    <div className="text-center text-sm text-muted-foreground">
                                        {isLogin ? "Don't have an account? " : 'Already have an account? '}
                                        <button
                                            type="button"
                                            onClick={() => setIsLogin(!isLogin)}
                                            className="text-primary hover:underline font-medium"
                                        >
                                            {isLogin ? 'Sign up' : 'Sign in'}
                                        </button>
                                    </div>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};
