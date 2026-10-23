import { NextResponse } from 'next/server';
import { defaultLocale, dict, isLocale, type Locale } from '@/content/i18n';
import { consumeLoginToken } from '@/lib/repository';
import { startSession, verifyLoginTokenSignature } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  // اللغة مُضمَّنة في الرابط الذي أرسلناه، فتصل الرسالة بلغة الطلب الأصلي
  const rawLocale = url.searchParams.get('locale') ?? '';
  const locale: Locale = isLocale(rawLocale) ? (rawLocale as Locale) : defaultLocale;
  const t = dict(locale).api;

  const reasons: Record<string, string> = {
    unknown: t.linkInvalid,
    used: t.linkUsed,
    expired: t.linkExpired,
  };

  const fail = (message: string) =>
    NextResponse.redirect(
      new URL(`/${locale}/account?error=${encodeURIComponent(message)}`, url.origin),
    );

  if (!token) return fail(t.linkIncomplete);

  // التوقيع أولاً: يرفض الرموز المصنوعة دون الوصول إلى القاعدة
  const signature = verifyLoginTokenSignature(token);
  if (!signature.ok) {
    return fail(signature.reason === 'expired' ? t.linkExpired : t.linkInvalid);
  }

  // رمز بلا معرّف هو رمز من صيغة أقدم لا تدعم الاستخدام لمرة واحدة؛ نرفضه
  // بدلاً من قبوله، فالتراجع الصامت إلى رمز قابل للتكرار هو الثغرة نفسها.
  if (!signature.jti) return fail(reasons.unknown!);

  // الاستهلاك الذرّي هو ما يجعل الرابط لمرة واحدة؛ التوقيع وحده لا يفعل ذلك
  const consumed = await consumeLoginToken(signature.jti);
  if (!consumed.ok) return fail(reasons[consumed.reason] ?? reasons.unknown!);

  // البريد يُقرأ من القاعدة لا من الرمز: ما وقّعناه وما سجّلناه يجب أن يتفقا
  if (consumed.email.toLowerCase() !== signature.email.toLowerCase()) {
    console.error('[account-verify] تعارض بين بريد الرمز وبريد السجلّ');
    return fail(reasons.unknown!);
  }

  await startSession(consumed.email);
  return NextResponse.redirect(new URL(`/${locale}/account`, url.origin));
}
