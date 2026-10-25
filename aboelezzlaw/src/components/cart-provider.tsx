'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { getProduct, products, SHIPPING_FLAT_RATE } from '@/content/products';

export interface CartLine {
  slug: string;
  quantity: number;
}

interface CartContextValue {
  lines: CartLine[];
  /** عدد القطع الإجمالي — يُعرض على أيقونة السلة */
  count: number;
  subtotal: number;
  shipping: number;
  total: number;
  requiresShipping: boolean;
  /** true بعد قراءة السلة من التخزين المحلي — يمنع وميض المحتوى */
  ready: boolean;
  add: (slug: string, quantity?: number) => void;
  setQuantity: (slug: string, quantity: number) => void;
  remove: (slug: string) => void;
  clear: () => void;
}

const CartContext = createContext<CartContextValue | null>(null);
const STORAGE_KEY = 'aboelezz-cart-v1';

export function CartProvider({ children }: { children: ReactNode }) {
  const [lines, setLines] = useState<CartLine[]>([]);
  const [ready, setReady] = useState(false);

  // قراءة السلة مرة واحدة بعد التركيب — localStorage غير متاح أثناء التصيير على الخادم
  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (stored) {
        const parsed = JSON.parse(stored) as CartLine[];
        // نتجاهل أي منتج حُذف من الكتالوج بعد حفظ السلة
        setLines(
          parsed.filter(
            (line) => typeof line?.slug === 'string' && Boolean(getProduct(line.slug)),
          ),
        );
      }
    } catch {
      // تخزين معطّل أو بيانات تالفة — نبدأ بسلة فارغة بدل الانهيار
    }
    setReady(true);
  }, []);

  useEffect(() => {
    if (!ready) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(lines));
    } catch {
      // تجاهل: التخزين قد يكون ممتلئاً أو محظوراً في وضع التصفح الخاص
    }
  }, [lines, ready]);

  const add = useCallback((slug: string, quantity = 1) => {
    const product = getProduct(slug);
    if (!product) return;

    setLines((current) => {
      const existing = current.find((line) => line.slug === slug);
      // الاشتراكات والخدمات لا معنى لتكرارها في السلة
      const singleOnly = product.kind === 'subscription';
      if (existing) {
        if (singleOnly) return current;
        return current.map((line) =>
          line.slug === slug
            ? { ...line, quantity: Math.min(20, line.quantity + quantity) }
            : line,
        );
      }
      return [...current, { slug, quantity: singleOnly ? 1 : quantity }];
    });
  }, []);

  const setQuantity = useCallback((slug: string, quantity: number) => {
    setLines((current) =>
      quantity <= 0
        ? current.filter((line) => line.slug !== slug)
        : current.map((line) =>
            line.slug === slug ? { ...line, quantity: Math.min(20, quantity) } : line,
          ),
    );
  }, []);

  const remove = useCallback((slug: string) => {
    setLines((current) => current.filter((line) => line.slug !== slug));
  }, []);

  const clear = useCallback(() => setLines([]), []);

  const value = useMemo<CartContextValue>(() => {
    const subtotal = lines.reduce((sum, line) => {
      const product = getProduct(line.slug);
      return product ? sum + product.price * line.quantity : sum;
    }, 0);

    const requiresShipping = lines.some(
      (line) => getProduct(line.slug)?.kind === 'physical',
    );
    const shipping = requiresShipping ? SHIPPING_FLAT_RATE : 0;

    return {
      lines,
      count: lines.reduce((sum, line) => sum + line.quantity, 0),
      subtotal,
      shipping,
      total: subtotal + shipping,
      requiresShipping,
      ready,
      add,
      setQuantity,
      remove,
      clear,
    };
  }, [lines, ready, add, setQuantity, remove, clear]);

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart(): CartContextValue {
  const context = useContext(CartContext);
  if (!context) throw new Error('useCart يجب أن يُستخدم داخل CartProvider');
  return context;
}

/** أدوات مشتركة للتعامل مع أسطر السلة خارج الـ context */
export function resolveLines(lines: CartLine[]) {
  return lines
    .map((line) => {
      const product = products.find((item) => item.slug === line.slug);
      return product ? { product, quantity: line.quantity } : null;
    })
    .filter((entry): entry is { product: (typeof products)[number]; quantity: number } =>
      Boolean(entry),
    );
}
