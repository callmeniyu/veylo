// src/services/dataService.ts
import {
  KEYS,
  CURRENT_SCHEMA_VERSION,
  getItem,
  setItem,
  clearVeyloStorage,
} from './storage';
import {
  SEED_CUSTOMERS,
  SEED_TEAM_MEMBERS,
  SEED_PLANS,
  SEED_ACTIVITY,
  SEED_SETTINGS,
} from '../data/seedData';
import type {
  Customer,
  User,
  PlanDef,
  ActivityItem,
  AppSettings,
  UsagePoint,
  PlanType,
  Status,
} from '../types';

/**
 * Event name dispatched when demo data is reset or deeply updated
 */
export const VEYLO_DATA_CHANGED_EVENT = 'veylo:data-changed';

export function notifyDataChanged() {
  if (typeof window !== 'undefined') {
    window.dispatchEvent(new CustomEvent(VEYLO_DATA_CHANGED_EVENT));
  }
}

/**
 * Initialize demo data in localStorage if absent, corrupt, or old schema.
 */
export function initDemoData(force = false): void {
  const version = getItem<number>(KEYS.SCHEMA_VERSION);

  // If force or not initialized or schema changed, initialize clean seed data
  if (force || version !== CURRENT_SCHEMA_VERSION) {
    // Preserve existing theme if present
    const existingTheme = getItem<string>(KEYS.THEME, 'light');

    // Clean any old controlly / old veylo data
    clearVeyloStorage();

    // Re-seed all entities
    setItem(KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
    setItem(KEYS.CUSTOMERS, SEED_CUSTOMERS);
    setItem(KEYS.TEAM, SEED_TEAM_MEMBERS);
    setItem(KEYS.PLANS, SEED_PLANS);
    setItem(KEYS.ACTIVITY, SEED_ACTIVITY);
    setItem(KEYS.SETTINGS, SEED_SETTINGS);
    setItem(KEYS.THEME, existingTheme);

    notifyDataChanged();
  }
}

/**
 * Reset demo data with confirmation, restoring original seed state while preserving auth session.
 */
export function resetDemoData(): void {
  const existingAuth = getItem(KEYS.AUTH);
  const existingTheme = getItem(KEYS.THEME, 'light');

  clearVeyloStorage();

  setItem(KEYS.SCHEMA_VERSION, CURRENT_SCHEMA_VERSION);
  setItem(KEYS.CUSTOMERS, SEED_CUSTOMERS);
  setItem(KEYS.TEAM, SEED_TEAM_MEMBERS);
  setItem(KEYS.PLANS, SEED_PLANS);
  setItem(KEYS.ACTIVITY, [
    {
      id: `act-reset-${Date.now()}`,
      timestamp: new Date().toISOString(),
      actor: 'admin@veylo.demo',
      action: 'Demo Environment Reset',
      target: 'Browser LocalStorage',
      category: 'system',
      details: 'All customer records, team members, plans, and metrics restored to initial seed state.',
    },
    ...SEED_ACTIVITY,
  ]);
  setItem(KEYS.SETTINGS, SEED_SETTINGS);
  setItem(KEYS.THEME, existingTheme);

  // Restore active auth session if present so user stays logged in
  if (existingAuth) {
    setItem(KEYS.AUTH, existingAuth);
  }

  notifyDataChanged();
}

// -------------------------------------------------------------
// CUSTOMER CRUD
// -------------------------------------------------------------

export const customerService = {
  getAll(): Customer[] {
    initDemoData();
    const data = getItem<Customer[]>(KEYS.CUSTOMERS);
    return Array.isArray(data) ? data : SEED_CUSTOMERS;
  },

  getById(id: number): Customer | null {
    const all = customerService.getAll();
    return all.find(c => c.id === id) ?? null;
  },

  create(payload: Omit<Customer, 'id' | 'createdAt' | 'lastActive'>): Customer {
    const all = customerService.getAll();
    const nextId = all.length > 0 ? Math.max(...all.map(c => c.id)) + 1 : 1;
    const now = new Date().toISOString();

    const newCustomer: Customer = {
      id: nextId,
      ...payload,
      createdAt: now,
      lastActive: now,
    };

    const updated = [newCustomer, ...all];
    setItem(KEYS.CUSTOMERS, updated);

    activityService.log(
      'admin@veylo.demo',
      'Customer Created',
      newCustomer.name,
      'customer',
      `Onboarded on ${newCustomer.plan} plan with ${newCustomer.seats} seats.`
    );

    notifyDataChanged();
    return newCustomer;
  },

  update(id: number, patch: Partial<Customer>): Customer {
    const all = customerService.getAll();
    const idx = all.findIndex(c => c.id === id);
    if (idx === -1) {
      throw new Error(`Customer with ID ${id} not found.`);
    }

    const updatedCustomer: Customer = {
      ...all[idx],
      ...patch,
      lastActive: new Date().toISOString(),
    };

    all[idx] = updatedCustomer;
    setItem(KEYS.CUSTOMERS, all);

    activityService.log(
      'admin@veylo.demo',
      'Customer Updated',
      updatedCustomer.name,
      'customer',
      `Updated properties: ${Object.keys(patch).join(', ')}`
    );

    notifyDataChanged();
    return updatedCustomer;
  },

  delete(id: number): boolean {
    const all = customerService.getAll();
    const target = all.find(c => c.id === id);
    if (!target) return false;

    const filtered = all.filter(c => c.id !== id);
    setItem(KEYS.CUSTOMERS, filtered);

    activityService.log(
      'admin@veylo.demo',
      'Customer Deleted',
      target.name,
      'customer',
      `Removed ${target.plan} organization profile.`
    );

    notifyDataChanged();
    return true;
  },

  getMetrics() {
    const list = customerService.getAll();
    const total = list.length;
    const active = list.filter(c => c.status === 'active').length;
    const totalSeats = list.reduce((sum, c) => sum + (c.seats || 0), 0);
    const totalMRR = list.reduce((sum, c) => sum + (c.mrr || 0), 0);
    const totalARR = totalMRR * 12;

    const planCounts: Record<PlanType, number> = {
      Free: 0,
      Pro: 0,
      Business: 0,
      Enterprise: 0,
    };

    const statusCounts: Record<Status, number> = {
      active: 0,
      inactive: 0,
      pending: 0,
    };

    list.forEach(c => {
      if (planCounts[c.plan] !== undefined) planCounts[c.plan]++;
      if (statusCounts[c.status] !== undefined) statusCounts[c.status]++;
    });

    const paidCount = list.filter(c => c.plan !== 'Free').length;
    const paidConversion = total > 0 ? Math.round((paidCount / total) * 100) : 0;

    return {
      total,
      active,
      totalSeats,
      totalMRR,
      totalARR,
      planCounts,
      statusCounts,
      paidConversion,
    };
  },
};

// -------------------------------------------------------------
// TEAM CRUD
// -------------------------------------------------------------

export const teamService = {
  getAll(): User[] {
    initDemoData();
    const data = getItem<User[]>(KEYS.TEAM);
    return Array.isArray(data) ? data : SEED_TEAM_MEMBERS;
  },

  getById(id: number): User | null {
    const all = teamService.getAll();
    return all.find(u => u.id === id) ?? null;
  },

  create(payload: Omit<User, 'id' | 'createdAt' | 'lastActive'>): User {
    const all = teamService.getAll();
    const nextId = all.length > 0 ? Math.max(...all.map(u => u.id)) + 1 : 1;
    const now = new Date().toISOString();

    const newMember: User = {
      id: nextId,
      ...payload,
      createdAt: now,
      lastActive: now,
      lastLogin: now,
    };

    const updated = [newMember, ...all];
    setItem(KEYS.TEAM, updated);

    activityService.log(
      'admin@veylo.demo',
      'Team Member Added',
      newMember.name,
      'team',
      `Assigned ${newMember.role} role in ${newMember.department ?? 'General'}.`
    );

    notifyDataChanged();
    return newMember;
  },

  update(id: number, patch: Partial<User>): User {
    const all = teamService.getAll();
    const idx = all.findIndex(u => u.id === id);
    if (idx === -1) {
      throw new Error(`Team member with ID ${id} not found.`);
    }

    all[idx] = { ...all[idx], ...patch };
    setItem(KEYS.TEAM, all);

    activityService.log(
      'admin@veylo.demo',
      'Team Member Updated',
      all[idx].name,
      'team',
      `Updated member properties: ${Object.keys(patch).join(', ')}`
    );

    notifyDataChanged();
    return all[idx];
  },

  toggleStatus(id: number): User {
    const all = teamService.getAll();
    const idx = all.findIndex(u => u.id === id);
    if (idx === -1) throw new Error(`User with ID ${id} not found.`);

    const newStatus: Status = all[idx].status === 'active' ? 'inactive' : 'active';
    all[idx].status = newStatus;
    setItem(KEYS.TEAM, all);

    activityService.log(
      'admin@veylo.demo',
      `Team Member ${newStatus === 'active' ? 'Activated' : 'Deactivated'}`,
      all[idx].name,
      'team',
      `Account state changed to ${newStatus}.`
    );

    notifyDataChanged();
    return all[idx];
  },

  delete(id: number): boolean {
    const all = teamService.getAll();
    const target = all.find(u => u.id === id);
    if (!target) return false;

    const filtered = all.filter(u => u.id !== id);
    setItem(KEYS.TEAM, filtered);

    activityService.log(
      'admin@veylo.demo',
      'Team Member Removed',
      target.name,
      'team',
      `Deleted team record (${target.email}).`
    );

    notifyDataChanged();
    return true;
  },
};

// -------------------------------------------------------------
// SUBSCRIPTION PLANS CRUD
// -------------------------------------------------------------

export const planService = {
  getAll(): PlanDef[] {
    initDemoData();
    const data = getItem<PlanDef[]>(KEYS.PLANS);
    return Array.isArray(data) ? data : SEED_PLANS;
  },

  getById(id: string): PlanDef | null {
    const all = planService.getAll();
    return all.find(p => p.id === id) ?? null;
  },

  create(payload: PlanDef): PlanDef {
    const all = planService.getAll();
    if (all.some(p => p.id.toLowerCase() === payload.id.toLowerCase())) {
      throw new Error(`A plan with ID "${payload.id}" already exists.`);
    }

    const updated = [...all, payload];
    setItem(KEYS.PLANS, updated);

    activityService.log(
      'admin@veylo.demo',
      'Subscription Plan Created',
      payload.name,
      'plan',
      `Created ${payload.name} tier priced at $${payload.price}/${payload.billingInterval}.`
    );

    notifyDataChanged();
    return payload;
  },

  update(id: string, patch: Partial<PlanDef>): PlanDef {
    const all = planService.getAll();
    const idx = all.findIndex(p => p.id === id);
    if (idx === -1) {
      throw new Error(`Plan with ID "${id}" not found.`);
    }

    all[idx] = { ...all[idx], ...patch };
    setItem(KEYS.PLANS, all);

    activityService.log(
      'admin@veylo.demo',
      'Subscription Plan Updated',
      all[idx].name,
      'plan',
      `Updated limits or pricing parameters.`
    );

    notifyDataChanged();
    return all[idx];
  },

  delete(id: string): boolean {
    const all = planService.getAll();
    const target = all.find(p => p.id === id);
    if (!target) return false;

    // Check if any customers currently reference this plan
    const customers = customerService.getAll();
    const isUsed = customers.some(c => c.plan.toLowerCase() === target.name.toLowerCase());
    if (isUsed) {
      throw new Error(`Cannot delete plan "${target.name}": active customer organizations are subscribed to it.`);
    }

    const filtered = all.filter(p => p.id !== id);
    setItem(KEYS.PLANS, filtered);

    activityService.log(
      'admin@veylo.demo',
      'Subscription Plan Deleted',
      target.name,
      'plan',
      `Archived and removed tier ${target.name}.`
    );

    notifyDataChanged();
    return true;
  },

  restoreDefaults(): PlanDef[] {
    setItem(KEYS.PLANS, SEED_PLANS);
    activityService.log(
      'admin@veylo.demo',
      'Subscription Plans Restored',
      'All Default Tiers',
      'plan',
      'Restored standard Free, Pro, Business, and Enterprise plans.'
    );
    notifyDataChanged();
    return SEED_PLANS;
  },
};

// -------------------------------------------------------------
// ACTIVITY LOG
// -------------------------------------------------------------

export const activityService = {
  getAll(limit?: number): ActivityItem[] {
    initDemoData();
    const items = getItem<ActivityItem[]>(KEYS.ACTIVITY);
    const list = Array.isArray(items) ? items : SEED_ACTIVITY;
    return limit ? list.slice(0, limit) : list;
  },

  log(
    actor: string,
    action: string,
    target: string,
    category: ActivityItem['category'],
    details?: string
  ): ActivityItem {
    const all = activityService.getAll();
    const newItem: ActivityItem = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      actor,
      action,
      target,
      category,
      details,
    };

    // Keep up to 100 log entries
    const updated = [newItem, ...all].slice(0, 100);
    setItem(KEYS.ACTIVITY, updated);
    return newItem;
  },

  clear(): void {
    setItem(KEYS.ACTIVITY, []);
    notifyDataChanged();
  },
};

