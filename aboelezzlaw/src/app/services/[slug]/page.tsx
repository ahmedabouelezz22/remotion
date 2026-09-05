import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CheckCircle2, Users } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { getService, services } from '@/content/services';
import { waLink } from '@/content/site';

export function generateStaticParams() {
  return services.map((service) => ({ slug: service.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) return { title: 'الخدمة غير موجودة' };

  return {
    title: service.title,
    description: service.short,
    alternates: { canonical: `/services/${service.slug}` },
    openGraph: { title: service.title, description: service.short },
  };
}

export default async function ServiceDetailPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const service = getService(slug);
  if (!service) notFound();

  return (
    <>
      <PageHeader eyebrow="خدمة" title={service.title} description={service.short} />

      <Section>
        <Container size="wide">
          <div className="grid gap-10 lg:grid-cols-[1.4fr_1fr]">
            <div>
              <div className="article-body">
                <h2>نطاق الخدمة</h2>
                <p>{service.description}</p>
              </div>

              <h2 className="mt-12 mb-5 text-xl text-navy-900">ما الذي تتسلّمه</h2>
              <ul className="space-y-3.5">
                {service.deliverables.map((item) => (
                  <li key={item} className="flex gap-3 text-[0.95rem] leading-8 text-slate-700">
                    <CheckCircle2 className="mt-1.5 h-5 w-5 shrink-0 text-gold-600" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="space-y-4">
              <Card>
                <span className="mb-3 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900/6 text-navy-900">
                  <Users className="h-5 w-5" />
                </span>
                <h3 className="mb-2 text-base text-navy-900">لمن هذه الخدمة</h3>
                <p className="text-sm leading-8 text-slate-600">{service.audience}</p>
              </Card>

              <Card className="bg-navy-900 text-white">
                <h3 className="mb-2.5 text-lg text-white">ابدأ الآن</h3>
                <p className="mb-6 text-sm leading-8 text-navy-100/75">
                  احجز استشارة لمناقشة مسألتك وتحديد نطاق العمل والأتعاب كتابةً قبل البدء.
                </p>
                <div className="flex flex-col gap-3">
                  <ButtonLink href="/booking" variant="gold">
                    احجز استشارة
                  </ButtonLink>
                  <ButtonLink
                    href={waLink(`السلام عليكم، أود الاستفسار عن خدمة: ${service.title}`)}
                    external
                    variant="whatsapp"
                  >
                    استفسار عبر واتساب
                  </ButtonLink>
                </div>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
