import Link from 'next/link';
import { AdminAction } from '@/components/admin/admin-action';
import { ownerOrRedirect } from '@/components/admin/admin-gate';
import { AdminShell, AdminTable } from '@/components/admin/admin-shell';
import { Badge, Card } from '@/components/ui/card';
import { getProduct } from '@/content/products';
import { clientWaLink } from '@/lib/notifications/templates';
import { adminListOrders, type OrderStatus } from '@/lib/repository';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

const LABELS: Record<OrderStatus, string> = {
  pending: 'بانتظار الدفع',
  paid: 'مدفوع',
  failed: 'فشل الدفع',
  refunded: 'مسترد',
  cancelled: 'ملغى',
};

const TONES: Record<OrderStatus, 'green' | 'gold' | 'muted' | 'navy'> = {
  pending: 'gold',
  paid: 'green',
  failed: 'muted',
  refunded: 'navy',
  cancelled: 'muted',
};

const FILTERS: { value: OrderStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'الكل' },
  { value: 'pending', label: 'بانتظار الدفع' },
  { value: 'paid', label: 'مدفوع' },
  { value: 'refunded', label: 'مسترد' },
  { value: 'cancelled', label: 'ملغى' },
  { value: 'failed', label: 'فشل الدفع' },
];

export default async function AdminOrdersPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string }>;
}) {
  const owner = await ownerOrRedirect();
  const { status, q } = await searchParams;

  const active = FILTERS.find((filter) => filter.value === status)?.value ?? 'all';
  const orders = await adminListOrders({
    status: active === 'all' ? undefined : active,
    search: q,
    limit: 100,
  });

  return (
    <AdminShell
      owner={owner}
      title="الطلبات"
      description="حالات الطلبات تأتي من بوّابة الدفع. «تأكيد تحويل» للتحويلات البنكية واليدوية فقط، ولا يُستخدم إلا بعد أن ترى المبلغ في حسابك فعلاً."
    >
      <div className="mb-5 flex flex-wrap items-center gap-2">
        {FILTERS.map((filter) => (
          <Link
            key={filter.value}
            href={filter.value === 'all' ? '/admin/orders' : `/admin/orders?status=${filter.value}`}
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

      <form method="get" className="mb-5 flex gap-2">
        {active !== 'all' ? <input type="hidden" name="status" value={active} /> : null}
        <input
          type="search"
          name="q"
          defaultValue={q ?? ''}
          placeholder="ابحث بالمرجع أو البريد أو الاسم أو الهاتف"
          className="w-full max-w-sm rounded-xl border border-sand-300 bg-white px-4 py-2.5 text-sm text-navy-900 focus:outline-none focus:ring-2 focus:ring-gold-500/35"
        />
        <button
          type="submit"
          className="rounded-xl bg-navy-900 px-5 py-2.5 text-sm font-bold text-white"
        >
          بحث
        </button>
      </form>

      {orders.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">لا توجد طلبات مطابقة.</p>
        </Card>
      ) : (
        <AdminTable
          head={['المرجع', 'العميل', 'المنتجات', 'الإجمالي', 'الوسيلة', 'الحالة', 'التاريخ', 'إجراءات']}
        >
          {orders.map((order) => (
            <tr key={order.id} className="border-b border-sand-100 align-top last:border-0">
              <td className="px-4 py-3 font-mono text-xs text-navy-900">{order.id}</td>
              <td className="px-4 py-3">
                <p className="font-semibold text-navy-900">{order.name}</p>
                <p className="text-xs text-slate-500" dir="ltr">
                  {order.email}
                </p>
                <a
                  href={clientWaLink(order.phone, order.name) ?? `tel:${order.phone}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs font-bold text-[#128C7E] underline"
                  dir="ltr"
                >
                  {order.phone}
                </a>
              </td>
              <td className="px-4 py-3 text-xs leading-6 text-slate-600">
                {order.items.map((item) => (
                  <span key={item.slug} className="block">
                    {getProduct(item.slug)?.name ?? item.name}
                    {item.quantity > 1 ? ` ×${item.quantity}` : ''}
                  </span>
                ))}
              </td>
              <td className="numeric px-4 py-3 whitespace-nowrap font-bold text-navy-900">
                {formatPrice(order.total)}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">
                {order.method}
                {order.provider_ref ? (
                  <span className="mt-1 block font-mono text-[0.65rem] text-slate-500">
                    {order.provider_ref}
                  </span>
                ) : null}
              </td>
              <td className="px-4 py-3">
                <Badge tone={TONES[order.status]}>{LABELS[order.status]}</Badge>
              </td>
              <td className="numeric px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                {order.created_at.toLocaleDateString('ar-EG')}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-2">
                  {order.status === 'pending' ? (
                    <>
                      <AdminAction
                        endpoint="/api/admin/orders"
                        body={{ reference: order.id, action: 'confirm-transfer' }}
                        label="تأكيد تحويل"
                        tone="positive"
                        reasonLabel="رقم عملية التحويل"
                        reasonRequired
                        confirm={`أكّد أنك رأيت مبلغ ${formatPrice(order.total)} في حسابك فعلاً. سيُعلَّم الطلب مدفوعاً وتُسلَّم المنتجات الرقمية للعميل.`}
                      />
                      <AdminAction
                        endpoint="/api/admin/orders"
                        body={{ reference: order.id, action: 'cancel' }}
                        label="إلغاء"
                        tone="danger"
                        reasonLabel="سبب الإلغاء (يُرسل للعميل)"
                        confirm={`سيُلغى الطلب ${order.id} ويُبلَّغ العميل بالبريد. لا يُحصَّل أي مبلغ.`}
                      />
                    </>
                  ) : null}
                  {order.status === 'paid' ? (
                    <AdminAction
                      endpoint="/api/admin/orders"
                      body={{ reference: order.id, action: 'refund' }}
                      label="تعليم كمسترد"
                      tone="danger"
                      reasonLabel="سبب الاسترداد (يُرسل للعميل)"
                      reasonRequired
                      confirm={`هذا يسجّل الاسترداد ويُبلّغ العميل. تنفيذ الاسترداد المالي نفسه يتم من لوحة بوّابة الدفع — اللوحة لا تحرّك أموالاً.`}
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
