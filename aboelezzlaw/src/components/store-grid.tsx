'use client';

import { useMemo, useState } from 'react';
import Link from 'next/link';
import { Download, FileSignature, Package, RefreshCw } from 'lucide-react';
import { Badge, Card } from '@/components/ui/card';
import { AddToCart } from '@/components/add-to-cart';
import { dict, path, type Locale } from '@/content/i18n';
import {
  categoryLabelsEn,
  productCategories,
  productText,
  type Product,
  type ProductKind,
} from '@/content/products';
import { cn, formatPrice } from '@/lib/utils';

const kindIcon: Record<ProductKind, typeof Download> = {
  digital: Download,
  service: FileSignature,
  subscription: RefreshCw,
  physical: Package,
};

const ALL = '__all__';

/**
 * الكتالوج يأتي من الخادم لا من ملف المحتوى: حالة النشر قد يكون المالك
 * غيّرها من اللوحة، والعميل لا يعرفها.
 */
export function StoreGrid({ catalogue, locale }: { catalogue: Product[]; locale: Locale }) {
  const [category, setCategory] = useState<string>(ALL);
  const t = dict(locale);
  const isArabic = locale === 'ar';

  const kindShort: Record<ProductKind, string> = {
    digital: t.store.instantDownload,
    service: t.store.service,
    subscription: t.store.subscription,
    physical: t.store.shipped,
  };

  const visible = useMemo(
    () => (category === ALL ? catalogue : catalogue.filter((p) => p.category === category)),
    [category, catalogue],
  );

  return (
    <>
      <div className="mb-10 flex flex-wrap gap-2" role="tablist" aria-label={t.store.title}>
        {[ALL, ...productCategories].map((item) => (
          <button
            key={item}
            type="button"
            role="tab"
            aria-selected={category === item}
            onClick={() => setCategory(item)}
            className={cn(
              'rounded-full border px-5 py-2.5 text-sm font-bold transition-all',
              category === item
                ? 'border-navy-900 bg-navy-900 text-white shadow-sm'
                : 'border-sand-200 bg-white text-slate-600 hover:border-gold-500 hover:text-navy-900',
            )}
          >
            {item === ALL
              ? t.store.allCategories
              : isArabic
                ? item
                : (categoryLabelsEn[item] ?? item)}
          </button>
        ))}
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {visible.map((product) => {
          const Icon = kindIcon[product.kind];
          const text = productText(product, locale);
          return (
            <Card key={product.slug} hover className="flex flex-col">
              <div className="mb-4 flex items-start justify-between gap-3">
                <span className="inline-flex items-center gap-1.5 rounded-full bg-navy-900/6 px-3 py-1 text-xs font-bold text-navy-800">
                  <Icon className="h-3.5 w-3.5" />
                  {kindShort[product.kind]}
                </span>
                {product.badge ? (
                  <Badge tone="gold">
                    {product.comingSoon ? t.common.comingSoon : product.badge}
                  </Badge>
                ) : null}
              </div>

              <Link href={path(locale, `/store/${product.slug}`)} className="group">
                <h2 className="mb-2.5 text-lg leading-8 text-navy-900 transition-colors group-hover:text-gold-600">
                  {text.name}
                </h2>
              </Link>
              <p className="mb-6 flex-1 text-sm leading-8 text-slate-600">{text.summary}</p>

              <div className="mb-5 flex items-baseline gap-2.5">
                <span className="numeric font-display text-2xl font-black text-navy-900">
                  {formatPrice(product.price, locale)}
                </span>
                {product.compareAtPrice ? (
                  <span className="numeric text-sm text-slate-500 line-through">
                    {formatPrice(product.compareAtPrice, locale)}
                  </span>
                ) : null}
                {product.billingPeriod ? (
                  <span className="text-xs font-semibold text-slate-500">
                    {t.storeExtra.billingPer(
                      t.storeExtra.billingPeriods[product.billingPeriod] ?? product.billingPeriod,
                    )}
                  </span>
                ) : null}
              </div>

              <AddToCart product={product} locale={locale} size="sm" />

              <Link
                href={path(locale, `/store/${product.slug}`)}
                className="mt-3 inline-flex min-h-[40px] items-center justify-center text-center text-xs font-bold text-slate-500 transition-colors hover:text-navy-900"
              >
                {t.store.viewDetails}
              </Link>
            </Card>
          );
        })}
      </div>

      {visible.length === 0 ? (
        <p className="py-16 text-center text-slate-500">{t.store.emptyCategory}</p>
      ) : null}
    </>
  );
}
