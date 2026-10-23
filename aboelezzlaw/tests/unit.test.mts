import assert from 'node:assert/strict';
import { describe, it } from 'node:test';

/**
 * اختبارات الوحدات — المنطق الخالص الذي لا يحتاج شبكة ولا قاعدة.
 *
 * ما يُختبر هنا هو ما يُكلِّف خطأً فيه مالاً أو أماناً: التحقّق من توقيع
 * البوابة، صلاحية روابط التحميل، أسعار الخادم، عتبات التذكير، وصياغة
 * المثنّى العربي. تكامل المسارات في `integration.sh` مقابل خادم حقيقي.
 */

process.env.DOWNLOAD_SECRET ??= 'unit-test-download-secret-0123456789abcdef';
process.env.AUTH_SECRET ??= 'unit-test-auth-secret-0123456789abcdef0123';
process.env.PAYMOB_HMAC_SECRET ??= 'unit-test-paymob-hmac';

const { verifyPaymobHmac } = await import('@/lib/payments/paymob');
const { createDownloadToken, verifyDownloadToken } = await import('@/lib/download-token');
const { dueReminder, nextPeriodEnd, REMINDER_DAYS } = await import('@/lib/subscriptions');
const { requestOrigin } = await import('@/lib/origin');
const { ownerEmails, isOwnerEmail, sameOrigin } = await import('@/lib/admin');
const { products, getProduct, SHIPPING_FLAT_RATE } = await import('@/content/products');
const { clientWaLink } = await import('@/lib/notifications/templates');
const { articles } = await import('@/content/blog');

// ───────────────────── توقيع Paymob ─────────────────────

function paymobPayload(overrides: Record<string, unknown> = {}) {
  const base: Record<string, unknown> = {
    amount_cents: 120000,
    created_at: '2026-10-23T10:00:00Z',
    currency: 'EGP',
    error_occured: false,
    has_parent_transaction: false,
    id: 777001,
    integration_id: 4242,
    is_3d_secure: true,
    is_auth: false,
    is_capture: false,
    is_refunded: false,
    is_standalone_payment: true,
    is_voided: false,
    order: { id: 999 },
    owner: 1234,
    pending: false,
    source_data: { pan: '2346', sub_type: 'MasterCard', type: 'card' },
    success: true,
  };
  return { ...base, ...overrides };
}

/**
 * ترتيب الحقول كما توثّقه Paymob — مكتوب هنا مستقلّاً عن كود الإنتاج بقصد:
 * لو أُعيد ترتيب القائمة في الكود سقط الاختبار، وهذا هو المطلوب، لأن
 * الترتيب يفرضه المزوّد لا نحن.
 */
const FIELD_ORDER = [
  'amount_cents',
  'created_at',
  'currency',
  'error_occured',
  'has_parent_transaction',
  'id',
  'integration_id',
  'is_3d_secure',
  'is_auth',
  'is_capture',
  'is_refunded',
  'is_standalone_payment',
  'is_voided',
  'order.id',
  'owner',
  'pending',
  'source_data.pan',
  'source_data.sub_type',
  'source_data.type',
  'success',
];

/** يبني التوقيع الصحيح بنفس ترتيب الحقول الذي تنشره Paymob */
async function signPaymob(payload: Record<string, unknown>) {
  const { createHmac } = await import('node:crypto');
  const concatenated = FIELD_ORDER.map((path) => {
    const value = path
      .split('.')
      .reduce<unknown>((acc, key) => (acc as Record<string, unknown>)?.[key], payload);
    if (typeof value === 'boolean') return value ? 'true' : 'false';
    return String(value ?? '');
  }).join('');
  return createHmac('sha512', process.env.PAYMOB_HMAC_SECRET!).update(concatenated).digest('hex');
}

describe('توقيع Paymob', () => {
  it('يقبل توقيعاً صحيحاً', async () => {
    const payload = paymobPayload();
    assert.equal(verifyPaymobHmac(payload, await signPaymob(payload)), true);
  });

  it('يرفض توقيعاً مُلفَّقاً', () => {
    assert.equal(verifyPaymobHmac(paymobPayload(), 'a'.repeat(128)), false);
  });

  it('يرفض توقيعاً فارغاً أو ناقصاً', async () => {
    const payload = paymobPayload();
    const valid = await signPaymob(payload);
    assert.equal(verifyPaymobHmac(payload, ''), false);
    assert.equal(verifyPaymobHmac(payload, valid.slice(0, -2)), false);
  });

  it('يرفض التوقيع إذا تغيّر المبلغ بعد التوقيع', async () => {
    const signature = await signPaymob(paymobPayload());
    // نفس التوقيع مع مبلغ أقل: هذا بالضبط ما يحاوله من يتلاعب بالدفع
    assert.equal(verifyPaymobHmac(paymobPayload({ amount_cents: 100 }), signature), false);
  });

  it('يرفض التوقيع إذا قُلبت قيمة النجاح', async () => {
    const signature = await signPaymob(paymobPayload({ success: false }));
    assert.equal(verifyPaymobHmac(paymobPayload({ success: true }), signature), false);
  });
});

