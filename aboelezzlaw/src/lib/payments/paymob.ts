import { createHmac } from 'node:crypto';
import type { OrderDraft, PaymentInitResult, PaymentProvider } from './types';

/**
 * تكامل Paymob عبر واجهة النوايا (Intention API) — المسار الموحّد الحديث.
 *
 * المتغيّرات المطلوبة:
 *   PAYMOB_SECRET_KEY       مفتاح سرّي  (Dashboard ▸ Settings ▸ API Keys)
 *   PAYMOB_PUBLIC_KEY       مفتاح عام
 *   PAYMOB_INTEGRATION_IDS  أرقام التكاملات مفصولة بفواصل (بطاقة، محفظة، ...)
 *   PAYMOB_HMAC_SECRET      لتوقيع الـ webhook
 *
 * تنبيه: راجِع لوحة تحكم Paymob بعد فتح الحساب للتأكد من أرقام التكاملات،
 * ومن ترتيب حقول الـ HMAC أدناه، فقد تُحدّثه Paymob.
 * التوثيق: https://developers.paymob.com/
 */

const PAYMOB_API = 'https://accept.paymob.com';

function integrationIds(): number[] {
  return (process.env.PAYMOB_INTEGRATION_IDS || '')
    .split(',')
    .map((value) => Number(value.trim()))
    .filter((value) => Number.isFinite(value) && value > 0);
}

function splitName(fullName: string): { first: string; last: string } {
  const parts = fullName.trim().split(/\s+/);
  return {
    first: parts[0] || 'NA',
    last: parts.slice(1).join(' ') || 'NA',
  };
}

export const paymob: PaymentProvider = {
  id: 'paymob',
  label: 'بطاقة بنكية أو محفظة إلكترونية',
  description: 'فيزا / ماستركارد / ميزة ومحافظ الهاتف — عبر بوابة Paymob الآمنة.',

  isConfigured() {
    return Boolean(
      process.env.PAYMOB_SECRET_KEY &&
        process.env.PAYMOB_PUBLIC_KEY &&
        integrationIds().length > 0,
    );
  },

  async createPayment(order: OrderDraft, origin: string): Promise<PaymentInitResult> {
    const { first, last } = splitName(order.customer.name);

    // Paymob يتعامل بالقروش (أصغر وحدة للعملة)
    const toMinorUnits = (value: number) => Math.round(value * 100);

    const payload = {
      amount: toMinorUnits(order.total),
      currency: order.currency,
      payment_methods: integrationIds(),
      items: order.items.map((item) => ({
        name: item.name.slice(0, 50),
        amount: toMinorUnits(item.unitPrice),
        description: item.name.slice(0, 100),
        quantity: item.quantity,
      })),
      billing_data: {
        first_name: first,
        last_name: last,
        email: order.customer.email,
        phone_number: order.customer.phone,
        street: order.customer.address || 'NA',
        city: order.customer.city || 'NA',
        country: 'EG',
        apartment: 'NA',
        building: 'NA',
        floor: 'NA',
        state: order.customer.city || 'NA',
      },
      customer: {
        first_name: first,
        last_name: last,
        email: order.customer.email,
      },
      special_reference: order.reference,
      notification_url: `${origin}/api/payments/paymob/webhook`,
      redirection_url: `${origin}/checkout/success?ref=${encodeURIComponent(order.reference)}`,
    };

    try {
      const res = await fetch(`${PAYMOB_API}/v1/intention/`, {
        method: 'POST',
        headers: {
          Authorization: `Token ${process.env.PAYMOB_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const detail = await res.text();
        console.error('[paymob] فشل إنشاء النية', res.status, detail);
        return { ok: false, error: 'تعذّر بدء عملية الدفع. حاول مرة أخرى أو اختر وسيلة دفع أخرى.' };
      }

      const data = (await res.json()) as { client_secret?: string };
      if (!data.client_secret) {
        return { ok: false, error: 'استجابة غير متوقعة من بوابة الدفع.' };
      }

      const url = `${PAYMOB_API}/unifiedcheckout/?publicKey=${encodeURIComponent(
        process.env.PAYMOB_PUBLIC_KEY!,
      )}&clientSecret=${encodeURIComponent(data.client_secret)}`;

      return { ok: true, kind: 'redirect', url };
    } catch (error) {
      console.error('[paymob] خطأ شبكة', error);
      return { ok: false, error: 'تعذّر الاتصال ببوابة الدفع.' };
    }
  },
};

/**
 * ترتيب الحقول الذي توقّع عليه Paymob رسائل الـ webhook.
 * القيم تُسلسل بالترتيب ثم تُجمع نصّياً وتُوقّع بـ HMAC-SHA512.
 */
const HMAC_FIELD_ORDER = [
  'amount_cents',
  'created_at',
  'currency',
  'error_occured',
  'has_parent_transaction',
  'id',
  'integration_id',
  'is_3d_secure',
  'is_auth',
  'is_capture',
  'is_refunded',
  'is_standalone_payment',
  'is_voided',
  'order.id',
  'owner',
  'pending',
  'source_data.pan',
  'source_data.sub_type',
  'source_data.type',
  'success',
] as const;

function readPath(source: Record<string, unknown>, path: string): unknown {
  return path.split('.').reduce<unknown>((accumulator, key) => {
    if (accumulator && typeof accumulator === 'object') {
      return (accumulator as Record<string, unknown>)[key];
    }
    return undefined;
  }, source);
}

/** يتحقّق من أن الـ webhook صادر فعلاً من Paymob وليس منتحلاً */
export function verifyPaymobHmac(
  transaction: Record<string, unknown>,
  receivedHmac: string,
): boolean {
  const secret = process.env.PAYMOB_HMAC_SECRET;
  if (!secret || !receivedHmac) return false;

  const concatenated = HMAC_FIELD_ORDER.map((field) => {
    const value = readPath(transaction, field);
    if (value === null || value === undefined) return '';
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value);
  }).join('');

  const expected = createHmac('sha512', secret).update(concatenated).digest('hex');

  // مقارنة ثابتة الزمن لتفادي تسريب المعلومات عبر توقيت المقارنة
  if (expected.length !== receivedHmac.length) return false;
  let diff = 0;
  for (let i = 0; i < expected.length; i += 1) {
    diff |= expected.charCodeAt(i) ^ receivedHmac.charCodeAt(i);
  }
  return diff === 0;
}
