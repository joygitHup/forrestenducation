import { NextRequest, NextResponse } from 'next/server';
import { getRanger, updateRanger, deleteRanger } from '@/services/ranger';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  const ranger = getRanger(id);
  if (!ranger) return NextResponse.json({ success: false, error: '未找到护林员' }, { status: 404 });
  return NextResponse.json({ success: true, data: ranger });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  const body = await req.json().catch(() => ({}));
  const updated = updateRanger(id, body);
  if (!updated) return NextResponse.json({ success: false, error: '未找到护林员' }, { status: 404 });
  return NextResponse.json({ success: true, data: updated });
}

export async function DELETE(_req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  const ok = deleteRanger(id);
  if (!ok) return NextResponse.json({ success: false, error: '未找到护林员' }, { status: 404 });
  return NextResponse.json({ success: true });
}