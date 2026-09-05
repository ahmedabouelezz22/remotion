import { NextResponse } from 'next/server';
import { site } from '@/content/site';
import { notifyOffice } from '@/lib/notifications/notify';
import { createBooking, deleteBooking } from '@/lib/repository';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { bookingSchema, fieldErrors } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

function formatArabicDate(date: string): string {
  return new Intl.DateTimeFormat('ar-EG', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(`${date}T00:00:00`));
}

export async function POST(request: Request) {
  const limit = rateLimit(`booking:${clientIp(request)}`, { limit: 4, windowMs: 15 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: `أرسلت طلبات حجز متعدّدة. حاول بعد ${Math.ceil(
          limit.retryAfterSeconds / 60,
        )} دقيقة أو راسلنا على واتساب.`,
      },
      { status: 429, headers: { 'Retry-After': String(limit.retryAfterSeconds) } },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'صيغة الطلب غير صحيحة.' }, { status: 400 });
  }

  const parsed = bookingSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: 'راجع البيانات المدخلة.', errors: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const { name, email, phone, type, channel, date, time, details, company } = parsed.data;

  if (company) {
    return NextResponse.json({ ok: true, message: 'تم استلام طلبك.' });
  }

  const readableDate = formatArabicDate(date);

  // القيد الفريد في القاعدة هو ما يمنع الحجز المزدوج فعلياً،
  // لأن فحصاً في الكود وحده يمكن أن يتجاوزه طلبان متزامنان
  const booking = await createBooking({ email, name, phone, type, channel, date, time, details });

  if (booking.result === 'taken') {
    return NextResponse.json(
      {
        ok: false,
        message: `الموعد ${readableDate} الساعة ${time} حُجز للتوّ. اختر موعداً آخر من المتاح.`,
        errors: { time: 'هذا الموعد لم يعد متاحاً' },
      },
      { status: 409 },
    );
  }

  const outcome = await notifyOffice({
    title: '📅 طلب حجز استشارة جديد',
    intro: 'ورد طلب حجز استشارة عبر الموقع. يلزم تأكيد الموعد مع العميل.',
    fields: [
      { label: 'رقم الحجز', value: booking.result === 'created' ? booking.id : 'لم يُحفظ (لا قاعدة بيانات)' },
      { label: 'الاسم', value: name },
      { label: 'البريد الإلكتروني', value: email },
      { label: 'رقم الهاتف', value: phone },
      { label: 'نوع الاستشارة', value: type },
      { label: 'وسيلة التواصل', value: channel },
      { label: 'الموعد المطلوب', value: `${readableDate} — الساعة ${time}` },
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
      confirmationHeading: 'استلمنا طلب حجز الاستشارة',
      confirmationBody: `الموعد المطلوب: ${readableDate} الساعة ${time} (بتوقيت القاهرة).\n\nهذا الطلب قيد التأكيد ولا يُعدّ حجزاً نهائياً بعد. سنتواصل معك لتثبيت الموعد أو اقتراح بديل قريب منه إن كان محجوزاً.\n\nنوع الاستشارة: ${type}\nوسيلة التواصل: ${channel}\n\nلتسريع الجلسة يمكنك إرسال المستندات ذات الصلة مسبقاً على البريد ${site.contact.email}.`,
    },
  });

  if (!outcome.delivered) {
    // لم يصل الإشعار إلى المكتب بأي قناة. لو أبقينا السجلّ لبقي الموعد
    // محجوزاً في نظر بقية الزوار بينما لا أحد يعلم بالحجز — فنحرّره.
    if (booking.result === 'created') await deleteBooking(booking.id);

    return NextResponse.json(
      {
        ok: false,
        message:
          'تعذّر تسجيل طلبك حالياً لعطل تقني مؤقّت. من فضلك راسلنا على واتساب لتثبيت الموعد.',
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: `استلمنا طلبك للموعد ${readableDate} الساعة ${time}. سنؤكّده معك خلال يوم عمل واحد.`,
  });
}
