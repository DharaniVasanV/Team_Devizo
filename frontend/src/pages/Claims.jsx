import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import axios from 'axios';
import { 
    BellRing, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    IndianRupee, 
    ChevronRight,
    ChevronDown,
    Zap,
    ShieldAlert,
    MapPin,
    CloudOff
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

// ─────────────────────────────────────────────────────────────
// STATUS CONFIG
// ─────────────────────────────────────────────────────────────
const statusConfig = {
    paid:              { bg: 'bg-green-500/20',  text: 'text-green-500',  border: 'border-green-500/30',  icon: <CheckCircle size={32} />,  label: 'Paid' },
    approved:          { bg: 'bg-blue-500/20',   text: 'text-blue-500',   border: 'border-blue-500/30',   icon: <Zap size={32} />,          label: 'Approved' },
    pending:           { bg: 'bg-yellow-500/20', text: 'text-yellow-500', border: 'border-yellow-500/30', icon: <Clock size={32} />,        label: 'Pending' },
    rejected:          { bg: 'bg-slate-500/20',  text: 'text-slate-400',  border: 'border-slate-500/30',  icon: <AlertCircle size={32} />,  label: 'Rejected' },
    'fraud suspected': { bg: 'bg-red-500/20',    text: 'text-red-400',    border: 'border-red-500/30',    icon: <ShieldAlert size={32} />,  label: '🚨 Fraud' },
};

// ─────────────────────────────────────────────────────────────
// FRAUD CHECK DETAIL CARD
// ─────────────────────────────────────────────────────────────
const FraudDetail = ({ claim }) => {
    const [open, setOpen] = useState(false);
    const checks = claim.disruptionDetails?.fraudChecks;
    const groundTruth = claim.disruptionDetails?.groundTruth;
    if (!checks || checks.length === 0) return null;

    return (
        <div className="mt-4 w-full">
            <button
                onClick={() => setOpen(o => !o)}
                className="flex items-center gap-2 text-xs text-red-400 font-bold uppercase tracking-widest hover:text-red-300 transition-colors"
            >
                <ShieldAlert size={14} />
                Fraud Report
                {open ? <ChevronDown size={13} /> : <ChevronRight size={13} />}
            </button>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: 'auto' }}
                        exit={{ opacity: 0, height: 0 }}
                        className="overflow-hidden"
                    >
                        <div className="mt-3 p-4 bg-red-500/5 border border-red-500/20 rounded-xl font-mono text-xs text-red-300 space-y-3">
                            {/* Ground truth row */}
                            {groundTruth && (
                                <div className="pb-2 border-b border-red-500/10 text-slate-400">
                                    <span className="text-red-400 font-bold">Ground Truth</span> —&nbsp;
                                    Rain: <span className="text-white">{groundTruth.rainfall?.toFixed(1)}mm</span> |
                                    Temp: <span className="text-white">{groundTruth.temperature?.toFixed(1)}°C</span> |
                                    AQI: <span className="text-white">{groundTruth.aqi?.toFixed(0)}</span>
                                </div>
                            )}

                            {/* Each fraud check */}
                            {checks.map((check, i) => (
                                <div key={i}>
                                    <div className="flex items-center gap-2 mb-1">
                                        {check.type === 'GPS_SPOOFING'
                                            ? <MapPin size={12} className="text-orange-400" />
                                            : <CloudOff size={12} className="text-blue-400" />}
                                        <span className={`font-bold ${check.isFraud ? 'text-red-400' : 'text-green-400'}`}>
                                            [{check.type}]
                                        </span>
                                        <span className="opacity-70">Score: {check.confidence}/100</span>
                                    </div>
                                    <div className="pl-5 opacity-80 mb-1">{check.verdict}</div>
                                    {check.reasons?.map((r, j) => (
                                        <div key={j} className="pl-5 opacity-60">• {r}</div>
                                    ))}
                                </div>
                            ))}
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
};

