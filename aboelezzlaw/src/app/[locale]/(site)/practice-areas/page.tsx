import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section, SectionHeading } from '@/components/ui/container';
import { dict, isLocale, path, type Locale } from '@/content/i18n';
import { practiceAreaCount, practiceGroups, professionalServices } from '@/content/practice-areas';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.practicePage.title,
    description: t.practicePage.metaDescription,
    alternates: { canonical: `/${raw}/practice-areas` },
  };
}

export default async function PracticeAreasPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  return (
    <>
      <PageHeader
        eyebrow={t.practicePage.eyebrow}
        title={t.practicePage.title}
        description={t.practicePage.description(practiceAreaCount)}
      />

      <Section>
        <Container size="wide">
          <div className="grid gap-6 md:grid-cols-2">
            {practiceGroups.map((group, index) => (
              <section
                key={group.key}
                id={group.key}
                className="scroll-mt-28 rounded-2xl border border-sand-200 bg-white p-6 sm:p-8"
              >
                <h2 className="mb-5 flex items-center gap-3 text-xl text-navy-900">
                  <span className="numeric flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-gold-50 font-display text-sm font-black text-gold-600">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  {group.title[locale]}
                </h2>
                <ul className="flex flex-wrap gap-2">
                  {group.items.map((item) => (
                    <li
                      key={item.en}
                      className="rounded-full border border-sand-200 bg-sand-50 px-3.5 py-2 text-sm font-semibold text-slate-700"
                    >
                      {item[locale]}
                    </li>
                  ))}
                </ul>
              </section>
            ))}
          </div>
        </Container>
      </Section>

      <Section tone="sand" id="professional" className="scroll-mt-20">
        <Container size="wide">
          <SectionHeading
            title={t.practicePage.professionalTitle}
            description={t.practicePage.professionalBody}
          />
          <ul className="mt-12 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {professionalServices.map((item) => (
              <li
                key={item.en}
                className="flex items-center gap-3 rounded-xl border border-sand-200 bg-white px-4 py-3.5 text-[0.95rem] font-semibold text-slate-700"
              >
                <span aria-hidden="true" className="h-2 w-2 shrink-0 rounded-full bg-forest-600" />
                {item[locale]}
              </li>
            ))}
          </ul>
        </Container>
      </Section>

      <Section tone="navy">
        <Container size="narrow" className="text-center">
          <h2 className="text-2xl text-white sm:text-3xl">{t.practicePage.ctaTitle}</h2>
          <p className="mx-auto mt-5 max-w-xl leading-9 text-navy-100/80">{t.practicePage.ctaBody}</p>
          <div className="mt-9 flex flex-wrap justify-center gap-3">
            <ButtonLink href={path(locale, '/contact')} variant="gold" size="lg">
              {t.nav.contact}
            </ButtonLink>
            <ButtonLink
              href={path(locale, '/sectors')}
              variant="outline"
              size="lg"
              className="border-white text-white hover:bg-white hover:text-navy-900"
            >
              {t.nav.allSectors}
            </ButtonLink>
          </div>
        </Container>
      </Section>
    </>
  );
}
