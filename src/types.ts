// src/types.ts

export type Role = 'Admin' | 'Staff';
export type PlanType = 'Free' | 'Pro' | 'Business' | 'Enterprise';
export type Status = 'active' | 'inactive' | 'pending';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  department?: string;
  status: Status;
  plan?: PlanType;
  lastLogin?: string;
  lastActive: string;
  createdAt: string;
}

export interface Customer {
  id: number;
  name: string;
  contactPerson: string;
  email: string;
  phone: string;
  plan: PlanType;
  seats: number;
  status: Status;
  mrr: number;
  industry: string;
  country: string;
  createdAt: string;
  lastActive: string;
}

export interface PlanLimits {
  projects: number; // -1 for unlimited
  seats: number;
  storageGb: number;
  apiCallsPerDay: number;
}

export interface PlanDef {
  id: string;
  name: string;
  price: number;
  annualPrice: number;
  billingInterval: 'monthly' | 'annual';
  description: string;
  popular?: boolean;
  status: 'active' | 'archived';
  limits: PlanLimits;
  features: string[];
}

export interface ActivityItem {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  category: 'customer' | 'team' | 'plan' | 'auth' | 'system';
  details?: string;
}

export interface UsagePoint {
  date: string;
  users: number;
  apiRequests: number;
  workflowsRun: number;
  reportsGenerated: number;
}

export interface AppSettings {
  organizationName: string;
  supportEmail: string;
  currency: string;
  timezone: string;
  compactView: boolean;
  notificationsEnabled: boolean;
  dateFormat: string;
}

export interface AuthSession {
  email: string;
  name: string;
  role: Role;
  loginAt: string;
}
