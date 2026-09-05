import type { OrderDraft, PaymentInitResult, PaymentProvider } from './types';

/**
 * تكامل PayPal عبر Orders API v2.
 *
 * المتغيّرات المطلوبة:
 *   PAYPAL_CLIENT_ID
 *   PAYPAL_CLIENT_SECRET
 *   PAYPAL_ENV = sandbox | live        (الافتراضي sandbox)
 *   PAYPAL_CURRENCY = USD              (باي بال لا يدعم الجنيه المصري)
 *   PAYPAL_EGP_RATE = 50               (سعر تحويل الجنيه إلى عملة باي بال)
 *   PAYPAL_PLANS                       (خطط الاشتراك: {"package-basic":"P-XXXX"})
 *
 * التوثيق: https://developer.paypal.com/docs/api/orders/v2/
 */

function apiBase(): string {
  return process.env.PAYPAL_ENV === 'live'
    ? 'https://api-m.paypal.com'
    : 'https://api-m.sandbox.paypal.com';
}

async function accessToken(): Promise<string | null> {
  const id = process.env.PAYPAL_CLIENT_ID;
  const secret = process.env.PAYPAL_CLIENT_SECRET;
  if (!id || !secret) return null;

  try {
    const res = await fetch(`${apiBase()}/v1/oauth2/token`, {
      method: 'POST',
      headers: {
        Authorization: `Basic ${Buffer.from(`${id}:${secret}`).toString('base64')}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: 'grant_type=client_credentials',
    });
    if (!res.ok) {
      console.error('[paypal] فشل الحصول على رمز الوصول', res.status, await res.text());
      return null;
    }
    const data = (await res.json()) as { access_token?: string };
    return data.access_token ?? null;
  } catch (error) {
    console.error('[paypal] خطأ شبكة أثناء المصادقة', error);
    return null;
  }
}

/** يحوّل المبلغ من الجنيه المصري إلى عملة حساب باي بال */
export function convertToPaypalCurrency(amountEgp: number): {
  amount: string;
  currency: string;
} {
  const currency = process.env.PAYPAL_CURRENCY || 'USD';
  const rate = Number(process.env.PAYPAL_EGP_RATE || 50);
  const converted = currency === 'EGP' ? amountEgp : amountEgp / (rate > 0 ? rate : 50);
  return { amount: converted.toFixed(2), currency };
}

export const paypal: PaymentProvider = {
  id: 'paypal',
  label: 'PayPal',
  description: 'ادفع بحسابك على PayPal أو ببطاقة دولية — مناسب للعملاء خارج مصر.',

  isConfigured() {
    return Boolean(process.env.PAYPAL_CLIENT_ID && process.env.PAYPAL_CLIENT_SECRET);
  },

  async createPayment(order: OrderDraft, origin: string): Promise<PaymentInitResult> {
    const token = await accessToken();
    if (!token) return { ok: false, error: 'تعذّر الاتصال بـ PayPal.' };

    const { amount, currency } = convertToPaypalCurrency(order.total);

    try {
      const res = await fetch(`${apiBase()}/v2/checkout/orders`, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          // يمنع إنشاء طلب مكرّر إذا أُعيد إرسال الطلب
          'PayPal-Request-Id': order.reference,
        },
        body: JSON.stringify({
          intent: 'CAPTURE',
          purchase_units: [
            {
              reference_id: order.reference,
              custom_id: order.reference,
              description: `طلب رقم ${order.reference}`,
              amount: { currency_code: currency, value: amount },
            },
          ],
          payment_source: {
            paypal: {
              experience_context: {
                brand_name: 'Aboelezz Law Firm',
                locale: 'ar-EG',
                user_action: 'PAY_NOW',
                return_url: `${origin}/api/payments/paypal/capture?ref=${encodeURIComponent(order.reference)}`,
                cancel_url: `${origin}/checkout?cancelled=1`,
              },
            },
          },
        }),
      });

      if (!res.ok) {
        console.error('[paypal] فشل إنشاء الطلب', res.status, await res.text());
        return { ok: false, error: 'تعذّر بدء الدفع عبر PayPal.' };
      }

      const data = (await res.json()) as {
        links?: Array<{ rel: string; href: string }>;
      };
      const approve = data.links?.find((link) => link.rel === 'payer-action' || link.rel === 'approve');
      if (!approve) return { ok: false, error: 'استجابة غير متوقعة من PayPal.' };

      return { ok: true, kind: 'redirect', url: approve.href };
    } catch (error) {
      console.error('[paypal] خطأ شبكة', error);
      return { ok: false, error: 'تعذّر الاتصال بـ PayPal.' };
    }
  },
};

/** يُنفَّذ بعد عودة العميل من PayPal لتحصيل المبلغ فعلياً */
export async function capturePaypalOrder(
  orderId: string,
): Promise<{ ok: boolean; status?: string; error?: string }> {
  const token = await accessToken();
  if (!token) return { ok: false, error: 'تعذّر الاتصال بـ PayPal.' };

  try {
    const res = await fetch(`${apiBase()}/v2/checkout/orders/${orderId}/capture`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
    });
    const data = (await res.json()) as { status?: string };
    if (!res.ok) {
      console.error('[paypal] فشل التحصيل', res.status, data);
      return { ok: false, error: 'فشل تحصيل الدفعة.' };
    }
    return { ok: data.status === 'COMPLETED', status: data.status };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

// ═══════════════════════ الاشتراكات المتكرّرة ═══════════════════════
//
// التجديد التلقائي الحقيقي يتطلّب خطة (Plan) منشأة مسبقاً في لوحة PayPal.
// نربط كل منتج اشتراك بمعرّف خطته عبر متغيّر PAYPAL_PLANS بصيغة JSON:
//   PAYPAL_PLANS={"package-basic":"P-1AB...","package-business":"P-2CD..."}
// التوثيق: https://developer.paypal.com/docs/api/subscriptions/v1/

/** يقرأ خريطة المنتجات إلى خطط PayPal من متغيّرات البيئة */
export function paypalPlans(): Record<string, string> {
  const raw = process.env.PAYPAL_PLANS;
  if (!raw) return {};
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return {};
    return Object.fromEntries(
      Object.entries(parsed as Record<string, unknown>)
        .filter(([, value]) => typeof value === 'string' && value.length > 0)
        .map(([key, value]) => [key, value as string]),
    );
  } catch {
    console.error('[paypal] قيمة PAYPAL_PLANS ليست JSON صالحاً — تُتجاهل خطط الاشتراك');
    return {};
  }
}

export const planIdFor = (slug: string): string | undefined => paypalPlans()[slug];

export interface SubscriptionInit {
  planId: string;
  reference: string;
  customer: { name: string; email: string };
  origin: string;
}

/** ينشئ اشتراكاً متكرّراً ويُرجع رابط الموافقة ومعرّف الاشتراك */
export async function createPaypalSubscription(
  input: SubscriptionInit,
): Promise<
  { ok: true; approveUrl: string; subscriptionId: string } | { ok: false; error: string }
> {
  const token = await accessToken();
  if (!token) return { ok: false, error: 'تعذّر الاتصال بـ PayPal.' };

  const parts = input.customer.name.trim().split(/\s+/);

  try {
    const res = await fetch(`${apiBase()}/v1/billing/subscriptions`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'PayPal-Request-Id': input.reference,
      },
      body: JSON.stringify({
        plan_id: input.planId,
        custom_id: input.reference,
        subscriber: {
          name: { given_name: parts[0] || 'NA', surname: parts.slice(1).join(' ') || 'NA' },
          email_address: input.customer.email,
        },
        application_context: {
          brand_name: 'Abo Elezz Law Firm',
          locale: 'ar-EG',
          user_action: 'SUBSCRIBE_NOW',
          shipping_preference: 'NO_SHIPPING',
          return_url: `${input.origin}/api/payments/paypal/subscription?ref=${encodeURIComponent(input.reference)}`,
          cancel_url: `${input.origin}/checkout?cancelled=1`,
        },
      }),
    });

    if (!res.ok) {
      console.error('[paypal] فشل إنشاء الاشتراك', res.status, await res.text());
      return { ok: false, error: 'تعذّر بدء الاشتراك عبر PayPal.' };
    }

    const data = (await res.json()) as {
      id?: string;
      links?: Array<{ rel: string; href: string }>;
    };
    const approve = data.links?.find((link) => link.rel === 'approve');
    if (!approve || !data.id) {
      return { ok: false, error: 'استجابة غير متوقعة من PayPal.' };
    }

    return { ok: true, approveUrl: approve.href, subscriptionId: data.id };
  } catch (error) {
    console.error('[paypal] خطأ شبكة أثناء إنشاء الاشتراك', error);
    return { ok: false, error: 'تعذّر الاتصال بـ PayPal.' };
  }
}

/** يقرأ حالة الاشتراك وموعد الدفعة التالية بعد عودة العميل من PayPal */
export async function getPaypalSubscription(subscriptionId: string): Promise<{
  ok: boolean;
  status?: string;
  nextBillingTime?: string;
  customId?: string;
  error?: string;
}> {
  const token = await accessToken();
  if (!token) return { ok: false, error: 'تعذّر الاتصال بـ PayPal.' };

  try {
    const res = await fetch(`${apiBase()}/v1/billing/subscriptions/${subscriptionId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) {
      console.error('[paypal] تعذّر قراءة الاشتراك', res.status, await res.text());
      return { ok: false, error: 'تعذّر قراءة حالة الاشتراك.' };
    }

    const data = (await res.json()) as {
      status?: string;
      custom_id?: string;
      billing_info?: { next_billing_time?: string };
    };

    return {
      ok: true,
      status: data.status,
      nextBillingTime: data.billing_info?.next_billing_time,
      customId: data.custom_id,
    };
  } catch (error) {
    return { ok: false, error: (error as Error).message };
  }
}

/** يلغي الاشتراك لدى PayPal فيتوقّف التجديد التلقائي */
export async function cancelPaypalSubscription(
  subscriptionId: string,
  reason = 'بناءً على طلب العميل',
): Promise<boolean> {
  const token = await accessToken();
  if (!token) return false;

  try {
    const res = await fetch(`${apiBase()}/v1/billing/subscriptions/${subscriptionId}/cancel`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ reason }),
    });
    // 204 = أُلغي بنجاح
    return res.status === 204;
  } catch (error) {
    console.error('[paypal] فشل إلغاء الاشتراك', error);
    return false;
  }
}
