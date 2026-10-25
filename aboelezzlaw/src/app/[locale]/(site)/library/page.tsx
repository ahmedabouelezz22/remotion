import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { BookOpen, Database, ExternalLink, FileText, Gavel, Landmark, Scale } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { dict, isLocale, type Locale } from '@/content/i18n';
import {
  accessLabelsEn,
  jurisdictionLabelsEn,
  libraryItems,
  libraryJurisdictions,
  type LibraryItem,
} from '@/content/library';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.libraryPage.eyebrow,
    description: t.libraryPage.metaDescription,
    alternates: { canonical: `/${raw}/library` },
  };
}

const typeIcons: Record<LibraryItem['type'], typeof BookOpen> = {
  'تشريع': Scale,
  'بوابة نظامية': Landmark,
  'اتفاقية دولية': Gavel,
  'مبادئ نموذجية': FileText,
  'تقرير أو دراسة': BookOpen,
  'قاعدة بيانات': Database,
};

export default async function LibraryPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);
  const isArabic = locale === 'ar';

  return (
    <>
      <PageHeader
        eyebrow={t.libraryPage.eyebrow}
        title={t.libraryPage.title}
        description={t.libraryPage.description}
      />

      <Section>
        <Container size="wide">
          <Card className="mb-10 border-gold-400/50 bg-gold-50">
            <h2 className="mb-2.5 text-base text-navy-900">{t.libraryPage.criteriaTitle}</h2>
            <p className="text-sm leading-8 text-slate-700">{t.libraryPage.criteriaBody}</p>
          </Card>

          <div className="mb-8 flex flex-wrap gap-2">
            {libraryJurisdictions.map((jurisdiction) => (
              <span
                key={jurisdiction}
                className="rounded-full border border-sand-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
              >
                {isArabic ? jurisdiction : jurisdictionLabelsEn[jurisdiction]}
              </span>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {libraryItems.map((item) => {
              const Icon = typeIcons[item.type] ?? BookOpen;
              const text = isArabic
                ? {
                    title: item.title,
                    publisher: item.publisher,
                    description: item.description,
                    language: item.language,
                  }
                : item.en;

              return (
                <a
                  key={item.slug}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group block"
                >
                  <Card hover className="flex h-full flex-col">
                    <div className="mb-4 flex items-start justify-between gap-3">
                      <span className="flex h-11 w-11 items-center justify-center rounded-xl bg-navy-900/6 text-navy-900">
                        <Icon className="h-5 w-5" />
                      </span>
                      <Badge tone="muted">
                        {isArabic ? item.jurisdiction : jurisdictionLabelsEn[item.jurisdiction]}
                      </Badge>
                    </div>

                    <h2 className="mb-2 text-base leading-8 text-navy-900 transition-colors group-hover:text-gold-600">
                      {text.title}
                    </h2>
                    <p className="mb-2 text-xs font-semibold text-slate-500">{text.publisher}</p>
                    <p className="mb-5 flex-1 text-sm leading-7 text-slate-600">
                      {text.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-2 border-t border-sand-200 pt-4 text-xs">
                      <Badge tone={item.access === 'مجاني ومفتوح' ? 'green' : 'muted'}>
                        {isArabic ? item.access : accessLabelsEn[item.access]}
                      </Badge>
                      <span className="text-slate-500">{text.language}</span>
                      <span className="inline-flex items-center gap-1 font-bold text-navy-900 transition-colors group-hover:text-gold-600 ltr:ml-auto rtl:mr-auto">
                        {t.libraryPage.openSource}
                        <ExternalLink className="h-3 w-3" />
                      </span>
                    </div>
                  </Card>
                </a>
              );
            })}
          </div>
        </Container>
      </Section>
    </>
  );
}
