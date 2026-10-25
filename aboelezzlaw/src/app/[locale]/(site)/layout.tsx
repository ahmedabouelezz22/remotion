import { notFound } from 'next/navigation';
import { CartProvider } from '@/components/cart-provider';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { WhatsAppFab } from '@/components/whatsapp-fab';
import { isLocale, type Locale } from '@/content/i18n';

/** واجهة الزوّار العامة — مجموعة مسارات لا تُغيّر العناوين */
export default async function SiteLayout({
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
    <CartProvider>
      <SiteHeader locale={locale} />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter locale={locale} />
      <WhatsAppFab locale={locale} />
    </CartProvider>
  );
}
