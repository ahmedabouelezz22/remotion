import { NextResponse } from 'next/server';
import { getProduct } from '@/content/products';
import { site } from '@/content/site';
import { isDbConfigured } from '@/lib/db';
import { sendEmail } from '@/lib/notifications/email';
import { notifyOffice } from '@/lib/notifications/notify';
import { buildClientConfirmation } from '@/lib/notifications/templates';
import { getPaypalSubscription } from '@/lib/payments/paypal';
import {
  activateSubscription,
  markReminderSent,
  setSubscriptionStatus,
  subscriptionsDueWithin,
  subscriptionsExpired,
  type SubscriptionRow,
} from '@/lib/repository';
import { dueReminder, MAX_REMINDER_DAYS, nextPeriodEnd } from '@/lib/subscriptions';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * محرّك دورة حياة الاشتراكات — يُشغَّل يومياً عبر Vercel Cron.
 *
 * ما يفعله:
 *   1) يذكّر العميل قبل انتهاء دورته بـ 7 و 3 و 1 يوم (تذكير واحد لكل عتبة).
 *   2) عند انتهاء الدورة:
 *      • اشتراك PayPal متكرّر ⇒ يسأل PayPal: إن كان لا يزال ACTIVE فقد جُدِّد
 *        تلقائياً، فيمدّد الدورة. وإلا يُعلَّم متأخّر السداد.
 *      • اشتراك يدوي ⇒ يُعلَّم متأخّر السداد ويُخطَر المكتب لإصدار فاتورة.
 *      • من طلب إيقاف التجديد ⇒ يُلغى عند نهاية دورته المدفوعة.
 *
 * الحماية: يُرفض أي استدعاء لا يحمل CRON_SECRET، فالمسار يرسل بريداً
 * ويعدّل حالات — ولا يجوز أن يشغّله أي زائر.
 */

function authorized(request: Request): boolean {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;

  const header = request.headers.get('authorization');
  if (header === `Bearer ${secret}`) return true;

  return new URL(request.url).searchParams.get('secret') === secret;
}

async function sendReminder(
  subscription: SubscriptionRow,
  tier: number,
  remaining: number,
  origin: string,
) {
  const productName = getProduct(subscription.product_slug)?.name ?? subscription.product_slug;
  const endsOn = subscription.current_period_end?.toLocaleDateString('ar-EG') ?? '';
  const autoRenews = subscription.provider === 'paypal' && !subscription.cancel_at_period_end;

  const body = subscription.cancel_at_period_end
    ? `اشتراكك في «${productName}» ينتهي في ${endsOn} ولن يُجدَّد، بناءً على طلبك السابق بإيقاف التجديد.\n\nإن غيّرت رأيك فتواصل معنا قبل هذا التاريخ لإبقائه فعّالاً.`
    : autoRenews
      ? `تذكير: اشتراكك في «${productName}» يُجدَّد تلقائياً في ${endsOn}.\n\nلا يلزمك فعل شيء. وإن أردت إيقاف التجديد فيمكنك ذلك من صفحة حسابك: ${origin}/account`
      : `تذكير: اشتراكك في «${productName}» ينتهي في ${endsOn}.\n\nللتجديد أتمم الطلب من المتجر أو راسلنا على واتساب ${site.contact.phoneLocal} وسنرسل لك رابط الدفع.`;

  // العربية: المثنّى يغني عن العدد، و«أيام» للقلّة (3–10)
  const heading =
    remaining <= 0
      ? 'اشتراكك ينتهي اليوم'
      : remaining === 1
        ? 'اشتراكك ينتهي غداً'
        : remaining === 2
          ? 'اشتراكك ينتهي بعد يومين'
          : `اشتراكك ينتهي خلال ${remaining} ${remaining <= 10 ? 'أيام' : 'يوماً'}`;

  const message = buildClientConfirmation({ name: subscription.name, heading, body });

  const result = await sendEmail({
    to: subscription.email,
    subject: `${site.shortName} — تذكير بتجديد اشتراكك`,
    html: message.html,
    text: message.text,
    replyTo: site.contact.email,
  });

  if (result.ok) await markReminderSent(subscription.id, tier);
  return result.ok;
}

