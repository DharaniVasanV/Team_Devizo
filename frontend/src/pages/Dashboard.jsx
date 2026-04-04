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
    CheckCircle,
    XCircle,
    MapPin,
    Bike,
    IndianRupee,
    Package
} from 'lucide-react';
import Sidebar from '../components/Sidebar';
import AnimatedCharts from '../components/AnimatedCharts';
import { useAuth } from '../context/AuthContext';

const Dashboard = () => {
    const { user } = useAuth();
    const [policy, setPolicy] = useState(null);
    const [claims, setClaims] = useState([]);
    const [stats, setStats] = useState({ protected: 0, claimsTriggered: 0, earningsCovered: 0 });
    const [loading, setLoading] = useState(true);
    const [earningsData, setEarningsData] = useState(null);
    const [earningsLoading, setEarningsLoading] = useState(false);
    const dashboardRef = useRef(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [policyRes, claimsRes, transRes] = await Promise.all([
                    axios.get(`${import.meta.env.VITE_API_URL}/api/policy/user`),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/claims`),
                    axios.get(`${import.meta.env.VITE_API_URL}/api/payout/transactions`)
                ]);

                setPolicy(policyRes.data);
                setClaims(claimsRes.data);
                
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

    // Fetch earnings from Swiggy API if user is verified
    useEffect(() => {
        const fetchEarnings = async () => {
            if (!user?.isSwiggyVerified) return;
            setEarningsLoading(true);
            try {
                const res = await axios.get(`${import.meta.env.VITE_API_URL}/api/worker/earnings`);
                console.log('[Dashboard] Earnings fetched successfully:', res.data);
                setEarningsData(res.data);
            } catch (err) {
                console.error('[Dashboard] Error fetching earnings:', err);
            } finally {
                setEarningsLoading(false);
            }
        };
        fetchEarnings();
    }, [user]);

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

    const isSwiggyVerified = user?.isSwiggyVerified;
    const zoneVerified = user?.zoneVerified;
    const workerZone = user?.workerZone;

    return (
        <div className="flex bg-[#0b1f3a] min-h-screen text-white font-['Inter',_sans-serif]">
            <Sidebar />
            
            <main ref={dashboardRef} className="flex-1 p-6 md:p-10 overflow-x-hidden">
                <header className="flex flex-col md:flex-row justify-between items-start md:items-center mb-12 gap-6">
                    <div>
                        <h1 className="text-3xl md:text-4xl font-bold mb-2">Worker Dashboard</h1>
                        <p className="text-slate-400 text-sm md:text-base">Everything at a glance. Stay protected.</p>
                    </div>
                    <div className="flex gap-3 w-full md:w-auto flex-wrap">
                        {user?.platform === 'Swiggy' && (
                            <div className={`px-5 py-2.5 rounded-2xl flex items-center gap-2 border text-sm font-bold ${
                                isSwiggyVerified 
                                    ? 'bg-green-500/10 border-green-500/20 text-green-400' 
                                    : 'bg-red-500/10 border-red-500/20 text-red-400'
                            }`}>
                                {isSwiggyVerified ? <CheckCircle size={16} /> : <XCircle size={16} />}
                                {isSwiggyVerified ? 'Swiggy Verified' : 'Not Verified'}
                            </div>
                        )}
                        {zoneVerified && (
                            <div className="px-5 py-2.5 rounded-2xl flex items-center gap-2 border bg-blue-500/10 border-blue-500/20 text-blue-400 text-sm font-bold">
                                <MapPin size={16} />
                                {workerZone} Zone
                            </div>
                        )}
                        <div className="glass-morphism px-6 py-3 rounded-2xl flex items-center gap-3 border border-white/5">
                            <span className="w-2.5 h-2.5 bg-green-500 rounded-full animate-pulse"></span>
                            <span className="text-sm font-semibold">Monitoring Active</span>
                        </div>
                    </div>
                </header>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {[
                        { label: 'Total Protected', value: `₹${stats.earningsCovered}`, icon: <Shield className="text-primary" />, color: 'bg-primary/10' },
                        { label: 'Claim Count', value: stats.claimsTriggered, icon: <AlertTriangle className="text-yellow-500" />, color: 'bg-yellow-500/10' },
                        { label: 'Weekly Earnings', value: earningsData ? `₹${earningsData.earnings?.totalEarnings || 0}` : (policy ? `₹${policy.weeklyPremium}` : '₹0'), icon: <TrendingUp className="text-green-500" />, color: 'bg-green-500/10' },
                        { label: 'Total Deliveries', value: earningsData?.earnings?.totalOrders || 0, icon: <Zap className="text-accent" />, color: 'bg-accent/10' }
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
                    {/* Active Policy + Earnings Area */}
                    <div className="lg:col-span-2 space-y-8">
                        
                        {/* Protected Earnings Period Section */}
                        {isSwiggyVerified && (
                            <section>
                                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                                    <IndianRupee className="text-green-400" size={24} /> Protected Earnings Period
                                </h2>
                                {earningsLoading ? (
                                    <div className="p-12 glass-morphism rounded-[2.5rem] border border-white/5 flex items-center justify-center">
                                        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full"></div>
                                    </div>
                                ) : earningsData?.earnings ? (
                                    <motion.div
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="space-y-6"
                                    >
                                        {/* Summary Cards */}
                                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-green-500/10 to-green-600/5 border border-green-500/20">
                                                <div className="text-green-400 text-xs font-bold uppercase tracking-wider mb-2">Total Earned</div>
                                                <div className="text-2xl font-black text-white">₹{earningsData.earnings.totalEarnings}</div>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-blue-500/10 to-blue-600/5 border border-blue-500/20">
                                                <div className="text-blue-400 text-xs font-bold uppercase tracking-wider mb-2">Orders Done</div>
                                                <div className="text-2xl font-black text-white">{earningsData.earnings.totalOrders}</div>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-purple-500/10 to-purple-600/5 border border-purple-500/20">
                                                <div className="text-purple-400 text-xs font-bold uppercase tracking-wider mb-2">Zone</div>
                                                <div className="text-2xl font-black text-white">{earningsData.workerZone || '—'}</div>
                                            </div>
                                            <div className="p-5 rounded-2xl bg-gradient-to-br from-amber-500/10 to-amber-600/5 border border-amber-500/20">
                                                <div className="text-amber-400 text-xs font-bold uppercase tracking-wider mb-2">Avg/Day</div>
                                                <div className="text-2xl font-black text-white">
                                                    ₹{earningsData.earnings.daily.filter(d => d.income > 0).length > 0 
                                                        ? Math.round(earningsData.earnings.totalEarnings / earningsData.earnings.daily.filter(d => d.income > 0).length)
                                                        : 0}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Day-by-Day Breakdown */}
                                        <div className="p-6 glass-morphism rounded-[2rem] border border-white/5">
                                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider mb-4">Day-by-Day Breakdown</h3>
                                            <div className="grid grid-cols-7 gap-3">
                                                {earningsData.earnings.daily.map((day, idx) => (
                                                    <div 
                                                        key={idx} 
                                                        className={`p-3 rounded-xl text-center transition-all ${
                                                            day.income > 0 
                                                                ? 'bg-primary/15 border border-primary/30' 
                                                                : 'bg-white/3 border border-white/5'
                                                        }`}
                                                    >
                                                        <div className="text-[10px] font-bold text-slate-500 uppercase mb-1">{day.name}</div>
                                                        <div className={`text-sm font-black ${day.income > 0 ? 'text-white' : 'text-slate-600'}`}>
                                                            ₹{day.income}
                                                        </div>
                                                        {day.orders > 0 && (
                                                            <div className="text-[9px] text-primary mt-0.5 flex items-center justify-center gap-0.5">
                                                                <Package size={8} /> {day.orders}
                                                            </div>
                                                        )}
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    </motion.div>
                                ) : (
                                    <div className="p-8 glass-morphism rounded-[2.5rem] border border-white/5 text-center text-slate-500">
                                        <p>No earnings data available</p>
                                    </div>
                                )}
                            </section>
                        )}

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
                                            <div className="text-slate-400 text-sm font-bold">Covered Thresholds</div>
                                            <div className="space-y-3">
                                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-sm border border-white/5">
                                                    <span className="flex items-center gap-2 text-blue-400"><CloudRain size={16}/> Heavy Rain</span>
                                                    <span className="font-bold text-slate-300">50mm / hr</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-sm border border-white/5">
                                                    <span className="flex items-center gap-2 text-yellow-500"><ThermometerSun size={16}/> Extreme Heat</span>
                                                    <span className="font-bold text-slate-300">40°C</span>
                                                </div>
                                                <div className="flex justify-between items-center p-3 bg-white/5 rounded-xl text-sm border border-white/5">
                                                    <span className="flex items-center gap-2 text-purple-400"><Wind size={16}/> Severe AQI</span>
                                                    <span className="font-bold text-slate-300">300+</span>
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
                                <TrendingUp className="text-primary" size={24} /> Earnings Trend
                            </h2>
                            <div className="p-8 glass-morphism rounded-[2.5rem] border border-white/5 overflow-hidden">
                                <AnimatedCharts 
                                    earningsData={earningsData?.earnings?.daily} 
                                    chartType="area"
                                />
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
                                                    claim.status === 'approved' ? 'bg-blue-500/20 text-blue-500' : 'bg-yellow-500/20 text-yellow-500'
                                                }`}>
                                                    {claim.status}
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
                        <div className="space-y-4">
                            {/* Swiggy Verification Alert */}
                            {user?.platform === 'Swiggy' && !isSwiggyVerified && (
                                <div className="p-6 bg-orange-500/10 border border-orange-500/20 rounded-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-orange-500"></div>
                                    <div className="flex items-start gap-4">
                                        <AlertTriangle className="text-orange-500 shrink-0" size={24} />
                                        <div>
                                            <div className="font-bold mb-1">Swiggy Verification Pending</div>
                                            <p className="text-sm text-slate-400">Your phone number was not found on the Swiggy platform. Verify your registered phone to access earnings protection.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {zoneVerified === false && isSwiggyVerified && (
                                <div className="p-6 bg-yellow-500/10 border border-yellow-500/20 rounded-2xl relative overflow-hidden">
                                    <div className="absolute top-0 left-0 w-1 h-full bg-yellow-500"></div>
                                    <div className="flex items-start gap-4">
                                        <MapPin className="text-yellow-500 shrink-0" size={24} />
                                        <div>
                                            <div className="font-bold mb-1">Zone Mismatch</div>
                                            <p className="text-sm text-slate-400">Your registered city doesn't match your Swiggy zone ({workerZone}). Update your city to enable zone-based protection.</p>
                                        </div>
                                    </div>
                                </div>
                            )}

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
