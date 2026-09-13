import { NextRequest, NextResponse } from 'next/server';
import { listAssessments, recomputeAssessments, getRules } from '@/services/assessment';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const result = listAssessments({
    year: sp.get('year') ? Number(sp.get('year')) : undefined,
    month: sp.get('month') ? Number(sp.get('month')) : undefined,
    townId: sp.get('townId') ? Number(sp.get('townId')) : undefined,
    page: sp.get('page') ? Number(sp.get('page')) : 1,
    size: sp.get('size') ? Number(sp.get('size')) : 200,
  });
  return NextResponse.json({ success: true, data: result });
}

// 手动触发考核重算（对应定时任务")
export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { year?: number; month?: number };
  const year = body.year ?? new Date().getFullYear();
  const month = body.month ?? new Date().getMonth() + 1;
  const computed = recomputeAssessments(year, month);
  return NextResponse.json({ success: true, data: { computed, year, month, rules: getRules() } });
}