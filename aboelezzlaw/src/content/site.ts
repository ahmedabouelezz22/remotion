/**
 * الإعدادات المركزية للموقع.
 * كل بيانات التواصل والهوية في مكان واحد — عدّل هنا فقط.
 */

export const site = {
  name: 'مؤسسة أبو العز للمحاماة والاستشارات القانونية',
  shortName: 'مؤسسة أبو العز للمحاماة',
  nameEn: 'Abo Elezz Law Firm',
  /** سطر الحقوق في التذييل */
  copyright: 'جميع الحقوق محفوظة لمؤسسة أبو العز للمحاماة والاستشارات القانونية',
  copyrightEn: 'All rights reserved — Abo Elezz Law Firm',
  tagline: 'منصّة قانونية دولية — إدارة من الجيزة وفريق وخدمات في جميع أنحاء العالم',
  description:
    'مؤسسة أبو العز للمحاماة والاستشارات القانونية — خدمات قانونية متخصصة عن بُعد: صياغة ومراجعة العقود، التقاضي والنزاعات، خدمات الشركات والشركات الناشئة، قانون العمل، الامتثال الرقمي، والاستشارات القانونية.',
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
    /** رقم واتساب الثاني */
    phone2Local: '01201098097',
    phone2E164: '+201201098097',
    whatsapp2: '201201098097',
    /** الهاتف الأرضي — الجيزة (02) */
    landlineLocal: '0238374803',
    landlineE164: '+20238374803',
    /** البريد الذي تصل إليه إشعارات النماذج */
    email: 'aboelezzlawfirm@gmail.com',
    /** البريد الرسمي المعروض للزوار، والبريد البديل */
    publicEmail: 'ahmed@aboelezzlaw.com',
    altEmail: 'aboelezzlawfirm@gmail.com',
    /** مقرّ الإدارة — والفريق والخدمة في جميع أنحاء العالم */
    address: 'الحي الثاني، المجاورة الثامنة، مدينة 6 أكتوبر، الجيزة، مصر',
    addressEn: '8th Neighbourhood, 2nd District, 6th of October City, Giza, Egypt',
    serviceArea: 'خدمات قانونية عن بُعد في جميع أنحاء العالم',
    serviceAreaEn: 'Remote legal services worldwide',
    mapUrl:
      'https://www.google.com/maps/search/?api=1&query=' +
      encodeURIComponent('المجاورة الثامنة الحي الثاني مدينة 6 أكتوبر الجيزة'),
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

  /** حسابات المؤسسة — تظهر في الرأس والتذييل وصفحة التواصل وآخر كل مقال */
  social: {
    facebook: 'https://www.facebook.com/profile.php?id=100075908354254',
    instagram: 'https://www.instagram.com/aboelezzlawfirm/',
    tiktok: 'https://www.tiktok.com/@aboelezzlawfirm',
    x: 'https://x.com/aboelezzlawfirm',
    youtube: 'https://www.youtube.com/@-ahmedaboelezz',
    telegram: 'https://t.me/+cMSuUzL_mJ5mZDA0',
    whatsappChannel: 'https://whatsapp.com/channel/0029Vb9FI94I7BeLXdzU7V0L',
    whatsappGroups: [
      'https://chat.whatsapp.com/I1d00WhNySEBU3JSJcE6IR',
      'https://chat.whatsapp.com/FdoNqtd5Yg15ZnxNuXmbgo',
    ],
    linkedin: 'https://www.linkedin.com/company/abo-elezz-law-firm/',
    snapchat: 'https://www.snapchat.com/add/aboelezzlawfirm',
    threads: 'https://www.threads.com/@aboelezzlawfirm',
  },

  /** ساعات العمل المستخدمة في مُنتقي مواعيد الاستشارة */
  workingHours: {
    /** 0 = الأحد ... 6 = السبت */
    days: [0, 1, 2, 3, 4] as number[],
    startHour: 10,
    endHour: 18,
    slotMinutes: 60,
    timezone: 'Africa/Cairo',
    label: 'استقبال الطلبات على مدار الساعة — والردّ خلال يوم عمل',
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
  { href: '/sectors', key: 'sectors' },
  { href: '/practice-areas', key: 'practiceAreas' },
  { href: '/store', key: 'store' },
  { href: '/memberships', key: 'memberships' },
  { href: '/blog', key: 'blog' },
  { href: '/library', key: 'library' },
  { href: '/videos', key: 'videos' },
  { href: '/booking', key: 'booking' },
  { href: '/contact', key: 'contact' },
] as const;

export type NavKey = (typeof navigation)[number]['key'];
