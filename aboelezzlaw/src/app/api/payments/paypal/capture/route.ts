import { NextResponse } from 'next/server';
import { fulfillOrder } from '@/lib/fulfillment';
import { notifyOffice } from '@/lib/notifications/notify';
import { capturePaypalOrder } from '@/lib/payments/paypal';
import { markOrderStatus } from '@/lib/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * نقطة العودة من PayPal للمدفوعات لمرّة واحدة.
 * الموافقة وحدها لا تعني التحصيل — لا بد من استدعاء capture صراحةً وإلا لم يصل المال.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token'); // معرّف الطلب لدى PayPal
  const reference = url.searchParams.get('ref') ?? '';

  if (!token) {
    return NextResponse.redirect(new URL('/checkout?error=missing_token', url.origin));
  }

  const result = await capturePaypalOrder(token);

  if (result.ok) {
    await fulfillOrder(reference, url.origin, token);
  } else {
    await markOrderStatus(reference, 'failed', token);
    await notifyOffice({
      title: `⚠️ فشل تحصيل PayPal — ${reference || 'بلا مرجع'}`,
      intro: 'لم يكتمل التحصيل عبر PayPal — يلزم التحقّق يدوياً من لوحة PayPal.',
      fields: [
        { label: 'مرجع الطلب', value: reference },
        { label: 'معرّف الطلب لدى PayPal', value: token },
        { label: 'الحالة', value: result.status ?? result.error ?? 'غير معروفة' },
      ],
    });
  }

  const target = new URL(
    result.ok
      ? `/checkout/success?ref=${encodeURIComponent(reference)}&provider=paypal`
      : `/checkout?error=capture_failed&ref=${encodeURIComponent(reference)}`,
    url.origin,
  );
  return NextResponse.redirect(target);
}
