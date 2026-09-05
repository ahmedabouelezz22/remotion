export interface OrderItem {
  slug: string;
  name: string;
  /** السعر للوحدة بالعملة الأساسية (وحدات كاملة، لا قروش) */
  unitPrice: number;
  quantity: number;
  kind: 'digital' | 'service' | 'subscription' | 'physical';
}

export interface OrderDraft {
  reference: string;
  items: OrderItem[];
  subtotal: number;
  shipping: number;
  total: number;
  currency: string;
  customer: {
    name: string;
    email: string;
    phone: string;
    address?: string;
    city?: string;
    notes?: string;
  };
  requiresShipping: boolean;
}

export type PaymentInitResult =
  | { ok: true; kind: 'redirect'; url: string }
  | { ok: true; kind: 'instructions'; instructions: string }
  | { ok: false; error: string };

export interface PaymentProvider {
  id: 'paymob' | 'paypal' | 'manual';
  label: string;
  description: string;
  /** هل ضُبطت مفاتيح هذا المزوّد في متغيّرات البيئة؟ */
  isConfigured(): boolean;
  createPayment(order: OrderDraft, origin: string): Promise<PaymentInitResult>;
}
