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
import { articles, blogCategoryLabelsEn, getArticle, sortedArticles } from '@/content/blog';
import { dict, isLocale, locales, path, type Locale } from '@/content/i18n';
import { site } from '@/content/site';
import { formatDate, jsonLdScript, readingTime } from '@/lib/utils';

export function generateStaticParams() {
  return locales.flatMap((locale) => articles.map((article) => ({ locale, slug: article.slug })));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) return {};
  const locale = raw as Locale;
  const article = getArticle(slug);
  if (!article) return { title: dict(locale).blogPage.notFound };

  const text = locale === 'ar' ? { title: article.title, excerpt: article.excerpt } : article.en;
  return {
    title: text.title,
    description: text.excerpt,
    keywords: article.tags,
    alternates: { canonical: `/${locale}/blog/${article.slug}` },
    openGraph: {
      type: 'article',
      title: text.title,
      description: text.excerpt,
      publishedTime: article.publishedAt,
      modifiedTime: article.updatedAt ?? article.publishedAt,
      tags: [...article.tags],
    },
  };
}

export default async function ArticlePage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale: raw, slug } = await params;
  if (!isLocale(raw)) notFound();
  const locale = raw as Locale;
  const t = dict(locale);
  const isArabic = locale === 'ar';

  const article = getArticle(slug);
  if (!article) notFound();

  const text = isArabic ? { title: article.title, excerpt: article.excerpt } : article.en;
  const articleText = (item: typeof article) =>
    isArabic ? { title: item.title, excerpt: item.excerpt } : item.en;

  const related = sortedArticles
    .filter((item) => item.slug !== article.slug && item.category === article.category)
    .slice(0, 2);

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: text.title,
    description: text.excerpt,
    datePublished: article.publishedAt,
    dateModified: article.updatedAt ?? article.publishedAt,
    author: { '@type': 'Person', name: 'أحمد أبو العز' },
    publisher: { '@type': 'Organization', name: site.name },
    // المتن عربي دائماً، فاللغة المعلنة للمقال عربية في النسختين
    inLanguage: 'ar',
    mainEntityOfPage: `${site.url}/${locale}/blog/${article.slug}`,
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: jsonLdScript(jsonLd) }}
      />

      <PageHeader
        eyebrow={isArabic ? article.category : (blogCategoryLabelsEn[article.category] ?? article.category)}
        title={text.title}
        description={text.excerpt}
      />

      <Section>
        <Container size="narrow">
          <div className="mb-10 flex flex-wrap items-center gap-3 border-b border-sand-200 pb-6">
            <time className="numeric text-sm font-semibold text-slate-500" dateTime={article.publishedAt}>
              {formatDate(article.publishedAt, locale)}
            </time>
            <span className="text-slate-300">·</span>
            <span className="numeric text-sm text-slate-500">
              {t.blog.readingTime(readingTime(article.body))}
            </span>
            <div className="flex flex-wrap gap-2 sm:ltr:ml-auto sm:rtl:mr-auto">
              {article.tags.map((tag) => (
                <Badge key={tag} tone="muted">
                  {tag}
                </Badge>
              ))}
            </div>
          </div>

          {/*
            المتن عربي في النسختين. في الإنجليزية نُعلن ذلك صريحاً ونوجّه إلى
            الأصل بدلاً من نشر ترجمة آلية لتحليل قانوني باسم المكتب.
          */}
          {isArabic ? (
            <div className="article-body">
              <ReactMarkdown remarkPlugins={[remarkGfm]}>{article.body}</ReactMarkdown>
            </div>
          ) : (
            <Card className="border-gold-400/50 bg-gold-50">
              <h2 className="mb-3 text-lg text-navy-900">{t.blogPage.arabicNoticeTitle}</h2>
              <p className="mb-6 text-sm leading-8 text-slate-700">{t.blog.arabicOnlyNotice}</p>
              <ButtonLink href={path('ar', `/blog/${article.slug}`)} lang="ar" dir="rtl">
                {t.blogPage.readInArabic}
              </ButtonLink>
            </Card>
          )}

          <Card className="mt-14 bg-sand-100">
            <h2 className="mb-4 text-lg text-navy-900">{t.blogPage.sourcesTitle}</h2>
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
            <p className="mt-5 border-t border-sand-200 pt-4 text-xs leading-6 text-slate-600">
              {t.blogPage.sourcesNote}
            </p>
          </Card>

          <Card className="mt-6 border-navy-900/12 bg-navy-900 text-white">
            <h2 className="mb-2.5 text-lg text-white">{t.blogPage.appliesTitle}</h2>
            <p className="mb-6 text-sm leading-8 text-navy-100/75">{t.blogPage.appliesBody}</p>
            <div className="flex flex-wrap gap-3">
              <ButtonLink href={path(locale, '/booking')} variant="gold" size="sm">
                {t.servicesPage.bookConsultation}
              </ButtonLink>
              <ButtonLink
                href={path(locale, '/contact')}
                variant="outline"
                size="sm"
                className="border-white text-white hover:bg-white hover:text-navy-900"
              >
                {t.nav.contact}
              </ButtonLink>
            </div>
          </Card>

          {related.length > 0 ? (
            <div className="mt-14">
              <h2 className="mb-6 text-xl text-navy-900">{t.blog.relatedTitle}</h2>
              <div className="grid gap-5 sm:grid-cols-2">
                {related.map((item) => (
                  <Link
                    key={item.slug}
                    href={path(locale, `/blog/${item.slug}`)}
                    className="group block"
                  >
                    <Card hover className="h-full">
                      <h3 className="mb-2.5 text-base leading-8 text-navy-900 transition-colors group-hover:text-gold-600">
                        {articleText(item).title}
                      </h3>
                      <p className="text-sm leading-7 text-slate-600">
                        {articleText(item).excerpt}
                      </p>
                    </Card>
                  </Link>
                ))}
              </div>
            </div>
          ) : null}

          <Link
            href={path(locale, '/blog')}
            className="mt-12 inline-flex min-h-[40px] items-center gap-2 text-sm font-bold text-navy-900 transition-colors hover:text-gold-600"
          >
            <ArrowRight className="h-4 w-4 rtl:rotate-0 ltr:rotate-180" />
            {t.blog.backToBlog}
          </Link>
        </Container>
      </Section>
    </>
  );
}
