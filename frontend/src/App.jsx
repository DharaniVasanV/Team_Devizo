import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import LandingPage from './pages/LandingPage';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import AdminDashboard from './pages/AdminDashboard';
import BuyPolicy from './pages/BuyPolicy';
import Claims from './pages/Claims';
import Payouts from './pages/Payouts';

const WorkerRoute = ({ children }) => {
  const { token, loading, user } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#0b1f3a] flex items-center justify-center text-white font-['Inter',_sans-serif]">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  return user?.role === 'admin' ? <Navigate to="/admin/dashboard" /> : children;
};

const AdminRoute = ({ children }) => {
  const { token, loading, user } = useAuth();
  if (loading) return <div className="min-h-screen bg-[#09111f] flex items-center justify-center text-white font-['Inter',_sans-serif]">Loading...</div>;
  if (!token) return <Navigate to="/login" />;
  return user?.role === 'admin' ? children : <Navigate to="/dashboard" />;
};

function App() {
  return (
    <AuthProvider>
      <AnimatePresence mode="wait">
        <Routes>
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/dashboard" element={<WorkerRoute><Dashboard /></WorkerRoute>} />
          <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
          <Route path="/buy-policy" element={<WorkerRoute><BuyPolicy /></WorkerRoute>} />
          <Route path="/claims" element={<WorkerRoute><Claims /></WorkerRoute>} />
          <Route path="/payouts" element={<WorkerRoute><Payouts /></WorkerRoute>} />
          <Route path="*" element={<Navigate to="/" />} />
        </Routes>
      </AnimatePresence>
    </AuthProvider>
  );
}

export default App;