// ───────────────────── روابط التحميل ─────────────────────

describe('روابط التحميل الموقّعة', () => {
  it('تُفتح بالمنتج والمرجع الصحيحين', () => {
    const token = createDownloadToken('contract-templates-pack', 'ABZ-1');
    const result = verifyDownloadToken(token);
    assert.equal(result.ok, true);
    if (result.ok) {
      assert.equal(result.claim.slug, 'contract-templates-pack');
      assert.equal(result.claim.reference, 'ABZ-1');
      assert.ok(result.claim.exp > Math.floor(Date.now() / 1000));
    }
  });

  it('ترفض رمزاً مُلفَّقاً', () => {
    const token = createDownloadToken('contract-templates-pack', 'ABZ-1');
    const [payload] = token.split('.');
    assert.equal(verifyDownloadToken(`${payload}.forged`).ok, false);
  });

  it('ترفض تبديل جسم الرمز مع إبقاء التوقيع', () => {
    const mine = createDownloadToken('contract-templates-pack', 'ABZ-MINE');
    const other = createDownloadToken('contract-templates-pack', 'ABZ-OTHER');
    const forged = `${other.split('.')[0]}.${mine.split('.')[1]}`;
    assert.equal(verifyDownloadToken(forged).ok, false);
  });

  it('ترفض رمزاً انتهت مدته', () => {
    assert.equal(verifyDownloadToken(createDownloadToken('x', 'y', -1)).ok, false);
  });

  it('ترفض نصاً ليس رمزاً', () => {
    for (const bad of ['', '.', 'abc', 'a.b.c']) {
      assert.equal(verifyDownloadToken(bad).ok, false, `قُبل: ${bad}`);
    }
  });
});

// ───────────────────── عتبات التذكير ─────────────────────

const subscription = (daysLeft: number, lastReminder: number | null = null) =>
  ({
    id: 'SUB-1',
    email: 'a@b.c',
    name: 'عميل',
    phone: '01000000000',
    product_slug: 'retainer-basic',
    status: 'active' as const,
    period: 'شهري',
    current_period_start: new Date(),
    current_period_end: new Date(Date.now() + daysLeft * 86_400_000),
    provider: 'paypal',
    provider_subscription_id: null,
    cancel_at_period_end: false,
    last_reminder_days: lastReminder,
    created_at: new Date(),
  }) as Parameters<typeof dueReminder>[0];

describe('تذكيرات الاشتراك', () => {
  it('العتبات مرتَّبة تصاعدياً — والترتيب يحمل المعنى', () => {
    assert.deepEqual(REMINDER_DAYS, [...REMINDER_DAYS].sort((a, b) => a - b));
  });

  it('يذكر أقرب عتبة لا أوسعها', () => {
    // الخطأ الذي كُشف سابقاً: بيومين متبقّيين كانت الرسالة تقول «خلال 7 أيام»
    const due = dueReminder(subscription(2));
    assert.ok(due);
    assert.equal(due.tier, 3);
    assert.equal(due.remaining, 2);
  });

  it('لا يعيد تذكيراً أُرسل لنفس العتبة', () => {
    assert.equal(dueReminder(subscription(2, 3)), null);
  });

  it('يُذكّر بعتبة أقرب بعد تذكير أوسع', () => {
    const due = dueReminder(subscription(1, 3));
    assert.ok(due);
    assert.equal(due.tier, 1);
  });

  it('لا يُذكّر قبل أوسع عتبة', () => {
    assert.equal(dueReminder(subscription(30)), null);
  });
});

