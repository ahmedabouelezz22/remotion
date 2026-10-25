import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckCircle2, Users } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, locales, path, type Locale } from '@/content/i18n';
import { getService, serviceText, services } from '@/content/services';
import { waLink } from '@/content/site';

export function generateStaticParams() {
  return locales.flatMap((locale) =>
    services.map((service) => ({ locale, slug: service.slug })),
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const service = getService(slug);
  if (!service) return { title: dict(locale).servicesPage.notFound };

  const text = serviceText(service, locale);
  return {
    title: text.title,
    description: text.short,
    alternates: { canonical: `/${locale}/services/${service.slug}` },
    openGraph: { title: text.title, description: text.short },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  const service = getService(slug);
  if (!service) notFound();

  const text = serviceText(service, locale);

  return (
    <>
      <PageHeader
        eyebrow={t.servicesPage.serviceEyebrow}
        title={text.title}
        description={text.short}
      />

      <Section>
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="article-body">
                <h2>{t.servicesPage.scopeHeading}</h2>
                <p>{text.description}</p>
              </div>

              <h2 className="mt-12 mb-5 text-xl text-navy-900">
                {t.servicesPage.receiveHeading}
              </h2>
              <ul className="space-y-3.5">
                {text.deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.95rem] leading-8 text-slate-700">
                    <CheckCircle2 className="mt-1.5 h-5 w-5 shrink-0 text-gold-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <Card>
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900/6 text-navy-900">
                  <Users className="h-5 w-5" />
                </span>
                <h3 className="mb-2 text-base text-navy-900">
                  {t.servicesPage.forWhomHeading}
                </h3>
                <p className="text-sm leading-8 text-slate-600">{text.audience}</p>
              </Card>

              <Card className="bg-navy-900 text-white">
                <h3 className="mb-2.5 text-lg text-white">{t.servicesPage.startTitle}</h3>
                <p className="mb-6 text-sm leading-8 text-navy-100/75">
                  {t.servicesPage.startBody}
                </p>
                <div className="flex flex-col gap-3">
                  <ButtonLink href={path(locale, '/booking')} variant="gold">
                    {t.servicesPage.bookConsultation}
                  </ButtonLink>
                  <ButtonLink
                    href={waLink(t.servicesPage.enquiryMessage(text.title))}
                    external
                    variant="whatsapp"
                  >
                    {t.servicesPage.enquireOnWhatsapp}
                  </ButtonLink>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