// -------------------------------------------------------------
// SETTINGS
// -------------------------------------------------------------

export const settingsService = {
  get(): AppSettings {
    initDemoData();
    const settings = getItem<AppSettings>(KEYS.SETTINGS);
    return settings ?? SEED_SETTINGS;
  },

  update(patch: Partial<AppSettings>): AppSettings {
    const current = settingsService.get();
    const updated = { ...current, ...patch };
    setItem(KEYS.SETTINGS, updated);

    activityService.log(
      'admin@veylo.demo',
      'Settings Modified',
      'Application Configuration',
      'system',
      `Adjusted organization preferences.`
    );

    notifyDataChanged();
    return updated;
  },
};

// -------------------------------------------------------------
// PRODUCT ANALYTICS & TIME SERIES
// -------------------------------------------------------------

export const analyticsService = {
  /**
   * Deterministically computes time-series usage based on underlying customer seats.
   * Avoids random regeneration on every call by using fixed mathematical pseudo-random curve.
   */
  getTimeSeries(days = 30, planFilter?: string): UsagePoint[] {
    const customers = customerService.getAll();
    const filteredCustomers = planFilter && planFilter !== 'All'
      ? customers.filter(c => c.plan.toLowerCase() === planFilter.toLowerCase())
      : customers;

    const totalSeats = Math.max(
      10,
      filteredCustomers.reduce((sum, c) => sum + (c.seats || 0), 0)
    );

    const now = new Date();
    // Deterministic pseudo-random seed based on day offset
    const points: UsagePoint[] = [];

    for (let i = days - 1; i >= 0; i--) {
      const date = new Date(now.getTime() - i * 24 * 60 * 60 * 1000);
      const dayIndex = days - i;

      // Deterministic sinusoidal wave with gradual growth trend
      const progress = dayIndex / days;
      const weeklyCycle = Math.sin((dayIndex / 7) * Math.PI * 2) * 0.12;
      const baseRatio = 0.52 + progress * 0.18 + weeklyCycle;
      const boundedRatio = Math.max(0.25, Math.min(0.92, baseRatio));

      const users = Math.round(totalSeats * boundedRatio);
      const apiRequests = Math.round(users * 38.5 + (dayIndex % 5) * 120);
      const workflowsRun = Math.round(users * 3.2 + (dayIndex % 3) * 15);
      const reportsGenerated = Math.round(users * 0.8 + (dayIndex % 7) * 4);

      points.push({
        date: date.toISOString().split('T')[0],
        users,
        apiRequests,
        workflowsRun,
        reportsGenerated,
      });
    }

    return points;
  },
};
