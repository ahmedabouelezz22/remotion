import type { MetadataRoute } from 'next';
import { articles } from '@/content/blog';
import { locales, type Locale } from '@/content/i18n';
import { products } from '@/content/products';
import { services } from '@/content/services';
import { site } from '@/content/site';

type Freq = NonNullable<MetadataRoute.Sitemap[number]['changeFrequency']>;

/** المسارات الثابتة بلا بادئة لغة، مع وزنها في الفهرسة */
const staticPaths: { to: string; changeFrequency: Freq; priority: number }[] = [
  { to: '', changeFrequency: 'weekly', priority: 1 },
  { to: '/about', changeFrequency: 'monthly', priority: 0.8 },
  { to: '/services', changeFrequency: 'monthly', priority: 0.9 },
  { to: '/store', changeFrequency: 'weekly', priority: 0.9 },
  { to: '/blog', changeFrequency: 'weekly', priority: 0.8 },
  { to: '/library', changeFrequency: 'monthly', priority: 0.7 },
  { to: '/videos', changeFrequency: 'daily', priority: 0.6 },
  { to: '/booking', changeFrequency: 'monthly', priority: 0.9 },
  { to: '/contact', changeFrequency: 'monthly', priority: 0.8 },
  { to: '/privacy', changeFrequency: 'yearly', priority: 0.3 },
  { to: '/terms', changeFrequency: 'yearly', priority: 0.3 },
];

const url = (locale: Locale, to: string) => `${site.url}/${locale}${to}`;

/**
 * كل مسار يُنشر مرة لكل لغة، وكل مدخل يحمل `alternates.languages` لنظيره
 * في اللغة الأخرى — فلا يحسب محرّك البحث النسختين صفحتين متكرّرتين.
 * `x-default` يشير إلى العربية لأنها لغة المكتب الأصلية.
 */
function alternates(to: string) {
  const languages: Record<string, string> = { 'x-default': url('ar', to) };
  for (const locale of locales) languages[locale] = url(locale, to);
  return { languages };
}

function entries(
  to: string,
  changeFrequency: Freq,
  priority: number,
  lastModified: Date,
): MetadataRoute.Sitemap {
  return locales.map((locale) => ({
    url: url(locale, to),
    lastModified,
    changeFrequency,
    priority,
    alternates: alternates(to),
  }));
}

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  return [
    ...staticPaths.flatMap((page) =>
      entries(page.to, page.changeFrequency, page.priority, now),
    ),
    ...services.flatMap((service) =>
      entries(`/services/${service.slug}`, 'monthly', 0.7, now),
    ),
    ...products.flatMap((product) => entries(`/store/${product.slug}`, 'weekly', 0.7, now)),
    ...articles.flatMap((article) =>
      entries(
        `/blog/${article.slug}`,
        'monthly',
        0.6,
        new Date(article.updatedAt ?? article.publishedAt),
      ),
    ),
  ];
}
