import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { ArrowRight, ExternalLink } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Badge, Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { articles, getArticle, sortedArticles } from '@/content/blog';
import { site } from '@/content/site';
import { formatDateAr, readingTime } from '@/lib/utils';

export function generateStaticParams() {
  return articles.map((article) => ({ slug: article.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) return { title: 'المقال غير موجود' };

  return {
    title: article.title,
    description: article.excerpt,
    keywords: article.tags,
    alternates: { canonical: `/blog/${article.slug}` },
    openGraph: {
      type: 'article',
      title: article.title,
      description: article.excerpt,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      tags: [...article.tags],
    },
  };
}

export default async function ArticlePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const article = getArticle(slug);
  if (!article) notFound();

  const related = sortedArticles
    .filter((item) => item.slug !== article.slug && item.category === article.category)
    .slice(0, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: article.title,
    description: article.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: { '@type': 'Person', name: 'أحمد أبو العز' },
    publisher: { '@type': 'Organization', name: site.name },
    inLanguage: 'ar',
    mainEntityOfPage: `${site.url}/blog/${article.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        // eslint-disable-next-line react/no-danger -- بيانات منظَّمة مولَّدة من محتوى ثابت
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <PageHeader eyebrow={article.category} title={article.title} description={article.excerpt} />

      <Section>
        <Container size="narrow">
          <div className="mb-10 flex flex-wrap items-center gap-3 border-b border-sand-200 pb-6">
            <time className="numeric text-sm font-semibold text-slate-500" dateTime={article.publishedAt}>
              {formatDateAr(article.publishedAt)}
            </time>
            <span className="text-slate-300">·</span>
            <span className="numeric text-sm text-slate-500">
              {readingTime(article.body)} دقائق قراءة
            </span>
            <div className="flex flex-wrap gap-2 sm:mr-auto">
              {article.tags.map((tag) => (
                <Badge key={tag} tone="muted">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          <div className="article-body">
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
          </div>

          <Card className="mt-14 bg-sand-100">
            <h2 className="mb-4 text-lg text-navy-900">المصادر والمراجع</h2>
            <ul className="space-y-3">
              {article.sources.map((source) => (
                <li key={source.url}>
                  <a
                    href={source.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-start gap-2 text-sm font-semibold leading-7 text-navy-800 underline decoration-gold-400 underline-offset-4 transition-colors hover:text-gold-600"
                  >
                    <ExternalLink className="mt-1.5 h-3.5 w-3.5 shrink-0" />
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
            <p className="mt-5 border-t border-sand-200 pt-4 text-xs leading-6 text-slate-500">
              الروابط أعلاه تحيل إلى بوابات رسمية أو مؤسسات دولية. عند البناء على نصّ تشريعي في
              واقعة بعينها، يجب الرجوع إلى النسخة النافذة المنشورة في الجريدة الرسمية أو البوابة
              النظامية المختصة.
            </p>
          </Card>

          <Card className="mt-6 border-navy-900/12 bg-navy-900 text-white">
            <h2 className="mb-2.5 text-lg text-white">هل تنطبق هذه المسألة على حالتك؟</h2>
            <p className="mb-6 text-sm leading-8 text-navy-100/75">
              المقال تحليل عام. لتقييم أثره على وضعك تحديداً، احجز استشارة أو راسلنا بتفاصيل حالتك.
            </p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href="/booking" variant="gold" size="sm">
                احجز استشارة
              </ButtonLink>
              <ButtonLink
                href="/contact"
                variant="outline"
                size="sm"
                className="border-white text-white hover:bg-white hover:text-navy-900"
              >
                اتصل بنا
              </ButtonLink>
            </div>
          </Card>

          {related.length > 0 ? (
            <div className="mt-14">
              <h2 className="mb-6 text-xl text-navy-900">مقالات ذات صلة</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {related.map((item) => (
                  <Link key={item.slug} href={`/blog/${item.slug}`} className="group block">
                    <Card hover className="h-full">
                      <h3 className="mb-2.5 text-base leading-8 text-navy-900 transition-colors group-hover:text-gold-600">
                        {item.title}
                      </h3>
                      <p className="text-sm leading-7 text-slate-600">{item.excerpt}</p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <Link
            href="/blog"
            className="mt-12 inline-flex items-center gap-2 text-sm font-bold text-navy-900 transition-colors hover:text-gold-600"
          >
            <ArrowRight className="h-4 w-4" />
            العودة إلى المدونة
          </Link>
        </Container>
      </Section>
    </>
  );
}
