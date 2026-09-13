import { NextRequest, NextResponse } from 'next/server';
import { getRules, saveRule } from '@/services/assessment';

export async function GET() {
  return NextResponse.json({ success: true, data: getRules() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name) return NextResponse.json({ success: false, error: '规则名称为必填项' }, { status: 400 });
  const rule = saveRule(body);
  return NextResponse.json({ success: true, data: rule });
}