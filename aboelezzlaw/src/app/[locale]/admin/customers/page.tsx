import { ownerOrRedirect } from '@/components/admin/admin-gate';
import { AdminShell, AdminTable } from '@/components/admin/admin-shell';
import { Card } from '@/components/ui/card';
import { clientWaLink } from '@/lib/notifications/templates';
import { adminListCustomers } from '@/lib/repository';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

export default async function AdminCustomersPage() {
  const owner = await ownerOrRedirect();
  const customers = await adminListCustomers(200);

  return (
    <AdminShell
      owner={owner}
      title="العملاء"
      description="لا يوجد جدول عملاء مستقل: السجلّ مجمَّع من الطلبات والحجوزات والاشتراكات بالبريد الإلكتروني. لا نحفظ كلمات مرور ولا بيانات بطاقات."
    >
      {customers.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">لا يوجد عملاء بعد.</p>
        </Card>
      ) : (
        <AdminTable
          head={['العميل', 'الطلبات', 'المدفوعة', 'إجمالي الإنفاق', 'الحجوزات', 'الاشتراكات', 'آخر نشاط']}
        >
          {customers.map((customer) => (
            <tr key={customer.email} className="border-b border-sand-100 last:border-0">
              <td className="px-4 py-3">
                <p className="font-semibold text-navy-900">{customer.name}</p>
                <p className="text-xs text-slate-500" dir="ltr">
                  {customer.email}
                </p>
                {customer.phone ? (
                  <a
                    href={clientWaLink(customer.phone, customer.name) ?? `tel:${customer.phone}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-xs font-bold text-whatsapp-700 underline"
                    dir="ltr"
                  >
                    {customer.phone}
                  </a>
                ) : null}
              </td>
              <td className="numeric px-4 py-3 text-sm text-slate-600">{customer.orders}</td>
              <td className="numeric px-4 py-3 text-sm text-slate-600">{customer.paid_orders}</td>
              <td className="numeric px-4 py-3 whitespace-nowrap font-bold text-navy-900">
                {formatPrice(customer.spent)}
              </td>
              <td className="numeric px-4 py-3 text-sm text-slate-600">{customer.bookings}</td>
              <td className="numeric px-4 py-3 text-sm text-slate-600">{customer.subscriptions}</td>
              <td className="numeric px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                {customer.last_activity.toLocaleDateString('ar-EG')}
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </AdminShell>
  );
}
