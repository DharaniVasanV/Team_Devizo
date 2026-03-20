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
        <aside className="w-72 min-h-screen border-r border-white/10 glass-morphism sticky top-0 flex flex-col p-6">
            <div className="flex items-center gap-2 mb-12 px-2">
                <Shield className="w-8 h-8 text-primary" />
                <span className="text-2xl font-bold tracking-tight text-white">GigGuard</span>
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
