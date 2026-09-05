import type { MetadataRoute } from 'next';
import { articles } from '@/content/blog';
import { products } from '@/content/products';
import { services } from '@/content/services';
import { site } from '@/content/site';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();

  // النوع مُعلَن على المصفوفة الأصلية حتى لا يتّسع changeFrequency إلى string عند map
  const basePages: MetadataRoute.Sitemap = [
    { url: site.url, changeFrequency: 'weekly', priority: 1 },
    { url: `${site.url}/about`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${site.url}/services`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${site.url}/store`, changeFrequency: 'weekly', priority: 0.9 },
    { url: `${site.url}/blog`, changeFrequency: 'weekly', priority: 0.8 },
    { url: `${site.url}/library`, changeFrequency: 'monthly', priority: 0.7 },
    { url: `${site.url}/videos`, changeFrequency: 'daily', priority: 0.6 },
    { url: `${site.url}/booking`, changeFrequency: 'monthly', priority: 0.9 },
    { url: `${site.url}/contact`, changeFrequency: 'monthly', priority: 0.8 },
    { url: `${site.url}/privacy`, changeFrequency: 'yearly', priority: 0.3 },
    { url: `${site.url}/terms`, changeFrequency: 'yearly', priority: 0.3 },
  ];

  const staticPages: MetadataRoute.Sitemap = basePages.map((page) => ({
    ...page,
    lastModified: now,
  }));

  return [
    ...staticPages,
    ...services.map((service) => ({
      url: `${site.url}/services/${service.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...products.map((product) => ({
      url: `${site.url}/store/${product.slug}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: 0.7,
    })),
    ...articles.map((article) => ({
      url: `${site.url}/blog/${article.slug}`,
      lastModified: new Date(article.updatedAt ?? article.publishedAt),
      changeFrequency: 'monthly' as const,
      priority: 0.6,
    })),
  ];
}
