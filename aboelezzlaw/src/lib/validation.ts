import { z } from 'zod';
import { dict, defaultLocale, isLocale, type Locale } from '@/content/i18n';

/**
 * المخطّطات دوالّ تأخذ اللغة لا ثوابت.
 *
 * السبب: رسالة الخطأ يراها الزائر، فيجب أن تكون بلغته. والتحقّق يجري على
 * الخادم (ولا يُوثق بتحقّق المتصفّح وحده)، فالخادم هو من يحتاج القاموس.
 * اللغة تأتي من جسم الطلب لأن المسار لا يعرف من أي صفحة أُرسل النموذج.
 */

/** يقرأ اللغة من جسم الطلب بأمان؛ المجهول يُعامل كالافتراضية */
export function localeFrom(payload: unknown): Locale {
  if (payload && typeof payload === 'object' && 'locale' in payload) {
    const value = (payload as { locale?: unknown }).locale;
    if (typeof value === 'string' && isLocale(value)) return value;
  }
  return defaultLocale;
}

const texts = (locale: Locale) => dict(locale).validation;

const nameField = (locale: Locale) => {
  const v = texts(locale);
  return z.string().trim().min(3, v.nameShort).max(120, v.nameLong);
};

const phoneField = (locale: Locale) => {
  const v = texts(locale);
  return z
    .string()
    .trim()
    .min(8, v.phoneShort)
    .max(25, v.phoneInvalid)
    .regex(/^[+()\-\s\d]+$/, v.phoneDigits);
};

const emailField = (locale: Locale) =>
  z.string().trim().email(texts(locale).emailInvalid).max(160);

/** اللغة حقل اختياري في كل نموذج — وجوده لا يغيّر شيئاً إلا نصّ الرسائل */
const localeField = z.enum(['ar', 'en']).optional();

/**
 * حقل فخّ للبوتات: مخفي عن البشر، فامتلاؤه دليل على آلي.
 * لا نرفضه هنا عمداً — المسار هو من يتعامل معه بإرجاع نجاح صامت،
 * حتى لا يتعلّم الآلي أن الفخّ مكشوف فيتفاداه في المحاولة التالية.
 */
const honeypot = z.string().max(200).optional();

export const contactSchema = (locale: Locale) => {
  const v = texts(locale);
  return z.object({
    name: nameField(locale),
    email: emailField(locale),
    phone: phoneField(locale),
    subject: z.string().trim().min(3, v.subjectRequired).max(160),
    message: z.string().trim().min(20, v.messageShort).max(5000, v.messageLong),
    company: honeypot,
    locale: localeField,
  });
};

export type ContactInput = z.infer<ReturnType<typeof contactSchema>>;

/**
 * قيم أنواع الاستشارة وقنواتها عربية دائماً — وهي ما يُحفظ في القاعدة ويظهر
 * في إشعار المكتب. الترجمة تسمية في الواجهة فقط، فلا تنشأ قيمتان لنفس النوع
 * ولا يقرأ المكتب إشعاراً بلغة لا يستخدمها في سجلّاته.
 */
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

export const bookingSchema = (locale: Locale) => {
  const v = texts(locale);
  return z.object({
    name: nameField(locale),
    email: emailField(locale),
    phone: phoneField(locale),
    type: z.enum(consultationTypes, { message: v.typeRequired }),
    channel: z.enum(consultationChannels, { message: v.channelRequired }),
    date: z
      .string()
      .regex(/^\d{4}-\d{2}-\d{2}$/, v.dateInvalid)
      .refine((value) => {
        const chosen = new Date(`${value}T00:00:00`);
        const today = new Date();
        today.setHours(0, 0, 0, 0);
        return chosen >= today;
      }, v.datePast),
    time: z.string().regex(/^\d{2}:\d{2}$/, v.timeInvalid),
    details: z.string().trim().min(20, v.detailsShort).max(5000),
    company: honeypot,
    locale: localeField,
  });
};

export type BookingInput = z.infer<ReturnType<typeof bookingSchema>>;

export const checkoutSchema = (locale: Locale) =>
  z.object({
  name: nameField(locale),
  email: emailField(locale),
  phone: phoneField(locale),
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
    .min(1, texts(locale).cartEmpty),
  company: honeypot,
  locale: z.enum(['ar', 'en']).optional(),
});

export type CheckoutInput = z.infer<ReturnType<typeof checkoutSchema>>;

/** يحوّل أخطاء zod إلى خريطة { اسم الحقل: أول رسالة } تصلح للعرض تحت كل حقل */
export function fieldErrors(error: z.ZodError): Record<string, string> {
  const result: Record<string, string> = {};
  for (const issue of error.issues) {
    const key = issue.path.join('.') || 'form';
    if (!result[key]) result[key] = issue.message;
  }
  return result;
}
