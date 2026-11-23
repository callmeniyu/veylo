// src/pages/Login.tsx
import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { VeyloLogo } from '../components/VeyloLogo';
import { Key, ShieldAlert, ArrowLeft, ArrowRight, Lock, Mail } from 'lucide-react';
import { useTheme } from '../contexts/ThemeContext';
import { Sun, Moon } from 'lucide-react';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, quickDemoLogin, demoCredentials } = useAuth();
  const { theme, toggle } = useTheme();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const from = (location.state as any)?.from?.pathname || '/app';

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const res = login(email, password);
      if (res.success) {
        navigate(from, { replace: true });
      } else {
        setError(res.error || 'Invalid credentials. Please use the demo credentials provided below.');
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleQuickDemo = () => {
    quickDemoLogin();
    navigate(from, { replace: true });
  };

  const handleFillCredentials = () => {
    setEmail(demoCredentials.email);
    setPassword(demoCredentials.password);
    setError(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative selection:bg-indigo-500 selection:text-white">
      {/* Background glow effects */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[300px] bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none" />

      {/* Top Bar with back to site & theme toggle */}
      <div className="absolute top-4 left-4 right-4 max-w-7xl mx-auto flex items-center justify-between">
        <Link
          to="/"
          className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-400 hover:text-white px-3 py-1.5 rounded-lg hover:bg-slate-900 transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Landing Page</span>
        </Link>
        <button
          onClick={toggle}
          className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-900 transition-colors"
          title="Toggle theme"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </button>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md px-4">
        <div className="text-center mb-8">
          <div className="inline-flex justify-center mb-3">
            <VeyloLogo size="lg" showBadge={true} />
          </div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Demo Console Sign In
          </h2>
          <p className="mt-1 text-xs text-slate-400">
            Sign in to access the Veylo SaaS administration dashboard.
          </p>
        </div>

        {/* Demo Notice Banner */}
        <div className="mb-6 p-4 rounded-xl bg-indigo-950/40 border border-indigo-800/60 text-xs text-indigo-200">
          <div className="flex items-center gap-2 font-semibold text-indigo-300 mb-1">
            <Key className="w-4 h-4 text-indigo-400" />
            <span>Interactive Demo Credentials</span>
          </div>
          <p className="text-slate-300 text-[11px] mb-3">
            Use the pre-configured administrator account below to access all CRUD features.
          </p>
          <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px] bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
            <div className="flex justify-between">
              <span className="text-slate-400">Email:</span>
              <span className="text-indigo-300 select-all">{demoCredentials.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400">Password:</span>
              <span className="text-indigo-300 select-all">{demoCredentials.password}</span>
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2">
            <button
              type="button"
              onClick={handleFillCredentials}
              className="flex-1 py-1.5 px-2 text-[11px] font-medium text-indigo-200 bg-indigo-900/60 hover:bg-indigo-800/80 rounded-md border border-indigo-700/60 transition-colors text-center"
            >
              Fill Form
            </button>
            <button
              type="button"
              onClick={handleQuickDemo}
              className="flex-1 py-1.5 px-2 text-[11px] font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-md shadow-xs transition-colors text-center flex items-center justify-center gap-1"
            >
              <span>One-Click Login</span>
              <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        </div>

        {/* Form Card */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-xl p-6 sm:p-8">
          <form className="space-y-4" onSubmit={handleLogin}>
            {error && (
              <div className="p-3 rounded-xl bg-rose-950/40 border border-rose-800/60 text-xs text-rose-300 flex items-start gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Admin Email
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Mail className="w-4 h-4" />
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="admin@veylo.demo"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800/80 text-white border border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Password
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
                  <Lock className="w-4 h-4" />
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full pl-9 pr-3 py-2 text-sm bg-slate-800/80 text-white border border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden focus:ring-2 focus:ring-indigo-500/20"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full mt-2 py-2.5 px-4 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-lg shadow-indigo-600/30 transition-all hover:scale-[1.01] flex items-center justify-center gap-2"
            >
              <span>{isSubmitting ? 'Authenticating...' : 'Sign In with Credentials'}</span>
            </button>
          </form>

          <div className="mt-6 pt-5 border-t border-slate-800 text-center">
            <p className="text-[11px] text-slate-500 leading-relaxed">
              This simulated login operates entirely inside your local browser. Credentials are validated locally against standard demo parameters.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
