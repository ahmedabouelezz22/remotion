import { NextResponse } from 'next/server';
import { notifyOffice } from '@/lib/notifications/notify';
import { createBooking, deleteBooking } from '@/lib/repository';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { checkSlot } from '@/lib/slots';
import { bookingSchema, fieldErrors, localeFrom } from '@/lib/validation';
import { dict, htmlLang, type Locale } from '@/content/i18n';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function formatDate(date: string, locale: Locale): string {
  return new Intl.DateTimeFormat(htmlLang(locale), {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

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

  const limit = rateLimit(`booking:${clientIp(request)}`, { limit: 4, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: t.tooManyBooking(Math.ceil(limit.retryAfterSeconds / 60)) },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  const parsed = bookingSchema(locale).safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: t.checkInputs, errors: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const { name, email, phone, type, channel, date, time, details, company } = parsed.data;

  if (company) {
    return NextResponse.json({ ok: true, message: t.bookingReceived });
  }

  // أيام العمل والمواعيد تُفحص هنا أيضاً لا في المُنتقي وحده: مُنتقي الصفحة
  // راحة للزائر، والخادم هو ما يمنع حجز يوم إجازة أو ساعة لا نعمل فيها
  const slot = checkSlot(date, time);
  if (!slot.ok) {
    return NextResponse.json(
      { ok: false, message: slot.message, errors: { [slot.field]: slot.message } },
      { status: 400 },
    );
  }

  // تاريخان: أحدهما للعميل بلغته والآخر للمكتب بالعربية دائماً
  const readableDate = formatDate(date, locale);
  const officeDate = formatDate(date, 'ar');

  // القيد الفريد في القاعدة هو ما يمنع الحجز المزدوج فعلياً،
  // لأن فحصاً في الكود وحده يمكن أن يتجاوزه طلبان متزامنان
  const booking = await createBooking({ email, name, phone, type, channel, date, time, details });

  if (booking.result === 'taken') {
    return NextResponse.json(
      {
        ok: false,
        message: t.slotTaken(readableDate, time),
        errors: { time: dict(locale).booking.slotTaken },
      },
      { status: 409 },
    );
  }

  const outcome = await notifyOffice({
    kind: 'booking',
    reference: booking.result === 'created' ? booking.id : null,
    title: '📅 طلب حجز استشارة جديد',
    intro: 'ورد طلب حجز استشارة عبر الموقع. يلزم تأكيد الموعد مع العميل.',
    fields: [
      { label: 'رقم الحجز', value: booking.result === 'created' ? booking.id : 'لم يُحفظ (لا قاعدة بيانات)' },
      { label: 'الاسم', value: name },
      { label: 'البريد الإلكتروني', value: email },
      { label: 'رقم الهاتف', value: phone },
      { label: 'نوع الاستشارة', value: type },
      { label: 'وسيلة التواصل', value: channel },
      { label: 'الموعد المطلوب', value: `${officeDate} — الساعة ${time}` },
      { label: 'ملخّص الموضوع', value: details },
      {
        label: 'وقت الطلب',
        value: new Date().toLocaleString('ar-EG', { timeZone: 'Africa/Cairo' }),
      },
    ],
    client: {
      name,
      email,
      phone,
      confirmationHeading: dict(locale).clientEmail.bookingHeading,
      confirmationBody: dict(locale).clientEmail.bookingBody(
        `${readableDate} — ${time}`,
        type,
        channel,
      ),
    },
  });

  if (!outcome.delivered) {
    // لم يصل الإشعار إلى المكتب بأي قناة. لو أبقينا السجلّ لبقي الموعد
    // محجوزاً في نظر بقية الزوار بينما لا أحد يعلم بالحجز — فنحرّره.
    if (booking.result === 'created') await deleteBooking(booking.id);

    return NextResponse.json(
      { ok: false, message: t.bookingFailed },
      { status: 502 },
    );
  }

  return NextResponse.json({ ok: true, message: t.bookingThanks });
}
