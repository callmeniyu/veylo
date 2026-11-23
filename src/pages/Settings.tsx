// src/pages/Settings.tsx
import { useState, useMemo, useEffect } from 'react';
import {
  RotateCcw,
  Download,
  Upload,
  CheckCircle2,
  Moon,
  Sun,
  Info,
  Building,
  Save,
} from 'lucide-react';
import {
  settingsService,
} from '../services/dataService';
import {
  exportVeyloState,
  importVeyloState,
  CURRENT_SCHEMA_VERSION,
} from '../services/storage';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../components/ToastProvider';
import ResetModal from '../components/ResetModal';

export default function Settings() {
  const toast = useToast();
  const { theme, setTheme } = useTheme();

  const [settings, setSettings] = useState(settingsService.get());
  const [showResetModal, setShowResetModal] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  useEffect(() => {
    setSettings(settingsService.get());
  }, []);

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    settingsService.update(settings);
    setSavedSuccess(true);
    toast.add({
      kind: 'success',
      title: 'Preferences Saved',
      message: 'Updated organization preferences in browser local storage.',
    });
    setTimeout(() => setSavedSuccess(false), 3000);
  };

  const handleExportBackup = () => {
    const state = exportVeyloState();
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `veylo_state_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    toast.add({
      kind: 'info',
      title: 'Backup Downloaded',
      message: 'Saved complete browser state JSON.',
    });
  };

  const handleImportBackup = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = event => {
      try {
        const json = JSON.parse(event.target?.result as string);
        const ok = importVeyloState(json);
        if (ok) {
          toast.add({
            kind: 'success',
            title: 'Backup Restored',
            message: 'Imported state into local storage.',
          });
          window.location.reload();
        } else {
          throw new Error('Import format invalid');
        }
      } catch (err) {
        toast.add({
          kind: 'error',
          title: 'Import Failed',
          message: 'Could not parse state file.',
        });
      }
    };
    reader.readAsText(file);
  };

  // Estimate localStorage usage
  const storageUsageKb = useMemo(() => {
    if (typeof window === 'undefined') return 0;
    let bytes = 0;
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k && k.startsWith('veylo:')) {
        bytes += (localStorage.getItem(k)?.length || 0) * 2;
      }
    }
    return Math.round(bytes / 1024);
  }, []);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
          Application Preferences
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Local organization metadata, visual theme, and demo dataset storage management.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Form: Organization & Display (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          <form onSubmit={handleSaveSettings} className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs space-y-6">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-2">
                <Building className="w-4 h-4 text-indigo-500" />
                Organization Profile
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                Default identity used across generated demo reports and communications.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Organization Entity
                </label>
                <input
                  type="text"
                  value={settings.organizationName}
                  onChange={e => setSettings(s => ({ ...s, organizationName: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Support Contact Email
                </label>
                <input
                  type="email"
                  value={settings.supportEmail}
                  onChange={e => setSettings(s => ({ ...s, supportEmail: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Currency Standard
                </label>
                <select
                  value={settings.currency}
                  onChange={e => setSettings(s => ({ ...s, currency: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden"
                >
                  <option value="USD">USD ($) - US Dollar</option>
                  <option value="EUR">EUR (€) - Euro</option>
                  <option value="GBP">GBP (£) - British Pound</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Reporting Timezone
                </label>
                <input
                  type="text"
                  value={settings.timezone}
                  onChange={e => setSettings(s => ({ ...s, timezone: e.target.value }))}
                  className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden"
                />
              </div>
            </div>

            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <h4 className="text-xs font-bold text-slate-900 dark:text-white uppercase tracking-wider mb-3">
                Interface Appearance
              </h4>

              <div className="flex flex-wrap items-center gap-4">
                <button
                  type="button"
                  onClick={() => setTheme('light')}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                    theme === 'light'
                      ? 'bg-indigo-50 text-indigo-700 border-indigo-300 font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Sun className="w-4 h-4 text-amber-500" />
                  <span>Light Mode</span>
                </button>

                <button
                  type="button"
                  onClick={() => setTheme('dark')}
                  className={`flex items-center gap-2 px-3 py-2 text-xs font-medium rounded-xl border transition-all ${
                    theme === 'dark'
                      ? 'bg-indigo-950/60 text-indigo-300 border-indigo-700 font-semibold shadow-xs'
                      : 'bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300'
                  }`}
                >
                  <Moon className="w-4 h-4 text-indigo-400" />
                  <span>Dark Mode</span>
                </button>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              {savedSuccess && (
                <span className="text-xs text-emerald-600 dark:text-emerald-400 font-medium flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  Saved locally!
                </span>
              )}
              <button
                type="submit"
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors"
              >
                <Save className="w-3.5 h-3.5" />
                <span>Save Preferences</span>
              </button>
            </div>
          </form>
        </div>

        {/* Right Column: Demo State Operations & Info */}
        <div className="space-y-6">
          {/* Demo Reset Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
            <div className="flex items-center gap-2.5 mb-2 text-rose-600 dark:text-rose-400">
              <RotateCcw className="w-4 h-4" />
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Reset Demo Data
              </h3>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Restores the default fictional dataset (38 organizations, 10 team members, 4 standard plans) and preserves your login session.
            </p>
            <button
              type="button"
              onClick={() => setShowResetModal(true)}
              className="w-full py-2 px-3 text-xs font-semibold text-rose-600 dark:text-rose-400 hover:text-white bg-rose-50 dark:bg-rose-950/40 hover:bg-rose-600 dark:hover:bg-rose-600 border border-rose-200 dark:border-rose-900/60 rounded-xl transition-colors text-center"
            >
              Reset to Factory Demo State
            </button>
          </div>

          {/* Backup / Export State */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              State Backup & Restore
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-4">
              Download your current browser state as a JSON file or restore a previous snapshot.
            </p>
            <div className="space-y-2">
              <button
                type="button"
                onClick={handleExportBackup}
                className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download State JSON</span>
              </button>

              <label className="w-full flex items-center justify-center gap-2 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors cursor-pointer">
                <Upload className="w-3.5 h-3.5" />
                <span>Restore from File</span>
                <input
                  type="file"
                  accept=".json"
                  onChange={handleImportBackup}
                  className="hidden"
                />
              </label>
            </div>
          </div>

          {/* Application Info Card */}
          <div className="p-6 bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs text-xs space-y-2.5">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-2 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-500" />
              Runtime Information
            </h3>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Application Name:</span>
              <strong className="text-slate-900 dark:text-white font-mono">Veylo Admin</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Environment:</span>
              <strong className="text-indigo-600 dark:text-indigo-400 font-mono">Browser Local Demo</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Schema Version:</span>
              <strong className="text-slate-900 dark:text-white font-mono">v{CURRENT_SCHEMA_VERSION}</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Storage Allocated:</span>
              <strong className="text-slate-900 dark:text-white font-mono">~{storageUsageKb} KB</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Backend Connectivity:</span>
              <strong className="text-emerald-600 dark:text-emerald-400 font-mono">None (100% Local)</strong>
            </div>
          </div>
        </div>
      </div>

      <ResetModal open={showResetModal} onClose={() => setShowResetModal(false)} />
    </div>
  );
}
