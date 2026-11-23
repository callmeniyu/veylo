// src/components/DemoBanner.tsx
import React, { useState } from 'react';
import { RotateCcw, Key } from 'lucide-react';
import ResetModal from './ResetModal';

export const DemoBanner: React.FC = () => {
  const [showReset, setShowReset] = useState(false);
  const [showCreds, setShowCreds] = useState(false);

  return (
    <>
      <div className="bg-gradient-to-r from-indigo-900 via-slate-900 to-indigo-950 text-white text-xs px-4 py-2 flex flex-wrap items-center justify-between gap-2 border-b border-indigo-800/40 shadow-sm z-30">
        <div className="flex items-center gap-2 flex-1 min-w-[280px]">
          <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 tracking-wider uppercase">
            Interactive Demo
          </span>
          <p className="text-slate-300 truncate">
            All data is fictional and stored locally in this browser. Changes will not affect any real account or service.
          </p>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => setShowCreds(prev => !prev)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700 text-[11px] font-medium transition-colors"
            title="View Demo Credentials"
          >
            <Key className="w-3 h-3 text-indigo-400" />
            <span>Credentials</span>
          </button>

          <button
            onClick={() => setShowReset(true)}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded bg-indigo-600/80 hover:bg-indigo-600 text-white border border-indigo-500/50 text-[11px] font-medium transition-colors"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset Demo Data</span>
          </button>
        </div>

        {showCreds && (
          <div className="w-full mt-2 pt-2 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-300">
            <div className="flex items-center gap-4">
              <span>Admin Email: <strong className="text-white font-mono">admin@veylo.demo</strong></span>
              <span>Password: <strong className="text-white font-mono">VeyloDemo123</strong></span>
            </div>
            <span className="text-slate-400 italic">One-click login available on the login page</span>
          </div>
        )}
      </div>

      <ResetModal open={showReset} onClose={() => setShowReset(false)} />
    </>
  );
};

export default DemoBanner;
