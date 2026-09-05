'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Check, ShoppingBag } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/components/cart-provider';
import type { Product } from '@/content/products';

export function AddToCart({ product, size = 'md' }: { product: Product; size?: 'sm' | 'md' | 'lg' }) {
  const { add, lines } = useCart();
  const router = useRouter();
  const [justAdded, setJustAdded] = useState(false);

  // منتج لم يُرفع ملفه بعد: نعرض مساراً للتواصل بدل زر شراء لا يُنتج تسليماً
  if (product.comingSoon) {
    return (
      <a
        href={`/contact?subject=${encodeURIComponent(`الإشعار عند توفّر: ${product.name}`)}`}
        className="inline-flex w-full items-center justify-center gap-2 rounded-xl border-2 border-navy-900 px-6 py-3 text-[0.95rem] font-semibold text-navy-900 transition-colors hover:bg-navy-900 hover:text-white"
      >
        أبلغني عند التوفّر
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
            أُضيف إلى السلة
          </>
        ) : locked ? (
          'هذا الاشتراك في سلتك'
        ) : (
          <>
            <ShoppingBag className="h-4 w-4" />
            أضف إلى السلة
          </>
        )}
      </Button>

      <Button
        variant="gold"
        size={size}
        className="flex-1"
        onClick={() => {
          if (!alreadyInCart) add(product.slug);
          router.push('/checkout');
        }}
      >
        اشترِ الآن
      </Button>
    </div>
  );
}
