import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProduct } from '@/content/products';
import { site } from '@/content/site';
import { withOwner } from '@/lib/admin';
import { sendEmail } from '@/lib/notifications/email';
import { buildClientConfirmation } from '@/lib/notifications/templates';
import { cancelPaypalSubscription } from '@/lib/payments/paypal';
import {
  adminSetSubscriptionCancelAtPeriodEnd,
  getSubscription,
  setSubscriptionStatus,
} from '@/lib/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  id: z.string().trim().min(3),
  action: z.enum(['stop-renewal', 'resume-renewal', 'cancel-now']),
  reason: z.string().trim().max(500).optional(),
});

export async function POST(request: Request) {
  return withOwner(request, schema, async ({ id, action, reason }) => {
    const subscription = await getSubscription(id);
    if (!subscription) {
      return {
        response: NextResponse.json({ ok: false, message: 'لا يوجد اشتراك بهذا الرقم.' }, { status: 404 }),
      };
    }

    const productName =
      getProduct(subscription.product_slug)?.name ?? subscription.product_slug;
    const warnings: string[] = [];

    if (action === 'resume-renewal') {
      if (!subscription.cancel_at_period_end) {
        return {
          response: NextResponse.json(
            { ok: false, message: 'التجديد التلقائي فعّال بالفعل.' },
            { status: 409 },
          ),
        };
      }
      await adminSetSubscriptionCancelAtPeriodEnd(id, false);
    } else {
      // إيقاف نهائي أو عند نهاية الدورة: في الحالتين نوقف التحصيل عند PayPal
      // أولاً، فالاكتفاء بالعلامة عندنا يترك المزوّد يسحب دفعة أخرى
      if (subscription.provider === 'paypal' && subscription.provider_subscription_id) {
        const stopped = await cancelPaypalSubscription(
          subscription.provider_subscription_id,
          reason ?? 'طلب من المكتب',
        );
        if (!stopped) {
          warnings.push(
            'تعذّر إيقاف التحصيل عند PayPal — أوقفه يدوياً من لوحة PayPal قبل إبلاغ العميل.',
          );
        }
      }

      await adminSetSubscriptionCancelAtPeriodEnd(id, true);
      if (action === 'cancel-now') await setSubscriptionStatus(id, 'cancelled');
    }

    const heading =
      action === 'cancel-now'
        ? 'إلغاء اشتراكك'
        : action === 'stop-renewal'
          ? 'إيقاف التجديد التلقائي'
          : 'إعادة تفعيل التجديد التلقائي';

    const body =
      action === 'cancel-now'
        ? `أُلغي اشتراكك في «${productName}» وأُوقف التحصيل.${reason ? `\n\nالسبب: ${reason}` : ''}\n\nلأي استفسار راسلنا على واتساب ${site.contact.phoneLocal}.`
        : action === 'stop-renewal'
          ? `أُوقف التجديد التلقائي لاشتراكك في «${productName}». يظلّ الاشتراك فعّالاً حتى نهاية الدورة المدفوعة${subscription.current_period_end ? ` (${subscription.current_period_end.toLocaleDateString('ar-EG')})` : ''}، ولن يُحصَّل منك أي مبلغ بعدها.${reason ? `\n\nالسبب: ${reason}` : ''}`
          : `أُعيد تفعيل التجديد التلقائي لاشتراكك في «${productName}». سيستمرّ التحصيل في بداية كل دورة.`;

    const message = buildClientConfirmation({ name: subscription.name, heading, body });
    await sendEmail({
      to: subscription.email,
      subject: `${site.shortName} — ${heading}`,
      html: message.html,
      text: message.text,
      replyTo: site.contact.email,
    });

    return {
      response: NextResponse.json({ ok: true, warnings }),
      audit: {
        action: `subscription.${action}`,
        targetType: 'subscription',
        targetId: id,
        detail: {
          product: subscription.product_slug,
          provider: subscription.provider,
          reason: reason ?? null,
          warnings,
        },
      },
    };
  });
}
