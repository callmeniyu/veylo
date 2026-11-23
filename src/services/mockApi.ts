// src/services/mockApi.ts
/**
 * Backwards-compatibility adapter wrapping the centralized dataService.
 */
import {
  customerService,
  teamService,
  planService,
  analyticsService,
} from './dataService';
import type { User, Customer, PlanDef } from '../types';

export const api = {
  async listUsers(): Promise<User[]> {
    return teamService.getAll();
  },

  async getUser(id: number): Promise<User | null> {
    return teamService.getById(id);
  },

  async createUser(payload: Omit<User, 'id' | 'createdAt' | 'lastActive'>): Promise<User> {
    return teamService.create(payload);
  },

  async updateUser(id: number, patch: Partial<User>): Promise<User> {
    return teamService.update(id, patch);
  },

  async deactivateUser(id: number): Promise<User> {
    return teamService.update(id, { status: 'inactive' });
  },

  async activateUser(id: number): Promise<User> {
    return teamService.update(id, { status: 'active' });
  },

  async deleteUser(id: number): Promise<boolean> {
    return teamService.delete(id);
  },

  async getCustomers(): Promise<Customer[]> {
    return customerService.getAll();
  },

  async getCustomer(id: number): Promise<Customer | null> {
    return customerService.getById(id);
  },

  async createCustomer(payload: Omit<Customer, 'id' | 'createdAt' | 'lastActive'>): Promise<Customer> {
    return customerService.create(payload);
  },

  async updateCustomer(id: number, patch: Partial<Customer>): Promise<Customer> {
    return customerService.update(id, patch);
  },

  async deleteCustomer(id: number): Promise<boolean> {
    return customerService.delete(id);
  },

  async getUsage({ days = 30, plan }: { days?: number; plan?: string } = {}) {
    const points = analyticsService.getTimeSeries(days, plan);
    return { points };
  },

  async getPlans(): Promise<PlanDef[]> {
    return planService.getAll();
  },

  async updatePlan(id: string, patch: Partial<PlanDef>): Promise<PlanDef> {
    return planService.update(id, patch);
  },

  async createPlan(payload: PlanDef): Promise<PlanDef> {
    return planService.create(payload);
  },

  async deletePlan(id: string): Promise<boolean> {
    return planService.delete(id);
  },

  async restoreDefaultPlans(): Promise<PlanDef[]> {
    return planService.restoreDefaults();
  },
};