export async function GET(request: Request) {
  if (!authorized(request)) {
    return NextResponse.json({ ok: false, message: 'غير مصرّح' }, { status: 401 });
  }

  if (!isDbConfigured()) {
    return NextResponse.json({ ok: false, message: 'DATABASE_URL غير مضبوط' }, { status: 503 });
  }

  const origin = new URL(request.url).origin;
  const summary = { reminded: 0, renewed: 0, pastDue: 0, cancelled: 0 };

  // ── 1) التذكيرات ──
  for (const subscription of await subscriptionsDueWithin(MAX_REMINDER_DAYS)) {
    const due = dueReminder(subscription);
    if (due === null) continue;
    if (await sendReminder(subscription, due.tier, due.remaining, origin)) summary.reminded += 1;
  }

  // ── 2) الدورات المنتهية ──
  const expiredList = await subscriptionsExpired();
  const officeNotes: string[] = [];

  for (const subscription of expiredList) {
    const productName = getProduct(subscription.product_slug)?.name ?? subscription.product_slug;

    if (subscription.cancel_at_period_end) {
      await setSubscriptionStatus(subscription.id, 'cancelled');
      summary.cancelled += 1;
      officeNotes.push(`⏹ انتهى بالإلغاء: ${productName} — ${subscription.email}`);
      continue;
    }

    if (subscription.provider === 'paypal' && subscription.provider_subscription_id) {
      const remote = await getPaypalSubscription(subscription.provider_subscription_id);

      if (remote.ok && remote.status === 'ACTIVE') {
        // PayPal حصّل الدورة الجديدة تلقائياً — نمدّد عندنا
        const periodEnd = remote.nextBillingTime
          ? new Date(remote.nextBillingTime)
          : nextPeriodEnd(subscription.period);
        await activateSubscription({ id: subscription.id }, periodEnd);
        summary.renewed += 1;
        officeNotes.push(
          `🔁 جُدِّد تلقائياً: ${productName} — ${subscription.email} — حتى ${periodEnd.toLocaleDateString('ar-EG')}`,
        );
        continue;
      }

      officeNotes.push(
        `⚠️ توقّف تحصيل PayPal (${remote.status ?? 'غير معروف'}): ${productName} — ${subscription.email}`,
      );
    } else {
      officeNotes.push(`💳 يحتاج تجديداً يدوياً: ${productName} — ${subscription.email}`);
    }

    await setSubscriptionStatus(subscription.id, 'past_due');
    summary.pastDue += 1;

    const message = buildClientConfirmation({
      name: subscription.name,
      heading: 'انتهت دورة اشتراكك',
      body: `انتهت دورة اشتراكك في «${productName}».\n\nلاستمرار الخدمة، جدّد الاشتراك من المتجر أو راسلنا على واتساب ${site.contact.phoneLocal}.\n\nصفحة حسابك: ${origin}/account`,
    });
    await sendEmail({
      to: subscription.email,
      subject: `${site.shortName} — انتهت دورة اشتراكك`,
      html: message.html,
      text: message.text,
      replyTo: site.contact.email,
    });
  }

  // إشعار المكتب مرة واحدة بملخّص اليوم، لا رسالة لكل اشتراك
  if (officeNotes.length > 0) {
    await notifyOffice({
      title: '📋 ملخّص الاشتراكات اليومي',
      intro: 'نتيجة الفحص اليومي لدورات الاشتراكات.',
      fields: [
        { label: 'التاريخ', value: new Date().toLocaleDateString('ar-EG') },
        { label: 'تذكيرات أُرسلت', value: String(summary.reminded) },
        { label: 'تجديدات تلقائية', value: String(summary.renewed) },
        { label: 'متأخّرة السداد', value: String(summary.pastDue) },
        { label: 'ملغاة', value: String(summary.cancelled) },
        { label: 'التفاصيل', value: officeNotes.join('\n') },
      ],
    });
  }

  return NextResponse.json({ ok: true, ...summary });
}
