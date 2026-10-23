import { ownerOrRedirect } from '@/components/admin/admin-gate';
import { AdminShell, AdminTable } from '@/components/admin/admin-shell';
import { Card } from '@/components/ui/card';
import { listAudit } from '@/lib/repository';

export const dynamic = 'force-dynamic';

const ACTIONS: Record<string, string> = {
  'admin.login.requested': 'طلب رابط دخول إداري',
  'admin.login.success': 'دخول إداري ناجح',
  'admin.login.denied': 'محاولة دخول ببريد غير مصرَّح',
  'admin.login.revoked': 'رابط لبريد سُحبت صلاحيته',
  'order.cancel': 'إلغاء طلب',
  'order.refund': 'تعليم طلب كمسترد',
  'order.confirm-transfer': 'تأكيد تحويل بنكي',
  'booking.confirmed': 'تأكيد موعد',
  'booking.completed': 'إنهاء موعد',
  'booking.cancelled': 'إلغاء موعد',
  'subscription.stop-renewal': 'إيقاف تجديد اشتراك',
  'subscription.resume-renewal': 'إعادة تجديد اشتراك',
  'subscription.cancel-now': 'إلغاء اشتراك فوري',
  'product.publish': 'نشر منتج',
  'product.unpublish': 'سحب منتج',
};

export default async function AdminAuditPage() {
  const owner = await ownerOrRedirect();
  const entries = await listAudit(200);

  return (
    <AdminShell
      owner={owner}
      title="سجلّ التدقيق"
      description="كل إجراء إداري وكل محاولة دخول مسجَّلة هنا: من فعل، وماذا، ومتى، وعلى أي سجلّ. السجلّ يُكتب على الخادم ولا يُعدَّل من اللوحة."
    >
      {entries.length === 0 ? (
        <Card>
          <p className="text-sm text-slate-600">لا سجلّات بعد.</p>
        </Card>
      ) : (
        <AdminTable head={['الوقت', 'المنفِّذ', 'الإجراء', 'السجلّ', 'التفاصيل']}>
          {entries.map((entry) => (
            <tr key={entry.id} className="border-b border-sand-100 align-top last:border-0">
              <td className="numeric px-4 py-3 whitespace-nowrap text-xs text-slate-500">
                {entry.created_at.toLocaleString('ar-EG')}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600" dir="ltr">
                {entry.actor_email}
              </td>
              <td className="px-4 py-3 text-xs font-semibold text-navy-900">
                {ACTIONS[entry.action] ?? entry.action}
              </td>
              <td className="px-4 py-3 text-xs text-slate-600">
                {entry.target_type}
                {entry.target_id ? (
                  <span className="mt-1 block font-mono text-[0.65rem] text-slate-500">
                    {entry.target_id}
                  </span>
                ) : null}
              </td>
              <td className="max-w-[24rem] px-4 py-3 font-mono text-[0.65rem] leading-5 text-slate-500">
                {entry.detail ? JSON.stringify(entry.detail) : '—'}
              </td>
            </tr>
          ))}
        </AdminTable>
      )}
    </AdminShell>
  );
}