describe('نهاية الدورة', () => {
  it('تتقدّم شهراً تقويمياً', () => {
    const start = new Date('2026-09-05T00:00:00Z');
    assert.equal(nextPeriodEnd('شهري', start).toISOString().slice(0, 10), '2026-10-05');
  });

  it('تثبّت نهاية الشهر عند 31 يناير', () => {
    // 31 يناير + شهر لا يساوي 3 مارس: نُقصّه إلى آخر فبراير
    const end = nextPeriodEnd('شهري', new Date('2026-01-31T00:00:00Z'));
    assert.equal(end.getUTCMonth(), 1);
    assert.ok(end.getUTCDate() >= 28);
  });
});

// ───────────────────── العنوان العام ─────────────────────

describe('العنوان العام', () => {
  const make = (headers: Record<string, string>) =>
    new Request('http://127.0.0.1:3100/api/x', { headers });

  it('يفضّل x-forwarded-host على عنوان الطلب الداخلي', () => {
    assert.equal(
      requestOrigin(make({ 'x-forwarded-host': 'aboelezzlaw.com', 'x-forwarded-proto': 'https' })),
      'https://aboelezzlaw.com',
    );
  });

  it('يرجع إلى ترويسة المضيف', () => {
    assert.equal(
      requestOrigin(make({ host: 'aboelezzlaw.com', 'x-forwarded-proto': 'https' })),
      'https://aboelezzlaw.com',
    );
  });

  it('يأخذ أول بروتوكول في قائمة مفصولة بفواصل', () => {
    assert.equal(
      requestOrigin(make({ host: 'x.com', 'x-forwarded-proto': 'https, http' })),
      'https://x.com',
    );
  });
});

// ───────────────────── تفويض المالك ─────────────────────

describe('قائمة المُلّاك', () => {
  it('تقرأ عدّة عناوين وتتجاهل الفراغات والحالة', () => {
    process.env.OWNER_EMAILS = ' Owner@Example.com ,second@example.com;  ';
    assert.deepEqual(ownerEmails(), ['owner@example.com', 'second@example.com']);
    assert.equal(isOwnerEmail('OWNER@example.com'), true);
    assert.equal(isOwnerEmail('third@example.com'), false);
  });

  it('قائمة فارغة لا تمنح أحداً صلاحية', () => {
    process.env.OWNER_EMAILS = '';
    assert.equal(isOwnerEmail('owner@example.com'), false);
    assert.equal(isOwnerEmail(null), false);
    assert.equal(isOwnerEmail(undefined), false);
  });

  it('تتجاهل القيم التي ليست بريداً', () => {
    process.env.OWNER_EMAILS = 'not-an-email, ok@example.com';
    assert.deepEqual(ownerEmails(), ['ok@example.com']);
  });
});

describe('فحص المصدر', () => {
  const post = (headers: Record<string, string>) =>
    new Request('http://127.0.0.1:3100/api/admin/orders', { method: 'POST', headers });

  it('يقبل مصدراً مطابقاً للمضيف المُمرَّر', () => {
    assert.equal(
      sameOrigin(post({ origin: 'https://aboelezzlaw.com', 'x-forwarded-host': 'aboelezzlaw.com' })),
      true,
    );
  });

  it('يرفض مصدراً أجنبياً', () => {
    assert.equal(
      sameOrigin(post({ origin: 'https://evil.example', 'x-forwarded-host': 'aboelezzlaw.com' })),
      false,
    );
  });

  it('يرفض مصدراً غير صالح', () => {
    assert.equal(sameOrigin(post({ origin: 'not a url', host: 'aboelezzlaw.com' })), false);
  });

  it('غياب الترويسة ليس رفضاً — بعض العملاء لا يرسلونها', () => {
    assert.equal(sameOrigin(post({ host: 'aboelezzlaw.com' })), true);
  });
});

// ───────────────────── الكتالوج ─────────────────────

