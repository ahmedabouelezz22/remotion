'use client';

import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import {
  ChevronDown,
  Clock,
  Languages,
  Mail,
  Menu,
  Phone,
  ShoppingBag,
  UserRound,
  X,
} from 'lucide-react';
import { useCart } from '@/components/cart-provider';
import { SectorIcon } from '@/components/sector-icon';
import { dict, path, switchPath, type Locale } from '@/content/i18n';
import { practiceGroups } from '@/content/practice-areas';
import { categoryKeys, categoryLabelsEn } from '@/content/products';
import { featuredSectors, sectorText, sectors } from '@/content/sectors';
import { serviceText, services } from '@/content/services';
import { site } from '@/content/site';
import { cn } from '@/lib/utils';

/**
 * شريط التنقّل الرئيسي بقوائمه المنسدلة.
 *
 * القوائم تُفتح بالـ CSS وحده (`:hover` و`:focus-within`) وقائمة الهاتف عنصر
 * `<details>` أصلي — بقصد: التنقّل أهمّ ما في الصفحة، فلا يصحّ أن يتوقّف على
 * تحميل الجافاسكربت أو نجاحه. الجافاسكربت هنا تحسين فقط: يغلق قائمة الهاتف
 * عند الانتقال، ويغلق المنسدلة بمفتاح Escape.
 */

const linkBase =
  'inline-flex items-center gap-1 rounded-lg px-3 py-2 text-[0.88rem] font-semibold transition-colors';
const linkIdle = 'text-slate-600 hover:bg-navy-900/5 hover:text-navy-900';
const linkActive = 'bg-navy-900/8 text-navy-900';

function closeOnEscape(event: KeyboardEvent<HTMLElement>) {
  if (event.key === 'Escape') (document.activeElement as HTMLElement | null)?.blur();
}

function Dropdown({
  label,
  active,
  wide = false,
  children,
}: {
  label: string;
  active: boolean;
  /** لوحة بعرض الشريط كلّه (للقوائم الكبيرة) بدل لوحة صغيرة تحت العنصر */
  wide?: boolean;
  children: ReactNode;
}) {
  return (
    // العنصر بارتفاع الشريط كلّه: فلا تنقطع حالة hover في المسافة بين الزرّ واللوحة
    <div
      className={cn('group/menu flex h-full items-center', wide ? 'static' : 'relative')}
      onKeyDown={closeOnEscape}
    >
      <button type="button" aria-haspopup="true" className={cn(linkBase, active ? linkActive : linkIdle)}>
        {label}
        <ChevronDown
          aria-hidden="true"
          className="h-3.5 w-3.5 transition-transform duration-200 group-hover/menu:rotate-180 group-focus-within/menu:rotate-180"
        />
      </button>
      <div
        className={cn(
          'invisible absolute top-full z-50 opacity-0 transition-[opacity,visibility] duration-150',
          'group-hover/menu:visible group-hover/menu:opacity-100',
          'group-focus-within/menu:visible group-focus-within/menu:opacity-100',
          wide ? 'inset-x-0 px-5 sm:px-8' : 'start-0 w-72',
        )}
      >
        <div className="rounded-2xl border border-sand-200 bg-white p-5 shadow-[0_24px_60px_rgba(11,31,58,0.18)]">
          {children}
        </div>
      </div>
    </div>
  );
}

const menuHeading = 'mb-3 text-xs font-extrabold tracking-wide text-gold-600';
const menuLink =
  'flex min-h-[40px] items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-navy-900/5 hover:text-navy-900';
const menuAllLink =
  'mt-3 inline-flex min-h-[40px] items-center gap-1.5 rounded-lg px-2.5 text-sm font-extrabold text-navy-900 transition-colors hover:text-gold-600';

