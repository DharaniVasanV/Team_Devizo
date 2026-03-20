import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, Phone, Lock, User, MapPin, Truck } from 'lucide-react';
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
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        const result = await register(formData);
        setLoading(false);
        if (result.success) {
            navigate('/dashboard');
        } else {
            setError(result.message);
        }
    };

    return (
        <div className="min-h-screen bg-[#0f172a] text-white flex flex-col justify-center items-center p-6">
            <motion.div 
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full max-w-md glass-morphism p-10 rounded-[2.5rem] border border-white/10"
            >
                <div className="text-center mb-10">
                    <Shield className="w-12 h-12 text-primary mx-auto mb-4" />
                    <h2 className="text-3xl font-bold">Join GigGuard</h2>
                    <p className="text-slate-400 mt-2">Protect your earnings today</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-red-500/10 border border-red-500/20 text-red-500 rounded-xl text-sm text-center">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-5">
                    <div className="relative">
                        <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="Full Name"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary transition-all outline-none"
                            value={formData.name}
                            onChange={(e) => setFormData({...formData, name: e.target.value})}
                            required
                        />
                    </div>
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
                    <div className="relative">
                        <Truck className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <select 
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary transition-all outline-none appearance-none"
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
                    <div className="relative">
                        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                        <input 
                            type="text" 
                            placeholder="City"
                            className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-12 pr-4 focus:border-primary transition-all outline-none"
                            value={formData.city}
                            onChange={(e) => setFormData({...formData, city: e.target.value})}
                            required
                        />
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full py-4 bg-primary rounded-2xl font-bold text-lg hover:bg-primary/90 transition-all transform active:scale-95 disabled:opacity-50"
                    >
                        {loading ? "Creating Account..." : "Create Account"}
                    </button>
                </form>

                <p className="text-center mt-8 text-slate-500">
                    Already have an account? <Link to="/login" className="text-primary font-bold hover:underline">Login</Link>
                </p>
            </motion.div>
        </div>
    );
};

export default Register;
