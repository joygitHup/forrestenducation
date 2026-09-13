import { NextRequest, NextResponse } from 'next/server';
import { listCourses, createCourse } from '@/services/training';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  return NextResponse.json({
    success: true,
    data: listCourses({ status: sp.get('status') ?? '' }),
  });
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null);
  if (!body?.title || !body?.type) {
    return NextResponse.json({ success: false, error: '课程标题与类型为必填项' }, { status: 400 });
  }
  const course = createCourse(body);
  return NextResponse.json({ success: true, data: course }, { status: 201 });
}