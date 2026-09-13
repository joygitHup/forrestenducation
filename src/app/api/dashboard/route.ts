import { NextResponse } from 'next/server';
import { getDashboard, getWarnings } from '@/services/dashboard';

export async function GET() {
  const stats = getDashboard();
  const warnings = getWarnings().slice(0, 5);
  return NextResponse.json({ success: true, data: { stats, warnings } });
}