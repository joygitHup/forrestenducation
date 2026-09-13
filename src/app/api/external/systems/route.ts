import { NextResponse } from 'next/server';
import { listExternalSystems, setSystemEnabled, getSystemBySlug } from '@/services/org';
import { listAdapters } from '@/external/adapters';

export async function GET() {
  const adapterSlugs = new Set(listAdapters().map(a => a.slug));
  const data = listExternalSystems().map(s => ({ ...s, hasAdapter: adapterSlugs.has(s.slug) }));
  return NextResponse.json({ success: true, data });
}

export async function PUT(req: Request) {
  const body = await req.json().catch(() => null);
  if (!body?.slug || typeof body.enabled !== 'boolean') {
    return NextResponse.json({ success: false, error: '参数错误：需 slug 与 enabled' }, { status: 400 });
  }
  const sys = getSystemBySlug(body.slug);
  if (!sys) {
    return NextResponse.json({ success: false, error: `未找到系统：${body.slug}` }, { status: 404 });
  }
  setSystemEnabled(body.slug, body.enabled);
  return NextResponse.json({ success: true, data: getSystemBySlug(body.slug) });
}