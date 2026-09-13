import { NextRequest, NextResponse } from 'next/server';
import { getAdapter, listAdapters } from '@/external/adapters';

// 统一对接入口：POST /api/external/integrate  body: { system, action, payload }
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { system?: string; action?: string; payload?: Record<string, unknown> };
  if (!body.system) return NextResponse.json({ success: false, error: '缺少系统标识' }, { status: 400 });
  const adapter = getAdapter(body.system);
  if (!adapter) {
    return NextResponse.json({ success: false, error: `未找到系统「${body.system}」的适配器` }, { status: 404 });
  }
  const result =
    body.action === 'pull' && adapter.pull
      ? await adapter.pull(body.payload ?? {})
      : await adapter.push(body.payload ?? {});
  return NextResponse.json(result);
}