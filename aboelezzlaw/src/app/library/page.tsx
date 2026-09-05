import type { Metadata } from 'next';
import { BookOpen, Database, ExternalLink, FileText, Gavel, Landmark, Scale } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { libraryItems, libraryJurisdictions, type LibraryItem } from '@/content/library';

export const metadata: Metadata = {
  title: 'المكتبة القانونية',
  description:
    'مراجع قانونية مفتوحة المصدر: بوابات التشريعات المصرية والسعودية، ونصوص الأونسيترال، ومبادئ اليونيدروا، وقواعد بيانات الملكية الفكرية والقانون المقارن.',
  alternates: { canonical: '/library' },
};

const typeIcons: Record<LibraryItem['type'], typeof BookOpen> = {
  'تشريع': Scale,
  'بوابة نظامية': Landmark,
  'اتفاقية دولية': Gavel,
  'مبادئ نموذجية': FileText,
  'تقرير أو دراسة': BookOpen,
  'قاعدة بيانات': Database,
};

export default function LibraryPage() {
  return (
    <>
      <PageHeader
        eyebrow="المكتبة القانونية"
        title="مراجع قانونية مفتوحة المصدر"
        description="مصادر رسمية ومؤسسية متاحة مجاناً وبصفة مشروعة. نحيل إلى المصدر الأصلي مباشرةً ولا نعيد نشر مؤلفات محمية بحقوق الملكية الفكرية."
      />

      <Section>
        <Container size="wide">
          <Card className="mb-10 border-gold-400/50 bg-gold-500/8">
            <h2 className="mb-2.5 text-base text-navy-900">كيف نختار ما يُدرج هنا</h2>
            <p className="text-sm leading-8 text-slate-700">
              لا يُدرج في هذه المكتبة إلا ما هو متاح مجاناً من جهة رسمية أو مؤسسة دولية معترف بها.
              هذا يضمن أمرين: أن المرجع موثوق يمكن الاحتجاج به، وأن الوصول إليه مشروع لا يمسّ حقوق
              أحد. عند البناء على نصّ تشريعي في واقعة بعينها، ارجع دائماً إلى النسخة النافذة
              المنشورة في الجريدة الرسمية أو البوابة النظامية المختصة.
            </p>
          </Card>

          <div className="mb-8 flex flex-wrap gap-2">
            {libraryJurisdictions.map((jurisdiction) => (
              <span
                key={jurisdiction}
                className="rounded-full border border-sand-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
              >
                {jurisdiction}
              </span>
            ))}
          </div>

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {libraryItems.map((item) => {
              const Icon = typeIcons[item.type] ?? BookOpen;
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
                      <Badge tone="muted">{item.jurisdiction}</Badge>
                    </div>

                    <h2 className="mb-2 text-base leading-8 text-navy-900 transition-colors group-hover:text-gold-600">
                      {item.title}
                    </h2>
                    <p className="mb-2 text-xs font-semibold text-slate-500">{item.publisher}</p>
                    <p className="mb-5 flex-1 text-sm leading-7 text-slate-600">{item.description}</p>

                    <div className="flex flex-wrap items-center gap-2 border-t border-sand-200 pt-4 text-xs">
                      <Badge tone={item.access === 'مجاني ومفتوح' ? 'green' : 'muted'}>
                        {item.access}
                      </Badge>
                      <span className="text-slate-500">{item.language}</span>
                      <span className="mr-auto inline-flex items-center gap-1 font-bold text-navy-900 transition-colors group-hover:text-gold-600">
                        فتح المصدر
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
