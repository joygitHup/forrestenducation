import { NextRequest, NextResponse } from 'next/server';
import { getWarnings } from '@/services/dashboard';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const warnings = getWarnings({
    type: sp.get('type') ?? '',
    status: sp.get('status') ?? '',
  });
  return NextResponse.json({ success: true, data: warnings });
}

export async function PUT(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { id?: number; status?: number };
  if (!body.id || body.status === undefined) {
    return NextResponse.json({ success: false, error: '预警ID与状态为必填项' }, { status: 400 });
  }
  const store = (await import('@/data/memoryDB')).store;
  const idx = store.warnings.findIndex(w => w.id === body.id);
  if (idx < 0) return NextResponse.json({ success: false, error: '未找到预警' }, { status: 404 });
  store.warnings[idx].status = body.status === 1 ? 1 : 0;
  return NextResponse.json({ success: true, data: store.warnings[idx] });
}