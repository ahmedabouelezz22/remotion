import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BadgeCheck, Building2, Check, Landmark, Scale, UserRound, type LucideIcon } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, path, type Locale } from '@/content/i18n';
import { memberships, type MembershipAudience, type MembershipTier } from '@/content/memberships';
import { getProduct, productText } from '@/content/products';
import { cn, formatPrice } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.membershipsPage.title,
    description: t.membershipsPage.metaDescription,
    alternates: { canonical: `/${raw}/memberships` },
  };
}

const icons: Record<MembershipAudience['icon'], LucideIcon> = {
  user: UserRound,
  building: Building2,
  scale: Scale,
  landmark: Landmark,
  'badge-check': BadgeCheck,
};

export default async function MembershipsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);
  const m = t.membershipsPage;

  /** ما يُعرض لباقة: سعرها ومزاياها وزرّها — يُشتقّ من المتجر إن كانت منتجاً فيه */
  function resolve(audience: MembershipAudience, tier: MembershipTier) {
    const product = tier.productSlug ? getProduct(tier.productSlug) : undefined;
    const price = product ? product.price : tier.price;
    const features = product
      ? productText(product, locale).highlights
      : tier.features.map((feature) => feature[locale]);

    if (audience.key === 'team') {
      return { price, features, priceLabel: m.byInvitation, action: null };
    }
    if (price === 0) {
      return {
        price,
        features,
        priceLabel: m.free,
        action: { href: path(locale, '/account'), label: m.startFree, variant: 'outline' as const },
      };
    }
    if (product && price !== null) {
      return {
        price,
        features,
        priceLabel: formatPrice(price, locale),
        suffix: m.perMonth,
        action: {
          href: path(locale, `/store/${product.slug}`),
          label: m.subscribe,
          variant: 'primary' as const,
        },
      };
    }
    // لا سعر بعد ⇒ لا بيع: نعرض الباقة ونستقبل الاهتمام بها فقط
    const subject = m.interestSubject(audience.name[locale], tier.name[locale]);
    return {
      price,
      features,
      priceLabel: m.soonPrice,
      muted: true,
      action: {
        href: `${path(locale, '/contact')}?subject=${encodeURIComponent(subject)}`,
        label: m.registerInterest,
        variant: 'outline' as const,
      },
    };
  }

  return (
    <>
      <PageHeader eyebrow={m.eyebrow} title={m.title} description={m.description} />

      {/* تنقّل سريع بين الفئات */}
      <div className="border-b border-sand-200 bg-white">
        <Container size="wide">
          <ul className="flex flex-wrap justify-center gap-2 py-4">
            {memberships.map((audience) => (
              <li key={audience.key}>
                <a
                  href={`#${audience.key}`}
                  className="inline-flex min-h-[44px] items-center rounded-full border border-sand-200 bg-sand-50 px-4 text-sm font-bold text-navy-900 transition-colors hover:border-gold-500"
                >
                  {audience.name[locale]}
                </a>
              </li>
            ))}
          </ul>
        </Container>
      </div>

      {memberships.map((audience, index) => {
        const Icon = icons[audience.icon];
        return (
          <Section
            key={audience.key}
            id={audience.key}
            tone={index % 2 === 1 ? 'sand' : 'default'}
            className="scroll-mt-20"
          >
            <Container size="wide">
              <div className="mb-10 flex flex-col items-start gap-4 sm:flex-row sm:items-center">
                <span className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-navy-900 text-gold-400">
                  <Icon className="h-7 w-7" aria-hidden="true" />
                </span>
                <div>
                  <h2 className="text-2xl text-navy-900">{audience.name[locale]}</h2>
                  <p className="mt-1 leading-8 text-slate-600">{audience.tagline[locale]}</p>
                </div>
              </div>

              <div
                className={cn(
                  'grid gap-5',
                  audience.tiers.length === 1 && 'max-w-xl',
                  audience.tiers.length === 3 && 'md:grid-cols-3',
                  audience.tiers.length === 4 && 'sm:grid-cols-2 xl:grid-cols-4',
                )}
              >
                {audience.tiers.map((tier) => {
                  const view = resolve(audience, tier);
                  return (
                    <div
                      key={tier.key}
                      className={cn(
                        'relative flex flex-col rounded-2xl border bg-white p-6',
                        tier.highlight
                          ? 'border-gold-500 shadow-[0_16px_40px_rgba(11,31,58,0.12)]'
                          : 'border-sand-200',
                      )}
                    >
                      {tier.highlight && audience.tiers.length > 1 ? (
                        <span className="absolute -top-3 start-6 rounded-full bg-gold-500 px-3 py-1 text-xs font-extrabold text-navy-950">
                          {m.mostChosen}
                        </span>
                      ) : null}

                      <h3 className="text-lg text-navy-900">{tier.name[locale]}</h3>

                      <p className="mt-4 mb-6 flex items-baseline gap-2">
                        <span
                          className={cn(
                            'numeric font-display font-black',
                            view.muted ? 'text-base text-slate-600' : 'text-2xl text-navy-900',
                          )}
                        >
                          {view.priceLabel}
                        </span>
                        {view.suffix ? (
                          <span className="text-sm font-semibold text-slate-500">{view.suffix}</span>
                        ) : null}
                      </p>

                      <ul className="mb-7 flex-1 space-y-3">
                        {view.features.map((feature) => (
                          <li key={feature} className="flex gap-2.5 text-sm leading-7 text-slate-700">
                            <Check aria-hidden="true" className="mt-1 h-4 w-4 shrink-0 text-forest-600" />
                            {feature}
                          </li>
                        ))}
                      </ul>

                      {view.action ? (
                        <ButtonLink href={view.action.href} variant={view.action.variant}>
                          {view.action.label}
                        </ButtonLink>
                      ) : null}
                    </div>
                  );
                })}
              </div>

              {audience.note ? (
                <p className="mt-6 text-sm leading-8 text-slate-600">{audience.note[locale]}</p>
              ) : null}
            </Container>
          </Section>
        );
      })}

      <Section tone="navy">
        <Container size="narrow">
          <h2 className="mb-6 text-xl text-white">{m.termsTitle}</h2>
          <ul className="space-y-4">
            {m.terms.map((term) => (
              <li key={term} className="flex gap-3 leading-8 text-navy-100/85">
                <span aria-hidden="true" className="mt-3 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-400" />
                {term}
              </li>
            ))}
          </ul>
        </Container>
      </Section>
    </>
  );
}
