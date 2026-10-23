import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import {
  CalendarDays,
  Download,
  LogOut,
  MessageSquare,
  Package,
  RefreshCw,
} from 'lucide-react';
import { AccountLoginForm } from '@/components/account-login-form';
import { PageHeader } from '@/components/page-header';
import { CancelSubscriptionButton } from '@/components/subscription-actions';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { getProduct } from '@/content/products';
import { site } from '@/content/site';
import { isDbConfigured } from '@/lib/db';
import { downloadLinksFor } from '@/lib/fulfillment';
import {
  listBookingsByEmail,
  listMessagesByEmail,
  listOrdersByEmail,
  listSubscriptionsByEmail,
  type OrderStatus,
} from '@/lib/repository';
import { currentUserEmail, isAuthConfigured } from '@/lib/session';
import { daysUntil, statusLabels, statusTones } from '@/lib/subscriptions';
import { formatDateAr, formatPrice } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'حسابي',
  description: 'تابع طلباتك ومواعيدك واشتراكاتك وحمّل منتجاتك الرقمية.',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

const orderStatusLabels: Record<OrderStatus, string> = {
  pending: 'بانتظار الدفع',
  paid: 'مدفوع',
  failed: 'فشل الدفع',
  refunded: 'مسترد',
  cancelled: 'ملغى',
};

const orderStatusTones: Record<OrderStatus, 'green' | 'gold' | 'muted' | 'navy'> = {
  pending: 'gold',
  paid: 'green',
  failed: 'muted',
  refunded: 'muted',
  cancelled: 'muted',
};

const bookingStatusLabels: Record<string, string> = {
  pending: 'بانتظار التأكيد',
  confirmed: 'مؤكَّد',
  completed: 'تم',
  cancelled: 'ملغى',
};

