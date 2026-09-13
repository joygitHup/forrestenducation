import { NextRequest, NextResponse } from 'next/server';
import { getEvent, handleEvent } from '@/services/event';
import type { EventStatus } from '@/types';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  const ev = getEvent(id);
  if (!ev) return NextResponse.json({ success: false, error: '未找到事件' }, { status: 404 });
  return NextResponse.json({ success: true, data: ev });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  const body = (await req.json().catch(() => ({}))) as { status?: number; note?: string; handlerName?: string };
  if (body.status === undefined) {
    return NextResponse.json({ success: false, error: '处理状态为必填项' }, { status: 400 });
  }
  const updated = handleEvent(id, {
    status: body.status as EventStatus,
    note: body.note,
    handlerName: body.handlerName,
  });
  if (!updated) return NextResponse.json({ success: false, error: '未找到事件' }, { status: 404 });
  return NextResponse.json({ success: true, data: updated });
}