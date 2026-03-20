import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import BuyPolicy from './pages/BuyPolicy';
import Claims from './pages/Claims';
import Payouts from './pages/Payouts';

const PrivateRoute = ({ children }) => {
  const { token, loading } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0f172a] flex items-center justify-center text-white">Loading...</div>;
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<PrivateRoute><Dashboard /></PrivateRoute>} />
          <Route path="/buy-policy" element={<PrivateRoute><BuyPolicy /></PrivateRoute>} />
          <Route path="/claims" element={<PrivateRoute><Claims /></PrivateRoute>} />
          <Route path="/payouts" element={<PrivateRoute><Payouts /></PrivateRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
}

export default App;