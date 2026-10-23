import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { Clock, Mail, MessageSquare, Phone } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, type Locale } from '@/content/i18n';
import { site, waLink } from '@/content/site';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.contact.title,
    description: t.contactPage.metaDescription,
    alternates: { canonical: `/${raw}/contact` },
  };
}

export default async function ContactPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  const channels = [
    {
      icon: Phone,
      label: t.common.phone,
      value: site.contact.phoneLocal,
      href: `tel:${site.contact.phoneE164}`,
      note: t.contactPage.phoneNote,
      ltr: true,
    },
    {
      icon: MessageSquare,
      label: t.common.whatsapp,
      value: site.contact.phoneLocal,
      href: waLink(
        locale === 'ar'
          ? 'السلام عليكم، أود الاستفسار عن خدماتكم القانونية.'
          : 'Hello, I would like to enquire about your legal services.',
      ),
      note: t.contactPage.whatsappNote,
      ltr: true,
      external: true,
    },
    {
      icon: Mail,
      label: t.common.email,
      value: site.contact.email,
      href: `mailto:${site.contact.email}`,
      note: t.contactPage.emailNote,
      ltr: true,
    },
    {
      icon: Clock,
      label: t.common.workingHours,
      value: t.contactPage.workingHoursLabel,
      note: t.contactPage.hoursNote,
    },
  ];

  return (
    <>
      <PageHeader
        eyebrow={t.contactPage.eyebrow}
        title={t.contactPage.title}
        description={t.contactPage.description}
      />

      <Section>
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-[1fr_1.35fr]">
            <div className="space-y-4">
              {channels.map((channel) => {
                const Icon = channel.icon;
                const content = (
                  <Card hover={Boolean(channel.href)} className="h-full">
                    <span className="mb-4 flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900/6 text-navy-900">
                      <Icon className="h-5 w-5" />
                    </span>
                    <p className="text-xs font-bold tracking-wide text-gold-600">{channel.label}</p>
                    <p
                      className={`mt-1.5 font-bold text-navy-900 ${channel.ltr ? 'numeric' : ''}`}
                      dir={channel.ltr ? 'ltr' : undefined}
                      // الأرقام والبريد تُقرأ من اليسار، لكن محاذاتها تتبع اتجاه الصفحة
                      style={channel.ltr ? { textAlign: 'start' } : undefined}
                    >
                      {channel.value}
                    </p>
                    {channel.note ? (
                      <p className="mt-1 text-xs text-slate-500">{channel.note}</p>
                    ) : null}
                  </Card>
                );

                if (!channel.href) {
                  return <div key={channel.label}>{content}</div>;
                }

                return (
                  <a
                    key={channel.label}
                    href={channel.href}
                    {...(channel.external ? { target: '_blank', rel: 'noopener noreferrer' } : {})}
                    className="block"
                  >
                    {content}
                  </a>
                );
              })}
            </div>

            <Card className="p-7 sm:p-9">
              <h2 className="mb-2 text-xl text-navy-900">{t.contactPage.formTitle}</h2>
              <p className="mb-8 text-sm leading-8 text-slate-600">{t.contactPage.requiredNote}</p>
              <ContactForm locale={locale} />
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
