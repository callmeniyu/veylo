// src/contexts/AuthContext.tsx
import { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { authService, DEMO_CREDENTIALS } from '../services/authService';
import type { AuthSession } from '../types';

interface AuthContextType {
  user: AuthSession | null;
  isAuthenticated: boolean;
  loading: boolean;
  login: (email: string, password: string) => { success: boolean; error?: string };
  quickDemoLogin: () => void;
  logout: () => void;
  demoCredentials: typeof DEMO_CREDENTIALS;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<AuthSession | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshSession = useCallback(() => {
    const session = authService.getSession();
    setUser(session);
    setLoading(false);
  }, []);

  useEffect(() => {
    refreshSession();

    // Listen for storage changes in case of multi-tab or reset
    const handleStorage = (e: StorageEvent) => {
      if (!e.key || e.key.includes('auth')) {
        refreshSession();
      }
    };
    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [refreshSession]);

  const login = (email: string, pass: string) => {
    const res = authService.login(email, pass);
    if (res.success && res.session) {
      setUser(res.session);
    }
    return res;
  };

  const quickDemoLogin = () => {
    const session = authService.loginWithDemoAdmin();
    setUser(session);
  };

  const logout = () => {
    authService.logout();
    setUser(null);
  };

  const value: AuthContextType = {
    user,
    isAuthenticated: !!user,
    loading,
    login,
    quickDemoLogin,
    logout,
    demoCredentials: DEMO_CREDENTIALS,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
