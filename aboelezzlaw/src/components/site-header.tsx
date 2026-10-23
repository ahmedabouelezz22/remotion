'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';
import { Languages, Menu, Phone, ShoppingBag, UserRound, X } from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { dict, path, switchPath, type Locale } from '@/content/i18n';
import { navigation, site } from '@/content/site';
import { cn } from '@/lib/utils';

export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const { count, ready } = useCart();
  const t = dict(locale);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // إغلاق قائمة الجوال عند الانتقال إلى صفحة أخرى
  useEffect(() => setOpen(false), [pathname]);

  // منع تمرير الصفحة خلف القائمة المفتوحة
  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const home = path(locale, '/');
  const isActive = (href: string) => {
    const full = path(locale, href);
    return href === '/' ? pathname === full : pathname.startsWith(full);
  };

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white focus:ltr:left-3 focus:rtl:right-3"
      >
        {t.nav.skipToContent}
      </a>

      <header
        className={cn(
          'sticky top-0 z-50 border-b transition-all duration-300',
          scrolled
            ? 'border-sand-200 bg-sand-50/95 backdrop-blur-md shadow-sm'
            : 'border-transparent bg-sand-50',
        )}
      >
        <div className="mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-4 px-5 sm:px-8">
          <Link href={home} className="flex shrink-0 items-center gap-3">
            <Image
              src={site.brand.logo}
              alt=""
              width={44}
              height={44}
              className="h-11 w-11 shrink-0 object-contain"
              priority
            />
            <span className="leading-tight">
              <span className="block font-display text-[0.98rem] font-extrabold text-navy-900">
                {locale === 'ar' ? 'مكتب أبو العز' : 'Abo Elezz'}
              </span>
              <span className="block text-[0.7rem] font-semibold tracking-wide text-slate-500">
                {locale === 'ar' ? 'للمحاماة والاستشارات القانونية' : 'Law & Legal Consultancy'}
              </span>
            </span>
          </Link>

          <nav
            className="hidden items-center gap-0.5 xl:flex"
            aria-label={locale === 'ar' ? 'التنقّل الرئيسي' : 'Main navigation'}
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={path(locale, item.href)}
                className={cn(
                  'rounded-lg px-3 py-2 text-[0.88rem] font-semibold transition-colors',
                  isActive(item.href)
                    ? 'bg-navy-900/8 text-navy-900'
                    : 'text-slate-600 hover:bg-navy-900/5 hover:text-navy-900',
                )}
              >
                {t.nav[item.key]}
              </Link>
            ))}
          </nav>

          <div className="flex items-center gap-2">
            {/* تبديل اللغة يحافظ على نفس الصفحة، فلا يُعاد الزائر إلى البداية */}
            <Link
              href={switchPath(locale, pathname)}
              lang={locale === 'ar' ? 'en' : 'ar'}
              className="inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-2.5 py-2 text-[0.8rem] font-bold text-navy-900 transition-colors hover:bg-navy-900/5"
              aria-label={t.nav.switchLanguageLabel}
            >
              <Languages className="h-4 w-4" />
              <span>{t.nav.switchLanguage}</span>
            </Link>

            <Link
              href={path(locale, '/cart')}
              className="relative rounded-lg p-2.5 text-navy-900 transition-colors hover:bg-navy-900/5"
              aria-label={`${t.nav.cart}${ready && count > 0 ? ` — ${count}` : ''}`}
            >
              <ShoppingBag className="h-5 w-5" />
              {ready && count > 0 ? (
                <span className="numeric absolute -top-0.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-gold-500 px-1 text-[0.68rem] font-black text-navy-950 ltr:-right-0.5 rtl:-left-0.5">
                  {count}
                </span>
              ) : null}
            </Link>

            <Link
              href={path(locale, '/account')}
              className="rounded-lg p-2.5 text-navy-900 transition-colors hover:bg-navy-900/5"
              aria-label={t.nav.account}
            >
              <UserRound className="h-5 w-5" />
            </Link>

            <a
              href={`tel:${site.contact.phoneE164}`}
              className="hidden items-center gap-2 rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-800 sm:inline-flex"
            >
              <Phone className="h-4 w-4" />
              <span className="numeric" dir="ltr">
                {site.contact.phoneLocal}
              </span>
            </a>

            <button
              type="button"
              onClick={() => setOpen((value) => !value)}
              className="rounded-lg p-2.5 text-navy-900 transition-colors hover:bg-navy-900/5 xl:hidden"
              aria-expanded={open}
              aria-label={open ? t.nav.closeMenu : t.nav.menu}
            >
              {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </header>

      {open ? (
        <div className="fixed inset-0 top-[68px] z-40 overflow-y-auto bg-sand-50 xl:hidden">
          <nav
            className="flex flex-col gap-1 p-5"
            aria-label={locale === 'ar' ? 'قائمة الجوال' : 'Mobile menu'}
          >
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={path(locale, item.href)}
                className={cn(
                  'rounded-xl px-4 py-3.5 text-base font-bold transition-colors',
                  isActive(item.href)
                    ? 'bg-navy-900 text-white'
                    : 'text-navy-900 hover:bg-navy-900/5',
                )}
              >
                {t.nav[item.key]}
              </Link>
            ))}
            <a
              href={`tel:${site.contact.phoneE164}`}
              className="mt-3 flex items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3.5 font-bold text-navy-950"
            >
              <Phone className="h-4 w-4" />
              <span className="numeric" dir="ltr">
                {site.contact.phoneLocal}
              </span>
            </a>
          </nav>
        </div>
      ) : null}
    </>
  );
}
