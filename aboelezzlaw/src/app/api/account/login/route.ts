import { NextResponse } from 'next/server';
import { z } from 'zod';
import { site } from '@/content/site';
import { isDbConfigured } from '@/lib/db';
import { sendEmail } from '@/lib/notifications/email';
import { buildClientConfirmation } from '@/lib/notifications/templates';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { recentLoginTokenCount, recordLoginToken } from '@/lib/repository';
import { LOGIN_LINK_TTL_MINUTES, createLoginToken, isAuthConfigured } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ email: z.string().trim().email('البريد الإلكتروني غير صحيح') });

export async function POST(request: Request) {
  if (!isAuthConfigured() || !isDbConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'خدمة الحساب غير مهيّأة على هذا الموقع بعد.' },
      { status: 503 },
    );
  }

  const ip = clientIp(request);

  const limit = rateLimit(`login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: 'طلبات كثيرة. حاول بعد قليل.' },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'صيغة الطلب غير صحيحة.' }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? 'البريد غير صحيح.' },
      { status: 400 },
    );
  }

  const { email } = parsed.data;

  // الكبح في الذاكرة لا يصمد على serverless (كل نسخة ذاكرتها الخاصة)، فنكبح
  // أيضاً من القاعدة: عدد الرموز الصادرة فعلاً لهذا البريد أو العنوان.
  const recent = await recentLoginTokenCount({ email, ip }, 15);
  if (recent >= 5) {
    return NextResponse.json(
      { ok: false, message: 'طلبات كثيرة لرابط الدخول. حاول بعد ربع ساعة.' },
      { status: 429 },
    );
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
    return NextResponse.json(
      { ok: false, message: 'خدمة الحساب غير متاحة حالياً. حاول لاحقاً.' },
      { status: 503 },
    );
  }

  const link = `${new URL(request.url).origin}/api/account/verify?token=${encodeURIComponent(
    login.token,
  )}`;

  const message = buildClientConfirmation({
    name: email.split('@')[0] ?? '',
    heading: 'رابط الدخول إلى حسابك',
    body: `اضغط الرابط التالي لفتح حسابك ومتابعة طلباتك ومواعيدك:\n\n${link}\n\nالرابط صالح ${LOGIN_LINK_TTL_MINUTES} دقيقة ويُستخدم مرّة واحدة فقط.\n\nإن لم تطلب هذا الرابط فتجاهل الرسالة — لن يحدث شيء، ولا يستطيع أحد الدخول إلى حسابك دون فتح هذا الرابط من بريدك.`,
  });

  const result = await sendEmail({
    to: email,
    subject: `${site.shortName} — رابط الدخول إلى حسابك`,
    html: message.html,
    text: message.text,
    replyTo: site.contact.email,
  });

  if (!result.ok) {
    console.error('[account-login] تعذّر إرسال رابط الدخول', result.error);
    return NextResponse.json(
      { ok: false, message: 'تعذّر إرسال رابط الدخول حالياً. حاول لاحقاً أو راسلنا.' },
      { status: 502 },
    );
  }

  // لا نكشف إن كان للبريد حساب أم لا — الرسالة واحدة في الحالتين
  return NextResponse.json({
    ok: true,
    message: `إن كان لديك طلبات مسجّلة بهذا البريد فسيصلك رابط الدخول خلال دقائق. الرابط صالح ${LOGIN_LINK_TTL_MINUTES} دقيقة.`,
  });
}
