import React, { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Link } from 'react-router-dom';
import { Shield, CloudRain, Briefcase, Zap, CheckCircle } from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

const LandingPage = () => {
    const heroRef = useRef(null);
    const featuresRef = useRef(null);

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from(".hero-title", {
                duration: 1.5,
                y: 100,
                opacity: 0,
                ease: "power4.out",
                stagger: 0.2
            });

            gsap.from(".hero-image", {
                duration: 1.5,
                scale: 0.8,
                opacity: 0,
                delay: 0.5,
                ease: "power4.out"
            });

            gsap.from(".feature-card", {
                scrollTrigger: {
                    trigger: ".feature-section",
                    start: "top 80%",
                },
                duration: 1,
                y: 50,
                opacity: 0,
                stagger: 0.2,
                ease: "power3.out"
            });
        }, heroRef);

        return () => ctx.revert();
    }, []);

    return (
        <div ref={heroRef} className="min-h-screen bg-[#0f172a] text-white">
            {/* Navbar */}
            <nav className="fixed top-0 w-full z-50 glass-morphism border-b border-white/10">
                <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Shield className="w-8 h-8 text-primary" />
                        <span className="text-2xl font-bold tracking-tight">GigGuard</span>
                    </div>
                    <div className="flex items-center gap-8">
                        <Link to="/login" className="text-sm font-medium hover:text-primary transition-colors">Login</Link>
                        <Link to="/register" className="px-6 py-2 bg-primary rounded-full text-sm font-semibold hover:bg-primary/90 transition-all transform hover:scale-105 active:scale-95">Get Started</Link>
                    </div>
                </div>
            </nav>

            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 max-w-7xl mx-auto">
                <div className="grid lg:grid-cols-2 gap-12 items-center">
                    <div>
                        <motion.span 
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="inline-block px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary text-sm font-medium mb-6"
                        >
                            Intelligent Parametric Insurance
                        </motion.span>
                        <h1 className="hero-title text-6xl md:text-7xl font-bold leading-[1.1] mb-8">
                            Protect Your Income From <span className="gradient-text">Weather & Chaos</span>
                        </h1>
                        <p className="hero-title text-xl text-slate-400 mb-10 max-w-lg">
                            The first weekly insurance designed for delivery workers. Get paid automatically when disruptions stop you from working.
                        </p>
                        <div className="hero-title flex flex-wrap gap-4">
                            <Link to="/register" className="px-8 py-4 bg-primary rounded-xl font-bold text-lg hover:bg-primary/90 transition-all">Start Your Protection</Link>
                            <a href="#features" className="px-8 py-4 bg-white/5 rounded-xl font-bold text-lg hover:bg-white/10 transition-all border border-white/10">How it Works</a>
                        </div>
                    </div>
                    <div className="hero-image relative">
                        <div className="absolute -inset-4 bg-primary/20 blur-3xl rounded-full"></div>
                        <div className="relative glass-morphism p-8 rounded-3xl border border-white/10">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 bg-slate-800/50 rounded-2xl border border-white/5">
                                    <CloudRain className="w-8 h-8 text-blue-400 mb-4" />
                                    <div className="text-sm text-slate-400 mb-1">Heavy Rain</div>
                                    <div className="text-2xl font-bold">50mm/hr</div>
                                </div>
                                <div className="p-6 bg-slate-800/50 rounded-2xl border border-white/5">
                                    <Zap className="w-8 h-8 text-yellow-500 mb-4" />
                                    <div className="text-sm text-slate-400 mb-1">Status</div>
                                    <div className="text-green-500 font-bold flex items-center gap-1">
                                        Active <CheckCircle className="w-4 h-4" />
                                    </div>
                                </div>
                                <div className="col-span-2 p-6 bg-primary/10 rounded-2xl border border-primary/30">
                                    <div className="flex justify-between items-center mb-4">
                                        <div className="text-sm font-bold text-primary">CLAIM TRIGGERED</div>
                                        <div className="text-xs text-slate-500">2 mins ago</div>
                                    </div>
                                    <div className="text-3xl font-bold mb-2">₹500.00</div>
                                    <div className="text-sm text-slate-400">Automated payout initiated</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section id="features" className="feature-section py-20 px-6 max-w-7xl mx-auto">
                <div className="text-center mb-20">
                    <h2 className="text-4xl md:text-5xl font-bold mb-6">Built For The Modern Worker</h2>
                    <p className="text-xl text-slate-400">No paperwork. No inspections. Just instant protection.</p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                        {
                            icon: <CloudRain className="w-10 h-10 text-primary" />,
                            title: "Automatic Triggers",
                            desc: "We monitor weather & traffic data. When disruptions cross thresholds, your claim starts instantly."
                        },
                        {
                            icon: <Briefcase className="w-10 h-10 text-secondary" />,
                            title: "Income Protection",
                            desc: "Specifically designed to cover the earnings you lose during heavy rain, heatwaves, or pollution."
                        },
                        {
                            icon: <Zap className="w-10 h-10 text-accent" />,
                            title: "Weekly Plans",
                            desc: "Affordable weekly subscriptions. Only pay for what you need, when you need it."
                        }
                    ].map((feature, idx) => (
                        <div key={idx} className="feature-card glass-morphism p-10 rounded-3xl border border-white/10 hover:border-primary/30 transition-all hover:translate-y-[-8px]">
                            <div className="mb-6">{feature.icon}</div>
                            <h3 className="text-2xl font-bold mb-4">{feature.title}</h3>
                            <p className="text-slate-400 leading-relaxed">{feature.desc}</p>
                        </div>
                    ))}
                </div>
            </section>

            {/* CTA Section */}
            <section className="py-20 px-6 max-w-7xl mx-auto text-center">
                <div className="bg-gradient-to-r from-primary to-secondary p-1 rounded-[3rem]">
                    <div className="bg-[#0f172a] p-16 rounded-[2.8rem]">
                        <h2 className="text-4xl md:text-6xl font-bold mb-8">Ready To Secure Your Earnings?</h2>
                        <p className="text-xl text-slate-400 mb-12 max-w-2xl mx-auto">
                            Join thousands of delivery partners from Zomato, Swiggy, and Amazon who trust GigGuard for their peace of mind.
                        </p>
                        <Link to="/register" className="px-10 py-5 bg-primary rounded-2xl font-bold text-xl hover:bg-primary/90 transition-all">Get Protected Now</Link>
                    </div>
                </div>
            </section>

            {/* Footer */}
            <footer className="py-12 border-t border-white/5 opacity-50 px-6 text-center text-sm">
                © 2026 GigGuard Parametric Insurance. Designed for the Gig Economy.
            </footer>
        </div>
    );
};

export default LandingPage;
