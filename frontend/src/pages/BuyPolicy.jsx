import React, { useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { ShieldCheck, CloudRain, Wind, ThermometerSun, CheckCircle, Zap, Activity } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import PaymentModal from '../components/PaymentModal';

const BuyPolicy = () => {
    const [selectedPlan, setSelectedPlan] = useState('Standard');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const navigate = useNavigate();
    const { user } = useAuth(); // Assuming 'user' exists in AuthContext
    const [riskData, setRiskData] = useState(null);
    const dummyPolicyId = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const dummyUserId = "60c72b2f9b1d8b3a0c8e4d1f"; // valid hex fallback

    React.useEffect(() => {
        const fetchRisk = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/policy/calculate-risk`, config);
                setRiskData(res.data);
            } catch (err) {
                console.error("Failed to fetch risk", err);
            }
        };
        fetchRisk();
    }, []);

    const basePremium = riskData?.recommended_premium || 199;

    const plans = [
        {
            name: 'Basic',
            premium: basePremium,
            coverage: 50,
            features: ['Heavy Rain Protection', 'Sudden Area Restrictions', 'Standard Payout (₹250)', 'Weekly Plan'],
            icon: <CloudRain className="text-blue-400" size={32} />
        },
        {
            name: 'Standard',
            premium: basePremium + 150,
            coverage: 75,
            features: [
                'Heavy Rain Protection', 
                'Extreme Heat Protection',
                'Sudden Area Restrictions',
                'Enhanced Payout (₹500)',
                'Priority Claim Processing'
            ],
            icon: <ThermometerSun className="text-yellow-500" size={32} />,
            popular: true
        },
        {
            name: 'Premium',
            premium: basePremium + 300,
            coverage: 100,
            features: [
                'All Weather Disruptions',
                'Severe Pollution Protection',
                'Sudden Area Restrictions',
                'Maximum Payout (₹750)',
                'Instant Payout Processing'
            ],
            icon: <Wind className="text-purple-400" size={32} />
        }
    ];

    const handlePurchase = async () => {
        // First open the payment modal to simulate gateway
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async () => {
        setLoading(true);
        setError('');
        const plan = plans.find(p => p.name === selectedPlan);
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            await axios.post(`${import.meta.env.VITE_API_URL}/api/policy/create`, {
                planType: plan.name,
                weeklyPremium: plan.premium,
                coverageHours: plan.coverage
            }, config);
            // Navigate after policy is successfully created
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to finish policy activation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-[#0f172a] min-h-screen text-white">
            <Sidebar />
            
            <main className="flex-1 p-10 overflow-auto">
                <header className="mb-12">
                    <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                        <ShieldCheck className="text-primary" size={40} /> Choose Your Protection
                    </h1>
                    <p className="text-slate-400 text-lg">Select a weekly plan that fits your working hours and risk level.</p>
                    
                    {riskData && (
                        <motion.div 
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-6 rounded-[2rem] bg-indigo-900/40 border border-indigo-500/20 max-w-2xl flex items-center justify-between shadow-2xl backdrop-blur-xl"
                        >
                            <div>
                                <h4 className="text-indigo-300 font-bold flex items-center gap-2">
                                    <Activity className="text-indigo-400" size={20} /> AI Risk Assessment
                                </h4>
                                <p className="text-sm text-slate-400 mt-1">Real-time parameters dynamically analyzed.</p>
                            </div>
                            <div className="text-right">
                                <div className="text-xl font-black text-white">Risk Level: <span className={riskData.risk_level === 'high' ? 'text-red-400' : riskData.risk_level === 'medium' ? 'text-yellow-400' : 'text-emerald-400'}>{riskData.risk_level.toUpperCase()}</span></div>
                                <div className="text-sm text-slate-400 mt-1 font-mono">Score: {riskData.risk_score} | Base Premium: ₹{riskData.recommended_premium}</div>
                            </div>
                        </motion.div>
                    )}
                </header>

                {error && (
                    <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center gap-4">
                        <Zap size={24} /> {error}
                    </div>
                )}

                <div className="grid lg:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <motion.div 
                            key={idx}
                            whileHover={{ y: -10 }}
                            onClick={() => setSelectedPlan(plan.name)}
                            className={`p-10 rounded-[2.8rem] border-2 cursor-pointer transition-all relative ${
                                selectedPlan === plan.name 
                                    ? 'border-primary bg-primary/5 shadow-[0_0_50px_rgba(99,102,241,0.1)]' 
                                    : 'border-white/5 bg-white/5 hover:border-white/20'
                            }`}
                        >
                            {plan.popular && (
                                <div className="absolute top-0 right-10 -translate-y-1/2 bg-primary px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest">
                                    Most Popular
                                </div>
                            )}

                            <div className="mb-8">{plan.icon}</div>
                            <h3 className="text-3xl font-black mb-2">{plan.name}</h3>
                            <div className="flex items-baseline gap-2 mb-8">
                                <span className="text-4xl font-black text-white">₹{plan.premium}</span>
                                <span className="text-slate-500 font-bold">/ week</span>
                            </div>

                            <ul className="space-y-4 mb-10">
                                {plan.features.map((feature, fIdx) => (
                                    <li key={fIdx} className="flex items-center gap-3 text-sm text-slate-300">
                                        <CheckCircle className="text-green-500 shrink-0" size={18} />
                                        {feature}
                                    </li>
                                ))}
                            </ul>

                            <div className={`w-full py-4 rounded-2xl flex items-center justify-center font-bold transition-all ${
                                selectedPlan === plan.name ? 'bg-primary text-white' : 'bg-white/5 text-slate-400'
                            }`}>
                                {selectedPlan === plan.name ? 'Selected Plan' : 'Select Plan'}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 p-10 glass-morphism rounded-[3rem] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div>
                        <div className="text-slate-500 uppercase tracking-widest text-xs font-black mb-2">Order Summary</div>
                        <h2 className="text-3xl font-black underline decoration-primary underline-offset-8 decoration-4">{selectedPlan} Plan Purchase</h2>
                        <p className="mt-4 text-slate-400">Recurring weekly until cancelled. Protection starts instantly.</p>
                    </div>
                    <div className="text-right flex flex-col items-center md:items-end w-full md:w-auto">
                        <div className="text-5xl font-black mb-6">₹{plans.find(p => p.name === selectedPlan)?.premium}.00</div>
                        <button 
                            onClick={handlePurchase}
                            disabled={loading}
                            className="px-12 py-5 bg-primary rounded-3xl text-xl font-bold hover:scale-105 active:scale-95 transition-all w-full md:w-auto disabled:opacity-50"
                        >
                            {loading ? "Confirming..." : "Confirm & Subscribe"}
                        </button>
                    </div>
                </div>
            </main>

            <PaymentModal 
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                policyName={`${selectedPlan} Plan`}
                premiumAmount={plans.find(p => p.name === selectedPlan)?.premium}
                userId={user?._id || user?.id || dummyUserId}
                policyId={dummyPolicyId}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default BuyPolicy;
