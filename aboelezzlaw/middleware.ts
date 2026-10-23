import { NextResponse, type NextRequest } from 'next/server';
import { defaultLocale, isLocale, locales } from '@/content/i18n';

/**
 * كل صفحة تعيش تحت لغتها: `/ar/...` أو `/en/...`.
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

  const [, first] = pathname.split('/');
  if (first && isLocale(first)) return NextResponse.next();

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

export const supportedLocales = locales;
