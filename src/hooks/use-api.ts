'use client';
import { useCallback, useEffect, useRef, useState } from 'react';
import { api } from '@/lib/api';

interface State<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
}

export function useApi<T>(path: string | null) {
  const [state, setState] = useState<State<T>>({ data: null, loading: !!path, error: null });

  const load = useCallback(
    async (p: string = path ?? '') => {
      setState(s => ({ ...s, loading: true, error: null }));
      try {
        const res = await api<T>(p);
        setState({ data: res, loading: false, error: null });
      } catch (e) {
        setState({ data: null, loading: false, error: e instanceof Error ? e.message : '请求失败' });
      }
    },
    [path],
  );

  useEffect(() => {
    if (path) load(path);
  }, [path, load]);

  return { ...state, reload: () => load() };
}

export function useApiMutate<T>(path: string) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const mutate = useCallback(
    async (method: 'POST' | 'PUT' | 'DELETE', body?: unknown) => {
      setLoading(true);
      setError(null);
      try {
        const res = await api<T>(path, { method, body });
        setLoading(false);
        return res;
      } catch (e) {
        setError(e instanceof Error ? e.message : '请求失败');
        setLoading(false);
        throw e;
      }
    },
    [path],
  );

  return { mutate, loading, error };
}