// 统一的 API 客户端：调用本项目自身后端接口（相对路径）
export type HttpMethod = 'GET' | 'POST' | 'PUT' | 'DELETE';

export async function api<T = unknown>(
  path: string,
  options?: { method?: HttpMethod; body?: unknown; query?: Record<string, string | number | undefined> },
): Promise<T> {
  let url: string = path;
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
  const json = await res.json().catch(() => ({}));
  if (!res.ok) {
    const msg = json.error ?? `请求失败(${res.status})`;
    throw new Error(msg);
  }
  return json as T;
}