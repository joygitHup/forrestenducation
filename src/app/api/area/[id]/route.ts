import { NextRequest, NextResponse } from 'next/server';
import { updateArea, deleteArea } from '@/services/area';

type Ctx = { params: Promise<{ id: string }> };

export async function PUT(req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  const body = await req.json().catch(() => ({}));
  const updated = updateArea(id, body);
  if (!updated) return NextResponse.json({ success: false, error: '未找到区域' }, { status: 404 });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  const ok = deleteArea(id);
  if (!ok) return NextResponse.json({ success: false, error: '区域被护林员引用或在删除中失败' }, { status: 400 });
  return NextResponse.json({ success: true });
}