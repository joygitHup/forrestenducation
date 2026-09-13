import { NextRequest, NextResponse } from 'next/server';
import { verifyLogin } from '@/services/org';

export async function POST(req: NextRequest) {
  const body = (await req.json().catch(() => ({}))) as { username?: string; password?: string };
  if (!body?.username || !body?.password) {
    return NextResponse.json({ success: false, error: '请填写用户名和密码' }, { status: 400 });
  }
  const user = verifyLogin(body.username, body.password);
  if (!user) {
    return NextResponse.json({ success: false, error: '用户名或密码错误' }, { status: 401 });
  }
  return NextResponse.json({
    success: true,
    data: { user, token: `mock-token-${user.id}-${Date.now()}` },
  });
}