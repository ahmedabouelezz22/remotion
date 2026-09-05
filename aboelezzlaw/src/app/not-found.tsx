import Link from 'next/link';
import { ButtonLink } from '@/components/ui/button';
import { Container, Section } from '@/components/ui/container';
import { navigation } from '@/content/site';

export default function NotFound() {
  return (
    <Section className="py-28">
      <Container size="narrow" className="text-center">
        <p className="numeric mb-4 font-display text-6xl font-black text-gold-500">404</p>
        <h1 className="mb-4 text-2xl text-navy-900 sm:text-3xl">الصفحة غير موجودة</h1>
        <p className="mx-auto mb-10 max-w-md leading-9 text-slate-600">
          الرابط الذي فتحته غير صحيح أو أن الصفحة نُقلت. جرّب أحد الأقسام التالية.
        </p>

        <div className="mb-10 flex flex-wrap justify-center gap-2">
          {navigation.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-full border border-sand-200 bg-white px-5 py-2.5 text-sm font-semibold text-slate-600 transition-colors hover:border-gold-500 hover:text-navy-900"
            >
              {item.label}
            </Link>
          ))}
        </div>

        <ButtonLink href="/" size="lg">
          العودة إلى الرئيسية
        </ButtonLink>
      </Container>
    </Section>
  );
}
