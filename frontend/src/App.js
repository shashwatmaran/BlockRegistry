import React from 'react';
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { WalletProvider } from '@/contexts/WalletContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Properties } from '@/pages/Properties';
import { Register } from '@/pages/Register';
import { Explorer } from '@/pages/Explorer';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <>
      {isAuthenticated && !isLoginPage && <Navbar />}
      <main>
        <Routes>
          <Route path="/" element={<Login />} />
          <Route path="/home" element={<Home />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/properties" element={<Properties />} />
          <Route path="/register" element={<Register />} />
          <Route path="/explorer" element={<Explorer />} />
        </Routes>
      </main>
      {isAuthenticated && !isLoginPage && <Footer />}
      <Toaster />
    </>
  );
}

function App() {
  return (
    <div className="App min-h-screen bg-background text-foreground">
      <AuthProvider>
        <WalletProvider>
          <BrowserRouter>
            <AppContent />
          </BrowserRouter>
        </WalletProvider>
      </AuthProvider>
    </div>
  );
}

export default App;
