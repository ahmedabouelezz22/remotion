import type { Dictionary } from './ar';
import { ar } from './ar';
import { en } from './en';

/**
 * اللغتان.
 *
 * العربية هي الأصل: المحتوى القانوني مكتوب بها، والمقالات تبقى عربية لأن
 * نشر نصّ قانوني مترجَم باسم المكتب يحتاج مراجعة المالك واعتماده.
 * الإنجليزية تغطّي كل ما يستخدمه العميل: التنقّل والخدمات والمتجر والدفع
 * والحجز والحساب والسياسات.
 *
 * العنوان يحمل اللغة دائماً (`/ar/...` و `/en/...`) لا كإضافة بل كأساس:
 * هكذا يحمل الـ HTML المُقدَّم `lang` و `dir` الصحيحين من أول بايت، فتفهمه
 * محركات البحث وقارئات الشاشة دون انتظار جافاسكربت.
 */
export const locales = ['ar', 'en'] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = 'ar';

export const isLocale = (value: string): value is Locale =>
  (locales as readonly string[]).includes(value);

const dictionaries: Record<Locale, Dictionary> = { ar, en };

export const dict = (locale: Locale): Dictionary => dictionaries[locale];

export const direction = (locale: Locale): 'rtl' | 'ltr' => (locale === 'ar' ? 'rtl' : 'ltr');

export const htmlLang = (locale: Locale): string => (locale === 'ar' ? 'ar-EG' : 'en');

/** مسار داخل اللغة الحالية — كل رابط في الموقع يمرّ من هنا */
export const path = (locale: Locale, to: string): string => {
  const clean = to === '/' ? '' : to.startsWith('/') ? to : `/${to}`;
  return `/${locale}${clean}`;
};

/** نفس الصفحة باللغة الأخرى — لزرّ تبديل اللغة و hreflang */
export const otherLocale = (locale: Locale): Locale => (locale === 'ar' ? 'en' : 'ar');

export const switchPath = (locale: Locale, pathname: string): string => {
  const rest = pathname.replace(new RegExp(`^/${locale}(?=/|$)`), '');
  return `/${otherLocale(locale)}${rest || ''}`;
};

export type { Dictionary };
