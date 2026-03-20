import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Phone, Lock } from 'lucide-react';
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
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col justify-center items-center p-6 text-center">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-morphism p-12 rounded-[2.5rem] border border-white/10"
            >
                <div className="text-center mb-10">
                    <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-bold">Welcome Back</h2>
                    <p className="text-slate-400 mt-2">Log in to manage your protection</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5 text-left">
                    <div className="relative">
                        <Phone className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                            type="tel" 
                            placeholder="Phone Number"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary transition-all outline-none"
                            value={formData.phone}
                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                            required
                        />
                    </div>
                    <div className="relative">
                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                            type="password" 
                            placeholder="Password"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary transition-all outline-none"
                            value={formData.password}
                            onChange={(e) => setFormData({...formData, password: e.target.value})}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-primary rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all transform active:scale-95 disabled:opacity-50 mt-4"
                    >
                        {loading ? "Logging In..." : "Login"}
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-500">
                    Don't have an account? <Link to="/register" className="text-primary font-bold hover:underline">Register</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Login;
