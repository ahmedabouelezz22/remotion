import Link from 'next/link';
import { SiteFooter } from '@/components/site-footer';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/container';
import { defaultLocale, dict, path } from '@/content/i18n';
import { navigation } from '@/content/site';

/**
 * الـ 404 لا يعرف لغته: الوسيط يُسبق كل مسار بلغة، لكن المسار غير الموجود
 * داخل لغة ما يصل إلى هنا دون معلَمة. نستخدم الافتراضية — والزائر يجد
 * روابط الأقسام ليتابع منها.
 */
export default function NotFound() {
  const locale = defaultLocale;
  const t = dict(locale);

  return (
    <>
      <Section className="flex-1 py-28">
        <Container size="narrow" className="text-center">
          <p className="numeric mb-4 font-display text-6xl font-black text-gold-600">404</p>
          <h1 className="mb-4 text-2xl text-navy-900 sm:text-3xl">{t.notFound.title}</h1>
          <p className="mx-auto mb-10 max-w-md leading-9 text-slate-600">{t.notFound.body}</p>

          <div className="mb-10 flex flex-wrap justify-center gap-2">
            {navigation.map((item) => (
              <Link
                key={item.href}
                href={path(locale, item.href)}
                className="inline-flex min-h-[40px] items-center rounded-full border border-sand-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-gold-500 hover:text-navy-900"
              >
                {t.nav[item.key]}
              </Link>
            ))}
          </div>

          <ButtonLink href={path(locale, '/')} size="lg">
            {t.notFound.home}
          </ButtonLink>
        </Container>
      </Section>
      <SiteFooter locale={locale} />
    </>
  );
}
