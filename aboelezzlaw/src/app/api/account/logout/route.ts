import { NextResponse } from 'next/server';
import { endSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  await endSession();
  return NextResponse.redirect(new URL('/account', new URL(request.url).origin), { status: 303 });
}
