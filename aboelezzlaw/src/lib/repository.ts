import type postgres from 'postgres';
import { tryDb } from '@/lib/db';
import type { OrderDraft } from '@/lib/payments/types';

export type OrderStatus = 'pending' | 'paid' | 'failed' | 'refunded' | 'cancelled';
export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';
export type SubscriptionStatus = 'pending' | 'active' | 'past_due' | 'cancelled' | 'expired';

export interface OrderItemRow {
  slug: string;
  name: string;
  unitPrice: number;
  quantity: number;
  kind: string;
}

export interface OrderRow {
  id: string;
  email: string;
  name: string;
  phone: string;
  items: OrderItemRow[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  method: string;
  status: OrderStatus;
  address: string | null;
  city: string | null;
  notes: string | null;
  provider_ref: string | null;
  created_at: Date;
}

export interface BookingRow {
  id: string;
  email: string;
  name: string;
  phone: string;
  type: string;
  channel: string;
  slot_date: Date;
  slot_time: string;
  details: string;
  status: BookingStatus;
  created_at: Date;
}

export interface SubscriptionRow {
  id: string;
  email: string;
  name: string;
  phone: string;
  product_slug: string;
  status: SubscriptionStatus;
  period: string;
  current_period_start: Date | null;
  current_period_end: Date | null;
  provider: string;
  provider_subscription_id: string | null;
  cancel_at_period_end: boolean;
  last_reminder_days: number | null;
  created_at: Date;
}

/** مُعرّف قصير مقروء للسجلّات التي ليست طلبات */
export function generateId(prefix: string): string {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  return `${prefix}-${stamp}-${Math.random().toString(36).slice(2, 7).toUpperCase()}`;
}

// ───────────────────────── الطلبات ─────────────────────────

export async function saveOrder(order: OrderDraft, method: string): Promise<boolean> {
  const saved = await tryDb(async (sql) => {
    await sql`
      INSERT INTO orders (
        id, email, name, phone, items, subtotal, shipping, total,
        currency, method, status, address, city, notes
      ) VALUES (
        ${order.reference}, ${order.customer.email}, ${order.customer.name},
        ${order.customer.phone},
        ${sql.json(order.items as unknown as postgres.JSONValue)}, ${order.subtotal},
        ${order.shipping}, ${order.total}, ${order.currency}, ${method},
        'pending', ${order.customer.address ?? null}, ${order.customer.city ?? null},
        ${order.customer.notes ?? null}
      )
      ON CONFLICT (id) DO NOTHING`;
    return true;
  });
  return saved ?? false;
}

export async function markOrderStatus(
  reference: string,
  status: OrderStatus,
  providerRef?: string,
): Promise<OrderRow | null> {
  const rows = await tryDb(
    (sql) => sql<OrderRow[]>`
      UPDATE orders
         SET status = ${status},
             provider_ref = COALESCE(${providerRef ?? null}, provider_ref),
             updated_at = now()
       WHERE id = ${reference}
       RETURNING *`,
  );
  return rows?.[0] ?? null;
}

export async function getOrder(reference: string): Promise<OrderRow | null> {
  const rows = await tryDb(
    (sql) => sql<OrderRow[]>`SELECT * FROM orders WHERE id = ${reference} LIMIT 1`,
  );
  return rows?.[0] ?? null;
}

export async function listOrdersByEmail(email: string): Promise<OrderRow[]> {
  const rows = await tryDb(
    (sql) => sql<OrderRow[]>`
      SELECT * FROM orders
       WHERE lower(email) = lower(${email})
       ORDER BY created_at DESC
       LIMIT 100`,
  );
  return rows ?? [];
}

// ───────────────────────── الحجوزات ─────────────────────────

export interface NewBooking {
  email: string;
  name: string;
  phone: string;
  type: string;
  channel: string;
  date: string;
  time: string;
  details: string;
}

/**
 * يحجز الموعد. القيد الفريد في القاعدة يمنع الحجز المزدوج،
 * فإن اصطدم طلبان متزامنان يفشل الثاني ونُرجع 'taken'.
 */
export async function createBooking(
  input: NewBooking,
): Promise<{ result: 'created' | 'taken' | 'skipped'; id: string }> {
  const id = generateId('BK');

  const outcome = await tryDb(async (sql) => {
    try {
      await sql`
        INSERT INTO bookings (id, email, name, phone, type, channel, slot_date, slot_time, details)
        VALUES (${id}, ${input.email}, ${input.name}, ${input.phone}, ${input.type},
                ${input.channel}, ${input.date}, ${input.time}, ${input.details})`;
      return 'created' as const;
    } catch (error) {
      // 23505 = انتهاك قيد فريد ⇒ الموعد محجوز
      if ((error as { code?: string }).code === '23505') return 'taken' as const;
      throw error;
    }
  });

  return { result: outcome ?? 'skipped', id };
}

/**
 * يحذف حجزاً. يُستدعى عند فشل إشعار المكتب بالكامل:
 * الإبقاء على السجلّ عندئذ يحجز موعداً لا يعلم به أحد، وهو أسوأ من فقده.
 */
export async function deleteBooking(id: string): Promise<void> {
  await tryDb((sql) => sql`DELETE FROM bookings WHERE id = ${id} AND status = 'pending'`);
}

/** المواعيد المحجوزة في يوم معيّن — تُستبعد من المُنتقي */
export async function takenSlots(date: string): Promise<string[]> {
  const rows = await tryDb(
    (sql) => sql<{ slot_time: string }[]>`
      SELECT slot_time FROM bookings
       WHERE slot_date = ${date} AND status IN ('pending', 'confirmed')`,
  );
  return (rows ?? []).map((row) => row.slot_time);
}

export async function listBookingsByEmail(email: string): Promise<BookingRow[]> {
  const rows = await tryDb(
    (sql) => sql<BookingRow[]>`
      SELECT * FROM bookings
       WHERE lower(email) = lower(${email})
       ORDER BY slot_date DESC, slot_time DESC
       LIMIT 100`,
  );
  return rows ?? [];
}

// ───────────────────────── الاشتراكات ─────────────────────────

export interface NewSubscription {
  email: string;
  name: string;
  phone: string;
  productSlug: string;
  period: string;
  provider: string;
  providerSubscriptionId?: string;
  orderId?: string;
}

export async function createSubscription(input: NewSubscription): Promise<string | null> {
  const id = generateId('SUB');
  const created = await tryDb(async (sql) => {
    await sql`
      INSERT INTO subscriptions (
        id, email, name, phone, product_slug, period, provider,
        provider_subscription_id, order_id, status
      ) VALUES (
        ${id}, ${input.email}, ${input.name}, ${input.phone}, ${input.productSlug},
        ${input.period}, ${input.provider}, ${input.providerSubscriptionId ?? null},
        ${input.orderId ?? null}, 'pending'
      )`;
    return true;
  });
  return created ? id : null;
}

/** يفعّل الاشتراك ويضبط بداية الدورة ونهايتها */
export async function activateSubscription(
  match: { id?: string; orderId?: string; providerSubscriptionId?: string },
  periodEnd: Date,
): Promise<SubscriptionRow | null> {
  const rows = await tryDb(
    (sql) => sql<SubscriptionRow[]>`
      UPDATE subscriptions
         SET status = 'active',
             current_period_start = now(),
             current_period_end = ${periodEnd},
             last_reminder_days = NULL,
             updated_at = now()
       WHERE (${match.id ?? null}::text IS NOT NULL AND id = ${match.id ?? null})
          OR (${match.orderId ?? null}::text IS NOT NULL AND order_id = ${match.orderId ?? null})
          OR (${match.providerSubscriptionId ?? null}::text IS NOT NULL
              AND provider_subscription_id = ${match.providerSubscriptionId ?? null})
       RETURNING *`,
  );
  return rows?.[0] ?? null;
}

export async function listSubscriptionsByEmail(email: string): Promise<SubscriptionRow[]> {
  const rows = await tryDb(
    (sql) => sql<SubscriptionRow[]>`
      SELECT * FROM subscriptions
       WHERE lower(email) = lower(${email})
       ORDER BY created_at DESC`,
  );
  return rows ?? [];
}

export async function requestSubscriptionCancellation(
  id: string,
  email: string,
): Promise<SubscriptionRow | null> {
  const rows = await tryDb(
    (sql) => sql<SubscriptionRow[]>`
      UPDATE subscriptions
         SET cancel_at_period_end = true, updated_at = now()
       WHERE id = ${id}
         AND lower(email) = lower(${email})
         AND status IN ('active', 'past_due')
       RETURNING *`,
  );
  return rows?.[0] ?? null;
}

/** الاشتراكات التي تنتهي دورتها خلال المدة المحدّدة — لإرسال التذكيرات */
export async function subscriptionsDueWithin(days: number): Promise<SubscriptionRow[]> {
  const rows = await tryDb(
    (sql) => sql<SubscriptionRow[]>`
      SELECT * FROM subscriptions
       WHERE status = 'active'
         AND current_period_end IS NOT NULL
         AND current_period_end > now()
         AND current_period_end <= now() + (${days} || ' days')::interval
       ORDER BY current_period_end ASC`,
  );
  return rows ?? [];
}

export async function subscriptionsExpired(): Promise<SubscriptionRow[]> {
  const rows = await tryDb(
    (sql) => sql<SubscriptionRow[]>`
      SELECT * FROM subscriptions
       WHERE status IN ('active', 'past_due')
         AND current_period_end IS NOT NULL
         AND current_period_end <= now()`,
  );
  return rows ?? [];
}

export async function setSubscriptionStatus(
  id: string,
  status: SubscriptionStatus,
): Promise<void> {
  await tryDb(
    (sql) => sql`UPDATE subscriptions SET status = ${status}, updated_at = now() WHERE id = ${id}`,
  );
}

export async function markReminderSent(id: string, days: number): Promise<void> {
  await tryDb(
    (sql) => sql`
      UPDATE subscriptions
         SET last_reminder_days = ${days}, updated_at = now()
       WHERE id = ${id}`,
  );
}

// ───────────────────────── رسائل التواصل ─────────────────────────

export async function saveMessage(input: {
  name: string;
  email: string;
  phone: string;
  subject: string;
  body: string;
}): Promise<void> {
  await tryDb(
    (sql) => sql`
      INSERT INTO messages (id, name, email, phone, subject, body)
      VALUES (${generateId('MSG')}, ${input.name}, ${input.email}, ${input.phone},
              ${input.subject}, ${input.body})`,
  );
}

export async function listMessagesByEmail(email: string) {
  const rows = await tryDb(
    (sql) => sql<
      { id: string; subject: string; body: string; created_at: Date }[]
    >`
      SELECT id, subject, body, created_at FROM messages
       WHERE lower(email) = lower(${email})
       ORDER BY created_at DESC
       LIMIT 50`,
  );
  return rows ?? [];
}

// ───────────────────── رموز الدخول (استخدام واحد) ─────────────────────

/**
 * يسجّل رمز دخول قبل إرساله. الرمز الموقّع وحده لا يكفي لأنه قابل لإعادة
 * الاستخدام حتى انتهاء صلاحيته — والسجلّ هو ما يجعله لمرة واحدة.
 */
export async function recordLoginToken(input: {
  jti: string;
  email: string;
  ip: string;
  expiresAt: Date;
}): Promise<boolean> {
  const saved = await tryDb(async (sql) => {
    await sql`
      INSERT INTO login_tokens (jti, email, issued_ip, expires_at)
      VALUES (${input.jti}, ${input.email}, ${input.ip}, ${input.expiresAt})`;
    return true;
  });
  return saved ?? false;
}

/**
 * يستهلك الرمز ذرّياً. الشرط `consumed_at IS NULL` داخل الـ UPDATE نفسه،
 * فطلبان متزامنان بنفس الرمز لا ينجح منهما إلا واحد.
 */
export async function consumeLoginToken(
  jti: string,
): Promise<{ ok: true; email: string } | { ok: false; reason: 'unknown' | 'used' | 'expired' }> {
  const consumed = await tryDb(
    (sql) => sql<{ email: string }[]>`
      UPDATE login_tokens
         SET consumed_at = now()
       WHERE jti = ${jti}
         AND consumed_at IS NULL
         AND expires_at > now()
       RETURNING email`,
  );

  if (consumed === null) return { ok: false, reason: 'unknown' };
  if (consumed.length > 0) return { ok: true, email: consumed[0]!.email };

  // فشل التحديث: نفرّق بين رمز مستهلَك ورمز منتهٍ ورمز لا وجود له
  const existing = await tryDb(
    (sql) => sql<{ consumed_at: Date | null; expires_at: Date }[]>`
      SELECT consumed_at, expires_at FROM login_tokens WHERE jti = ${jti} LIMIT 1`,
  );

  const row = existing?.[0];
  if (!row) return { ok: false, reason: 'unknown' };
  if (row.consumed_at) return { ok: false, reason: 'used' };
  return { ok: false, reason: 'expired' };
}

/** عدد رموز الدخول الصادرة لبريد أو عنوان خلال مدة — لكبح الإساءة */
export async function recentLoginTokenCount(
  by: { email?: string; ip?: string },
  minutes: number,
): Promise<number> {
  const rows = await tryDb(
    (sql) => sql<{ count: string }[]>`
      SELECT count(*)::text AS count FROM login_tokens
       WHERE created_at > now() - (${minutes} || ' minutes')::interval
         AND (
           (${by.email ?? null}::text IS NOT NULL AND lower(email) = lower(${by.email ?? null}))
           OR (${by.ip ?? null}::text IS NOT NULL AND issued_ip = ${by.ip ?? null})
         )`,
  );
  return Number(rows?.[0]?.count ?? 0);
}

/** تنظيف الرموز المنتهية — يُشغَّل مع مهمة الاشتراكات اليومية */
export async function purgeExpiredLoginTokens(): Promise<number> {
  const rows = await tryDb(
    (sql) => sql<{ jti: string }[]>`
      DELETE FROM login_tokens
       WHERE expires_at < now() - interval '7 days'
       RETURNING jti`,
  );
  return rows?.length ?? 0;
}

// ───────────────────── سجلّ التدقيق الإداري ─────────────────────

export interface AuditEntry {
  id: string;
  actor_email: string;
  action: string;
  target_type: string;
  target_id: string | null;
  detail: Record<string, unknown> | null;
  created_at: Date;
}

export async function writeAudit(input: {
  actor: string;
  action: string;
  targetType: string;
  targetId?: string;
  detail?: Record<string, unknown>;
}): Promise<void> {
  await tryDb(
    (sql) => sql`
      INSERT INTO admin_audit (actor_email, action, target_type, target_id, detail)
      VALUES (${input.actor}, ${input.action}, ${input.targetType},
              ${input.targetId ?? null},
              ${input.detail ? sql.json(input.detail as postgres.JSONValue) : null})`,
  );
}

export async function listAudit(limit = 50): Promise<AuditEntry[]> {
  const rows = await tryDb(
    (sql) => sql<AuditEntry[]>`
      SELECT id::text, actor_email, action, target_type, target_id, detail, created_at
        FROM admin_audit ORDER BY created_at DESC LIMIT ${limit}`,
  );
  return rows ?? [];
}

// ───────────────────── سجلّ الإشعارات ─────────────────────

export interface NotificationEntry {
  id: string;
  kind: string;
  channel: string;
  reference: string | null;
  ok: boolean;
  error: string | null;
  created_at: Date;
}

export async function logNotifications(
  kind: string,
  reference: string | null,
  channels: Record<string, { ok: boolean; error?: string }>,
): Promise<void> {
  const entries = Object.entries(channels);
  if (entries.length === 0) return;

  await tryDb((sql) =>
    sql`
      INSERT INTO notification_log ${sql(
        entries.map(([channel, result]) => ({
          kind,
          channel,
          reference,
          ok: result.ok,
          // الخطأ قد يحتوي ردّ المزوّد كاملاً — نقتصّه لئلا يتضخّم السجلّ
          error: result.error ? result.error.slice(0, 500) : null,
        })),
        'kind',
        'channel',
        'reference',
        'ok',
        'error',
      )}`,
  );
}

export async function listNotifications(
  options: { onlyFailures?: boolean; limit?: number } = {},
): Promise<NotificationEntry[]> {
  const limit = options.limit ?? 50;
  const rows = await tryDb((sql) =>
    options.onlyFailures
      ? sql<NotificationEntry[]>`
          SELECT id::text, kind, channel, reference, ok, error, created_at
            FROM notification_log WHERE ok = false
           ORDER BY created_at DESC LIMIT ${limit}`
      : sql<NotificationEntry[]>`
          SELECT id::text, kind, channel, reference, ok, error, created_at
            FROM notification_log ORDER BY created_at DESC LIMIT ${limit}`,
  );
  return rows ?? [];
}

// ───────────────────── نشر المنتجات ─────────────────────

export async function listProductFlags(): Promise<Record<string, boolean>> {
  const rows = await tryDb(
    (sql) => sql<{ slug: string; published: boolean }[]>`
      SELECT slug, published FROM product_flags`,
  );
  return Object.fromEntries((rows ?? []).map((row) => [row.slug, row.published]));
}

export async function setProductPublished(
  slug: string,
  published: boolean,
  actor: string,
  note?: string,
): Promise<void> {
  await tryDb(
    (sql) => sql`
      INSERT INTO product_flags (slug, published, note, updated_by, updated_at)
      VALUES (${slug}, ${published}, ${note ?? null}, ${actor}, now())
      ON CONFLICT (slug) DO UPDATE
        SET published = ${published}, note = ${note ?? null},
            updated_by = ${actor}, updated_at = now()`,
  );
}
