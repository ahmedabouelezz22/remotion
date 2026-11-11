import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import {
  ArrowRight,
  ArrowUpRight,
  BadgeCheck,
  BookOpen,
  Building2,
  Calculator,
  CalendarCheck,
  Check,
  FileDown,
  FileText,
  Landmark,
  LayoutGrid,
  MessageSquare,
  Scale,
  ShieldCheck,
  User,
  Users,
} from 'lucide-react';
import { SectorIcon } from '@/components/sector-icon';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section, SectionHeading } from '@/components/ui/container';
import { blogCategoryLabelsEn, sortedArticles } from '@/content/blog';
import { faqs, faqText } from '@/content/faq';
import { dict, isLocale, path, type Locale } from '@/content/i18n';
import { memberships } from '@/content/memberships';
import { productText, products } from '@/content/products';
import { featuredSectors, sectorText, sectors } from '@/content/sectors';
import { serviceText, services } from '@/content/services';
import { site, waLink } from '@/content/site';
import { cn, formatDate, formatPrice } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return { alternates: { canonical: `/${raw}` } };
}

const serviceIcons = {
  building: Building2,
  'file-text': FileText,
  calculator: Calculator,
  users: Users,
  scale: Scale,
  'shield-check': ShieldCheck,
} as const;

const audienceIcons = {
  user: User,
  building: Building2,
  scale: Scale,
  landmark: Landmark,
  'badge-check': BadgeCheck,
} as const;

/** خطوط الطول والعرض لكرةٍ أرضية مرسومة — زخرفة لا خريطة: لا تدّعي مواقع */
const MERIDIANS = [30, 78, 124, 160];
const PARALLELS = [-110, -55, 0, 55, 110];
const NODES = [
  { cx: 132, cy: 150, delay: '0s' },
  { cx: 262, cy: 118, delay: '0.9s' },
  { cx: 228, cy: 232, delay: '1.7s' },
  { cx: 118, cy: 262, delay: '2.4s' },
  { cx: 300, cy: 262, delay: '0.4s' },
];

function Globe() {
  return (
    <svg viewBox="0 0 400 400" className="h-full w-full" aria-hidden="true">
      <defs>
        <radialGradient id="abz-globe-fill" cx="38%" cy="32%" r="75%">
          <stop offset="0%" stopColor="#1c6b57" stopOpacity="0.55" />
          <stop offset="55%" stopColor="#124a3c" stopOpacity="0.28" />
          <stop offset="100%" stopColor="#11293a" stopOpacity="0" />
        </radialGradient>
        <linearGradient id="abz-arc" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="#e0c25e" stopOpacity="0" />
          <stop offset="50%" stopColor="#e0c25e" stopOpacity="0.9" />
          <stop offset="100%" stopColor="#e0c25e" stopOpacity="0" />
        </linearGradient>
      </defs>
      <circle cx="200" cy="200" r="170" fill="url(#abz-globe-fill)" />
      <g fill="none" stroke="#e8cf7c" strokeOpacity="0.22" strokeWidth="1">
        <circle cx="200" cy="200" r="170" strokeOpacity="0.45" />
        {MERIDIANS.map((rx) => (
          <ellipse key={`m${rx}`} cx="200" cy="200" rx={rx} ry="170" />
        ))}
        {PARALLELS.map((offset) => {
          const half = Math.sqrt(170 * 170 - offset * offset);
          return (
            <ellipse key={`p${offset}`} cx="200" cy={200 + offset} rx={half} ry={half * 0.16} />
          );
        })}
      </g>
      <g fill="none" stroke="url(#abz-arc)" strokeWidth="1.6" strokeLinecap="round">
        <path d="M132 150 Q200 70 262 118" />
        <path d="M262 118 Q290 180 228 232" />
        <path d="M118 262 Q170 210 228 232" />
        <path d="M228 232 Q270 270 300 262" />
      </g>
      {NODES.map((node) => (
        <g key={`${node.cx}-${node.cy}`}>
          <circle
            cx={node.cx}
            cy={node.cy}
            r="9"
            fill="#e0c25e"
            fillOpacity="0.18"
            className="abz-pulse"
            style={{ animationDelay: node.delay }}
          />
          <circle cx={node.cx} cy={node.cy} r="3.2" fill="#e8cf7c" />
        </g>
      ))}
    </svg>
  );
}

