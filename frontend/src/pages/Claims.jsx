import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
    BellRing, 
    CheckCircle, 
    Clock, 
    AlertCircle, 
    IndianRupee, 
    ChevronRight,
    Zap
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Claims = () => {
    const [claims, setClaims] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchClaims = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/claims`);
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
            await axios.post(`${import.meta.env.VITE_API_URL}/api/payout`, { claimId, amount });
            // Refresh claims
            const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/claims`);
            setClaims(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    return (
        <div className="flex bg-[#0f172a] min-h-screen text-white">
            <Sidebar />
            
            <main className="flex-1 p-10 overflow-auto">
                <header className="mb-12 flex justify-between items-center">
                    <div>
                        <h1 className="text-4xl font-black mb-2 flex items-center gap-3">
                            <BellRing className="text-primary" size={40} /> Claim History
                        </h1>
                        <p className="text-slate-400 text-lg">Every claim triggered by environmental disruptions.</p>
                    </div>
                </header>

                <div className="space-y-6">
                    {claims.length > 0 ? (
                        claims.map((claim, idx) => (
                            <motion.div 
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1 }}
                                className="p-8 glass-morphism rounded-[2.5rem] border border-white/5 flex flex-col md:flex-row items-center gap-8 group hover:border-primary/20 transition-all"
                            >
                                <div className={`w-16 h-16 rounded-full flex items-center justify-center shrink-0 ${
                                    claim.status === 'paid' ? 'bg-green-500/10 text-green-500' : 
                                    claim.status === 'approved' ? 'bg-blue-500/10 text-blue-500' : 'bg-yellow-500/10 text-yellow-500'
                                }`}>
                                    {claim.status === 'paid' ? <CheckCircle size={32} /> : 
                                     claim.status === 'approved' ? <Zap size={32} /> : <Clock size={32} />}
                                </div>

                                <div className="flex-1 space-y-1">
                                    <div className="flex items-center gap-2">
                                        <span className="text-2xl font-black">{claim.triggerType} Disruption</span>
                                        <span className="px-3 py-1 bg-white/5 border border-white/10 rounded-full text-[10px] font-black uppercase text-slate-400 tracking-widest">
                                            {claim.disruptionDetails?.value || 'Active'}
                                        </span>
                                    </div>
                                    <div className="text-slate-500 flex items-center gap-3 text-sm">
                                        <span>Triggered {new Date(claim.createdAt).toLocaleString()}</span>
                                        <span className="w-1.5 h-1.5 bg-slate-700 rounded-full"></span>
                                        <span>Reference: {claim._id.slice(-8).toUpperCase()}</span>
                                    </div>
                                </div>

                                <div className="text-center md:text-right space-y-3 shrink-0">
                                    <div className="text-3xl font-black text-white flex items-center justify-center md:justify-end gap-1">
                                        <IndianRupee size={24} className="text-slate-500" /> {claim.claimAmount}.00
                                    </div>
                                    <div className={`px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest inline-block ${
                                        claim.status === 'paid' ? 'bg-green-500/20 text-green-500 border border-green-500/30' : 
                                        claim.status === 'approved' ? 'bg-blue-500/20 text-blue-500 border border-blue-500/30' : 
                                        'bg-yellow-500/20 text-yellow-500 border border-yellow-500/30'
                                    }`}>
                                        Status: {claim.status}
                                    </div>
                                    {claim.status === 'approved' && (
                                        <button 
                                            onClick={() => handlePayoutFetch(claim._id, claim.claimAmount)}
                                            className="block w-full md:w-auto mt-4 px-6 py-2 bg-primary rounded-xl text-xs font-bold hover:scale-105 transition-all"
                                        >
                                            Withdraw Now <ChevronRight size={14} className="inline ml-1" />
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    ) : (
                        <div className="p-32 glass-morphism rounded-[3rem] border border-white/5 flex flex-col items-center justify-center text-center">
                            <AlertCircle size={64} className="text-slate-700 mb-6" />
                            <h2 className="text-2xl font-black mb-2 italic text-slate-500">No Claims Yet</h2>
                            <p className="text-slate-600 max-w-sm">When disruptions occur, they will appear here automatically. Stay safe on the road!</p>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
};

export default Claims;
