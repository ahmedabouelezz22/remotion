import type { Bilingual } from './practice-areas';

/**
 * العضويات: خمس فئات، ولكل فئة باقات تبدأ بعضوية أساسية محدودة المزايا.
 *
 * ⚠️ للمالك — ما هنا **مقترح بنية** لا قرار تجاري:
 *   • المزايا والحدود (نسب الخصم، عدد النماذج، دقائق الاستشارة) تعتمدها أو
 *     تعدّلها أنت؛ غيّرها في هذا الملف وحده.
 *   • الأسعار ونسب الخصم أدناه **مقترحة** بطلب المالك، وتُعدَّل من هذا الملف
 *     أو من منتج العضوية في المتجر. كلما ارتفعت الباقة زادت نسبة الخصم.
 *   • باقات الشركات المدفوعة هي نفسها «باقات الشركات» في المتجر (`productSlug`)
 *     فسعرها ومزاياها يُقرآن من هناك ولا يُكرَّران.
 *
 * لا تَعِد أي باقة بخدمة «غير محدودة»: العضوية تمنح أرصدة وخصومات محدَّدة،
 * وما زاد عليها يُسعَّر منفرداً.
 */

export type AudienceKey = 'individuals' | 'companies' | 'lawyers' | 'law-firms' | 'tourists' | 'team';

export interface MembershipTier {
  key: string;
  name: Bilingual;
  /** 0 = أساسية بلا رسوم · null = لم يُحدَّد السعر بعد · رقم = سعر شهري بالجنيه */
  price: number | null;
  /** إن كانت الباقة منتجاً في المتجر، فسعرها ومزاياها من هناك */
  productSlug?: string;
  /** نسبة خصم العضو على خدمات المتجر ومنتجاته (تُطبَّق تلقائياً في السلة) */
  discount?: number;
  /** باقة تُدفع مرة واحدة عن مدة محدّدة (لا شهري/سنوي) */
  oneTime?: Bilingual;
  /** الباقة التي نُبرزها بصرياً داخل الفئة */
  highlight?: boolean;
  features: Bilingual[];
}

export interface MembershipAudience {
  key: AudienceKey;
  icon: 'user' | 'building' | 'scale' | 'landmark' | 'badge-check' | 'plane';
  name: Bilingual;
  tagline: Bilingual;
  /** ملاحظة تظهر تحت باقات الفئة */
  note?: Bilingual;
  tiers: MembershipTier[];
}

const free = { ar: 'الأساسية', en: 'Basic' };

/**
 * الاشتراك السنوي يُحتسب بعشرة أشهر بدل اثني عشر (توفير شهرين).
 * ⚠️ مقترح ينتظر اعتماد المالك — غيّر الرقم هنا وحده.
 */
export const ANNUAL_MONTHS_CHARGED = 10;
export const annualPrice = (monthly: number) => monthly * ANNUAL_MONTHS_CHARGED;

/** ميزة لم تُطلق بعد: تُعرض بوسم «عند إطلاقها» ولا تُحسب ضمن ما يُباع الآن */
const soon = (ar: string, en: string) => ({ ar: `${ar} (عند إطلاقها)`, en: `${en} (once launched)` });

