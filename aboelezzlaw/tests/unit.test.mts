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
const { checkSlot, isWorkingDay, slotsForDate, MAX_BOOKING_DAYS_AHEAD, todayInOfficeTimezone } =
  await import('@/lib/slots');
const { ownerEmails, isOwnerEmail, sameOrigin } = await import('@/lib/admin');
const { products, getProduct, SHIPPING_FLAT_RATE } = await import('@/content/products');
const { clientWaLink } = await import('@/lib/notifications/templates');
const { jsonLdScript } = await import('@/lib/utils');
const { articles } = await import('@/content/blog');
const { ar } = await import('@/content/i18n/ar');
const { en } = await import('@/content/i18n/en');
const { locales, defaultLocale, dict, direction, htmlLang, path, otherLocale, switchPath } =
  await import('@/content/i18n');
const { productText } = await import('@/content/products');
const { services, serviceText } = await import('@/content/services');
const { faqs, faqText } = await import('@/content/faq');
const { privacyPolicy, termsOfUse } = await import('@/content/legal');
const { default: sitemap } = await import('@/app/sitemap');

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

// ───────────────────── مواعيد العمل ─────────────────────

/** تاريخ أول يوم يوافق يوم الأسبوع المطلوب بعد عدد أيام */
function dateOfWeekday(weekday: number, minDaysAhead = 7): string {
  const date = new Date(`${todayInOfficeTimezone()}T00:00:00Z`);
  date.setUTCDate(date.getUTCDate() + minDaysAhead);
  while (date.getUTCDay() !== weekday) date.setUTCDate(date.getUTCDate() + 1);
  return date.toISOString().slice(0, 10);
}

