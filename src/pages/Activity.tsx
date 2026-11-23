// src/pages/Activity.tsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Shield,
  Building2,
  Users,
  CreditCard,
  Settings,
  Trash2,
  Search,
  Clock,
} from 'lucide-react';
import {
  activityService,
  VEYLO_DATA_CHANGED_EVENT,
} from '../services/dataService';
import type { ActivityItem } from '../types';
import { useToast } from '../components/ToastProvider';

export default function Activity() {
  const toast = useToast();
  const [rawActivity, setRawActivity] = useState<ActivityItem[]>(() => activityService.getAll());

  const refresh = useCallback(() => {
    setRawActivity(activityService.getAll());
  }, []);

  useEffect(() => {
    window.addEventListener(VEYLO_DATA_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(VEYLO_DATA_CHANGED_EVENT, refresh);
  }, [refresh]);

  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredLogs = useMemo(() => {
    return rawActivity.filter(item => {
      if (categoryFilter !== 'All' && item.category !== categoryFilter) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesAction = item.action.toLowerCase().includes(q);
        const matchesTarget = item.target.toLowerCase().includes(q);
        const matchesDetails = (item.details || '').toLowerCase().includes(q);
        if (!matchesAction && !matchesTarget && !matchesDetails) return false;
      }
      return true;
    });
  }, [rawActivity, categoryFilter, searchQuery]);

  const handleClearLog = () => {
    if (!confirm('Are you sure you want to clear local activity audit history?')) return;
    activityService.clear();
    toast.add({
      kind: 'info',
      title: 'Activity Log Cleared',
      message: 'All local audit entries were purged.',
    });
    refresh();
  };

  const getCategoryIcon = (category: ActivityItem['category']) => {
    switch (category) {
      case 'customer':
        return <Building2 className="w-4 h-4 text-indigo-500" />;
      case 'team':
        return <Users className="w-4 h-4 text-emerald-500" />;
      case 'plan':
        return <CreditCard className="w-4 h-4 text-purple-500" />;
      case 'auth':
        return <Shield className="w-4 h-4 text-amber-500" />;
      default:
        return <Settings className="w-4 h-4 text-slate-500" />;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Administrative Audit Journal
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Chronological record of tenant additions, role changes, plan modifications, and system events.
          </p>
        </div>

        <button
          onClick={handleClearLog}
          className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-rose-600 dark:hover:text-rose-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors self-start sm:self-auto"
        >
          <Trash2 className="w-3.5 h-3.5" />
          <span>Clear Journal</span>
        </button>
      </div>

      {/* Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            placeholder="Filter audit actions, targets, details..."
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={categoryFilter}
            onChange={e => setCategoryFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
          >
            <option value="All">All Categories</option>
            <option value="customer">Customer Events</option>
            <option value="team">Team & Roles</option>
            <option value="plan">Plan & Tiers</option>
            <option value="auth">Authentication</option>
            <option value="system">System & Resets</option>
          </select>
        </div>
      </div>

      {/* Activity Timeline Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        {filteredLogs.length === 0 ? (
          <div className="p-12 text-center text-slate-400">
            <Clock className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="font-semibold text-slate-700 dark:text-slate-300">No audit activity logged</p>
            <p className="text-[11px] mt-0.5">Administrative events will automatically appear here as changes are made.</p>
          </div>
        ) : (
          <div className="divide-y divide-slate-100 dark:divide-slate-800">
            {filteredLogs.map(item => (
              <div
                key={item.id}
                className="p-4 sm:p-5 flex items-start gap-4 hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
              >
                <div className="w-8 h-8 rounded-xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center flex-shrink-0 mt-0.5 border border-slate-200 dark:border-slate-700">
                  {getCategoryIcon(item.category)}
                </div>

                <div className="flex-1 min-w-0">
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-1 mb-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-xs text-slate-900 dark:text-white">
                        {item.action}
                      </span>
                      <span className="text-[10px] uppercase font-bold px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 font-mono">
                        {item.category}
                      </span>
                    </div>

                    <span className="text-[11px] text-slate-400 font-mono">
                      {new Date(item.timestamp).toLocaleString()}
                    </span>
                  </div>

                  <div className="text-xs text-slate-700 dark:text-slate-300 font-medium mb-1">
                    Target: <strong className="text-slate-900 dark:text-white">{item.target}</strong>
                  </div>

                  {item.details && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                      {item.details}
                    </p>
                  )}

                  <div className="mt-2 text-[10px] text-slate-400 flex items-center gap-1">
                    <span>Actor:</span>
                    <span className="font-mono text-indigo-600 dark:text-indigo-400 font-medium">
                      {item.actor}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
