import { NextResponse, type NextRequest } from 'next/server';
import { LOCALE_HEADER, defaultLocale, isLocale } from '@/content/i18n';

/**
 * كل صفحة تعيش تحت لغتها: `/ar/...` أو `/en/...`.
 *
 * موضع الملف ليس اختيارياً: ما دام التطبيق في `src/app`، فـ Next لا يقرأ
 * الوسيط إلا من `src/middleware.ts`. ملف في جذر المشروع يُبنى بلا خطأ ولا
 * يعمل أبداً — فيبقى الجذر `/` بلا صفحة. يرصد ذلك فحص التحويل في
 * `tests/browser.mjs` و`tests/admin.sh`.
 *
 * لماذا اللغة في العنوان ولا نكتفي بالعربية بلا بادئة؟ لأن `<html lang>` و
 * `<html dir>` يُحدَّدان في التخطيط الجذري، والتخطيط الجذري لا يعرف المسار.
 * بجعل اللغة قطعة في المسار يصل الـ HTML المُقدَّم إلى المتصفّح ومحرّك البحث
 * وقارئة الشاشة وهو يحمل اللغة والاتجاه الصحيحين من أول بايت — لا بعد
 * تنفيذ جافاسكربت، ولا بتخطيط يصير ديناميكياً فيُفقد التوليد الثابت.
 *
 * ما لا يُمسّ: مسارات الـ API والأصول الثابتة وملفّات الجذر (robots، sitemap،
 * الأيقونة). ما عداها يُحوَّل إلى اللغة الافتراضية.
 */
const UNTOUCHED = [
  '/api',
  '/_next',
  '/_vercel',
  '/favicon.ico',
  '/robots.txt',
  '/sitemap.xml',
  '/icon.svg',
  '/brand',
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (UNTOUCHED.some((prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`))) {
    return NextResponse.next();
  }

  const [, first, ...restSegments] = pathname.split('/');
  if (first && isLocale(first)) {
    /**
     * لوحة الإدارة بالعربية وحدها: يستعملها المالك لا العميل، وترجمتها تضاعف
     * سطح الخطأ في شاشات تُغيّر حالات الطلبات. فطلبها بلغة أخرى يُحوَّل إلى
     * العربية بمساره كاملاً بدل تقديم نصّ عربي في مستند معلَن أنه إنجليزي.
     */
    if (first !== defaultLocale && restSegments[0] === 'admin') {
      const url = request.nextUrl.clone();
      url.pathname = `/${defaultLocale}/${restSegments.join('/')}`;
      return NextResponse.redirect(url, 308);
    }

    /**
     * `not-found.tsx` لا يستقبل معلَمات المسار، فلا يعرف لغته. نمرّرها في
     * ترويسة الطلب ليقرأها، وإلا صدرت صفحة الخطأ بالعربية لزائر إنجليزي.
     */
    const headers = new Headers(request.headers);
    headers.set(LOCALE_HEADER, first);
    return NextResponse.next({ request: { headers } });
  }

  // تحويل دائم: العنوان القانوني للصفحة هو الذي يحمل اللغة، فلا تتشتّت
  // الإشارات بين عنوانين لنفس المحتوى
  const url = request.nextUrl.clone();
  url.pathname = `/${defaultLocale}${pathname === '/' ? '' : pathname}`;
  return NextResponse.redirect(url, 308);
}

export const config = {
  // نستثني الملفّات ذات الامتدادات حتى لا يمرّ كل أصل ثابت على الوسيط
  matcher: ['/((?!_next|api|.*\\.).*)'],
};
