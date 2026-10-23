'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import { dict, path, type Locale } from '@/content/i18n';
import { productText, type Product } from '@/content/products';

export function AddToCart({
  product,
  locale,
  size = 'md',
}: {
  product: Product;
  locale: Locale;
  size?: 'sm' | 'md' | 'lg';
}) {
  const { add, lines } = useCart();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);
  const t = dict(locale);
  const text = productText(product, locale);

  // منتج لم يُرفع ملفه بعد: نعرض مساراً للتواصل بدل زر شراء لا يُنتج تسليماً
  if (product.comingSoon) {
    return (
      <a
        href={`${path(locale, '/contact')}?subject=${encodeURIComponent(
          t.storeExtra.notifySubject(text.name),
        )}`}
        className="inline-flex min-h-[48px] w-full items-center justify-center gap-2 rounded-xl border-2 border-navy-900 px-6 py-3 text-[0.95rem] font-semibold text-navy-900 transition-colors hover:bg-navy-900 hover:text-white"
      >
        {t.common.notifyMe}
      </a>
    );
  }

  const alreadyInCart = lines.some((line) => line.slug === product.slug);
  // الاشتراك يُشترى مرة واحدة — لا معنى لزيادة الكمية
  const locked = product.kind === 'subscription' && alreadyInCart;

  function handleAdd() {
    add(product.slug);
    setJustAdded(true);
    window.setTimeout(() => setJustAdded(false), 2200);
  }

  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button
        onClick={handleAdd}
        size={size}
        disabled={locked}
        className="flex-1"
        aria-live="polite"
      >
        {justAdded ? (
          <>
            <Check className="h-4 w-4" />
            {t.storeExtra.addedToCart}
          </>
        ) : locked ? (
          t.storeExtra.subscriptionInCart
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" />
            {t.store.addToCart}
          </>
        )}
      </Button>

      <Button
        variant="gold"
        size={size}
        className="flex-1"
        onClick={() => {
          if (!alreadyInCart) add(product.slug);
          router.push(path(locale, '/checkout'));
        }}
      >
        {t.store.buyNow}
      </Button>
    </div>
  );
}
