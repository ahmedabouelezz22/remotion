import { site } from '@/content/site';
import type { OrderDraft, PaymentInitResult, PaymentProvider } from './types';

/**
 * الدفع اليدوي: تحويل بنكي أو Wise أو إنستاباي أو محفظة.
 * يعمل فوراً بلا أي حساب بوابة دفع — وهو الخيار المتاح الآن
 * إلى أن يُفعَّل حساب Paymob.
 *
 * تُضبط البيانات في متغيّرات البيئة حتى لا تُنشر أرقام الحسابات في الكود.
 */

export const manual: PaymentProvider = {
  id: 'manual',
  label: 'تحويل بنكي / إنستاباي / Wise',
  description:
    'أرسل قيمة الطلب بالوسيلة المناسبة لك، ثم أرسل صورة الإيصال على واتساب ليُفعَّل طلبك خلال ساعات العمل.',

  isConfigured() {
    // متاح دائماً — لا يحتاج مفاتيح
    return true;
  },

  async createPayment(order: OrderDraft): Promise<PaymentInitResult> {
    const lines: string[] = [];

    if (process.env.BANK_TRANSFER_DETAILS) {
      lines.push('◾ تحويل بنكي:', process.env.BANK_TRANSFER_DETAILS);
    }
    if (process.env.INSTAPAY_ADDRESS) {
      lines.push('◾ إنستاباي:', process.env.INSTAPAY_ADDRESS);
    }
    if (process.env.WISE_DETAILS) {
      lines.push('◾ Wise (للتحويل من خارج مصر):', process.env.WISE_DETAILS);
    }
    if (process.env.WALLET_NUMBER) {
      lines.push('◾ محفظة إلكترونية:', process.env.WALLET_NUMBER);
    }

    if (lines.length === 0) {
      lines.push(
        `◾ تواصل معنا على واتساب ${site.contact.phoneLocal} وسنرسل لك بيانات التحويل المناسبة.`,
      );
    }

    const instructions = [
      `رقم طلبك: ${order.reference}`,
      `المبلغ المطلوب: ${order.total.toLocaleString('ar-EG')} ${site.currency.symbol}`,
      '',
      ...lines,
      '',
      `بعد التحويل أرسل صورة الإيصال مع رقم الطلب على واتساب: ${site.contact.phoneLocal}`,
    ].join('\n');

    return { ok: true, kind: 'instructions', instructions };
  },
};
