/**
 * كتالوج المتجر.
 *
 * ⚠️ تنبيه للمالك: الأسعار أدناه منقولة من المتجر الحالي وهي — بحسب ملاحظتك —
 *    أقل من أسعارك الفعلية. عدّل حقل `price` لكل منتج إلى سعرك الصحيح.
 *    الأسعار تُقرأ من هذا الملف على الخادم عند الدفع، فلا يمكن للعميل التلاعب بها.
 *
 * نوع المنتج (kind) يحدّد سلوك السلة والدفع والتسليم:
 *   service      → خدمة تُنفَّذ يدوياً بعد الدفع
 *   digital      → ملف يُحمَّل فوراً برابط موقّع مؤقّت
 *   subscription → اشتراك دوري (كمية ثابتة = 1)
 *   physical     → نسخة مطبوعة تُشحن وتُحتسب لها أجرة شحن
 */

export type ProductKind = 'digital' | 'service' | 'subscription' | 'physical';

export interface Product {
  slug: string;
  name: string;
  kind: ProductKind;
  category: string;
  price: number;
  compareAtPrice?: number;
  currency: string;
  summary: string;
  description: string;
  highlights: string[];
  /** للمنتجات الرقمية: اسم الملف داخل private/downloads/ */
  file?: string;
  pages?: number;
  durationMinutes?: number;
  billingPeriod?: 'شهري' | 'سنوي';
  featured?: boolean;
  badge?: string;
  /** خدمات تُحجز بموعد تُوجّه إلى صفحة الحجز بعد الشراء */
  requiresBooking?: boolean;
  /**
   * منتج معلن ولم يُرفع ملفه بعد. يُعرض للزائر بوسم «قريباً» ولا يُضاف إلى
   * السلة، ويرفضه الخادم عند الدفع — فلا يدفع أحد ثمن ملف غير موجود.
   */
  comingSoon?: boolean;
  /**
   * الترجمة الإنجليزية — إلزامية فلا يُعرض منتج للبيع بنصف ترجمة.
   * `description` اختيارية لأن بعض المنتجات لا وصف مطوّل لها في الأصل.
   */
  en: {
    name: string;
    summary: string;
    description?: string;
    highlights: string[];
  };
}

/** تسميات التصنيفات بالإنجليزية — القيم تبقى عربية فلا ينقسم التصنيف */
export const categoryLabelsEn: Record<string, string> = {
  'الاستشارات': 'Consultations',
  'الخدمات القانونية': 'Legal services',
  'الامتثال الرقمي': 'Digital compliance',
  'نماذج ووثائق': 'Templates and documents',
  'كتب وأبحاث': 'Books and research',
  'باقات الشركات': 'Corporate retainers',
};

/** تسميات الأوسمة بالإنجليزية — مجموعة مغلقة، والقيمة العربية هي المرجع */
export const badgeLabelsEn: Record<string, string> = {
  'الأكثر طلباً': 'Most requested',
  'تحميل فوري': 'Instant download',
  'قريباً': 'Coming soon',
  'الأنسب للشركات': 'Best for companies',
  'الأشمل': 'Most comprehensive',
};

/** نصّ المنتج بلغة الصفحة */
export function productText(product: Product, locale: 'ar' | 'en') {
  if (locale === 'ar') {
    return {
      name: product.name,
      summary: product.summary,
      description: product.description,
      highlights: product.highlights,
      category: product.category,
      badge: product.badge,
    };
  }
  return {
    name: product.en.name,
    summary: product.en.summary,
    description: product.en.description ?? product.description,
    highlights: product.en.highlights,
    category: categoryLabelsEn[product.category] ?? product.category,
    badge: product.badge ? (badgeLabelsEn[product.badge] ?? product.badge) : undefined,
  };
}

/** أجرة الشحن الثابتة داخل مصر */
export const SHIPPING_FLAT_RATE = 80;

const CONSULTATION_NOTE =
  'تُرسل مستنداتك قبل الجلسة لدراستها، ثم تُعقد الجلسة عبر الهاتف أو اجتماع مرئي، وتُختتم بملخّص مكتوب يتضمّن الرأي والخطوات التالية.';

