import { NextResponse } from 'next/server';
import { getProduct, SHIPPING_FLAT_RATE } from '@/content/products';
import { site } from '@/content/site';
import { notifyOffice } from '@/lib/notifications/notify';
import { generateOrderReference, getProvider, type OrderDraft, type OrderItem } from '@/lib/payments';
import { createPaypalSubscription, planIdFor } from '@/lib/payments/paypal';
import { createSubscription, saveOrder } from '@/lib/repository';
import { clientIp, rateLimit } from '@/lib/rate-limit';
import { checkoutSchema, fieldErrors } from '@/lib/validation';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const limit = rateLimit(`checkout:${clientIp(request)}`, { limit: 10, windowMs: 10 * 60 * 1000 });
  if (!limit.allowed) {
    return NextResponse.json(
      { ok: false, message: 'محاولات كثيرة. انتظر قليلاً ثم أعد المحاولة.' },
      { status: 429 },
    );
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ ok: false, message: 'صيغة الطلب غير صحيحة.' }, { status: 400 });
  }

  const parsed = checkoutSchema.safeParse(payload);
  if (!parsed.success) {
    return NextResponse.json(
      { ok: false, message: 'راجع بيانات الطلب.', errors: fieldErrors(parsed.error) },
      { status: 400 },
    );
  }

  const input = parsed.data;
  // حقل الفخّ ممتلئ ⇒ آلي. نُظهر نجاحاً كاذباً بلا إنشاء طلب فعلي.
  if (input.company) {
    return NextResponse.json({
      ok: true,
      kind: 'instructions',
      instructions: 'تم استلام الطلب.',
      reference: 'PENDING',
    });
  }

  // الأسعار تُقرأ من الكتالوج على الخادم دائماً — لا يُوثق بأي سعر قادم من المتصفّح
  const items: OrderItem[] = [];
  for (const line of input.items) {
    const product = getProduct(line.slug);
    if (!product) {
      return NextResponse.json(
        { ok: false, message: 'أحد المنتجات في سلتك لم يعد متاحاً. حدّث الصفحة وأعد المحاولة.' },
        { status: 400 },
      );
    }

    if (product.comingSoon) {
      return NextResponse.json(
        {
          ok: false,
          message: `«${product.name}» لم يُطرح للبيع بعد. احذفه من السلة وسنُشعرك فور توفّره.`,
        },
        { status: 400 },
      );
    }
    items.push({
      slug: product.slug,
      name: product.name,
      unitPrice: product.price,
      quantity: product.kind === 'subscription' ? 1 : line.quantity,
      kind: product.kind,
    });
  }

  // الاشتراك المتكرّر لا يصحّ خلطه بمشتريات لمرّة واحدة في معاملة واحدة:
  // البوابة تُنشئ جدول تحصيل دوري للطلب كلّه، فينتهي العميل مشتركاً في كتاب مطبوع.
  const subscriptionItems = items.filter((item) => item.kind === 'subscription');
  if (subscriptionItems.length > 0 && items.length > 1) {
    return NextResponse.json(
      {
        ok: false,
        message:
          'الاشتراك الشهري يُشترى في طلب مستقل. أتمم اشتراكك أولاً ثم اطلب بقية المنتجات في طلب منفصل.',
      },
      { status: 400 },
    );
  }

  const requiresShipping = items.some((item) => item.kind === 'physical');
  if (requiresShipping && (!input.address?.trim() || !input.city?.trim())) {
    return NextResponse.json(
      {
        ok: false,
        message: 'سلتك تحتوي منتجاً يُشحن — من فضلك أدخل عنوان الشحن والمدينة.',
        errors: {
          address: !input.address?.trim() ? 'عنوان الشحن مطلوب' : '',
          city: !input.city?.trim() ? 'المدينة مطلوبة' : '',
        },
      },
      { status: 400 },
    );
  }

  const subtotal = items.reduce((sum, item) => sum + item.unitPrice * item.quantity, 0);
  const shipping = requiresShipping ? SHIPPING_FLAT_RATE : 0;

  const order: OrderDraft = {
    reference: generateOrderReference(),
    items,
    subtotal,
    shipping,
    total: subtotal + shipping,
    currency: site.currency.code,
    customer: {
      name: input.name,
      email: input.email,
      phone: input.phone,
      address: input.address || undefined,
      city: input.city || undefined,
      notes: input.notes || undefined,
    },
    requiresShipping,
  };

  const origin = new URL(request.url).origin;

  // ── مسار الاشتراك المتكرّر (تجديد تلقائي حقيقي عبر PayPal) ──
  const subscriptionItem = subscriptionItems[0];
  const planId = subscriptionItem ? planIdFor(subscriptionItem.slug) : undefined;

  if (subscriptionItem && input.method === 'paypal' && planId) {
    const recurring = await createPaypalSubscription({
      planId,
      reference: order.reference,
      customer: { name: order.customer.name, email: order.customer.email },
      origin,
    });

    if (!recurring.ok) {
      return NextResponse.json({ ok: false, message: recurring.error }, { status: 502 });
    }

    await saveOrder(order, 'paypal-subscription');
    await createSubscription({
      email: order.customer.email,
      name: order.customer.name,
      phone: order.customer.phone,
      productSlug: subscriptionItem.slug,
      period: getProduct(subscriptionItem.slug)?.billingPeriod ?? 'شهري',
      provider: 'paypal',
      providerSubscriptionId: recurring.subscriptionId,
      orderId: order.reference,
    });

    await notifyOffice({
      title: `🔁 اشتراك جديد قيد التفعيل — ${order.reference}`,
      intro: 'بدأ عميل إجراءات اشتراك متكرّر عبر PayPal. يُفعَّل تلقائياً بعد موافقته.',
      fields: [
        { label: 'رقم الطلب', value: order.reference },
        { label: 'العميل', value: order.customer.name },
        { label: 'البريد', value: order.customer.email },
        { label: 'الهاتف', value: order.customer.phone },
        { label: 'الباقة', value: subscriptionItem.name },
        { label: 'معرّف الاشتراك لدى PayPal', value: recurring.subscriptionId },
      ],
    });

    return NextResponse.json({
      ok: true,
      kind: 'redirect',
      url: recurring.approveUrl,
      reference: order.reference,
    });
  }

  const provider = getProvider(input.method);
  if (!provider) {
    return NextResponse.json(
      { ok: false, message: 'وسيلة الدفع المختارة غير متاحة حالياً. اختر وسيلة أخرى.' },
      { status: 400 },
    );
  }

  const payment = await provider.createPayment(order, origin);

  if (!payment.ok) {
    return NextResponse.json({ ok: false, message: payment.error }, { status: 502 });
  }

  await saveOrder(order, provider.id);

  // اشتراك بلا تجديد تلقائي من البوابة: يُسجَّل ويتولّى محرّك التذكيرات تجديده
  if (subscriptionItem) {
    await createSubscription({
      email: order.customer.email,
      name: order.customer.name,
      phone: order.customer.phone,
      productSlug: subscriptionItem.slug,
      period: getProduct(subscriptionItem.slug)?.billingPeriod ?? 'شهري',
      provider: provider.id,
      orderId: order.reference,
    });
  }

  // إشعار المكتب فور إنشاء الطلب — حتى قبل تأكيد الدفع، فالطلب المتروك معلومة مفيدة
  await notifyOffice({
    title: `🛒 طلب جديد ${order.reference}`,
    intro:
      payment.kind === 'instructions'
        ? 'طلب جديد بوسيلة دفع يدوية — بانتظار إيصال التحويل من العميل.'
        : 'طلب جديد تم توجيه العميل فيه إلى بوابة الدفع.',
    fields: [
      { label: 'رقم الطلب', value: order.reference },
      { label: 'العميل', value: order.customer.name },
      { label: 'البريد', value: order.customer.email },
      { label: 'الهاتف', value: order.customer.phone },
      {
        label: 'المنتجات',
        value: order.items
          .map((item) => `${item.name} × ${item.quantity} = ${item.unitPrice * item.quantity} ${order.currency}`)
          .join('\n'),
      },
      { label: 'الشحن', value: shipping > 0 ? `${shipping} ${order.currency}` : 'لا يوجد' },
      { label: 'الإجمالي', value: `${order.total} ${order.currency}` },
      { label: 'وسيلة الدفع', value: provider.label },
      { label: 'حالة الدفع', value: payment.kind === 'instructions' ? 'بانتظار التحويل' : 'بانتظار التأكيد من البوابة' },
      { label: 'عنوان الشحن', value: order.customer.address ?? '' },
      { label: 'المدينة', value: order.customer.city ?? '' },
      { label: 'ملاحظات العميل', value: order.customer.notes ?? '' },
    ],
    client: {
      name: order.customer.name,
      email: order.customer.email,
      phone: order.customer.phone,
      confirmationHeading: `طلبك رقم ${order.reference}`,
      confirmationBody:
        payment.kind === 'instructions'
          ? `${payment.instructions}\n\nسيُفعَّل طلبك فور التحقّق من التحويل.`
          : 'استلمنا طلبك. سنؤكّده فور وصول إشعار الدفع من البوابة.',
    },
  });

  if (payment.kind === 'redirect') {
    return NextResponse.json({
      ok: true,
      kind: 'redirect',
      url: payment.url,
      reference: order.reference,
    });
  }

  return NextResponse.json({
    ok: true,
    kind: 'instructions',
    instructions: payment.instructions,
    reference: order.reference,
  });
}
