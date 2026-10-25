import { manual } from './manual';
import { paymob } from './paymob';
import { paypal } from './paypal';
import type { PaymentProvider } from './types';

export const allProviders: PaymentProvider[] = [paymob, paypal, manual];

/** المزوّدون المتاحون فعلاً حسب المفاتيح المضبوطة في البيئة */
export function enabledProviders(): PaymentProvider[] {
  return allProviders.filter((provider) => provider.isConfigured());
}

export function getProvider(id: string): PaymentProvider | undefined {
  return allProviders.find((provider) => provider.id === id && provider.isConfigured());
}

/** مرجع طلب مقروء وفريد: ABZ-<تاريخ>-<عشوائي> */
export function generateOrderReference(): string {
  const now = new Date();
  const stamp = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('');
  const random = Math.random().toString(36).slice(2, 7).toUpperCase();
  return `ABZ-${stamp}-${random}`;
}

export * from './types';
