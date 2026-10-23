import { NextResponse } from 'next/server';
import { isOwnerEmail } from '@/lib/admin';
import { clientIp } from '@/lib/rate-limit';
import { consumeLoginToken, writeAudit } from '@/lib/repository';
import { startAdminSession, verifyAdminLoginTokenSignature } from '@/lib/session';

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
    NextResponse.redirect(
      new URL(`/admin/login?error=${encodeURIComponent(message)}`, url.origin),
    );

  if (!token) return fail('الرابط غير مكتمل.');

  const signature = verifyAdminLoginTokenSignature(token);
  if (!signature.ok) return fail(signature.error);
  if (!signature.jti) return fail(REASONS.unknown!);

  const consumed = await consumeLoginToken(signature.jti, 'owner');
  if (!consumed.ok) return fail(REASONS[consumed.reason] ?? REASONS.unknown!);

  if (consumed.email.toLowerCase() !== signature.email.toLowerCase()) {
    return fail(REASONS.unknown!);
  }

  // التفويض يُفحص مرّة أخرى هنا: قائمة المُلّاك قد تكون تغيّرت بعد إصدار الرابط
  if (!isOwnerEmail(consumed.email)) {
    await writeAudit({
      actor: consumed.email,
      action: 'admin.login.revoked',
      targetType: 'session',
      detail: { ip: clientIp(request) },
    });
    return fail('هذا الحساب لا يملك صلاحية إدارية.');
  }

  await startAdminSession(consumed.email);
  await writeAudit({
    actor: consumed.email,
    action: 'admin.login.success',
    targetType: 'session',
    detail: { ip: clientIp(request) },
  });

  return NextResponse.redirect(new URL('/admin', url.origin));
}
