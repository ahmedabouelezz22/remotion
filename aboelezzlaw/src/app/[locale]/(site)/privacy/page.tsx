import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { LegalDocument } from '@/components/legal-document';
import { isLocale, type Locale } from '@/content/i18n';
import { privacyPolicy } from '@/content/legal';

/**
 * ملاحظة للمالك: هذه السياسة تصف المعالجة الفعلية لهذا الموقع كما هو مبنيّ.
 * إن أضفت أدوات تتبّع أو خدمات خارجية جديدة، حدّث `content/legal.ts` تبعاً
 * لذلك — ويلزم تحديث النصّين العربي والإنجليزي معاً.
 */
export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const doc = privacyPolicy[raw as Locale];
  return {
    title: doc.metaTitle,
    description: doc.metaDescription,
    alternates: { canonical: `/${raw}/privacy` },
  };
}

export default async function PrivacyPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return <LegalDocument doc={privacyPolicy[locale]} locale={locale} />;
}
