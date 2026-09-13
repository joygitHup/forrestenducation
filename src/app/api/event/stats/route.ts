import { NextResponse } from 'next/server';
import { eventStats } from '@/services/event';

export async function GET() {
  return NextResponse.json({ success: true, data: eventStats() });
}