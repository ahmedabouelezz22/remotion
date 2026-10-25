import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  Building2,
  Calculator,
  CheckCircle2,
  FileText,
  MessageSquare,
  Scale,
  ShieldCheck,
  Users,
} from 'lucide-react';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section, SectionHeading } from '@/components/ui/container';
import { blogCategoryLabelsEn, sortedArticles } from '@/content/blog';
import { faqs, faqText } from '@/content/faq';
import { dict, isLocale, path, type Locale } from '@/content/i18n';
import { productText, products } from '@/content/products';
import { serviceText, services } from '@/content/services';
import { site, waLink } from '@/content/site';
import { formatDate, formatPrice } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return { alternates: { canonical: `/${raw}` } };
}

const iconMap = {
  building: Building2,
  'file-text': FileText,
  calculator: Calculator,
  users: Users,
  scale: Scale,
  'shield-check': ShieldCheck,
} as const;

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  const featuredProducts = products.filter((product) => product.featured).slice(0, 3);
  const latestArticles = sortedArticles.slice(0, 3);
  const articleText = (article: (typeof sortedArticles)[number]) =>
    locale === 'ar' ? { title: article.title, excerpt: article.excerpt } : article.en;

  return (
    <>
      {/* ── القسم الافتتاحي ── */}
      <section className="relative overflow-hidden bg-navy-900 text-white">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-0 opacity-[0.07]"
          style={{
            backgroundImage:
              'radial-gradient(circle at 18% 22%, #c9a227 0, transparent 42%), radial-gradient(circle at 82% 72%, #ffffff 0, transparent 38%)',
          }}
        />
        <Container size="wide" className="relative py-20 sm:py-28">
          <div className="grid items-center gap-14 lg:grid-cols-[1.15fr_1fr]">
            <div>
              <span className="mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/35 bg-gold-500/10 px-4 py-1.5 text-xs font-bold tracking-wide text-gold-300">
                <ShieldCheck className="h-3.5 w-3.5" />
                {t.home.heroBadge}
              </span>

              <h1 className="text-3xl leading-[1.35] sm:text-4xl lg:text-[2.85rem]">
                {t.home.heroTitle1}
                <span className="block text-gold-400">{t.home.heroTitle2}</span>
              </h1>

              <p className="mt-6 max-w-xl text-[1.05rem] leading-9 text-navy-100/85">
                {t.home.heroBody}
              </p>

              <div className="mt-9 flex flex-wrap gap-3">
                <ButtonLink href={path(locale, '/booking')} variant="gold" size="lg">
                  {t.home.heroCta}
                  <ArrowRight className="h-4 w-4 rtl:rotate-180" />
                </ButtonLink>
                <ButtonLink
                  href={waLink(t.home.heroWhatsappMessage)}
                  external
                  variant="whatsapp"
                  size="lg"
                >
                  <MessageSquare className="h-4 w-4" />
                  {t.home.heroWhatsapp}
                </ButtonLink>
              </div>

              <dl className="mt-12 grid max-w-lg grid-cols-3 gap-6 border-t border-white/12 pt-8">
                {t.home.stats.map((stat) => (
                  <div key={stat.label}>
                    <dt className="sr-only">{stat.label}</dt>
                    <dd>
                      <span
                        className="numeric block font-display text-2xl font-black text-gold-400"
                        dir="ltr"
                      >
                        {stat.value}
                      </span>
                      <span className="mt-1 block text-xs leading-6 text-navy-100/65">
                        {stat.label}
                      </span>
                    </dd>
                  </div>
                ))}
              </dl>
            </div>

            <Card className="border-white/12 bg-white/[0.06] backdrop-blur-sm">
              <h2 className="mb-1 text-lg font-extrabold text-white">{t.home.howTitle}</h2>
              <p className="mb-6 text-sm text-navy-100/70">{t.home.howBody}</p>
              <ol className="space-y-5">
                {t.home.steps.map((item) => (
                  <li key={item.step} className="flex gap-4">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-gold-500 font-display text-sm font-black text-navy-950">
                      {item.step}
                    </span>
                    <div>
                      <h3 className="text-[0.95rem] font-bold text-white">{item.title}</h3>
                      <p className="mt-1 text-sm leading-7 text-navy-100/70">{item.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            </Card>
          </div>
        </Container>
      </section>

      {/* ── الخدمات ── */}
      <Section>
        <Container size="wide">
          <SectionHeading
            eyebrow={t.home.servicesEyebrow}
            title={t.home.servicesTitle}
            description={t.home.servicesDescription}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service) => {
              const Icon = iconMap[service.icon as keyof typeof iconMap] ?? Scale;
              const text = serviceText(service, locale);
              return (
                <Card key={service.slug} hover className="flex flex-col">
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/6 text-navy-900">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h3 className="mb-2.5 text-lg text-navy-900">{text.title}</h3>
                  <p className="mb-6 flex-1 text-sm leading-8 text-slate-600">{text.short}</p>
                  <Link
                    href={path(locale, `/services/${service.slug}`)}
                    className="-my-2 inline-flex min-h-[40px] items-center gap-1.5 text-sm font-bold text-navy-900 transition-colors hover:text-gold-600"
                  >
                    {t.home.serviceDetails}
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" />
                  </Link>
                </Card>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ── المنهج ── */}
      <Section tone="sand">
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-[0.85fr_1.15fr]">
            <SectionHeading
              align="start"
              eyebrow={t.home.pillarsEyebrow}
              title={t.home.pillarsTitle}
              description={t.home.pillarsDescription}
            />
            <div className="grid gap-5 sm:grid-cols-2">
              {t.home.pillars.map((pillar) => (
                <Card key={pillar.title} className="bg-white">
                  <CheckCircle2 className="mb-3 h-6 w-6 text-gold-600" />
                  <h3 className="mb-2 text-base text-navy-900">{pillar.title}</h3>
                  <p className="text-sm leading-8 text-slate-600">{pillar.body}</p>
                </Card>
              ))}
            </div>
          </div>
        </Container>
      </Section>

      {/* ── المتجر ── */}
      <Section>
        <Container size="wide">
          <SectionHeading
            eyebrow={t.home.storeEyebrow}
            title={t.home.storeTitle}
            description={t.home.storeDescription}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {featuredProducts.map((product) => {
              const text = productText(product, locale);
              return (
                <Card key={product.slug} hover className="flex flex-col">
                  <div className="mb-4 flex items-start justify-between gap-3">
                    <Badge tone="muted">{text.category}</Badge>
                    {text.badge ? <Badge tone="gold">{text.badge}</Badge> : null}
                  </div>
                  <h3 className="mb-2.5 text-lg text-navy-900">{text.name}</h3>
                  <p className="mb-6 flex-1 text-sm leading-8 text-slate-600">{text.summary}</p>
                  <div className="mb-5 flex items-baseline gap-2">
                    <span className="numeric font-display text-2xl font-black text-navy-900">
                      {formatPrice(product.price, locale)}
                    </span>
                    {product.billingPeriod ? (
                      <span className="text-xs font-semibold text-slate-500">
                        {t.storeExtra.billingPer(
                          t.storeExtra.billingPeriods[product.billingPeriod] ??
                            product.billingPeriod,
                        )}
                      </span>
                    ) : null}
                  </div>
                  <ButtonLink
                    href={path(locale, `/store/${product.slug}`)}
                    variant="outline"
                    size="sm"
                  >
                    {t.common.details}
                  </ButtonLink>
                </Card>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href={path(locale, '/store')} variant="primary">
              {t.home.storeCta}
              <ArrowRight className="h-4 w-4 rtl:rotate-180" />
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ── المدونة ── */}
      <Section tone="sand">
        <Container size="wide">
          <SectionHeading
            eyebrow={t.home.blogEyebrow}
            title={t.home.blogTitle}
            description={t.home.blogDescription}
          />
          <div className="mt-14 grid gap-6 md:grid-cols-3">
            {latestArticles.map((article) => (
              <Link
                key={article.slug}
                href={path(locale, `/blog/${article.slug}`)}
                className="group block"
              >
                <Card hover className="flex h-full flex-col bg-white">
                  <Badge tone="navy">
                    {locale === 'ar'
                      ? article.category
                      : (blogCategoryLabelsEn[article.category] ?? article.category)}
                  </Badge>
                  <h3 className="mt-4 mb-2.5 text-lg leading-8 text-navy-900 transition-colors group-hover:text-gold-600">
                    {articleText(article).title}
                  </h3>
                  <p className="mb-5 flex-1 text-sm leading-8 text-slate-600">
                    {articleText(article).excerpt}
                  </p>
                  <time
                    className="numeric text-xs font-semibold text-slate-500"
                    dateTime={article.publishedAt}
                  >
                    {formatDate(article.publishedAt, locale)}
                  </time>
                </Card>
              </Link>
            ))}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href={path(locale, '/blog')} variant="outline">
              {t.home.blogCta}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ── الأسئلة الشائعة ── */}
      <Section>
        <Container size="narrow">
          <SectionHeading eyebrow={t.home.faqEyebrow} title={t.home.faqTitle} />
          <div className="mt-12 space-y-3">
            {faqs.map((faq) => {
              const text = faqText(faq, locale);
              return (
                <details
                  key={faq.question}
                  className="group rounded-2xl border border-sand-200 bg-white px-6 py-5 transition-colors open:border-gold-400/60"
                >
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 font-bold text-navy-900">
                    {text.question}
                    <span className="shrink-0 text-xl text-gold-600 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <p className="mt-4 text-[0.95rem] leading-8 text-slate-600">{text.answer}</p>
                </details>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ── دعوة للتواصل ── */}
      <Section tone="navy">
        <Container size="narrow" className="text-center">
          <h2 className="text-2xl text-white sm:text-3xl">{t.home.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-xl leading-9 text-navy-100/80">{t.home.ctaBody}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href={path(locale, '/booking')} variant="gold" size="lg">
              {t.home.ctaPrimary}
            </ButtonLink>
            <ButtonLink
              href={path(locale, '/contact')}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-navy-900"
            >
              {t.home.ctaSecondary}
            </ButtonLink>
          </div>
          <p className="numeric mt-8 text-sm text-navy-100/70" dir="ltr">
            {site.contact.phoneLocal} · {site.contact.email}
          </p>
        </Container>
      </Section>
    </>
  );
}
