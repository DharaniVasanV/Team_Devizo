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
    const { user } = useAuth();
    const [riskData, setRiskData] = useState(null);
    const [activePolicy, setActivePolicy] = useState(null);
    const dummyPolicyId = [...Array(24)].map(() => Math.floor(Math.random() * 16).toString(16)).join('');
    const dummyUserId = '60c72b2f9b1d8b3a0c8e4d1f';

    React.useEffect(() => {
        const fetchRisk = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/policy/calculate-risk`, config);
                setRiskData(res.data);

                const defaultPlan = (res.data.plans || []).find((plan) => plan.popular) || res.data.plans?.[1] || res.data.plans?.[0];
                if (defaultPlan) {
                    setSelectedPlan(defaultPlan.name);
                }
            } catch (err) {
                console.error('Failed to fetch risk', err);
            }
        };

        const fetchPolicy = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/policy/user`, config);
                if (res.data && res.data.status === 'active') {
                    setActivePolicy(res.data);
                    setSelectedPlan(res.data.planType);
                }
            } catch (err) {
                console.log('No active policy found', err);
            }
        };

        fetchRisk();
        fetchPolicy();
    }, []);

    const plans = (riskData?.plans || []).map((plan) => ({
        ...plan,
        icon:
            plan.name === 'Basic'
                ? <CloudRain className="text-blue-400" size={32} />
                : plan.name === 'Standard'
                    ? <ThermometerSun className="text-yellow-500" size={32} />
                    : <Wind className="text-purple-400" size={32} />
    }));

    const selectedPlanData = plans.find((plan) => plan.name === selectedPlan);

    const handlePurchase = async () => {
        setIsPaymentModalOpen(true);
    };

    const handlePaymentSuccess = async () => {
        setLoading(true);
        setError('');
        const plan = selectedPlanData;

        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            await axios.post(`${import.meta.env.VITE_API_URL}/api/policy/create`, {
                planType: plan.name
            }, config);
            navigate('/dashboard');
        } catch (err) {
            setError(err.response?.data?.message || 'Failed to finish policy activation.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="flex bg-[#0b1f3a] min-h-screen text-white font-['Inter',_sans-serif]">
            <Sidebar />

            <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
                <header className="mb-12">
                    <h1 className="text-3xl md:text-4xl font-black mb-4 flex flex-col md:flex-row items-start md:items-center gap-3">
                        <ShieldCheck className="text-primary" size={40} /> Choose Your Protection
                    </h1>
                    <p className="text-slate-400 text-sm md:text-lg">Your weekly plans are tailored using your actual weekly earnings and risk level.</p>

                    {riskData && (
                        <motion.div
                            initial={{ opacity: 0, y: -20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="mt-8 p-6 rounded-[2rem] bg-indigo-900/40 border border-indigo-500/20 w-full lg:max-w-5xl flex flex-col gap-6 shadow-2xl backdrop-blur-xl"
                        >
                            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
                                <div className="w-full md:w-auto">
                                    <h4 className="text-indigo-300 font-bold flex items-center gap-2">
                                        <Activity className="text-indigo-400" size={20} /> AI Risk Assessment
                                    </h4>
                                    <p className="text-sm text-slate-400 mt-1">Premiums are calculated from weekly earnings affordability and disruption risk.</p>
                                </div>
                                <div className="text-left md:text-right w-full md:w-auto">
                                    <div className="text-xl font-black text-white">
                                        Risk Level: <span className={riskData.risk_level === 'high' ? 'text-red-400' : riskData.risk_level === 'medium' ? 'text-yellow-400' : 'text-emerald-400'}>{riskData.risk_level.toUpperCase()}</span>
                                    </div>
                                    <div className="text-sm text-slate-400 mt-1 font-mono">
                                        Score: {riskData.risk_score} | Risk Premium Floor: Rs {riskData.recommended_premium}
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Weekly Earnings</div>
                                    <div className="mt-2 text-2xl font-black text-white">Rs {riskData.weekly_earnings || 0}</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Affordable Budget</div>
                                    <div className="mt-2 text-2xl font-black text-emerald-300">Rs {riskData.affordable_budget || 0}</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Earnings Source</div>
                                    <div className="mt-2 text-2xl font-black text-cyan-300 capitalize">{riskData.earnings_source || 'estimated'}</div>
                                </div>
                            </div>
                        </motion.div>
                    )}
                </header>

                {error && (
                    <div className="mb-8 p-6 bg-red-500/10 border border-red-500/20 text-red-500 rounded-3xl flex items-center gap-4">
                        <Zap size={24} /> {error}
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    {plans.map((plan, idx) => (
                        <motion.div
                            key={idx}
                            whileHover={{ y: -10 }}
                            onClick={() => setSelectedPlan(plan.name)}
                            className={`p-10 rounded-[2.8rem] border-2 cursor-pointer transition-all relative ${
                                activePolicy?.planType === plan.name
                                    ? 'border-green-500 bg-green-500/5 shadow-[0_0_50px_rgba(34,197,94,0.15)]'
                                    : selectedPlan === plan.name
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
                            <p className="text-sm text-slate-400 mb-4">{plan.recommendedFor}</p>
                            <div className="flex items-baseline gap-2 mb-6">
                                <span className="text-4xl font-black text-white">Rs {plan.premium}</span>
                                <span className="text-slate-500 font-bold">/ week</span>
                            </div>

                            <div className="mb-8 rounded-2xl border border-white/10 bg-white/5 p-4">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Coverage Snapshot</div>
                                <div className="mt-2 text-sm text-slate-300">{plan.coverageHours} hrs cover • Payout cap Rs {plan.payoutCap}</div>
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
                                activePolicy?.planType === plan.name
                                    ? 'bg-green-500 text-white'
                                    : selectedPlan === plan.name ? 'bg-primary text-white' : 'bg-white/5 text-slate-400'
                            }`}>
                                {activePolicy?.planType === plan.name ? 'Current Active Plan' : selectedPlan === plan.name ? 'Selected Plan' : 'Select Plan'}
                            </div>
                        </motion.div>
                    ))}
                </div>

                <div className="mt-12 p-8 md:p-10 glass-morphism rounded-[2.5rem] md:rounded-[3rem] border border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="w-full md:w-auto text-center md:text-left">
                        <div className="text-slate-500 uppercase tracking-widest text-[10px] font-black mb-2">Order Summary</div>
                        <h2 className="text-2xl md:text-3xl font-black underline decoration-primary underline-offset-8 decoration-4">{selectedPlan} Plan Purchase</h2>
                        <p className="mt-4 text-slate-400 text-sm">Recurring weekly until cancelled. Protection starts instantly.</p>
                    </div>
                    <div className="text-center md:text-right flex flex-col items-center md:items-end w-full md:w-auto">
                        <div className="text-4xl md:text-5xl font-black mb-6">Rs {selectedPlanData?.premium || 0}.00</div>
                        {activePolicy?.planType === selectedPlan ? (
                            <button
                                disabled
                                className="px-8 md:px-12 py-4 md:py-5 bg-green-500/20 text-green-400 border border-green-500/50 rounded-2xl md:rounded-3xl text-lg md:text-xl font-bold cursor-not-allowed shadow-xl"
                            >
                                Plan Currently Active
                            </button>
                        ) : (
                            <button
                                onClick={handlePurchase}
                                disabled={loading || !selectedPlanData}
                                className="px-8 md:px-12 py-4 md:py-5 bg-primary rounded-2xl md:rounded-3xl text-lg md:text-xl font-bold hover:scale-105 active:scale-95 transition-all w-full md:w-auto disabled:opacity-50 shadow-xl shadow-primary/20"
                            >
                                {loading ? 'Confirming...' : 'Confirm & Subscribe'}
                            </button>
                        )}
                    </div>
                </div>
            </main>

            <PaymentModal
                isOpen={isPaymentModalOpen}
                onClose={() => setIsPaymentModalOpen(false)}
                policyName={`${selectedPlan} Plan`}
                premiumAmount={selectedPlanData?.premium}
                userId={user?._id || user?.id || dummyUserId}
                policyId={dummyPolicyId}
                onPaymentSuccess={handlePaymentSuccess}
            />
        </div>
    );
};

export default BuyPolicy;
