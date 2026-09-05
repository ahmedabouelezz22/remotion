import type { Metadata } from 'next';
import { Clock, Mail, MessageSquare, Phone } from 'lucide-react';
import { ContactForm } from '@/components/contact-form';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { site, waLink } from '@/content/site';

export const metadata: Metadata = {
  title: 'اتصل بنا',
  description:
    'تواصل مع مكتب أحمد أبو العز للمحاماة — عبر النموذج أو الهاتف أو واتساب أو البريد الإلكتروني. الرد خلال يوم عمل واحد.',
  alternates: { canonical: '/contact' },
};

const channels = [
  {
    icon: Phone,
    label: 'الهاتف',
    value: site.contact.phoneLocal,
    href: `tel:${site.contact.phoneE164}`,
    note: 'خلال ساعات العمل',
    ltr: true,
  },
  {
    icon: MessageSquare,
    label: 'واتساب',
    value: site.contact.phoneLocal,
    href: waLink('السلام عليكم، أود الاستفسار عن خدماتكم القانونية.'),
    note: 'الأسرع للرد',
    ltr: true,
    external: true,
  },
  {
    icon: Mail,
    label: 'البريد الإلكتروني',
    value: site.contact.email,
    href: `mailto:${site.contact.email}`,
    note: 'للمستندات والمراسلات الرسمية',
    ltr: true,
  },
  {
    icon: Clock,
    label: 'ساعات العمل',
    value: site.workingHours.label,
    note: 'بتوقيت القاهرة',
  },
];

export default function ContactPage() {
  return (
    <>
      <PageHeader
        eyebrow="تواصل معنا"
        title="اكتب لنا تفاصيل مسألتك"
        description="كل رسالة تصل عبر هذا النموذج تُرسَل فوراً إلى بريد المكتب وإلى واتساب المسؤول. الرد خلال يوم عمل واحد في الأحوال المعتادة."
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
                      style={channel.ltr ? { textAlign: 'right' } : undefined}
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
                    {...(channel.external
                      ? { target: '_blank', rel: 'noopener noreferrer' }
                      : {})}
                    className="block"
                  >
                    {content}
                  </a>
                );
              })}
            </div>

            <Card className="p-7 sm:p-9">
              <h2 className="mb-2 text-xl text-navy-900">نموذج التواصل</h2>
              <p className="mb-8 text-sm leading-8 text-slate-600">
                الحقول المعلَّمة بـ <span className="font-bold text-red-600">*</span> مطلوبة.
              </p>
              <ContactForm />
            </Card>
          </div>
        </Container>
      </Section>
    </>
  );
}
