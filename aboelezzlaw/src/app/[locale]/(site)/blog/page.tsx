import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageHeader } from '@/components/page-header';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { blogCategories, blogCategoryLabelsEn, sortedArticles } from '@/content/blog';
import { dict, isLocale, path, type Locale } from '@/content/i18n';
import { formatDate, readingTime } from '@/lib/utils';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale: raw } = await params;
  if (!isLocale(raw)) return {};
  const t = dict(raw as Locale);
  return {
    title: t.blogPage.title,
    description: t.blogPage.metaDescription,
    alternates: { canonical: `/${raw}/blog` },
  };
}

export default async function BlogPage({ params }: { params: Promise<{ locale: string }> }) {
  const { locale: raw } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);
  const isArabic = locale === 'ar';
  const categoryLabel = (value: string) =>
    isArabic ? value : (blogCategoryLabelsEn[value] ?? value);
  const articleText = (article: (typeof sortedArticles)[number]) =>
    isArabic ? { title: article.title, excerpt: article.excerpt } : article.en;

  const [lead, ...rest] = sortedArticles;

  return (
    <>
      <PageHeader
        eyebrow={t.blogPage.eyebrow}
        title={t.blogPage.title}
        description={t.blogPage.description}
      />

      <Section>
        <Container size="wide">
          <div className="mb-10 flex flex-wrap gap-2">
            {blogCategories.map((category) => (
              <span
                key={category}
                className="rounded-full border border-sand-200 bg-white px-4 py-2 text-sm font-semibold text-slate-600"
              >
                {categoryLabel(category)}
              </span>
            ))}
          </div>

          {lead ? (
            <Link href={path(locale, `/blog/${lead.slug}`)} className="group mb-10 block">
              <Card hover className="bg-navy-900 text-white">
                <div className="mb-4 flex flex-wrap items-center gap-3">
                  <Badge tone="gold">{categoryLabel(lead.category)}</Badge>
                  <span className="numeric text-xs text-navy-100/70">
                    {formatDate(lead.publishedAt, locale)} ·{' '}
                    {t.blog.readingTime(readingTime(lead.body))}
                  </span>
                </div>
                <h2 className="mb-4 text-2xl leading-relaxed text-white transition-colors group-hover:text-gold-400 sm:text-[1.7rem]">
                  {articleText(lead).title}
                </h2>
                <p className="max-w-3xl leading-9 text-navy-100/80">
                  {articleText(lead).excerpt}
                </p>
                <p className="mt-6 text-sm font-bold text-gold-400">
                  {t.blogPage.readArticle} {isArabic ? '←' : '→'}
                </p>
              </Card>
            </Link>
          ) : null}

          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {rest.map((article) => (
              <Link
                key={article.slug}
                href={path(locale, `/blog/${article.slug}`)}
                className="group block"
              >
                <Card hover className="flex h-full flex-col">
                  <Badge tone="navy">{categoryLabel(article.category)}</Badge>
                  <h2 className="mt-4 mb-3 text-lg leading-8 text-navy-900 transition-colors group-hover:text-gold-600">
                    {articleText(article).title}
                  </h2>
                  <p className="mb-6 flex-1 text-sm leading-8 text-slate-600">
                    {articleText(article).excerpt}
                  </p>
                  <div className="numeric flex items-center justify-between text-xs text-slate-500">
                    <time dateTime={article.publishedAt}>
                      {formatDate(article.publishedAt, locale)}
                    </time>
                    <span>{t.blogPage.minutesShort(readingTime(article.body))}</span>
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
