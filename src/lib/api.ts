// 对接 Django+DRF：标准信封 {code,message,data}，页面仍按 {success,data} 读取
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

const API_ROOT = (process.env.NEXT_PUBLIC_API_BASE ?? 'http://127.0.0.1:8000').replace(/\/$/, '');

function toBackendUrl(path: string): string {
  const [pathname, query = ''] = path.split('?');
  const versioned = pathname.startsWith('/api/v1') ? pathname : pathname.replace(/^\/api/, '/api/v1');
  const withSlash = versioned.endsWith('/') ? versioned : `${versioned}/`;
  return query ? `${API_ROOT}${withSlash}?${query}` : `${API_ROOT}${withSlash}`;
}

function normalize<T>(json: Record<string, unknown>, status: number): T {
  if (typeof json.code === 'number') {
    const success = json.code === 0;
    const adapted = {
      success,
      data: json.data,
      error: json.message,
      total: (json.data as { total?: number } | undefined)?.total,
      ...json,
    };
    if (!success && status >= 400) {
      throw new Error(String(json.message || `请求失败(${status})`));
    }
    return adapted as T;
  }
  if (status >= 400) {
    throw new Error(String(json.error || json.message || `请求失败(${status})`));
  }
  return json as T;
}

export async function api<T = unknown>(
  path: string,
  options?: { method?: HttpMethod; body?: unknown; query?: Record<string, string | number | undefined> },
): Promise<T> {
  let url = toBackendUrl(path);
  if (options?.query) {
    const sp = new URLSearchParams();
    Object.entries(options.query).forEach(([k, v]) => {
      if (v !== undefined && v !== '' && v !== null) sp.set(k, String(v));
    });
    const qs = sp.toString();
    if (qs) url += `?${qs}`;
  }
  const res = await fetch(url, {
    method: options?.method ?? 'GET',
    headers: options?.body ? { 'Content-Type': 'application/json' } : undefined,
    body: options?.body ? JSON.stringify(options.body) : undefined,
    cache: 'no-store',
  });
  const json = (await res.json().catch(() => ({}))) as Record<string, unknown>;
  if (!res.ok && typeof json.code !== 'number') {
    throw new Error(String(json.error || json.message || `请求失败(${res.status})`));
  }
  return normalize<T>(json, res.status);
}
