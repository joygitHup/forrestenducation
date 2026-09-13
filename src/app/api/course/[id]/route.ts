import { NextRequest, NextResponse } from 'next/server';
import { updateCourse, getCourse } from '@/services/training';

type Ctx = { params: Promise<{ id: string }> };

export async function GET(_req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  const c = getCourse(id);
  if (!c) return NextResponse.json({ success: false, error: '未找到课程' }, { status: 404 });
  return NextResponse.json({ success: true, data: c });
}

export async function PUT(req: NextRequest, { params }: Ctx) {
  const id = Number((await params).id);
  const body = await req.json().catch(() => ({}));
  const updated = updateCourse(id, body);
  if (!updated) return NextResponse.json({ success: false, error: '未找到课程' }, { status: 404 });
  return NextResponse.json({ success: true, data: updated });
}