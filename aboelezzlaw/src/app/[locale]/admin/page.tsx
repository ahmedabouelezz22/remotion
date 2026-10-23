import Link from 'next/link';
import {
  BellRing,
  CalendarDays,
  CircleAlert,
  RefreshCw,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { AdminShell } from '@/components/admin/admin-shell';
import { ownerOrRedirect } from '@/components/admin/admin-gate';
import { Card } from '@/components/ui/card';
import { adminMetrics, listNotifications } from '@/lib/repository';
import { isDbConfigured } from '@/lib/db';
import { formatPrice } from '@/lib/utils';

export const dynamic = 'force-dynamic';

function Stat({
  label,
  value,
  href,
  tone = 'default',
}: {
  label: string;
  value: string;
  href?: string;
  tone?: 'default' | 'warn';
}) {
  const body = (
    <Card
      className={
        tone === 'warn'
          ? 'border-amber-300 bg-amber-50 transition-colors hover:border-amber-400'
          : 'transition-colors hover:border-gold-400/60'
      }
    >
      <p className="text-xs font-bold text-slate-500">{label}</p>
      <p className="numeric mt-2 font-display text-2xl font-black text-navy-900">{value}</p>
    </Card>
  );
  return href ? <Link href={href}>{body}</Link> : body;
}

export default async function AdminHomePage() {
  const owner = await ownerOrRedirect();

  if (!isDbConfigured()) {
    return (
      <AdminShell owner={owner} title="نظرة عامة">
        <Card className="border-amber-200 bg-amber-50">
          <p className="text-sm leading-8 text-amber-900">
            <code className="font-mono">DATABASE_URL</code> غير مضبوط، فلا توجد قاعدة بيانات
            تُقرأ منها الأرقام. الطلبات والحجوزات تُرسَل بالبريد والواتساب لكنها لا تُحفَظ — اضبط
            القاعدة من إعدادات الاستضافة لتعمل اللوحة.
          </p>
        </Card>
      </AdminShell>
    );
  }

  const [metrics, failures] = await Promise.all([
    adminMetrics(),
    listNotifications({ onlyFailures: true, limit: 5 }),
  ]);

  if (!metrics) {
    return (
      <AdminShell owner={owner} title="نظرة عامة">
        <Card className="border-red-200 bg-red-50">
          <p className="text-sm leading-8 text-red-900">
            تعذّر الاتصال بقاعدة البيانات. تحقّق من <code className="font-mono">DATABASE_URL</code>{' '}
            ومن أن القاعدة تعمل، ثم أعِد تحميل الصفحة.
          </p>
        </Card>
      </AdminShell>
    );
  }

  return (
    <AdminShell
      owner={owner}
      title="نظرة عامة"
      description="أرقام اللحظة من قاعدة البيانات. اضغط أي بطاقة لفتح تفاصيلها."
    >
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="إيراد الطلبات المدفوعة"
          value={formatPrice(metrics.revenuePaid)}
          href="/ar/admin/orders?status=paid"
        />
        <Stat
          label="طلبات بانتظار الدفع"
          value={String(metrics.ordersPending)}
          href="/ar/admin/orders?status=pending"
          tone={metrics.ordersPending > 0 ? 'warn' : 'default'}
        />
        <Stat
          label="مواعيد تنتظر التأكيد"
          value={String(metrics.bookingsPending)}
          href="/ar/admin/bookings?status=pending"
          tone={metrics.bookingsPending > 0 ? 'warn' : 'default'}
        />
        <Stat
          label="إشعارات فشلت (24 ساعة)"
          value={String(metrics.notificationFailures24h)}
          href="/ar/admin/notifications?only=failures"
          tone={metrics.notificationFailures24h > 0 ? 'warn' : 'default'}
        />
        <Stat
          label="إجمالي الطلبات"
          value={String(metrics.ordersTotal)}
          href="/ar/admin/orders"
        />
        <Stat
          label="مواعيد قادمة"
          value={String(metrics.bookingsUpcoming)}
          href="/ar/admin/bookings"
        />
        <Stat
          label="اشتراكات نشطة"
          value={String(metrics.subscriptionsActive)}
          href="/ar/admin/subscriptions?status=active"
        />
        <Stat
          label="اشتراكات متأخّرة"
          value={String(metrics.subscriptionsPastDue)}
          href="/ar/admin/subscriptions?status=past_due"
          tone={metrics.subscriptionsPastDue > 0 ? 'warn' : 'default'}
        />
        <Stat label="عملاء" value={String(metrics.customers)} href="/ar/admin/customers" />
        <Stat label="رسائل" value={String(metrics.messagesTotal)} href="/ar/admin/messages" />
      </div>

      {failures.length > 0 ? (
        <Card className="mt-8 border-red-200 bg-red-50">
          <h2 className="mb-4 flex items-center gap-2 text-base text-red-900">
            <CircleAlert className="h-5 w-5" />
            إشعارات لم تُسلَّم
          </h2>
          <ul className="space-y-2 text-sm text-red-900/90">
            {failures.map((entry) => (
              <li key={entry.id} className="leading-7">
                <span className="font-semibold">{entry.channel}</span> — {entry.kind}
                {entry.reference ? ` (${entry.reference})` : ''}:{' '}
                <span className="text-red-700">{entry.error ?? 'سبب غير معروف'}</span>
              </li>
            ))}
          </ul>
          <Link
            href="/ar/admin/notifications?only=failures"
            className="mt-4 inline-block text-sm font-bold text-red-800 underline"
          >
            كل حالات الفشل
          </Link>
        </Card>
      ) : null}

      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[
          { href: '/ar/admin/orders', label: 'إدارة الطلبات', icon: ShoppingBag },
          { href: '/ar/admin/bookings', label: 'تأكيد المواعيد', icon: CalendarDays },
          { href: '/ar/admin/subscriptions', label: 'الاشتراكات', icon: RefreshCw },
          { href: '/ar/admin/customers', label: 'سجلّ العملاء', icon: Users },
          { href: '/ar/admin/notifications', label: 'حالة الإشعارات', icon: BellRing },
        ].map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-4 py-4 text-sm font-semibold text-navy-900 transition-colors hover:border-gold-400"
          >
            <item.icon className="h-5 w-5 text-gold-600" />
            {item.label}
          </Link>
        ))}
      </div>
    </AdminShell>
  );
}
