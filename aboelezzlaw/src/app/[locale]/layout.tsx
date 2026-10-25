import type { Metadata, Viewport } from 'next';
import { Cairo, Tajawal } from 'next/font/google';
import { notFound } from 'next/navigation';
import { dict, direction, htmlLang, isLocale, locales, type Locale } from '@/content/i18n';
import { site } from '@/content/site';
import { jsonLdScript } from '@/lib/utils';
import '../globals.css';

const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  variable: '--font-cairo',
  display: 'swap',
  weight: ['400', '500', '600', '700'],
});

const tajawal = Tajawal({
  subsets: ['arabic', 'latin'],
  variable: '--font-tajawal',
  display: 'swap',
  weight: ['500', '700', '800', '900'],
});

/** اللغتان تُولَّدان وقت البناء، فلا طلب يدفع ثمن توليد أول */
export function generateStaticParams() {
  return locales.map((locale) => ({ locale }));
}

export const viewport: Viewport = {
  themeColor: '#1a3a52',
  width: 'device-width',
  initialScale: 1,
};

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const t = dict(locale);
  const isArabic = locale === 'ar';

  return {
    metadataBase: new URL(site.url),
    title: {
      default: isArabic
        ? `${site.name} | استشارات قانونية ومراجعة عقود`
        : `${site.nameEn} | Legal counsel and contract review`,
      template: `%s | ${t.common.firmShort}`,
    },
    description: isArabic ? site.description : site.descriptionEn,
    keywords: isArabic
      ? [
          'محامي',
          'استشارات قانونية',
          'مراجعة عقود',
          'صياغة عقود',
          'زكاة وضرائب',
          'تحكيم تجاري',
          'قانون الشركات',
          'مصر',
          'السعودية',
        ]
      : [
          'law firm',
          'legal consultation',
          'contract review',
          'contract drafting',
          'Zakat and tax',
          'commercial arbitration',
          'corporate law',
          'Egypt',
          'Saudi Arabia',
        ],
    authors: [{ name: isArabic ? 'أحمد أبو العز' : 'Ahmed Abo Elezz' }],
    alternates: {
      canonical: `/${locale}`,
      // hreflang يمنع تنافس النسختين على نفس الاستعلام في نتائج البحث
      languages: {
        ar: '/ar',
        en: '/en',
        'x-default': `/${'ar'}`,
      },
    },
    openGraph: {
      type: 'website',
      locale: isArabic ? 'ar_EG' : 'en_US',
      url: `${site.url}/${locale}`,
      siteName: isArabic ? site.name : site.nameEn,
      title: isArabic ? site.name : site.nameEn,
      description: isArabic ? site.description : site.descriptionEn,
    },
    twitter: {
      card: 'summary_large_image',
      title: isArabic ? site.name : site.nameEn,
      description: isArabic ? site.description : site.descriptionEn,
    },
    robots: {
      index: true,
      follow: true,
      googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
    },
  };
}

/** بيانات منظَّمة تساعد محركات البحث على فهم طبيعة الجهة */
const structuredData = (locale: Locale) => ({
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  name: locale === 'ar' ? site.name : site.nameEn,
  description: locale === 'ar' ? site.description : site.descriptionEn,
  url: `${site.url}/${locale}`,
  telephone: site.contact.phoneE164,
  email: site.contact.email,
  inLanguage: htmlLang(locale),
  areaServed: [
    { '@type': 'Country', name: 'Egypt' },
    { '@type': 'Country', name: 'Saudi Arabia' },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'EG',
    addressLocality: locale === 'ar' ? site.contact.address : site.contact.addressEn,
  },
  sameAs: Object.values(site.social).filter(Boolean),
  priceRange: '$$',
});

export default async function LocaleRootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;

  return (
    <html
      lang={htmlLang(locale)}
      dir={direction(locale)}
      className={`${cairo.variable} ${tajawal.variable}`}
    >
      <body className="flex min-h-dvh flex-col antialiased">
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: jsonLdScript(structuredData(locale)) }}
        />
        {children}
      </body>
    </html>
  );
}
