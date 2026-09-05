import { NextResponse } from 'next/server';
import { z } from 'zod';
import { site } from '@/content/site';
import { isDbConfigured } from '@/lib/db';
import { sendEmail } from '@/lib/notifications/email';
import { buildClientConfirmation } from '@/lib/notifications/templates';
import { clientIp, rateLimit } from '@/lib/rate-limit';
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

  const limit = rateLimit(`login:${clientIp(request)}`, { limit: 5, windowMs: 15 * 60 * 1000 });
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
  const link = `${new URL(request.url).origin}/api/account/verify?token=${encodeURIComponent(
    createLoginToken(email),
  )}`;

  const message = buildClientConfirmation({
    name: email.split('@')[0] ?? '',
    heading: 'رابط الدخول إلى حسابك',
    body: `اضغط الرابط التالي لفتح حسابك ومتابعة طلباتك ومواعيدك:\n\n${link}\n\nالرابط صالح ${LOGIN_LINK_TTL_MINUTES} دقيقة ويُستخدم من هذا الجهاز.\n\nإن لم تطلب هذا الرابط فتجاهل الرسالة — لن يحدث شيء، ولا يستطيع أحد الدخول إلى حسابك دون فتح هذا الرابط من بريدك.`,
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
