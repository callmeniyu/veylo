// src/pages/Landing.tsx
import { Link, useNavigate } from 'react-router-dom';
import {
  Building2,
  Users,
  BarChart3,
  CreditCard,
  ArrowRight,
  Database,
  Sparkles,
  Layers,
} from 'lucide-react';
import VeyloLogo from '../components/VeyloLogo';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Landing() {
  const { isAuthenticated, quickDemoLogin } = useAuth();
  const { theme, toggle } = useTheme();
  const navigate = useNavigate();

  const handleOpenDemo = () => {
    if (!isAuthenticated) {
      quickDemoLogin();
    }
    navigate('/app');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 selection:bg-indigo-500 selection:text-white flex flex-col">
      {/* Top Demo Notification Strip */}
      <div className="bg-indigo-950/80 border-b border-indigo-800/40 px-4 py-2 text-center text-xs text-indigo-200 flex items-center justify-center gap-2">
        <span className="px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 font-semibold border border-indigo-400/20 text-[10px] uppercase tracking-wider">
          Browser Demo
        </span>
        <span>
          Self-contained interactive demo. No backend or account creation required.
        </span>
      </div>

      {/* Navigation Bar */}
      <header className="border-b border-slate-800/80 bg-slate-900/60 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <VeyloLogo size="md" showBadge={true} />
          </div>

          <nav className="hidden md:flex items-center gap-8 text-sm font-medium text-slate-300">
            <a href="#features" className="hover:text-white transition-colors">Platform</a>
            <a href="#capabilities" className="hover:text-white transition-colors">Governance</a>
            <a href="#architecture" className="hover:text-white transition-colors">Architecture</a>
          </nav>

          <div className="flex items-center gap-3">
            <button
              onClick={toggle}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
              title="Toggle theme"
            >
              {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
            </button>

            <Link
              to="/login"
              className="text-xs font-semibold text-slate-300 hover:text-white px-3 py-2 rounded-lg hover:bg-slate-800 transition-colors"
            >
              Sign In
            </Link>

            <button
              onClick={handleOpenDemo}
              className="inline-flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Open Demo Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden pt-16 pb-20 lg:pt-24 lg:pb-32">
        {/* Glow Effects */}
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[300px] bg-indigo-600/20 blur-[120px] rounded-full pointer-events-none" />
        <div className="absolute top-1/3 left-1/3 w-[400px] h-[250px] bg-cyan-500/15 blur-[100px] rounded-full pointer-events-none" />

        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-slate-800/80 border border-slate-700/80 text-xs text-slate-300 mb-8 backdrop-blur-xs">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Next-Generation SaaS Operations Console</span>
          </div>

          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white mb-6 leading-tight sm:leading-none">
            Modern SaaS Administration &{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-sky-300 to-cyan-400">
              Operational Intelligence
            </span>
          </h1>

          <p className="max-w-2xl mx-auto text-base sm:text-lg text-slate-400 mb-10 leading-relaxed">
            Veylo provides centralized multi-tenant customer management, subscription lifecycle governance, team role access, and actionable telemetry — packaged in a browser-native operational demo.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button
              onClick={handleOpenDemo}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-6 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02]"
            >
              <span>Launch Demo Environment</span>
              <ArrowRight className="w-4 h-4" />
            </button>
            <Link
              to="/login"
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 text-sm font-semibold text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 rounded-xl transition-colors"
            >
              View Admin Credentials
            </Link>
          </div>

          {/* Credentials badge */}
          <div className="mt-6 flex items-center justify-center gap-2 text-xs text-slate-500">
            <span>Demo Account:</span>
            <code className="text-indigo-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 font-mono">
              admin@veylo.demo
            </code>
            <span>/</span>
            <code className="text-indigo-400 bg-slate-900/80 px-2 py-0.5 rounded border border-slate-800 font-mono">
              VeyloDemo123
            </code>
          </div>

          {/* Dashboard Representative UI Preview */}
          <div className="mt-14 relative rounded-2xl p-2 bg-gradient-to-b from-slate-700/50 via-slate-800/20 to-slate-900/40 border border-slate-700/60 shadow-2xl backdrop-blur-md">
            <div className="rounded-xl overflow-hidden bg-slate-900 border border-slate-800 text-left p-4 sm:p-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-6">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-rose-500/80" />
                  <div className="w-3 h-3 rounded-full bg-amber-500/80" />
                  <div className="w-3 h-3 rounded-full bg-emerald-500/80" />
                  <span className="ml-3 text-xs font-mono text-slate-400">veylo.app / administration / overview</span>
                </div>
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                  Live Local Storage Demo
                </span>
              </div>

              {/* Mock Dashboard Preview Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-xs text-slate-400">Total Customers</span>
                  <div className="text-2xl font-bold text-white mt-1">38</div>
                  <span className="text-[10px] text-emerald-400 font-medium">+18% this quarter</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-xs text-slate-400">Active Monthly MRR</span>
                  <div className="text-2xl font-bold text-white mt-1">$7,824</div>
                  <span className="text-[10px] text-indigo-400 font-medium">92% paid accounts</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-xs text-slate-400">Managed Seats</span>
                  <div className="text-2xl font-bold text-white mt-1">5,310</div>
                  <span className="text-[10px] text-emerald-400 font-medium">Enterprise scale</span>
                </div>
                <div className="p-4 rounded-xl bg-slate-800/60 border border-slate-700/60">
                  <span className="text-xs text-slate-400">Platform Admins</span>
                  <div className="text-2xl font-bold text-white mt-1">10</div>
                  <span className="text-[10px] text-slate-400">Role-governed</span>
                </div>
              </div>

              {/* Mock Chart & Table snippet */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="md:col-span-2 p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <div className="flex items-center justify-between text-xs text-slate-400 mb-3">
                    <span className="font-semibold text-slate-200">Customer Growth Curve</span>
                    <span>30-Day Window</span>
                  </div>
                  <div className="h-28 flex items-end gap-2 pt-4">
                    {[35, 42, 48, 55, 60, 58, 67, 72, 80, 85, 92, 98].map((h, i) => (
                      <div key={i} className="flex-1 bg-indigo-600/60 hover:bg-indigo-500 rounded-t transition-all" style={{ height: `${h}%` }} />
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-slate-800/40 border border-slate-800">
                  <span className="text-xs font-semibold text-slate-200 block mb-2">Subscription Distribution</span>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between text-slate-300">
                      <span>Enterprise</span>
                      <strong className="text-white">10 (26%)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Business</span>
                      <strong className="text-white">12 (32%)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Pro</span>
                      <strong className="text-white">12 (32%)</strong>
                    </div>
                    <div className="flex justify-between text-slate-300">
                      <span>Free</span>
                      <strong className="text-white">4 (10%)</strong>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Feature Grid */}
      <section id="features" className="py-20 bg-slate-900/60 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <h2 className="text-xs font-semibold text-indigo-400 tracking-wider uppercase mb-2">
              Core Capabilities
            </h2>
            <p className="text-3xl font-bold text-white tracking-tight">
              Designed for High-Velocity SaaS Operations
            </p>
            <p className="mt-4 text-slate-400 text-sm">
              Explore a completely interactive admin suite with real local data persistence, search, filtering, and audit logs.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-indigo-500/10 text-indigo-400 flex items-center justify-center mb-5 border border-indigo-500/20">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Tenant Management</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Complete CRUD for customer organizations. Manage contact details, seat allocations, statuses, and subscription tiers.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center mb-5 border border-cyan-500/20">
                <CreditCard className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Plan Governance</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Define and configure Free, Pro, Business, and Enterprise plans. Adjust pricing, limits, feature tags, and defaults.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-emerald-500/10 text-emerald-400 flex items-center justify-center mb-5 border border-emerald-500/20">
                <Users className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Team Governance</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Add, edit, deactivate, or remove team members. Assign Admin or Staff roles with departmental classification.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-purple-500/10 text-purple-400 flex items-center justify-center mb-5 border border-purple-500/20">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Product Analytics</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Visualize active usage, DAU/WAU trends, tier conversions, and feature adoption with reactive Chart.js diagrams.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center mb-5 border border-amber-500/20">
                <Layers className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Activity Audit Log</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Track every administrative action locally. Audit log entries persist automatically for creation, editing, and resets.
              </p>
            </div>

            <div className="p-6 rounded-2xl bg-slate-800/40 border border-slate-700/60 hover:border-indigo-500/50 transition-colors">
              <div className="w-12 h-12 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center mb-5 border border-rose-500/20">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Local Data Architecture</h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Zero server dependencies. Schema-versioned, safe-parsed localStorage with full state export and instant reset.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Architecture Highlights */}
      <section id="architecture" className="py-20 border-t border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-8 sm:p-12 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/40 to-slate-900 border border-slate-800 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-8">
            <div className="max-w-2xl">
              <h3 className="text-2xl font-bold text-white mb-3">
                Ready to explore Veylo?
              </h3>
              <p className="text-sm text-slate-400 leading-relaxed">
                Jump right into the admin console with one click. Test creating organizations, updating plans, managing users, and resetting data anytime.
              </p>
            </div>
            <button
              onClick={handleOpenDemo}
              className="inline-flex items-center gap-2 px-6 py-3.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xl shadow-indigo-600/30 transition-all hover:scale-[1.02] flex-shrink-0"
            >
              <span>Enter Demo Dashboard</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 py-8 bg-slate-950">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <VeyloLogo size="sm" showBadge={false} />
            <span>— Interactive SaaS Administration Prototype</span>
          </div>
          <div className="flex items-center gap-6">
            <span>Client-side Browser Demo</span>
            <span>Static Hosting Ready</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
