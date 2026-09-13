import { NextRequest, NextResponse } from 'next/server';
import { listAreas, createArea } from '@/services/area';

export async function GET() {
  const areas = listAreas();
  return NextResponse.json({ success: true, data: areas });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || !body?.townId || !body?.boundary) {
    return NextResponse.json({ success: false, error: '区域名称、乡镇、边界为必填项' }, { status: 400 });
  }
  const area = createArea(body);
  return NextResponse.json({ success: true, data: area }, { status: 201 });
}