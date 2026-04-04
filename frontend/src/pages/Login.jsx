import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Phone, Lock, ArrowRight } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Login = () => {
    const [formData, setFormData] = useState({
        phone: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await login(formData.phone, formData.password);
        setLoading(false);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0b1f3a] via-[#0d2a4a] to-[#071426] flex flex-col items-center justify-center p-6 font-['Inter',_sans-serif]">
            <Link to="/" className="flex items-center gap-2 mb-12 group transition-all">
                <div className="w-12 h-12 bg-blue-600 rounded-xl flex items-center justify-center shadow-2xl shadow-blue-600/20 group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-3xl font-bold tracking-tight text-white">PayProtect</span>
            </Link>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-md bg-white rounded-[2.5rem] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10"
            >
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Welcome back</h2>
                    <p className="text-slate-500 mt-2 font-medium">Access your parametric protection panel</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Phone Number</label>
                        <div className="relative group">
                            <Phone className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input 
                                type="tel" 
                                placeholder="888 000 1234"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none text-slate-900 font-bold"
                                value={formData.phone}
                                onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Secure Password</label>
                        <div className="relative group">
                            <Lock className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                            <input 
                                type="password" 
                                placeholder="••••••••"
                                className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none text-slate-900 font-bold"
                                value={formData.password}
                                onChange={(e) => setFormData({...formData, password: e.target.value})}
                                required
                            />
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? "Verifying..." : "Log In"}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="mt-10 pt-10 border-t border-slate-50 text-center">
                    <p className="text-slate-500 font-medium">
                        New to GigShield? <Link to="/register" className="text-blue-600 font-bold hover:underline">Create Account</Link>
                    </p>
                </div>
            </motion.div>
            
            <p className="mt-12 text-slate-500/50 text-[10px] font-black uppercase tracking-[0.3em]">
                Secure Banking Standard • 256-bit Encryption
            </p>
        </div>
    );
};

export default Login;

