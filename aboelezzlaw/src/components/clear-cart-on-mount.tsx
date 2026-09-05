'use client';

import { useEffect } from 'react';
import { useCart } from '@/components/cart-provider';

/**
 * تُفرَّغ السلة عند الوصول إلى صفحة نجاح الدفع فقط.
 * لو أُفرغت قبل التحويل إلى البوابة لضاعت السلة عند إلغاء العميل للدفع.
 */
export function ClearCartOnMount() {
  const { clear, ready, lines } = useCart();

  useEffect(() => {
    if (ready && lines.length > 0) clear();
  }, [ready, lines.length, clear]);

  return null;
}
