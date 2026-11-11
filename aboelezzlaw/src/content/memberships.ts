import type { Bilingual } from './practice-areas';

/**
 * العضويات: خمس فئات، ولكل فئة باقات تبدأ بمجانية محدودة المزايا.
 *
 * ⚠️ للمالك — ما هنا **مقترح بنية** لا قرار تجاري:
 *   • المزايا والحدود (نسب الخصم، عدد النماذج، دقائق الاستشارة) تعتمدها أو
 *     تعدّلها أنت؛ غيّرها في هذا الملف وحده.
 *   • `price: null` معناها «لم يُحدَّد السعر بعد»: تُعرض الباقة بوسم «قريباً»
 *     وزرّ «سجّل اهتمامك» ولا تُباع. ضع رقماً لتصير قابلة للشراء.
 *   • باقات الشركات المدفوعة هي نفسها «باقات الشركات» في المتجر (`productSlug`)
 *     فسعرها ومزاياها يُقرآن من هناك ولا يُكرَّران.
 *
 * لا تَعِد أي باقة بخدمة «غير محدودة»: العضوية تمنح أرصدة وخصومات محدَّدة،
 * وما زاد عليها يُسعَّر منفرداً.
 */

export type AudienceKey = 'individuals' | 'companies' | 'lawyers' | 'law-firms' | 'team';

export interface MembershipTier {
  key: string;
  name: Bilingual;
  /** 0 = مجانية · null = لم يُحدَّد السعر بعد · رقم = سعر شهري بالجنيه */
  price: number | null;
  /** إن كانت الباقة منتجاً في المتجر، فسعرها ومزاياها من هناك */
  productSlug?: string;
  /** الباقة التي نُبرزها بصرياً داخل الفئة */
  highlight?: boolean;
  features: Bilingual[];
}

export interface MembershipAudience {
  key: AudienceKey;
  icon: 'user' | 'building' | 'scale' | 'landmark' | 'badge-check';
  name: Bilingual;
  tagline: Bilingual;
  /** ملاحظة تظهر تحت باقات الفئة */
  note?: Bilingual;
  tiers: MembershipTier[];
}

const free = { ar: 'المجانية', en: 'Free' };

