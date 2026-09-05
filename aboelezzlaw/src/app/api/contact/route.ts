import { NextResponse } from 'next/server';
import { notifyOffice } from '@/lib/notifications/notify';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { contactSchema, fieldErrors } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const limit = rateLimit(`contact:${clientIp(request)}`, { limit: 5, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      {
        ok: false,
        message: `أرسلت رسائل كثيرة خلال وقت قصير. حاول مرة أخرى بعد ${Math.ceil(
          limit.retryAfterSeconds / 60,
        )} دقيقة، أو راسلنا مباشرة على واتساب.`,
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

  const parsed = contactSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: 'راجع البيانات المدخلة.', errors: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const { name, email, phone, subject, message, company } = parsed.data;

  // حقل الفخّ ممتلئ ⇒ بوت. نُظهر نجاحاً كاذباً حتى لا يتعلّم الآلي أن الفخّ مكشوف.
  if (company) {
    return NextResponse.json({ ok: true, message: 'تم استلام رسالتك.' });
  }

  const outcome = await notifyOffice({
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
      confirmationHeading: 'وصلتنا رسالتك',
      confirmationBody:
        'شكراً لتواصلك مع المكتب. اطّلعنا على رسالتك وسنرد عليك خلال يوم عمل واحد في الأحوال المعتادة. إن كان الأمر عاجلاً فراسلنا مباشرة على واتساب.',
    },
  });

  if (!outcome.delivered) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'تعذّر إرسال رسالتك حالياً لعطل تقني مؤقّت. من فضلك راسلنا على واتساب أو على البريد مباشرة.',
      },
      { status: 502 },
    );
  }

  return NextResponse.json({
    ok: true,
    message: 'وصلتنا رسالتك بنجاح. سنتواصل معك خلال يوم عمل واحد.',
  });
}
