import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Menu, X, Wallet, User, LogOut } from 'lucide-react';
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

export const Navbar = () => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();
  const [walletConnected, setWalletConnected] = useState(false);
  const { user, logout } = useAuth();

  const navLinks = [
    { name: 'Home', path: '/home' },
    { name: 'Dashboard', path: '/dashboard' },
    { name: 'Properties', path: '/properties' },
    { name: 'Register', path: '/register' },
    { name: 'Explorer', path: '/explorer' },
  ];

  const isActive = (path) => location.pathname === path;

  const handleWalletConnect = () => {
    setWalletConnected(!walletConnected);
  };

  const handleLogout = () => {
    logout();
    navigate('/');
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
            {/* User Profile Dropdown - Always visible when authenticated */}
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

            {/* Optional Wallet Connection */}
            {walletConnected ? (
              <div className="flex items-center space-x-2 px-3 py-2 bg-primary/10 border border-primary/30 rounded-lg">
                <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
                <span className="text-xs font-mono text-primary">{user?.walletAddress?.substring(0, 6)}...{user?.walletAddress?.slice(-3)}</span>
              </div>
            ) : (
              <Button onClick={handleWalletConnect} variant="outline" size="default">
                <Wallet className="mr-2 h-4 w-4" />
                Connect Wallet
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
                <Button
                  onClick={handleWalletConnect}
                  variant="outline"
                  size="default"
                  className="w-full"
                >
                  <Wallet className="mr-2 h-4 w-4" />
                  {walletConnected ? 'Disconnect Wallet' : 'Connect Wallet'}
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
