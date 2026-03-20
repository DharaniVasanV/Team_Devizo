import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import axios from 'axios';
import { 
    Wallet, 
    ArrowUpRight, 
    ArrowDownLeft, 
    Clock, 
    CheckCircle2, 
    XCircle, 
    Download,
    CreditCard
} from 'lucide-react';
import Sidebar from '../components/Sidebar';

const Payouts = () => {
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchTransactions = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/payout/transactions`);
                setTransactions(res.data);
            } catch (err) {
                console.error(err);
            } finally {
                setLoading(false);
            }
        };
        fetchTransactions();
    }, []);

    return (
        <div className="flex bg-[#0f172a] min-h-screen text-white font-sans">
            <Sidebar />
            
            <main className="flex-1 p-10 overflow-auto">
                <header className="mb-12 flex justify-between items-end">
                    <div>
                        <h1 className="text-5xl font-black mb-3 tracking-tighter">My Payouts</h1>
                        <p className="text-slate-400 text-lg font-medium">Manage your processed earnings and transactions.</p>
                    </div>
                </header>

                <div className="grid lg:grid-cols-3 gap-8 mb-12">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="p-8 rounded-[2.5rem] bg-gradient-to-br from-primary to-indigo-600 border border-white/10 relative overflow-hidden"
                    >
                        <div className="relative z-10">
                            <div className="text-white/60 text-xs font-black uppercase tracking-widest mb-2">Total Paid Out</div>
                            <div className="text-5xl font-black mb-8">₹{transactions.filter(t => t.type === 'claim_payout').reduce((sum, t) => sum + t.amount, 0)}.00</div>
                            <div className="flex items-center gap-2 text-white/80 text-sm font-bold bg-white/10 w-fit px-4 py-2 rounded-xl backdrop-blur-md border border-white/10">
                                <CheckCircle2 size={16} /> Verified History
                            </div>
                        </div>
                        <CreditCard className="absolute -bottom-6 -right-6 w-48 h-48 text-white/5 -rotate-12" />
                    </motion.div>

                    <div className="lg:col-span-2 glass-morphism p-8 rounded-[2.5rem] border border-white/5 flex flex-col justify-center">
                        <div className="flex justify-between items-center mb-6">
                            <div className="text-slate-500 font-black uppercase tracking-widest text-xs">Wallet Status</div>
                            <div className="text-green-400 text-xs font-black uppercase tracking-widest bg-green-400/10 px-3 py-1 rounded-full">Primary Withdrawal Active</div>
                        </div>
                        <div className="grid md:grid-cols-2 gap-8">
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                <div className="text-sm text-slate-400 mb-2">Available Balance</div>
                                <div className="text-3xl font-black">₹0.00</div>
                            </div>
                            <div className="p-6 bg-white/5 rounded-3xl border border-white/5">
                                <div className="text-sm text-slate-400 mb-2">Next Scheduled Payout</div>
                                <div className="text-3xl font-black">Instant</div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="glass-morphism rounded-[2.8rem] border border-white/5 overflow-hidden">
                    <div className="p-8 border-b border-white/5 flex justify-between items-center">
                        <h2 className="text-2xl font-black">Transaction Log</h2>
                        <button className="flex items-center gap-2 text-xs font-black uppercase tracking-widest text-slate-400 hover:text-white transition-all bg-white/5 px-4 py-2 rounded-xl border border-white/5">
                            <Download size={14} /> Export CSV
                        </button>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead className="bg-[#1e293b]/50 border-b border-white/5">
                                <tr>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Transaction</th>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Amount</th>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Date & Reference</th>
                                    <th className="px-8 py-6 text-xs font-black uppercase tracking-widest text-slate-500">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {transactions.length > 0 ? (
                                    transactions.map((txn, idx) => (
                                        <motion.tr 
                                            key={idx}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="hover:bg-white/[0.02] transition-colors"
                                        >
                                            <td className="px-8 py-6">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
                                                        txn.type === 'claim_payout' ? 'bg-green-500/10 text-green-400' : 'bg-red-500/10 text-red-400'
                                                    }`}>
                                                        {txn.type === 'claim_payout' ? <ArrowDownLeft size={20} /> : <ArrowUpRight size={20} />}
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-lg">{txn.type === 'claim_payout' ? 'Claim Withdrawal' : 'Premium Payment'}</div>
                                                        <div className="text-xs text-slate-500 uppercase tracking-widest font-black">{txn.transactionReference}</div>
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`text-xl font-black ${txn.type === 'claim_payout' ? 'text-green-400' : 'text-slate-300'}`}>
                                                    {txn.type === 'claim_payout' ? '+' : '-'}₹{txn.amount}.00
                                                </div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className="text-slate-300 font-bold">{new Date(txn.createdAt).toLocaleDateString()}</div>
                                                <div className="text-xs text-slate-500">{new Date(txn.createdAt).toLocaleTimeString()}</div>
                                            </td>
                                            <td className="px-8 py-6">
                                                <div className={`flex items-center gap-2 w-fit px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
                                                    txn.paymentStatus === 'completed' ? 'bg-green-500/10 text-green-500 border border-green-500/20' : 
                                                    txn.paymentStatus === 'pending' ? 'bg-yellow-500/10 text-yellow-500 border border-yellow-500/20' : 
                                                    'bg-red-500/10 text-red-500 border border-red-500/20'
                                                }`}>
                                                    {txn.paymentStatus === 'completed' ? <CheckCircle2 size={12}/> : 
                                                     txn.paymentStatus === 'pending' ? <Clock size={12}/> : <XCircle size={12}/>}
                                                    {txn.paymentStatus}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="4" className="px-8 py-20 text-center text-slate-500 italic">No transaction history found.</td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default Payouts;
