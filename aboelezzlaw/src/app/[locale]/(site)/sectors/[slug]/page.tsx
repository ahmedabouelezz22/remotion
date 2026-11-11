import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, CheckCircle2, MessageSquare } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { SectorIcon } from '@/components/sector-icon';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, locales, path, type Locale } from '@/content/i18n';
import { getSector, sectorText, sectors } from '@/content/sectors';
import { waLink } from '@/content/site';

export function generateStaticParams() {
  return locales.flatMap((locale) => sectors.map((sector) => ({ locale, slug: sector.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const sector = getSector(slug);
  if (!sector) return { title: dict(locale).sectorsPage.notFound };

  const text = sectorText(sector, locale);
  return {
    title: text.name,
    description: text.summary,
    alternates: { canonical: `/${locale}/sectors/${sector.slug}` },
    openGraph: { title: text.name, description: text.summary },
  };
}

export default async function SectorPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  const sector = getSector(slug);
  if (!sector) notFound();
  const text = sectorText(sector, locale);

  // قطاعات مجاورة في الترتيب — تنقّل جانبي بلا حاجة للعودة إلى الفهرس
  const index = sectors.indexOf(sector);
  const others = [1, 2, 3, 4, 5, 6].map((step) => sectors[(index + step) % sectors.length]!);

  const subject = t.sectorsPage.requestSubject(text.name);

  return (
    <>
      <PageHeader eyebrow={t.sectorsPage.eyebrow} title={text.name} description={text.summary} />

      <Section>
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1.5fr_1fr]">
            <div>
              <h2 className="mb-6 flex items-center gap-3 text-xl text-navy-900">
                <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900 text-gold-400">
                  <SectorIcon name={sector.icon} className="h-5 w-5" />
                </span>
                {t.sectorsPage.whatWeDo}
              </h2>

              <ul className="grid gap-3 sm:grid-cols-2">
                {text.services.map((service) => (
                  <li
                    key={service}
                    className="flex gap-3 rounded-xl border border-sand-200 bg-white p-4 text-[0.95rem] leading-8 text-slate-700"
                  >
                    <CheckCircle2 aria-hidden="true" className="mt-1.5 h-5 w-5 shrink-0 text-forest-600" />
                    {service}
                  </li>
                ))}
              </ul>

              <p className="mt-8 rounded-xl border border-sand-200 bg-sand-100 p-5 text-sm leading-8 text-slate-600">
                {t.sectorsPage.deliveryNote}
              </p>
            </div>

            <div className="space-y-4 lg:sticky lg:top-24 lg:self-start">
              <Card className="border-navy-900/10 bg-navy-900 text-white">
                <h2 className="mb-2.5 text-lg text-white">{t.sectorsPage.requestTitle}</h2>
                <p className="mb-6 text-sm leading-8 text-navy-100/80">{t.sectorsPage.requestBody}</p>
                <div className="flex flex-col gap-3">
                  <ButtonLink
                    href={`${path(locale, '/contact')}?subject=${encodeURIComponent(subject)}`}
                    variant="gold"
                  >
                    {t.sectorsPage.requestCta}
                  </ButtonLink>
                  <ButtonLink href={waLink(subject)} external variant="whatsapp">
                    <MessageSquare className="h-4 w-4" aria-hidden="true" />
                    {t.common.whatsappUs}
                  </ButtonLink>
                  <ButtonLink
                    href={path(locale, '/booking')}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-navy-900"
                  >
                    {t.nav.bookCta}
                  </ButtonLink>
                </div>
              </Card>
            </div>
          </div>

          <div className="mt-16">
            <h2 className="mb-5 text-lg text-navy-900">{t.sectorsPage.otherSectors}</h2>
            <ul className="flex flex-wrap gap-2.5">
              {others.map((other) => (
                <li key={other.slug}>
                  <Link
                    href={path(locale, `/sectors/${other.slug}`)}
                    className="inline-flex min-h-[44px] items-center gap-2 rounded-full border border-sand-200 bg-white px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:border-gold-500 hover:text-navy-900"
                  >
                    <SectorIcon name={other.icon} className="h-4 w-4 text-gold-600" />
                    {sectorText(other, locale).name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <Link
            href={path(locale, '/sectors')}
            className="mt-10 inline-flex min-h-[40px] items-center gap-2 text-sm font-bold text-navy-900 transition-colors hover:text-gold-600"
          >
            <ArrowRight aria-hidden="true" className="h-4 w-4 ltr:rotate-180" />
            {t.sectorsPage.backToSectors}
          </Link>
        </Container>
      </Section>
    </>
  );
}
