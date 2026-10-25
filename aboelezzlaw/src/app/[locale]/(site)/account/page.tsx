import type { Metadata } from 'next';
import { headers } from 'next/headers';
import Link from 'next/link';
import { notFound } from 'next/navigation';
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
import { dict, isLocale, path, type Locale } from '@/content/i18n';
import { getProduct, productText } from '@/content/products';
import { site } from '@/content/site';
import { isDbConfigured } from '@/lib/db';
import { downloadLinksFor } from '@/lib/fulfillment';
import {
  type OrderStatus,
  listBookingsByEmail,
  listMessagesByEmail,
  listOrdersByEmail,
  listSubscriptionsByEmail,
} from '@/lib/repository';
import { currentUserEmail, isAuthConfigured } from '@/lib/session';
import { daysUntil, statusTones } from '@/lib/subscriptions';
import { formatDate, formatPrice } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.account.title,
    description: t.account.description,
    robots: { index: false, follow: false },
  };
}

export const dynamic = 'force-dynamic';

// درجات لون شارة حالة الطلب. النصوص تأتي من القاموس، واللون ثابت لكل حالة
const orderStatusTones: Record<OrderStatus, 'green' | 'gold' | 'muted' | 'navy'> = {
  pending: 'gold',
  paid: 'green',
  failed: 'muted',
  refunded: 'muted',
  cancelled: 'muted',
};

export default async function AccountPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ error?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  const { error } = await searchParams;

  if (!isAuthConfigured() || !isDbConfigured()) {
    return (
      <>
        <PageHeader eyebrow={t.accountPage.eyebrow} title={t.accountPage.dashboardTitle} />
        <Section>
          <Container size="narrow">
            <Card className="border-amber-200 bg-amber-50 text-center">
              <h2 className="mb-2.5 text-lg text-amber-900">
                {t.accountPage.notConfiguredTitle}
              </h2>
              <p className="mx-auto max-w-lg text-sm leading-8 text-amber-800">
                {t.accountPage.notConfiguredBody}
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
          eyebrow={t.accountPage.eyebrow}
          title={t.accountPage.dashboardTitle}
          description={t.accountPage.description}
        />
        <Section>
          <Container size="narrow">
            <AccountLoginForm locale={locale} initialError={error} />
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
    { icon: Package, label: t.account.orders, value: orders.length },
    { icon: CalendarDays, label: t.account.bookings, value: bookings.length },
    { icon: RefreshCw, label: t.account.subscriptions, value: subscriptions.length },
    { icon: Download, label: t.accountPage.filesToDownload, value: downloads.length },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t.accountPage.eyebrow}
        title={t.accountPage.dashboardShort}
        description={email}
      />

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

            <form action={`/api/account/logout?locale=${locale}`} method="post">
              <button
                type="submit"
                className="inline-flex items-center gap-2 rounded-xl border border-sand-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-600 transition-colors hover:border-red-300 hover:text-red-600"
              >
                <LogOut className="h-4 w-4" />
                {t.accountPage.logout}
              </button>
            </form>
          </div>

          {/* ── التحميلات ── */}
          {downloads.length > 0 ? (
            <Card className="mb-6 border-emerald-200 bg-emerald-50">
              <h2 className="mb-2 flex items-center gap-2 text-lg text-emerald-900">
                <Download className="h-5 w-5" />
                {t.accountPage.yourDownloads}
              </h2>
              <p className="mb-5 text-sm text-emerald-800">{t.accountPage.downloadsNote}</p>
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
                      {t.account.download}
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
                {t.accountPage.yourSubscriptions}
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
                            {product
                              ? productText(product, locale).name
                              : subscription.product_slug}
                          </p>
                          <p className="numeric mt-1 text-xs text-slate-500">
                            {subscription.id} · {subscription.period}
                          </p>
                        </div>
                        <Badge tone={statusTones[subscription.status]}>
                          {t.subscriptionStatus[subscription.status]}
                        </Badge>
                      </div>

                      {subscription.current_period_end ? (
                        <p className="mb-3 text-sm leading-7 text-slate-600">
                          {subscription.cancel_at_period_end
                            ? t.accountPage.stoppedEndsOn
                            : active
                              ? t.accountPage.currentPeriodUntil
                              : t.accountPage.endedOn}
                          <strong className="numeric text-navy-900">
                            {formatDate(subscription.current_period_end, locale)}
                          </strong>
                          {active && remaining !== null && remaining >= 0 ? (
                            <span className="numeric text-slate-500">
                              {t.accountPage.daysLeft(remaining)}
                            </span>
                          ) : null}
                        </p>
                      ) : null}

                      {active && !subscription.cancel_at_period_end ? (
                        <CancelSubscriptionButton id={subscription.id} locale={locale} />
                      ) : null}

                      {subscription.status === 'past_due' ? (
                        <ButtonLink
                          href={path(locale, `/store/${subscription.product_slug}`)}
                          size="sm"
                          variant="gold"
                        >
                          {t.accountPage.renewSubscription}
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
              {t.accountPage.yourOrders}
            </h2>

            {orders.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                {t.accountPage.noOrdersBrowse}{' '}
                <Link href={path(locale, '/store')} className="font-bold text-navy-900 underline">
                  {t.cart.browseStore}
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
                          {formatDate(order.created_at, locale)}
                        </p>
                      </div>
                      <div className="flex items-center gap-3">
                        <Badge tone={orderStatusTones[order.status]}>
                          {t.orderStatus[order.status]}
                        </Badge>
                        <span className="numeric font-display text-lg font-black text-navy-900">
                          {formatPrice(Number(order.total), locale)}
                        </span>
                      </div>
                    </div>
                    <ul className="space-y-1 text-sm text-slate-600">
                      {order.items.map((item) => (
                        <li key={item.slug}>
                          • {getProduct(item.slug) ? productText(getProduct(item.slug)!, locale).name : item.name}
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
              {t.accountPage.yourBookings}
            </h2>

            {bookings.length === 0 ? (
              <p className="py-6 text-center text-sm text-slate-500">
                {t.accountPage.noBookingsBook}{' '}
                <Link href={path(locale, '/booking')} className="font-bold text-navy-900 underline">
                  {t.servicesPage.bookConsultation}
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
                        {t.accountPage.atTime(
                          formatDate(booking.slot_date, locale),
                          booking.slot_time,
                        )}{' '}
                        · {booking.channel}
                      </p>
                    </div>
                    <Badge tone={booking.status === 'confirmed' ? 'green' : 'gold'}>
                      {t.bookingStatus[booking.status as keyof typeof t.bookingStatus] ??
                        booking.status}
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
                {t.accountPage.yourMessages}
              </h2>
              <div className="space-y-3">
                {messages.map((message) => (
                  <details
                    key={message.id}
                    className="rounded-xl border border-sand-200 px-5 py-4"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-navy-900">
                      {message.subject}
                      <time className="numeric shrink-0 text-xs font-normal text-slate-500">
                        {formatDate(message.created_at, locale)}
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
