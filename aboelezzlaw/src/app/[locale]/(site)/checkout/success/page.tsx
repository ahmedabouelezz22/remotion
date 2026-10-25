import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckCircle2 } from 'lucide-react';
import { ClearCartOnMount } from '@/components/clear-cart-on-mount';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, path, type Locale } from '@/content/i18n';
import { site, waLink } from '@/content/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  return {
    title: dict(raw as Locale).successPage.metaTitle,
    robots: { index: false, follow: false },
  };
}

export const dynamic = 'force-dynamic';

export default async function CheckoutSuccessPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ ref?: string; provider?: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  const { ref } = await searchParams;

  return (
    <>
      <ClearCartOnMount />

      <PageHeader
        eyebrow={t.successPage.eyebrow}
        title={t.successPage.title}
        description={t.successPage.description}
      />

      <Section>
        <Container size="narrow">
          <Card className="border-emerald-200 bg-emerald-50 text-center">
            <CheckCircle2 className="mx-auto mb-5 h-16 w-16 text-emerald-600" />
            <h2 className="mb-3 text-2xl text-emerald-900">{t.successPage.thanks}</h2>

            {ref ? (
              <p className="mb-6 text-sm text-emerald-800">
                {t.successPage.yourReference}{' '}
                <strong className="numeric rounded-lg bg-white px-3 py-1 font-mono text-navy-900">
                  {ref}
                </strong>
                <br />
                <span className="mt-2 block">{t.successPage.keepReference}</span>
              </p>
            ) : null}

            <div className="mx-auto mb-8 max-w-md space-y-3 rounded-xl border border-emerald-200 bg-white p-6 text-start text-sm leading-8 text-slate-700">
              <p className="font-extrabold text-navy-900">{t.successPage.whatHappens}</p>
              {t.successPage.steps.map((step) => (
                <p key={step}>◾ {step}</p>
              ))}
            </div>

            <div className="flex flex-wrap justify-center gap-3">
              <ButtonLink href={path(locale, '/booking')} variant="gold">
                {t.successPage.bookSlot}
              </ButtonLink>
              <ButtonLink
                href={waLink(ref ? t.successPage.followUpMessage(ref) : undefined)}
                external
                variant="whatsapp"
              >
                {t.successPage.followUp}
              </ButtonLink>
            </div>

            <p className="numeric mt-8 text-xs text-slate-500" dir="ltr">
              {site.contact.phoneLocal} · {site.contact.email}
            </p>
          </Card>
        </Container>
      </Section>
    </>
  );
}
