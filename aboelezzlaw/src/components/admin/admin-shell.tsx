import Link from 'next/link';
import {
  BellRing,
  CalendarDays,
  LayoutDashboard,
  LogOut,
  MessageSquare,
  Package,
  RefreshCw,
  ScrollText,
  ShoppingBag,
  Users,
} from 'lucide-react';
import { site } from '@/content/site';

const links = [
  { href: '/admin', label: 'نظرة عامة', icon: LayoutDashboard },
  { href: '/admin/orders', label: 'الطلبات', icon: ShoppingBag },
  { href: '/admin/bookings', label: 'المواعيد', icon: CalendarDays },
  { href: '/admin/subscriptions', label: 'الاشتراكات', icon: RefreshCw },
  { href: '/admin/customers', label: 'العملاء', icon: Users },
  { href: '/admin/products', label: 'المنتجات', icon: Package },
  { href: '/admin/messages', label: 'الرسائل', icon: MessageSquare },
  { href: '/admin/notifications', label: 'الإشعارات', icon: BellRing },
  { href: '/admin/audit', label: 'سجلّ التدقيق', icon: ScrollText },
];

export function AdminShell({
  owner,
  title,
  description,
  children,
}: {
  owner: string;
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <>
      <header className="border-b border-navy-800 bg-navy-900 text-white">
        <div className="mx-auto flex max-w-7xl flex-wrap items-center justify-between gap-4 px-5 py-4 sm:px-8">
          <div>
            <p className="text-xs font-bold tracking-[0.2em] text-gold-400">لوحة الإدارة</p>
            <p className="text-sm text-navy-100/80">{site.shortName}</p>
          </div>
          <div className="flex items-center gap-3">
            <span className="hidden text-xs text-navy-100/70 sm:inline" dir="ltr">
              {owner}
            </span>
            <form action="/api/admin/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-lg border border-navy-700 px-3 py-2 text-xs font-semibold text-navy-100 transition-colors hover:border-gold-400 hover:text-gold-400"
              >
                <LogOut className="h-4 w-4" />
                خروج
              </button>
            </form>
          </div>
        </div>
        <nav className="mx-auto max-w-7xl overflow-x-auto px-5 sm:px-8">
          <ul className="flex gap-1 pb-2">
            {links.map((link) => (
              <li key={link.href}>
                <Link
                  href={link.href}
                  className="inline-flex shrink-0 items-center gap-2 rounded-lg px-3 py-2 text-[0.82rem] font-semibold text-navy-100/80 transition-colors hover:bg-navy-800 hover:text-white"
                >
                  <link.icon className="h-4 w-4" />
                  {link.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-7xl flex-1 px-5 py-8 sm:px-8">
        <h1 className="text-xl text-navy-900 sm:text-2xl">{title}</h1>
        {description ? (
          <p className="mt-2 max-w-3xl text-sm leading-7 text-slate-600">{description}</p>
        ) : null}
        <div className="mt-8">{children}</div>
      </main>
    </>
  );
}

export function AdminTable({
  head,
  children,
  empty,
}: {
  head: string[];
  children: React.ReactNode;
  empty?: string;
}) {
  return (
    <div className="overflow-x-auto rounded-2xl border border-sand-200 bg-white">
      <table className="w-full min-w-[46rem] border-collapse text-start text-sm">
        <thead>
          <tr className="border-b border-sand-200 bg-sand-50">
            {head.map((cell) => (
              <th
                key={cell}
                className="whitespace-nowrap px-4 py-3 text-start text-xs font-bold text-slate-500"
              >
                {cell}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
      {empty ? <p className="px-4 py-8 text-center text-sm text-slate-500">{empty}</p> : null}
    </div>
  );
}
