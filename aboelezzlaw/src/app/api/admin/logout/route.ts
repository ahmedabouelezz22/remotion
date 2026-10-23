import { NextResponse } from 'next/server';
import { requestOrigin } from '@/lib/origin';
import { endAdminSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  await endAdminSession();
  return NextResponse.redirect(new URL('/ar/admin/login', requestOrigin(request)), 303);
}
