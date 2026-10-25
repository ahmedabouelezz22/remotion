import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, Clock, FileText, Info } from 'lucide-react';
import { AddToCart } from '@/components/add-to-cart';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, path, type Locale } from '@/content/i18n';
import {
  getProduct,
  kindLabels,
  kindLabelsEn,
  productText,
  products,
  SHIPPING_FLAT_RATE,
} from '@/content/products';
import { site, waLink } from '@/content/site';
import { catalogueProduct } from '@/lib/catalogue';
import { formatPrice, jsonLdScript } from '@/lib/utils';

// صفحة المنتج تعرض زرّ الشراء، فحالة النشر تُقرأ في كل طلب لا وقت البناء
export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const product = getProduct(slug);
  if (!product) return { title: dict(locale).productPage.notFound };

  const text = productText(product, locale);
  return {
    title: text.name,
    description: text.summary,
    alternates: { canonical: `/${locale}/store/${product.slug}` },
    openGraph: { title: text.name, description: text.summary },
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  const product = await catalogueProduct(slug);
  if (!product) notFound();

  const text = productText(product, locale);

  const related = products
    .filter((item) => item.slug !== product.slug && item.category === product.category)
    .slice(0, 3);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: text.name,
    description: text.summary,
    offers: {
      '@type': 'Offer',
      price: product.price,
      priceCurrency: product.currency,
      availability: 'https://schema.org/InStock',
      url: `${site.url}/${locale}/store/${product.slug}`,
    },
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />

      <PageHeader eyebrow={text.category} title={text.name} description={text.summary} />

      <Section>
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1.35fr_1fr]">
            <div>
              <div className="article-body">
                <h2>{t.productPage.detailsHeading}</h2>
                <p>{text.description}</p>
              </div>

              <h2 className="mt-12 mb-5 text-xl text-navy-900">
                {t.productPage.includesHeading}
              </h2>
              <ul className="space-y-3.5">
                {text.highlights.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.95rem] leading-8 text-slate-700">
                    <CheckCircle2 className="mt-1.5 h-5 w-5 shrink-0 text-gold-600" />
                    {item}
                  </li>
                ))}
              </ul>

              {product.kind === 'digital' ? (
                <Card className="mt-10 border-emerald-200 bg-emerald-50">
                  <h3 className="mb-2 flex items-center gap-2 text-base text-emerald-900">
                    <Info className="h-5 w-5" />
                    {t.productPage.digitalTitle}
                  </h3>
                  <p className="text-sm leading-8 text-emerald-800">{t.productPage.digitalBody}</p>
                </Card>
              ) : null}

              {product.kind === 'physical' ? (
                <Card className="mt-10 border-sand-200 bg-sand-100">
                  <h3 className="mb-2 flex items-center gap-2 text-base text-navy-900">
                    <Info className="h-5 w-5 text-gold-600" />
                    {t.productPage.shippingTitle}
                  </h3>
                  <p className="text-sm leading-8 text-slate-700">
                    {t.productPage.shippingBody(formatPrice(SHIPPING_FLAT_RATE, locale))}
                  </p>
                </Card>
              ) : null}

              {product.requiresBooking ? (
                <Card className="mt-10 border-gold-400/50 bg-gold-50">
                  <h3 className="mb-2 flex items-center gap-2 text-base text-navy-900">
                    <Clock className="h-5 w-5 text-gold-600" />
                    {t.productPage.bookingTitle}
                  </h3>
                  <p className="mb-4 text-sm leading-8 text-slate-700">
                    {t.productPage.bookingBody}
                  </p>
                  <ButtonLink href={path(locale, '/booking')} variant="outline" size="sm">
                    {t.productPage.goToBooking}
                  </ButtonLink>
                </Card>
              ) : null}
            </div>

            <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <Card>
                <Badge tone="muted">
                  {locale === 'ar' ? kindLabels[product.kind] : kindLabelsEn[product.kind]}
                </Badge>

                <div className="my-5 flex items-baseline gap-2.5">
                  <span className="numeric font-display text-3xl font-black text-navy-900">
                    {formatPrice(product.price, locale)}
                  </span>
                  {product.compareAtPrice ? (
                    <span className="numeric text-base text-slate-500 line-through">
                      {formatPrice(product.compareAtPrice, locale)}
                    </span>
                  ) : null}
                  {product.billingPeriod ? (
                    <span className="text-sm font-semibold text-slate-500">
                      {t.storeExtra.billingPer(
                        t.storeExtra.billingPeriods[product.billingPeriod] ?? product.billingPeriod,
                      )}
                    </span>
                  ) : null}
                </div>

                <dl className="mb-6 space-y-2.5 border-y border-sand-200 py-4 text-sm">
                  {product.durationMinutes ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">{t.productPage.sessionLength}</dt>
                      <dd className="numeric font-bold text-navy-900">
                        {t.productPage.minutes(product.durationMinutes)}
                      </dd>
                    </div>
                  ) : null}
                  {product.pages ? (
                    <div className="flex justify-between gap-4">
                      <dt className="text-slate-500">{t.productPage.pageCount}</dt>
                      <dd className="numeric font-bold text-navy-900">{product.pages}</dd>
                    </div>
                  ) : null}
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-500">{t.productPage.category}</dt>
                    <dd className="font-bold text-navy-900">{text.category}</dd>
                  </div>
                </dl>

                <AddToCart product={product} locale={locale} />

                <p className="mt-4 text-center text-xs leading-6 text-slate-500">
                  {t.productPage.paymentNote}
                </p>
              </Card>

              <Card className="bg-sand-100">
                <h3 className="mb-2.5 flex items-center gap-2 text-base text-navy-900">
                  <FileText className="h-5 w-5 text-gold-600" />
                  {t.productPage.questionTitle}
                </h3>
                <p className="mb-5 text-sm leading-8 text-slate-600">
                  {t.productPage.questionBody}
                </p>
                <ButtonLink
                  href={waLink(t.productPage.enquiryMessage(text.name))}
                  external
                  variant="whatsapp"
                  size="sm"
                >
                  {t.store.askOnWhatsapp}
                </ButtonLink>
              </Card>
            </div>
          </div>

          {related.length > 0 ? (
            <div className="mt-16">
              <h2 className="mb-6 text-xl text-navy-900">{t.productPage.sameCategory}</h2>
              <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={path(locale, `/store/${item.slug}`)}
                    className="group block"
                  >
                    <Card hover className="h-full">
                      <h3 className="mb-2.5 text-base leading-8 text-navy-900 transition-colors group-hover:text-gold-600">
                        {productText(item, locale).name}
                      </h3>
                      <p className="mb-4 text-sm leading-7 text-slate-600">
                        {productText(item, locale).summary}
                      </p>
                      <span className="numeric font-display text-lg font-black text-navy-900">
                        {formatPrice(item.price, locale)}
                      </span>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <Link
            href={path(locale, '/store')}
            className="mt-12 inline-flex min-h-[40px] items-center gap-2 text-sm font-bold text-navy-900 transition-colors hover:text-gold-600"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            {t.store.backToStore}
          </Link>
        </Container>
      </Section>
    </>
  );
}
