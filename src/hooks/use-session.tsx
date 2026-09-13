// 轻量状态管理：mock 认证会话（演示环境使用 localStorage）
'use client';
import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { api } from '@/lib/api';
import type { AdminUser } from '@/types';

interface Session {
  user: AdminUser | null;
  token: string | null;
  loading: boolean;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
}

const SessionCtx = createContext<Session>({
  user: null,
  token: null,
  loading: true,
  login: async () => {},
  logout: () => {},
});

export function SessionProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    try {
      const u = localStorage.getItem('ranger_admin_user');
      const t = localStorage.getItem('ranger_admin_token');
      if (u) setUser(JSON.parse(u));
      if (t) setToken(t);
    } catch {
      /* ignore */
    }
    setLoading(false);
  }, []);

  const login = async (username: string, password: string) => {
    const res = await api<{ success: boolean; data: { user: AdminUser; token: string } }>('/api/auth/login', {
      method: 'POST',
      body: { username, password },
    });
    setUser(res.data.user);
    setToken(res.data.token);
    localStorage.setItem('ranger_admin_user', JSON.stringify(res.data.user));
    localStorage.setItem('ranger_admin_token', res.data.token);
  };

  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('ranger_admin_user');
    localStorage.removeItem('ranger_admin_token');
  };

  return (
    <SessionCtx.Provider value={{ user, token, loading, login, logout }}>{children}</SessionCtx.Provider>
  );
}

export function useSession() {
  return useContext(SessionCtx);
}