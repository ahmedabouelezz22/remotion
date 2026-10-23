import { NextResponse } from 'next/server';
import { defaultLocale, isLocale, type Locale } from '@/content/i18n';
import { fulfillOrder } from '@/lib/fulfillment';
import { notifyOffice } from '@/lib/notifications/notify';
import { requestOrigin } from '@/lib/origin';
import { capturePaypalOrder } from '@/lib/payments/paypal';
import { markOrderStatus } from '@/lib/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** لغة العودة تأتي من الرابط الذي بنيناه قبل التحويل إلى البوّابة */
function returnLocale(url: URL): Locale {
  const value = url.searchParams.get('locale');
  return isLocale(value ?? '') ? (value as Locale) : defaultLocale;
}

/**
 * نقطة العودة من PayPal للمدفوعات لمرّة واحدة.
 * الموافقة وحدها لا تعني التحصيل — لا بد من استدعاء capture صراحةً وإلا لم يصل المال.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  // كل رابط يراه العميل (التحميل، العودة من البوّابة) يُبنى على العنوان
  // العام لا على عنوان الطلب الداخلي خلف وسيط TLS
  const origin = requestOrigin(request);
  const token = url.searchParams.get('token'); // معرّف الطلب لدى PayPal
  const reference = url.searchParams.get('ref') ?? '';
  const locale = returnLocale(url);

  if (!token) {
    return NextResponse.redirect(
      new URL(`/${locale}/checkout?error=missing_token`, origin),
    );
  }

  const result = await capturePaypalOrder(token);

  if (result.ok) {
    await fulfillOrder(reference, origin, token);
  } else {
    await markOrderStatus(reference, 'failed', token);
    await notifyOffice({
      kind: 'payment-failed',
      reference: reference || null,
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
      ? `/${locale}/checkout/success?ref=${encodeURIComponent(reference)}&provider=paypal`
      : `/${locale}/checkout?error=capture_failed&ref=${encodeURIComponent(reference)}`,
    origin,
  );
  return NextResponse.redirect(target);
}
