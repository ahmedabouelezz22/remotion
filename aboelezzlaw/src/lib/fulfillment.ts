import { defaultLocale, dict, isLocale, type Locale } from '@/content/i18n';
import { getProduct, productText } from '@/content/products';
import { site } from '@/content/site';
import { DOWNLOAD_TTL_HOURS, createDownloadToken } from '@/lib/download-token';
import { sendEmail } from '@/lib/notifications/email';
import { notifyOffice } from '@/lib/notifications/notify';
import { buildClientConfirmation } from '@/lib/notifications/templates';
import {
  activateSubscription,
  getOrder,
  markOrderStatus,
  type OrderRow,
} from '@/lib/repository';
import { nextPeriodEnd } from '@/lib/subscriptions';

/**
 * ما يحدث بعد تأكيد الدفع، في مكان واحد:
 *   1) تعليم الطلب مدفوعاً
 *   2) إصدار روابط تحميل موقّعة للمنتجات الرقمية وإرسالها للعميل
 *   3) تفعيل الاشتراك وضبط نهاية الدورة
 *   4) إشعار المكتب
 *
 * يُستدعى من webhook الـ Paymob ومن نقطة عودة PayPal معاً، ولذلك
 * صُمّم ليكون **idempotent**: استدعاؤه مرتين على نفس الطلب لا يُكرّر
 * الإرسال — وهو أمر لازم لأن البوابات تعيد إرسال الإشعار عند أي تأخّر.
 */

export interface FulfillResult {
  ok: boolean;
  alreadyFulfilled: boolean;
  downloads: { name: string; url: string }[];
}

function absoluteDownloadUrl(origin: string, slug: string, reference: string): string {
  const token = createDownloadToken(slug, reference);
  return `${origin}/api/download?token=${encodeURIComponent(token)}`;
}

export async function fulfillOrder(
  reference: string,
  origin: string,
  providerRef?: string,
): Promise<FulfillResult> {
  const existing = await getOrder(reference);

  // الطلب مدفوع سلفاً ⇒ إشعار مكرّر من البوابة، نتجاهله بهدوء
  if (existing?.status === 'paid') {
    return { ok: true, alreadyFulfilled: true, downloads: [] };
  }

  const order = await markOrderStatus(reference, 'paid', providerRef);

  // لا قاعدة بيانات مضبوطة: نكتفي بإشعار المكتب، فلا سجلّ نحدّثه
  if (!order) {
    await notifyOffice({
      kind: 'payment-succeeded',
      reference,
      title: `✅ دفعة ناجحة — ${reference}`,
      intro: 'وصل إشعار دفع ناجح. لم يُحفظ الطلب في قاعدة بيانات (DATABASE_URL غير مضبوط).',
      fields: [
        { label: 'مرجع الطلب', value: reference },
        { label: 'مرجع البوابة', value: providerRef ?? '' },
      ],
    });
    return { ok: false, alreadyFulfilled: false, downloads: [] };
  }

  const downloads = await deliverOrder(order, origin);
  return { ok: true, alreadyFulfilled: false, downloads };
}

/** لغة الطلب كما حُفظت عند الدفع؛ الطلبات الأقدم من هذا العمود عربية */
function orderLocale(order: OrderRow): Locale {
  return isLocale(order.locale) ? (order.locale as Locale) : defaultLocale;
}

