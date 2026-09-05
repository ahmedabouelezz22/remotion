import { NextResponse } from 'next/server';
import { notifyOffice } from '@/lib/notifications/notify';
import { capturePaypalOrder } from '@/lib/payments/paypal';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * نقطة العودة من PayPal. الموافقة وحدها لا تعني التحصيل —
 * لا بد من استدعاء capture صراحةً وإلا لم يصل المال.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token'); // معرّف الطلب لدى PayPal
  const reference = url.searchParams.get('ref') ?? 'غير معروف';

  if (!token) {
    return NextResponse.redirect(new URL('/checkout?error=missing_token', url.origin));
  }

  const result = await capturePaypalOrder(token);

  await notifyOffice({
    title: result.ok ? `✅ دفعة PayPal ناجحة — ${reference}` : `⚠️ فشل تحصيل PayPal — ${reference}`,
    intro: result.ok
      ? 'تم تحصيل الدفعة عبر PayPal.'
      : 'لم يكتمل التحصيل عبر PayPal — يلزم التحقّق يدوياً من لوحة PayPal.',
    fields: [
      { label: 'مرجع الطلب', value: reference },
      { label: 'معرّف الطلب لدى PayPal', value: token },
      { label: 'الحالة', value: result.status ?? result.error ?? 'غير معروفة' },
    ],
  });

  const target = new URL(
    result.ok
      ? `/checkout/success?ref=${encodeURIComponent(reference)}&provider=paypal`
      : `/checkout?error=capture_failed&ref=${encodeURIComponent(reference)}`,
    url.origin,
  );
  return NextResponse.redirect(target);
}
