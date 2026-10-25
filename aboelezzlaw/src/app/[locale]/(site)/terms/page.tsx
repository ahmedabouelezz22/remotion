import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LegalDocument } from '@/components/legal-document';
import { isLocale, type Locale } from '@/content/i18n';
import { termsOfUse } from '@/content/legal';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const doc = termsOfUse[raw as Locale];
  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: { canonical: `/${raw}/terms` },
  };
}

export default async function TermsPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return <LegalDocument doc={termsOfUse[locale]} locale={locale} />;
}
