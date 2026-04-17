import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Shield, CloudRain, Briefcase, Zap, CheckCircle, ArrowRight } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const mainRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".hero-content > *", {
                duration: 1.2,
                y: 40,
                opacity: 0,
                ease: "power3.out",
                stagger: 0.1
            });

            gsap.from(".premium-card", {
                duration: 1.5,
                y: 60,
                opacity: 0,
                delay: 0.4,
                ease: "power4.out"
            });

            gsap.from(".feature-card", {
                scrollTrigger: {
                    trigger: ".content-section",
                    start: "top 80%",
                },
                duration: 0.8,
                y: 30,
                opacity: 0,
                stagger: 0.15,
                ease: "back.out(1.7)"
            });
        }, mainRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={mainRef} className="min-h-screen bg-white font-['Inter',_sans-serif]">
            {/* 1. MAIN BACKGROUND (TOP SECTION) */}
            <div className="bg-gradient-to-b from-[#0b1f3a] via-[#0d2a4a] to-[#071426] text-white overflow-hidden pb-32">
                {/* Navbar */}
                <nav className="w-full relative z-50">
                    <div className="max-w-7xl mx-auto px-6 h-24 flex items-center justify-between">
                        <div className="flex items-center gap-2">
                            <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                                <Shield className="w-6 h-6 text-white" />
                            </div>
                            <span className="text-2xl font-bold tracking-tight">PayProtect</span>
                        </div>
                        <div className="flex items-center gap-6">
                            <Link to="/login" className="text-sm font-semibold text-slate-300 hover:text-white transition-colors">Log In</Link>
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded-lg text-sm font-bold shadow-lg shadow-blue-600/20 transition-all transform hover:scale-105 active:scale-95">Open Account</Link>
                        </div>
                    </div>
                </nav>

                {/* 2. HERO SECTION STYLE (CENTERED) */}
                <section className="pt-24 pb-12 px-6 text-center max-w-4xl mx-auto relative hero-content">
                    <motion.div 
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-400 text-xs font-black uppercase tracking-widest mb-8 backdrop-blur-md"
                    >
                        <Zap size={14} /> Next-Gen Income Protection
                    </motion.div>
                    
                    <h1 className="text-5xl md:text-7xl font-bold leading-[1.05] tracking-tight mb-8">
                        The Operating System for <span className="bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-indigo-300">Gig Protection</span>
                    </h1>
                    
                    <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto leading-relaxed">
                        Secure your daily earnings with parametric insurance. Instant payouts triggered by AI analysis of weather and city data.
                    </p>

                    <div className="flex flex-col sm:flex-row items-center justify-center gap-4 mb-20">
                        <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-10 py-4 rounded-xl text-lg font-bold shadow-xl shadow-blue-600/30 transition-all flex items-center gap-2">
                            Secure Your Gig <ArrowRight size={20} />
                        </Link>
                        <a href="#features" className="border border-white/10 hover:border-white/20 bg-white/5 text-white px-10 py-4 rounded-xl text-lg font-bold backdrop-blur-md transition-all">
                            Explore Plans
                        </a>
                    </div>

                    {/* 4. GLASS/GRADIENT CARD (CENTER ELEMENT) */}
                    <div className="relative premium-card group">
                        <div className="absolute -inset-10 bg-blue-500/20 blur-[100px] rounded-full opacity-50 group-hover:opacity-75 transition-opacity"></div>
                        <div className="relative bg-gradient-to-br from-blue-400/20 to-blue-700/30 backdrop-blur-3xl rounded-[2rem] md:rounded-[2.5rem] border border-white/20 p-6 md:p-10 shadow-[0_32px_64px_-16px_rgba(0,0,0,0.5)] overflow-hidden">
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                                <div className="text-left space-y-2">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                                        <CloudRain className="text-blue-400" />
                                    </div>
                                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Active Monitoring</div>
                                    <div className="text-xl md:text-2xl font-black italic">Precipitation</div>
                                    <div className="text-2xl md:text-3xl font-bold text-blue-400">55mm / hr</div>
                                </div>
                                <div className="text-left space-y-2 md:border-l border-white/10 md:pl-8">
                                    <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center mb-4 border border-white/10">
                                        <Zap className="text-yellow-400" />
                                    </div>
                                    <div className="text-slate-400 text-[10px] font-bold uppercase tracking-widest">Payout Engine</div>
                                    <div className="text-xl md:text-2xl font-black italic">Claim Status</div>
                                    <div className="text-emerald-400 font-bold flex items-center gap-2">
                                        Approved <CheckCircle size={20} />
                                    </div>
                                </div>
                                <div className="bg-white/10 rounded-3xl p-6 border border-white/20 text-left">
                                    <div className="text-slate-300 text-[10px] font-bold mb-4 flex justify-between items-center">
                                        <span>ESTIMATED PAYOUT</span>
                                        <span className="text-[10px] bg-blue-500 px-2 py-0.5 rounded-full">LIVE</span>
                                    </div>
                                    <div className="text-3xl md:text-4xl font-black mb-1">₹750</div>
                                    <div className="text-[10px] text-slate-500">Transferred to account • Just now</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>
            </div>

            {/* 3. WHITE CONTENT SECTION (CARD AREA) */}
            <section id="features" className="content-section relative -mt-20 z-10 bg-white text-black rounded-t-[2.5rem] md:rounded-t-[3.5rem] shadow-[0_-40px_100px_-20px_rgba(0,0,0,0.1)] px-6 pt-24 pb-32">
                <div className="max-w-7xl mx-auto">
                    <div className="text-center mb-24 max-w-3xl mx-auto px-4">
                        <span className="text-blue-600 font-black text-[10px] uppercase tracking-[0.2em] mb-4 block">Engineered for Reliability</span>
                        <h2 className="text-3xl md:text-6xl font-bold tracking-tight mb-6">Designed for the world's ambitious gig workers.</h2>
                        <p className="text-lg md:text-xl text-slate-500 leading-relaxed">PayProtect handles the complexity of environmental risk so you can focus on your business.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 md:gap-12">
                        {[
                            {
                                icon: <CloudRain className="w-12 h-12 text-blue-600" />,
                                title: "Oracle Verification",
                                desc: "No manual claims. We use verified network nodes to confirm environmental disruptions in real-time."
                            },
                            {
                                icon: <Briefcase className="w-12 h-12 text-blue-600" />,
                                title: "Smart Payouts",
                                desc: "Proprietary risk modeling ensures you get compensated proportional to the disruption level."
                            },
                            {
                                icon: <Zap className="w-12 h-12 text-blue-600" />,
                                title: "Instant Settlements",
                                desc: "Once a threshold is breached, funds are dispatched to your wallet within milliseconds."
                            }
                        ].map((feature, idx) => (
                            <div key={idx} className="feature-card group p-8 md:p-10 rounded-[2rem] md:rounded-[2.5rem] bg-slate-50 border border-slate-100 transition-all hover:bg-white hover:shadow-2xl hover:shadow-blue-500/10">
                                <div className="mb-8 w-16 h-16 bg-white rounded-2xl flex items-center justify-center shadow-lg border border-slate-100 group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <h3 className="text-2xl font-bold mb-4 tracking-tight">{feature.title}</h3>
                                <p className="text-slate-500 leading-relaxed font-medium text-sm md:text-base">{feature.desc}</p>
                            </div>
                        ))}
                    </div>

                    {/* Secondary Section in White Area */}
                    <div className="mt-20 md:mt-32 p-10 md:p-16 rounded-[2.5rem] md:rounded-[3.5rem] bg-[#071426] text-white relative overflow-hidden flex flex-col lg:flex-row items-center justify-between gap-12 text-center md:text-left">
                        <div className="absolute top-0 right-0 w-1/2 h-full bg-blue-600/10 blur-[120px] rounded-full"></div>
                        <div className="relative z-10 max-w-2xl px-4 md:px-0">
                            <h2 className="text-3xl md:text-5xl font-bold mb-6 tracking-tight">Ready to join the future of insurance?</h2>
                            <p className="text-base md:text-lg text-slate-400 mb-0">Join 45,000+ gig workers across 20 cities using PayProtect to secure their livelihood.</p>
                        </div>
                        <div className="relative z-10 flex w-full md:w-auto shrink-0">
                            <Link to="/register" className="bg-blue-600 hover:bg-blue-700 text-white px-8 md:px-10 py-4 rounded-xl text-lg font-bold shadow-xl shadow-blue-600/20 transition-all w-full md:w-auto text-center">
                                Open Account
                            </Link>
                        </div>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="bg-white py-20 px-6 border-t border-slate-100">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-8">
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                            <Shield className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-xl font-bold text-slate-900">PayProtect</span>
                    </div>
                    <div className="flex gap-10 text-sm font-semibold text-slate-500">
                        <a href="#" className="hover:text-blue-600">Privacy Policy</a>
                        <a href="#" className="hover:text-blue-600">Terms of Use</a>
                        <a href="#" className="hover:text-blue-600">Developer API</a>
                    </div>
                    <div className="text-slate-400 text-xs font-medium uppercase tracking-widest">
                        © 2026 PayProtect Lab • Built for the Gig Economy
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;

