import { NextRequest, NextResponse } from 'next/server';
import { getOrgTree, createOrg, listTowns, listVillages } from '@/services/org';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const kind = sp.get('kind');
  if (kind === 'town') return NextResponse.json({ success: true, data: listTowns() });
  if (kind === 'village') {
    return NextResponse.json({
      success: true,
      data: listVillages(sp.get('townId') ? Number(sp.get('townId')) : undefined),
    });
  }
  return NextResponse.json({ success: true, data: getOrgTree() });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.name || body.level === undefined) {
    return NextResponse.json({ success: false, error: '组织名称与层级为必填项' }, { status: 400 });
  }
  const org = createOrg(body);
  return NextResponse.json({ success: true, data: org }, { status: 201 });
}