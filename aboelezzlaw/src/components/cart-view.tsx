'use client';

import Link from 'next/link';
import { Minus, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { PageHeader } from '@/components/page-header';
import { ButtonLink } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Container, Section } from '@/components/ui/container';
import { resolveLines, useCart } from '@/components/cart-provider';
import { dict, path, type Locale } from '@/content/i18n';
import { kindLabels, kindLabelsEn, productText } from '@/content/products';
import { formatPrice } from '@/lib/utils';

export function CartView({ locale }: { locale: Locale }) {
  const { lines, setQuantity, remove, clear, subtotal, shipping, total, requiresShipping, ready } =
    useCart();
  const items = resolveLines(lines);
  const t = dict(locale);

  return (
    <>
      <PageHeader
        eyebrow={t.cartPage.eyebrow}
        title={t.cartPage.title}
        description={t.cartPage.description}
      />

      <Section>
        <Container size="wide">
          {!ready ? (
            <p className="py-20 text-center text-slate-500">{t.cartPage.loading}</p>
          ) : items.length === 0 ? (
            <Card className="mx-auto max-w-xl py-14 text-center">
              <ShoppingBag className="mx-auto mb-5 h-14 w-14 text-slate-300" />
              <h2 className="mb-2.5 text-xl text-navy-900">{t.cart.empty}</h2>
              <p className="mx-auto mb-8 max-w-sm text-sm leading-8 text-slate-600">
                {t.cartPage.emptyBody}
              </p>
              <ButtonLink href={path(locale, '/store')}>{t.cart.browseStore}</ButtonLink>
            </Card>
          ) : (
            <div className="grid gap-8 lg:grid-cols-[1.5fr_1fr]">
              <div className="space-y-4">
                {items.map(({ product, quantity }) => {
                  const fixedQuantity = product.kind === 'subscription';
                  const text = productText(product, locale);
                  return (
                    <Card key={product.slug}>
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="min-w-0 flex-1">
                          <Link
                            href={path(locale, `/store/${product.slug}`)}
                            className="text-base font-extrabold text-navy-900 transition-colors hover:text-gold-600"
                          >
                            {text.name}
                          </Link>
                          <p className="mt-1 text-xs font-semibold text-slate-500">
                            {locale === 'ar'
                              ? kindLabels[product.kind]
                              : kindLabelsEn[product.kind]}
                            {product.billingPeriod
                              ? ` · ${t.storeExtra.billingPeriods[product.billingPeriod] ?? product.billingPeriod}`
                              : ''}
                          </p>
                          <p className="numeric mt-2.5 text-sm font-bold text-navy-800">
                            {formatPrice(product.price, locale)}
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
                                aria-label={t.cartPage.decrease(text.name)}
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
                                aria-label={t.cartPage.increase(text.name)}
                              >
                                <Plus className="h-4 w-4" />
                              </button>
                            </div>
                          )}

                          <button
                            type="button"
                            onClick={() => remove(product.slug)}
                            className="rounded-lg p-2.5 text-red-600 transition-colors hover:bg-red-50"
                            aria-label={t.cartPage.removeItem(text.name)}
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
                  {t.cart.clear}
                </button>
              </div>

              <Card className="h-fit lg:sticky lg:top-24">
                <h2 className="mb-5 text-lg text-navy-900">{t.checkout.orderSummary}</h2>
                <dl className="space-y-3 border-b border-sand-200 pb-5 text-sm">
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">{t.cartPage.subtotalLabel}</dt>
                    <dd className="numeric font-bold text-navy-900">
                      {formatPrice(subtotal, locale)}
                    </dd>
                  </div>
                  <div className="flex justify-between gap-4">
                    <dt className="text-slate-600">{t.cart.shipping}</dt>
                    <dd className="numeric font-bold text-navy-900">
                      {requiresShipping ? formatPrice(shipping, locale) : t.cartPage.noShipping}
                    </dd>
                  </div>
                </dl>
                <div className="flex items-baseline justify-between gap-4 py-5">
                  <span className="font-extrabold text-navy-900">{t.cart.total}</span>
                  <span className="numeric font-display text-2xl font-black text-navy-900">
                    {formatPrice(total, locale)}
                  </span>
                </div>

                <ButtonLink
                  href={path(locale, '/checkout')}
                  variant="gold"
                  size="lg"
                  className="w-full"
                >
                  {t.cartPage.proceed}
                </ButtonLink>
                <Link
                  href={path(locale, '/store')}
                  className="mt-4 block min-h-[40px] text-center text-sm font-bold text-slate-500 transition-colors hover:text-navy-900"
                >
                  {t.cart.continueShopping}
                </Link>
              </Card>
            </div>
          )}
        </Container>
      </Section>
    </>
  );
}
