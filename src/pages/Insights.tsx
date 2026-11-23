// src/pages/Insights.tsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  TrendingUp,
  Info,
} from 'lucide-react';
import {
  customerService,
  analyticsService,
  VEYLO_DATA_CHANGED_EVENT,
} from '../services/dataService';
import type { UsagePoint } from '../types';
import { Line, Bar, Doughnut } from 'react-chartjs-2';

const nf = new Intl.NumberFormat();
const currFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function Insights() {
  const [metrics, setMetrics] = useState(() => customerService.getMetrics());

  const refresh = useCallback(() => {
    setMetrics(customerService.getMetrics());
  }, []);

  useEffect(() => {
    window.addEventListener(VEYLO_DATA_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(VEYLO_DATA_CHANGED_EVENT, refresh);
  }, [refresh]);

  const [dateRange, setDateRange] = useState<number>(30);
  const [planFilter, setPlanFilter] = useState<string>('All');
  const [chartView, setChartView] = useState<'activity' | 'features'>('activity');

  const timeSeries: UsagePoint[] = useMemo(() => {
    return analyticsService.getTimeSeries(dateRange, planFilter);
  }, [dateRange, planFilter]);

  // Aggregate stats over selected window
  const aggregates = useMemo(() => {
    const totalUsers = timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].users : 0;
    const totalApi = timeSeries.reduce((s, p) => s + p.apiRequests, 0);
    const totalWorkflows = timeSeries.reduce((s, p) => s + p.workflowsRun, 0);
    const totalReports = timeSeries.reduce((s, p) => s + p.reportsGenerated, 0);

    const firstPoint = timeSeries.length > 0 ? timeSeries[0].users : 1;
    const lastPoint = timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].users : 1;
    const growthPercent = Math.round(((lastPoint - firstPoint) / Math.max(1, firstPoint)) * 100);

    return {
      totalUsers,
      totalApi,
      totalWorkflows,
      totalReports,
      growthPercent,
    };
  }, [timeSeries]);

  // Telemetry Line Chart
  const lineChartData = {
    labels: timeSeries.map(p => {
      const parts = p.date.split('-');
      return `${parts[1]}/${parts[2]}`;
    }),
    datasets: [
      {
        label: 'Active Users (DAU)',
        data: timeSeries.map(p => p.users),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79, 70, 229, 0.08)',
        fill: true,
        tension: 0.3,
      },
    ],
  };

  // Feature Breakdown Bar Chart
  const featureBarData = {
    labels: ['API Requests (k)', 'Workflow Triggers (k)', 'Reports Generated (k)'],
    datasets: [
      {
        label: 'Volume',
        data: [
          Math.round(aggregates.totalApi / 1000),
          Math.round(aggregates.totalWorkflows / 1000),
          Math.round(aggregates.totalReports / 1000),
        ],
        backgroundColor: ['#6366F1', '#06B6D4', '#10B981'],
        borderRadius: 8,
      },
    ],
  };

  // Subscription Breakdown Doughnut
  const doughnutData = {
    labels: ['Enterprise', 'Business', 'Pro', 'Free'],
    datasets: [
      {
        data: [
          metrics.planCounts.Enterprise,
          metrics.planCounts.Business,
          metrics.planCounts.Pro,
          metrics.planCounts.Free,
        ],
        backgroundColor: ['#7C3AED', '#4F46E5', '#38BDF8', '#94A3B8'],
        borderColor: 'transparent',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Product & Telemetry Analytics
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Usage trends, multi-tenant adoption, and feature engagement metrics derived from local tenant data.
          </p>
        </div>

        {/* Date and Segment Filters */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Plan Filter */}
          <select
            value={planFilter}
            onChange={e => setPlanFilter(e.target.value)}
            className="px-2.5 py-1.5 text-xs bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
          >
            <option value="All">All Plans</option>
            <option value="Enterprise">Enterprise Only</option>
            <option value="Business">Business Only</option>
            <option value="Pro">Pro Only</option>
            <option value="Free">Free Only</option>
          </select>

          {/* Time range pill buttons */}
          <div className="flex items-center bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-1 text-xs">
            {[7, 30, 90, 365].map(days => (
              <button
                key={days}
                onClick={() => setDateRange(days)}
                className={`px-3 py-1 rounded-lg font-medium transition-all ${
                  dateRange === days
                    ? 'bg-indigo-600 text-white shadow-xs'
                    : 'text-slate-500 hover:text-slate-900 dark:hover:text-slate-200'
                }`}
              >
                {days === 365 ? '1y' : `${days}d`}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Synthetic Demo Label Alert */}
      <div className="p-3.5 rounded-xl bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-200/60 dark:border-indigo-800/60 text-xs text-indigo-900 dark:text-indigo-200 flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <Info className="w-4 h-4 text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
          <span>
            <strong>Demo Analytics:</strong> Usage telemetry is mathematically modeled from your {metrics.total} customer accounts ({metrics.totalSeats} total seats) across the selected {dateRange}-day window.
          </span>
        </div>
        <span className="text-[10px] font-mono uppercase bg-indigo-200/60 dark:bg-indigo-900/60 px-2 py-0.5 rounded text-indigo-800 dark:text-indigo-300 font-bold flex-shrink-0">
          Synthetic
        </span>
      </div>

      {/* Aggregate KPI Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Current Active DAU</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {nf.format(aggregates.totalUsers)}
          </div>
          <span className="text-[10px] text-emerald-500 font-medium flex items-center mt-1">
            <TrendingUp className="w-3 h-3 mr-1" />
            +{aggregates.growthPercent}% trend over {dateRange} days
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total API Invocations</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {nf.format(aggregates.totalApi)}
          </div>
          <span className="text-[10px] text-indigo-500 font-medium block mt-1">
            Avg {Math.round(aggregates.totalApi / dateRange).toLocaleString()} requests / day
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Automated Workflows</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {nf.format(aggregates.totalWorkflows)}
          </div>
          <span className="text-[10px] text-cyan-500 font-medium block mt-1">
            High automation frequency
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Telemetry Export Reports</span>
          <div className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
            {nf.format(aggregates.totalReports)}
          </div>
          <span className="text-[10px] text-emerald-500 font-medium block mt-1">
            Generated by tenant admins
          </span>
        </div>
      </div>

      {/* Main Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Interactive Time Series Chart (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Daily Active Engagement ({dateRange}d)
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Segment: {planFilter} plans • Responsive to date range selection
              </p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setChartView('activity')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  chartView === 'activity'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Line View
              </button>
              <button
                onClick={() => setChartView('features')}
                className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors ${
                  chartView === 'features'
                    ? 'bg-indigo-600 text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                }`}
              >
                Features View
              </button>
            </div>
          </div>

          <div className="h-72">
            {chartView === 'activity' ? (
              <Line
                data={lineChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: {
                    x: { grid: { display: false } },
                    y: { beginAtZero: false },
                  },
                }}
              />
            ) : (
              <Bar
                data={featureBarData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { display: false } },
                  scales: { x: { grid: { display: false } } },
                }}
              />
            )}
          </div>
        </div>

        {/* Subscription Distribution Breakdown */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-bold text-slate-900 dark:text-white mb-1">
              Active Tier Allocation
            </h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Real-time customer share across tiers
            </p>
            <div className="h-48 flex items-center justify-center">
              <Doughnut
                data={doughnutData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
                }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Enterprise Tier ({metrics.planCounts.Enterprise})</span>
              <strong className="text-slate-900 dark:text-white">{currFmt.format(metrics.planCounts.Enterprise * 499)}/mo</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Business Tier ({metrics.planCounts.Business})</span>
              <strong className="text-slate-900 dark:text-white">{currFmt.format(metrics.planCounts.Business * 199)}/mo</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Pro Tier ({metrics.planCounts.Pro})</span>
              <strong className="text-slate-900 dark:text-white">{currFmt.format(metrics.planCounts.Pro * 49)}/mo</strong>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Free Tier ({metrics.planCounts.Free})</span>
              <strong className="text-slate-900 dark:text-white">$0/mo</strong>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
