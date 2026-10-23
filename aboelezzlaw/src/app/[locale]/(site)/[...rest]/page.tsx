import { notFound } from 'next/navigation';

/**
 * مسار جامع داخل قطعة اللغة، غرضه الوحيد إنتاج 404 **من داخلها**.
 *
 * بدونه يصل `/ar/مسار-غير-موجود` إلى صفحة 404 العامة التي تُقدَّم خارج
 * `[locale]/layout.tsx`، فيخرج المستند بلا `lang` ولا `dir` — وهو خطأ
 * يرصده axe (`html-has-lang`) ويُربك قارئة الشاشة. بوجوده يُحلّ `[locale]`
 * أولاً، فيُرسم الخطأ داخل تخطيط اللغة بترويساته الصحيحة وبحالة 404.
 */
export default function CatchAllNotFound(): never {
  notFound();
}
