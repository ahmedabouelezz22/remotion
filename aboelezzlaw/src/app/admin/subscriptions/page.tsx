import Link from 'next/link';
import { AdminAction } from '@/components/admin/admin-action';
import { ownerOrRedirect } from '@/components/admin/admin-gate';
import { AdminShell, AdminTable } from '@/components/admin/admin-shell';
import { Badge, Card } from '@/components/ui/card';
import { getProduct } from '@/content/products';
import { clientWaLink } from '@/lib/notifications/templates';
import { adminListSubscriptions, type SubscriptionStatus } from '@/lib/repository';
import { statusLabels, statusTones } from '@/lib/subscriptions';

export const dynamic = 'force-dynamic';

const FILTERS: { value: SubscriptionStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'active', label: 'نشط' },
  { value: 'past_due', label: 'متأخّر' },
  { value: 'pending', label: 'قيد التفعيل' },
  { value: 'cancelled', label: 'ملغى' },
  { value: 'expired', label: 'منتهٍ' },
];

export default async function AdminSubscriptionsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const owner = await ownerOrRedirect();
  const { status } = await searchParams;

  const active = FILTERS.find((filter) => filter.value === status)?.value ?? 'all';
  const subscriptions = await adminListSubscriptions({
    status: active === 'all' ? undefined : active,
    limit: 200,
  });

  return (
    <AdminShell
      owner={owner}
      title="الاشتراكات"
      description="اشتراكات PayPal تُوقَف عند PayPal أولاً ثم عندنا — فإيقافها عندنا وحده يترك المزوّد يسحب دفعة أخرى. إن تعذّر الإيقاف عند PayPal ستظهر لك رسالة صريحة بذلك."
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={
              filter.value === 'all'
                ? '/admin/subscriptions'
                : `/admin/subscriptions?status=${filter.value}`
            }
            className={
              active === filter.value
                ? 'rounded-full bg-navy-900 px-4 py-2 text-xs font-bold text-white'
                : 'rounded-full border border-sand-300 bg-white px-4 py-2 text-xs font-bold text-slate-600 hover:border-navy-900'
            }
          >
            {filter.label}
          </Link>
        ))}
      </div>

      {subscriptions.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">لا توجد اشتراكات مطابقة.</p>
        </Card>
      ) : (
        <AdminTable
          head={['الاشتراك', 'العميل', 'الباقة', 'الدورة الحالية', 'المزوّد', 'الحالة', 'إجراءات']}
        >
          {subscriptions.map((subscription) => (
            <tr key={subscription.id} className="border-b border-sand-100 align-top last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-navy-900">{subscription.id}</td>
              <td className="px-4 py-3">
                <p className="font-semibold text-navy-900">{subscription.name}</p>
                <p className="text-xs text-slate-500" dir="ltr">
                  {subscription.email}
                </p>
                <a
                  href={clientWaLink(subscription.phone, subscription.name) ?? `tel:${subscription.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#128C7E] underline"
                  dir="ltr"
                >
                  {subscription.phone}
                </a>
              </td>
              <td className="px-4 py-3 text-xs leading-6 text-slate-600">
                {getProduct(subscription.product_slug)?.name ?? subscription.product_slug}
                <span className="block text-slate-400">{subscription.period}</span>
              </td>
              <td className="numeric px-4 py-3 whitespace-nowrap text-xs text-slate-600">
                {subscription.current_period_end
                  ? subscription.current_period_end.toLocaleDateString('ar-EG')
                  : '—'}
                {subscription.cancel_at_period_end ? (
                  <span className="mt-1 block text-[0.65rem] font-bold text-amber-700">
                    لن يُجدَّد
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">
                {subscription.provider}
                {subscription.provider_subscription_id ? (
                  <span className="mt-1 block font-mono text-[0.65rem] text-slate-400">
                    {subscription.provider_subscription_id}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <Badge tone={statusTones[subscription.status]}>
                  {statusLabels[subscription.status]}
                </Badge>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  {!subscription.cancel_at_period_end &&
                  (subscription.status === 'active' || subscription.status === 'past_due') ? (
                    <AdminAction
                      endpoint="/api/admin/subscriptions"
                      body={{ id: subscription.id, action: 'stop-renewal' }}
                      label="إيقاف التجديد"
                      reasonLabel="السبب (يُرسل للعميل)"
                      confirm="يظلّ الاشتراك فعّالاً حتى نهاية الدورة المدفوعة ثم يتوقّف. يُبلَّغ العميل بالبريد."
                    />
                  ) : null}
                  {subscription.cancel_at_period_end && subscription.status !== 'cancelled' ? (
                    <AdminAction
                      endpoint="/api/admin/subscriptions"
                      body={{ id: subscription.id, action: 'resume-renewal' }}
                      label="إعادة التجديد"
                      tone="positive"
                      confirm="سيُستأنف التجديد التلقائي ويُبلَّغ العميل. إن كان اشتراك PayPal قد أُوقف عندهم فأعِد تفعيله من لوحة PayPal أيضاً."
                    />
                  ) : null}
                  {subscription.status !== 'cancelled' ? (
                    <AdminAction
                      endpoint="/api/admin/subscriptions"
                      body={{ id: subscription.id, action: 'cancel-now' }}
                      label="إلغاء فوري"
                      tone="danger"
                      reasonLabel="سبب الإلغاء (يُرسل للعميل)"
                      reasonRequired
                      confirm="سيتوقّف التحصيل وتنتهي الخدمة فوراً دون انتظار نهاية الدورة. إن بقيت مدة مدفوعة فاستردّها للعميل من لوحة الدفع."
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
