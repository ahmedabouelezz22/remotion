import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * سعر بلغة الصفحة. العملة واحدة (الجنيه المصري) في اللغتين — فالتسعير واحد
 * ولا يجوز أن يبدو للقارئ الإنجليزي أنه بعملة أخرى.
 */
export function formatPrice(
  amount: number,
  locale: 'ar' | 'en' = 'ar',
  currency = 'EGP',
): string {
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    style: 'currency',
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

/**
 * تاريخ بلغة الصفحة.
 *
 * العربية تُعرض بالأرقام الهندية والشهور العربية، والإنجليزية بصيغتها —
 * فلا يرى قارئ الإنجليزية «١٨ أغسطس ٢٠٢٦».
 */
export function formatDate(value: string | Date, locale: 'ar' | 'en' = 'ar'): string {
  const date = typeof value === 'string' ? new Date(value) : value;
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(date);
}

/** اسم قديم محفوظ لتوافق النداءات العربية */
export const formatDateAr = (value: string | Date) => formatDate(value, 'ar');

export function readingTime(text: string): number {
  // متوسط قراءة العربية ~180 كلمة/دقيقة
  const words = text.trim().split(/\s+/).length;
  return Math.max(1, Math.round(words / 180));
}

/**
 * JSON-LD داخل وسم script.
 *
 * `JSON.stringify` وحده لا يكفي: قيمة تحتوي `</script>` تُغلق الوسم وتسمح
 * بحقن عنصر جديد. المحتوى هنا ملفّاتنا لا مُدخَل زائر، لكن المحرّر بعد سنة
 * قد يلصق نصّاً فيه هذا التسلسل — فنُهرّب `<` دائماً.
 */
export function jsonLdScript(data: unknown): string {
  return JSON.stringify(data).replace(/</g, '\\u003c');
}