export default async function AccountPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const { error } = await searchParams;

  if (!isAuthConfigured() || !isDbConfigured()) {
    return (
      <>
        <PageHeader eyebrow="حسابي" title="لوحة تحكم العميل" />
        <Section>
          <Container size="narrow">
            <Card className="border-amber-200 bg-amber-50 text-center">
              <h2 className="mb-2.5 text-lg text-amber-900">لوحة الحساب غير مهيّأة بعد</h2>
              <p className="mx-auto max-w-lg text-sm leading-8 text-amber-800">
                تحتاج هذه الصفحة إلى ضبط <code className="font-mono">DATABASE_URL</code> و{' '}
                <code className="font-mono">AUTH_SECRET</code> في متغيّرات البيئة. راجِع ملف README.
                حتى ذلك الحين تصلك كل الطلبات والمواعيد على بريدك وواتساب كالمعتاد.
              </p>
            </Card>
          </Container>
        </Section>
      </>
    );
  }

  const email = await currentUserEmail();

  if (!email) {
    return (
      <>
        <PageHeader
          eyebrow="حسابي"
          title="لوحة تحكم العميل"
          description="تابع طلباتك ومواعيدك واشتراكاتك، وأعد تحميل منتجاتك الرقمية في أي وقت."
        />
        <Section>
          <Container size="narrow">
            <AccountLoginForm initialError={error} />
          </Container>
        </Section>
      </>
    );
  }

  const [orders, bookings, subscriptions, messages] = await Promise.all([
    listOrdersByEmail(email),
    listBookingsByEmail(email),
    listSubscriptionsByEmail(email),
    listMessagesByEmail(email),
  ]);

  // الروابط تُصدَر عند العرض لا عند الشراء، فتبقى صالحة كلما فتح العميل حسابه
  const requestHeaders = await headers();
  const host = requestHeaders.get('host') ?? new URL(site.url).host;
  const protocol = host.startsWith('localhost') || host.startsWith('127.') ? 'http' : 'https';
  const origin = `${protocol}://${host}`;

  const downloads = orders.flatMap((order) =>
    downloadLinksFor(order, origin).map((link) => ({ ...link, orderId: order.id })),
  );

  const stats = [
    { icon: Package, label: 'الطلبات', value: orders.length },
    { icon: CalendarDays, label: 'المواعيد', value: bookings.length },
    { icon: RefreshCw, label: 'الاشتراكات', value: subscriptions.length },
    { icon: Download, label: 'ملفات للتحميل', value: downloads.length },
  ];

  return (
    <>
      <PageHeader eyebrow="حسابي" title="لوحة التحكم" description={email} />

      <Section>
        <Container size="wide">
          <div className="mb-10 flex flex-wrap items-center justify-between gap-4">
            <div className="grid flex-1 grid-cols-2 gap-4 sm:grid-cols-4">
              {stats.map((stat) => {
                const Icon = stat.icon;
                return (
                  <Card key={stat.label} className="bg-sand-100 p-5">
                    <Icon className="mb-2.5 h-5 w-5 text-gold-600" />
                    <p className="numeric font-display text-2xl font-black text-navy-900">
                      {stat.value}
                    </p>
                    <p className="mt-0.5 text-xs font-semibold text-slate-500">{stat.label}</p>
                  </Card>
                );
              })}
            </div>

            <form action="/api/account/logout" method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-red-300 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                تسجيل الخروج
              </button>
            </form>
          </div>

          {/* ── التحميلات ── */}
          {downloads.length > 0 ? (
            <Card className="mb-6 border-emerald-200 bg-emerald-50">
              <h2 className="mb-2 flex items-center gap-2 text-lg text-emerald-900">
                <Download className="h-5 w-5" />
                منتجاتك الرقمية
              </h2>
              <p className="mb-5 text-sm text-emerald-800">
                الروابط تُجدَّد كلما فتحت هذه الصفحة، فلا تقلق من انتهاء صلاحيتها.
              </p>
              <ul className="space-y-2.5">
                {downloads.map((item) => (
                  <li
                    key={`${item.orderId}-${item.name}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-white p-4"
                  >
                    <span className="text-sm font-bold text-navy-900">{item.name}</span>
                    <a
                      href={item.url}
                      className="inline-flex items-center gap-2 rounded-lg bg-navy-900 px-4 py-2 text-sm font-bold text-white transition-colors hover:bg-navy-800"
                    >
                      <Download className="h-4 w-4" />
                      تحميل
                    </a>
                  </li>
                ))}
              </ul>
            </Card>
          ) : null}

          {/* ── الاشتراكات ── */}
          {subscriptions.length > 0 ? (
            <Card className="mb-6">
              <h2 className="mb-5 flex items-center gap-2 text-lg text-navy-900">
                <RefreshCw className="h-5 w-5 text-gold-600" />
                اشتراكاتك
              </h2>
              <div className="space-y-4">
                {subscriptions.map((subscription) => {
                  const product = getProduct(subscription.product_slug);
                  const remaining = daysUntil(subscription.current_period_end);
                  const active = subscription.status === 'active';

                  return (
                    <div
                      key={subscription.id}
                      className="rounded-xl border border-sand-200 p-5"
                    >
                      <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                        <div>
                          <p className="font-extrabold text-navy-900">
                            {product?.name ?? subscription.product_slug}
                          </p>
                          <p className="numeric mt-1 text-xs text-slate-500">
                            {subscription.id} · {subscription.period}
                          </p>
                        </div>
                        <Badge tone={statusTones[subscription.status]}>
                          {statusLabels[subscription.status]}
                        </Badge>
                      </div>

                      {subscription.current_period_end ? (
                        <p className="mb-3 text-sm leading-7 text-slate-600">
                          {subscription.cancel_at_period_end
                            ? 'أُوقف التجديد التلقائي — ينتهي في '
                            : active
                              ? 'الدورة الحالية حتى '
                              : 'انتهت في '}
                          <strong className="numeric text-navy-900">
                            {formatDateAr(subscription.current_period_end)}
                          </strong>
                          {active && remaining !== null && remaining >= 0 ? (
                            <span className="numeric text-slate-500"> (باقٍ {remaining} يوماً)</span>
                          ) : null}
                        </p>
                      ) : null}

                      {active && !subscription.cancel_at_period_end ? (
                        <CancelSubscriptionButton id={subscription.id} />
                      ) : null}

                      {subscription.status === 'past_due' ? (
                        <ButtonLink
                          href={`/store/${subscription.product_slug}`}
                          size="sm"
                          variant="gold"
                        >
                          تجديد الاشتراك
                        </ButtonLink>
                      ) : null}
                    </div>
                  );
                })}
              </div>
            </Card>
          ) : null}

          {/* ── الطلبات ── */}
          <Card className="mb-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg text-navy-900">
              <Package className="h-5 w-5 text-gold-600" />
              طلباتك
            </h2>

            {orders.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                لا توجد طلبات بعد.{' '}
                <Link href="/store" className="font-bold text-navy-900 underline">
                  تصفّح المتجر
                </Link>
              </p>
            ) : (
              <div className="space-y-4">
                {orders.map((order) => (
                  <div key={order.id} className="rounded-xl border border-sand-200 p-5">
                    <div className="mb-3 flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="numeric font-mono text-sm font-bold text-navy-900">
                          {order.id}
                        </p>
                        <p className="numeric mt-1 text-xs text-slate-500">
                          {formatDateAr(order.created_at)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone={orderStatusTones[order.status]}>
                          {orderStatusLabels[order.status]}
                        </Badge>
                        <span className="numeric font-display text-lg font-black text-navy-900">
                          {formatPrice(Number(order.total), order.currency)}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-1 text-sm text-slate-600">
                      {order.items.map((item) => (
                        <li key={item.slug}>
                          • {item.name}
                          {item.quantity > 1 ? (
                            <span className="numeric"> × {item.quantity}</span>
                          ) : null}
                        </li>
                      ))}
                    </ul>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── المواعيد ── */}
          <Card className="mb-6">
            <h2 className="mb-5 flex items-center gap-2 text-lg text-navy-900">
              <CalendarDays className="h-5 w-5 text-gold-600" />
              مواعيدك
            </h2>

            {bookings.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                لا توجد مواعيد.{' '}
                <Link href="/booking" className="font-bold text-navy-900 underline">
                  احجز استشارة
                </Link>
              </p>
            ) : (
              <div className="space-y-3">
                {bookings.map((booking) => (
                  <div
                    key={booking.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-sand-200 p-5"
                  >
                    <div>
                      <p className="font-bold text-navy-900">{booking.type}</p>
                      <p className="numeric mt-1 text-sm text-slate-600">
                        {formatDateAr(booking.slot_date)} — الساعة {booking.slot_time} ·{' '}
                        {booking.channel}
                      </p>
                    </div>
                    <Badge tone={booking.status === 'confirmed' ? 'green' : 'gold'}>
                      {bookingStatusLabels[booking.status] ?? booking.status}
                    </Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {/* ── الرسائل ── */}
          {messages.length > 0 ? (
            <Card>
              <h2 className="mb-5 flex items-center gap-2 text-lg text-navy-900">
                <MessageSquare className="h-5 w-5 text-gold-600" />
                رسائلك إلينا
              </h2>
              <div className="space-y-3">
                {messages.map((message) => (
                  <details
                    key={message.id}
                    className="rounded-xl border border-sand-200 px-5 py-4"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-navy-900">
                      {message.subject}
                      <time className="numeric shrink-0 text-xs font-normal text-slate-400">
                        {formatDateAr(message.created_at)}
                      </time>
                    </summary>
                    <p className="mt-3 whitespace-pre-wrap text-sm leading-8 text-slate-600">
                      {message.body}
                    </p>
                  </details>
                ))}
              </div>
            </Card>
          ) : null}
        </Container>
      </Section>
    </>
  );
}