export function SiteHeader({ locale }: { locale: Locale }) {
  const pathname = usePathname();
  const [scrolled, setScrolled] = useState(false);
  const mobileMenu = useRef<HTMLDetailsElement>(null);
  const { count, ready } = useCart();
  const t = dict(locale);
  const isArabic = locale === 'ar';

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 12);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // إغلاق قائمة الجوال عند الانتقال إلى صفحة أخرى
  useEffect(() => {
    if (mobileMenu.current) mobileMenu.current.open = false;
  }, [pathname]);

  const home = path(locale, '/');
  const isActive = (...hrefs: string[]) => hrefs.some((href) => pathname.startsWith(path(locale, href)));

  const storeCategories = Object.entries(categoryKeys).map(([key, value]) => ({
    href: `${path(locale, '/store')}?category=${key}`,
    label: isArabic ? value : (categoryLabelsEn[value] ?? value),
  }));

  const knowledgeLinks = [
    { href: '/blog', label: t.nav.blog },
    { href: '/library', label: t.nav.library },
    { href: '/videos', label: t.nav.videos },
  ];
  // أقسام مُخطَّط لها ولم تُطلق: تُعرض موسومة «قريباً» بلا رابط، فلا يُفتح باب فارغ
  const knowledgeSoon = [t.nav.judgments, t.nav.legislation, t.nav.academy];

  const languageSwitch = (className: string, showLabel: boolean) => (
    <Link
      href={switchPath(locale, pathname)}
      lang={isArabic ? 'en' : 'ar'}
      className={className}
      aria-label={t.nav.switchLanguageLabel}
    >
      <Languages className="h-4 w-4" aria-hidden="true" />
      {showLabel ? <span>{t.nav.switchLanguage}</span> : null}
    </Link>
  );

  return (
    <>
      <a
        href="#main"
        className="sr-only focus:not-sr-only focus:absolute focus:top-3 focus:z-[60] focus:rounded-lg focus:bg-navy-900 focus:px-4 focus:py-2 focus:text-white focus:ltr:left-3 focus:rtl:right-3"
      >
        {t.nav.skipToContent}
      </a>

      {/* الشريط العلوي: وسائل التواصل واللغة — على الشاشات الواسعة فقط */}
      <div className="hidden bg-navy-950 text-navy-100 lg:block">
        <div className="mx-auto flex h-9 max-w-7xl items-center justify-between gap-6 px-8 text-xs font-semibold">
          <div className="flex items-center gap-6">
            <a href={`tel:${site.contact.phoneE164}`} className="inline-flex items-center gap-1.5 hover:text-gold-300">
              <Phone className="h-3.5 w-3.5" aria-hidden="true" />
              <span className="numeric" dir="ltr">
                {site.contact.phoneLocal}
              </span>
            </a>
            <a href={`mailto:${site.contact.publicEmail}`} className="inline-flex items-center gap-1.5 hover:text-gold-300">
              <Mail className="h-3.5 w-3.5" aria-hidden="true" />
              <span dir="ltr">{site.contact.publicEmail}</span>
            </a>
            <span className="inline-flex items-center gap-1.5 text-navy-100/80">
              <Clock className="h-3.5 w-3.5" aria-hidden="true" />
              {t.common.workingHoursValue}
            </span>
          </div>
          {languageSwitch('inline-flex items-center gap-1.5 font-bold hover:text-gold-300', true)}
        </div>
      </div>

      <header
        className={cn(
          'sticky top-0 z-50 border-b bg-sand-50 transition-shadow duration-300',
          scrolled ? 'border-sand-200 shadow-[0_6px_24px_rgba(11,31,58,0.08)]' : 'border-transparent',
        )}
      >
        {/*
          * `min-w-0` على رابط الهوية مقصود: بدونه يصير أدنى عرض للصفّ مجموع
          * عرض الهوية كاملةً + الأزرار، فيتجاوز 390px ويظهر تمرير أفقي على
          * الهاتف. و`relative` هنا مرجع اللوحات المنسدلة العريضة.
          */}
        <div className="relative mx-auto flex h-[68px] max-w-7xl items-center justify-between gap-3 px-5 sm:px-8 lg:gap-5">
          <Link href={home} className="flex min-w-0 items-center gap-2 sm:gap-3">
            <Image
              src={site.brand.logo}
              alt=""
              width={44}
              height={44}
              className="h-10 w-10 shrink-0 object-contain sm:h-11 sm:w-11"
              priority
            />
            <span className="min-w-0 leading-tight">
              <span className="block truncate font-display text-[0.92rem] font-extrabold text-navy-900 sm:text-[0.98rem]">
                {isArabic ? 'مؤسسة أبو العز' : 'Abo Elezz Law Firm'}
              </span>
              <span className="hidden truncate text-[0.7rem] font-semibold tracking-wide text-slate-500 sm:block lg:hidden xl:block">
                {isArabic ? 'للمحاماة والاستشارات القانونية' : 'Law & Legal Consultancy'}
              </span>
            </span>
          </Link>

          <nav className="hidden h-full items-center gap-0.5 lg:flex" aria-label={t.nav.mainNavLabel}>
            <Link href={path(locale, '/about')} className={cn(linkBase, isActive('/about') ? linkActive : linkIdle)}>
              {t.nav.about}
            </Link>

            <Dropdown label={t.nav.services} active={isActive('/services', '/practice-areas')} wide>
              <div className="grid gap-8 md:grid-cols-[1fr_1.4fr]">
                <div>
                  <p className={menuHeading}>{t.nav.coreServices}</p>
                  <ul>
                    {services.map((service) => (
                      <li key={service.slug}>
                        <Link href={path(locale, `/services/${service.slug}`)} className={menuLink}>
                          {serviceText(service, locale).title}
                        </Link>
                      </li>
                    ))}
                  </ul>
                  <Link href={path(locale, '/services')} className={menuAllLink}>
                    {t.nav.allServices} <span aria-hidden="true">{isArabic ? '←' : '→'}</span>
                  </Link>
                </div>
                <div>
                  <p className={menuHeading}>{t.nav.practiceAreas}</p>
                  <ul className="grid gap-x-4 sm:grid-cols-2">
                    {practiceGroups.map((group) => (
                      <li key={group.key}>
                        <Link href={`${path(locale, '/practice-areas')}#${group.key}`} className={menuLink}>
                          {isArabic ? group.title.ar : group.title.en}
                        </Link>
                      </li>
                    ))}
                    <li>
                      <Link href={`${path(locale, '/practice-areas')}#professional`} className={menuLink}>
                        {t.nav.professionalServices}
                      </Link>
                    </li>
                  </ul>
                  <Link href={path(locale, '/practice-areas')} className={menuAllLink}>
                    {t.nav.practiceAreas} <span aria-hidden="true">{isArabic ? '←' : '→'}</span>
                  </Link>
                </div>
              </div>
            </Dropdown>

            <Dropdown label={t.nav.sectors} active={isActive('/sectors')} wide>
              <p className={menuHeading}>{t.homeX.marqueeLabel}</p>
              <ul className="grid gap-x-4 md:grid-cols-3">
                {sectors.map((sector) => (
                  <li key={sector.slug}>
                    <Link href={path(locale, `/sectors/${sector.slug}`)} className={menuLink}>
                      <SectorIcon name={sector.icon} className="h-4 w-4 shrink-0 text-gold-600" />
                      <span className="truncate">{sectorText(sector, locale).name}</span>
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={path(locale, '/sectors')} className={menuAllLink}>
                {t.nav.allSectors} <span aria-hidden="true">{isArabic ? '←' : '→'}</span>
              </Link>
            </Dropdown>

            <Dropdown label={t.nav.store} active={isActive('/store')}>
              <ul>
                {storeCategories.map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className={menuLink}>
                      {item.label}
                    </Link>
                  </li>
                ))}
              </ul>
              <Link href={path(locale, '/store')} className={menuAllLink}>
                {t.nav.allProducts} <span aria-hidden="true">{isArabic ? '←' : '→'}</span>
              </Link>
            </Dropdown>

            <Link
              href={path(locale, '/memberships')}
              className={cn(linkBase, isActive('/memberships') ? linkActive : linkIdle)}
            >
              {t.nav.memberships}
            </Link>

            <Dropdown label={t.nav.knowledge} active={isActive('/blog', '/library', '/videos')}>
              <ul>
                {knowledgeLinks.map((item) => (
                  <li key={item.href}>
                    <Link href={path(locale, item.href)} className={menuLink}>
                      {item.label}
                    </Link>
                  </li>
                ))}
                {knowledgeSoon.map((label) => (
                  <li
                    key={label}
                    className="flex min-h-[40px] items-center justify-between gap-2 px-2.5 py-2 text-sm font-semibold text-slate-500"
                  >
                    {label}
                    <span className="rounded-full bg-sand-100 px-2 py-0.5 text-[0.68rem] font-bold text-slate-600">
                      {t.nav.soon}
                    </span>
                  </li>
                ))}
              </ul>
            </Dropdown>

            <Link href={path(locale, '/contact')} className={cn(linkBase, isActive('/contact') ? linkActive : linkIdle)}>
              {t.nav.contact}
            </Link>
          </nav>

          <div className="flex shrink-0 items-center gap-1 sm:gap-2">
            {/* تحت lg يظهر مبدّل اللغة هنا أيقونةً؛ فوقها مكانه الشريط العلوي */}
            {languageSwitch(
              'inline-flex min-h-[40px] min-w-[40px] items-center justify-center rounded-lg px-2.5 py-2 text-navy-900 transition-colors hover:bg-navy-900/5 lg:hidden',
              false,
            )}

            <Link
              href={path(locale, '/cart')}
              className="relative rounded-lg p-2.5 text-navy-900 transition-colors hover:bg-navy-900/5"
              aria-label={`${t.nav.cart}${ready && count > 0 ? ` — ${count}` : ''}`}
            >
              <ShoppingBag className="h-5 w-5" aria-hidden="true" />
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
              <UserRound className="h-5 w-5" aria-hidden="true" />
            </Link>

            <Link
              href={path(locale, '/booking')}
              className="hidden min-h-[40px] items-center rounded-xl bg-navy-900 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-navy-800 xl:inline-flex"
            >
              {t.nav.bookCta}
            </Link>

            {/* قائمة الهاتف واللوحي: `<details>` أصلي، فيعمل بلا جافاسكربت */}
            <details ref={mobileMenu} className="group/mobile lg:hidden">
              <summary
                className="flex h-11 w-11 cursor-pointer list-none items-center justify-center rounded-lg text-navy-900 transition-colors hover:bg-navy-900/5 [&::-webkit-details-marker]:hidden"
                aria-label={t.nav.menu}
              >
                <Menu className="h-6 w-6 group-open/mobile:hidden" aria-hidden="true" />
                <X className="hidden h-6 w-6 group-open/mobile:block" aria-hidden="true" />
              </summary>

              {/* `absolute` لا `fixed`: مرجعه الشريط اللاصق نفسه، فلا يتأثّر بأي فلتر على أسلافه */}
              <nav
                className="absolute inset-x-0 top-full z-40 h-[calc(100dvh-68px)] overflow-y-auto border-t border-sand-200 bg-sand-50 p-5"
                aria-label={t.nav.mobileNavLabel}
              >
                <ul className="flex flex-col gap-1">
                  <MobileLink href={path(locale, '/about')} label={t.nav.about} />

                  <MobileGroup label={t.nav.services}>
                    {services.map((service) => (
                      <MobileSubLink
                        key={service.slug}
                        href={path(locale, `/services/${service.slug}`)}
                        label={serviceText(service, locale).title}
                      />
                    ))}
                    <MobileSubLink href={path(locale, '/practice-areas')} label={t.nav.practiceAreas} strong />
                    <MobileSubLink href={path(locale, '/services')} label={t.nav.allServices} strong />
                  </MobileGroup>

                  <MobileGroup label={t.nav.sectors}>
                    {featuredSectors.map((sector) => (
                      <MobileSubLink
                        key={sector.slug}
                        href={path(locale, `/sectors/${sector.slug}`)}
                        label={sectorText(sector, locale).name}
                      />
                    ))}
                    <MobileSubLink
                      href={path(locale, '/sectors')}
                      label={`${t.nav.allSectors} (${sectors.length})`}
                      strong
                    />
                  </MobileGroup>

                  <MobileGroup label={t.nav.store}>
                    {storeCategories.map((item) => (
                      <MobileSubLink key={item.href} href={item.href} label={item.label} />
                    ))}
                    <MobileSubLink href={path(locale, '/store')} label={t.nav.allProducts} strong />
                  </MobileGroup>

                  <MobileLink href={path(locale, '/memberships')} label={t.nav.memberships} />

                  <MobileGroup label={t.nav.knowledge}>
                    {knowledgeLinks.map((item) => (
                      <MobileSubLink key={item.href} href={path(locale, item.href)} label={item.label} />
                    ))}
                  </MobileGroup>

                  <MobileLink href={path(locale, '/contact')} label={t.nav.contact} />
                </ul>

                <Link
                  href={path(locale, '/booking')}
                  className="mt-4 flex min-h-[52px] items-center justify-center rounded-xl bg-navy-900 px-4 py-3.5 font-bold text-white"
                >
                  {t.nav.bookCta}
                </Link>
                <a
                  href={`tel:${site.contact.phoneE164}`}
                  className="mt-3 flex min-h-[52px] items-center justify-center gap-2 rounded-xl bg-gold-500 px-4 py-3.5 font-bold text-navy-950"
                >
                  <Phone className="h-4 w-4" aria-hidden="true" />
                  <span className="numeric" dir="ltr">
                    {site.contact.phoneLocal}
                  </span>
                </a>
              </nav>
            </details>
          </div>
        </div>
      </header>
    </>
  );
}

