import { NextRequest, NextResponse } from 'next/server';
import { listStudyRecords, studyStats } from '@/services/training';

export async function GET(req: NextRequest) {
  const sp = req.nextUrl.searchParams;
  const records = listStudyRecords({
    courseId: sp.get('courseId') ? Number(sp.get('courseId')) : undefined,
    rangerId: sp.get('rangerId') ? Number(sp.get('rangerId')) : undefined,
  });
  return NextResponse.json({ success: true, data: { records, stats: studyStats() } });
}