import { NextResponse } from 'next/server';
import { endAdminSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  await endAdminSession();
  return NextResponse.redirect(new URL('/admin/login', new URL(request.url).origin), 303);
}
