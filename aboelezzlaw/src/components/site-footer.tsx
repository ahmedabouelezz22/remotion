import Image from 'next/image';
import Link from 'next/link';
import { Mail, MapPin, Phone, Youtube } from 'lucide-react';
import { navigation, site, waLink } from '@/content/site';
import { services } from '@/content/services';
import { Container } from '@/components/ui/container';

export function SiteFooter() {
  const year = new Date().getFullYear();

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
                مكتب أبو العز للمحاماة
              </span>
            </div>
            <p className="text-sm leading-8 text-navy-100/75">{site.description}</p>
            {site.social.youtube ? (
              <a
                href={site.social.youtube}
                target="_blank"
                rel="noopener noreferrer"
                className="mt-5 inline-flex items-center gap-2 rounded-lg border border-white/15 px-3.5 py-2 text-sm font-semibold text-white transition-colors hover:border-gold-500 hover:text-gold-400"
              >
                <Youtube className="h-4 w-4" />
                قناة اليوتيوب
              </a>
            ) : null}
          </div>

          <nav aria-label="روابط الموقع">
            <h3 className="mb-4 text-sm font-bold tracking-widest text-gold-400">الموقع</h3>
            <ul className="space-y-2.5 text-sm">
              {navigation.map((item) => (
                <li key={item.href}>
                  <Link
                    href={item.href}
                    className="text-navy-100/75 transition-colors hover:text-gold-400"
                  >
                    {item.label}
                  </Link>
                </li>
              ))}
              <li>
                <Link
                  href="/account"
                  className="text-navy-100/75 transition-colors hover:text-gold-400"
                >
                  حسابي
                </Link>
              </li>
            </ul>
          </nav>

          <nav aria-label="الخدمات">
            <h3 className="mb-4 text-sm font-bold tracking-widest text-gold-400">الخدمات</h3>
            <ul className="space-y-2.5 text-sm">
              {services.map((service) => (
                <li key={service.slug}>
                  <Link
                    href={`/services/${service.slug}`}
                    className="text-navy-100/75 transition-colors hover:text-gold-400"
                  >
                    {service.title}
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          <div>
            <h3 className="mb-4 text-sm font-bold tracking-widest text-gold-400">التواصل</h3>
            <ul className="space-y-3.5 text-sm">
              <li>
                <a
                  href={`tel:${site.contact.phoneE164}`}
                  className="flex items-center gap-2.5 text-navy-100/75 transition-colors hover:text-gold-400"
                >
                  <Phone className="h-4 w-4 shrink-0" />
                  <span className="numeric" dir="ltr">{site.contact.phoneLocal}</span>
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
                {site.contact.address}
              </li>
            </ul>
            <a
              href={waLink('السلام عليكم، أود الاستفسار عن خدماتكم القانونية.')}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-5 inline-flex items-center gap-2 rounded-xl bg-[#128C7E] px-4 py-2.5 text-sm font-bold text-white transition-colors hover:bg-[#0f7a6d]"
            >
              مراسلة عبر واتساب
            </a>
          </div>
        </div>

        <div className="mt-12 flex flex-col items-center justify-between gap-4 border-t border-white/10 pt-7 text-xs text-navy-100/55 sm:flex-row">
          <p className="numeric">
            © {year} {site.name}. جميع الحقوق محفوظة.
          </p>
          <div className="flex gap-5">
            <Link href="/privacy" className="transition-colors hover:text-gold-400">
              سياسة الخصوصية
            </Link>
            <Link href="/terms" className="transition-colors hover:text-gold-400">
              الشروط والأحكام
            </Link>
          </div>
        </div>

        <p className="mt-6 rounded-xl bg-white/5 p-4 text-[0.72rem] leading-6 text-navy-100/50">
          إخلاء مسؤولية: المحتوى المنشور على هذا الموقع — بما فيه مقالات المدونة والمكتبة القانونية —
          ذو طبيعة تعريفية عامة، ولا يُعدّ استشارة قانونية في واقعة بعينها ولا تنشأ به علاقة
          مهنية بين الزائر والمكتب. الاعتماد عليه دون استشارة مباشرة يقع على مسؤولية القارئ وحده.
        </p>
      </Container>
    </footer>
  );
}
