import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { motion } from 'framer-motion';
import {
    Activity,
    AlertTriangle,
    CloudRain,
    IndianRupee,
    Shield,
    Siren,
    TrendingUp,
    Users
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import { useAuth } from '../context/AuthContext';

const formatCurrency = (value) => `Rs ${Number(value || 0).toLocaleString('en-IN')}`;

const AdminDashboard = () => {
    const { user } = useAuth();
    const [dashboard, setDashboard] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchDashboard = async () => {
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/admin/dashboard`);
                setDashboard(res.data);
            } catch (error) {
                console.error('Error loading admin dashboard:', error);
            } finally {
                setLoading(false);
            }
        };

        fetchDashboard();
    }, []);

    if (loading) {
        return (
            <div className="min-h-screen bg-[#09111f] flex items-center justify-center text-white font-['Inter',_sans-serif]">
                Loading admin dashboard...
            </div>
        );
    }

    const overview = dashboard?.overview || {};
    const prediction = dashboard?.prediction || {};
    const charts = dashboard?.charts || {};
    const portfolioHealth = dashboard?.portfolioHealth || {};

    return (
        <div className="flex min-h-screen bg-[#09111f] text-white font-['Inter',_sans-serif]">
            <Sidebar />

            <main className="flex-1 p-6 md:p-10 overflow-x-hidden">
                <header className="mb-10 flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div>
                        <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/20 bg-cyan-400/10 px-4 py-1 text-[11px] font-black uppercase tracking-[0.25em] text-cyan-300">
                            <Shield size={14} /> Insurer Console
                        </div>
                        <h1 className="mt-4 text-3xl font-black tracking-tight md:text-5xl">Intelligent Dashboard</h1>
                        <p className="mt-3 max-w-2xl text-sm text-slate-400 md:text-base">
                            Loss ratios, portfolio health, and predictive analytics for next week's likely disruption claims.
                        </p>
                    </div>
                    <div className="rounded-[1.75rem] border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-md">
                        <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Signed in as</div>
                        <div className="mt-1 text-lg font-bold">{user?.name}</div>
                        <div className="text-sm text-slate-400">Admin | {user?.city}</div>
                    </div>
                </header>

                <section className="mb-10 grid grid-cols-1 gap-6 md:grid-cols-2 xl:grid-cols-4">
                    {[
                        { label: 'Protected Workers', value: overview.totalWorkers, icon: <Users className="text-cyan-300" />, tone: 'from-cyan-500/20 to-cyan-400/5' },
                        { label: 'Active Policies', value: overview.activePolicies, icon: <Shield className="text-emerald-300" />, tone: 'from-emerald-500/20 to-emerald-400/5' },
                        { label: 'Loss Ratio', value: `${overview.lossRatio || 0}%`, icon: <TrendingUp className="text-amber-300" />, tone: 'from-amber-500/20 to-amber-400/5' },
                        { label: 'Suspicious Claims', value: overview.suspiciousClaims, icon: <Siren className="text-rose-300" />, tone: 'from-rose-500/20 to-rose-400/5' }
                    ].map((card) => (
                        <motion.div
                            key={card.label}
                            initial={{ opacity: 0, y: 24 }}
                            animate={{ opacity: 1, y: 0 }}
                            className={`rounded-[2rem] border border-white/10 bg-gradient-to-br ${card.tone} p-6 shadow-[0_24px_80px_-30px_rgba(0,0,0,0.8)]`}
                        >
                            <div className="mb-5 flex h-14 w-14 items-center justify-center rounded-2xl border border-white/10 bg-black/20">
                                {card.icon}
                            </div>
                            <div className="text-xs font-black uppercase tracking-[0.25em] text-slate-500">{card.label}</div>
                            <div className="mt-3 text-4xl font-black">{card.value || 0}</div>
                        </motion.div>
                    ))}
                </section>

                <section className="mb-10 grid gap-8 xl:grid-cols-[1.45fr_1fr]">
                    <div className="rounded-[2.25rem] border border-white/10 bg-[#101a2d] p-7">
                        <div className="flex items-center gap-3">
                            <CloudRain className="text-cyan-300" size={22} />
                            <h2 className="text-2xl font-black">Next Week Outlook</h2>
                        </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-cyan-400/15 bg-cyan-400/10 p-5">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-cyan-200">Likely Trigger</div>
                                <div className="mt-3 text-2xl font-black">{prediction.likelyTrigger || 'Heavy Rain'}</div>
                            </div>
                            <div className="rounded-2xl border border-amber-400/15 bg-amber-400/10 p-5">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-amber-200">Expected Claims</div>
                                <div className="mt-3 text-2xl font-black">{prediction.expectedClaims || 0}</div>
                            </div>
                            <div className="rounded-2xl border border-emerald-400/15 bg-emerald-400/10 p-5">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200">Expected Payout</div>
                                <div className="mt-3 text-2xl font-black">{formatCurrency(prediction.expectedPayout)}</div>
                            </div>
                        </div>
                        <div className="mt-6 grid gap-4 md:grid-cols-3">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Risk Score</div>
                                <div className="mt-2 text-3xl font-black">{prediction.riskScore || 0}</div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Risk Level</div>
                                <div className="mt-2 text-3xl font-black capitalize">{prediction.riskLevel || 'medium'}</div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Suggested Premium</div>
                                <div className="mt-2 text-3xl font-black">{formatCurrency(prediction.recommendedPremium)}</div>
                            </div>
                        </div>
                    </div>

                    <div className="rounded-[2.25rem] border border-white/10 bg-[#101a2d] p-7">
                        <div className="flex items-center gap-3">
                            <Activity className="text-fuchsia-300" size={22} />
                            <h2 className="text-2xl font-black">Portfolio Health</h2>
                        </div>
                        <div className="mt-6 space-y-4">
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Total Premiums Collected</div>
                                <div className="mt-2 text-3xl font-black">{formatCurrency(overview.totalPremiums)}</div>
                            </div>
                            <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Total Payouts</div>
                                <div className="mt-2 text-3xl font-black">{formatCurrency(overview.totalPayouts)}</div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                    <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Approval Rate</div>
                                    <div className="mt-2 text-2xl font-black">{portfolioHealth.claimApprovalRate || 0}%</div>
                                </div>
                                <div className="rounded-2xl border border-white/10 bg-white/5 p-5">
                                    <div className="text-xs font-black uppercase tracking-[0.2em] text-slate-500">Payout Rate</div>
                                    <div className="mt-2 text-2xl font-black">{portfolioHealth.payoutCoverageRate || 0}%</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="grid gap-8 xl:grid-cols-[1.1fr_0.9fr]">
                    <div className="rounded-[2.25rem] border border-white/10 bg-[#101a2d] p-7">
                        <div className="mb-6 flex items-center gap-3">
                            <IndianRupee className="text-emerald-300" size={22} />
                            <h2 className="text-2xl font-black">Claims Trend</h2>
                        </div>
                        <div className="grid gap-3">
                            {(charts.claimsTrend || []).map((day) => (
                                <div key={day.date} className="grid grid-cols-[90px_1fr_auto] items-center gap-4 rounded-2xl border border-white/8 bg-white/5 px-4 py-3">
                                    <div className="text-sm font-bold text-slate-300">{day.date}</div>
                                    <div className="h-3 overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-cyan-400 to-blue-500"
                                            style={{ width: `${Math.min(100, (day.claims || 0) * 18)}%` }}
                                        />
                                    </div>
                                    <div className="text-sm font-black text-white">{day.claims} claims</div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="rounded-[2.25rem] border border-white/10 bg-[#101a2d] p-7">
                        <div className="mb-6 flex items-center gap-3">
                            <AlertTriangle className="text-amber-300" size={22} />
                            <h2 className="text-2xl font-black">Trigger Mix</h2>
                        </div>
                        <div className="space-y-4">
                            {(charts.claimsByTrigger || []).map((item) => (
                                <div key={item.trigger} className="rounded-2xl border border-white/10 bg-white/5 p-4">
                                    <div className="mb-2 flex items-center justify-between gap-4">
                                        <span className="font-bold text-white">{item.trigger}</span>
                                        <span className="text-sm font-black text-amber-300">{item.count}</span>
                                    </div>
                                    <div className="h-2 overflow-hidden rounded-full bg-white/10">
                                        <div
                                            className="h-full rounded-full bg-gradient-to-r from-amber-400 to-orange-500"
                                            style={{ width: `${Math.min(100, item.count * 20)}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </section>

                <section className="mt-8 rounded-[2.25rem] border border-white/10 bg-[#101a2d] p-7">
                    <div className="mb-6 flex items-center gap-3">
                        <TrendingUp className="text-cyan-300" size={22} />
                        <h2 className="text-2xl font-black">Recent Claims</h2>
                    </div>
                    <div className="space-y-4">
                        {(dashboard?.recentClaims || []).map((claim) => (
                            <div key={claim.id} className="grid gap-3 rounded-2xl border border-white/8 bg-white/5 p-5 md:grid-cols-[1.2fr_0.8fr_0.8fr_0.7fr] md:items-center">
                                <div>
                                    <div className="font-bold text-white">{claim.workerName}</div>
                                    <div className="text-sm text-slate-400">{claim.platform} | {claim.city}</div>
                                </div>
                                <div className="text-sm font-semibold text-slate-300">{claim.triggerType}</div>
                                <div className="text-sm font-black text-emerald-300">{formatCurrency(claim.claimAmount)}</div>
                                <div className="flex items-center justify-between gap-4 md:block">
                                    <div className="text-xs uppercase tracking-[0.2em] text-slate-500">{new Date(claim.createdAt).toLocaleDateString()}</div>
                                    <div className="mt-1 text-sm font-bold capitalize text-white">{claim.status}</div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>
            </main>
        </div>
    );
};

export default AdminDashboard;
