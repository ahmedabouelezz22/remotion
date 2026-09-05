import postgres from 'postgres';

/**
 * طبقة قاعدة البيانات (PostgreSQL).
 *
 * القاعدة اختيارية بالكامل: إن لم يُضبط DATABASE_URL يظل الموقع يعمل،
 * وتصلك الإشعارات كالمعتاد، لكن تختفي لوحة تحكم العميل وسجلّ الطلبات.
 *
 * التهيئة تتم مرة واحدة عند أول استعلام (CREATE TABLE IF NOT EXISTS)،
 * فلا حاجة إلى تشغيل هجرات يدوية عند النشر.
 */

let client: postgres.Sql | null = null;
let migrated: Promise<void> | null = null;

export function isDbConfigured(): boolean {
  return Boolean(process.env.DATABASE_URL);
}

function connect(): postgres.Sql {
  if (client) return client;

  client = postgres(process.env.DATABASE_URL!, {
    // بيئة Serverless: اتصال واحد لكل نسخة، وبلا عبارات مُحضَّرة لأن
    // موجّهات الاتصال (PgBouncer / Neon pooler) لا تدعمها في وضع المعاملات
    max: 1,
    prepare: false,
    idle_timeout: 20,
    connect_timeout: 10,
    onnotice: () => {},
  });

  return client;
}

async function migrate(sql: postgres.Sql): Promise<void> {
  await sql`
    CREATE TABLE IF NOT EXISTS orders (
      id             text PRIMARY KEY,
      email          text NOT NULL,
      name           text NOT NULL,
      phone          text NOT NULL,
      items          jsonb NOT NULL,
      subtotal       numeric(12,2) NOT NULL,
      shipping       numeric(12,2) NOT NULL DEFAULT 0,
      total          numeric(12,2) NOT NULL,
      currency       text NOT NULL DEFAULT 'EGP',
      method         text NOT NULL,
      status         text NOT NULL DEFAULT 'pending',
      address        text,
      city           text,
      notes          text,
      provider_ref   text,
      created_at     timestamptz NOT NULL DEFAULT now(),
      updated_at     timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS orders_email_idx ON orders (lower(email), created_at DESC)`;

  await sql`
    CREATE TABLE IF NOT EXISTS bookings (
      id           text PRIMARY KEY,
      email        text NOT NULL,
      name         text NOT NULL,
      phone        text NOT NULL,
      type         text NOT NULL,
      channel      text NOT NULL,
      slot_date    date NOT NULL,
      slot_time    text NOT NULL,
      details      text NOT NULL,
      status       text NOT NULL DEFAULT 'pending',
      created_at   timestamptz NOT NULL DEFAULT now(),
      updated_at   timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS bookings_email_idx ON bookings (lower(email), slot_date DESC)`;
  // موعد واحد لا يُحجز مرتين — القيد على مستوى القاعدة لا التطبيق،
  // لأن طلبين متزامنين قد يتجاوزان أي فحص في الكود
  await sql`
    CREATE UNIQUE INDEX IF NOT EXISTS bookings_slot_unique
      ON bookings (slot_date, slot_time)
      WHERE status IN ('pending', 'confirmed')`;

  await sql`
    CREATE TABLE IF NOT EXISTS subscriptions (
      id                       text PRIMARY KEY,
      email                    text NOT NULL,
      name                     text NOT NULL,
      phone                    text NOT NULL,
      product_slug             text NOT NULL,
      status                   text NOT NULL DEFAULT 'pending',
      period                   text NOT NULL DEFAULT 'شهري',
      current_period_start     timestamptz,
      current_period_end       timestamptz,
      provider                 text NOT NULL DEFAULT 'manual',
      provider_subscription_id text,
      cancel_at_period_end     boolean NOT NULL DEFAULT false,
      last_reminder_days       integer,
      order_id                 text,
      created_at               timestamptz NOT NULL DEFAULT now(),
      updated_at               timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS subs_email_idx ON subscriptions (lower(email))`;
  await sql`CREATE INDEX IF NOT EXISTS subs_due_idx ON subscriptions (status, current_period_end)`;

  await sql`
    CREATE TABLE IF NOT EXISTS messages (
      id         text PRIMARY KEY,
      name       text NOT NULL,
      email      text NOT NULL,
      phone      text NOT NULL,
      subject    text NOT NULL,
      body       text NOT NULL,
      created_at timestamptz NOT NULL DEFAULT now()
    )`;
  await sql`CREATE INDEX IF NOT EXISTS messages_email_idx ON messages (lower(email), created_at DESC)`;
}

/**
 * يُرجع اتصالاً مهيّأً، أو null إن لم تُضبط القاعدة.
 * كل مستدعٍ ملزَم بالتعامل مع null — لا يجوز أن يفشل نموذج بسبب غياب القاعدة.
 */
export async function getDb(): Promise<postgres.Sql | null> {
  if (!isDbConfigured()) return null;

  const sql = connect();
  if (!migrated) {
    migrated = migrate(sql).catch((error) => {
      // إعادة المحاولة في الطلب التالي بدل تثبيت الفشل إلى الأبد
      migrated = null;
      throw error;
    });
  }

  try {
    await migrated;
    return sql;
  } catch (error) {
    console.error('[db] فشلت تهيئة الجداول', error);
    return null;
  }
}

/** ينفّذ عملية على القاعدة ويبتلع أي خطأ — للاستخدام في المسارات التي لا يجوز أن تفشل */
export async function tryDb<T>(
  operation: (sql: postgres.Sql) => Promise<T>,
): Promise<T | null> {
  try {
    const sql = await getDb();
    if (!sql) return null;
    return await operation(sql);
  } catch (error) {
    console.error('[db] فشلت العملية', error);
    return null;
  }
}
