'use client';

import React, { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { loginWithEmail } from '@/lib/api';
import type { LoginResponse, User } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextType extends AuthState {
  login: (email: string) => Promise<void>;
  logout: () => void;
  error: string | null;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);
const STORAGE_KEY = 'insured_portal_auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null, token: null,
    isLoading: true, isAuthenticated: false,
  });
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const loadFromStorage = useCallback(() => {
    if (typeof window === 'undefined') return;
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const data = JSON.parse(stored);
        setState({
          user: data.user, token: data.token,
          isLoading: false, isAuthenticated: !!data.token,
        });
        return;
      }
    } catch {
      localStorage.removeItem(STORAGE_KEY);
    }
    setState((s) => ({ ...s, isLoading: false }));
  }, []);

  useEffect(() => { loadFromStorage(); }, [loadFromStorage]);

  const login = useCallback(async (email: string) => {
    setError(null);
    setState((s) => ({ ...s, isLoading: true }));
    try {
      const data: LoginResponse = await loginWithEmail(email);
      if (typeof window !== 'undefined') {
        localStorage.setItem(STORAGE_KEY, JSON.stringify({
          user: data.user, token: data.token,
        }));
      }
      setState({
        user: data.user, token: data.token,
        isLoading: false, isAuthenticated: true,
      });
      router.push('/dashboard');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
      setState((s) => ({ ...s, isLoading: false }));
      throw err;
    }
  }, [router]);

  const logout = useCallback(() => {
    if (typeof window !== 'undefined') localStorage.removeItem(STORAGE_KEY);
    setState({
      user: null, token: null,
      isLoading: false, isAuthenticated: false,
    });
    router.push('/login');
  }, [router]);

  return (
    <AuthContext.Provider value={{ ...state, login, logout, error, clearError: () => setError(null) }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
