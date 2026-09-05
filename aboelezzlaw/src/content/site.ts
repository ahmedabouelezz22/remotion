/**
 * الإعدادات المركزية للموقع.
 * كل بيانات التواصل والهوية في مكان واحد — عدّل هنا فقط.
 */

export const site = {
  name: 'مكتب أبو العز للمحاماة',
  shortName: 'أبو العز للمحاماة',
  nameEn: 'Abo Elezz Law Firm',
  tagline: 'خدمات قانونية متخصصة عن بُعد في جميع أنحاء العالم',
  description:
    'مكتب أبو العز للمحاماة — خدمات قانونية متخصصة عن بُعد: صياغة ومراجعة العقود، التقاضي والنزاعات، خدمات الشركات والشركات الناشئة، قانون العمل، الامتثال الرقمي، والاستشارات القانونية.',
  url: 'https://aboelezzlaw.com',
  locale: 'ar_EG',
  lang: 'ar',
  dir: 'rtl' as const,

  contact: {
    /** الرقم المحلي كما يُعرض للزائر */
    phoneLocal: '01157844664',
    /** الصيغة الدولية E.164 — تُستخدم في روابط الاتصال وواتساب */
    phoneE164: '+201157844664',
    /** رقم واتساب بدون علامة + (لصيغة wa.me) */
    whatsapp: '201157844664',
    /** البريد الذي تصل إليه إشعارات النماذج */
    email: 'aboelezzlawfirm@gmail.com',
    address: 'خدمات قانونية عن بُعد — في جميع أنحاء العالم العربي',
    /** البريد المعروض للزوار على الموقع */
    publicEmail: 'ahmed@aboelezzlaw.com',
  },

  /** الشعار وصورة المؤسس — مستضافان على CDN الحالي */
  brand: {
    logo: 'https://horizons-cdn.hostinger.com/3a2dd157-d5f5-467f-9e25-3eb199af0c1f/copilot_20251129_000720-lmM10.png',
    founderPhoto:
      'https://horizons-cdn.hostinger.com/3a2dd157-d5f5-467f-9e25-3eb199af0c1f/chatgpt-image-26-o-uo3uo-o---2025o-02_06_21-ou-nYKP6.png',
  },

  social: {
    youtube: 'https://www.youtube.com/@-ahmedaboelezz',
    linkedin: '',
    facebook: '',
    x: '',
  },

  /** ساعات العمل المستخدمة في مُنتقي مواعيد الاستشارة */
  workingHours: {
    /** 0 = الأحد ... 6 = السبت */
    days: [0, 1, 2, 3, 4] as number[],
    startHour: 10,
    endHour: 18,
    slotMinutes: 60,
    timezone: 'Africa/Cairo',
    label: 'من الأحد إلى الخميس، 10:00 ص – 6:00 م (بتوقيت القاهرة)',
  },

  currency: {
    code: 'EGP',
    symbol: 'ج.م',
  },
} as const;

export const waLink = (message?: string) =>
  `https://wa.me/${site.contact.whatsapp}${
    message ? `?text=${encodeURIComponent(message)}` : ''
  }`;

export const navigation = [
  { href: '/', label: 'الرئيسية' },
  { href: '/about', label: 'من نحن' },
  { href: '/services', label: 'الخدمات' },
  { href: '/store', label: 'المتجر' },
  { href: '/blog', label: 'المدونة' },
  { href: '/library', label: 'المكتبة القانونية' },
  { href: '/videos', label: 'الفيديوهات' },
  { href: '/booking', label: 'حجز استشارة' },
  { href: '/contact', label: 'اتصل بنا' },
] as const;
