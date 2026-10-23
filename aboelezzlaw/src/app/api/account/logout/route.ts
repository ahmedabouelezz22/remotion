import { NextResponse } from 'next/server';
import { requestOrigin } from '@/lib/origin';
import { endSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  await endSession();
  return NextResponse.redirect(new URL('/account', requestOrigin(request)), { status: 303 });
}
