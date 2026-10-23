import type { Metadata } from 'next';
import Link from 'next/link';
import { ArrowLeft, Building2, Calculator, FileText, Scale, ShieldCheck, Users } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { services } from '@/content/services';

export const metadata: Metadata = {
  title: 'الخدمات القانونية',
  description:
    'خدمات المكتب: استشارات الشركات، مراجعة وصياغة العقود، الزكاة والضرائب، عقود العمل، المنازعات والتحكيم، والامتثال التنظيمي.',
  alternates: { canonical: '/services' },
};

const iconMap = {
  building: Building2,
  'file-text': FileText,
  calculator: Calculator,
  users: Users,
  scale: Scale,
  'shield-check': ShieldCheck,
} as const;

export default function ServicesPage() {
  return (
    <>
      <PageHeader
        eyebrow="مجالات العمل"
        title="الخدمات القانونية"
        description="كل خدمة معرَّفة بنطاقها ومخرجاتها والجهة التي تناسبها، حتى تعرف ما ستتسلّمه قبل أن تبدأ."
      />

      <Section>
        <Container size="wide">
          <div className="grid gap-6 md:grid-cols-2">
            {services.map((service) => {
              const Icon = iconMap[service.icon as keyof typeof iconMap] ?? Scale;
              return (
                <Card key={service.slug} hover className="flex flex-col">
                  <span className="mb-5 flex h-12 w-12 items-center justify-center rounded-xl bg-navy-900/6 text-navy-900">
                    <Icon className="h-6 w-6" />
                  </span>
                  <h2 className="mb-2.5 text-xl text-navy-900">{service.title}</h2>
                  <p className="mb-5 text-sm leading-8 text-slate-600">{service.description}</p>
                  <ul className="mb-7 flex-1 space-y-2 text-sm text-slate-600">
                    {service.deliverables.slice(0, 3).map((item) => (
                      <li key={item} className="flex gap-2.5">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-gold-500" />
                        {item}
                      </li>
                    ))}
                  </ul>
                  <Link
                    href={`/services/${service.slug}`}
                    className="inline-flex items-center gap-1.5 text-sm font-bold text-navy-900 transition-colors hover:text-gold-600"
                  >
                    تفاصيل الخدمة والمخرجات
                    <ArrowLeft className="h-3.5 w-3.5" />
                  </Link>
                </Card>
              );
            })}
          </div>

          <Card className="mt-10 border-gold-400/50 bg-gold-500/8 text-center">
            <h2 className="mb-2.5 text-lg text-navy-900">مسألتك خارج هذه القائمة؟</h2>
            <p className="mx-auto mb-6 max-w-xl text-sm leading-8 text-slate-600">
              اكتب لنا تفاصيلها وسنوضّح إن كانت ضمن نطاق عملنا، أو نرشدك إلى الجهة الأنسب.
            </p>
            <ButtonLink href="/contact">تواصل معنا</ButtonLink>
          </Card>
        </Container>
      </Section>
    </>
  );
}
