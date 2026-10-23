import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CalendarDays, FileCheck2, MessageSquare, Timer } from 'lucide-react';
import { BookingForm } from '@/components/booking-form';
import { PageHeader } from '@/components/page-header';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, type Locale } from '@/content/i18n';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.booking.title,
    description: t.bookingPage.metaDescription,
    alternates: { canonical: `/${raw}/booking` },
  };
}

const stepIcons = [CalendarDays, FileCheck2, MessageSquare, Timer];

export default async function BookingPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);

  return (
    <>
      <PageHeader
        eyebrow={t.bookingPage.eyebrow}
        title={t.bookingPage.title}
        description={t.bookingPage.description(t.contactPage.workingHoursLabel)}
      />

      <Section>
        <Container size="wide">
          <div className="grid gap-12 lg:grid-cols-[1.35fr_1fr]">
            <Card className="order-2 p-7 sm:p-9 lg:order-1">
              <h2 className="mb-2 text-xl text-navy-900">{t.bookingPage.formTitle}</h2>
              <p className="mb-8 text-sm leading-8 text-slate-600">{t.bookingPage.formNote}</p>
              <BookingForm locale={locale} />
            </Card>

            <div className="order-1 space-y-4 lg:order-2">
              <Card className="bg-navy-900 text-white">
                <h2 className="mb-5 text-lg text-white">{t.bookingPage.howItWorks}</h2>
                <ol className="space-y-5">
                  {t.bookingPage.steps.map((step, index) => {
                    const Icon = stepIcons[index] ?? CalendarDays;
                    return (
                      <li key={step.title} className="flex gap-4">
                        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gold-500 text-navy-950">
                          <Icon className="h-5 w-5" />
                        </span>
                        <div>
                          <h3 className="numeric text-[0.95rem] font-bold text-white">
                            {index + 1}. {step.title}
                          </h3>
                          <p className="mt-1 text-sm leading-7 text-navy-100/70">{step.body}</p>
                        </div>
                      </li>
                    );
                  })}
                </ol>
              </Card>

              <Card className="border-gold-400/50 bg-gold-50">
                <h3 className="mb-2.5 text-base text-navy-900">{t.bookingPage.notesTitle}</h3>
                <ul className="space-y-2.5 text-sm leading-7 text-slate-700">
                  {t.bookingPage.notes.map((note) => (
                    <li key={note}>• {note}</li>
                  ))}
                </ul>
              </Card>
            </div>
          </div>
        </Container>
      </Section>
    </>
  );
}
