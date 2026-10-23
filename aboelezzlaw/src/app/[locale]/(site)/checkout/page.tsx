import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckoutForm, type ProviderOption } from '@/components/checkout-form';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, type Locale } from '@/content/i18n';
import { enabledProviders } from '@/lib/payments';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.checkout.title,
    description: t.checkoutExtra.pageDescription,
    robots: { index: false, follow: false },
  };
}

// المزوّدون المتاحون يعتمدون على متغيّرات البيئة، فلا يصلح توليد الصفحة مسبقاً
export const dynamic = 'force-dynamic';

export default async function CheckoutPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  const providers: ProviderOption[] = enabledProviders().map((provider) => ({
    id: provider.id,
    label: locale === 'ar' ? provider.label : provider.labelEn,
    description: locale === 'ar' ? provider.description : provider.descriptionEn,
  }));

  return (
    <>
      <PageHeader
        eyebrow={t.checkoutPage.eyebrow}
        title={t.checkoutPage.title}
        description={t.checkoutPage.description}
      />

      <Section>
        <Container size="wide">
          {providers.length === 0 ? (
            <Card className="mx-auto max-w-xl border-amber-200 bg-amber-50 text-center">
              <h2 className="mb-2.5 text-lg text-amber-900">{t.checkoutPage.noProvidersTitle}</h2>
              <p className="text-sm leading-8 text-amber-800">{t.checkoutPage.noProvidersBody}</p>
            </Card>
          ) : (
            <CheckoutForm providers={providers} locale={locale} />
          )}
        </Container>
      </Section>
    </>
  );
}
