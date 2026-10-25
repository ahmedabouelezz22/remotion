import type { MetadataRoute } from 'next';
import { locales } from '@/content/i18n';
import { site } from '@/content/site';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      // صفحات المعاملات لا قيمة لها في الفهرسة وقد تكشف مراجع طلبات
      // الصفحات تُخدَم تحت بادئة لغة، فالمنع يشمل كل اللغات
      disallow: [
        '/api/',
        '/admin',
        ...locales.flatMap((locale) => [
          `/${locale}/checkout`,
          `/${locale}/cart`,
          `/${locale}/account`,
          `/${locale}/admin`,
        ]),
      ],
    },
    sitemap: `${site.url}/sitemap.xml`,
    host: site.url,
  };
}