export const memberships: MembershipAudience[] = [
  {
    key: 'individuals',
    icon: 'user',
    name: { ar: 'الأفراد', en: 'Individuals' },
    tagline: {
      ar: 'لمن يريد مرجعاً قانونياً قريباً دون التزام بقضية.',
      en: 'For those who want a legal reference at hand without committing to a case.',
    },
    tiers: [
      {
        key: 'free',
        name: free,
        price: 0,
        features: [
          { ar: 'قراءة المقالات والمكتبة المفتوحة', en: 'Read the articles and the open library' },
          { ar: 'متابعة طلباتك ومواعيدك من حسابك', en: 'Track your orders and appointments from your account' },
          { ar: 'نشرة التحديثات القانونية', en: 'The legal updates newsletter' },
        ],
      },
      {
        key: 'plus',
        name: { ar: 'بلس', en: 'Plus' },
        price: null,
        highlight: true,
        features: [
          { ar: 'كل مزايا المجانية', en: 'Everything in Free' },
          { ar: 'خصم 10% على الاستشارات والخدمات', en: '10% off consultations and services' },
          { ar: 'نموذج فوري واحد شهرياً ضمن العضوية', en: 'One instant template a month included' },
          { ar: 'أولوية في حجز المواعيد', en: 'Priority when booking appointments' },
        ],
      },
      {
        key: 'premium',
        name: { ar: 'بريميوم', en: 'Premium' },
        price: null,
        features: [
          { ar: 'كل مزايا بلس', en: 'Everything in Plus' },
          { ar: 'خصم 20% على الاستشارات والخدمات', en: '20% off consultations and services' },
          { ar: 'استشارة 30 دقيقة شهرياً ضمن العضوية', en: 'A 30-minute consultation a month included' },
          { ar: 'ثلاثة نماذج فورية شهرياً', en: 'Three instant templates a month' },
          { ar: 'أولوية في الرد على الاستفسارات', en: 'Priority response to enquiries' },
        ],
      },
    ],
  },
  {
    key: 'companies',
    icon: 'building',
    name: { ar: 'الشركات', en: 'Companies' },
    tagline: {
      ar: 'مستشار قانوني للمنشأة بمقابل شهري معلوم بدل أتعاب كل مسألة.',
      en: 'A legal adviser for the business at a known monthly fee instead of a fee per matter.',
    },
    note: {
      ar: 'ما زاد على رصيد الباقة يُسعَّر منفرداً بعرض مكتوب قبل البدء.',
      en: 'Anything beyond the plan’s allowance is quoted separately in writing before work begins.',
    },
    tiers: [
      {
        key: 'free',
        name: free,
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
        productSlug: 'package-basic',
        features: [],
      },
      {
        key: 'business',
        name: { ar: 'الأعمال', en: 'Business' },
        price: null,
        productSlug: 'package-business',
        highlight: true,
        features: [],
      },
      {
        key: 'premium',
        name: { ar: 'المميزة', en: 'Premium' },
        price: null,
        productSlug: 'package-premium',
        features: [],
      },
    ],
  },
  {
    key: 'lawyers',
    icon: 'scale',
    name: { ar: 'المحامون', en: 'Lawyers' },
    tagline: {
      ar: 'أدوات صياغة ومراجع وفرص تعاون للمحامي الممارس.',
      en: 'Drafting tools, references and collaboration opportunities for the practising lawyer.',
    },
    tiers: [
      {
        key: 'free',
        name: free,
        price: 0,
        features: [
          { ar: 'قراءة المقالات والمكتبة المفتوحة', en: 'Read the articles and the open library' },
          { ar: 'نشرة أحدث التشريعات', en: 'The latest legislation newsletter' },
          { ar: 'طلب الانضمام إلى شبكة المتعاونين', en: 'Apply to join the collaborators’ network' },
        ],
      },
      {
        key: 'professional',
        name: { ar: 'المحترف', en: 'Professional' },
        price: null,
        highlight: true,
        features: [
          { ar: 'كل مزايا المجانية', en: 'Everything in Free' },
          { ar: 'مكتبة نماذج الصياغة للمحامين', en: 'The drafting template library for lawyers' },
          { ar: 'خصم 15% على المنتجات الرقمية', en: '15% off digital products' },
          { ar: 'أولوية في فرص التعاون والإحالة', en: 'Priority for collaboration and referral opportunities' },
        ],
      },
      {
        key: 'expert',
        name: { ar: 'الخبير', en: 'Expert' },
        price: null,
        features: [
          { ar: 'كل مزايا المحترف', en: 'Everything in Professional' },
          { ar: 'خصم 25% على المنتجات الرقمية', en: '25% off digital products' },
          { ar: 'جلسة مراجعة صياغة شهرية (30 دقيقة)', en: 'A monthly drafting review session (30 minutes)' },
          { ar: 'محتوى التدريب المهني للأعضاء عند إطلاقه', en: 'Members’ professional training content once launched' },
        ],
      },
    ],
  },
  {
    key: 'law-firms',
    icon: 'landmark',
    name: { ar: 'مكاتب وشركات المحاماة', en: 'Law firms' },
    tagline: {
      ar: 'عضوية بمقاعد لفريق المكتب، وتعاون في الأعمال العابرة للحدود.',
      en: 'A membership with seats for the firm’s team, and collaboration on cross-border work.',
    },
    tiers: [
      {
        key: 'free',
        name: free,
        price: 0,
        features: [
          { ar: 'حساب للمكتب', en: 'A firm account' },
          { ar: 'قراءة المقالات والمكتبة المفتوحة', en: 'Read the articles and the open library' },
          { ar: 'طلب الانضمام إلى شبكة الشركاء', en: 'Apply to join the partner network' },
        ],
      },
      {
        key: 'team',
        name: { ar: 'الفريق', en: 'Team' },
        price: null,
        highlight: true,
        features: [
          { ar: 'حتى 5 مقاعد لمحامي المكتب', en: 'Up to 5 seats for the firm’s lawyers' },
          { ar: 'مكتبة نماذج الصياغة مشتركة للفريق', en: 'The drafting template library shared across the team' },
          { ar: 'خصم 15% على المنتجات الرقمية', en: '15% off digital products' },
          { ar: 'التعاون والإحالة في الأعمال العابرة للحدود', en: 'Collaboration and referral on cross-border work' },
        ],
      },
      {
        key: 'firm',
        name: { ar: 'المؤسسة', en: 'Firm' },
        price: null,
        features: [
          { ar: 'كل مزايا الفريق', en: 'Everything in Team' },
          { ar: 'حتى 15 مقعداً', en: 'Up to 15 seats' },
          { ar: 'خصم 25% على المنتجات الرقمية', en: '25% off digital products' },
          { ar: 'أولوية في شبكة الشركاء', en: 'Priority in the partner network' },
        ],
      },
    ],
  },
  {
    key: 'team',
    icon: 'badge-check',
    name: { ar: 'فريق Law Firm Abo Elezz', en: 'Law Firm Abo Elezz team' },
    tagline: {
      ar: 'لأعضاء فريق المؤسسة — وصول بلا مقابل إلى مزايا العضويات المدفوعة.',
      en: 'For members of the firm’s own team — access to the paid membership benefits at no charge.',
    },
    note: {
      ar: 'لا تُفتح هذه العضوية بالتسجيل: يُفعِّلها المكتب لعضو الفريق بدعوة، وتُسحب بانتهاء علاقته بالمؤسسة.',
      en: 'This membership is not open to sign-up: the firm activates it for a team member by invitation, and it is withdrawn when their relationship with the firm ends.',
    },
    tiers: [
      {
        key: 'team-access',
        name: { ar: 'عضوية الفريق', en: 'Team membership' },
        price: 0,
        highlight: true,
        features: [
          { ar: 'كل مزايا العضويات المدفوعة بلا مقابل', en: 'Every paid membership benefit at no charge' },
          { ar: 'مكتبة نماذج الصياغة والمراجع الداخلية', en: 'The drafting template library and internal references' },
          { ar: 'صلاحيات بحسب دورك داخل المؤسسة', en: 'Permissions according to your role in the firm' },
        ],
      },
    ],
  },
];
