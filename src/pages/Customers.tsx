// src/pages/Customers.tsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import {
  Building2,
  Plus,
  Search,
  Download,
  Trash2,
  Edit2,
  Eye,
  AlertCircle,
} from 'lucide-react';
import {
  customerService,
  planService,
  VEYLO_DATA_CHANGED_EVENT,
} from '../services/dataService';
import type { Customer, PlanDef, PlanType, Status } from '../types';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';
import useDebouncedValue from '../hooks/useDebouncedValue';

const nf = new Intl.NumberFormat();
const currFmt = new Intl.NumberFormat('en-US', {
  style: 'currency',
  currency: 'USD',
  maximumFractionDigits: 0,
});
const PAGE_SIZE = 8;

export default function Customers() {
  const [searchParams] = useSearchParams();
  const toast = useToast();

  const [rawCustomers, setRawCustomers] = useState<Customer[]>(() => customerService.getAll());
  const [metrics, setMetrics] = useState(() => customerService.getMetrics());
  const [availablePlans, setAvailablePlans] = useState<PlanDef[]>(() => planService.getAll());

  const refresh = useCallback(() => {
    setRawCustomers(customerService.getAll());
    setMetrics(customerService.getMetrics());
    setAvailablePlans(planService.getAll());
  }, []);

  useEffect(() => {
    window.addEventListener(VEYLO_DATA_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(VEYLO_DATA_CHANGED_EVENT, refresh);
  }, [refresh]);

  // Filtering, Searching & Sorting States
  const [searchQuery, setSearchQuery] = useState(searchParams.get('q') || '');
  const debouncedQuery = useDebouncedValue(searchQuery, 250);
  const [selectedPlan, setSelectedPlan] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [sortBy, setSortBy] = useState<'name' | 'seats' | 'createdAt' | 'lastActive'>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [customerToEdit, setCustomerToEdit] = useState<Customer | null>(null);
  const [customerToDelete, setCustomerToDelete] = useState<Customer | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  // Filtered & Sorted Customer List
  const filteredCustomers = useMemo(() => {
    return rawCustomers.filter(c => {
      // Query filter
      if (debouncedQuery) {
        const q = debouncedQuery.toLowerCase();
        const matchesName = c.name.toLowerCase().includes(q);
        const matchesContact = c.contactPerson.toLowerCase().includes(q);
        const matchesEmail = c.email.toLowerCase().includes(q);
        const matchesIndustry = c.industry.toLowerCase().includes(q);
        if (!matchesName && !matchesContact && !matchesEmail && !matchesIndustry) {
          return false;
        }
      }

      // Plan filter
      if (selectedPlan !== 'All' && c.plan !== selectedPlan) {
        return false;
      }

      // Status filter
      if (selectedStatus !== 'All' && c.status !== selectedStatus) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      let comp = 0;
      if (sortBy === 'name') comp = a.name.localeCompare(b.name);
      else if (sortBy === 'seats') comp = a.seats - b.seats;
      else if (sortBy === 'createdAt') comp = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      else if (sortBy === 'lastActive') comp = new Date(a.lastActive).getTime() - new Date(b.lastActive).getTime();
      return sortOrder === 'desc' ? -comp : comp;
    });
  }, [rawCustomers, debouncedQuery, selectedPlan, selectedStatus, sortBy, sortOrder]);

  const totalPages = Math.ceil(filteredCustomers.length / PAGE_SIZE) || 1;
  const pagedCustomers = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredCustomers.slice(start, start + PAGE_SIZE);
  }, [filteredCustomers, currentPage]);

  const handleCreateCustomer = (formData: Omit<Customer, 'id' | 'createdAt' | 'lastActive'>) => {
    try {
      customerService.create(formData);
      setShowCreateModal(false);
      toast.add({
        kind: 'success',
        title: 'Organization Created',
        message: `Successfully onboarded ${formData.name}.`,
      });
      refresh();
    } catch (err) {
      toast.add({
        kind: 'error',
        title: 'Creation Failed',
        message: err instanceof Error ? err.message : 'Failed to create customer.',
      });
    }
  };

  const handleEditCustomer = (formData: Partial<Customer>) => {
    if (!customerToEdit) return;
    try {
      customerService.update(customerToEdit.id, formData);
      setCustomerToEdit(null);
      toast.add({
        kind: 'success',
        title: 'Customer Updated',
        message: `Saved changes to ${formData.name || customerToEdit.name}.`,
      });
      refresh();
    } catch (err) {
      toast.add({
        kind: 'error',
        title: 'Update Failed',
        message: err instanceof Error ? err.message : 'Failed to update customer.',
      });
    }
  };

  const handleDeleteCustomer = () => {
    if (!customerToDelete) return;
    try {
      customerService.delete(customerToDelete.id);
      setCustomerToDelete(null);
      toast.add({
        kind: 'success',
        title: 'Customer Removed',
        message: `Organization ${customerToDelete.name} was deleted.`,
      });
      refresh();
    } catch (err) {
      toast.add({
        kind: 'error',
        title: 'Delete Failed',
        message: err instanceof Error ? err.message : 'Failed to delete customer.',
      });
    }
  };

  const handleExportCSV = () => {
    const headers = ['ID', 'Organization', 'Contact Person', 'Email', 'Phone', 'Plan', 'Seats', 'Status', 'MRR', 'Industry', 'Country', 'Created At'];
    const rows = filteredCustomers.map(c => [
      c.id,
      `"${c.name}"`,
      `"${c.contactPerson}"`,
      c.email,
      c.phone,
      c.plan,
      c.seats,
      c.status,
      c.mrr,
      `"${c.industry}"`,
      `"${c.country}"`,
      c.createdAt,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `veylo_customers_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    toast.add({
      kind: 'info',
      title: 'Export Generated',
      message: `Exported ${filteredCustomers.length} customer records to CSV.`,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header & Quick Action */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Customer Organizations
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Directory of subscribed customer accounts, seat limits, and lifecycle statuses.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleExportCSV}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="Download CSV export"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export CSV</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Customer</span>
          </button>
        </div>
      </div>

      {/* Metric Cards Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Accounts</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.total}
          </div>
          <span className="text-[10px] text-emerald-500 font-medium">
            {metrics.active} active accounts
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Active Subscriptions</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {metrics.planCounts.Pro + metrics.planCounts.Business + metrics.planCounts.Enterprise}
          </div>
          <span className="text-[10px] text-indigo-500 font-medium">
            {metrics.paidConversion}% conversion
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Managed Seats</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {nf.format(metrics.totalSeats)}
          </div>
          <span className="text-[10px] text-slate-400">
            Across global tenants
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Monthly Contract Value</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {currFmt.format(metrics.totalMRR)}
          </div>
          <span className="text-[10px] text-emerald-500 font-medium">
            {currFmt.format(metrics.totalARR)} projected ARR
          </span>
        </div>
      </div>

      {/* Controls & Filter Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-3">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          {/* Search Input */}
          <div className="relative flex-1 max-w-md">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
              <Search className="w-4 h-4" />
            </span>
            <input
              type="text"
              placeholder="Search by company, contact, email or industry..."
              value={searchQuery}
              onChange={e => {
                setSearchQuery(e.target.value);
                setCurrentPage(1);
              }}
              className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
            />
          </div>

          {/* Filter Dropdowns */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Plan Filter */}
            <select
              value={selectedPlan}
              onChange={e => {
                setSelectedPlan(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
            >
              <option value="All">All Plans</option>
              <option value="Free">Free</option>
              <option value="Pro">Pro</option>
              <option value="Business">Business</option>
              <option value="Enterprise">Enterprise</option>
            </select>

            {/* Status Filter */}
            <select
              value={selectedStatus}
              onChange={e => {
                setSelectedStatus(e.target.value);
                setCurrentPage(1);
              }}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
            >
              <option value="All">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>

            {/* Sort Filter */}
            <select
              value={sortBy}
              onChange={e => setSortBy(e.target.value as 'name' | 'seats' | 'createdAt' | 'lastActive')}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
            >
              <option value="createdAt">Sort: Created Date</option>
              <option value="name">Sort: Name</option>
              <option value="seats">Sort: Seats</option>
              <option value="lastActive">Sort: Last Active</option>
            </select>

            <button
              onClick={() => setSortOrder(prev => (prev === 'asc' ? 'desc' : 'asc'))}
              className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
            >
              {sortOrder === 'asc' ? '↑ Asc' : '↓ Desc'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Customers Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Organization</th>
                <th className="py-3 px-4">Contact</th>
                <th className="py-3 px-4">Plan & MRR</th>
                <th className="py-3 px-4">Seats</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pagedCustomers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <Building2 className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No organizations found</p>
                    <p className="text-[11px] mt-0.5">Try adjusting your filters or search keywords.</p>
                  </td>
                </tr>
              ) : (
                pagedCustomers.map(customer => (
                  <tr
                    key={customer.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-indigo-50 dark:bg-indigo-950/60 flex items-center justify-center text-indigo-600 dark:text-indigo-400 font-bold text-xs flex-shrink-0">
                          {customer.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{customer.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{customer.industry} • {customer.country}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="text-slate-800 dark:text-slate-200 font-medium">{customer.contactPerson}</div>
                      <div className="text-[11px] text-slate-400">{customer.email}</div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          customer.plan === 'Enterprise'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            : customer.plan === 'Business'
                            ? 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                            : customer.plan === 'Pro'
                            ? 'bg-sky-100 text-sky-700 dark:bg-sky-950/60 dark:text-sky-300'
                            : 'bg-slate-100 text-slate-700 dark:bg-slate-800 dark:text-slate-300'
                        }`}>
                          {customer.plan}
                        </span>
                        <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                          ${customer.mrr}/mo
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4 font-mono text-slate-700 dark:text-slate-300 font-medium">
                      {nf.format(customer.seats)}
                    </td>

                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${
                        customer.status === 'active'
                          ? 'text-emerald-600 dark:text-emerald-400'
                          : customer.status === 'pending'
                          ? 'text-amber-600 dark:text-amber-400'
                          : 'text-slate-400'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          customer.status === 'active' ? 'bg-emerald-500' : customer.status === 'pending' ? 'bg-amber-500' : 'bg-slate-400'
                        }`} />
                        {customer.status}
                      </span>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                      {customer.lastActive.split('T')[0]}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setSelectedCustomer(customer)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCustomerToEdit(customer)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Customer"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setCustomerToDelete(customer)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Delete Customer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Bar */}
        <div className="p-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
          <div>
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredCustomers.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}</strong> to{' '}
            <strong className="text-slate-800 dark:text-slate-200">{Math.min(currentPage * PAGE_SIZE, filteredCustomers.length)}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{filteredCustomers.length}</strong> organizations
          </div>

          <div className="flex items-center gap-2">
            <button
              disabled={currentPage <= 1}
              onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Previous
            </button>
            <span className="px-2 text-slate-600 dark:text-slate-400 font-mono">
              {currentPage} / {totalPages}
            </span>
            <button
              disabled={currentPage >= totalPages}
              onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
              className="px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* VIEW DETAILS MODAL */}
      <Modal
        open={!!selectedCustomer}
        onClose={() => setSelectedCustomer(null)}
        title={selectedCustomer?.name || 'Customer Organization Details'}
      >
        {selectedCustomer && (
          <div className="p-6 space-y-5">
            <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200/80 dark:border-slate-800">
              <div>
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Plan Tier</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2 mt-0.5">
                  <span>{selectedCustomer.plan} Plan</span>
                  <span className="text-xs font-mono font-normal text-indigo-600 dark:text-indigo-400">
                    (${selectedCustomer.mrr}/month)
                  </span>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Allocated Seats</span>
                <div className="text-lg font-bold text-slate-900 dark:text-white font-mono mt-0.5">
                  {nf.format(selectedCustomer.seats)}
                </div>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4 text-xs">
              <div>
                <span className="text-slate-400 font-medium block">Primary Contact</span>
                <span className="text-slate-800 dark:text-slate-200 font-semibold">{selectedCustomer.contactPerson}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Contact Email</span>
                <span className="text-indigo-600 dark:text-indigo-400 font-mono">{selectedCustomer.email}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Phone</span>
                <span className="text-slate-800 dark:text-slate-200 font-mono">{selectedCustomer.phone}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Account Status</span>
                <span className="capitalize font-semibold text-emerald-600 dark:text-emerald-400">{selectedCustomer.status}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Industry Sector</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.industry}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Country / HQ</span>
                <span className="text-slate-800 dark:text-slate-200">{selectedCustomer.country}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Onboarded Date</span>
                <span className="text-slate-800 dark:text-slate-200 font-mono">{selectedCustomer.createdAt.split('T')[0]}</span>
              </div>
              <div>
                <span className="text-slate-400 font-medium block">Last Active</span>
                <span className="text-slate-800 dark:text-slate-200 font-mono">{selectedCustomer.lastActive.split('T')[0]}</span>
              </div>
            </div>

            <div className="flex justify-end pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={() => setSelectedCustomer(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors"
              >
                Close View
              </button>
            </div>
          </div>
        )}
      </Modal>

      {/* CREATE CUSTOMER MODAL */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Add Customer Organization"
      >
        <CustomerForm
          availablePlans={availablePlans}
          onSubmit={handleCreateCustomer}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* EDIT CUSTOMER MODAL */}
      <Modal
        open={!!customerToEdit}
        onClose={() => setCustomerToEdit(null)}
        title={`Edit ${customerToEdit?.name || 'Customer'}`}
      >
        {customerToEdit && (
          <CustomerForm
            customer={customerToEdit}
            availablePlans={availablePlans}
            onSubmit={handleEditCustomer}
            onCancel={() => setCustomerToEdit(null)}
          />
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={!!customerToDelete}
        onClose={() => setCustomerToDelete(null)}
        title="Confirm Deletion"
        maxWidth="md"
      >
        {customerToDelete && (
          <div className="p-6">
            <div className="flex items-center gap-3.5 mb-4 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Delete {customerToDelete.name}?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This customer record and all seat allocations will be permanently removed.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1 mb-6">
              <div><strong>Plan:</strong> {customerToDelete.plan} ({currFmt.format(customerToDelete.mrr)}/mo)</div>
              <div><strong>Seats:</strong> {customerToDelete.seats} allocated</div>
              <div><strong>Contact:</strong> {customerToDelete.email}</div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setCustomerToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeleteCustomer}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
              >
                Confirm Delete
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Subcomponent: Customer Create / Edit Form
function CustomerForm({
  customer,
  availablePlans,
  onSubmit,
  onCancel,
}: {
  customer?: Customer;
  availablePlans: PlanDef[];
  onSubmit: (data: Omit<Customer, 'id' | 'createdAt' | 'lastActive'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(customer?.name || '');
  const [contactPerson, setContactPerson] = useState(customer?.contactPerson || '');
  const [email, setEmail] = useState(customer?.email || '');
  const [phone, setPhone] = useState(customer?.phone || '');
  const [plan, setPlan] = useState<PlanType>(customer?.plan || 'Pro');
  const [seats, setSeats] = useState<number>(customer?.seats || 25);
  const [status, setStatus] = useState<Status>(customer?.status || 'active');
  const [industry, setIndustry] = useState(customer?.industry || 'Cloud Software');
  const [country, setCountry] = useState(customer?.country || 'United States');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Organization name is required';
    if (!contactPerson.trim()) newErrors.contactPerson = 'Contact person is required';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid email is required';
    if (seats <= 0) newErrors.seats = 'Seats must be at least 1';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    // Determine MRR from plan
    const planObj = availablePlans.find(p => p.name.toLowerCase() === plan.toLowerCase());
    const mrr = planObj ? planObj.price : plan === 'Enterprise' ? 499 : plan === 'Business' ? 199 : plan === 'Pro' ? 49 : 0;

    onSubmit({
      name: name.trim(),
      contactPerson: contactPerson.trim(),
      email: email.trim(),
      phone: phone.trim() || '+1 (555) 000-0000',
      plan,
      seats: Number(seats),
      status,
      mrr,
      industry: industry.trim() || 'Software & Services',
      country: country.trim() || 'United States',
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Organization Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
            placeholder="e.g. Apex Horizon Technologies"
          />
          {errors.name && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.name}</span>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Primary Contact Person *
          </label>
          <input
            type="text"
            value={contactPerson}
            onChange={e => setContactPerson(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
            placeholder="e.g. Rachel Sterling"
          />
          {errors.contactPerson && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.contactPerson}</span>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Email Address *
          </label>
          <input
            type="email"
            value={email}
            onChange={e => setEmail(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
            placeholder="rachel@apexhorizon.io"
          />
          {errors.email && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.email}</span>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Phone Number
          </label>
          <input
            type="text"
            value={phone}
            onChange={e => setPhone(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
            placeholder="+1 (415) 890-2101"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Subscription Plan
          </label>
          <select
            value={plan}
            onChange={e => setPlan(e.target.value as PlanType)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden"
          >
            <option value="Free">Free ($0/mo)</option>
            <option value="Pro">Pro ($49/mo)</option>
            <option value="Business">Business ($199/mo)</option>
            <option value="Enterprise">Enterprise ($499/mo)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Allocated Seats *
          </label>
          <input
            type="number"
            min={1}
            max={5000}
            value={seats}
            onChange={e => setSeats(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden font-mono"
          />
          {errors.seats && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.seats}</span>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Industry Category
          </label>
          <input
            type="text"
            value={industry}
            onChange={e => setIndustry(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden"
            placeholder="e.g. Financial Intelligence"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Country / Region
          </label>
          <input
            type="text"
            value={country}
            onChange={e => setCountry(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden"
            placeholder="e.g. United States"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Status
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Status)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden"
          >
            <option value="active">Active</option>
            <option value="pending">Pending</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-100 dark:border-slate-800 mt-6">
        <button
          type="button"
          onClick={onCancel}
          className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50"
        >
          Cancel
        </button>
        <button
          type="submit"
          className="px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl transition-colors shadow-xs"
        >
          {customer ? 'Save Changes' : 'Create Organization'}
        </button>
      </div>
    </form>
  );
}
