import Image from 'next/image';
import Link from 'next/link';
import { Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { Container } from '@/components/ui/container';
import { dict, path, type Locale } from '@/content/i18n';
import { serviceText, services } from '@/content/services';
import { navigation, site, waLink } from '@/content/site';

export function SiteFooter({ locale }: { locale: Locale }) {
  const year = new Date().getFullYear();
  const t = dict(locale);
  const isArabic = locale === 'ar';

  return (
    <footer className="mt-auto bg-navy-900 text-navy-100">
      <Container size="wide" className="py-14">
        <div className="grid gap-10 md:grid-cols-2 lg:grid-cols-4">
          <div className="lg:col-span-1">
            <div className="mb-4 flex items-center gap-3">
              <Image
                src={site.brand.logo}
                alt=""
                width={44}
                height={44}
                className="h-11 w-11 shrink-0 object-contain"
              />
              <span className="font-display text-lg font-extrabold text-white">
                {isArabic ? site.name : site.nameEn}
              </span>
            </div>
            <p className="text-sm leading-8 text-navy-100/75">
              {isArabic ? site.description : site.descriptionEn}
            </p>
            {site.social.youtube ? (
              <a
                href={site.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:border-gold-500 hover:text-gold-400"
              >
                <Youtube className="h-4 w-4" />
                {t.footer.youtubeChannel}
              </a>
            ) : null}
          </div>

          <nav aria-label={t.footer.siteLinks}>
            <h3 className="mb-4 text-sm font-bold tracking-widest text-gold-400">
              {t.footer.siteLinks}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={path(locale, item.href)}
                    className="text-navy-100/75 transition-colors hover:text-gold-400"
                  >
                    {t.nav[item.key]}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href={path(locale, '/account')}
                  className="text-navy-100/75 transition-colors hover:text-gold-400"
                >
                  {t.nav.account}
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label={t.nav.services}>
            <h3 className="mb-4 text-sm font-bold tracking-widest text-gold-400">
              {t.nav.services}
            </h3>
            <ul className="space-y-2.5 text-sm">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={path(locale, `/services/${service.slug}`)}
                    className="text-navy-100/75 transition-colors hover:text-gold-400"
                  >
                    {serviceText(service, locale).title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 text-sm font-bold tracking-widest text-gold-400">
              {t.footer.contactUs}
            </h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <a
                  href={`tel:${site.contact.phoneE164}`}
                  className="flex items-center gap-2.5 text-navy-100/75 transition-colors hover:text-gold-400"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="numeric" dir="ltr">
                    {site.contact.phoneLocal}
                  </span>
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${site.contact.email}`}
                  className="flex items-center gap-2.5 break-all text-navy-100/75 transition-colors hover:text-gold-400"
                >
                  <Mail className="h-4 w-4 shrink-0" />
                  {site.contact.email}
                </a>
              </li>
              <li className="flex items-center gap-2.5 text-navy-100/75">
                <MapPin className="h-4 w-4 shrink-0" />
                {isArabic ? site.contact.address : site.contact.addressEn}
              </li>
            </ul>
            <a
              href={waLink(
                isArabic
                  ? 'السلام عليكم، أود الاستفسار عن خدماتكم القانونية.'
                  : 'Hello, I would like to enquire about your legal services.',
              )}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-whatsapp-600 px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-whatsapp-700"
            >
              {t.common.whatsappUs}
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-xs text-navy-100/70 sm:flex-row">
          <p className="numeric">
            © {year} {isArabic ? site.name : site.nameEn}. {t.footer.rights}
          </p>
          {/* حشو رأسي يرفع هدف اللمس إلى 40px على الهاتف — نصّ بارتفاع 16px
              لا يُلمس بثقة بإصبع */}
          <div className="flex gap-2">
            <Link
              href={path(locale, '/privacy')}
              className="-my-1 inline-flex min-h-[40px] items-center px-3 py-2 transition-colors hover:text-gold-400"
            >
              {t.footer.privacy}
            </Link>
            <Link
              href={path(locale, '/terms')}
              className="-my-1 inline-flex min-h-[40px] items-center px-3 py-2 transition-colors hover:text-gold-400"
            >
              {t.footer.terms}
            </Link>
          </div>
        </div>

        <p className="mt-6 rounded-xl bg-white/5 p-4 text-[0.72rem] leading-6 text-navy-100/70">
          {t.footer.disclaimer}
        </p>
      </Container>
    </footer>
  );
}
