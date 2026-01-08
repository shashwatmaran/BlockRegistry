import React from 'react';
import "@/App.css";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { Toaster } from "@/components/ui/sonner";

import { Navbar } from '@/components/Navbar';
import { Footer } from '@/components/Footer';
import { Home } from '@/pages/Home';
import { Dashboard } from '@/pages/Dashboard';
import { Properties } from '@/pages/Properties';
import { Register } from '@/pages/Register';
import { Explorer } from '@/pages/Explorer';

function App() {
  return (
    <div className="App min-h-screen bg-background text-foreground">
      <BrowserRouter>
        <Navbar />
        <main>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/properties" element={<Properties />} />
            <Route path="/register" element={<Register />} />
            <Route path="/explorer" element={<Explorer />} />
          </Routes>
        </main>
        <Footer />
        <Toaster />
      </BrowserRouter>
    </div>
  );
}

export default App;
