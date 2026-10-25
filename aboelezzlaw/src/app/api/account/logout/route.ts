import { NextResponse } from 'next/server';
import { defaultLocale, isLocale } from '@/content/i18n';
import { requestOrigin } from '@/lib/origin';
import { endSession } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  await endSession();

  // النموذج يمرّر لغة الصفحة، فيعود الزائر إلى نفس لغتها بعد الخروج
  const raw = new URL(request.url).searchParams.get('locale') ?? '';
  const locale = isLocale(raw) ? raw : defaultLocale;

  return NextResponse.redirect(new URL(`/${locale}/account`, requestOrigin(request)), {
    status: 303,
  });
}
