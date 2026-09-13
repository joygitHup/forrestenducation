import { NextRequest, NextResponse } from 'next/server';
import { listEvents, createEvent } from '@/services/event';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = listEvents({
    status: sp.get('status') ?? '',
    type: sp.get('type') ?? '',
    townId: sp.get('townId') ? Number(sp.get('townId')) : undefined,
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    size: sp.get('size') ? Number(sp.get('size')) : 20,
  });
  return NextResponse.json({ success: true, data: result, total: result.total });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.type) {
    return NextResponse.json({ success: false, error: '事件类型为必填项' }, { status: 400 });
  }
  const event = createEvent(body);
  return NextResponse.json({ success: true, data: event }, { status: 201 });
}