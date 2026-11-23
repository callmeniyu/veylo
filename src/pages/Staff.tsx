// src/pages/Staff.tsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Users,
  UserPlus,
  Search,
  Trash2,
  Edit2,
  AlertCircle,
  Shield,
} from 'lucide-react';
import {
  teamService,
  VEYLO_DATA_CHANGED_EVENT,
} from '../services/dataService';
import type { User, Role, Status, PlanType } from '../types';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';
import useDebouncedValue from '../hooks/useDebouncedValue';

const PAGE_SIZE = 8;

export default function Staff() {
  const toast = useToast();
  const [rawTeam, setRawTeam] = useState<User[]>(() => teamService.getAll());

  const refresh = useCallback(() => {
    setRawTeam(teamService.getAll());
  }, []);

  useEffect(() => {
    window.addEventListener(VEYLO_DATA_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(VEYLO_DATA_CHANGED_EVENT, refresh);
  }, [refresh]);

  // Search & Filters
  const [searchQuery, setSearchQuery] = useState('');
  const debouncedQuery = useDebouncedValue(searchQuery, 250);
  const [roleFilter, setRoleFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [currentPage, setCurrentPage] = useState(1);

  // Modals state
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [memberToEdit, setMemberToEdit] = useState<User | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<User | null>(null);

  // Filtered members
  const filteredTeam = useMemo(() => {
    return rawTeam.filter(member => {
      if (debouncedQuery) {
        const q = debouncedQuery.toLowerCase();
        const matchesName = member.name.toLowerCase().includes(q);
        const matchesEmail = member.email.toLowerCase().includes(q);
        const matchesDept = (member.department || '').toLowerCase().includes(q);
        if (!matchesName && !matchesEmail && !matchesDept) return false;
      }
      if (roleFilter !== 'All' && member.role !== roleFilter) return false;
      if (statusFilter !== 'All' && member.status !== statusFilter) return false;
      return true;
    });
  }, [rawTeam, debouncedQuery, roleFilter, statusFilter]);

  const totalPages = Math.ceil(filteredTeam.length / PAGE_SIZE) || 1;
  const pagedTeam = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filteredTeam.slice(start, start + PAGE_SIZE);
  }, [filteredTeam, currentPage]);

  const handleCreate = (data: Omit<User, 'id' | 'createdAt' | 'lastActive'>) => {
    try {
      teamService.create(data);
      setShowCreateModal(false);
      toast.add({
        kind: 'success',
        title: 'Team Member Added',
        message: `Successfully invited ${data.name} to the team.`,
      });
      refresh();
    } catch (err) {
      toast.add({
        kind: 'error',
        title: 'Addition Failed',
        message: err instanceof Error ? err.message : 'Could not add team member.',
      });
    }
  };

  const handleEdit = (patch: Partial<User>) => {
    if (!memberToEdit) return;
    try {
      teamService.update(memberToEdit.id, patch);
      setMemberToEdit(null);
      toast.add({
        kind: 'success',
        title: 'Member Updated',
        message: `Saved profile updates for ${patch.name || memberToEdit.name}.`,
      });
      refresh();
    } catch (err) {
      toast.add({
        kind: 'error',
        title: 'Update Failed',
        message: err instanceof Error ? err.message : 'Could not update member.',
      });
    }
  };

  const handleToggleStatus = (member: User) => {
    try {
      teamService.toggleStatus(member.id);
      toast.add({
        kind: 'info',
        title: 'Status Updated',
        message: `${member.name} is now ${member.status === 'active' ? 'inactive' : 'active'}.`,
      });
      refresh();
    } catch (err) {
      toast.add({
        kind: 'error',
        title: 'Status Update Failed',
        message: err instanceof Error ? err.message : 'Failed to toggle status.',
      });
    }
  };

  const handleDelete = () => {
    if (!memberToDelete) return;
    try {
      teamService.delete(memberToDelete.id);
      setMemberToDelete(null);
      toast.add({
        kind: 'success',
        title: 'Member Removed',
        message: `Removed ${memberToDelete.name} from team directory.`,
      });
      refresh();
    } catch (err) {
      toast.add({
        kind: 'error',
        title: 'Delete Failed',
        message: err instanceof Error ? err.message : 'Failed to delete member.',
      });
    }
  };

  const activeCount = rawTeam.filter(u => u.status === 'active').length;
  const adminCount = rawTeam.filter(u => u.role === 'Admin').length;

  return (
    <div className="space-y-6">
      {/* Page Title & Add Button */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Team Management
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage administrative operators, role-based access controls, and team departmental assignments.
          </p>
        </div>

        <button
          onClick={() => setShowCreateModal(true)}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors self-start sm:self-auto"
        >
          <UserPlus className="w-3.5 h-3.5" />
          <span>Add Team Member</span>
        </button>
      </div>

      {/* Summary Stats Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Total Members</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {rawTeam.length}
          </div>
          <span className="text-[10px] text-emerald-500 font-medium">
            {activeCount} active now
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Platform Admins</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {adminCount}
          </div>
          <span className="text-[10px] text-indigo-500 font-medium">
            Full root privileges
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Staff Operators</span>
          <div className="text-xl font-bold text-slate-900 dark:text-white mt-1">
            {rawTeam.length - adminCount}
          </div>
          <span className="text-[10px] text-slate-400">
            Support & ops personnel
          </span>
        </div>

        <div className="p-4 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs">
          <span className="text-xs text-slate-500 dark:text-slate-400">Security Governance</span>
          <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400 mt-1">
            100%
          </div>
          <span className="text-[10px] text-slate-400">
            2FA policy compliant
          </span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="p-4 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="relative flex-1 max-w-md">
          <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
            <Search className="w-4 h-4" />
          </span>
          <input
            type="text"
            placeholder="Search by name, email, department..."
            value={searchQuery}
            onChange={e => {
              setSearchQuery(e.target.value);
              setCurrentPage(1);
            }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-800 dark:text-slate-100 border border-slate-200 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
          />
        </div>

        <div className="flex items-center gap-2">
          <select
            value={roleFilter}
            onChange={e => {
              setRoleFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
          >
            <option value="All">All Roles</option>
            <option value="Admin">Admin</option>
            <option value="Staff">Staff</option>
          </select>

          <select
            value={statusFilter}
            onChange={e => {
              setStatusFilter(e.target.value);
              setCurrentPage(1);
            }}
            className="px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800/80 text-slate-700 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl focus:outline-hidden"
          >
            <option value="All">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
      </div>

      {/* Team Table Card */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left">
            <thead className="bg-slate-50/80 dark:bg-slate-800/60 text-slate-500 dark:text-slate-400 font-semibold uppercase tracking-wider border-b border-slate-200/80 dark:border-slate-800">
              <tr>
                <th className="py-3 px-4">Member</th>
                <th className="py-3 px-4">Role & Department</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Last Active</th>
                <th className="py-3 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
              {pagedTeam.length === 0 ? (
                <tr>
                  <td colSpan={5} className="py-12 text-center text-slate-500 dark:text-slate-400">
                    <Users className="w-8 h-8 mx-auto mb-2 text-slate-400 opacity-60" />
                    <p className="font-semibold text-slate-700 dark:text-slate-300">No team members found</p>
                    <p className="text-[11px] mt-0.5">Try clearing your filters or adding a member.</p>
                  </td>
                </tr>
              ) : (
                pagedTeam.map(member => (
                  <tr
                    key={member.id}
                    className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors"
                  >
                    <td className="py-3.5 px-4 font-medium text-slate-900 dark:text-white">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-indigo-500 to-cyan-500 text-white font-bold flex items-center justify-center text-xs flex-shrink-0">
                          {member.name.charAt(0)}
                        </div>
                        <div>
                          <div className="font-semibold text-slate-900 dark:text-white">{member.name}</div>
                          <div className="text-[11px] text-slate-400 font-normal">{member.email}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-1.5">
                        <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          member.role === 'Admin'
                            ? 'bg-purple-100 text-purple-700 dark:bg-purple-950/60 dark:text-purple-300'
                            : 'bg-indigo-100 text-indigo-700 dark:bg-indigo-950/60 dark:text-indigo-300'
                        }`}>
                          <Shield className="w-2.5 h-2.5" />
                          {member.role}
                        </span>
                        <span className="text-[11px] text-slate-500 dark:text-slate-400">
                          {member.department || 'Operations'}
                        </span>
                      </div>
                    </td>

                    <td className="py-3.5 px-4">
                      <button
                        onClick={() => handleToggleStatus(member)}
                        className={`inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full border transition-colors ${
                          member.status === 'active'
                            ? 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800'
                            : 'bg-slate-100 text-slate-600 border-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:border-slate-700'
                        }`}
                        title="Click to toggle status"
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          member.status === 'active' ? 'bg-emerald-500' : 'bg-slate-400'
                        }`} />
                        {member.status}
                      </button>
                    </td>

                    <td className="py-3.5 px-4 text-slate-400 text-[11px] font-mono">
                      {member.lastActive.split('T')[0]}
                    </td>

                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button
                          onClick={() => setMemberToEdit(member)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Edit Member"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => setMemberToDelete(member)}
                          className="p-1.5 rounded-lg text-slate-400 hover:text-red-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="Remove Member"
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
            Showing <strong className="text-slate-800 dark:text-slate-200">{filteredTeam.length ? (currentPage - 1) * PAGE_SIZE + 1 : 0}</strong> to{' '}
            <strong className="text-slate-800 dark:text-slate-200">{Math.min(currentPage * PAGE_SIZE, filteredTeam.length)}</strong> of{' '}
            <strong className="text-slate-800 dark:text-slate-200">{filteredTeam.length}</strong> team members
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

      {/* CREATE MEMBER MODAL */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Invite Team Member"
      >
        <TeamMemberForm
          onSubmit={handleCreate}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* EDIT MEMBER MODAL */}
      <Modal
        open={!!memberToEdit}
        onClose={() => setMemberToEdit(null)}
        title={`Edit ${memberToEdit?.name || 'Member'}`}
      >
        {memberToEdit && (
          <TeamMemberForm
            member={memberToEdit}
            onSubmit={handleEdit}
            onCancel={() => setMemberToEdit(null)}
          />
        )}
      </Modal>

      {/* DELETE CONFIRMATION MODAL */}
      <Modal
        open={!!memberToDelete}
        onClose={() => setMemberToDelete(null)}
        title="Remove Team Member"
        maxWidth="md"
      >
        {memberToDelete && (
          <div className="p-6">
            <div className="flex items-center gap-3.5 mb-4 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Remove {memberToDelete.name}?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  This operator will lose console permissions and access immediately.
                </p>
              </div>
            </div>

            <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl text-xs text-slate-600 dark:text-slate-300 space-y-1 mb-6">
              <div><strong>Role:</strong> {memberToDelete.role}</div>
              <div><strong>Department:</strong> {memberToDelete.department || 'Operations'}</div>
              <div><strong>Email:</strong> {memberToDelete.email}</div>
            </div>

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => setMemberToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDelete}
                className="px-4 py-2 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-xl transition-colors"
              >
                Confirm Remove
              </button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}

// Subcomponent: Team Member Form
function TeamMemberForm({
  member,
  onSubmit,
  onCancel,
}: {
  member?: User;
  onSubmit: (data: Omit<User, 'id' | 'createdAt' | 'lastActive'>) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(member?.name || '');
  const [email, setEmail] = useState(member?.email || '');
  const [role, setRole] = useState<Role>(member?.role || 'Staff');
  const [department, setDepartment] = useState(member?.department || 'Executive Operations');
  const [status, setStatus] = useState<Status>(member?.status || 'active');
  const [plan, setPlan] = useState<PlanType>(member?.plan || 'Enterprise');
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Full name is required';
    if (!email.trim() || !email.includes('@')) newErrors.email = 'Valid corporate email is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    onSubmit({
      name: name.trim(),
      email: email.trim(),
      role,
      department: department.trim(),
      status,
      plan,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Full Name *
        </label>
        <input
          type="text"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
          placeholder="e.g. Elena Rostova"
        />
        {errors.name && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.name}</span>}
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Corporate Email *
        </label>
        <input
          type="email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
          placeholder="elena.rostova@veylo.demo"
        />
        {errors.email && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.email}</span>}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Console Role
          </label>
          <select
            value={role}
            onChange={e => setRole(e.target.value as Role)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden"
          >
            <option value="Admin">Admin (Full Control)</option>
            <option value="Staff">Staff (Operations)</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Department
          </label>
          <input
            type="text"
            value={department}
            onChange={e => setDepartment(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden"
            placeholder="e.g. Solutions Engineering"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Initial Status
          </label>
          <select
            value={status}
            onChange={e => setStatus(e.target.value as Status)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden"
          >
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Assigned Internal Tier
          </label>
          <select
            value={plan}
            onChange={e => setPlan(e.target.value as PlanType)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:outline-hidden"
          >
            <option value="Enterprise">Enterprise</option>
            <option value="Business">Business</option>
            <option value="Pro">Pro</option>
            <option value="Free">Free</option>
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
          {member ? 'Save Changes' : 'Invite Member'}
        </button>
      </div>
    </form>
  );
}
