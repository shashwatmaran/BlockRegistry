import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Wallet, User, LogOut, Copy, Check, AlertTriangle, Link as LinkIcon } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { useAuth } from '@/contexts/AuthContext';
import { useWallet } from '@/contexts/WalletContext';
import { userAPI } from '@/services/api';
import { toast } from 'sonner';

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [addressCopied, setAddressCopied] = useState(false);
  const [isWalletLinked, setIsWalletLinked] = useState(false);
  const [checkingLinkStatus, setCheckingLinkStatus] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();
  const {
    walletAddress,
    isConnected,
    isCorrectNetwork,
    loading,
    connectWallet,
    disconnectWallet,
    linkWalletToAccount,
    switchNetwork,
    targetChainName
  } = useWallet();

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Properties', path: '/properties' },
    { name: 'Register', path: '/register' },
    { name: 'Explorer', path: '/explorer' },
  ];

  const isActive = (path) => location.pathname === path;

  // Check if wallet is linked to current user
  useEffect(() => {
    const checkWalletLinkStatus = async () => {
      if (!user || !isConnected || !walletAddress) {
        setIsWalletLinked(false);
        return;
      }

      try {
        setCheckingLinkStatus(true);
        const status = await userAPI.getWalletStatus();
        const linked = status.wallet_address?.toLowerCase() === walletAddress.toLowerCase();
        setIsWalletLinked(linked);

        // Auto-prompt to link if not linked
        if (!linked && walletAddress) {
          toast.info('Link your wallet?', {
            description: `Connect ${walletAddress.substring(0, 6)}...${walletAddress.slice(-4)} to your account for blockchain features`,
            action: {
              label: 'Link Now',
              onClick: async () => {
                const result = await linkWalletToAccount(user.email);
                if (result.success) {
                  setIsWalletLinked(true);
                  toast.success('Wallet linked successfully!');
                } else {
                  toast.error(result.error || 'Failed to link wallet');
                }
              },
            },
            duration: 10000,
          });
        }
      } catch (error) {
        console.error('Failed to check wallet link status:', error);
        setIsWalletLinked(false);
      } finally {
        setCheckingLinkStatus(false);
      }
    };

    checkWalletLinkStatus();
  }, [user, isConnected, walletAddress, linkWalletToAccount]);

  // Handle wallet linking
  const handleLinkWallet = async () => {
    if (!user || !walletAddress) {
      toast.error('Please login and connect wallet first');
      return;
    }

    const result = await linkWalletToAccount(user.email);

    if (result.success) {
      setIsWalletLinked(true);
      toast.success('Wallet linked successfully!', {
        description: 'Your wallet is now connected to your account',
      });
    } else {
      toast.error('Failed to link wallet', {
        description: result.error || 'Please try again',
      });
    }
  };

  // Handle wallet unlinking
  const handleUnlinkWallet = async () => {
    try {
      await userAPI.unlinkWallet();
      setIsWalletLinked(false);
      toast.success('Wallet unlinked from your account');
    } catch (error) {
      toast.error('Failed to unlink wallet');
    }
  };

  const handleWalletConnect = async () => {
    if (isConnected) {
      disconnectWallet();
      toast.success('Wallet disconnected');
    } else {
      const result = await connectWallet();
      if (result.success) {
        toast.success('Wallet connected successfully!');
      } else {
        toast.error(result.error || 'Failed to connect wallet');
      }
    }
  };

  const handleCopyAddress = () => {
    if (walletAddress) {
      navigator.clipboard.writeText(walletAddress);
      setAddressCopied(true);
      toast.success('Address copied to clipboard');
      setTimeout(() => setAddressCopied(false), 2000);
    }
  };

  const handleSwitchNetwork = async () => {
    const result = await switchNetwork();
    if (result.success) {
      toast.success(`Switched to ${targetChainName} network`);
    } else {
      toast.error(result.error || 'Failed to switch network');
    }
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const shortenAddress = (address) => {
    if (!address) return '';
    return `${address.substring(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <nav className="sticky top-0 z-50 border-b border-border/40 bg-background/80 backdrop-blur-lg supports-[backdrop-filter]:bg-background/60">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          {/* Logo */}
          <Link to="/home" className="flex items-center space-x-2 group">
            <div className="relative">
              <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-75 blur-lg group-hover:opacity-100 transition-opacity duration-300"></div>
              <div className="relative bg-gradient-to-r from-primary via-secondary to-accent p-2 rounded-lg">
                <svg className="w-6 h-6 text-background" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31-.91-6-4.89-6-9.17V8.47l6-3.15 6 3.15v2.36c0 4.28-2.69 8.26-6 9.17z" />
                  <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none" />
                </svg>
              </div>
            </div>
            <span className="text-xl font-bold font-['Space_Grotesk'] bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              BlockRegistry
            </span>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${isActive(link.path)
                  ? 'bg-primary/10 text-primary shadow-[0_0_15px_hsl(var(--primary)/0.2)]'
                  : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                  }`}
              >
                {link.name}
              </Link>
            ))}
          </div>

          {/* User Profile & Wallet */}
          <div className="hidden md:flex items-center space-x-4">
            {/* User Profile Dropdown */}
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full">
                  <Avatar className="w-9 h-9 border-2 border-primary/50">
                    <AvatarFallback className="bg-gradient-to-br from-primary to-secondary text-background">
                      {user?.name?.substring(0, 2).toUpperCase() || 'AU'}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel>
                  <div>
                    <div className="font-medium">{user?.name || 'Admin User'}</div>
                    <div className="text-xs text-muted-foreground font-normal">{user?.email}</div>
                  </div>
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <User className="mr-2 h-4 w-4" />
                  Profile
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive">
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

            {/* Wallet Connection */}
            {isConnected ? (
              <div className="flex items-center gap-2">
                {/* Wrong Network Warning */}
                {!isCorrectNetwork && (
                  <Button
                    onClick={handleSwitchNetwork}
                    variant="outline"
                    size="sm"
                    className="border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Wrong Network
                  </Button>
                )}

                {/* Wallet Address Display */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg cursor-pointer hover:bg-primary/20 transition-colors">
                      <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                      <span className="text-xs font-mono text-primary">{shortenAddress(walletAddress)}</span>
                    </div>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-64">
                    <DropdownMenuLabel>Connected Wallet</DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={handleCopyAddress}>
                      {addressCopied ? (
                        <Check className="mr-2 h-4 w-4 text-success" />
                      ) : (
                        <Copy className="mr-2 h-4 w-4" />
                      )}
                      <span className="text-xs font-mono">{walletAddress}</span>
                    </DropdownMenuItem>

                    {/* Wallet Link Status */}
                    {user && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuLabel className="text-xs text-muted-foreground">
                          Account Link
                        </DropdownMenuLabel>
                        {isWalletLinked ? (
                          <>
                            <DropdownMenuItem disabled className="text-xs">
                              <Check className="mr-2 h-3 w-3 text-success" />
                              Linked to {user.email}
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={handleUnlinkWallet}
                              className="text-xs text-destructive focus:text-destructive"
                            >
                              <X className="mr-2 h-3 w-3" />
                              Unlink Wallet
                            </DropdownMenuItem>
                          </>
                        ) : (
                          <DropdownMenuItem
                            onClick={handleLinkWallet}
                            disabled={checkingLinkStatus}
                            className="text-xs"
                          >
                            <LinkIcon className="mr-2 h-3 w-3" />
                            {checkingLinkStatus ? 'Checking...' : 'Link to Account'}
                          </DropdownMenuItem>
                        )}
                      </>
                    )}

                    <DropdownMenuSeparator />
                    <DropdownMenuItem onClick={disconnectWallet} className="text-destructive focus:text-destructive">
                      <LogOut className="mr-2 h-4 w-4" />
                      Disconnect Wallet
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button
                onClick={handleWalletConnect}
                variant="outline"
                size="default"
                disabled={loading}
              >
                <Wallet className="mr-2 h-4 w-4" />
                {loading ? 'Connecting...' : 'Connect Wallet'}
              </Button>
            )}
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted/50"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-border/40">
            <div className="flex flex-col space-y-2">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  className={`px-4 py-2 rounded-md text-sm font-medium transition-all duration-300 ${isActive(link.path)
                    ? 'bg-primary/10 text-primary'
                    : 'text-muted-foreground hover:text-foreground hover:bg-muted/50'
                    }`}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  {link.name}
                </Link>
              ))}
              <div className="pt-4 border-t border-border/40 space-y-2">
                {/* Mobile Wallet */}
                {!isCorrectNetwork && isConnected && (
                  <Button
                    onClick={handleSwitchNetwork}
                    variant="outline"
                    size="default"
                    className="w-full border-destructive text-destructive hover:bg-destructive/10"
                  >
                    <AlertTriangle className="mr-2 h-4 w-4" />
                    Switch to {targetChainName}
                  </Button>
                )}
                <Button
                  onClick={handleWalletConnect}
                  variant="outline"
                  size="default"
                  className="w-full"
                  disabled={loading}
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {isConnected ? `Disconnect ${shortenAddress(walletAddress)}` : loading ? 'Connecting...' : 'Connect Wallet'}
                </Button>
                <Button
                  onClick={handleLogout}
                  variant="outline"
                  size="default"
                  className="w-full text-destructive hover:text-destructive"
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  Logout
                </Button>
              </div>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
};