export const memberships: MembershipAudience[] = [
  {
    key: 'individuals',
    icon: 'user',
    name: { ar: 'الأفراد', en: 'Individuals' },
    tagline: { ar: 'مرجع قانوني قريب منك طوال العام، بخصم يزيد كلما ارتفعت باقتك.', en: 'A legal reference at hand all year, with a discount that grows with your tier.' },
    tiers: [
      {
        key: 'free',
        name: { ar: 'الأساسية', en: 'Basic' },
        price: 0,
        features: [
          { ar: 'قراءة المقالات والمكتبة المفتوحة', en: 'Read the articles and the open library' },
          { ar: 'متابعة طلباتك ومواعيدك من حسابك', en: 'Track your orders and appointments' },
          { ar: 'نشرة التحديثات القانونية', en: 'The legal updates newsletter' },
          { ar: 'الألعاب والألغاز القانونية', en: 'Legal games and puzzles' },
        ],
      },
      {
        key: 'plus',
        name: { ar: 'بلس', en: 'Plus' },
        price: 1500,
        discount: 10,
        highlight: true,
        features: [
          { ar: 'كل مزايا الأساسية', en: 'Everything in Basic' },
          { ar: 'خصم 10% على كل الاستشارات والخدمات والنماذج', en: '10% off all consultations, services and templates' },
          { ar: 'نموذج فوري واحد شهرياً ضمن العضوية', en: 'One instant template a month included' },
          { ar: 'أولوية في حجز المواعيد', en: 'Priority booking' },
          { ar: 'ردّ على استفسار كتابي قصير واحد شهرياً', en: 'One short written enquiry a month' },
          soon('شروحات الأنظمة والتشريعات', 'Plain-language guides to laws'),
        ],
      },
      {
        key: 'premium',
        name: { ar: 'بريميوم', en: 'Premium' },
        price: 3500,
        discount: 20,
        features: [
          { ar: 'كل مزايا بلس', en: 'Everything in Plus' },
          { ar: 'خصم 20% على كل الاستشارات والخدمات والنماذج', en: '20% off all consultations, services and templates' },
          { ar: 'استشارة 30 دقيقة شهرياً ضمن العضوية', en: 'A 30-minute consultation a month included' },
          { ar: 'ثلاثة نماذج فورية شهرياً', en: 'Three instant templates a month' },
          { ar: 'مراجعة مستند واحد حتى 5 صفحات شهرياً', en: 'Review of one document up to 5 pages a month' },
          { ar: 'أولوية في الرد خلال يوم العمل نفسه', en: 'Same-business-day priority response' },
          soon('المساعد القانوني «مُفيد» للأسئلة العامة', 'The “Mufeed” legal assistant'),
          soon('تنبيهات بالتعديلات التشريعية في موضوعاتك', 'Legislative change alerts'),
        ],
      },
      {
        key: 'elite',
        name: { ar: 'النخبة', en: 'Elite' },
        price: 7000,
        discount: 30,
        features: [
          { ar: 'كل مزايا بريميوم', en: 'Everything in Premium' },
          { ar: 'خصم 30% على كل الاستشارات والخدمات والنماذج', en: '30% off all consultations, services and templates' },
          { ar: 'استشارتان 45 دقيقة شهرياً ضمن العضوية', en: 'Two 45-minute consultations a month included' },
          { ar: 'كل النماذج الفورية ضمن العضوية', en: 'All instant templates included' },
          { ar: 'مراجعة مستندين حتى 10 صفحات شهرياً', en: 'Review of two documents up to 10 pages a month' },
          { ar: 'مستشار متابع لملفك', en: 'A dedicated counsel for your file' },
        ],
      },
    ],
  },
  {
    key: 'companies',
    icon: 'building',
    name: { ar: 'الشركات', en: 'Companies' },
    tagline: { ar: 'إدارة قانونية خارجية لمنشأتك بمقابل شهري معلوم بدل أتعاب كل مسألة.', en: 'An outside legal department for a known monthly fee.' },
    note: { ar: 'ما زاد على رصيد الباقة يُسعَّر منفرداً بعرض مكتوب قبل البدء، ويُطبَّق عليه خصم الباقة.', en: 'Work beyond the allowance is quoted separately in writing, less the tier discount.' },
    tiers: [
      {
        key: 'free',
        name: { ar: 'حساب المنشأة', en: 'Company account' },
        price: 0,
        features: [
          { ar: 'حساب للمنشأة لمتابعة الطلبات', en: 'A company account to track orders' },
          { ar: 'قراءة المقالات والمكتبة المفتوحة', en: 'Read the articles and the open library' },
          { ar: 'نشرة التحديثات التنظيمية', en: 'The regulatory updates newsletter' },
        ],
      },
      {
        key: 'basic',
        name: { ar: 'الأساسية', en: 'Basic' },
        price: null,
        discount: 10,
        productSlug: 'package-basic',
        features: [],
      },
      {
        key: 'business',
        name: { ar: 'الأعمال', en: 'Business' },
        price: null,
        discount: 15,
        productSlug: 'package-business',
        highlight: true,
        features: [],
      },
      {
        key: 'premium',
        name: { ar: 'المميزة', en: 'Premium' },
        price: null,
        discount: 25,
        productSlug: 'package-premium',
        features: [],
      },
    ],
  },
  {
    key: 'lawyers',
    icon: 'scale',
    name: { ar: 'المحامون', en: 'Lawyers' },
    tagline: { ar: 'أدوات صياغة ومراجع وفرص تعاون وخصومات على مستلزماتك المهنية.', en: 'Drafting tools, references, collaboration and discounts on professional supplies.' },
    tiers: [
      {
        key: 'free',
        name: { ar: 'الأساسية', en: 'Basic' },
        price: 0,
        features: [
          { ar: 'قراءة المقالات والمكتبة المفتوحة', en: 'Read the articles and the open library' },
          { ar: 'نشرة أحدث التشريعات', en: 'The latest legislation newsletter' },
          { ar: 'طلب الانضمام إلى شبكة المتعاونين', en: 'Apply to join the collaborators’ network' },
          { ar: 'تصفّح سوق مستلزمات المحامين', en: 'Browse the lawyers’ marketplace' },
        ],
      },
      {
        key: 'professional',
        name: { ar: 'المحترف', en: 'Professional' },
        price: 1200,
        discount: 15,
        highlight: true,
        features: [
          { ar: 'كل مزايا الأساسية', en: 'Everything in Basic' },
          { ar: 'خصم 15% على المنتجات الرقمية والخدمات', en: '15% off digital products and services' },
          { ar: 'مكتبة نماذج الصياغة للمحامين', en: 'The drafting template library for lawyers' },
          { ar: 'أولوية في فرص التعاون والإحالة', en: 'Priority for collaboration and referrals' },
          { ar: 'ملف مهني في دليل المتعاونين بعد التحقّق من الترخيص', en: 'A verified professional profile in the directory' },
          { ar: 'عروض الموردين في سوق المستلزمات عند إتاحتها', en: 'Supplier offers in the marketplace when available' },
          soon('مساعد صياغة العقود', 'Contract drafting assistant'),
        ],
      },
      {
        key: 'expert',
        name: { ar: 'الخبير', en: 'Expert' },
        price: 2500,
        discount: 25,
        features: [
          { ar: 'كل مزايا المحترف', en: 'Everything in Professional' },
          { ar: 'خصم 25% على المنتجات الرقمية والخدمات', en: '25% off digital products and services' },
          { ar: 'جلسة مراجعة صياغة شهرية (30 دقيقة)', en: 'A monthly drafting review session (30 minutes)' },
          { ar: 'إسناد أعمال من المؤسسة بحسب تخصّصك', en: 'Work referrals from the firm in your specialty' },
          { ar: 'إبراز ملفك في دليل المتعاونين', en: 'A featured profile in the directory' },
          soon('البحث في المبادئ والأحكام القضائية المتاحة', 'Search of judicial principles'),
          soon('مساعد المذكرات وتنظيم الوقائع', 'Pleadings assistant'),
        ],
      },
    ],
  },
  {
    key: 'law-firms',
    icon: 'landmark',
    name: { ar: 'مكاتب وشركات المحاماة', en: 'Law firms' },
    tagline: { ar: 'عضوية بمقاعد لفريق المكتب، وإسناد أعمال، وتعاون في الأعمال العابرة للحدود.', en: 'Seats for the firm’s team, outsourcing and cross-border collaboration.' },
    tiers: [
      {
        key: 'free',
        name: { ar: 'الأساسية', en: 'Basic' },
        price: 0,
        features: [
          { ar: 'حساب للمكتب', en: 'A firm account' },
          { ar: 'قراءة المقالات والمكتبة المفتوحة', en: 'Read the articles and the open library' },
          { ar: 'طلب الانضمام إلى شبكة الشركاء', en: 'Apply to join the partner network' },
          { ar: 'إسناد أعمال للمؤسسة بعرض سعر لكل عمل', en: 'Outsource work to us on a per-matter quote' },
        ],
      },
      {
        key: 'team',
        name: { ar: 'الفريق', en: 'Team' },
        price: 6000,
        discount: 15,
        highlight: true,
        features: [
          { ar: 'حتى 5 مقاعد لمحامي المكتب', en: 'Up to 5 seats for the firm’s lawyers' },
          { ar: 'خصم 15% على أعمال الإسناد والمنتجات الرقمية', en: '15% off outsourced work and digital products' },
          { ar: 'مكتبة نماذج الصياغة مشتركة للفريق', en: 'The drafting template library shared across the team' },
          { ar: 'التعاون والإحالة في الأعمال العابرة للحدود', en: 'Collaboration and referral on cross-border work' },
          { ar: 'أولوية في مواعيد تسليم أعمال الإسناد', en: 'Priority turnaround on outsourced work' },
          soon('لوحة متابعة طلبات المكتب ومستنداته', 'A dashboard for the firm’s requests'),
        ],
      },
      {
        key: 'firm',
        name: { ar: 'المؤسسة', en: 'Firm' },
        price: 15000,
        discount: 25,
        features: [
          { ar: 'كل مزايا الفريق', en: 'Everything in Team' },
          { ar: 'حتى 15 مقعداً', en: 'Up to 15 seats' },
          { ar: 'خصم 25% على أعمال الإسناد والمنتجات الرقمية', en: '25% off outsourced work and digital products' },
          { ar: 'منسّق مخصَّص لأعمال المكتب', en: 'A dedicated coordinator for the firm’s work' },
          { ar: 'أولوية في شبكة الشركاء والإحالات', en: 'Priority in the partner network and referrals' },
          { ar: 'عروض الموردين في سوق المستلزمات عند إتاحتها', en: 'Supplier offers in the marketplace when available' },
          soon('صلاحيات متعدّدة لأعضاء المكتب', 'Multiple user roles'),
        ],
      },
    ],
  },
  {
    key: 'tourists',
    icon: 'plane',
    name: { ar: 'السياح والزائرون', en: 'Tourists and visitors' },
    tagline: { ar: 'باقات حماية قانونية مدفوعة مسبقاً لمدة رحلتك في مصر: مساندة قانونية حين تحتاجها.', en: 'Prepaid legal protection plans for the length of your trip in Egypt.' },
    note: { ar: 'هذه باقات خدمات قانونية مدفوعة مسبقاً وليست وثيقة تأمين: لا تشمل الغرامات ولا الكفالات ولا الرسوم القضائية ولا أتعاب التمثيل أمام المحاكم، وهذه تُسعَّر منفردة بعرض مكتوب. التمثيل أمام الجهات يتم عبر محامٍ مرخَّص.', en: 'These are prepaid legal service plans, not an insurance policy: fines, bail, court fees and representation fees are excluded and quoted separately.' },
    tiers: [
      {
        key: 'visitor',
        name: { ar: 'الزائر', en: 'Visitor' },
        price: 2500,
        discount: 10,
        oneTime: { ar: 'حتى 15 يوماً', en: 'Up to 15 days' },
        features: [
          { ar: 'خط واتساب للمساندة القانونية بأولوية في الرد', en: 'A priority WhatsApp legal support line' },
          { ar: 'استشارة 30 دقيقة خلال الرحلة', en: 'A 30-minute consultation during the trip' },
          { ar: 'مراجعة عقد واحد (إيجار، حجز، رحلة) قبل التوقيع', en: 'Review of one contract (rental, booking, tour) before signing' },
          { ar: 'إرشاد في إجراءات المحاضر والبلاغات والتواصل مع السفارة', en: 'Guidance on reports, complaints and embassy contact' },
          { ar: 'خصم 10% على أي خدمة إضافية', en: '10% off any additional service' },
        ],
      },
      {
        key: 'traveller',
        name: { ar: 'المسافر بلس', en: 'Traveller Plus' },
        price: 5000,
        discount: 15,
        highlight: true,
        oneTime: { ar: 'حتى 30 يوماً', en: 'Up to 30 days' },
        features: [
          { ar: 'كل مزايا الزائر', en: 'Everything in Visitor' },
          { ar: 'استشارتان 30 دقيقة خلال الرحلة', en: 'Two 30-minute consultations during the trip' },
          { ar: 'مراجعة حتى ثلاثة عقود أو مستندات', en: 'Review of up to three contracts or documents' },
          { ar: 'صياغة شكوى أو مطالبة واحدة (فندق، شركة طيران، تأجير)', en: 'Drafting of one complaint or claim (hotel, airline, rental)' },
          { ar: 'خصم 15% على أي خدمة إضافية', en: '15% off any additional service' },
        ],
      },
      {
        key: 'resident',
        name: { ar: 'الإقامة الممتدة', en: 'Extended stay' },
        price: 9000,
        discount: 20,
        oneTime: { ar: 'حتى 90 يوماً', en: 'Up to 90 days' },
        features: [
          { ar: 'كل مزايا المسافر بلس', en: 'Everything in Traveller Plus' },
          { ar: 'أربع استشارات 30 دقيقة خلال المدة', en: 'Four 30-minute consultations during the period' },
          { ar: 'مراجعة عقد إيجار سكني أو شراء عقار', en: 'Review of a residential lease or property purchase contract' },
          { ar: 'إرشاد في إجراءات الإقامة والتوثيق', en: 'Guidance on residency and notarisation procedures' },
          { ar: 'خصم 20% على أي خدمة إضافية', en: '20% off any additional service' },
        ],
      },
    ],
  },
  {
    key: 'team',
    icon: 'badge-check',
    name: { ar: 'شركاء المؤسسة وفريقها', en: 'Firm partners and team' },
    tagline: { ar: 'لأعضاء فريق المؤسسة وشركائها — وصول بلا مقابل إلى مزايا العضويات المدفوعة.', en: 'For the firm’s team and partners — access to paid benefits at no charge.' },
    note: { ar: 'لا تُفتح هذه العضوية بالتسجيل: تُفعِّلها إدارة المؤسسة لعضو الفريق بعد التحقّق، وتُسحب بانتهاء علاقته بها.', en: 'Not open to sign-up: activated by the firm’s management after verification.' },
    tiers: [
      {
        key: 'team-access',
        name: { ar: 'عضوية الفريق', en: 'Team membership' },
        price: 0,
        highlight: true,
        features: [
          { ar: 'كل مزايا العضويات المدفوعة بلا مقابل', en: 'Every paid membership benefit at no charge' },
          { ar: 'مكتبة نماذج الصياغة والمراجع الداخلية', en: 'The drafting template library and internal references' },
          { ar: 'صلاحيات بحسب دورك داخل المؤسسة', en: 'Permissions according to your role' },
        ],
      },
    ],
  },
];