/** يُصدر روابط التحميل، يفعّل الاشتراكات، ويراسل العميل والمكتب */
async function deliverOrder(order: OrderRow, origin: string) {
  const locale = orderLocale(order);
  const t = dict(locale);
  const downloads: { name: string; url: string }[] = [];
  const activatedSubscriptions: string[] = [];

  for (const item of order.items) {
    const product = getProduct(item.slug);
    if (!product) continue;

    if (product.kind === 'digital' && product.file) {
      downloads.push({
        name: productText(product, locale).name,
        url: absoluteDownloadUrl(origin, product.slug, order.id),
      });
    }

    if (product.kind === 'subscription') {
      const period = product.billingPeriod ?? 'شهري';
      const activated = await activateSubscription(
        { orderId: order.id },
        nextPeriodEnd(period),
      );
      if (activated) {
        activatedSubscriptions.push(
          t.deliveryEmail.subscriptionUntil(
            productText(product, locale).name,
            activated.current_period_end?.toLocaleDateString(
              locale === 'ar' ? 'ar-EG' : 'en-GB',
            ) ?? '',
          ),
        );
      }
    }
  }

  await sendClientDelivery(order, downloads, activatedSubscriptions);

  await notifyOffice({
    kind: 'payment-succeeded',
    reference: order.id,
    title: `✅ دفعة ناجحة — ${order.id}`,
    intro: 'تم تحصيل الدفعة. يمكن البدء في تنفيذ الطلب.',
    fields: [
      { label: 'رقم الطلب', value: order.id },
      { label: 'العميل', value: order.name },
      { label: 'البريد', value: order.email },
      { label: 'الهاتف', value: order.phone },
      {
        label: 'المنتجات',
        value: order.items.map((item) => `${item.name} × ${item.quantity}`).join('\n'),
      },
      { label: 'الإجمالي', value: `${order.total} ${order.currency}` },
      { label: 'وسيلة الدفع', value: order.method },
      { label: 'مرجع البوابة', value: order.provider_ref ?? '' },
      {
        label: 'روابط تحميل صدرت',
        value: downloads.length > 0 ? String(downloads.length) : '',
      },
      { label: 'اشتراكات فُعّلت', value: activatedSubscriptions.join('\n') },
      { label: 'عنوان الشحن', value: order.address ?? '' },
      { label: 'المدينة', value: order.city ?? '' },
      { label: 'ملاحظات العميل', value: order.notes ?? '' },
    ],
    // بريد التسليم أُرسل للعميل أعلاه، فنمرّر بياناته لرابط الرد السريع فقط
    client: { name: order.name, email: order.email, phone: order.phone },
  });

  return downloads;
}

/** بريد التسليم للعميل: روابط التحميل + حالة الاشتراك + الخطوة التالية */
async function sendClientDelivery(
  order: OrderRow,
  downloads: { name: string; url: string }[],
  subscriptions: string[],
): Promise<void> {
  const locale = orderLocale(order);
  const t = dict(locale);
  const e = t.deliveryEmail;

  const lines: string[] = [e.confirmed(order.id), ''];

  if (downloads.length > 0) {
    lines.push(e.downloadsTitle(DOWNLOAD_TTL_HOURS));
    for (const item of downloads) lines.push(`• ${item.name}: ${item.url}`);
    lines.push('');
  }

  if (subscriptions.length > 0) {
    lines.push(e.subscriptionsTitle);
    for (const item of subscriptions) lines.push(`• ${item}`);
    lines.push('');
  }

  const needsBooking = order.items.some((item) => {
    const product = getProduct(item.slug);
    return product?.requiresBooking;
  });
  if (needsBooking) {
    lines.push(e.bookingLine(`${site.url}/${locale}/booking`), '');
  }

  lines.push(e.accountLine(`${site.url}/${locale}/account`));

  const confirmation = buildClientConfirmation({
    name: order.name,
    heading: e.heading(order.id),
    body: lines.join('\n'),
    locale,
  });

  const result = await sendEmail({
    to: order.email,
    subject: `${t.common.firmShort} — ${e.subject(order.id)}`,
    html: confirmation.html,
    text: confirmation.text,
    replyTo: site.contact.email,
  });

  if (!result.ok) {
    console.error('[fulfillment] تعذّر إرسال بريد التسليم للعميل', result.error);
  }
}

/** يُصدر روابط تحميل جديدة لطلب مدفوع — يُستخدم من لوحة تحكم العميل */
export function downloadLinksFor(order: OrderRow, origin: string) {
  if (order.status !== 'paid') return [];

  return order.items
    .map((item) => {
      const product = getProduct(item.slug);
      if (!product || product.kind !== 'digital' || !product.file) return null;
      return { name: product.name, url: absoluteDownloadUrl(origin, product.slug, order.id) };
    })
    .filter((entry): entry is { name: string; url: string } => entry !== null);
}
