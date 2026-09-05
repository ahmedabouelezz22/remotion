import { NextResponse } from 'next/server';
import { getProduct } from '@/content/products';
import { notifyOffice } from '@/lib/notifications/notify';
import { cancelPaypalSubscription } from '@/lib/payments/paypal';
import { listSubscriptionsByEmail, requestSubscriptionCancellation } from '@/lib/repository';
import { currentUserEmail } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * إيقاف التجديد التلقائي بطلب العميل.
 * الاشتراك يظل نشطاً حتى نهاية الدورة المدفوعة — لا نقطع خدمة دُفع ثمنها.
 */
export async function POST(request: Request) {
  const email = await currentUserEmail();
  if (!email) {
    return NextResponse.json({ ok: false, message: 'يلزم تسجيل الدخول.' }, { status: 401 });
  }

  let payload: { id?: string };
  try {
    payload = (await request.json()) as { id?: string };
  } catch {
    return NextResponse.json({ ok: false, message: 'صيغة الطلب غير صحيحة.' }, { status: 400 });
  }

  if (!payload.id) {
    return NextResponse.json({ ok: false, message: 'رقم الاشتراك مفقود.' }, { status: 400 });
  }

  // الشرط على البريد داخل الاستعلام نفسه — فلا يستطيع عميل إلغاء اشتراك غيره
  const subscription = await requestSubscriptionCancellation(payload.id, email);
  if (!subscription) {
    return NextResponse.json(
      { ok: false, message: 'لم يُعثر على اشتراك نشط بهذا الرقم في حسابك.' },
      { status: 404 },
    );
  }

  // إيقاف التحصيل لدى PayPal أيضاً، وإلا استمرّ الخصم رغم الإلغاء عندنا
  if (subscription.provider === 'paypal' && subscription.provider_subscription_id) {
    const cancelled = await cancelPaypalSubscription(subscription.provider_subscription_id);
    if (!cancelled) {
      console.error('[cancel-subscription] تعذّر الإلغاء لدى PayPal', subscription.id);
    }
  }

  const productName = getProduct(subscription.product_slug)?.name ?? subscription.product_slug;

  await notifyOffice({
    title: `🔕 طلب إيقاف تجديد — ${subscription.id}`,
    intro: 'طلب عميل إيقاف التجديد التلقائي. الاشتراك يظل نشطاً حتى نهاية الدورة المدفوعة.',
    fields: [
      { label: 'رقم الاشتراك', value: subscription.id },
      { label: 'الباقة', value: productName },
      { label: 'العميل', value: subscription.name },
      { label: 'البريد', value: subscription.email },
      { label: 'الهاتف', value: subscription.phone },
      {
        label: 'ينتهي في',
        value: subscription.current_period_end?.toLocaleDateString('ar-EG') ?? 'غير محدّد',
      },
    ],
  });

  const remaining = await listSubscriptionsByEmail(email);
  return NextResponse.json({
    ok: true,
    message: `أُوقف التجديد التلقائي. اشتراكك يظل نشطاً حتى ${
      subscription.current_period_end?.toLocaleDateString('ar-EG') ?? 'نهاية الدورة الحالية'
    }.`,
    subscriptions: remaining.length,
  });
}
