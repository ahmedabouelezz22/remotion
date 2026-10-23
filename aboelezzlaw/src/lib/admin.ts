import { NextResponse } from 'next/server';
import type { ZodType } from 'zod';
import { currentAdminSessionEmail } from '@/lib/session';
import { writeAudit } from '@/lib/repository';

/**
 * تفويض لوحة المالك.
 *
 * طبقتان مستقلّتان، ولا تكفي إحداهما:
 *   1) إثبات الهوية — جلسة `abz_admin` موقّعة، تُصدَر فقط بعد فتح رابط لمرة
 *      واحدة أُرسل إلى صندوق البريد نفسه. فالمالك يُثبت تحكّمه في البريد.
 *   2) التفويض — أن يكون ذلك البريد في `OWNER_EMAILS`. تُقرأ القائمة من
 *      بيئة الخادم، فلا تُعدَّل من المتصفّح ولا من قاعدة البيانات.
 *
 * كل صفحة إدارية وكل مسار إداري ينادي `requireOwner()` على الخادم. إخفاء
 * الأزرار ليس حماية: من يعرف المسار يفتحه مباشرةً.
 */

export function ownerEmails(): string[] {
  return (process.env.OWNER_EMAILS ?? '')
    .split(/[,\s;]+/)
    .map((value) => value.trim().toLowerCase())
    .filter((value) => value.includes('@'));
}

export function isAdminConfigured(): boolean {
  return ownerEmails().length > 0;
}

export function isOwnerEmail(email: string | null | undefined): boolean {
  if (!email) return false;
  return ownerEmails().includes(email.trim().toLowerCase());
}

export type OwnerCheck =
  | { ok: true; email: string }
  | { ok: false; reason: 'unconfigured' | 'anonymous' | 'forbidden' };

/** الفحص الوحيد المعتمد للوصول الإداري. يُنادى على الخادم في كل مرة. */
export async function requireOwner(): Promise<OwnerCheck> {
  if (!isAdminConfigured()) return { ok: false, reason: 'unconfigured' };

  const email = await currentAdminSessionEmail();
  if (!email) return { ok: false, reason: 'anonymous' };
  if (!isOwnerEmail(email)) return { ok: false, reason: 'forbidden' };

  return { ok: true, email };
}

const STATUS: Record<Exclude<OwnerCheck, { ok: true }>['reason'], number> = {
  unconfigured: 503,
  anonymous: 401,
  forbidden: 403,
};

const MESSAGE: Record<Exclude<OwnerCheck, { ok: true }>['reason'], string> = {
  unconfigured: 'لوحة الإدارة غير مهيّأة (OWNER_EMAILS غير مضبوط).',
  anonymous: 'يلزم تسجيل الدخول كمالك.',
  forbidden: 'هذا الحساب لا يملك صلاحية إدارية.',
};

/**
 * فحص المصدر — دفاع ثانٍ ضد CSRF بعد `sameSite: 'strict'` على كعكة الإدارة.
 * غياب الترويسة ليس سبباً للرفض (بعض العملاء لا يرسلونها)، لكن وجودها
 * مخالفةً للمضيف هو طلب من موقع آخر ويُرفض.
 *
 * المقارنة مع ترويسة المضيف لا مع `request.url`: الموقع يعمل خلف وسيط
 * (Vercel وغيره) يُنهي TLS ويُمرّر الطلب داخلياً، فعنوان الطلب الداخلي قد
 * يحمل منفذ الاستماع لا المضيف العام — والمتصفّح يقارن بالمضيف العام.
 */
export function sameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;

  const hosts = [
    request.headers.get('x-forwarded-host'),
    request.headers.get('host'),
    (() => {
      try {
        return new URL(request.url).host;
      } catch {
        return null;
      }
    })(),
  ].filter((value): value is string => Boolean(value));

  try {
    const originHost = new URL(origin).host;
    return hosts.includes(originHost);
  } catch {
    return false;
  }
}

/**
 * غلاف لمسارات الـ API الإدارية: يفحص المصدر والتفويض **قبل** قراءة الجسم
 * أو التحقّق منه، ثم ينفّذ، ثم يسجّل في `admin_audit`.
 *
 * الترتيب مهمّ: لو تحقّقنا من الجسم أولاً لعاد لغير المصرَّح له 400 بدلاً من
 * 401، فيستدلّ من فرق الردود على صيغة المسار وحقوله. التسجيل ليس اختيارياً.
 */
export async function withOwner<T>(
  request: Request,
  schema: ZodType<T>,
  handler: (input: T, owner: { email: string }) => Promise<{ response: NextResponse; audit?: Audit }>,
): Promise<NextResponse> {
  if (request.method !== 'GET' && !sameOrigin(request)) {
    return NextResponse.json({ ok: false, message: 'طلب من مصدر غير مسموح.' }, { status: 403 });
  }

  const check = await requireOwner();
  if (!check.ok) {
    return NextResponse.json(
      { ok: false, message: MESSAGE[check.reason] },
      { status: STATUS[check.reason] },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'صيغة الطلب غير صحيحة.' }, { status: 400 });
  }

  const parsed = schema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: parsed.error.issues[0]?.message ?? 'بيانات الإجراء غير صحيحة.' },
      { status: 400 },
    );
  }

  const { response, audit } = await handler(parsed.data, { email: check.email });

  if (audit) {
    await writeAudit({
      actor: check.email,
      action: audit.action,
      targetType: audit.targetType,
      targetId: audit.targetId,
      detail: audit.detail,
    });
  }

  return response;
}

export interface Audit {
  action: string;
  targetType: string;
  targetId?: string;
  detail?: Record<string, unknown>;
}
