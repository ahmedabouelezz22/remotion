import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getProduct } from '@/content/products';
import { site } from '@/content/site';
import { withOwner } from '@/lib/admin';
import { sendEmail } from '@/lib/notifications/email';
import { buildClientConfirmation } from '@/lib/notifications/templates';
import { getOrder, markOrderStatus } from '@/lib/repository';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * إجراءات الطلبات من لوحة المالك.
 *
 * ما لا يفعله هذا المسار بقصد: لا يُعلِّم طلباً «مدفوعاً». تعليم الدفع يأتي
 * من بوّابة الدفع (webhook موقَّع) أو من `confirm-transfer` بعد تأكيد المالك
 * لتحويل بنكي فعليّ — ولا يُؤلَّف تأكيد دفع من اللوحة.
 */
const schema = z.object({
  reference: z.string().trim().min(3),
  action: z.enum(['cancel', 'refund', 'confirm-transfer']),
  reason: z.string().trim().max(500).optional(),
});

const ACTION_STATUS = {
  cancel: 'cancelled',
  refund: 'refunded',
  'confirm-transfer': 'paid',
} as const;

export async function POST(request: Request) {
  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'صيغة الطلب غير صحيحة.' }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json({ ok: false, message: 'بيانات الإجراء غير صحيحة.' }, { status: 400 });
  }

  const { reference, action, reason } = parsed.data;

  return withOwner(request, async (owner) => {
    const order = await getOrder(reference);
    if (!order) {
      return {
        response: NextResponse.json({ ok: false, message: 'لا يوجد طلب بهذا المرجع.' }, { status: 404 }),
      };
    }

    // قيود الانتقال: لا نسترد ما لم يُدفع، ولا نؤكّد تحويلاً لطلب غير معلّق،
    // ولا نلغي طلباً مدفوعاً (الاسترداد هو طريقه الصحيح)
    const invalid =
      (action === 'refund' && order.status !== 'paid') ||
      (action === 'cancel' && order.status !== 'pending') ||
      (action === 'confirm-transfer' && order.status !== 'pending');

    if (invalid) {
      return {
        response: NextResponse.json(
          {
            ok: false,
            message: `لا يصحّ هذا الإجراء وحالة الطلب «${order.status}».`,
          },
          { status: 409 },
        ),
      };
    }

    // تأكيد التحويل يلزمه سبب يُثبت ما رآه المالك (رقم العملية مثلاً)
    if (action === 'confirm-transfer' && !reason) {
      return {
        response: NextResponse.json(
          { ok: false, message: 'أدخل مرجع التحويل أو رقم العملية قبل التأكيد.' },
          { status: 400 },
        ),
      };
    }

    const updated = await markOrderStatus(
      reference,
      ACTION_STATUS[action],
      action === 'confirm-transfer' ? `manual:${reason}` : undefined,
    );
    if (!updated) {
      return {
        response: NextResponse.json({ ok: false, message: 'تعذّر تحديث الطلب.' }, { status: 500 }),
      };
    }

    // تسليم المنتجات الرقمية بعد تأكيد التحويل يمرّ بنفس مسار الإيفاء
    // (المسؤول عن الروابط الموقّتة ومنع التكرار)، لا بنسخة ثانية منه
    if (action === 'confirm-transfer') {
      const { fulfillOrder } = await import('@/lib/fulfillment');
      await fulfillOrder(reference, new URL(request.url).origin, `manual:${reason}`);
    } else {
      const names = updated.items
        .map((item) => getProduct(item.slug)?.name ?? item.name)
        .join('، ');
      const heading = action === 'refund' ? 'تم استرداد قيمة طلبك' : 'تم إلغاء طلبك';
      const body =
        action === 'refund'
          ? `استرددنا قيمة طلبك ${reference} (${names}).${reason ? `\n\nالسبب: ${reason}` : ''}\n\nقد يستغرق وصول المبلغ إلى حسابك عدّة أيام عمل حسب وسيلة الدفع.\n\nلأي استفسار راسلنا على واتساب ${site.contact.phoneLocal}.`
          : `أُلغي طلبك ${reference} (${names}).${reason ? `\n\nالسبب: ${reason}` : ''}\n\nلم يُحصَّل منك أي مبلغ. لإعادة الطلب تفضّل بزيارة المتجر أو راسلنا على واتساب ${site.contact.phoneLocal}.`;

      const message = buildClientConfirmation({ name: updated.name, heading, body });
      await sendEmail({
        to: updated.email,
        subject: `${site.shortName} — ${heading}`,
        html: message.html,
        text: message.text,
        replyTo: site.contact.email,
      });
    }

    return {
      response: NextResponse.json({ ok: true, status: updated.status }),
      audit: {
        action: `order.${action}`,
        targetType: 'order',
        targetId: reference,
        detail: { from: order.status, to: updated.status, reason: reason ?? null, total: order.total },
      },
    };
  });
}
