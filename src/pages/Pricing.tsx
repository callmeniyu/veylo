// src/pages/Pricing.tsx
import { useState, useMemo, useEffect, useCallback } from 'react';
import {
  Plus,
  RotateCcw,
  Edit2,
  Trash2,
  Check,
  Layers,
  Users,
  HardDrive,
  Cpu,
  AlertCircle,
} from 'lucide-react';
import {
  planService,
  customerService,
  VEYLO_DATA_CHANGED_EVENT,
} from '../services/dataService';
import type { PlanDef, PlanLimits } from '../types';
import Modal from '../components/Modal';
import { useToast } from '../components/ToastProvider';

export default function Pricing() {
  const toast = useToast();
  const [plans, setPlans] = useState<PlanDef[]>(() => planService.getAll());
  const [customers, setCustomers] = useState(() => customerService.getAll());

  const refresh = useCallback(() => {
    setPlans(planService.getAll());
    setCustomers(customerService.getAll());
  }, []);

  useEffect(() => {
    window.addEventListener(VEYLO_DATA_CHANGED_EVENT, refresh);
    return () => window.removeEventListener(VEYLO_DATA_CHANGED_EVENT, refresh);
  }, [refresh]);

  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annual'>('monthly');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [planToEdit, setPlanToEdit] = useState<PlanDef | null>(null);
  const [planToDelete, setPlanToDelete] = useState<PlanDef | null>(null);

  // Compute stats for plans
  const planStats = useMemo(() => {
    const counts: Record<string, number> = {};
    customers.forEach(c => {
      counts[c.plan] = (counts[c.plan] || 0) + 1;
    });
    return counts;
  }, [customers]);

  const handleCreatePlan = (newPlan: PlanDef) => {
    try {
      planService.create(newPlan);
      setShowCreateModal(false);
      toast.add({
        kind: 'success',
        title: 'Plan Tier Created',
        message: `Configured new plan "${newPlan.name}".`,
      });
      refresh();
    } catch (err) {
      toast.add({
        kind: 'error',
        title: 'Creation Failed',
        message: err instanceof Error ? err.message : 'Could not create plan.',
      });
    }
  };

  const handleEditPlan = (patch: Partial<PlanDef>) => {
    if (!planToEdit) return;
    try {
      planService.update(planToEdit.id, patch);
      setPlanToEdit(null);
      toast.add({
        kind: 'success',
        title: 'Plan Updated',
        message: `Saved updates to "${patch.name || planToEdit.name}".`,
      });
      refresh();
    } catch (err) {
      toast.add({
        kind: 'error',
        title: 'Update Failed',
        message: err instanceof Error ? err.message : 'Could not update plan.',
      });
    }
  };

  const handleDeletePlan = () => {
    if (!planToDelete) return;
    try {
      planService.delete(planToDelete.id);
      setPlanToDelete(null);
      toast.add({
        kind: 'success',
        title: 'Plan Archived',
        message: `Plan "${planToDelete.name}" was removed.`,
      });
      refresh();
    } catch (err) {
      toast.add({
        kind: 'error',
        title: 'Delete Prevented',
        message: err instanceof Error ? err.message : 'Failed to delete plan.',
      });
    }
  };

  const handleRestoreDefaults = () => {
    planService.restoreDefaults();
    toast.add({
      kind: 'info',
      title: 'Default Plans Restored',
      message: 'Reinitialized standard Free, Pro, Business, and Enterprise plans.',
    });
    refresh();
  };

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
            Subscription Plans & Tiers
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Configure tier pricing, resource quotas, seat allocations, and feature entitlements.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <button
            onClick={handleRestoreDefaults}
            className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 rounded-xl border border-slate-200 dark:border-slate-700 transition-colors"
            title="Reset to default tiers"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Restore Defaults</span>
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-500 rounded-xl shadow-xs transition-colors"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Add Custom Tier</span>
          </button>
        </div>
      </div>

      {/* Interval Switcher */}
      <div className="flex items-center justify-center gap-3 py-2">
        <span className={`text-xs font-medium ${billingCycle === 'monthly' ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400'}`}>
          Monthly Billing
        </span>
        <button
          onClick={() => setBillingCycle(c => (c === 'monthly' ? 'annual' : 'monthly'))}
          className="relative inline-flex h-6 w-11 items-center rounded-full bg-slate-300 dark:bg-slate-700 transition-colors focus:outline-hidden"
        >
          <span
            className={`inline-block h-4 w-4 transform rounded-full bg-white dark:bg-indigo-400 transition-transform ${
              billingCycle === 'annual' ? 'translate-x-6' : 'translate-x-1'
            }`}
          />
        </button>
        <div className="flex items-center gap-1.5">
          <span className={`text-xs font-medium ${billingCycle === 'annual' ? 'text-slate-900 dark:text-white font-semibold' : 'text-slate-400'}`}>
            Annual Billing
          </span>
          <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 dark:bg-emerald-950/60 dark:text-emerald-300 font-bold border border-emerald-200 dark:border-emerald-800">
            Save up to 20%
          </span>
        </div>
      </div>

      {/* Plans Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-6">
        {plans.map((plan: PlanDef) => {
          const displayPrice = billingCycle === 'annual' ? Math.round(plan.annualPrice / 12) : plan.price;
          const subscriberCount = planStats[plan.name] || 0;

          return (
            <div
              key={plan.id}
              className={`relative flex flex-col justify-between p-6 rounded-2xl bg-white dark:bg-slate-900 border transition-all ${
                plan.popular
                  ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-lg'
                  : 'border-slate-200/80 dark:border-slate-800 shadow-xs'
              }`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                  <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-600 text-white shadow-xs">
                    Most Popular
                  </span>
                </div>
              )}

              <div>
                {/* Header */}
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                      {plan.name}
                    </h3>
                    <span className="text-[11px] text-slate-400">
                      {subscriberCount} active subscribers
                    </span>
                  </div>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => setPlanToEdit(plan)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Edit Tier"
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => setPlanToDelete(plan)}
                      className="p-1.5 rounded-lg text-slate-400 hover:text-rose-500 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                      title="Delete Tier"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>

                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed mb-5 min-h-[36px]">
                  {plan.description}
                </p>

                {/* Price Display */}
                <div className="mb-6 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800/80">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl font-extrabold text-slate-900 dark:text-white">
                      ${displayPrice}
                    </span>
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      / seat / month
                    </span>
                  </div>
                  {billingCycle === 'annual' && plan.annualPrice > 0 && (
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      Billed annually at ${plan.annualPrice}/yr
                    </span>
                  )}
                </div>

                {/* Quotas & Limits */}
                <div className="space-y-2 mb-6 text-xs text-slate-600 dark:text-slate-300">
                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Users className="w-3.5 h-3.5 text-indigo-500" />
                      Seat Capacity
                    </span>
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {plan.limits.seats} seats
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Layers className="w-3.5 h-3.5 text-sky-500" />
                      Active Projects
                    </span>
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {plan.limits.projects === -1 ? 'Unlimited' : plan.limits.projects}
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <HardDrive className="w-3.5 h-3.5 text-purple-500" />
                      Storage Limit
                    </span>
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {plan.limits.storageGb} GB
                    </strong>
                  </div>

                  <div className="flex items-center justify-between py-1 border-b border-slate-100 dark:border-slate-800/60">
                    <span className="flex items-center gap-1.5 text-slate-500">
                      <Cpu className="w-3.5 h-3.5 text-emerald-500" />
                      API Volume
                    </span>
                    <strong className="text-slate-900 dark:text-white font-mono">
                      {plan.limits.apiCallsPerDay.toLocaleString()} / day
                    </strong>
                  </div>
                </div>

                {/* Feature Checklist */}
                <div className="space-y-2 mb-6">
                  <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-1">
                    Entitlements
                  </span>
                  {plan.features.map((feature, idx) => (
                    <div key={idx} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                      <Check className="w-3.5 h-3.5 text-emerald-500 mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Bottom Card Action */}
              <button
                type="button"
                onClick={() => setPlanToEdit(plan)}
                className="w-full mt-2 py-2 px-3 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 rounded-xl transition-colors text-center"
              >
                Configure Limits & Pricing
              </button>
            </div>
          );
        })}
      </div>

      {/* CREATE PLAN MODAL */}
      <Modal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Create New Subscription Tier"
      >
        <PlanForm
          onSubmit={handleCreatePlan}
          onCancel={() => setShowCreateModal(false)}
        />
      </Modal>

      {/* EDIT PLAN MODAL */}
      <Modal
        open={!!planToEdit}
        onClose={() => setPlanToEdit(null)}
        title={`Edit Plan: ${planToEdit?.name || ''}`}
      >
        {planToEdit && (
          <PlanForm
            plan={planToEdit}
            onSubmit={handleEditPlan}
            onCancel={() => setPlanToEdit(null)}
          />
        )}
      </Modal>

      {/* DELETE PLAN CONFIRMATION MODAL */}
      <Modal
        open={!!planToDelete}
        onClose={() => setPlanToDelete(null)}
        title="Archive Subscription Tier"
        maxWidth="md"
      >
        {planToDelete && (
          <div className="p-6">
            <div className="flex items-center gap-3.5 mb-4 text-rose-600 dark:text-rose-400">
              <div className="w-10 h-10 rounded-xl bg-rose-100 dark:bg-rose-950/60 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
              <div>
                <h4 className="text-base font-bold text-slate-900 dark:text-white">
                  Archive {planToDelete.name} Tier?
                </h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">
                  {planStats[planToDelete.name] > 0
                    ? `Warning: ${planStats[planToDelete.name]} active customer organizations are subscribed to this tier.`
                    : 'This tier will be permanently removed from catalog.'}
                </p>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 mt-6">
              <button
                type="button"
                onClick={() => setPlanToDelete(null)}
                className="px-4 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl hover:bg-slate-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleDeletePlan}
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

// Subcomponent: Plan Form
function PlanForm({
  plan,
  onSubmit,
  onCancel,
}: {
  plan?: PlanDef;
  onSubmit: (data: PlanDef) => void;
  onCancel: () => void;
}) {
  const [name, setName] = useState(plan?.name || '');
  const [id, setId] = useState(plan?.id || '');
  const [price, setPrice] = useState<number>(plan?.price || 0);
  const [annualPrice, setAnnualPrice] = useState<number>(plan?.annualPrice || 0);
  const [description, setDescription] = useState(plan?.description || '');
  const [popular, setPopular] = useState(plan?.popular || false);

  const [seats, setSeats] = useState<number>(plan?.limits.seats || 25);
  const [projects, setProjects] = useState<number>(plan?.limits.projects || 25);
  const [storageGb, setStorageGb] = useState<number>(plan?.limits.storageGb || 50);
  const [apiCallsPerDay, setApiCallsPerDay] = useState<number>(plan?.limits.apiCallsPerDay || 10000);

  const [featuresStr, setFeaturesStr] = useState((plan?.features || []).join('\n'));
  const [errors, setErrors] = useState<Record<string, string>>({});

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const newErrors: Record<string, string> = {};

    if (!name.trim()) newErrors.name = 'Plan name is required';
    const computedId = id.trim() || name.toLowerCase().replace(/[^a-z0-9]/g, '-');
    if (!computedId) newErrors.id = 'Valid plan identifier is required';

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    const features = featuresStr
      .split('\n')
      .map(f => f.trim())
      .filter(f => f.length > 0);

    const limits: PlanLimits = {
      seats: Number(seats),
      projects: Number(projects),
      storageGb: Number(storageGb),
      apiCallsPerDay: Number(apiCallsPerDay),
    };

    onSubmit({
      ...(plan || {}),
      id: computedId,
      name: name.trim(),
      price: Number(price),
      annualPrice: Number(annualPrice),
      billingInterval: 'monthly',
      description: description.trim() || 'Custom plan tier.',
      popular,
      status: 'active',
      limits,
      features,
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Plan Name *
          </label>
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
            placeholder="e.g. Enterprise Plus"
          />
          {errors.name && <span className="text-[10px] text-rose-500 mt-0.5 block">{errors.name}</span>}
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Plan Identifier (ID)
          </label>
          <input
            type="text"
            value={id}
            onChange={e => setId(e.target.value)}
            disabled={!!plan}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden disabled:opacity-50"
            placeholder="e.g. enterprise-plus"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Monthly Price ($/mo)
          </label>
          <input
            type="number"
            min={0}
            value={price}
            onChange={e => setPrice(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden font-mono"
          />
        </div>

        <div>
          <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
            Annual Price ($/yr)
          </label>
          <input
            type="number"
            min={0}
            value={annualPrice}
            onChange={e => setAnnualPrice(Number(e.target.value))}
            className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden font-mono"
          />
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Plan Description
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={e => setDescription(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
          placeholder="Brief summary of who this plan is intended for..."
        />
      </div>

      <div className="pt-2 border-t border-slate-100 dark:border-slate-800">
        <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block mb-3">
          Resource Limits
        </span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">Seats</label>
            <input
              type="number"
              value={seats}
              onChange={e => setSeats(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">Projects (-1 unlim)</label>
            <input
              type="number"
              value={projects}
              onChange={e => setProjects(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">Storage (GB)</label>
            <input
              type="number"
              value={storageGb}
              onChange={e => setStorageGb(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>
          <div>
            <label className="block text-[11px] text-slate-500 mb-1">API Calls / Day</label>
            <input
              type="number"
              value={apiCallsPerDay}
              onChange={e => setApiCallsPerDay(Number(e.target.value))}
              className="w-full px-2.5 py-1.5 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-lg font-mono"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-xs font-medium text-slate-700 dark:text-slate-300 mb-1">
          Features List (one feature per line)
        </label>
        <textarea
          rows={3}
          value={featuresStr}
          onChange={e => setFeaturesStr(e.target.value)}
          className="w-full px-3 py-2 text-xs bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white border border-slate-300 dark:border-slate-700 rounded-xl focus:border-indigo-500 focus:outline-hidden"
          placeholder="Up to 5 team members&#10;Basic analytics&#10;Community support"
        />
      </div>

      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="isPopular"
          checked={popular}
          onChange={e => setPopular(e.target.checked)}
          className="w-4 h-4 rounded text-indigo-600 focus:ring-indigo-500"
        />
        <label htmlFor="isPopular" className="text-xs text-slate-700 dark:text-slate-300 font-medium">
          Highlight as &ldquo;Most Popular&rdquo; badge
        </label>
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
          {plan ? 'Save Changes' : 'Create Plan'}
        </button>
      </div>
    </form>
  );
}
