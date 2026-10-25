import { createHmac, randomUUID, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

/**
 * دخول بلا كلمة مرور (رابط سحري).
 *
 * لماذا لا كلمات مرور؟ لأن تخزين كلمات مرور العملاء مسؤولية أمنية وقانونية
 * لا مبرّر لها هنا: العميل يحتاج فقط إلى الاطّلاع على طلباته. الرابط المؤقّت
 * يُثبت ملكية البريد وهو كل ما يلزم، ولا يوجد ما يُسرَق إن اختُرقت القاعدة.
 *
 * الجلسة نفسها كعكة موقّعة (stateless) — لا جدول جلسات ولا استعلام لكل طلب.
 *
 * رمز الدخول — بخلاف الجلسة — ليس stateless: التوقيع وحده يجعله قابلاً لإعادة
 * الاستخدام حتى انتهاء مدته، فمن يقرأ البريد أو سجلّ الوسيط يدخل مرّة أخرى.
 * لذلك يحمل كل رمز معرّفاً فريداً (jti) يُسجَّل في جدول `login_tokens` ويُستهلَك
 * ذرّياً عند أول استخدام، والاستهلاك هو ما يمنع التكرار لا التوقيع.
 */

export const SESSION_COOKIE = 'abz_session';
/**
 * جلسة المالك كعكة منفصلة بغرض منفصل داخل التوقيع. الفصل مقصود: جلسة عميل
 * مسروقة لا تفتح لوحة الإدارة ولو كان بريدها في قائمة المُلّاك، ومدّة الجلسة
 * الإدارية أقصر بكثير لأن ما تفتحه أخطر.
 */
export const ADMIN_COOKIE = 'abz_admin';
const LOGIN_TTL_MINUTES = 20;
const SESSION_TTL_DAYS = 30;
const ADMIN_SESSION_TTL_HOURS = 12;

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
  purpose: 'login' | 'session' | 'admin-login' | 'admin';
  /** معرّف الرمز — لرموز الدخول فقط، وهو ما يُستهلَك في القاعدة */
  jti?: string;
}

const encode = (value: string) => Buffer.from(value, 'utf8').toString('base64url');
const decode = (value: string) => Buffer.from(value, 'base64url').toString('utf8');

function sign(payload: string, purpose: Claim['purpose']): string {
  // الغرض داخل التوقيع نفسه، فلا يمكن إعادة استخدام رمز دخول كرمز جلسة
  return createHmac('sha256', secret()).update(`${purpose}.${payload}`).digest('base64url');
}

function issue(
  email: string,
  purpose: Claim['purpose'],
  ttlSeconds: number,
  jti?: string,
): string {
  const claim: Claim = {
    email: email.trim().toLowerCase(),
    exp: Math.floor(Date.now() / 1000) + ttlSeconds,
    purpose,
    ...(jti ? { jti } : {}),
  };
  const payload = encode(JSON.stringify(claim));
  return `${payload}.${sign(payload, purpose)}`;
}

/**
 * سبب الرفض بصيغة لا لغة لها، إلى جانب نصّ عربي جاهز. الواجهة التي تعرف لغة
 * الزائر (مسار اللغة) تترجم السبب؛ وما لا يعرفها — كلوحة الإدارة — يستعمل
 * النصّ العربي كما هو.
 */
export type TokenFailure = 'invalid' | 'expired';

function verify(
  token: string,
  purpose: Claim['purpose'],
):
  | { ok: true; email: string; jti?: string }
  | { ok: false; reason: TokenFailure; error: string } {
  const invalid = { ok: false, reason: 'invalid', error: 'الرابط غير صالح.' } as const;
  const expired = {
    ok: false,
    reason: 'expired',
    error: 'انتهت صلاحية الرابط. اطلب رابطاً جديداً.',
  } as const;

  const [payload, signature] = token.split('.');
  if (!payload || !signature) return invalid;

  const expected = Buffer.from(sign(payload, purpose));
  const received = Buffer.from(signature);
  if (expected.length !== received.length || !timingSafeEqual(expected, received)) {
    return invalid;
  }

  let claim: Claim;
  try {
    claim = JSON.parse(decode(payload)) as Claim;
  } catch {
    return invalid;
  }

  if (claim.purpose !== purpose) return invalid;
  if (claim.exp < Math.floor(Date.now() / 1000)) return expired;

  return { ok: true, email: claim.email, jti: claim.jti };
}

/**
 * يُنشئ رمز دخول مع معرّفه ووقت انتهائه. المُنادي مسؤول عن تسجيل المعرّف في
 * القاعدة **قبل** إرسال الرابط — رمز غير مسجَّل لا يُقبل عند التحقّق.
 */
export function createLoginToken(email: string): {
  token: string;
  jti: string;
  expiresAt: Date;
} {
  const jti = randomUUID();
  return {
    token: issue(email, 'login', LOGIN_TTL_MINUTES * 60, jti),
    jti,
    expiresAt: new Date(Date.now() + LOGIN_TTL_MINUTES * 60_000),
  };
}

/**
 * يتحقّق من التوقيع والمدة فقط. هذا **ليس** كافياً لتسجيل الدخول: على المُنادي
 * أن يستهلك `jti` في القاعدة بعدها، وإلا كان الرابط قابلاً لإعادة الاستخدام.
 */
export const verifyLoginTokenSignature = (token: string) => verify(token, 'login');

/** نفس الآلية لرابط دخول المالك، بغرض مختلف داخل التوقيع */
export function createAdminLoginToken(email: string): {
  token: string;
  jti: string;
  expiresAt: Date;
} {
  const jti = randomUUID();
  return {
    token: issue(email, 'admin-login', LOGIN_TTL_MINUTES * 60, jti),
    jti,
    expiresAt: new Date(Date.now() + LOGIN_TTL_MINUTES * 60_000),
  };
}

export const verifyAdminLoginTokenSignature = (token: string) => verify(token, 'admin-login');

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

export async function startAdminSession(email: string): Promise<void> {
  const store = await cookies();
  store.set(ADMIN_COOKIE, issue(email, 'admin', ADMIN_SESSION_TTL_HOURS * 3600), {
    httpOnly: true,
    sameSite: 'strict',
    secure: process.env.NODE_ENV === 'production',
    path: '/',
    maxAge: ADMIN_SESSION_TTL_HOURS * 3600,
  });
}

export async function endAdminSession(): Promise<void> {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}

/**
 * البريد الموقَّع في جلسة الإدارة، أو null. **لا يتحقّق من التفويض**: إثبات
 * هوية فقط. التفويض (أن يكون البريد في OWNER_EMAILS) في `src/lib/admin.ts`،
 * ويُفحص في كل صفحة ومسار إداري على الخادم.
 */
export async function currentAdminSessionEmail(): Promise<string | null> {
  if (!isAuthConfigured()) return null;

  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return null;

  const result = verify(token, 'admin');
  return result.ok ? result.email : null;
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
