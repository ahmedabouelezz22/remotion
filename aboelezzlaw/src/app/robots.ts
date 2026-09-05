import type { MetadataRoute } from 'next';
import { site } from '@/content/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // صفحات المعاملات لا قيمة لها في الفهرسة وقد تكشف مراجع طلبات
      disallow: ['/api/', '/checkout', '/checkout/success', '/cart'],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
