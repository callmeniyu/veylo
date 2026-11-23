// src/components/Sidebar.tsx
import { NavLink, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard,
  Users,
  Building2,
  BarChart3,
  CreditCard,
  History,
  Settings,
  LogOut,
  X,
  RotateCcw,
  Shield,
  Key,
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import VeyloLogo from './VeyloLogo';
import { useState } from 'react';
import ResetModal from './ResetModal';

type Props = {
  open?: boolean;
  onClose?: () => void;
};

const navigation = [
  { name: 'Dashboard', to: '/app', icon: LayoutDashboard, end: true },
  { name: 'Customers', to: '/app/customers', icon: Building2 },
  { name: 'Subscriptions & Plans', to: '/app/plans', icon: CreditCard },
  { name: 'Team Management', to: '/app/team', icon: Users },
  { name: 'Product Analytics', to: '/app/analytics', icon: BarChart3 },
  { name: 'Activity Log', to: '/app/activity', icon: History },
  { name: 'Settings', to: '/app/settings', icon: Settings },
];

const Sidebar = ({ open = false, onClose }: Props) => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [showResetModal, setShowResetModal] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
    onClose?.();
  };

  return (
    <>
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-64 flex flex-col bg-slate-900 border-r border-slate-800 text-slate-300 transition-transform duration-300 ease-in-out md:static md:translate-x-0 ${
          open ? 'translate-x-0' : '-translate-x-full'
        }`}
        aria-hidden={!open}
      >
        {/* Header & Logo */}
        <div className="flex items-center justify-between h-16 px-5 border-b border-slate-800/80">
          <NavLink to="/app" onClick={onClose} className="flex items-center">
            <VeyloLogo size="md" showBadge={true} />
          </NavLink>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          <div className="px-3 pb-2 text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Administration
          </div>
          <nav className="space-y-1">
            {navigation.map(item => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  end={item.end}
                  onClick={onClose}
                  className={({ isActive }) =>
                    `group flex items-center px-3 py-2.5 text-sm font-medium rounded-xl transition-all duration-150 ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/70'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-3 flex-shrink-0 transition-transform group-hover:scale-105" />
                  <span className="truncate">{item.name}</span>
                </NavLink>
              );
            })}
          </nav>

          {/* Quick Demo Credentials Info Card */}
          <div className="mt-6 p-3.5 rounded-xl bg-slate-800/50 border border-slate-700/60 text-xs">
            <div className="flex items-center justify-between text-slate-300 font-semibold mb-2">
              <span className="flex items-center gap-1.5 text-indigo-400">
                <Key className="w-3.5 h-3.5" />
                Demo Admin
              </span>
              <span className="text-[10px] px-1.5 py-0.5 rounded bg-emerald-500/20 text-emerald-300 font-mono">
                Active
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-mono truncate mb-1">
              admin@veylo.demo
            </p>
            <p className="text-[11px] text-slate-500 font-mono">
              Password: VeyloDemo123
            </p>
            <button
              onClick={() => setShowResetModal(true)}
              className="mt-3 w-full flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-[11px] font-medium text-slate-300 hover:text-white bg-slate-700/50 hover:bg-slate-700 rounded-lg border border-slate-600/60 transition-colors"
            >
              <RotateCcw className="w-3 h-3 text-slate-400" />
              Reset Demo Data
            </button>
          </div>
        </div>

        {/* User Footer Profile */}
        <div className="p-3 border-t border-slate-800/80 bg-slate-900/80">
          <div className="flex items-center justify-between p-2 rounded-xl bg-slate-800/40 border border-slate-700/40">
            <div className="flex items-center gap-2.5 min-w-0">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-indigo-600 to-cyan-500 flex items-center justify-center text-white font-bold text-xs flex-shrink-0 shadow-xs">
                {user?.name ? user.name.charAt(0) : 'A'}
              </div>
              <div className="min-w-0">
                <p className="text-xs font-semibold text-slate-200 truncate">
                  {user?.name || 'Administrator'}
                </p>
                <div className="flex items-center gap-1">
                  <Shield className="w-2.5 h-2.5 text-indigo-400" />
                  <p className="text-[10px] text-indigo-400 font-medium">
                    {user?.role || 'Admin'}
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={handleLogout}
              className="p-1.5 rounded-lg text-slate-400 hover:text-red-400 hover:bg-slate-700/50 transition-colors"
              title="Sign out of demo"
              aria-label="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      <ResetModal open={showResetModal} onClose={() => setShowResetModal(false)} />
    </>
  );
};

export default Sidebar;