// ─────────────────────────────────────────────────────────────
// MAIN COMPONENT
// ─────────────────────────────────────────────────────────────
const Claims = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const token = localStorage.getItem('token');
                const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/claims`, config);
                setClaims(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchClaims();
    }, []);

    const handlePayoutFetch = async (claimId, amount) => {
        try {
            const token = localStorage.getItem('token');
            const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
            await axios.post(`${import.meta.env.VITE_API_URL}/api/payout`, { claimId, amount }, config);
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/claims`, config);
            setClaims(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fraudCount   = claims.filter(c => c.status === 'fraud suspected').length;
    const approvedCount = claims.filter(c => c.status === 'approved' || c.status === 'paid').length;

    return (
        <div className="flex bg-[#0b1f3a] min-h-screen text-white font-['Inter',_sans-serif]">
            <Sidebar />
            
            <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
                <header className="mb-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-black mb-2 flex items-center gap-3">
                            <BellRing className="text-primary" size={40} /> Claim History
                        </h1>
                        <p className="text-slate-400 text-sm md:text-lg">Every claim triggered by environmental disruptions — with AI fraud analysis.</p>
                    </div>

                    {/* Summary chips */}
                    {claims.length > 0 && (
                        <div className="flex gap-3 flex-wrap">
                            <div className="px-4 py-2 bg-green-500/10 border border-green-500/20 rounded-xl text-xs font-bold text-green-400 flex items-center gap-2">
                                <CheckCircle size={13} /> {approvedCount} Legitimate
                            </div>
                            {fraudCount > 0 && (
                                <div className="px-4 py-2 bg-red-500/10 border border-red-500/20 rounded-xl text-xs font-bold text-red-400 flex items-center gap-2">
                                    <ShieldAlert size={13} /> {fraudCount} Fraud Detected
                                </div>
                            )}
                        </div>
                    )}
                </header>

                <div className="space-y-6">
                    {loading ? (
                        <div className="p-16 glass-morphism rounded-[2.5rem] border border-white/5 flex items-center justify-center">
                            <div className="w-8 h-8 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                        </div>
                    ) : claims.length > 0 ? (
                        claims.map((claim, idx) => {
                            const cfg = statusConfig[claim.status] || statusConfig.pending;
                            const isFraud = claim.status === 'fraud suspected';

                            return (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, x: -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.07 }}
                                    className={`p-6 md:p-8 glass-morphism rounded-[2.5rem] border flex flex-col md:flex-row items-start md:items-center gap-6 md:gap-8 group transition-all ${
                                        isFraud
                                            ? 'border-red-500/20 bg-red-500/3 hover:border-red-500/40'
                                            : 'border-white/5 hover:border-primary/20'
                                    }`}
                                >
                                    {/* Status icon */}
                                    <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${cfg.bg} ${cfg.text} shadow-xl shadow-black/20`}>
                                        {cfg.icon}
                                    </div>

                                    {/* Main info */}
                                    <div className="flex-1 w-full">
                                        <div className="flex flex-col md:flex-row items-start md:items-center gap-2 mb-1">
                                            <span className="text-xl md:text-2xl font-black tracking-tight">
                                                {claim.triggerType} Disruption
                                            </span>
                                            {claim.disruptionDetails?.simulateFraud && (
                                                <span className="px-2 py-0.5 bg-orange-500/20 text-orange-400 border border-orange-500/30 rounded-full text-[9px] font-black uppercase tracking-widest">
                                                    Demo Simulation
                                                </span>
                                            )}
                                            <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                                {claim.disruptionDetails?.value || 'Active'}
                                            </span>
                                        </div>
                                        <div className="text-slate-500 flex flex-col md:flex-row items-start md:items-center gap-2 md:gap-3 text-sm font-medium">
                                            <span>Triggered {new Date(claim.createdAt).toLocaleString()}</span>
                                            <span className="hidden md:block w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                                            <span className="text-[10px] uppercase tracking-tighter text-slate-600">Ref: {claim._id.slice(-8).toUpperCase()}</span>
                                        </div>

                                        {/* Expandable fraud detail */}
                                        {isFraud && <FraudDetail claim={claim} />}
                                    </div>

                                    {/* Amount + Status */}
                                    <div className="text-center md:text-right space-y-3 shrink-0 w-full md:w-auto">
                                        <div className={`text-2xl md:text-3xl font-black flex items-center justify-center md:justify-end gap-1 ${isFraud ? 'text-slate-600 line-through' : 'text-white'}`}>
                                            <IndianRupee size={24} className="text-slate-500" /> {claim.claimAmount}.00
                                        </div>
                                        {isFraud && (
                                            <div className="text-xs text-red-400/60 font-mono">Payout blocked</div>
                                        )}
                                        <div className={`px-4 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest inline-block border ${cfg.bg} ${cfg.text} ${cfg.border} shadow-lg`}>
                                            {cfg.label}
                                        </div>
                                        {claim.status === 'approved' && (
                                            <button 
                                                onClick={() => handlePayoutFetch(claim._id, claim.claimAmount)}
                                                className="block w-full md:w-auto mt-4 px-8 py-3 bg-blue-600 text-white rounded-xl text-xs font-bold hover:scale-105 active:scale-95 transition-all shadow-xl shadow-blue-600/20"
                                            >
                                                Withdraw Now <ChevronRight size={14} className="inline ml-1" />
                                            </button>
                                        )}
                                    </div>
                                </motion.div>
                            );
                        })
                    ) : (
                        <div className="p-16 md:p-32 glass-morphism rounded-[2.5rem] md:rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center">
                            <AlertCircle size={64} className="text-slate-700 mb-6" />
                            <h2 className="text-2xl font-black mb-2 italic text-slate-500">No Claims Yet</h2>
                            <p className="text-slate-600 max-w-sm text-sm">When disruptions occur, they will appear here automatically. Stay safe on the road!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Claims;