function MobileLink({ href, label }: { href: string; label: string }) {
  return (
    <li>
      <Link
        href={href}
        className="flex min-h-[52px] items-center rounded-xl px-4 text-base font-bold text-navy-900 transition-colors hover:bg-navy-900/5"
      >
        {label}
      </Link>
    </li>
  );
}

function MobileGroup({ label, children }: { label: string; children: ReactNode }) {
  return (
    <li>
      <details className="group/sub rounded-xl open:bg-white open:shadow-sm">
        <summary className="flex min-h-[52px] cursor-pointer list-none items-center justify-between rounded-xl px-4 text-base font-bold text-navy-900 [&::-webkit-details-marker]:hidden">
          {label}
          <ChevronDown
            aria-hidden="true"
            className="h-4 w-4 text-gold-600 transition-transform duration-200 group-open/sub:rotate-180"
          />
        </summary>
        <ul className="px-2 pb-2">{children}</ul>
      </details>
    </li>
  );
}

function MobileSubLink({ href, label, strong = false }: { href: string; label: string; strong?: boolean }) {
  return (
    <li>
      <Link
        href={href}
        className={cn(
          'flex min-h-[44px] items-center rounded-lg px-3 text-[0.95rem] transition-colors hover:bg-navy-900/5',
          strong ? 'font-extrabold text-navy-900' : 'font-semibold text-slate-700',
        )}
      >
        {label}
      </Link>
    </li>
  );
}
