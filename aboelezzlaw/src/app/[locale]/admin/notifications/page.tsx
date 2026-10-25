import Link from 'next/link';
import { CheckCircle2, XCircle } from 'lucide-react';
import { ownerOrRedirect } from '@/components/admin/admin-gate';
import { AdminShell, AdminTable } from '@/components/admin/admin-shell';
import { Card } from '@/components/ui/card';
import { listNotifications } from '@/lib/repository';

export const dynamic = 'force-dynamic';

const CHANNELS: Record<string, string> = {
  email: 'بريد المكتب',
  whatsapp: 'واتساب',
  telegram: 'تلجرام',
  clientConfirmation: 'تأكيد العميل',
};

const KINDS: Record<string, string> = {
  contact: 'رسالة اتصل بنا',
  booking: 'حجز استشارة',
  'order-created': 'طلب جديد',
  'payment-succeeded': 'دفعة ناجحة',
  'payment-failed': 'دفعة فاشلة',
  'subscription-pending': 'اشتراك قيد التفعيل',
  'subscription-activated': 'اشتراك مُفعَّل',
  'subscription-failed': 'اشتراك لم يكتمل',
  'subscription-cancel-request': 'طلب إيقاف تجديد',
  'subscriptions-cron': 'ملخّص الاشتراكات',
};

export default async function AdminNotificationsPage({
  searchParams,
}: {
  searchParams: Promise<{ only?: string }>;
}) {
  const owner = await ownerOrRedirect();
  const { only } = await searchParams;
  const onlyFailures = only === 'failures';

  const entries = await listNotifications({ onlyFailures, limit: 200 });

  return (
    <AdminShell
      owner={owner}
      title="حالة الإشعارات"
      description="هذا السجلّ هو ما يمنع تكرار العيب الأصلي: الموقع القديم كان يفشل في إبلاغك بصمت. كل محاولة إشعار تُسجَّل هنا بقناتها ونتيجتها."
    >
      <div className="mb-5 flex gap-2">
        <Link
          href="/ar/admin/notifications"
          className={
            onlyFailures
              ? 'rounded-full border border-sand-300 bg-white px-4 py-2 text-xs font-bold text-slate-600'
              : 'rounded-full bg-navy-900 px-4 py-2 text-xs font-bold text-white'
          }
        >
          الكل
        </Link>
        <Link
          href="/ar/admin/notifications?only=failures"
          className={
            onlyFailures
              ? 'rounded-full bg-red-600 px-4 py-2 text-xs font-bold text-white'
              : 'rounded-full border border-red-200 bg-white px-4 py-2 text-xs font-bold text-red-700'
          }
        >
          الفشل فقط
        </Link>
      </div>

      {entries.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">
            {onlyFailures
              ? 'لا حالات فشل مسجّلة — كل الإشعارات وصلت.'
              : 'لا إشعارات مسجّلة بعد.'}
          </p>
        </Card>
      ) : (
        <AdminTable head={['الوقت', 'الحدث', 'القناة', 'المرجع', 'النتيجة', 'الخطأ']}>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-sand-100 align-top last:border-0">
              <td className="numeric px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                {entry.created_at.toLocaleString('ar-EG')}
              </td>
              <td className="px-4 py-3 text-xs text-navy-900">{KINDS[entry.kind] ?? entry.kind}</td>
              <td className="px-4 py-3 text-xs text-slate-600">
                {CHANNELS[entry.channel] ?? entry.channel}
              </td>
              <td className="px-4 py-3 font-mono text-[0.65rem] text-slate-500">
                {entry.reference ?? '—'}
              </td>
              <td className="px-4 py-3">
                {entry.ok ? (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700">
                    <CheckCircle2 className="h-4 w-4" />
                    وصل
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-xs font-bold text-red-700">
                    <XCircle className="h-4 w-4" />
                    فشل
                  </span>
                )}
              </td>
              <td className="max-w-[22rem] px-4 py-3 text-xs leading-6 text-red-700">
                {entry.error ?? ''}
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </AdminShell>
  );
}