describe('كتالوج المنتجات', () => {
  it('لا معرّفات مكرّرة', () => {
    const slugs = products.map((product) => product.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it('كل الأسعار موجبة وبالجنيه', () => {
    for (const product of products) {
      assert.ok(product.price > 0, `سعر غير صالح: ${product.slug}`);
      assert.equal(product.currency, 'EGP', `عملة غير متوقَّعة: ${product.slug}`);
    }
  });

  it('السعر قبل الخصم أعلى من السعر الحالي حيث وُجد', () => {
    for (const product of products) {
      if (product.compareAtPrice !== undefined) {
        assert.ok(
          product.compareAtPrice > product.price,
          `سعر مقارنة غير منطقي: ${product.slug}`,
        );
      }
    }
  });

  it('كل منتج رقمي معروض للبيع له ملف محدَّد', () => {
    for (const product of products) {
      if (product.kind === 'digital' && !product.comingSoon) {
        assert.ok(product.file, `منتج رقمي بلا ملف: ${product.slug}`);
      }
    }
  });

  it('كل اشتراك له دورة تحصيل', () => {
    for (const product of products) {
      if (product.kind === 'subscription') {
        assert.ok(product.billingPeriod, `اشتراك بلا دورة: ${product.slug}`);
      }
    }
  });

  it('المنتجات غير الجاهزة مُعلَّمة قريباً', () => {
    const coming = products.filter((product) => product.comingSoon);
    assert.ok(coming.length > 0, 'يُتوقَّع وجود منتجات لم تُطرح بعد');
    for (const product of coming) {
      assert.equal(product.badge, 'قريباً', `شارة غير متوقَّعة: ${product.slug}`);
    }
  });

  it('getProduct يجد ويُرجع undefined لما لا وجود له', () => {
    assert.equal(getProduct('contract-templates-pack')?.price, 1200);
    assert.equal(getProduct('nope'), undefined);
  });

  it('أجرة الشحن ثابتة وموجبة', () => {
    assert.ok(SHIPPING_FLAT_RATE > 0);
  });
});

// ───────────────────── واتساب ─────────────────────

describe('رابط واتساب للعميل', () => {
  it('يحوّل الرقم المصري المحلّي إلى الصيغة الدولية', () => {
    const link = clientWaLink('01157844664', 'أحمد');
    assert.ok(link?.startsWith('https://wa.me/201157844664'), link ?? 'null');
  });

  it('يترك الرقم الدولي كما هو', () => {
    assert.ok(clientWaLink('201157844664', 'أحمد')?.startsWith('https://wa.me/201157844664'));
  });

  it('يرفض رقماً أقصر من أن يكون رقماً', () => {
    assert.equal(clientWaLink('123', 'أحمد'), null);
  });
});

// ───────────────────── المحتوى ─────────────────────

describe('مقالات المدونة', () => {
  it('لا معرّفات مكرّرة', () => {
    const slugs = articles.map((article) => article.slug);
    assert.equal(new Set(slugs).size, slugs.length);
  });

  it('كل مقال له مصادر، وكلها روابط https', () => {
    for (const article of articles) {
      assert.ok(article.sources.length > 0, `مقال بلا مصادر: ${article.slug}`);
      for (const source of article.sources) {
        assert.ok(
          source.url.startsWith('https://'),
          `مصدر ليس https: ${article.slug} — ${source.url}`,
        );
      }
    }
  });

  it('لا مصدر يشير إلى نطاق غير رسمي', () => {
    // المصادر يجب أن تكون بوّابات تشريعية أو جهات رسمية أو دوريات محكَّمة
    // القائمة موضوعة يداً بيد لا مولَّدة من المحتوى: إضافة نطاق جديد قرار
    // يُراجَع، لا شيء يمرّ لأنه ظهر في مقال. كل نطاق هنا جهة تشريعية أو
    // حكومية أو منظّمة دولية.
    const allowed = [
      // مصر
      'manshurat.org', // بوّابة التشريعات المصرية
      'mcit.gov.eg', // وزارة الاتصالات وتكنولوجيا المعلومات
      'eeaa.gov.eg', // جهاز شؤون البيئة
      // السعودية
      'laws.boe.gov.sa', // هيئة الخبراء بمجلس الوزراء — الأنظمة
      'boe.gov.sa',
      'zatca.gov.sa', // هيئة الزكاة والضريبة والجمارك
      'gstc.gov.sa', // الأمانة العامة للجان الضريبية والجمركية
      'scca.org.sa', // المركز السعودي للتحكيم التجاري
      // منظّمات دولية
      'uncitral.un.org',
      'un.org',
      'unidroit.org',
      'unep.org',
      'oecd.org',
      'crcica.org', // مركز القاهرة الإقليمي للتحكيم التجاري الدولي
      // الاتحاد الأوروبي
      'eur-lex.europa.eu',
      'europa.eu',
    ];
    for (const article of articles) {
      for (const source of article.sources) {
        const host = new URL(source.url).hostname.replace(/^www\./, '');
        assert.ok(
          allowed.some((domain) => host === domain || host.endsWith(`.${domain}`)),
          `نطاق غير مُدرج في قائمة المصادر الرسمية: ${host} (${article.slug})`,
        );
      }
    }
  });
});
