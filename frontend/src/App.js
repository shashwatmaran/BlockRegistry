import React from 'react';
import "@/App.css";
import { BrowserRouter, Routes, Route, useLocation } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { ProtectedRoute } from '@/components/ProtectedRoute';

import { Home } from '@/pages/Home';
import { Login } from '@/pages/Login';
import { Dashboard } from '@/pages/Dashboard';
import { Properties } from '@/pages/Properties';
import { Register } from '@/pages/Register';
import { Explorer } from '@/pages/Explorer';
import { VerifierDashboard } from '@/pages/VerifierDashboard';
import { ReviewLand } from '@/pages/ReviewLand';
import { AdminDashboard } from '@/pages/AdminDashboard';

function AppContent() {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  const isLoginPage = location.pathname === '/';

  return (
    <>
      {isAuthenticated && !isLoginPage && <Navbar />}
      <main>
        <Routes>
          {/* Public */}
          <Route path="/" element={<Login />} />

          {/* Authenticated — any role */}
          <Route path="/home" element={<ProtectedRoute><Home /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
          <Route path="/properties" element={<ProtectedRoute><Properties /></ProtectedRoute>} />
          <Route path="/register" element={<ProtectedRoute><Register /></ProtectedRoute>} />
          <Route path="/explorer" element={<ProtectedRoute><Explorer /></ProtectedRoute>} />

          {/* Verifier / Admin only */}
          <Route path="/verifier/dashboard"
            element={
              <ProtectedRoute allowedRoles={['verifier', 'admin']}>
                <VerifierDashboard />
              </ProtectedRoute>
            }
          />
          <Route path="/verifier/review/:tokenId"
            element={
              <ProtectedRoute allowedRoles={['verifier', 'admin']}>
                <ReviewLand />
              </ProtectedRoute>
            }
          />

          {/* Admin only */}
          <Route path="/admin/dashboard"
            element={
              <ProtectedRoute allowedRoles={['admin']}>
                <AdminDashboard />
              </ProtectedRoute>
            }
          />
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
        <BrowserRouter>
          <AppContent />
        </BrowserRouter>
      </AuthProvider>
    </div>
  );
}

export default App;
