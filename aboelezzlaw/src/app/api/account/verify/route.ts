import { NextResponse } from 'next/server';
import { consumeLoginToken } from '@/lib/repository';
import { startSession, verifyLoginTokenSignature } from '@/lib/session';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const REASONS: Record<string, string> = {
  unknown: 'الرابط غير صالح. اطلب رابطاً جديداً.',
  used: 'هذا الرابط استُخدم بالفعل. اطلب رابطاً جديداً.',
  expired: 'انتهت صلاحية الرابط. اطلب رابطاً جديداً.',
};

export async function GET(request: Request) {
  const url = new URL(request.url);
  const token = url.searchParams.get('token');

  const fail = (message: string) =>
    NextResponse.redirect(new URL(`/account?error=${encodeURIComponent(message)}`, url.origin));

  if (!token) return fail('الرابط غير مكتمل. اطلب رابطاً جديداً.');

  // التوقيع أولاً: يرفض الرموز المصنوعة دون الوصول إلى القاعدة
  const signature = verifyLoginTokenSignature(token);
  if (!signature.ok) return fail(signature.error);

  // رمز بلا معرّف هو رمز من صيغة أقدم لا تدعم الاستخدام لمرة واحدة؛ نرفضه
  // بدلاً من قبوله، فالتراجع الصامت إلى رمز قابل للتكرار هو الثغرة نفسها.
  if (!signature.jti) return fail(REASONS.unknown!);

  // الاستهلاك الذرّي هو ما يجعل الرابط لمرة واحدة؛ التوقيع وحده لا يفعل ذلك
  const consumed = await consumeLoginToken(signature.jti);
  if (!consumed.ok) return fail(REASONS[consumed.reason] ?? REASONS.unknown!);

  // البريد يُقرأ من القاعدة لا من الرمز: ما وقّعناه وما سجّلناه يجب أن يتفقا
  if (consumed.email.toLowerCase() !== signature.email.toLowerCase()) {
    console.error('[account-verify] تعارض بين بريد الرمز وبريد السجلّ');
    return fail(REASONS.unknown!);
  }

  await startSession(consumed.email);
  return NextResponse.redirect(new URL('/account', url.origin));
}
