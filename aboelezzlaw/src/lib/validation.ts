import { z } from 'zod';

const arabicName = z
  .string()
  .trim()
  .min(3, 'الاسم قصير جداً — من فضلك اكتب الاسم كاملاً')
  .max(120, 'الاسم طويل أكثر من اللازم');

const phone = z
  .string()
  .trim()
  .min(8, 'رقم الهاتف غير مكتمل')
  .max(25, 'رقم الهاتف غير صحيح')
  .regex(/^[+()\-\s\d]+$/, 'رقم الهاتف يجب أن يحتوي أرقاماً فقط');

const email = z
  .string()
  .trim()
  .email('البريد الإلكتروني غير صحيح')
  .max(160);

/**
 * حقل فخّ للبوتات: مخفي عن البشر، فامتلاؤه دليل على آلي.
 * لا نرفضه هنا عمداً — المسار هو من يتعامل معه بإرجاع نجاح صامت،
 * حتى لا يتعلّم الآلي أن الفخّ مكشوف فيتفاداه في المحاولة التالية.
 */
const honeypot = z.string().max(200).optional();

export const contactSchema = z.object({
  name: arabicName,
  email,
  phone,
  subject: z.string().trim().min(3, 'اكتب موضوع الرسالة').max(160),
  message: z
    .string()
    .trim()
    .min(20, 'من فضلك اشرح طلبك في 20 حرفاً على الأقل حتى نتمكن من إفادتك')
    .max(5000, 'الرسالة طويلة جداً — أرسل ملخصاً وسنتواصل معك'),
  company: honeypot,
});

export type ContactInput = z.infer<typeof contactSchema>;

export const consultationTypes = [
  'استشارة قانونية عامة',
  'مراجعة أو صياغة عقد',
  'استشارات الشركات والحوكمة',
  'الزكاة والضرائب',
  'منازعات وتحكيم',
  'عقود ولوائح العمل',
  'الملكية الفكرية',
  'أخرى',
] as const;

export const consultationChannels = [
  'مكالمة هاتفية',
  'واتساب',
  'اجتماع مرئي (Zoom / Meet)',
  'حضور بالمكتب',
] as const;

export const bookingSchema = z.object({
  name: arabicName,
  email,
  phone,
  type: z.enum(consultationTypes, { message: 'اختر نوع الاستشارة' }),
  channel: z.enum(consultationChannels, { message: 'اختر وسيلة التواصل المفضلة' }),
  date: z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/, 'اختر تاريخاً صحيحاً')
    .refine((value) => {
      const chosen = new Date(`${value}T00:00:00`);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      return chosen >= today;
    }, 'لا يمكن اختيار تاريخ في الماضي'),
  time: z.string().regex(/^\d{2}:\d{2}$/, 'اختر موعداً من المواعيد المتاحة'),
  details: z
    .string()
    .trim()
    .min(20, 'اكتب ملخصاً للموضوع في 20 حرفاً على الأقل')
    .max(5000),
  company: honeypot,
});

export type BookingInput = z.infer<typeof bookingSchema>;

export const checkoutSchema = z.object({
  name: arabicName,
  email,
  phone,
  /** مطلوب فقط إذا كانت السلة تحتوي منتجاً يُشحن */
  address: z.string().trim().max(400).optional().or(z.literal('')),
  city: z.string().trim().max(80).optional().or(z.literal('')),
  notes: z.string().trim().max(2000).optional().or(z.literal('')),
  method: z.enum(['paymob', 'paypal', 'manual']),
  items: z
    .array(
      z.object({
        slug: z.string().min(1),
        quantity: z.number().int().min(1).max(20),
      }),
    )
    .min(1, 'السلة فارغة'),
  company: honeypot,
});

export type CheckoutInput = z.infer<typeof checkoutSchema>;

/** يحوّل أخطاء zod إلى خريطة { اسم الحقل: أول رسالة } تصلح للعرض تحت كل حقل */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
