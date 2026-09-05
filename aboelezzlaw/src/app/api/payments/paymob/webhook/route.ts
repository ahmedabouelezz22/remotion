import { NextResponse } from 'next/server';
import { fulfillOrder } from '@/lib/fulfillment';
import { notifyOffice } from '@/lib/notifications/notify';
import { verifyPaymobHmac } from '@/lib/payments/paymob';
import { markOrderStatus } from '@/lib/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * يستقبل إشعارات Paymob بنتيجة العملية.
 * لا يُعتدّ بأي إشعار قبل التحقّق من توقيع HMAC — وإلا أمكن لأي طرف
 * انتحال إشعار نجاح وتحصيل منتج دون دفع.
 */
export async function POST(request: Request) {
  const url = new URL(request.url);
  const receivedHmac = url.searchParams.get('hmac') ?? '';

  let body: { type?: string; obj?: Record<string, unknown> };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ ok: false }, { status: 400 });
  }

  const transaction = body.obj;
  if (!transaction) return NextResponse.json({ ok: false }, { status: 400 });

  if (!verifyPaymobHmac(transaction, receivedHmac)) {
    console.error('[paymob-webhook] توقيع HMAC غير صالح — رُفض الإشعار');
    return NextResponse.json({ ok: false, message: 'invalid signature' }, { status: 401 });
  }

  const success = transaction.success === true;
  const order = transaction.order as Record<string, unknown> | undefined;
  const reference = (order?.merchant_order_id as string) || String(order?.id ?? '');
  const providerRef = String(transaction.id ?? '');
  const amount = Number(transaction.amount_cents ?? 0) / 100;
  const currency = String(transaction.currency ?? '');

  if (!reference) {
    console.error('[paymob-webhook] الإشعار بلا مرجع طلب');
    return NextResponse.json({ ok: true });
  }

  if (success) {
    // fulfillOrder يتولّى: تعليم الطلب مدفوعاً، وروابط التحميل،
    // وتفعيل الاشتراك، وإشعار المكتب — وهو آمن عند التكرار
    await fulfillOrder(reference, url.origin, providerRef);
  } else {
    await markOrderStatus(reference, 'failed', providerRef);
    await notifyOffice({
      title: `⚠️ محاولة دفع فاشلة — ${reference}`,
      intro: 'فشلت محاولة الدفع. قد يحتاج العميل إلى متابعة.',
      fields: [
        { label: 'مرجع الطلب', value: reference },
        { label: 'المبلغ', value: `${amount} ${currency}` },
        { label: 'رقم العملية لدى Paymob', value: providerRef },
        { label: 'الوقت', value: String(transaction.created_at ?? '') },
      ],
    });
  }

  // Paymob يعيد المحاولة إن لم يستلم 200
  return NextResponse.json({ ok: true });
}
