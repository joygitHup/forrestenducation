import { NextResponse } from 'next/server';
import { listAdminUsers } from '@/services/org';

export async function GET() {
  return NextResponse.json({ success: true, data: listAdminUsers() });
}