export const products: Product[] = [
  // ───────────────── الاستشارات ─────────────────
  {
    slug: 'consultation-15',
    name: 'استشارة قانونية — 15 دقيقة',
    kind: 'service',
    category: 'الاستشارات',
    price: 500,
    currency: 'EGP',
    durationMinutes: 15,
    requiresBooking: true,
    summary: 'استشارة سريعة لسؤال محدّد أو رأي عاجل في مسألة واحدة.',
    description: `جلسة قصيرة مخصّصة لسؤال واحد محدّد لا يحتاج دراسة مستندات مطوّلة. ${CONSULTATION_NOTE}`,
    highlights: ['جلسة 15 دقيقة', 'سؤال واحد محدّد', 'رأي مباشر', 'حجز الموعد من صفحة الحجز'],
    en: {
      name: 'Legal consultation — 15 minutes',
      summary: 'A short consultation for one specific question or an urgent view on a single point.',
      highlights: [
        '15-minute session',
        'One specific question',
        'A direct opinion',
        'Book the slot on the booking page',
      ],
    },
  },
  {
    slug: 'consultation-30',
    name: 'استشارة قانونية — 30 دقيقة',
    kind: 'service',
    category: 'الاستشارات',
    price: 900,
    currency: 'EGP',
    durationMinutes: 30,
    requiresBooking: true,
    summary: 'استشارة متوسطة تكفي لمناقشة مسألة مع مراجعة مستند مختصر.',
    description: `جلسة تتّسع لمناقشة المسألة ومراجعة مستند مختصر مرسَل مسبقاً. ${CONSULTATION_NOTE}`,
    highlights: ['جلسة 30 دقيقة', 'مراجعة مستند مختصر', 'ملخّص مكتوب بالرأي'],
    en: {
      name: 'Legal consultation — 30 minutes',
      summary: 'A mid-length consultation, enough to discuss a matter and review a short document.',
      highlights: [
        '30-minute session',
        'Review of a short document',
        'A written summary of the opinion',
      ],
    },
  },
  {
    slug: 'consultation-45',
    name: 'استشارة قانونية — 45 دقيقة',
    kind: 'service',
    category: 'الاستشارات',
    price: 1200,
    currency: 'EGP',
    durationMinutes: 45,
    requiresBooking: true,
    summary: 'استشارة مفصّلة لمسألة متشعّبة أو أكثر من سؤال مترابط.',
    description: `جلسة تتّسع لمسألة متشعّبة أو عدّة أسئلة مترابطة مع مراجعة المستندات. ${CONSULTATION_NOTE}`,
    highlights: ['جلسة 45 دقيقة', 'مراجعة المستندات', 'مناقشة البدائل وأثر كلٍّ منها', 'ملخّص مكتوب'],
    en: {
      name: 'Legal consultation — 45 minutes',
      summary: 'A detailed consultation for a branching matter or several connected questions.',
      highlights: [
        '45-minute session',
        'Document review',
        'Discussion of the alternatives and the effect of each',
        'A written summary',
      ],
    },
  },
  {
    slug: 'consultation-60',
    name: 'استشارة قانونية — 60 دقيقة',
    kind: 'service',
    category: 'الاستشارات',
    price: 1500,
    currency: 'EGP',
    durationMinutes: 60,
    requiresBooking: true,
    featured: true,
    badge: 'الأكثر طلباً',
    summary: 'استشارة شاملة مع دراسة المستندات وخطة عمل مكتوبة.',
    description: `الجلسة الأشمل: دراسة كاملة للمستندات قبل الموعد، ومناقشة الخيارات وأثرها القانوني والمالي، وخطة خطوات تالية مكتوبة. ${CONSULTATION_NOTE}`,
    highlights: [
      'جلسة 60 دقيقة',
      'دراسة كاملة للمستندات قبل الموعد',
      'مناقشة الخيارات وأثرها القانوني والمالي',
      'خطة خطوات تالية مكتوبة',
    ],
    en: {
      name: 'Legal consultation — 60 minutes',
      summary: 'A full consultation with document study and a written plan of action.',
      highlights: [
        '60-minute session',
        'Full study of the documents before the session',
        'Discussion of the options and their legal and financial effect',
        'A written plan of next steps',
      ],
    },
  },

  // ───────────────── الخدمات القانونية ─────────────────
  {
    slug: 'contract-drafting',
    name: 'صياغة عقد',
    kind: 'service',
    category: 'الخدمات القانونية',
    price: 2500,
    currency: 'EGP',
    summary: 'صياغة عقد من الصفر وفق طبيعة العلاقة والقانون الواجب التطبيق.',
    description:
      'صياغة العقد كاملاً بعد استيفاء بيانات الأطراف ومحل التعاقد والالتزامات المتبادلة. تشمل ضبط بنود المسؤولية والإنهاء والقوة القاهرة وتسوية المنازعات، وجولة تعديل واحدة بعد التسليم. السعر المعروض للعقود المعتادة، ويُعاد تقديره للعقود المركّبة بعد الاطّلاع.',
    highlights: [
      'عقد مصاغ من الصفر',
      'ضبط البنود الحرجة (المسؤولية / الإنهاء / القوة القاهرة / المنازعات)',
      'جولة تعديل واحدة بعد التسليم',
      'التسليم خلال 3–5 أيام عمل',
    ],
    featured: true,
    en: {
      name: 'Contract drafting',
      summary: 'A contract drafted from scratch for the nature of the relationship and the applicable law.',
      description:
        'The contract is drafted in full once the parties, the subject matter and the mutual obligations are settled. It covers the liability, termination, force majeure and dispute-resolution clauses, and includes one round of amendments after delivery. The published price is for ordinary contracts; complex contracts are re-quoted after review.',
      highlights: [
        'A contract drafted from scratch',
        'The critical clauses settled (liability / termination / force majeure / disputes)',
        'One round of amendments after delivery',
        'Delivery within 3–5 business days',
      ],
    },
  },
  {
    slug: 'contract-review',
    name: 'مراجعة عقد',
    kind: 'service',
    category: 'الخدمات القانونية',
    price: 800,
    currency: 'EGP',
    summary: 'مراجعة منهجية للعقد قبل التوقيع مع تقرير مخاطر مصنَّف.',
    description:
      'مراجعة تحدّد المخاطر القانونية ومواطن الغموض ومحفّزات النزاع، وتقيس توازن الالتزامات والحقوق بين الطرفين، وتفحص وضوح البنود وقابليتها للتنفيذ واتساقها الداخلي، وتبيّن الحمايات الناقصة، مع اقتراح صياغات بديلة للبنود الحرجة.',
    highlights: [
      'تقرير مخاطر مصنَّف (مرتفع / متوسط / منخفض)',
      'نسخة معلّقة بالتعديلات المقترحة',
      'صياغة بديلة للبنود الحرجة',
      'التسليم خلال 3 أيام عمل',
    ],
    en: {
      name: 'Contract review',
      summary: 'A structured review before signature, with a graded risk report.',
      description:
        'A review that identifies legal risks, ambiguities and dispute triggers, measures the balance of obligations and rights between the parties, examines the clarity, enforceability and internal consistency of the clauses, and sets out the missing protections, with proposed alternative wording for the critical clauses.',
      highlights: [
        'A graded risk report (high / medium / low)',
        'An annotated copy with proposed amendments',
        'Alternative drafting for the critical clauses',
        'Delivery within 3 business days',
      ],
    },
  },
  {
    slug: 'legal-memo',
    name: 'مذكّرة قانونية',
    kind: 'service',
    category: 'الخدمات القانونية',
    price: 1000,
    currency: 'EGP',
    summary: 'مذكّرة مسبَّبة في مسألة محدّدة، مدعّمة بالنصوص والسوابق.',
    description:
      'إعداد مذكّرة قانونية تعرض الوقائع والمسألة محل البحث، وتحلّل النصوص الواجبة التطبيق، وتخلص إلى رأي مسبَّب مع بيان درجة اليقين والمخاطر. تصلح للاستخدام الداخلي أو للتقديم إلى جهة إدارية أو قضائية.',
    highlights: [
      'عرض الوقائع والمسألة محل البحث',
      'تحليل النصوص الواجبة التطبيق',
      'رأي مسبَّب مع بيان درجة اليقين',
      'إحالات إلى المصادر النظامية',
    ],
    en: {
      name: 'Legal memorandum',
      summary: 'A reasoned memorandum on a specific question, supported by the texts and precedents.',
      description:
        'A legal memorandum setting out the facts and the question at issue, analysing the applicable texts, and concluding with a reasoned opinion that states the degree of certainty and the risks. Suitable for internal use or for submission to an administrative or judicial body.',
      highlights: [
        'The facts and the question at issue set out',
        'Analysis of the applicable texts',
        'A reasoned opinion stating the degree of certainty',
        'References to the official sources',
      ],
    },
  },
  {
    slug: 'complaint-drafting',
    name: 'صياغة شكوى أو صحيفة دعوى',
    kind: 'service',
    category: 'الخدمات القانونية',
    price: 1200,
    currency: 'EGP',
    summary: 'صياغة الشكوى أو صحيفة الدعوى بأسانيدها وطلباتها.',
    description:
      'إعداد الشكوى أو صحيفة الدعوى بعد دراسة الوقائع والمستندات: بيان الوقائع، والأساس القانوني للطلبات، وصياغة الطلبات الختامية بدقّة، مع قائمة بالمستندات المؤيّدة.',
    highlights: [
      'دراسة الوقائع والمستندات',
      'بيان الأساس القانوني للطلبات',
      'صياغة دقيقة للطلبات الختامية',
      'قائمة المستندات المؤيّدة',
    ],
    en: {
      name: 'Drafting a complaint or statement of claim',
      summary: 'A complaint or statement of claim drafted with its grounds and its prayers.',
      description:
        'The complaint or statement of claim is prepared after studying the facts and documents: a statement of the facts, the legal basis for the prayers, and precise drafting of the final prayers, with a schedule of supporting documents.',
      highlights: [
        'Study of the facts and documents',
        'A statement of the legal basis for the prayers',
        'Precise drafting of the final prayers',
        'A schedule of supporting documents',
      ],
    },
  },
  {
    slug: 'corporate-bylaws',
    name: 'اللوائح الداخلية للشركات',
    kind: 'service',
    category: 'الخدمات القانونية',
    price: 2000,
    currency: 'EGP',
    summary: 'لائحة داخلية ولائحة جزاءات قابلة للاعتماد لدى الجهات المختصة.',
    description:
      'إعداد اللائحة الداخلية للمنشأة ولائحة الجزاءات بما يتوافق مع القانون الواجب التطبيق: تنظيم ساعات العمل والإجازات والانضباط والتدرّج في الجزاء، بصياغة قابلة للاعتماد أمام الجهة المختصة وقابلة للاحتجاج بها أمام القضاء.',
    highlights: [
      'لائحة داخلية كاملة',
      'لائحة جزاءات متدرّجة',
      'مطابقة للقانون الواجب التطبيق',
      'قابلة للاعتماد لدى الجهة المختصة',
    ],
    en: {
      name: 'Internal company regulations',
      summary: 'Internal regulations and disciplinary rules fit for approval by the competent authorities.',
      description:
        'Preparation of the establishment’s internal regulations and disciplinary rules in conformity with the applicable law: working hours, leave, discipline and the graduation of penalties, drafted so as to be capable of approval before the competent authority and of being relied on before the courts.',
      highlights: [
        'Complete internal regulations',
        'Graduated disciplinary rules',
        'Conformity with the applicable law',
        'Fit for approval by the competent authority',
      ],
    },
  },
  {
    slug: 'nda',
    name: 'اتفاقية عدم إفشاء (NDA)',
    kind: 'service',
    category: 'الخدمات القانونية',
    price: 600,
    currency: 'EGP',
    summary: 'اتفاقية سرّية أحادية أو متبادلة بنطاق ومدة محدّدين.',
    description:
      'صياغة اتفاقية عدم إفشاء تحدّد بدقّة المعلومات السرّية ونطاق استخدامها ومدة الالتزام والاستثناءات والجزاء المترتّب على الإخلال — أحادية الطرف أو متبادلة بحسب طبيعة العلاقة.',
    highlights: [
      'تحديد دقيق للمعلومات السرّية',
      'نطاق الاستخدام والاستثناءات',
      'مدة الالتزام والجزاء عند الإخلال',
      'أحادية أو متبادلة',
    ],
    en: {
      name: 'Non-disclosure agreement (NDA)',
      summary: 'A one-way or mutual confidentiality agreement with a defined scope and term.',
      description:
        'A non-disclosure agreement drafted to define precisely the confidential information, the scope of its use, the term of the obligation, the exceptions and the consequence of breach — one-way or mutual according to the nature of the relationship.',
      highlights: [
        'Precise definition of the confidential information',
        'Scope of use and exceptions',
        'Term of the obligation and the consequence of breach',
        'One-way or mutual',
      ],
    },
  },
  {
    slug: 'privacy-policy',
    name: 'سياسة الخصوصية',
    kind: 'service',
    category: 'الامتثال الرقمي',
    price: 800,
    currency: 'EGP',
    summary: 'سياسة خصوصية مطابقة لمتطلبات حماية البيانات الشخصية.',
    description:
      'إعداد سياسة خصوصية تصف المعالجة الفعلية لبيانات المستخدمين: أنواع البيانات وأغراض المعالجة وأساسها القانوني ومدد الاحتفاظ والجهات المتلقّية وحقوق أصحاب البيانات — لا نسخة عامة منسوخة، بل سياسة مبنية على واقع نشاطك.',
    highlights: [
      'مبنية على المعالجة الفعلية لبياناتك',
      'بيان الأساس القانوني لكل غرض',
      'مدد الاحتفاظ وحقوق أصحاب البيانات',
      'نسخة عربية وإنجليزية عند الطلب',
    ],
    en: {
      name: 'Privacy policy',
      summary: 'A privacy policy that meets personal data protection requirements.',
      description:
        'A privacy policy describing the actual processing of user data: the categories of data, the purposes of processing and their legal basis, retention periods, recipients and the rights of data subjects — not a copied boilerplate, but a policy built on how your business actually operates.',
      highlights: [
        'Built on how your data is actually processed',
        'The legal basis stated for each purpose',
        'Retention periods and data subject rights',
        'Arabic and English versions on request',
      ],
    },
  },
  {
    slug: 'terms-of-service',
    name: 'شروط الاستخدام',
    kind: 'service',
    category: 'الامتثال الرقمي',
    price: 800,
    currency: 'EGP',
    summary: 'شروط استخدام للمنصات الرقمية والمتاجر الإلكترونية.',
    description:
      'صياغة شروط الاستخدام للموقع أو التطبيق أو المتجر الإلكتروني: نطاق الخدمة، والتزامات المستخدم، وحدود المسؤولية، وسياسة الاسترداد، والملكية الفكرية، وآلية تسوية المنازعات والقانون الواجب التطبيق.',
    highlights: [
      'نطاق الخدمة والتزامات المستخدم',
      'حدود المسؤولية وسياسة الاسترداد',
      'الملكية الفكرية',
      'تسوية المنازعات والقانون الواجب التطبيق',
    ],
    en: {
      name: 'Terms of use',
      summary: 'Terms of use for digital platforms and online stores.',
      description:
        'Terms of use drafted for a website, application or online store: the scope of the service, the user’s obligations, limits of liability, the refund policy, intellectual property, and the dispute-resolution mechanism and governing law.',
      highlights: [
        'Scope of the service and the user’s obligations',
        'Limits of liability and the refund policy',
        'Intellectual property',
        'Dispute resolution and governing law',
      ],
    },
  },

  // ───────────────── منتجات رقمية ─────────────────
  {
    slug: 'contract-templates-pack',
    name: 'حزمة نماذج العقود التجارية',
    kind: 'digital',
    category: 'نماذج ووثائق',
    price: 1200,
    compareAtPrice: 1800,
    currency: 'EGP',
    file: 'contract-templates-pack.zip',
    pages: 140,
    featured: true,
    badge: 'تحميل فوري',
    summary: '12 نموذج عقد قابلاً للتحرير مع دليل يشرح البنود الحرجة في كل نموذج.',
    description:
      'حزمة نماذج أُعدّت للاستخدام العملي: عقد توريد، عقد خدمات، اتفاقية عدم إفشاء، عقد عمل، عقد وكالة تجارية، عقد إيجار تجاري، اتفاقية تسوية، عقد استشارات، اتفاقية شراكة، عقد توزيع، إقرار مديونية، ومحضر تسليم. كل نموذج مرفق بشرح للبنود التي تحتاج تعديلاً حسب الحالة وتنبيهات على البنود التي لا يجوز حذفها.',
    highlights: [
      '12 نموذجاً بصيغة Word قابلة للتحرير',
      'دليل استخدام يشرح البنود الحرجة',
      'تنبيهات على المخاطر الشائعة',
      'رابط تحميل فوري بعد الدفع',
    ],
    en: {
      name: 'Commercial contract template pack',
      summary: 'Twelve editable contract templates with a guide explaining the critical clauses in each.',
      description:
        'A pack of templates prepared for practical use: supply contract, services contract, non-disclosure agreement, employment contract, commercial agency contract, commercial lease, settlement agreement, consultancy contract, partnership agreement, distribution contract, acknowledgement of debt, and handover record. Each template comes with an explanation of the clauses that need adapting to the case and warnings on the clauses that must not be deleted.',
      highlights: [
        'Twelve editable templates in Word format',
        'A usage guide explaining the critical clauses',
        'Warnings on the common risks',
        'An instant download link after payment',
      ],
    },
  },
  {
    slug: 'zakat-guide-ebook',
    name: 'دليل تقدير الوعاء الزكوي — نسخة إلكترونية',
    kind: 'digital',
    category: 'كتب وأبحاث',
    price: 450,
    currency: 'EGP',
    file: 'zakat-guide.pdf',
    pages: 210,
    comingSoon: true,
    badge: 'قريباً',
    summary: 'دراسة تطبيقية في أسس تقدير الوعاء الزكوي والاعتراض على الربط التقديري.',
    description:
      'دراسة تجمع التأصيل النظري بالتطبيق العملي: مفهوم الوعاء الزكوي وعناصره، وأسس التقدير، والفرق بين الربط الفعلي والتقديري، وإجراءات الاعتراض والطعن ومواعيدها، مع أمثلة محلولة ونماذج مذكّرات اعتراض.',
    highlights: [
      'نسخة PDF مفهرسة',
      'أمثلة محلولة خطوة بخطوة',
      'نماذج مذكّرات اعتراض',
      'إحالات إلى النصوص النظامية',
    ],
    en: {
      name: 'Guide to assessing the Zakat base — electronic edition',
      summary: 'An applied study of the bases for assessing the Zakat base and objecting to a deemed assessment.',
      description:
        'A study combining theoretical grounding with practical application: the concept of the Zakat base and its elements, the bases of assessment, the difference between actual and deemed assessment, and the objection and appeal procedures and their deadlines, with worked examples and model objection memoranda.',
      highlights: [
        'An indexed PDF',
        'Worked examples, step by step',
        'Model objection memoranda',
        'References to the official texts',
      ],
    },
  },
  {
    slug: 'zakat-guide-print',
    name: 'دليل تقدير الوعاء الزكوي — نسخة مطبوعة',
    kind: 'physical',
    category: 'كتب وأبحاث',
    price: 750,
    currency: 'EGP',
    pages: 210,
    comingSoon: true,
    badge: 'قريباً',
    summary: 'النسخة الورقية من الدليل، تُشحن داخل جمهورية مصر العربية.',
    description:
      'النسخة المطبوعة بغلاف مقوّى وطباعة داخلية واضحة. تُشحن خلال 3–7 أيام عمل داخل مصر. للشحن خارج مصر تواصل معنا لتحديد الأجرة.',
    highlights: [
      'غلاف مقوّى وطباعة واضحة',
      'الشحن داخل مصر خلال 3–7 أيام عمل',
      `أجرة شحن ثابتة ${SHIPPING_FLAT_RATE} ج.م داخل مصر`,
    ],
    en: {
      name: 'Guide to assessing the Zakat base — print edition',
      summary: 'The printed edition of the guide, shipped within the Arab Republic of Egypt.',
      description:
        'The printed edition, hardback with clear interior printing. Shipped within 3–7 business days inside Egypt. For shipping outside Egypt, contact us to agree the carriage.',
      highlights: [
        'Hardback with clear printing',
        'Shipping inside Egypt within 3–7 business days',
      ],
    },
  },

  // ───────────────── الباقات الشهرية ─────────────────
  {
    slug: 'package-basic',
    name: 'الباقة الأساسية',
    kind: 'subscription',
    category: 'باقات الشركات',
    price: 3000,
    currency: 'EGP',
    billingPeriod: 'شهري',
    summary: 'مناسبة للمنشآت الصغيرة التي تحتاج مرجعاً قانونياً منتظماً.',
    description:
      'اشتراك شهري يمنح المنشأة وصولاً منتظماً إلى الاستشارة القانونية دون التفاوض على أتعاب كل مسألة على حدة.',
    highlights: [
      'استشارة شهرية (60 دقيقة)',
      'مراجعة عقد واحد شهرياً',
      'دعم عبر البريد الإلكتروني',
      'رأي قانوني مختصر عند الحاجة',
    ],
    en: {
      name: 'Essential retainer',
      summary: 'Suited to small businesses that need a regular legal point of reference.',
      description:
        'A monthly retainer giving the business regular access to legal advice without negotiating a fee for each matter separately.',
      highlights: [
        'A monthly consultation (60 minutes)',
        'Review of one contract a month',
        'Support by email',
        'A short legal opinion when needed',
      ],
    },
  },
  {
    slug: 'package-business',
    name: 'باقة الأعمال',
    kind: 'subscription',
    category: 'باقات الشركات',
    price: 6000,
    currency: 'EGP',
    billingPeriod: 'شهري',
    featured: true,
    badge: 'الأنسب للشركات',
    summary: 'للمنشآت المتوسطة ذات النشاط التعاقدي المستمر.',
    description:
      'تغطية أوسع تناسب المنشآت التي توقّع عقوداً بصفة منتظمة وتحتاج أولوية في الرد.',
    highlights: [
      'استشارتان شهرياً (60 دقيقة لكل منهما)',
      'مراجعة 3 عقود شهرياً',
      'صياغة عقد واحد شهرياً',
      'أولوية في الرد',
      'مذكّرة قانونية شهرية',
    ],
    en: {
      name: 'Business retainer',
      summary: 'For mid-sized businesses with continuous contractual activity.',
      description:
        'Broader cover suited to businesses that sign contracts regularly and need priority in response.',
      highlights: [
        'Two consultations a month (60 minutes each)',
        'Review of three contracts a month',
        'One contract drafted a month',
        'Priority in response',
        'A monthly legal memorandum',
      ],
    },
  },
  {
    slug: 'package-premium',
    name: 'الباقة المميزة',
    kind: 'subscription',
    category: 'باقات الشركات',
    price: 10000,
    currency: 'EGP',
    billingPeriod: 'شهري',
    badge: 'الأشمل',
    summary: 'مستشار قانوني بدوام فعلي للمنشأة بمقابل شهري ثابت.',
    description:
      'الباقة الأشمل: تغطية قانونية مستمرة للمنشأة مع مدير حساب مخصّص وأولوية قصوى في الاستجابة.',
    highlights: [
      'استشارات غير محدودة',
      'مراجعة عقود غير محدودة',
      'صياغة 3 عقود شهرياً',
      'أولوية قصوى في الاستجابة',
      'أتعاب مخفّضة على التمثيل القانوني',
      'مدير حساب مخصّص',
    ],
    en: {
      name: 'Premium retainer',
      summary: 'In-house legal counsel for the business at a fixed monthly fee.',
      description:
        'The fullest cover: continuous legal support for the business with a dedicated account manager and top priority in response.',
      highlights: [
        'Unlimited consultations',
        'Unlimited contract review',
        'Three contracts drafted a month',
        'Top priority in response',
        'Reduced fees on legal representation',
        'A dedicated account manager',
      ],
    },
  },
];

export const productCategories = Array.from(new Set(products.map((product) => product.category)));

export const getProduct = (slug: string) => products.find((product) => product.slug === slug);

/** المنتجات القابلة للشراء فعلاً — تُستثنى منها المعلنة بـ «قريباً» */
export const purchasableProducts = products.filter((product) => !product.comingSoon);

export const kindLabelsEn: Record<ProductKind, string> = {
  digital: 'Digital product',
  service: 'Legal service',
  subscription: 'Monthly retainer',
  physical: 'Printed edition',
};

export const kindLabels: Record<ProductKind, string> = {
  digital: 'منتج رقمي — تحميل فوري',
  service: 'خدمة قانونية',
  subscription: 'اشتراك شهري',
  physical: 'نسخة مطبوعة — يُشحن',
};
