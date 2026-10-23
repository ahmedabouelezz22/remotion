import { NextResponse } from 'next/server';
import { z } from 'zod';
import { site } from '@/content/site';
import { isAdminConfigured, isOwnerEmail } from '@/lib/admin';
import { isDbConfigured } from '@/lib/db';
import { sendEmail } from '@/lib/notifications/email';
import { buildClientConfirmation } from '@/lib/notifications/templates';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { recentLoginTokenCount, recordLoginToken, writeAudit } from '@/lib/repository';
import { LOGIN_LINK_TTL_MINUTES, createAdminLoginToken, isAuthConfigured } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({ email: z.string().trim().email('البريد الإلكتروني غير صحيح') });

/**
 * طلب رابط دخول إداري.
 *
 * الرد واحد في كل الحالات — بريد مالك أو غيره — فلا يكشف المسار من هم
 * المُلّاك. والرابط لا يُرسل إلا إلى بريد في `OWNER_EMAILS`.
 */
export async function POST(request: Request) {
  const SAME_ANSWER = NextResponse.json({
    ok: true,
    message: `إن كان هذا البريد مُصرَّحاً له فسيصله رابط الدخول خلال دقائق. الرابط صالح ${LOGIN_LINK_TTL_MINUTES} دقيقة ويُستخدم مرّة واحدة.`,
  });

  if (!isAuthConfigured() || !isDbConfigured() || !isAdminConfigured()) {
    return NextResponse.json(
      { ok: false, message: 'لوحة الإدارة غير مهيّأة على هذا الموقع بعد.' },
      { status: 503 },
    );
  }

  const ip = clientIp(request);
  const limit = rateLimit(`admin-login:${ip}`, { limit: 5, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json({ ok: false, message: 'طلبات كثيرة. حاول بعد قليل.' }, { status: 429 });
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

  const email = parsed.data.email.trim().toLowerCase();

  if (!isOwnerEmail(email)) {
    // محاولة دخول إداري ببريد غير مصرَّح — تُسجَّل ولا تُجاب بشيء مختلف
    await writeAudit({
      actor: email,
      action: 'admin.login.denied',
      targetType: 'session',
      detail: { ip },
    });
    return SAME_ANSWER;
  }

  const recent = await recentLoginTokenCount({ email, ip }, 15);
  if (recent >= 5) return SAME_ANSWER;

  const login = createAdminLoginToken(email);
  const recorded = await recordLoginToken({
    jti: login.jti,
    email,
    ip,
    expiresAt: login.expiresAt,
    scope: 'owner',
  });
  if (!recorded) {
    return NextResponse.json(
      { ok: false, message: 'خدمة الإدارة غير متاحة حالياً (تعذّر الوصول إلى القاعدة).' },
      { status: 503 },
    );
  }

  const link = `${new URL(request.url).origin}/api/admin/verify?token=${encodeURIComponent(
    login.token,
  )}`;

  const message = buildClientConfirmation({
    name: 'مالك الموقع',
    heading: 'رابط الدخول إلى لوحة الإدارة',
    body: `اضغط الرابط التالي لفتح لوحة إدارة ${site.name}:\n\n${link}\n\nالرابط صالح ${LOGIN_LINK_TTL_MINUTES} دقيقة ويُستخدم مرّة واحدة فقط.\n\nطُلب هذا الرابط من العنوان: ${ip}\n\nإن لم تطلبه فتجاهل الرسالة ولا تفتح الرابط — الطلب مسجَّل في سجلّ التدقيق.`,
  });

  const result = await sendEmail({
    to: email,
    subject: `${site.shortName} — رابط الدخول إلى لوحة الإدارة`,
    html: message.html,
    text: message.text,
  });

  if (!result.ok) {
    console.error('[admin-login] تعذّر إرسال رابط الدخول', result.error);
    return NextResponse.json(
      { ok: false, message: 'تعذّر إرسال رابط الدخول. تحقّق من إعداد البريد.' },
      { status: 502 },
    );
  }

  await writeAudit({
    actor: email,
    action: 'admin.login.requested',
    targetType: 'session',
    detail: { ip },
  });

  return SAME_ANSWER;
}