export default async function HomePage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);
  const x = t.homeX;

  const featuredProducts = products.filter((product) => product.featured).slice(0, 3);
  const latestArticles = sortedArticles.slice(0, 3);
  const articleText = (article: (typeof sortedArticles)[number]) =>
    locale === 'ar' ? { title: article.title, excerpt: article.excerpt } : article.en;

  const arrow = <ArrowRight className="h-4 w-4 rtl:rotate-180" aria-hidden="true" />;

  return (
    <>
      {/* ── القسم الافتتاحي ── */}
      <section className="relative isolate overflow-hidden bg-navy-950 text-white">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="abz-drift absolute top-0 start-[-10%] h-[34rem] w-[34rem] rounded-full bg-forest-600/45 blur-[110px]" />
          <div className="abz-drift absolute bottom-0 end-[-8%] h-[30rem] w-[30rem] rounded-full bg-gold-500/20 blur-[120px] [animation-delay:-6s]" />
          <div className="abz-grid absolute inset-0" />
        </div>

        <Container size="wide" className="pt-16 pb-20 sm:pt-24 sm:pb-28">
          <div className="grid items-center gap-12 lg:grid-cols-[1.1fr_0.9fr]">
            <div>
              <span className="abz-rise mb-6 inline-flex items-center gap-2 rounded-full border border-gold-500/35 bg-navy-900 px-4 py-1.5 text-xs font-bold tracking-wide text-gold-300">
                <span className="abz-pulse h-1.5 w-1.5 rounded-full bg-gold-400" aria-hidden="true" />
                {t.home.heroBadge}
              </span>

              <h1 className="abz-rise abz-rise-1 text-[2.1rem] leading-[1.3] sm:text-5xl sm:leading-[1.25] lg:text-[3.4rem]">
                {t.home.heroTitle1}
                <span className="block text-gold-400">{t.home.heroTitle2}</span>
              </h1>

              <p className="abz-rise abz-rise-2 mt-6 max-w-xl text-[1.05rem] leading-9 text-navy-100">
                {t.home.heroBody}
              </p>

              <div className="abz-rise abz-rise-3 mt-9 flex flex-wrap gap-3">
                <ButtonLink href={path(locale, '/booking')} variant="gold" size="lg">
                  {t.home.heroCta}
                  {arrow}
                </ButtonLink>
                <ButtonLink
                  href={waLink(t.home.heroWhatsappMessage)}
                  external
                  variant="whatsapp"
                  size="lg"
                >
                  <MessageSquare className="h-4 w-4" aria-hidden="true" />
                  {t.home.heroWhatsapp}
                </ButtonLink>
              </div>

              <ul className="abz-rise abz-rise-3 mt-8 flex flex-wrap gap-x-6 gap-y-2.5">
                {x.chips.map((chip) => (
                  <li key={chip} className="flex items-center gap-2 text-sm text-navy-100">
                    <span className="flex h-5 w-5 items-center justify-center rounded-full bg-forest-600 text-white">
                      <Check className="h-3 w-3" aria-hidden="true" />
                    </span>
                    {chip}
                  </li>
                ))}
              </ul>
            </div>

            {/* الكرة الأرضية وبطاقات الأرقام العائمة */}
            <div className="relative mx-auto w-full max-w-[30rem]">
              <div className="aspect-square">
                <Globe />
              </div>
              <dl className="contents">
                {t.home.stats.map((stat, index) => (
                  <div
                    key={stat.label}
                    className={cn(
                      'absolute flex flex-col-reverse rounded-2xl border border-white/15 bg-navy-900 px-5 py-3.5 shadow-[0_18px_40px_rgba(0,0,0,0.35)]',
                      index === 0 && 'abz-float start-0 top-[10%]',
                      index === 1 && 'abz-float-slow end-0 top-[42%]',
                      index === 2 && 'abz-float start-[8%] bottom-[6%]',
                    )}
                  >
                    <dt className="mt-0.5 text-xs leading-6 text-navy-100">{stat.label}</dt>
                    <dd
                      className="numeric font-display text-2xl font-black text-gold-400"
                      dir="auto"
                    >
                      {stat.value}
                    </dd>
                  </div>
                ))}
              </dl>
            </div>
          </div>
        </Container>

        {/* شريط القطاعات المتحرّك */}
        <div className="border-t border-white/10 bg-navy-950">
          <p className="sr-only">{x.marqueeLabel}</p>
          <div className="abz-marquee-wrap overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
            <div className="abz-marquee flex w-max">
              {[false, true].map((duplicate) => (
                <ul
                  key={String(duplicate)}
                  aria-hidden={duplicate || undefined}
                  className="flex shrink-0 items-center gap-2 py-3 pe-2"
                >
                  {sectors.map((sector) => (
                    <li key={sector.slug}>
                      <Link
                        href={path(locale, `/sectors/${sector.slug}`)}
                        tabIndex={duplicate ? -1 : undefined}
                        className="inline-flex min-h-[40px] items-center gap-2 rounded-full border border-white/12 px-4 text-sm font-semibold whitespace-nowrap text-navy-100 transition-colors hover:border-gold-400 hover:text-gold-300"
                      >
                        <SectorIcon name={sector.icon} className="h-4 w-4 text-gold-400" />
                        {sectorText(sector, locale).name}
                      </Link>
                    </li>
                  ))}
                </ul>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── من أين تبدأ ── */}
      <Section>
        <Container size="wide">
          <SectionHeading
            eyebrow={x.needEyebrow}
            title={x.needTitle}
            description={x.needDescription}
          />
          <div className="mt-12 grid gap-5 md:grid-cols-2 lg:grid-cols-3">
            <Link
              href={path(locale, '/sectors')}
              className="group relative isolate flex min-h-[20rem] flex-col overflow-hidden rounded-3xl bg-forest-900 p-8 text-white transition-transform duration-300 hover:-translate-y-1 md:col-span-2"
            >
              <div
                aria-hidden="true"
                className="absolute -end-16 -bottom-16 -z-10 grid grid-cols-4 gap-3 opacity-25 transition-opacity duration-300 group-hover:opacity-40"
              >
                {sectors.slice(0, 16).map((sector) => (
                  <span
                    key={sector.slug}
                    className="flex h-16 w-16 items-center justify-center rounded-2xl border border-white/25"
                  >
                    <SectorIcon name={sector.icon} className="h-7 w-7" />
                  </span>
                ))}
              </div>
              <span className="mb-6 flex h-12 w-12 items-center justify-center rounded-2xl bg-gold-500 text-navy-950">
                <LayoutGrid className="h-6 w-6" aria-hidden="true" />
              </span>
              <h3 className="text-2xl text-white sm:text-[1.75rem]">{x.need.sectorsTitle}</h3>
              <p className="mt-3 max-w-md leading-8 text-forest-100">
                {x.need.sectorsBody(sectors.length)}
              </p>
              <span className="mt-auto inline-flex items-center gap-2 pt-8 font-bold text-gold-300">
                {x.need.sectorsCta}
                {arrow}
              </span>
            </Link>

            <Link
              href={path(locale, '/booking')}
              className="group flex flex-col rounded-3xl bg-navy-900 p-7 text-white transition-transform duration-300 hover:-translate-y-1 md:col-span-2 lg:col-span-1"
            >
              <div className="flex items-start justify-between gap-4">
                <span className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white/10 text-gold-300">
                  <CalendarCheck className="h-5 w-5" aria-hidden="true" />
                </span>
                <ArrowUpRight
                  className="h-5 w-5 text-gold-300 transition-transform duration-300 group-hover:-translate-y-0.5 rtl:-scale-x-100"
                  aria-hidden="true"
                />
              </div>
              <h3 className="mt-5 text-xl text-white">{x.need.bookingTitle}</h3>
              <p className="mt-2 leading-8 text-navy-100">{x.need.bookingBody}</p>
              <span className="mt-4 inline-flex items-center gap-2 text-sm font-bold text-gold-300">
                {x.need.bookingCta}
                {arrow}
              </span>
            </Link>

            {(
              [
                {
                  href: '/store?category=templates',
                  icon: FileDown,
                  title: x.need.templatesTitle,
                  body: x.need.templatesBody,
                  cta: x.need.templatesCta,
                  tone: 'bg-gold-50 border-gold-500/30',
                },
                {
                  href: '/memberships',
                  icon: BadgeCheck,
                  title: x.need.membershipsTitle,
                  body: x.need.membershipsBody,
                  cta: x.need.membershipsCta,
                  tone: 'bg-white border-sand-200',
                },
                {
                  href: '/blog',
                  icon: BookOpen,
                  title: x.need.knowledgeTitle,
                  body: x.need.knowledgeBody,
                  cta: x.need.knowledgeCta,
                  tone: 'bg-forest-50 border-forest-100',
                },
              ] as const
            ).map((tile) => (
              <Link
                key={tile.href}
                href={path(locale, tile.href)}
                className={cn(
                  'group flex flex-col rounded-3xl border p-6 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(11,31,58,0.1)]',
                  tile.tone,
                )}
              >
                <tile.icon className="h-6 w-6 text-forest-600" aria-hidden="true" />
                <h3 className="mt-4 text-lg text-navy-900">{tile.title}</h3>
                <p className="mt-2 flex-1 text-sm leading-7 text-slate-600">{tile.body}</p>
                <span className="mt-4 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 group-hover:text-forest-600">
                  {tile.cta}
                  {arrow}
                </span>
              </Link>
            ))}
          </div>
        </Container>
      </Section>

      {/* ── القطاعات ── */}
      <Section tone="sand">
        <Container size="wide">
          <div className="flex flex-wrap items-end justify-between gap-6">
            <SectionHeading
              align="start"
              eyebrow={x.sectorsEyebrow}
              title={x.sectorsTitle}
              description={x.sectorsDescription}
            />
            <ButtonLink href={path(locale, '/sectors')} variant="outline" size="sm">
              {t.nav.allSectors}
              {arrow}
            </ButtonLink>
          </div>
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSectors.map((sector) => {
              const text = sectorText(sector, locale);
              return (
                <Link
                  key={sector.slug}
                  href={path(locale, `/sectors/${sector.slug}`)}
                  className="group flex gap-4 rounded-2xl border border-sand-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-forest-600/50 hover:shadow-[0_10px_28px_rgba(13,59,48,0.1)]"
                >
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-forest-50 text-forest-600 transition-colors duration-300 group-hover:bg-forest-600 group-hover:text-white">
                    <SectorIcon name={sector.icon} className="h-6 w-6" />
                  </span>
                  <span className="min-w-0">
                    <span className="flex items-baseline justify-between gap-3">
                      <span className="block text-base font-extrabold text-navy-900">
                        {text.name}
                      </span>
                      <span className="numeric shrink-0 text-xs font-semibold text-slate-600">
                        {x.servicesCount(text.services.length)}
                      </span>
                    </span>
                    <span className="mt-1.5 line-clamp-2 block text-sm leading-7 text-slate-600">
                      {text.summary}
                    </span>
                  </span>
                </Link>
              );
            })}
          </div>
        </Container>
      </Section>

      {/* ── الخدمات الأساسية ── */}
      <Section>
        <Container size="wide">
          <SectionHeading
            eyebrow={t.home.servicesEyebrow}
            title={t.home.servicesTitle}
            description={t.home.servicesDescription}
          />
          <div className="mt-14 grid gap-px overflow-hidden rounded-3xl border border-sand-200 bg-sand-200 md:grid-cols-2 lg:grid-cols-3">
            {services.map((service, index) => {
              const Icon = serviceIcons[service.icon as keyof typeof serviceIcons] ?? Scale;
              const text = serviceText(service, locale);
              return (
                <Link
                  key={service.slug}
                  href={path(locale, `/services/${service.slug}`)}
                  className="group flex flex-col bg-white p-7 transition-colors duration-300 hover:bg-navy-900"
                >
                  <span className="flex items-center justify-between">
                    <span className="flex h-12 w-12 items-center justify-center rounded-xl bg-navy-50 text-navy-900 transition-colors duration-300 group-hover:bg-gold-500 group-hover:text-navy-950">
                      <Icon className="h-6 w-6" aria-hidden="true" />
                    </span>
                    <span
                      className="numeric font-display text-sm font-black text-slate-500 group-hover:text-gold-300"
                      dir="ltr"
                      aria-hidden="true"
                    >
                      {String(index + 1).padStart(2, '0')}
                    </span>
                  </span>
                  <span className="mt-5 block font-display text-lg font-extrabold text-navy-900 group-hover:text-white">
                    {text.title}
                  </span>
                  <span className="mt-2.5 block flex-1 text-sm leading-8 text-slate-600 group-hover:text-navy-100">
                    {text.short}
                  </span>
                  <span className="mt-5 inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 group-hover:text-gold-300">
                    {t.home.serviceDetails}
                    <ArrowRight className="h-3.5 w-3.5 rtl:rotate-180" aria-hidden="true" />
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-8 text-center">
            <ButtonLink href={path(locale, '/practice-areas')} variant="ghost">
              {t.nav.practiceAreas}
              {arrow}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ── كيف نعمل + المنهج ── */}
      <section className="relative isolate overflow-hidden bg-forest-900 py-16 text-white sm:py-24">
        <div
          aria-hidden="true"
          className="abz-drift pointer-events-none absolute top-0 end-[-6%] -z-10 h-[26rem] w-[26rem] rounded-full bg-forest-600/60 blur-[110px]"
        />
        <Container size="wide">
          <div className="grid gap-14 lg:grid-cols-2">
            <div>
              <p className="mb-3 text-sm font-bold tracking-[0.18em] text-gold-300">
                {t.home.howTitle}
              </p>
              <h2 className="text-2xl text-white sm:text-3xl lg:text-[2.1rem]">{t.home.howBody}</h2>
              <ol className="relative mt-10 space-y-8 border-s border-white/20 ps-8">
                {t.home.steps.map((item) => (
                  <li key={item.step} className="relative">
                    <span
                      className="absolute -start-[3.1rem] top-0 flex h-9 w-9 items-center justify-center rounded-full bg-gold-500 font-display text-sm font-black text-navy-950 ring-4 ring-forest-900"
                      aria-hidden="true"
                    >
                      {item.step}
                    </span>
                    <h3 className="text-lg text-white">{item.title}</h3>
                    <p className="mt-1.5 leading-8 text-forest-100">{item.body}</p>
                  </li>
                ))}
              </ol>
            </div>

            <div>
              <p className="mb-3 text-sm font-bold tracking-[0.18em] text-gold-300">
                {t.home.pillarsEyebrow}
              </p>
              <h2 className="text-2xl text-white sm:text-3xl lg:text-[2.1rem]">
                {t.home.pillarsTitle}
              </h2>
              <p className="mt-4 leading-9 text-forest-100">{t.home.pillarsDescription}</p>
              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                {t.home.pillars.map((pillar) => (
                  <div
                    key={pillar.title}
                    className="rounded-2xl border border-white/15 bg-forest-800 p-5"
                  >
                    <h3 className="text-base text-white">{pillar.title}</h3>
                    <p className="mt-2 text-sm leading-7 text-forest-100">{pillar.body}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </Container>
      </section>

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
                <Card key={product.slug} hover className="flex flex-col rounded-3xl">
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
                      <span className="text-xs font-semibold text-slate-600">
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
              {arrow}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ── العضويات ── */}
      <Section tone="sand">
        <Container size="wide">
          <SectionHeading
            eyebrow={x.membershipsEyebrow}
            title={x.membershipsTitle}
            description={x.membershipsDescription}
          />
          <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
            {memberships.map((audience) => {
              const Icon = audienceIcons[audience.icon];
              const isTeam = audience.key === 'team';
              return (
                <Link
                  key={audience.key}
                  href={`${path(locale, '/memberships')}#${audience.key}`}
                  className={cn(
                    'group flex flex-col rounded-2xl border p-5 transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_12px_32px_rgba(11,31,58,0.1)]',
                    isTeam
                      ? 'border-navy-900 bg-navy-900 text-white'
                      : 'border-sand-200 bg-white hover:border-gold-500/60',
                  )}
                >
                  <span
                    className={cn(
                      'flex h-11 w-11 items-center justify-center rounded-xl',
                      isTeam ? 'bg-gold-500 text-navy-950' : 'bg-gold-50 text-gold-600',
                    )}
                  >
                    <Icon className="h-5 w-5" aria-hidden="true" />
                  </span>
                  <span
                    className={cn(
                      'mt-4 block font-display text-base font-extrabold',
                      isTeam ? 'text-white' : 'text-navy-900',
                    )}
                  >
                    {audience.name[locale]}
                  </span>
                  <span
                    className={cn(
                      'mt-2 block flex-1 text-sm leading-7',
                      isTeam ? 'text-navy-100' : 'text-slate-600',
                    )}
                  >
                    {audience.tagline[locale]}
                  </span>
                  <span
                    className={cn(
                      'mt-4 text-xs font-bold',
                      isTeam ? 'text-gold-300' : 'text-forest-600',
                    )}
                  >
                    {x.tiersCount(audience.tiers.length)}
                  </span>
                </Link>
              );
            })}
          </div>
          <div className="mt-10 text-center">
            <ButtonLink href={path(locale, '/memberships')} variant="primary">
              {x.membershipsCta}
              {arrow}
            </ButtonLink>
          </div>
        </Container>
      </Section>

      {/* ── المدونة ── */}
      <Section>
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
                <Card hover className="flex h-full flex-col rounded-3xl bg-white">
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
                    className="numeric text-xs font-semibold text-slate-600"
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
      <Section tone="sand">
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
      <section className="relative isolate overflow-hidden bg-navy-950 py-16 text-white sm:py-24">
        <div aria-hidden="true" className="pointer-events-none absolute inset-0 -z-10">
          <div className="abz-drift absolute top-0 start-1/4 h-[28rem] w-[28rem] rounded-full bg-forest-600/40 blur-[110px]" />
          <div className="abz-grid absolute inset-0" />
        </div>
        <Container size="narrow" className="text-center">
          <h2 className="text-2xl text-white sm:text-4xl">{t.home.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-xl leading-9 text-navy-100">{t.home.ctaBody}</p>
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
          <p className="numeric mt-8 text-sm text-navy-100" dir="ltr">
            {site.contact.phoneLocal} · {site.contact.email}
          </p>
        </Container>
      </section>
    </>
  );
}
