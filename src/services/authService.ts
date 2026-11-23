// src/services/authService.ts
import { KEYS, getItem, setItem, removeItem } from './storage';
import { activityService } from './dataService';
import type { AuthSession, Role } from '../types';

export const DEMO_CREDENTIALS = {
  email: 'admin@veylo.demo',
  password: 'VeyloDemo123',
  name: 'Admin Demo User',
  role: 'Admin' as Role,
};

export const authService = {
  getSession(): AuthSession | null {
    return getItem<AuthSession>(KEYS.AUTH, null);
  },

  isAuthenticated(): boolean {
    const session = authService.getSession();
    return !!session && !!session.email;
  },

  login(email: string, pass: string): { success: boolean; error?: string; session?: AuthSession } {
    const cleanEmail = email.trim().toLowerCase();
    const cleanPass = pass.trim();

    // Check against standard Demo Admin credentials
    if (cleanEmail === DEMO_CREDENTIALS.email.toLowerCase() && cleanPass === DEMO_CREDENTIALS.password) {
      const session: AuthSession = {
        email: DEMO_CREDENTIALS.email,
        name: DEMO_CREDENTIALS.name,
        role: DEMO_CREDENTIALS.role,
        loginAt: new Date().toISOString(),
      };

      setItem(KEYS.AUTH, session);
      activityService.log(
        session.email,
        'Admin Signed In',
        'Demo Console',
        'auth',
        'Authenticated using demo administrator credentials.'
      );

      return { success: true, session };
    }

    return {
      success: false,
      error: 'Invalid credentials. Please click "Use Demo Credentials" or check the sample values.',
    };
  },

  logout(): void {
    const current = authService.getSession();
    if (current) {
      activityService.log(
        current.email,
        'Admin Signed Out',
        'Demo Console',
        'auth',
        'User ended browser session.'
      );
    }
    removeItem(KEYS.AUTH);
  },

  loginWithDemoAdmin(): AuthSession {
    const session: AuthSession = {
      email: DEMO_CREDENTIALS.email,
      name: DEMO_CREDENTIALS.name,
      role: DEMO_CREDENTIALS.role,
      loginAt: new Date().toISOString(),
    };
    setItem(KEYS.AUTH, session);
    activityService.log(
      session.email,
      'Admin Quick Signed In',
      'Demo Console',
      'auth',
      'Authenticated via one-click demo access.'
    );
    return session;
  },
};
