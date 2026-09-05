import type { Metadata, Viewport } from 'next';
import { Cairo, Tajawal } from 'next/font/google';
import { site } from '@/content/site';
import { CartProvider } from '@/components/cart-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { WhatsAppFab } from '@/components/whatsapp-fab';
import './globals.css';

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

export const metadata: Metadata = {
  metadataBase: new URL(site.url),
  title: {
    default: `${site.name} | استشارات قانونية ومراجعة عقود`,
    template: `%s | ${site.shortName}`,
  },
  description: site.description,
  keywords: [
    'محامي',
    'استشارات قانونية',
    'مراجعة عقود',
    'صياغة عقود',
    'زكاة وضرائب',
    'تحكيم تجاري',
    'قانون الشركات',
    'مصر',
    'السعودية',
  ],
  authors: [{ name: 'أحمد أبو العز' }],
  alternates: { canonical: '/' },
  openGraph: {
    type: 'website',
    locale: site.locale,
    url: site.url,
    siteName: site.name,
    title: site.name,
    description: site.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: site.name,
    description: site.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-image-preview': 'large' },
  },
};

export const viewport: Viewport = {
  themeColor: '#1a3a52',
  width: 'device-width',
  initialScale: 1,
};

/** بيانات منظَّمة تساعد محركات البحث على فهم طبيعة الجهة */
const structuredData = {
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  name: site.name,
  description: site.description,
  url: site.url,
  telephone: site.contact.phoneE164,
  email: site.contact.email,
  areaServed: [
    { '@type': 'Country', name: 'Egypt' },
    { '@type': 'Country', name: 'Saudi Arabia' },
  ],
  address: {
    '@type': 'PostalAddress',
    addressCountry: 'EG',
    addressLocality: site.contact.address,
  },
  sameAs: Object.values(site.social).filter(Boolean),
  priceRange: '$$',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang={site.lang} dir={site.dir} className={`${cairo.variable} ${tajawal.variable}`}>
      <body className="flex min-h-dvh flex-col antialiased">
        <script
          type="application/ld+json"
          // eslint-disable-next-line react/no-danger -- بيانات منظَّمة ثابتة لا تحتوي مدخلات مستخدم
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
        <CartProvider>
          <SiteHeader />
          <main id="main" className="flex-1">
            {children}
          </main>
          <SiteFooter />
          <WhatsAppFab />
        </CartProvider>
      </body>
    </html>
  );
}
