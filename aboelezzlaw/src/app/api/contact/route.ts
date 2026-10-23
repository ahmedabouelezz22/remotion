import { NextResponse } from 'next/server';
import { notifyOffice } from '@/lib/notifications/notify';
import { saveMessage } from '@/lib/repository';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { contactSchema, fieldErrors, localeFrom } from '@/lib/validation';
import { dict } from '@/content/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  // الجسم يُقرأ أولاً لأن لغته تحدّد لغة كل ردّ بعدها — حتى ردّ حدّ المعدّل
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

  const limit = rateLimit(`contact:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: t.tooManyContact(Math.ceil(limit.retryAfterSeconds / 60)) },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const parsed = contactSchema(locale).safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: t.checkInputs, errors: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const { name, email, phone, subject, message, company } = parsed.data;

  // حقل الفخّ ممتلئ ⇒ بوت. نُظهر نجاحاً كاذباً حتى لا يتعلّم الآلي أن الفخّ مكشوف.
  if (company) {
    return NextResponse.json({ ok: true, message: t.contactReceived });
  }

  // الحفظ لا يعطّل الإشعار: فشله لا يمنع وصول الرسالة إلى المكتب
  await saveMessage({ name, email, phone, subject, body: message });

  const outcome = await notifyOffice({
    kind: 'contact',
    title: 'رسالة جديدة من نموذج «اتصل بنا»',
    intro: 'وردت رسالة جديدة عبر الموقع. تفاصيلها كالآتي:',
    fields: [
      { label: 'الاسم', value: name },
      { label: 'البريد الإلكتروني', value: email },
      { label: 'رقم الهاتف', value: phone },
      { label: 'الموضوع', value: subject },
      { label: 'الرسالة', value: message },
      { label: 'وقت الإرسال', value: new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }) },
    ],
    client: {
      name,
      email,
      phone,
      confirmationHeading: dict(locale).clientEmail.contactHeading,
      confirmationBody: dict(locale).clientEmail.contactBody,
    },
  });

  if (!outcome.delivered) {
    return NextResponse.json(
      { ok: false, message: t.contactFailed },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, message: t.contactThanks });
}