describe('مواعيد العمل', () => {
  it('الأحد إلى الخميس أيام عمل', () => {
    for (const day of [0, 1, 2, 3, 4]) {
      assert.equal(isWorkingDay(dateOfWeekday(day)), true, `يوم ${day} يجب أن يكون يوم عمل`);
    }
  });

  it('الجمعة والسبت ليسا يومي عمل', () => {
    for (const day of [5, 6]) {
      assert.equal(isWorkingDay(dateOfWeekday(day)), false, `يوم ${day} ليس يوم عمل`);
    }
  });

  it('المواعيد من 10:00 إلى 17:00 بفواصل ساعة', () => {
    const slots = slotsForDate(dateOfWeekday(1));
    assert.deepEqual(slots, [
      '10:00',
      '11:00',
      '12:00',
      '13:00',
      '14:00',
      '15:00',
      '16:00',
      '17:00',
    ]);
  });

  it('لا مواعيد في يوم غير عمل', () => {
    assert.deepEqual(slotsForDate(dateOfWeekday(5)), []);
  });

  it('يقبل موعداً صالحاً في يوم عمل', () => {
    assert.deepEqual(checkSlot(dateOfWeekday(2), '12:00'), { ok: true });
  });

  it('يرفض يوم إجازة', () => {
    const result = checkSlot(dateOfWeekday(5), '12:00');
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.field, 'date');
  });

  it('يرفض ساعة خارج المواعيد', () => {
    // 03:00 ليس من المواعيد المعروضة — والمنع على الخادم لا في المُنتقي وحده
    const result = checkSlot(dateOfWeekday(2), '03:00');
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.field, 'time');
  });

  it('يرفض ساعة في منتصف الفاصل', () => {
    const result = checkSlot(dateOfWeekday(2), '12:30');
    assert.equal(result.ok, false);
  });

  it('يرفض تاريخاً في الماضي', () => {
    const result = checkSlot('2020-01-06', '12:00');
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.field, 'date');
  });

  it('يرفض تاريخاً أبعد من المدى المسموح', () => {
    const far = new Date(`${todayInOfficeTimezone()}T00:00:00Z`);
    far.setUTCDate(far.getUTCDate() + MAX_BOOKING_DAYS_AHEAD + 30);
    const result = checkSlot(far.toISOString().slice(0, 10), '12:00');
    assert.equal(result.ok, false);
    if (!result.ok) assert.equal(result.field, 'date');
  });

  it('تاريخ اليوم بتوقيت المكتب بصيغة YYYY-MM-DD', () => {
    assert.match(todayInOfficeTimezone(), /^\d{4}-\d{2}-\d{2}$/);
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

// ───────────────────── JSON-LD ─────────────────────

describe('JSON-LD داخل وسم script', () => {
  it('لا يُخرج `<` حرفياً فلا يُمكن إغلاق الوسم', () => {
    const output = jsonLdScript({ name: 'نصّ فيه </script><img onerror=x>' });
    assert.ok(!output.includes('<'), output);
    assert.ok(output.includes('\\u003c'));
  });

  it('يبقى JSON صالحاً يُفَكّ إلى نفس القيمة', () => {
    const data = { a: 1, b: 'نصّ <b>عربي</b>', c: [1, 2] };
    assert.deepEqual(JSON.parse(jsonLdScript(data)), data);
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


// ───────────────────── القاموسان ─────────────────────

const ARABIC_LETTER = /[ء-ي]/;

/**
 * مسارات يُستثنى محتواها من الفحص، ولكل منها سبب:
 *  • `nav.switchLanguage*`: اسم اللغة الأخرى بلغتها هي — فالعربي يقرأ
 *    «English» والإنجليزي يقرأ «العربية»، وهذا هو المطلوب.
 *  • خرائط التسميات: مفاتيحها هي القيمة العربية القانونية (ما يُخزَّن في
 *    القاعدة ويصل إشعار المكتب)، والقيمة هي التسمية المعروضة. القاموس
 *    العربي لا يحتاج خريطة أصلاً لأن القيمة هي التسمية.
 */
const EXEMPT_TRAILS = new Set([
  'dict.nav.switchLanguage',
  'dict.nav.switchLanguageLabel',
  'dict.storeExtra.billingPeriods',
  'dict.bookingForm.consultationTypes',
  'dict.bookingForm.consultationChannels',
]);

/**
 * يمشي على القاموسين معاً ويُرجع كل اختلاف. النوع وحده لا يكفي: `Dictionary`
 * يفرض وجود المفاتيح وأنواعها، لكنه لا يمنع نسخ النصّ العربي كما هو إلى
 * الملف الإنجليزي — وهو الخطأ الأرجح عند إضافة قسم جديد على عجل.
 */
function walkDictionaries(
  arabic: unknown,
  english: unknown,
  trail: string,
  problems: string[],
): void {
  if (EXEMPT_TRAILS.has(trail)) return;

  if (typeof arabic === 'function') {
    if (typeof english !== 'function') problems.push(`${trail}: ليست دالّة في الإنجليزية`);
    return;
  }

  if (Array.isArray(arabic)) {
    if (!Array.isArray(english)) {
      problems.push(`${trail}: ليست مصفوفة في الإنجليزية`);
      return;
    }
    if (arabic.length !== english.length) {
      problems.push(`${trail}: الطول ${arabic.length} ≠ ${english.length}`);
      return;
    }
    arabic.forEach((item, index) =>
      walkDictionaries(item, english[index], `${trail}[${index}]`, problems),
    );
    return;
  }

  if (arabic !== null && typeof arabic === 'object') {
    if (english === null || typeof english !== 'object') {
      problems.push(`${trail}: ليست كائناً في الإنجليزية`);
      return;
    }
    const arabicKeys = Object.keys(arabic as Record<string, unknown>);
    const englishKeys = Object.keys(english as Record<string, unknown>);
    for (const key of arabicKeys) {
      if (!englishKeys.includes(key)) {
        problems.push(`${trail}.${key}: مفقود في الإنجليزية`);
        continue;
      }
      walkDictionaries(
        (arabic as Record<string, unknown>)[key],
        (english as Record<string, unknown>)[key],
        `${trail}.${key}`,
        problems,
      );
    }
    for (const key of englishKeys) {
      if (!arabicKeys.includes(key)) problems.push(`${trail}.${key}: زائد في الإنجليزية`);
    }
    return;
  }

  if (typeof arabic === 'string') {
    if (typeof english !== 'string') {
      problems.push(`${trail}: ليست نصّاً في الإنجليزية`);
      return;
    }
    if (ARABIC_LETTER.test(english)) problems.push(`${trail}: نصّ عربي في الملف الإنجليزي`);
  }
}

describe('القاموسان العربي والإنجليزي', () => {
  it('متطابقا البنية وبلا نصّ عربي في الإنجليزية', () => {
    const problems: string[] = [];
    walkDictionaries(ar, en, 'dict', problems);
    assert.deepEqual(problems, []);
  });

  it('كل لغة لها قاموس، والافتراضية العربية', () => {
    assert.deepEqual([...locales], ['ar', 'en']);
    assert.equal(defaultLocale, 'ar');
    assert.equal(dict('ar'), ar);
    assert.equal(dict('en'), en);
  });

  it('الاتجاه ولغة المستند لكل لغة', () => {
    assert.equal(direction('ar'), 'rtl');
    assert.equal(direction('en'), 'ltr');
    assert.ok(htmlLang('ar').startsWith('ar'));
    assert.ok(htmlLang('en').startsWith('en'));
  });
});

// ───────────────────── مسارات اللغة ─────────────────────

describe('مسارات اللغة', () => {
  it('المسار يحمل بادئة اللغة بلا شرطة زائدة', () => {
    assert.equal(path('ar', '/'), '/ar');
    assert.equal(path('en', '/'), '/en');
    assert.equal(path('ar', '/store'), '/ar/store');
    assert.equal(path('en', '/store/contract-templates-pack'), '/en/store/contract-templates-pack');
  });

  it('اللغة الأخرى هي الأخرى فعلاً', () => {
    assert.equal(otherLocale('ar'), 'en');
    assert.equal(otherLocale('en'), 'ar');
  });

  it('التبديل من لغة الصفحة يحفظ باقي المسار', () => {
    // الوسيط الأول هو لغة الصفحة الحالية، والناتج مسارها في اللغة الأخرى
    assert.equal(
      switchPath('ar', '/ar/store/contract-templates-pack'),
      '/en/store/contract-templates-pack',
    );
    assert.equal(switchPath('en', '/en/booking'), '/ar/booking');
    // الجذر: لا يصير `/en/`
    assert.equal(switchPath('ar', '/ar'), '/en');
    assert.equal(switchPath('en', '/en'), '/ar');
    // استعلام ومرساة يبقيان كما هما
    assert.equal(switchPath('ar', '/ar/store?category=x'), '/en/store?category=x');
  });
});

// ───────────────────── المحتوى بلغتين ─────────────────────

describe('المحتوى بلغتين', () => {
  it('كل منتج له نصّ إنجليزي كامل', () => {
    for (const product of products) {
      const text = productText(product, 'en');
      for (const [field, value] of Object.entries({
        name: text.name,
        summary: text.summary,
        category: text.category,
      })) {
        assert.ok(value && value.length > 1, `${product.slug}: ${field} فارغ`);
        assert.ok(
          !ARABIC_LETTER.test(value),
          `${product.slug}: ${field} عربي في النسخة الإنجليزية (${value})`,
        );
      }
      assert.ok(text.highlights.length > 0, `${product.slug}: لا مزايا إنجليزية`);
      for (const highlight of text.highlights) {
        assert.ok(
          !ARABIC_LETTER.test(highlight),
          `${product.slug}: ميزة عربية في النسخة الإنجليزية`,
        );
      }
      if (product.badge) {
        assert.ok(
          !ARABIC_LETTER.test(text.badge ?? ''),
          `${product.slug}: وسم عربي في النسخة الإنجليزية (${text.badge})`,
        );
      }
    }
  });

  it('كل خدمة لها نصّ إنجليزي', () => {
    for (const service of services) {
      const text = serviceText(service, 'en');
      assert.ok(text.title && !ARABIC_LETTER.test(text.title), `${service.slug}: عنوان`);
      assert.ok(text.short && !ARABIC_LETTER.test(text.short), `${service.slug}: ملخّص`);
    }
  });

  it('كل سؤال شائع له نصّ إنجليزي', () => {
    for (const faq of faqs) {
      const text = faqText(faq, 'en');
      assert.ok(text.question && !ARABIC_LETTER.test(text.question));
      assert.ok(text.answer && !ARABIC_LETTER.test(text.answer));
    }
  });

  it('مقالات المدونة لها عنوان وملخّص إنجليزيان', () => {
    for (const article of articles) {
      assert.ok(article.en.title && !ARABIC_LETTER.test(article.en.title), article.slug);
      assert.ok(article.en.excerpt && !ARABIC_LETTER.test(article.en.excerpt), article.slug);
    }
  });

  it('وثيقتا الخصوصية والشروط موجودتان بكل لغة', () => {
    for (const locale of locales) {
      for (const [name, doc] of Object.entries({
        privacy: privacyPolicy[locale],
        terms: termsOfUse[locale],
      })) {
        assert.ok(doc.title.length > 3, `${name}/${locale}: لا عنوان`);
        assert.ok(doc.sections.length > 0, `${name}/${locale}: لا أقسام`);
        for (const section of doc.sections) {
          assert.ok(section.blocks.length > 0, `${name}/${locale}: قسم فارغ (${section.heading})`);
        }
      }
      if (locale === 'en') {
        assert.ok(!ARABIC_LETTER.test(privacyPolicy.en.title));
        assert.ok(!ARABIC_LETTER.test(termsOfUse.en.title));
      }
    }
  });
});

// ───────────────────── خريطة الموقع ─────────────────────

describe('خريطة الموقع', () => {
  const entries = sitemap();

  it('كل عنوان يحمل بادئة لغة', () => {
    for (const entry of entries) {
      const { pathname } = new URL(entry.url);
      const [, first] = pathname.split('/');
      assert.ok(
        locales.includes(first as (typeof locales)[number]),
        `عنوان بلا بادئة لغة: ${entry.url}`,
      );
    }
  });

  it('كل صفحة موجودة بكل لغة', () => {
    const byLocale = new Map<string, Set<string>>();
    for (const locale of locales) byLocale.set(locale, new Set());
    for (const entry of entries) {
      const { pathname } = new URL(entry.url);
      const [, locale, ...rest] = pathname.split('/');
      byLocale.get(locale!)?.add(`/${rest.join('/')}`);
    }
    const arabic = byLocale.get('ar')!;
    const english = byLocale.get('en')!;
    assert.ok(arabic.size > 10, `عدد الصفحات العربية ${arabic.size}`);
    assert.deepEqual([...arabic].sort(), [...english].sort());
  });

  it('كل مدخل يُصرّح ببديله في اللغة الأخرى و x-default', () => {
    for (const entry of entries) {
      const languages = entry.alternates?.languages ?? {};
      for (const locale of locales) {
        assert.ok(languages[locale], `${entry.url}: لا بديل للغة ${locale}`);
      }
      assert.ok(languages['x-default'], `${entry.url}: لا x-default`);
    }
  });

  it('لا عنوان مكرّر', () => {
    const urls = entries.map((entry) => entry.url);
    assert.equal(new Set(urls).size, urls.length);
  });
});
