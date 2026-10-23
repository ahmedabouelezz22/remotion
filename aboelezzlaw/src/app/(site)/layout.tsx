import { CartProvider } from '@/components/cart-provider';
import { SiteHeader } from '@/components/site-header';
import { SiteFooter } from '@/components/site-footer';
import { WhatsAppFab } from '@/components/whatsapp-fab';

/** واجهة الزوّار العامة — مجموعة مسارات لا تُغيّر العناوين */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <CartProvider>
      <SiteHeader />
      <main id="main" className="flex-1">
        {children}
      </main>
      <SiteFooter />
      <WhatsAppFab />
    </CartProvider>
  );
}
