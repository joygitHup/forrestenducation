import { NextRequest, NextResponse } from 'next/server';
import { listRangers, createRanger } from '@/services/ranger';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = listRangers({
    keyword: sp.get('keyword') ?? '',
    townId: sp.get('townId') ? Number(sp.get('townId')) : undefined,
    status: sp.get('status') ?? '',
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    size: sp.get('size') ? Number(sp.get('size')) : 20,
  });
  return NextResponse.json({ success: true, data: result, total: result.total });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.phone || !body?.townId) {
    return NextResponse.json({ success: false, error: '姓名、手机号、乡镇为必填项' }, { status: 400 });
  }
  const exists = listRangers({ keyword: String(body.phone) }).total;
  if (exists > 0) {
    return NextResponse.json({ success: false, error: '手机号已存在' }, { status: 400 });
  }
  const ranger = createRanger(body);
  return NextResponse.json({ success: true, data: ranger }, { status: 201 });
}