import type { Metadata } from 'next';
import Link from 'next/link';
import { PageHeader } from '@/components/page-header';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { blogCategories, sortedArticles } from '@/content/blog';
import { formatDateAr, readingTime } from '@/lib/utils';

export const metadata: Metadata = {
  title: 'المدونة القانونية',
  description:
    'مقالات وتحليلات قانونية أصلية في العقود والتحكيم والزكاة والضرائب وحماية البيانات والاقتصاد الدائري — موثّقة بمصادرها الرسمية.',
  alternates: { canonical: '/blog' },
};

export default function BlogPage() {
  const [lead, ...rest] = sortedArticles;

  return (
    <>
      <PageHeader
        eyebrow="المدونة"
        title="تحليلات قانونية موثّقة بمصادرها"
        description="مقالات مكتوبة بصياغة أصلية، تُحيل إلى نصوصها ومصادرها الرسمية بروابط مباشرة، ولا تُقدَّم بديلاً عن الاستشارة في واقعة بعينها."
      />

      <Section>
        <Container size="wide">
          <div className="mb-10 flex flex-wrap gap-2">
            {blogCategories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-sand-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
              >
                {category}
              </span>
            ))}
          </div>

          {lead ? (
            <Link href={`/blog/${lead.slug}`} className="group mb-10 block">
              <Card hover className="bg-navy-900 text-white">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <Badge tone="gold">{lead.category}</Badge>
                  <span className="numeric text-xs text-navy-100/60">
                    {formatDateAr(lead.publishedAt)} · {readingTime(lead.body)} دقائق قراءة
                  </span>
                </div>
                <h2 className="mb-4 text-2xl leading-relaxed text-white transition-colors group-hover:text-gold-400 sm:text-[1.7rem]">
                  {lead.title}
                </h2>
                <p className="max-w-3xl leading-9 text-navy-100/80">{lead.excerpt}</p>
                <p className="mt-6 text-sm font-bold text-gold-400">اقرأ المقال ←</p>
              </Card>
            </Link>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <Link key={article.slug} href={`/blog/${article.slug}`} className="group block">
                <Card hover className="flex h-full flex-col">
                  <Badge tone="navy">{article.category}</Badge>
                  <h2 className="mt-4 mb-3 text-lg leading-8 text-navy-900 transition-colors group-hover:text-gold-600">
                    {article.title}
                  </h2>
                  <p className="mb-6 flex-1 text-sm leading-8 text-slate-600">{article.excerpt}</p>
                  <div className="numeric flex items-center justify-between text-xs text-slate-400">
                    <time dateTime={article.publishedAt}>{formatDateAr(article.publishedAt)}</time>
                    <span>{readingTime(article.body)} دقائق</span>
                  </div>
                </Card>
              </Link>
            ))}
          </div>
        </Container>
      </Section>
    </>
  );
}
