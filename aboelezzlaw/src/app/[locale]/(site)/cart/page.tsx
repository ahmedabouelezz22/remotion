'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { resolveLines, useCart } from '@/components/cart-provider';
import { kindLabels } from '@/content/products';
import { formatPrice } from '@/lib/utils';

export default function CartPage() {
  const { lines, setQuantity, remove, clear, subtotal, shipping, total, requiresShipping, ready } =
    useCart();
  const items = resolveLines(lines);

  return (
    <>
      <PageHeader
        eyebrow="السلة"
        title="مراجعة الطلب"
        description="راجع المنتجات والكميات قبل الانتقال إلى الدفع."
      />

      <Section>
        <Container size="wide">
          {!ready ? (
            <p className="py-20 text-center text-slate-500">جارٍ تحميل السلة…</p>
          ) : items.length === 0 ? (
            <Card className="mx-auto max-w-xl py-14 text-center">
              <ShoppingBag className="mx-auto mb-5 h-14 w-14 text-slate-300" />
              <h2 className="mb-2.5 text-xl text-navy-900">سلتك فارغة</h2>
              <p className="mx-auto mb-8 max-w-sm text-sm leading-8 text-slate-600">
                تصفّح المتجر واختر الخدمة التي تناسبك — كل خدمة معروض نطاقها وسعرها مسبقاً.
              </p>
              <ButtonLink href="/store">تصفّح المتجر</ButtonLink>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-4">
                {items.map(({ product, quantity }) => {
                  const fixedQuantity = product.kind === 'subscription';
                  return (
                    <Card key={product.slug}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={`/store/${product.slug}`}
                            className="text-base font-extrabold text-navy-900 transition-colors hover:text-gold-600"
                          >
                            {product.name}
                          </Link>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {kindLabels[product.kind]}
                            {product.billingPeriod ? ` · ${product.billingPeriod}` : ''}
                          </p>
                          <p className="numeric mt-2.5 text-sm font-bold text-navy-800">
                            {formatPrice(product.price, product.currency)}
                          </p>
                        </div>

                        <div className="flex items-center gap-3">
                          {fixedQuantity ? (
                            <span className="numeric rounded-lg border border-sand-200 px-4 py-2 text-sm font-bold text-slate-500">
                              1
                            </span>
                          ) : (
                            <div className="flex items-center rounded-lg border border-sand-200">
                              <button
                                type="button"
                                onClick={() => setQuantity(product.slug, quantity - 1)}
                                className="p-2.5 text-navy-900 transition-colors hover:bg-sand-100"
                                aria-label={`إنقاص كمية ${product.name}`}
                              >
                                <Minus className="h-4 w-4" />
                              </button>
                              <span className="numeric w-10 text-center text-sm font-bold">
                                {quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() => setQuantity(product.slug, quantity + 1)}
                                className="p-2.5 text-navy-900 transition-colors hover:bg-sand-100"
                                aria-label={`زيادة كمية ${product.name}`}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => remove(product.slug)}
                            className="rounded-lg p-2.5 text-red-600 transition-colors hover:bg-red-50"
                            aria-label={`حذف ${product.name} من السلة`}
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>
                    </Card>
                  );
                })}

                <button
                  type="button"
                  onClick={clear}
                  className="text-sm font-bold text-slate-500 underline transition-colors hover:text-red-600"
                >
                  إفراغ السلة
                </button>
              </div>

              <Card className="h-fit lg:sticky lg:top-24">
                <h2 className="mb-5 text-lg text-navy-900">ملخّص الطلب</h2>
                <dl className="space-y-3 border-b border-sand-200 pb-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">المجموع الفرعي</dt>
                    <dd className="numeric font-bold text-navy-900">{formatPrice(subtotal)}</dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">الشحن</dt>
                    <dd className="numeric font-bold text-navy-900">
                      {requiresShipping ? formatPrice(shipping) : 'لا يوجد'}
                    </dd>
                  </div>
                </dl>
                <div className="flex items-baseline justify-between gap-4 py-5">
                  <span className="font-extrabold text-navy-900">الإجمالي</span>
                  <span className="numeric font-display text-2xl font-black text-navy-900">
                    {formatPrice(total)}
                  </span>
                </div>

                <ButtonLink href="/checkout" variant="gold" size="lg" className="w-full">
                  المتابعة إلى الدفع
                </ButtonLink>
                <Link
                  href="/store"
                  className="mt-4 block text-center text-sm font-bold text-slate-500 transition-colors hover:text-navy-900"
                >
                  متابعة التسوّق
                </Link>
              </Card>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
