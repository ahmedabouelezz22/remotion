import { NextResponse } from 'next/server';
import { getProduct } from '@/content/products';
import { notifyOffice } from '@/lib/notifications/notify';
import { getPaypalSubscription } from '@/lib/payments/paypal';
import { activateSubscription, markOrderStatus } from '@/lib/repository';
import { nextPeriodEnd } from '@/lib/subscriptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * نقطة عودة العميل بعد موافقته على اشتراك PayPal المتكرّر.
 *
 * لا نصدّق معلَمة `subscription_id` القادمة في الرابط كما هي — بل نستعلم عن
 * الاشتراك من PayPal للتأكّد من أن حالته فعلاً ACTIVE أو APPROVED. بدون هذا
 * يستطيع أي شخص فتح الرابط بمعرّف اشتراك عشوائي ليُفعِّل باقة لم يدفعها.
 */
export async function GET(request: Request) {
  const url = new URL(request.url);
  const subscriptionId = url.searchParams.get('subscription_id');
  const reference = url.searchParams.get('ref') ?? '';

  if (!subscriptionId) {
    return NextResponse.redirect(new URL('/checkout?error=missing_subscription', url.origin));
  }

  const remote = await getPaypalSubscription(subscriptionId);
  const approved = remote.ok && (remote.status === 'ACTIVE' || remote.status === 'APPROVED');

  if (!approved) {
    await notifyOffice({
      title: `⚠️ لم يكتمل اشتراك — ${reference || subscriptionId}`,
      intro: 'عاد العميل من PayPal لكن الاشتراك ليس نشطاً. يلزم التحقّق من لوحة PayPal.',
      fields: [
        { label: 'مرجع الطلب', value: reference },
        { label: 'معرّف الاشتراك', value: subscriptionId },
        { label: 'الحالة', value: remote.status ?? remote.error ?? 'غير معروفة' },
      ],
    });
    return NextResponse.redirect(
      new URL(`/checkout?error=subscription_not_active&ref=${encodeURIComponent(reference)}`, url.origin),
    );
  }

  // PayPal يعطينا موعد التحصيل التالي؛ نستخدمه إن وُجد وإلا نحسبه بأنفسنا
  const periodEnd = remote.nextBillingTime
    ? new Date(remote.nextBillingTime)
    : nextPeriodEnd('شهري');

  const subscription = await activateSubscription(
    { providerSubscriptionId: subscriptionId },
    periodEnd,
  );

  if (reference) await markOrderStatus(reference, 'paid', subscriptionId);

  const productName = subscription
    ? (getProduct(subscription.product_slug)?.name ?? subscription.product_slug)
    : '';

  await notifyOffice({
    title: `🔁 اشتراك مُفعَّل — ${reference || subscriptionId}`,
    intro: 'وافق العميل على الاشتراك وصار نشطاً، والتجديد يتم تلقائياً من PayPal.',
    fields: [
      { label: 'مرجع الطلب', value: reference },
      { label: 'الباقة', value: productName },
      { label: 'العميل', value: subscription?.name ?? '' },
      { label: 'البريد', value: subscription?.email ?? '' },
      { label: 'معرّف الاشتراك', value: subscriptionId },
      { label: 'التحصيل التالي', value: periodEnd.toLocaleDateString('ar-EG') },
    ],
    client: subscription
      ? {
          name: subscription.name,
          email: subscription.email,
          phone: subscription.phone,
          confirmationHeading: 'تم تفعيل اشتراكك',
          confirmationBody: `اشتراكك في «${productName}» صار نشطاً.\n\nالتجديد التالي: ${periodEnd.toLocaleDateString(
            'ar-EG',
          )}\nالتجديد يتم تلقائياً عبر PayPal، ويمكنك إيقافه في أي وقت من صفحة حسابك.`,
        }
      : undefined,
  });

  return NextResponse.redirect(
    new URL(`/checkout/success?ref=${encodeURIComponent(reference)}&provider=paypal`, url.origin),
  );
}
