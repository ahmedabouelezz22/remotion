import Link from 'next/link';
import { AdminAction } from '@/components/admin/admin-action';
import { ownerOrRedirect } from '@/components/admin/admin-gate';
import { AdminShell, AdminTable } from '@/components/admin/admin-shell';
import { Badge, Card } from '@/components/ui/card';
import { clientWaLink } from '@/lib/notifications/templates';
import { adminListBookings, type BookingStatus } from '@/lib/repository';
import { formatDateAr } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const LABELS: Record<BookingStatus, string> = {
  pending: 'بانتظار التأكيد',
  confirmed: 'مؤكَّد',
  completed: 'تم',
  cancelled: 'ملغى',
};

const TONES: Record<BookingStatus, 'green' | 'gold' | 'muted' | 'navy'> = {
  pending: 'gold',
  confirmed: 'green',
  completed: 'navy',
  cancelled: 'muted',
};

const FILTERS: { value: BookingStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'بانتظار التأكيد' },
  { value: 'confirmed', label: 'مؤكَّد' },
  { value: 'completed', label: 'تم' },
  { value: 'cancelled', label: 'ملغى' },
];

export default async function AdminBookingsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; all?: string }>;
}) {
  const owner = await ownerOrRedirect();
  const { status, all } = await searchParams;

  const active = FILTERS.find((filter) => filter.value === status)?.value ?? 'all';
  const showPast = all === '1';
  const today = new Date().toISOString().slice(0, 10);

  const bookings = await adminListBookings({
    status: active === 'all' ? undefined : active,
    from: showPast ? undefined : today,
    limit: 200,
  });

  return (
    <AdminShell
      owner={owner}
      title="المواعيد"
      description="التأكيد يرسل للعميل بريداً بموعده. الإلغاء يُحرّر الموعد فوراً فيظهر متاحاً لغيره في صفحة الحجز."
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={`/admin/bookings?${new URLSearchParams({
              ...(filter.value === 'all' ? {} : { status: filter.value }),
              ...(showPast ? { all: '1' } : {}),
            })}`}
            className={
              active === filter.value
                ? 'rounded-full bg-navy-900 px-4 py-2 text-xs font-bold text-white'
                : 'rounded-full border border-sand-300 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-navy-900'
            }
          >
            {filter.label}
          </Link>
        ))}
        <Link
          href={`/admin/bookings?${new URLSearchParams({
            ...(active === 'all' ? {} : { status: active }),
            ...(showPast ? {} : { all: '1' }),
          })}`}
          className="rounded-full border border-gold-500/40 bg-gold-500/10 px-4 py-2 text-xs font-bold text-gold-600"
        >
          {showPast ? 'القادمة فقط' : 'إظهار المواعيد السابقة'}
        </Link>
      </div>

      {bookings.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">
            {showPast ? 'لا توجد مواعيد مطابقة.' : 'لا مواعيد قادمة مطابقة.'}
          </p>
        </Card>
      ) : (
        <AdminTable head={['الموعد', 'العميل', 'النوع', 'الوسيلة', 'التفاصيل', 'الحالة', 'إجراءات']}>
          {bookings.map((booking) => (
            <tr key={booking.id} className="border-b border-sand-100 align-top last:border-0">
              <td className="px-4 py-3 whitespace-nowrap">
                <p className="font-semibold text-navy-900">{formatDateAr(booking.slot_date)}</p>
                <p className="numeric text-xs text-slate-500">{booking.slot_time}</p>
                <p className="mt-1 font-mono text-[0.65rem] text-slate-500">{booking.id}</p>
              </td>
              <td className="px-4 py-3">
                <p className="font-semibold text-navy-900">{booking.name}</p>
                <p className="text-xs text-slate-500" dir="ltr">
                  {booking.email}
                </p>
                <a
                  href={clientWaLink(booking.phone, booking.name) ?? `tel:${booking.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#128C7E] underline"
                  dir="ltr"
                >
                  {booking.phone}
                </a>
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">{booking.type}</td>
              <td className="px-4 py-3 text-xs text-slate-600">{booking.channel}</td>
              <td className="max-w-[18rem] px-4 py-3 text-xs leading-6 text-slate-600">
                {booking.details || '—'}
              </td>
              <td className="px-4 py-3">
                <Badge tone={TONES[booking.status]}>{LABELS[booking.status]}</Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  {booking.status === 'pending' ? (
                    <AdminAction
                      endpoint="/api/admin/bookings"
                      body={{ id: booking.id, status: 'confirmed' }}
                      label="تأكيد"
                      tone="positive"
                      reasonLabel="ملاحظة للعميل (اختياري)"
                      confirm={`سيصل العميل بريد تأكيد بالموعد ${formatDateAr(booking.slot_date)} الساعة ${booking.slot_time}.`}
                    />
                  ) : null}
                  {booking.status === 'confirmed' ? (
                    <AdminAction
                      endpoint="/api/admin/bookings"
                      body={{ id: booking.id, status: 'completed' }}
                      label="تم التنفيذ"
                      reasonLabel="ملاحظة للعميل (اختياري)"
                      confirm="سيُعلَّم الموعد منتهياً ويصل العميل بريد شكر."
                    />
                  ) : null}
                  {booking.status === 'pending' || booking.status === 'confirmed' ? (
                    <AdminAction
                      endpoint="/api/admin/bookings"
                      body={{ id: booking.id, status: 'cancelled' }}
                      label="إلغاء"
                      tone="danger"
                      reasonLabel="سبب الإلغاء (يُرسل للعميل)"
                      confirm="سيُلغى الموعد، ويُبلَّغ العميل، ويصبح الوقت متاحاً لغيره."
                    />
                  ) : null}
                </div>
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </AdminShell>
  );
}
