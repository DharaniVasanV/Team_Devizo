import React, { useState } from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import {
    Activity,
    BellRing,
    LayoutDashboard,
    LogOut,
    Menu,
    Shield,
    ShieldPlus,
    Wallet,
    X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';

const Sidebar = () => {
    const { logout, user } = useAuth();
    const [isOpen, setIsOpen] = useState(false);
    const navigate = useNavigate();
    const isAdmin = user?.role === 'admin';

    const menuItems = isAdmin
        ? [{ icon: <Activity size={22} />, label: 'Admin Dashboard', path: '/admin/dashboard' }]
        : [
            { icon: <LayoutDashboard size={22} />, label: 'Dashboard', path: '/dashboard' },
            { icon: <ShieldPlus size={22} />, label: 'Buy Policy', path: '/buy-policy' },
            { icon: <BellRing size={22} />, label: 'My Claims', path: '/claims' },
            { icon: <Wallet size={22} />, label: 'Payouts', path: '/payouts' }
        ];

    const toggleSidebar = () => setIsOpen(!isOpen);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    const renderSidebarContent = () => (
        <React.Fragment>
            <div className="flex items-center gap-3 mb-16 px-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white italic">PayProtect</span>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
                        onClick={() => setIsOpen(false)}
                        className={({ isActive }) => `
                            flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-300
                            ${isActive
                                ? 'bg-primary/15 text-primary border border-primary/20 shadow-[0_0_20px_rgba(99,102,241,0.1)]'
                                : 'text-slate-400 hover:text-white hover:bg-white/5'
                            }
                        `}
                    >
                        {item.icon}
                        <span className="font-semibold">{item.label}</span>
                    </NavLink>
                ))}
            </nav>

            <div className="mt-auto space-y-6">
                <div className="p-4 bg-white/5 border border-white/5 rounded-2xl">
                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">
                        {isAdmin ? 'Insurer Profile' : 'Worker Profile'}
                    </div>
                    <div className="font-bold text-white mb-0.5">{user?.name}</div>
                    <div className="text-xs text-slate-400">
                        {isAdmin ? `Admin | ${user?.city}` : `${user?.platform} | ${user?.city}`}
                    </div>
                </div>

                <button
                    onClick={handleLogout}
                    className="flex items-center gap-4 px-4 py-4 w-full rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300"
                >
                    <LogOut size={22} />
                    <span className="font-semibold">Logout</span>
                </button>
            </div>
        </React.Fragment>
    );

    return (
        <>
            <button
                onClick={toggleSidebar}
                className="lg:hidden fixed top-6 right-6 z-[60] bg-blue-600 p-3 rounded-xl shadow-xl shadow-blue-600/20 text-white"
            >
                {isOpen ? <X size={24} /> : <Menu size={24} />}
            </button>

            <aside className="hidden lg:flex w-80 min-h-screen bg-[#071426] border-r border-white/5 sticky top-0 flex-col p-8 font-['Inter',_sans-serif]">
                {renderSidebarContent()}
            </aside>

            <AnimatePresence>
                {isOpen && (
                    <>
                        <motion.div
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 1 }}
                            exit={{ opacity: 0 }}
                            onClick={() => setIsOpen(false)}
                            className="lg:hidden fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
                        />
                        <motion.aside
                            initial={{ x: '-100%' }}
                            animate={{ x: 0 }}
                            exit={{ x: '-100%' }}
                            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                            className="lg:hidden fixed left-0 top-0 bottom-0 w-[280px] bg-[#071426] z-50 p-8 flex flex-col shadow-2xl border-r border-white/5"
                        >
                            {renderSidebarContent()}
                        </motion.aside>
                    </>
                )}
            </AnimatePresence>
        </>
    );
};

export default Sidebar;
