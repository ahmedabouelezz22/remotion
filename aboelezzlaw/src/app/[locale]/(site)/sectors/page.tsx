import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { SectorIcon } from '@/components/sector-icon';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, path, type Locale } from '@/content/i18n';
import { sectorText, sectors } from '@/content/sectors';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.sectorsPage.title,
    description: t.sectorsPage.metaDescription,
    alternates: { canonical: `/${raw}/sectors` },
  };
}

export default async function SectorsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  return (
    <>
      <PageHeader
        eyebrow={t.sectorsPage.eyebrow}
        title={t.sectorsPage.title}
        description={t.sectorsPage.description(sectors.length)}
      />

      <Section>
        <Container size="wide">
          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {sectors.map((sector) => {
              const text = sectorText(sector, locale);
              return (
                <li key={sector.slug}>
                  <Link
                    href={path(locale, `/sectors/${sector.slug}`)}
                    className="group flex h-full flex-col rounded-2xl border border-sand-200 bg-white p-6 shadow-[0_1px_3px_rgba(11,31,58,0.06)] transition-all duration-300 hover:-translate-y-1 hover:border-gold-400/70 hover:shadow-[0_16px_40px_rgba(11,31,58,0.12)]"
                  >
                    <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900 text-gold-400 transition-colors group-hover:bg-forest-800">
                      <SectorIcon name={sector.icon} className="h-6 w-6" />
                    </span>
                    <h2 className="mb-2 text-lg leading-8 text-navy-900">{text.name}</h2>
                    <p className="mb-5 flex-1 text-sm leading-8 text-slate-600">{text.summary}</p>
                    <span className="flex items-center justify-between text-sm font-bold text-navy-900">
                      <span className="numeric text-xs font-semibold text-slate-500">
                        {t.homeX.servicesCount(text.services.length)}
                      </span>
                      <ArrowRight
                        aria-hidden="true"
                        className="h-4 w-4 text-gold-600 transition-transform group-hover:translate-x-1 rtl:rotate-180 rtl:group-hover:-translate-x-1"
                      />
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>

          <p className="mx-auto mt-12 max-w-3xl text-center text-sm leading-8 text-slate-600">
            {t.sectorsPage.deliveryNote}
          </p>
        </Container>
      </Section>
    </>
  );
}
