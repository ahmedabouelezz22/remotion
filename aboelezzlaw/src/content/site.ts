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
  descriptionEn:
    'Abo Elezz Law Firm — specialist legal services delivered remotely: contract drafting and review, litigation and disputes, corporate and start-up services, employment law, digital compliance, and legal consultancy.',
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
    addressEn: 'Remote legal services — across the Arab world',
    /** البريد المعروض للزوار على الموقع */
    publicEmail: 'ahmed@aboelezzlaw.com',
  },

  /**
   * أصول الهوية — محفوظة في المستودع لا على خادم غيرنا.
   *
   * كانت مستضافة على CDN منصّة Hostinger، فكان الموقع يحمّلها من هناك في كل
   * صفحة: أي أن إيقاف الاشتراك القديم — وهو سبب هذا النقل — كان يُفقد الشعار
   * وصورة المؤسس من الموقع كلّه. وقد تحقّق ذلك فعلاً في فحص المتصفّح: الصور
   * كانت ترجع 500 ولا تُعرض.
   *
   * `logo` الآن علامة مؤقّتة داخل `public/brand/`. استبدلها بشعارك الفعلي:
   * ضع الملف في `public/brand/` وعدّل المسار هنا.
   *
   * `founderPhoto` اختيارية (null). ضع صورتك في `public/brand/` واكتب مسارها
   * هنا لتظهر في صفحة «عن المكتب»؛ وبدونها تُعرض بطاقة نصّية بدلاً منها —
   * ولا تُعرض صورة مكسورة أبداً.
   */
  brand: {
    logo: '/brand/logo.svg',
    founderPhoto: null as string | null,
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

/**
 * التنقّل الرئيسي. التسميات مفاتيح في القاموس لا نصوصاً، فيُترجَم الشريط
 * مع بقيّة الواجهة ولا يبقى عربياً في صفحة إنجليزية.
 */
export const navigation = [
  { href: '/', key: 'home' },
  { href: '/about', key: 'about' },
  { href: '/services', key: 'services' },
  { href: '/store', key: 'store' },
  { href: '/blog', key: 'blog' },
  { href: '/library', key: 'library' },
  { href: '/videos', key: 'videos' },
  { href: '/booking', key: 'booking' },
  { href: '/contact', key: 'contact' },
] as const;

export type NavKey = (typeof navigation)[number]['key'];
