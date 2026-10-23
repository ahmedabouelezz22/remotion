import { NextResponse } from 'next/server';
import { z } from 'zod';
import { site } from '@/content/site';
import { withOwner } from '@/lib/admin';
import { sendEmail } from '@/lib/notifications/email';
import { buildClientConfirmation } from '@/lib/notifications/templates';
import { adminSetBookingStatus, getBooking } from '@/lib/repository';
import { formatDateAr } from '@/lib/utils';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const schema = z.object({
  id: z.string().trim().min(3),
  status: z.enum(['confirmed', 'completed', 'cancelled']),
  note: z.string().trim().max(500).optional(),
});

const HEADINGS = {
  confirmed: 'تأكيد موعد استشارتك',
  completed: 'انتهت استشارتك',
  cancelled: 'إلغاء موعد استشارتك',
} as const;

export async function POST(request: Request) {
  return withOwner(request, schema, async ({ id, status, note }) => {
    const booking = await getBooking(id);
    if (!booking) {
      return {
        response: NextResponse.json({ ok: false, message: 'لا يوجد حجز بهذا الرقم.' }, { status: 404 }),
      };
    }

    if (booking.status === status) {
      return {
        response: NextResponse.json({ ok: false, message: 'الحجز بهذه الحالة بالفعل.' }, { status: 409 }),
      };
    }

    const updated = await adminSetBookingStatus(id, status);
    if (!updated) {
      return {
        response: NextResponse.json({ ok: false, message: 'تعذّر تحديث الحجز.' }, { status: 500 }),
      };
    }

    const when = `${formatDateAr(updated.slot_date)} الساعة ${updated.slot_time}`;
    const body =
      status === 'confirmed'
        ? `تأكيد موعدك: ${when} (بتوقيت القاهرة).\n\nنوع الاستشارة: ${updated.type}\nوسيلة التواصل: ${updated.channel}${note ? `\n\nملاحظة من المكتب: ${note}` : ''}\n\nإن طرأ ما يمنعك فأبلغنا على واتساب ${site.contact.phoneLocal} قبل الموعد.`
        : status === 'completed'
          ? `شكراً لك. انتهت استشارتك المحدّدة ${when}.${note ? `\n\nملاحظة من المكتب: ${note}` : ''}\n\nإن احتجت متابعة أو مستنداً مكتوباً فراسلنا على واتساب ${site.contact.phoneLocal}.`
          : `أُلغي موعدك المحدّد ${when}.${note ? `\n\nالسبب: ${note}` : ''}\n\nيمكنك اختيار موعد آخر من صفحة الحجز، أو مراسلتنا على واتساب ${site.contact.phoneLocal} لتحديد موعد يناسبك.`;

    const message = buildClientConfirmation({
      name: updated.name,
      heading: HEADINGS[status],
      body,
    });
    await sendEmail({
      to: updated.email,
      subject: `${site.shortName} — ${HEADINGS[status]}`,
      html: message.html,
      text: message.text,
      replyTo: site.contact.email,
    });

    return {
      response: NextResponse.json({ ok: true, status: updated.status }),
      audit: {
        action: `booking.${status}`,
        targetType: 'booking',
        targetId: id,
        detail: { from: booking.status, to: status, note: note ?? null },
      },
    };
  });
}
