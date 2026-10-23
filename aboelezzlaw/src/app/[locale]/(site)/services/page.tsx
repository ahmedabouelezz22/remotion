import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowLeft, Building2, Calculator, FileText, Scale, ShieldCheck, Users } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, path, type Locale } from '@/content/i18n';
import { serviceText, services } from '@/content/services';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.servicesPage.title,
    description: t.servicesPage.metaDescription,
    alternates: { canonical: `/${raw}/services` },
  };
}

const iconMap = {
  building: Building2,
  'file-text': FileText,
  calculator: Calculator,
  users: Users,
  scale: Scale,
  'shield-check': ShieldCheck,
} as const;

export default async function ServicesPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  return (
    <>
      <PageHeader
        eyebrow={t.servicesPage.eyebrow}
        title={t.servicesPage.title}
        description={t.servicesPage.description}
      />

      <Section>
        <Container size="wide">
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => {
              const Icon = iconMap[service.icon as keyof typeof iconMap] ?? Scale;
              const text = serviceText(service, locale);
              return (
                <Card key={service.slug} hover className="flex flex-col">
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/6 text-navy-900">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mb-2.5 text-xl text-navy-900">{text.title}</h2>
                  <p className="mb-5 text-sm leading-8 text-slate-600">{text.description}</p>
                  <ul className="mb-7 flex-1 space-y-2 text-sm text-slate-600">
                    {text.deliverables.slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={path(locale, `/services/${service.slug}`)}
                    className="-my-2 inline-flex min-h-[40px] items-center gap-1.5 text-sm font-bold text-navy-900 transition-colors hover:text-gold-600"
                  >
                    {t.services.detailsAndOutputs}
                    <ArrowLeft className="h-3.5 w-3.5 rtl:rotate-0 ltr:rotate-180" />
                  </Link>
                </Card>
              );
            })}
          </div>

          <Card className="mt-10 border-gold-400/50 bg-gold-50 text-center">
            <h2 className="mb-2.5 text-lg text-navy-900">{t.servicesPage.outsideTitle}</h2>
            <p className="mx-auto mb-6 max-w-xl text-sm leading-8 text-slate-600">
              {t.servicesPage.outsideBody}
            </p>
            <ButtonLink href={path(locale, '/contact')}>{t.servicesPage.contactUs}</ButtonLink>
          </Card>
        </Container>
      </Section>
    </>
  );
}
