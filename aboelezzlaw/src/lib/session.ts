import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * دخول بلا كلمة مرور (رابط سحري).
 *
 * لماذا لا كلمات مرور؟ لأن تخزين كلمات مرور العملاء مسؤولية أمنية وقانونية
 * لا مبرّر لها هنا: العميل يحتاج فقط إلى الاطّلاع على طلباته. الرابط المؤقّت
 * يُثبت ملكية البريد وهو كل ما يلزم، ولا يوجد ما يُسرَق إن اختُرقت القاعدة.
 *
 * الجلسة نفسها كعكة موقّعة (stateless) — لا جدول جلسات ولا استعلام لكل طلب.
 */

export const SESSION_COOKIE = 'abz_session';
const LOGIN_TTL_MINUTES = 20;
const SESSION_TTL_DAYS = 30;

function secret(): string {
  const value = process.env.AUTH_SECRET || process.env.DOWNLOAD_SECRET;
  if (!value) {
    throw new Error('AUTH_SECRET غير مضبوط — لا يمكن إصدار جلسات آمنة.');
  }
  return value;
}

export function isAuthConfigured(): boolean {
  return Boolean(process.env.AUTH_SECRET || process.env.DOWNLOAD_SECRET);
}

interface Claim {
  email: string;
  exp: number;
  purpose: 'login' | 'session';
}

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64url');
const decode = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

function sign(payload: string, purpose: Claim['purpose']): string {
  // الغرض داخل التوقيع نفسه، فلا يمكن إعادة استخدام رمز دخول كرمز جلسة
  return createHmac('sha256', secret()).update(`${purpose}.${payload}`).digest('base64url');
}

function issue(email: string, purpose: Claim['purpose'], ttlSeconds: number): string {
  const claim: Claim = {
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    purpose,
  };
  const payload = encode(JSON.stringify(claim));
  return `${payload}.${sign(payload, purpose)}`;
}

function verify(
  token: string,
  purpose: Claim['purpose'],
): { ok: true; email: string } | { ok: false; error: string } {
  const [payload, signature] = token.split('.');
  if (!payload || !signature) return { ok: false, error: 'الرابط غير صالح.' };

  const expected = Buffer.from(sign(payload, purpose));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return { ok: false, error: 'الرابط غير صالح.' };
  }

  let claim: Claim;
  try {
    claim = JSON.parse(decode(payload)) as Claim;
  } catch {
    return { ok: false, error: 'الرابط تالف.' };
  }

  if (claim.purpose !== purpose) return { ok: false, error: 'الرابط غير صالح.' };
  if (claim.exp < Math.floor(Date.now() / 1000)) {
    return { ok: false, error: 'انتهت صلاحية الرابط. اطلب رابطاً جديداً.' };
  }

  return { ok: true, email: claim.email };
}

export const createLoginToken = (email: string) =>
  issue(email, 'login', LOGIN_TTL_MINUTES * 60);

export const verifyLoginToken = (token: string) => verify(token, 'login');

export async function startSession(email: string): Promise<void> {
  const store = await cookies();
  store.set(SESSION_COOKIE, issue(email, 'session', SESSION_TTL_DAYS * 86400), {
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: SESSION_TTL_DAYS * 86400,
  });
}

export async function endSession(): Promise<void> {
  const store = await cookies();
  store.delete(SESSION_COOKIE);
}

/** البريد الحالي للزائر، أو null إن لم يكن مسجَّل الدخول */
export async function currentUserEmail(): Promise<string | null> {
  if (!isAuthConfigured()) return null;

  const store = await cookies();
  const token = store.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const result = verify(token, 'session');
  return result.ok ? result.email : null;
}

export const LOGIN_LINK_TTL_MINUTES = LOGIN_TTL_MINUTES;
