import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Phone, Lock, User, MapPin, Truck, ArrowRight, CheckCircle, XCircle, AlertTriangle, Home } from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Register = () => {
    const [formData, setFormData] = useState({
        name: '',
        phone: '',
        password: '',
        platform: 'Zomato',
        city: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const [verificationResult, setVerificationResult] = useState(null);
    const { register, token, user, loading: authLoading } = useAuth();
    const navigate = useNavigate();

    useEffect(() => {
        if (!authLoading && token) {
            navigate(user?.role === 'admin' ? '/admin/dashboard' : '/dashboard');
        }
    }, [token, user, authLoading, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setVerificationResult(null);
        setLoading(true);
        const result = await register(formData);
        setLoading(false);
        if (result.success) {
            // Show verification result briefly before navigating
            if (result.swiggyVerification) {
                setVerificationResult(result.swiggyVerification);
                setTimeout(() => navigate('/dashboard'), 2500);
            } else {
                navigate('/dashboard');
            }
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-[#0b1f3a] via-[#0d2a4a] to-[#071426] flex flex-col items-center justify-center p-6 font-['Inter',_sans-serif] py-20">
            <nav className="fixed top-0 left-0 right-0 flex items-center justify-between px-8 py-4 bg-[#0b1f3a]/80 backdrop-blur-md border-b border-white/5 z-50">
                <Link to="/" className="flex items-center gap-2 group">
                    <div className="w-9 h-9 bg-blue-600 rounded-lg flex items-center justify-center group-hover:scale-110 transition-transform">
                        <Shield className="w-5 h-5 text-white" />
                    </div>
                    <span className="text-xl font-bold text-white">PayProtect</span>
                </Link>
                <Link to="/" className="inline-flex items-center gap-1.5 text-slate-300 hover:text-white border border-white/10 hover:border-white/30 rounded-xl px-4 py-2 text-sm font-semibold transition-all">
                    <Home size={15} /> Back to Home
                </Link>
            </nav>

            <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="w-full max-w-lg bg-white rounded-[2.5rem] p-10 shadow-[0_40px_100px_-20px_rgba(0,0,0,0.5)] border border-white/10"
            >
                <div className="text-center mb-10">
                    <h2 className="text-3xl font-bold text-slate-900 tracking-tight">Create your account</h2>
                    <p className="text-slate-500 mt-2 font-medium">Join 45,000+ workers securing their future</p>
                </div>

                {error && (
                    <div className="mb-8 p-4 bg-red-50 text-red-600 border border-red-100 rounded-2xl text-sm font-bold text-center">
                        {error}
                    </div>
                )}

                {/* Swiggy Verification Result */}
                {verificationResult && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className={`mb-8 p-5 rounded-2xl border text-sm font-bold ${
                            verificationResult.isSwiggyVerified 
                                ? 'bg-green-50 text-green-700 border-green-200' 
                                : 'bg-orange-50 text-orange-700 border-orange-200'
                        }`}
                    >
                        <div className="flex items-center gap-3 mb-2">
                            {verificationResult.isSwiggyVerified 
                                ? <CheckCircle size={20} className="text-green-500" />
                                : <XCircle size={20} className="text-orange-500" />
                            }
                            <span className="font-black">
                                {verificationResult.isSwiggyVerified ? '✓ Verified Swiggy Worker' : '✗ Not found on Swiggy'}
                            </span>
                        </div>
                        {verificationResult.isSwiggyVerified && (
                            <div className="text-xs space-y-1 mt-2 pl-8 text-green-600">
                                <p>Name: {verificationResult.workerName}</p>
                                <p>Zone: {verificationResult.workerZone}</p>
                                <p>Vehicle: {verificationResult.vehicleType}</p>
                                {verificationResult.zoneVerified === false && (
                                    <p className="text-orange-600 flex items-center gap-1 mt-1">
                                        <AlertTriangle size={12} /> Zone doesn't match your city
                                    </p>
                                )}
                            </div>
                        )}
                        {!verificationResult.isSwiggyVerified && (
                            <p className="text-xs pl-8 mt-1">{verificationResult.message}</p>
                        )}
                        <p className="text-xs pl-8 mt-3 opacity-70">Redirecting to dashboard...</p>
                    </motion.div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</label>
                            <div className="relative group">
                                <User className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="John Doe"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none text-slate-900 font-bold"
                                    value={formData.name}
                                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
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
                    </div>

                    <div className="space-y-2">
                        <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Choose Password</label>
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

                    <div className="grid md:grid-cols-2 gap-6">
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Working Platform</label>
                            <div className="relative group">
                                <Truck className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors pointer-events-none" />
                                <select 
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none text-slate-900 font-bold appearance-none cursor-pointer"
                                    value={formData.platform}
                                    onChange={(e) => setFormData({...formData, platform: e.target.value})}
                                >
                                    <option value="Zomato">Zomato</option>
                                    <option value="Swiggy">Swiggy</option>
                                    <option value="Amazon">Amazon</option>
                                    <option value="Zepto">Zepto</option>
                                    <option value="Other">Other</option>
                                </select>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-xs font-black uppercase tracking-widest text-slate-400 ml-1">Operating City</label>
                            <div className="relative group">
                                <MapPin className="absolute left-5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-blue-600 transition-colors" />
                                <input 
                                    type="text" 
                                    placeholder="Bengaluru"
                                    className="w-full bg-slate-50 border border-slate-100 rounded-2xl py-4 pl-14 pr-6 focus:bg-white focus:border-blue-600 focus:ring-4 focus:ring-blue-600/5 transition-all outline-none text-slate-900 font-bold"
                                    value={formData.city}
                                    onChange={(e) => setFormData({...formData, city: e.target.value})}
                                    required
                                />
                            </div>
                        </div>
                    </div>

                    {formData.platform === 'Swiggy' && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            className="p-4 bg-blue-50 border border-blue-100 rounded-2xl text-xs text-blue-700 font-semibold flex items-start gap-2"
                        >
                            <Shield size={16} className="shrink-0 mt-0.5 text-blue-500" />
                            <span>Your phone number will be verified against the Swiggy platform to enable earnings protection coverage.</span>
                        </motion.div>
                    )}

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-bold text-lg shadow-xl shadow-blue-600/20 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2 mt-4"
                    >
                        {loading ? "Creating Account..." : "Start Protection"}
                        {!loading && <ArrowRight size={20} />}
                    </button>
                </form>

                <div className="mt-10 pt-10 border-t border-slate-50 text-center">
                    <p className="text-slate-500 font-medium">
                        Already protected? <Link to="/login" className="text-blue-600 font-bold hover:underline">Log In</Link>
                    </p>
                </div>
            </motion.div>
            
            <p className="mt-12 text-slate-500/50 text-[10px] font-black uppercase tracking-[0.3em]">
                Secure Banking Standard • 256-bit Encryption
            </p>
        </div>
    );
};

export default Register;
