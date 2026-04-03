import React from 'react';
import { NavLink } from 'react-router-dom';
import { 
    LayoutDashboard, 
    ShieldPlus, 
    BellRing, 
    History, 
    LogOut, 
    Shield,
    Wallet
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';

const Sidebar = () => {
    const { logout, user } = useAuth();

    const menuItems = [
        { icon: <LayoutDashboard size={22} />, label: 'Dashboard', path: '/dashboard' },
        { icon: <ShieldPlus size={22} />, label: 'Buy Policy', path: '/buy-policy' },
        { icon: <BellRing size={22} />, label: 'My Claims', path: '/claims' },
        { icon: <Wallet size={22} />, label: 'Payouts', path: '/payouts' },
    ];

    return (
        <aside className="w-80 min-h-screen bg-[#071426] border-r border-white/5 sticky top-0 flex flex-col p-8 font-['Inter',_sans-serif]">
            <div className="flex items-center gap-3 mb-16 px-2">
                <div className="w-10 h-10 bg-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-600/20">
                    <Shield className="w-6 h-6 text-white" />
                </div>
                <span className="text-2xl font-bold tracking-tight text-white italic">GigShield</span>
            </div>

            <nav className="flex-1 space-y-2">
                {menuItems.map((item) => (
                    <NavLink
                        key={item.path}
                        to={item.path}
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
                    <div className="text-xs text-slate-500 mb-1 uppercase tracking-wider font-bold">Worker Profile</div>
                    <div className="font-bold text-white mb-0.5">{user?.name}</div>
                    <div className="text-xs text-slate-400">{user?.platform} • {user?.city}</div>
                </div>
                
                <button 
                    onClick={logout}
                    className="flex items-center gap-4 px-4 py-4 w-full rounded-2xl text-slate-400 hover:text-red-400 hover:bg-red-400/5 transition-all duration-300"
                >
                    <LogOut size={22} />
                    <span className="font-semibold">Logout</span>
                </button>
            </div>
        </aside>
    );
};

export default Sidebar;
