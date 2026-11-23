// src/pages/Dashboard.tsx
import { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Building2,
  DollarSign,
  Users,
  TrendingUp,
  UserPlus,
  Plus,
  ArrowUpRight,
  ShieldCheck,
  Activity,
} from 'lucide-react';
import {
  customerService,
  activityService,
  analyticsService,
  VEYLO_DATA_CHANGED_EVENT,
} from '../services/dataService';
import type { Customer, ActivityItem } from '../types';
import { Line, Doughnut } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

const nf = new Intl.NumberFormat();
const currFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});

export default function Dashboard() {
  const [metrics, setMetrics] = useState(() => customerService.getMetrics());
  const [customers, setCustomers] = useState<Customer[]>(() => customerService.getAll());
  const [recentActivity, setRecentActivity] = useState<ActivityItem[]>(() => activityService.getAll(6));

  const refreshData = useCallback(() => {
    setMetrics(customerService.getMetrics());
    setCustomers(customerService.getAll());
    setRecentActivity(activityService.getAll(6));
  }, []);

  useEffect(() => {
    window.addEventListener(VEYLO_DATA_CHANGED_EVENT, refreshData);
    return () => window.removeEventListener(VEYLO_DATA_CHANGED_EVENT, refreshData);
  }, [refreshData]);

  const recentCustomers = useMemo(() => {
    return [...customers]
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 5);
  }, [customers]);

  const timeSeries = useMemo(() => {
    return analyticsService.getTimeSeries(30);
  }, []);

  const activeDAU = timeSeries.length > 0 ? timeSeries[timeSeries.length - 1].users : Math.round(metrics.totalSeats * 0.65);
  const activeWAU = timeSeries.length > 0
    ? Math.round(timeSeries.slice(-7).reduce((acc, p) => acc + p.users, 0) / 7)
    : Math.round(metrics.totalSeats * 0.82);

  // Line Chart: Growth curve
  const growthChartData = {
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
        tension: 0.35,
        pointRadius: 2,
        pointHoverRadius: 5,
      },
    ],
  };

  // Doughnut Chart: Subscription breakdown
  const doughnutChartData = {
    labels: ['Free', 'Pro', 'Business', 'Enterprise'],
    datasets: [
      {
        data: [
          metrics.planCounts.Free,
          metrics.planCounts.Pro,
          metrics.planCounts.Business,
          metrics.planCounts.Enterprise,
        ],
        backgroundColor: ['#94A3B8', '#38BDF8', '#818CF8', '#4F46E5'],
        borderColor: 'transparent',
      },
    ],
  };

  return (
    <div className="space-y-6">
      {/* Page Title & Quick Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Platform Overview
            </h1>
            <span className="text-xs px-2 py-0.5 rounded-full bg-indigo-100 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border border-indigo-200 dark:border-indigo-800 font-semibold">
              Live Demo
            </span>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time status of multi-tenant customer accounts, subscription revenue, and active usage.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <Link
            to="/app/customers"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Manage Customers</span>
          </Link>
          <Link
            to="/app/team"
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Team Access</span>
          </Link>
        </div>
      </div>

      {/* KPI Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Customers */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Customers
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/50 flex items-center justify-center text-indigo-600 dark:text-indigo-400 border border-indigo-100 dark:border-indigo-900/60">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {metrics.total}
            </span>
            <span className="text-xs font-medium text-emerald-600 dark:text-emerald-400 flex items-center">
              <TrendingUp className="w-3 h-3 mr-0.5" />
              {metrics.active} active
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {metrics.statusCounts.pending} pending activation
          </div>
        </div>

        {/* Estimated Monthly MRR */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Monthly Revenue (MRR)
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 flex items-center justify-center text-emerald-600 dark:text-emerald-400 border border-emerald-100 dark:border-emerald-900/60">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {currFmt.format(metrics.totalMRR)}
            </span>
            <span className="text-xs font-medium text-indigo-600 dark:text-indigo-400">
              {currFmt.format(metrics.totalARR)} ARR
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {metrics.paidConversion}% conversion to paid tiers
          </div>
        </div>

        {/* Total Managed Seats */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Total Allocated Seats
            </span>
            <div className="w-9 h-9 rounded-xl bg-sky-50 dark:bg-sky-950/50 flex items-center justify-center text-sky-600 dark:text-sky-400 border border-sky-100 dark:border-sky-900/60">
              <Users className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {nf.format(metrics.totalSeats)}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              across {metrics.total} orgs
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            Avg {Math.round(metrics.totalSeats / (metrics.total || 1))} seats / customer
          </div>
        </div>

        {/* Active Daily Telemetry */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
              Active Users (DAU / WAU)
            </span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/50 flex items-center justify-center text-purple-600 dark:text-purple-400 border border-purple-100 dark:border-purple-900/60">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900 dark:text-white">
              {nf.format(activeDAU)}
            </span>
            <span className="text-xs font-medium text-purple-600 dark:text-purple-400">
              DAU
            </span>
          </div>
          <div className="mt-2 text-[11px] text-slate-400">
            {nf.format(activeWAU)} Weekly Active Users (WAU)
          </div>
        </div>
      </div>

      {/* Chart Visualizations Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Growth Curve (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Active User Telemetry Trend
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Daily active platform engagement over the last 30 days
              </p>
            </div>
            <Link
              to="/app/analytics"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>Deep Insights</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>
          <div className="h-64">
            <Line
              data={growthChartData}
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
          </div>
        </div>

        {/* Subscription Tier Distribution */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Tier Distribution
              </h3>
              <span className="text-xs font-semibold text-slate-600 dark:text-slate-300">
                {metrics.paidConversion}% Paid
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-4">
              Breakdown by active customer plan
            </p>
            <div className="h-44 flex items-center justify-center">
              <Doughnut
                data={doughnutChartData}
                options={{
                  responsive: true,
                  maintainAspectRatio: false,
                  plugins: { legend: { position: 'bottom', labels: { boxWidth: 10, font: { size: 10 } } } },
                }}
              />
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs">
            <div className="flex justify-between text-slate-500">
              <span>Enterprise:</span>
              <strong className="text-slate-800 dark:text-slate-200">{metrics.planCounts.Enterprise}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Business:</span>
              <strong className="text-slate-800 dark:text-slate-200">{metrics.planCounts.Business}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Pro:</span>
              <strong className="text-slate-800 dark:text-slate-200">{metrics.planCounts.Pro}</strong>
            </div>
            <div className="flex justify-between text-slate-500">
              <span>Free:</span>
              <strong className="text-slate-800 dark:text-slate-200">{metrics.planCounts.Free}</strong>
            </div>
          </div>
        </div>
      </div>

      {/* Tables & Activity Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Customer Registrations (2 cols) */}
        <div className="lg:col-span-2 p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                Recent Customer Organizations
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Latest tenant registrations and plan status
              </p>
            </div>
            <Link
              to="/app/customers"
              className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline flex items-center gap-1"
            >
              <span>View All ({metrics.total})</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-semibold">
                <tr>
                  <th className="py-2.5 px-3 rounded-l-lg">Organization</th>
                  <th className="py-2.5 px-3">Plan</th>
                  <th className="py-2.5 px-3">Seats</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 rounded-r-lg">Created</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {recentCustomers.map((c: Customer) => (
                  <tr key={c.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                    <td className="py-3 px-3 font-medium text-slate-900 dark:text-white">
                      <div>{c.name}</div>
                      <div className="text-[11px] text-slate-400 font-normal">{c.contactPerson}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        c.plan === 'Enterprise'
                          ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                          : c.plan === 'Business'
                          ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                          : c.plan === 'Pro'
                          ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                          : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                      }`}>
                        {c.plan}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-600 dark:text-slate-300 font-mono">
                      {nf.format(c.seats)}
                    </td>
                    <td className="py-3 px-3">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        c.status === 'active'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : c.status === 'pending'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          c.status === 'active' ? 'bg-emerald-500' : c.status === 'pending' ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                        {c.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-slate-400 font-mono text-[11px]">
                      {c.createdAt.split('T')[0]}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Recent Admin Activity Feed */}
        <div className="p-5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 dark:text-white">
                  Audit Activity
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  Recent actions logged in local storage
                </p>
              </div>
              <Link
                to="/app/activity"
                className="text-xs font-medium text-indigo-600 dark:text-indigo-400 hover:underline"
              >
                Full Log
              </Link>
            </div>

            <div className="space-y-3.5">
              {recentActivity.map((act: ActivityItem) => (
                <div key={act.id} className="flex items-start gap-3 text-xs">
                  <div className="w-2 h-2 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800 dark:text-slate-200 truncate">
                      {act.action}
                    </p>
                    <p className="text-slate-500 dark:text-slate-400 truncate text-[11px]">
                      {act.target}
                    </p>
                    <span className="text-[10px] text-slate-400">
                      {act.timestamp.split('T')[1].slice(0, 5)} • {act.category}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-5 pt-3 border-t border-slate-100 dark:border-slate-800 text-center">
            <span className="text-[11px] text-slate-400 inline-flex items-center gap-1">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
              All actions recorded in local browser audit journal
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
