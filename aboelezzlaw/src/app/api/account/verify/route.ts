import { NextResponse } from 'next/server';
import { startSession, verifyLoginToken } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  if (!token) {
    return NextResponse.redirect(new URL('/account?error=missing_token', url.origin));
  }

  const result = verifyLoginToken(token);
  if (!result.ok) {
    return NextResponse.redirect(
      new URL(`/account?error=${encodeURIComponent(result.error)}`, url.origin),
    );
  }

  await startSession(result.email);
  return NextResponse.redirect(new URL('/account', url.origin));
}
