import React from 'react';
import { Link } from 'react-router-dom';
import { Github, Twitter, Linkedin, Mail } from 'lucide-react';

export const Footer = () => {
  const footerLinks = {
    Product: [
      { name: 'Features', path: '#features' },
      { name: 'Security', path: '#security' },
      { name: 'Pricing', path: '#pricing' },
      { name: 'Documentation', path: '#docs' },
    ],
    Company: [
      { name: 'About Us', path: '#about' },
      { name: 'Careers', path: '#careers' },
      { name: 'Blog', path: '#blog' },
      { name: 'Press Kit', path: '#press' },
    ],
    Legal: [
      { name: 'Privacy Policy', path: '#privacy' },
      { name: 'Terms of Service', path: '#terms' },
      { name: 'Cookie Policy', path: '#cookies' },
      { name: 'Compliance', path: '#compliance' },
    ],
    Support: [
      { name: 'Help Center', path: '#help' },
      { name: 'Contact Us', path: '#contact' },
      { name: 'API Status', path: '#status' },
      { name: 'Community', path: '#community' },
    ],
  };

  const socialLinks = [
    { icon: Github, href: '#', label: 'Github' },
    { icon: Twitter, href: '#', label: 'Twitter' },
    { icon: Linkedin, href: '#', label: 'LinkedIn' },
    { icon: Mail, href: '#', label: 'Email' },
  ];

  return (
    <footer className="relative border-t border-border/40 bg-card/50 backdrop-blur-sm">
      {/* Gradient Overlay */}
      <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background/80 pointer-events-none"></div>
      
      <div className="relative container mx-auto px-4 py-12">
        {/* Main Footer Content */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-4 lg:col-span-1">
            <Link to="/" className="flex items-center space-x-2 mb-4 group">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-primary via-secondary to-accent opacity-75 blur-lg group-hover:opacity-100 transition-opacity duration-300"></div>
                <div className="relative bg-gradient-to-r from-primary via-secondary to-accent p-2 rounded-lg">
                  <svg className="w-5 h-5 text-background" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5zm0 18c-3.31-.91-6-4.89-6-9.17V8.47l6-3.15 6 3.15v2.36c0 4.28-2.69 8.26-6 9.17z"/>
                    <path d="M9 12l2 2 4-4" stroke="currentColor" strokeWidth="2" fill="none"/>
                  </svg>
                </div>
              </div>
              <span className="text-lg font-bold font-['Space_Grotesk'] bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
                BlockRegistry
              </span>
            </Link>
            <p className="text-sm text-muted-foreground mb-4">
              Secure, transparent, and immutable land registry on blockchain technology.
            </p>
            <div className="flex space-x-3">
              {socialLinks.map((social) => (
                <a
                  key={social.label}
                  href={social.href}
                  className="p-2 rounded-lg bg-muted/50 text-muted-foreground hover:bg-primary/10 hover:text-primary transition-all duration-300 hover:scale-110"
                  aria-label={social.label}
                >
                  <social.icon className="h-4 w-4" />
                </a>
              ))}
            </div>
          </div>

          {/* Link Columns */}
          {Object.entries(footerLinks).map(([category, links]) => (
            <div key={category}>
              <h3 className="font-semibold text-foreground mb-4">{category}</h3>
              <ul className="space-y-3">
                {links.map((link) => (
                  <li key={link.name}>
                    <a
                      href={link.path}
                      className="text-sm text-muted-foreground hover:text-primary transition-colors duration-300"
                    >
                      {link.name}
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-border/40 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
          <p className="text-sm text-muted-foreground">
            © {new Date().getFullYear()} BlockRegistry. All rights reserved.
          </p>
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-2 px-3 py-1 bg-success/10 border border-success/30 rounded-full">
              <div className="w-2 h-2 bg-success rounded-full animate-pulse"></div>
              <span className="text-xs font-medium text-success">Mainnet Active</span>
            </div>
            <span className="text-xs text-muted-foreground">Block Height: 1,234,567</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
