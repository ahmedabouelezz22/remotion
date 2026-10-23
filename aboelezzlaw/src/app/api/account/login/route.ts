import { NextResponse } from 'next/server';
import { z } from 'zod';
import { site } from '@/content/site';
import { isDbConfigured } from '@/lib/db';
import { sendEmail } from '@/lib/notifications/email';
import { buildClientConfirmation } from '@/lib/notifications/templates';
import { requestOrigin } from '@/lib/origin';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { recentLoginTokenCount, recordLoginToken } from '@/lib/repository';
import { LOGIN_LINK_TTL_MINUTES, createLoginToken, isAuthConfigured } from '@/lib/session';
import { localeFrom } from '@/lib/validation';
import { dict, type Locale } from '@/content/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = (locale: Locale) =>
  z.object({
    email: z.string().trim().email(dict(locale).validation.emailInvalid),
    locale: z.enum(['ar', 'en']).optional(),
  });

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json(
      { ok: false, message: dict('ar').api.badRequest },
      { status: 400 },
    );
  }

  const locale = localeFrom(payload);
  const t = dict(locale).api;

  if (!isAuthConfigured() || !isDbConfigured()) {
    return NextResponse.json({ ok: false, message: t.accountNotConfigured }, { status: 503 });
  }

  const ip = clientIp(request);

  const limit = rateLimit(`login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, message: t.accountTooMany }, { status: 429 });
  }

  const parsed = schema(locale).safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? t.checkInputs },
      { status: 400 },
    );
  }

  const { email } = parsed.data;

  // الكبح في الذاكرة لا يصمد على serverless (كل نسخة ذاكرتها الخاصة)، فنكبح
  // أيضاً من القاعدة: عدد الرموز الصادرة فعلاً لهذا البريد أو العنوان.
  const recent = await recentLoginTokenCount({ email, ip }, 15);
  if (recent >= 5) {
    return NextResponse.json({ ok: false, message: t.accountTooMany }, { status: 429 });
  }

  const login = createLoginToken(email);

  // التسجيل قبل الإرسال: رمز لم يُسجَّل يُرفض عند التحقّق، فالفشل هنا آمن
  const recorded = await recordLoginToken({
    jti: login.jti,
    email: email.trim().toLowerCase(),
    ip,
    expiresAt: login.expiresAt,
  });
  if (!recorded) {
    console.error('[account-login] تعذّر تسجيل رمز الدخول — لن يُرسل الرابط');
    return NextResponse.json({ ok: false, message: t.accountNotConfigured }, { status: 503 });
  }

  const link = `${requestOrigin(request)}/api/account/verify?token=${encodeURIComponent(
    login.token,
  )}`;

  const loginEmail = dict(locale).loginEmail;
  const message = buildClientConfirmation({
    name: email.split('@')[0] ?? '',
    heading: loginEmail.heading,
    body: loginEmail.body(link, LOGIN_LINK_TTL_MINUTES),
  });

  const result = await sendEmail({
    to: email,
    subject: `${dict(locale).common.firmShort} — ${loginEmail.heading}`,
    html: message.html,
    text: message.text,
    replyTo: site.contact.email,
  });

  if (!result.ok) {
    console.error('[account-login] تعذّر إرسال رابط الدخول', result.error);
    return NextResponse.json({ ok: false, message: t.accountLinkFailed }, { status: 502 });
  }

  // لا نكشف إن كان للبريد حساب أم لا — الرسالة واحدة في الحالتين
  return NextResponse.json({ ok: true, message: t.accountLinkSent(LOGIN_LINK_TTL_MINUTES) });
}
