import React, { useEffect, useState, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { gsap } from 'gsap';
import axios from 'axios';
import { 
    CloudRain, 
    Shield, 
    ArrowUpRight, 
    AlertTriangle, 
    Calendar, 
    TrendingUp, 
    Zap,
    ThermometerSun,
    Wind,
    BellRing,
    MapPin,
    FlaskConical,
    CheckCircle2,
    XCircle,
    Loader2
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AnimatedCharts from '../components/AnimatedCharts';

const Dashboard = () => {
    const [policy, setPolicy] = useState(null);
    const [claims, setClaims] = useState([]);
    const [stats, setStats] = useState({ protected: 0, claimsTriggered: 0, earningsCovered: 0 });
    const [loading, setLoading] = useState(true);
    const dashboardRef = useRef(null);

    // ── Fraud simulation demo state ─────────────────────────────
    const [fraudLoading, setFraudLoading] = useState(null); // 'GPS_SPOOFING' | 'FAKE_WEATHER' | null
    const [fraudResult, setFraudResult] = useState(null);
    const [payoutResult, setPayoutResult] = useState(null);
    const [loadingPayout, setLoadingPayout] = useState(false);
    const [weather, setWeather] = useState(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [policyRes, claimsRes, transRes, weatherRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/policy/user`),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/claims`),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/payout/transactions`),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/weather/current`).catch(() => ({ data: null })) // Allow gracefully failing weather
                ]);

                setPolicy(policyRes.data);
                setClaims(claimsRes.data);
                if (weatherRes && weatherRes.data) {
                    setWeather(weatherRes.data);
                }
                
                // Calculate stats
                const paidClaims = claimsRes.data.filter(c => c.status === 'paid');
                setStats({
                    protected: claimsRes.data.length,
                    claimsTriggered: claimsRes.data.length,
                    earningsCovered: paidClaims.reduce((sum, c) => sum + c.claimAmount, 0)
                });
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // ── Fraud simulation handler ────────────────────────────────
    const handleFraudSimulation = async (fraudType) => {
        if (!policy) {
            setFraudResult({ error: 'You need an active policy first to run the simulation.' });
            return;
        }
        setFraudLoading(fraudType);
        setFraudResult(null);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/claims/simulate-fraud`,
                { policyId: policy._id, fraudType },
                config
            );
            setFraudResult(res.data);
            // Refresh claims list
            const claimsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/claims`, config);
            setClaims(claimsRes.data);
        } catch (err) {
            setFraudResult({ error: err.response?.data?.message || 'Simulation failed.' });
        } finally {
            setFraudLoading(null);
        }
    };

    const handlePayoutSimulation = async () => {
        if (!policy) {
            setPayoutResult({ error: 'You need an active policy first to run the simulation.' });
            return;
        }
        setLoadingPayout(true);
        setPayoutResult(null);
        try {
            const token = localStorage.getItem('token');
            const config = { headers: { Authorization: `Bearer ${token}` } };
            const res = await axios.post(
                `${import.meta.env.VITE_API_URL}/api/payout/process-payout`,
                { policyId: policy._id },
                config
            );
            setPayoutResult(res.data);
            // Refresh claims list
            const claimsRes = await axios.get(`${import.meta.env.VITE_API_URL}/api/claims`, config);
            setClaims(claimsRes.data);
        } catch (err) {
            setPayoutResult({ error: err.response?.data?.message || 'Payout simulation failed.' });
        } finally {
            setLoadingPayout(false);
        }
    };

    useEffect(() => {
        if (!loading) {
            gsap.from(".stat-card", {
                duration: 0.8,
                y: 30,
                opacity: 0,
                stagger: 0.1,
                ease: "power3.out"
            });
        }
    }, [loading]);

    return (
        <div className="flex bg-[#0b1f3a] min-h-screen text-white font-['Inter',_sans-serif]">
            <Sidebar />
            
            <main ref={dashboardRef} className="flex-1 p-6 md:p-10 overflow-x-hidden">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Worker Dashboard</h1>
                        <p className="text-slate-400 text-sm md:text-base">Everything at a glance. Stay protected.</p>
                    </div>
                    <div className="flex gap-4 w-full md:w-auto">
                        <div className="glass-morphism px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/5 w-full md:w-auto justify-center md:justify-start">
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-semibold">Monitoring Active</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Protected', value: `₹${stats.earningsCovered}`, icon: <Shield className="text-primary" />, color: 'bg-primary/10' },
                        { label: 'Claim Count', value: stats.claimsTriggered, icon: <AlertTriangle className="text-yellow-500" />, color: 'bg-yellow-500/10' },
                        { label: 'Weekly Cost', value: policy ? `₹${policy.weeklyPremium}` : '₹0', icon: <TrendingUp className="text-green-500" />, color: 'bg-green-500/10' },
                        { label: 'System Health', value: '100%', icon: <Zap className="text-accent" />, color: 'bg-accent/10' }
                    ].map((stat, idx) => (
                        <div key={idx} className="stat-card glass-morphism p-6 rounded-[2rem] border border-white/5 hover:border-white/10 transition-all">
                            <div className={`${stat.color} p-4 rounded-2xl w-fit mb-4`}>
                                {stat.icon}
                            </div>
                            <div className="text-slate-400 text-sm font-medium mb-1">{stat.label}</div>
                            <div className="text-3xl font-bold">{stat.value}</div>
                        </div>
                    ))}
                </div>

                <div className="grid lg:grid-cols-3 gap-8">
                    {/* Active Policy Area */}
                    <div className="lg:col-span-2 space-y-8">
                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <Shield className="text-primary" size={24} /> Active Protection
                            </h2>
                            {policy ? (
                                <motion.div 
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary/20 via-primary/5 to-transparent border border-primary/20 relative overflow-hidden"
                                >
                                    <div className="absolute top-0 right-0 p-8">
                                        <div className="px-4 py-1.5 bg-primary text-white text-xs font-bold rounded-full uppercase tracking-widest">
                                            {policy.status}
                                        
                                        </div>
                                    </div>
                                    <div className="grid md:grid-cols-2 gap-12">
                                        <div>
                                            <div className="text-slate-400 text-sm mb-2 uppercase tracking-wider font-bold">Policy Plan</div>
                                            <div className="text-4xl font-black mb-6">{policy.planType} Plan</div>
                                            <div className="flex items-center gap-6">
                                                <div className="flex flex-col">
                                                    <span className="text-slate-500 text-xs mb-1">Coverage</span>
                                                    <span className="font-bold flex items-center gap-1"><Calendar size={14}/> 7 Days Left</span>
                                                </div>
                                                <div className="flex flex-col border-l border-white/10 pl-6">
                                                    <span className="text-slate-500 text-xs mb-1">Premium</span>
                                                    <span className="font-bold">₹{policy.weeklyPremium} / Week</span>
                                                </div>
                                            </div>
                                        </div>
                                        <div className="space-y-4">
                                            <div className="text-slate-400 text-sm font-bold flex justify-between">
                                                <span>Live Weather Data</span>
                                                <span className="text-blue-400">{weather?.city || 'Fetching Area...'}</span>
                                            </div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-sm border border-white/5">
                                                    <span className="flex items-center gap-2 text-blue-400"><CloudRain size={16}/> Rainfall</span>
                                                    <div className="text-right flex items-center gap-3">
                                                        <div className="text-xs text-slate-500 hidden md:block">Limit: 50mm/hr</div>
                                                        <div className={`font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest ${weather?.rainfall >= 50 ? 'bg-red-500/20 text-red-500' : weather?.rainfall > 20 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-400'}`}>
                                                            {weather ? `${weather.rainfall} mm` : '...'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-sm border border-white/5">
                                                    <span className="flex items-center gap-2 text-yellow-500"><ThermometerSun size={16}/> Temperature</span>
                                                    <div className="text-right flex items-center gap-3">
                                                        <div className="text-xs text-slate-500 hidden md:block">Limit: 40°C</div>
                                                        <div className={`font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest ${weather?.temperature >= 40 ? 'bg-red-500/20 text-red-500' : weather?.temperature > 35 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-400'}`}>
                                                            {weather ? `${weather.temperature}°C` : '...'}
                                                        </div>
                                                    </div>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-sm border border-white/5">
                                                    <span className="flex items-center gap-2 text-purple-400"><Wind size={16}/> AQI Level</span>
                                                    <div className="text-right flex items-center gap-3">
                                                        <div className="text-xs text-slate-500 hidden md:block">Limit: 300+</div>
                                                        <div className={`font-bold px-3 py-1 rounded-full text-xs uppercase tracking-widest ${weather?.aqi >= 300 ? 'bg-red-500/20 text-red-500' : weather?.aqi > 150 ? 'bg-yellow-500/20 text-yellow-500' : 'bg-green-500/20 text-green-400'}`}>
                                                            {weather ? `${weather.aqi} AQI` : '...'}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            ) : (
                                <div className="p-12 glass-morphism rounded-[2.5rem] border border-white/5 border-dashed flex flex-col items-center justify-center text-center">
                                    <div className="p-6 bg-white/5 rounded-full mb-6">
                                        <Shield size={48} className="text-slate-600" />
                                    </div>
                                    <h3 className="text-xl font-bold mb-2">No Active Protection</h3>
                                    <p className="text-slate-400 mb-8 max-w-sm">You haven't purchased an income protection policy yet. Start today to stay safe.</p>
                                    <button className="px-8 py-3 bg-primary rounded-xl font-bold hover:scale-105 transition-all">Buy First Policy</button>
                                </div>
                            )}
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                <TrendingUp className="text-primary" size={24} /> Protected Earnings Trend
                            </h2>
                            <div className="p-8 glass-morphism rounded-[2.5rem] border border-white/5 overflow-hidden">
                                <AnimatedCharts />
                            </div>
                        </section>

                        <section>
                            <h2 className="text-2xl font-bold mb-6">Recent Claims</h2>
                            <div className="space-y-4">
                                {claims.length > 0 ? (
                                    claims.slice(0, 3).map((claim, idx) => (
                                        <div key={idx} className="p-6 glass-morphism rounded-2xl border border-white/5 flex items-center justify-between group hover:border-primary/30 transition-all">
                                            <div className="flex items-center gap-6">
                                                <div className="w-14 h-14 bg-primary/10 rounded-xl flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
                                                    <CloudRain size={28} />
                                                </div>
                                                <div>
                                                    <div className="font-bold text-lg">{claim.triggerType} Disruption</div>
                                                    <div className="text-slate-400 text-sm">{new Date(claim.createdAt).toLocaleDateString()} • {claim.disruptionDetails?.value || 'Active'}</div>
                                                </div>
                                            </div>
                                            <div className="text-right">
                                                <div className="text-xl font-bold text-green-500 mb-1">+₹{claim.claimAmount}</div>
                                                <div className={`text-[10px] px-2 py-0.5 rounded-full uppercase tracking-widest font-black inline-block ${
                                                    claim.status === 'paid' ? 'bg-green-500/20 text-green-500' : 
                                                    claim.status === 'approved' ? 'bg-blue-500/20 text-blue-500' :
                                                    claim.status === 'fraud suspected' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                                                    'bg-yellow-500/20 text-yellow-500'
                                                }`}>
                                                    {claim.status === 'fraud suspected' ? '🚨 fraud' : claim.status}
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-slate-500 italic">No claims triggered yet.</p>
                                )}
                            </div>
                        </section>
                    </div>

                    {/* Disruption Alerts Area */}
                    <div>
                        <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                            <BellRing className="text-accent" size={24} /> System Alerts
                        </h2>

                        {/* ── Fraud Simulation Demo Panel ─────── */}
                        <div className="mb-6 p-6 rounded-2xl border border-dashed border-red-500/30 bg-red-500/5">
                            <div className="flex items-center gap-2 mb-1">
                                <FlaskConical size={16} className="text-red-400" />
                                <span className="text-xs font-black uppercase tracking-widest text-red-400">Demo · Fraud Simulator</span>
                            </div>
                            <p className="text-slate-500 text-xs mb-4">Trigger a fake claim to see the AI fraud detection in action.</p>

                            <div className="flex flex-col gap-3">
                                {/* Simulate Disaster - Auto Payout */}
                                <motion.button
                                    id="btn-simulate-disaster"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handlePayoutSimulation()}
                                    disabled={!!fraudLoading || loadingPayout}
                                    className="flex items-center gap-3 px-4 py-3 bg-red-500/10 border border-red-500/20 rounded-xl text-sm font-bold text-red-500 hover:bg-red-500/20 transition-all disabled:opacity-50"
                                >
                                    {loadingPayout 
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <AlertTriangle size={16} />}
                                    Simulate Disaster (Auto Payout)
                                </motion.button>
                                {/* GPS Spoofing Button */}
                                <motion.button
                                    id="btn-simulate-gps-fraud"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleFraudSimulation('GPS_SPOOFING')}
                                    disabled={!!fraudLoading}
                                    className="flex items-center gap-3 px-4 py-3 bg-orange-500/10 border border-orange-500/20 rounded-xl text-sm font-bold text-orange-400 hover:bg-orange-500/20 transition-all disabled:opacity-50"
                                >
                                    {fraudLoading === 'GPS_SPOOFING'
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <MapPin size={16} />}
                                    Simulate GPS Spoofing
                                </motion.button>

                                {/* Fake Weather Button */}
                                <motion.button
                                    id="btn-simulate-weather-fraud"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.97 }}
                                    onClick={() => handleFraudSimulation('FAKE_WEATHER')}
                                    disabled={!!fraudLoading}
                                    className="flex items-center gap-3 px-4 py-3 bg-blue-500/10 border border-blue-500/20 rounded-xl text-sm font-bold text-blue-400 hover:bg-blue-500/20 transition-all disabled:opacity-50"
                                >
                                    {fraudLoading === 'FAKE_WEATHER'
                                        ? <Loader2 size={16} className="animate-spin" />
                                        : <CloudRain size={16} />}
                                    Simulate Fake Weather Claim
                                </motion.button>
                            </div>

                            {/* Result Banner */}
                            <AnimatePresence>
                                {fraudResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`mt-4 p-4 rounded-xl text-xs font-mono leading-relaxed ${
                                            fraudResult.error
                                                ? 'bg-yellow-500/10 border border-yellow-500/20 text-yellow-400'
                                                : fraudResult.fraudSummary?.isFraud
                                                    ? 'bg-red-500/10 border border-red-500/20 text-red-300'
                                                    : 'bg-green-500/10 border border-green-500/20 text-green-300'
                                        }`}
                                    >
                                        {fraudResult.error ? (
                                            <span>⚠️ {fraudResult.error}</span>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                                                    {fraudResult.fraudSummary?.isFraud
                                                        ? <><XCircle size={16} className="text-red-400" /> Fraud Detected &amp; Flagged!</>
                                                        : <><CheckCircle2 size={16} className="text-green-400" /> Claim Appears Legitimate</>}
                                                </div>
                                                {fraudResult.fraudSummary?.checks?.map((check, i) => (
                                                    <div key={i} className="mb-1">
                                                        <span className="opacity-60">[{check.type}]</span> {check.verdict}
                                                        {check.reasons?.slice(0, 2).map((r, j) => (
                                                            <div key={j} className="pl-4 opacity-70">• {r}</div>
                                                        ))}
                                                    </div>
                                                ))}
                                                <div className="mt-2 opacity-50">
                                                    Ground Truth — Rain: {fraudResult.fraudSummary?.groundTruth?.rainfall?.toFixed(1)}mm |
                                                    Temp: {fraudResult.fraudSummary?.groundTruth?.temperature?.toFixed(1)}°C |
                                                    AQI: {fraudResult.fraudSummary?.groundTruth?.aqi?.toFixed(0)}
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                            
                            {/* Payout Result Banner */}
                            <AnimatePresence>
                                {payoutResult && (
                                    <motion.div
                                        initial={{ opacity: 0, y: 8 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className={`mt-4 p-4 rounded-xl text-xs font-mono leading-relaxed ${
                                            payoutResult.error
                                                ? 'bg-red-500/10 border border-red-500/20 text-red-400'
                                                : 'bg-green-500/10 border border-green-500/20 text-green-300'
                                        }`}
                                    >
                                        {payoutResult.error ? (
                                            <span>⚠️ {payoutResult.error}</span>
                                        ) : (
                                            <>
                                                <div className="flex items-center gap-2 mb-2 font-bold text-sm">
                                                    <CheckCircle2 size={16} className="text-green-400" /> Payout Processed Successfully!
                                                </div>
                                                <div className="mb-1">
                                                    <span className="opacity-60">[CLAIM_ID]</span> {payoutResult.claimId || 'N/A'}
                                                </div>
                                                <div className="mb-1">
                                                    <span className="opacity-60">[AMOUNT]</span> ₹{payoutResult.payoutAmount || 0}
                                                </div>
                                                <div className="mt-2 opacity-50">
                                                    {payoutResult.message || 'Auto payout completed out against parametric policy.'}
                                                </div>
                                            </>
                                        )}
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                        <div className="space-y-4">
                            <div className="p-6 bg-red-500/10 border border-red-500/20 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-red-500"></div>
                                <div className="flex items-start gap-4">
                                    <AlertTriangle className="text-red-500 shrink-0" size={24} />
                                    <div>
                                        <div className="font-bold mb-1">Severe Rain Forecast</div>
                                        <p className="text-sm text-slate-400">Expect high intensity rain tonight. Claims will trigger if rainfall exceeds 50mm.</p>
                                    </div>
                                </div>
                            </div>
                            
                            <div className="p-6 glass-morphism border border-white/10 rounded-2xl relative overflow-hidden group">
                                <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
                                <div className="flex items-start gap-4">
                                    <Shield className="text-blue-500 shrink-0" size={24} />
                                    <div>
                                        <div className="font-bold mb-1">Policy Renewal Soon</div>
                                        <p className="text-sm text-slate-400">Your current coverage expires in 3 days. Renew now to stay protected.</p>
                                    </div>
                                </div>
                            </div>

                            <motion.div 
                                className="p-8 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl mt-12 relative overflow-hidden group cursor-pointer"
                                whileHover={{ scale: 1.02 }}
                            >
                                <div className="relative z-10">
                                    <h3 className="text-xl font-bold mb-2">Refer a Partner</h3>
                                    <p className="text-indigo-100 text-sm mb-6">Earn ₹100 for every delivery partner who joins GigShield.</p>
                                    <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-widest backdrop-blur-md border border-white/20">
                                        Invite Now <ArrowUpRight size={14} />
                                    </div>
                                </div>
                                <Shield className="absolute -bottom-6 -right-6 text-white/10 w-32 h-32 rotate-12" />
                            </motion.div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Dashboard;
