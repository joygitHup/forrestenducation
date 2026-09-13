import { NextResponse } from 'next/server';
import { deleteOrg } from '@/services/org';

type Ctx = { params: Promise<{ id: string }> };

export async function DELETE(_req: Request, { params }: Ctx) {
  const id = Number((await params).id);
  const result = deleteOrg(id);
  if (!result.ok) return NextResponse.json({ success: false, error: result.reason }, { status: 400 });
  return NextResponse.json({ success: true });
}