/**
 * الخدمات بلغتيها.
 *
 * النصّ الإنجليزي ترجمة تحريرية للعربي لا نقل حرفي: المصطلح القانوني
 * يُترجَم إلى مقابله المستخدم في الإنجليزية القانونية لا إلى أقرب كلمة.
 * الحقول الإنجليزية إلزامية في النوع، فلا تُضاف خدمة بلا ترجمتها.
 */
export interface ServiceText {
  title: string;
  short: string;
  description: string;
  deliverables: string[];
  audience: string;
}

export interface Service extends ServiceText {
  slug: string;
  icon: string;
  en: ServiceText;
}

/** نصّ الخدمة بلغة محدّدة */
export const serviceText = (service: Service, locale: 'ar' | 'en'): ServiceText =>
  locale === 'ar'
    ? {
        title: service.title,
        short: service.short,
        description: service.description,
        deliverables: service.deliverables,
        audience: service.audience,
      }
    : service.en;

export const services: Service[] = [
  {
    slug: 'corporate-advisory',
    title: 'الاستشارات القانونية للشركات',
    short: 'مواكبة قانونية دائمة لقرارات الشركة وهيكلها وحوكمتها.',
    icon: 'building',
    description:
      'مساندة قانونية مستمرة تغطّي تأسيس الكيانات واختيار الشكل القانوني الأنسب، وإعداد عقود التأسيس والأنظمة الأساسية، وضبط قرارات الجمعيات العامة ومجالس الإدارة، ومراجعة السياسات الداخلية بما يتوافق مع القانون المصري ونظام الشركات السعودي.',
    deliverables: [
      'رأي قانوني مكتوب ومُسبَّب في المسألة المعروضة',
      'مراجعة الهيكل القانوني للكيان واقتراح التعديلات',
      'إعداد أو مراجعة محاضر واجتماعات الجمعية العامة ومجلس الإدارة',
      'خريطة الالتزامات التنظيمية ومواعيدها',
    ],
    audience: 'الشركات الناشئة والمتوسطة، والمجموعات العاملة في مصر والسعودية',
    en: {
      title: 'Corporate legal advisory',
      short: 'Continuous legal cover for the company’s decisions, structure and governance.',
      description:
        'Ongoing legal support covering incorporation and the choice of the most suitable legal form, preparation of constitutive documents and articles of association, the proper conduct of general assembly and board resolutions, and review of internal policies for compliance with Egyptian law and the Saudi Companies Law.',
      deliverables: [
        'A written, reasoned legal opinion on the matter referred',
        'Review of the entity’s legal structure with proposed amendments',
        'Preparation or review of general assembly and board minutes and meetings',
        'A map of regulatory obligations and their deadlines',
      ],
      audience: 'Start-ups and mid-sized companies, and groups operating in Egypt and Saudi Arabia',
    },
  },
  {
    slug: 'contract-review',
    title: 'مراجعة وصياغة العقود',
    short: 'قراءة العقد كما يقرؤه القاضي — قبل أن يصل إليه.',
    icon: 'file-text',
    description:
      'مراجعة منهجية تحدّد المخاطر القانونية ومواطن الغموض ومحفّزات النزاع، وتقيس توازن الالتزامات والحقوق والمسؤوليات بين الطرفين، وتفحص مدى وضوح البنود وقابليتها للتنفيذ واتساقها الداخلي، مع بيان الحمايات الناقصة واقتراح صياغات بديلة دقيقة.',
    deliverables: [
      'تقرير مراجعة يصنّف الملاحظات حسب درجة الخطورة',
      'نسخة معلّقة من العقد بالتعديلات المقترحة',
      'صياغة بديلة للبنود الحرجة (المسؤولية، الإنهاء، القوة القاهرة، تسوية المنازعات)',
      'مذكّرة موقف تفاوضي عند الطلب',
    ],
    audience: 'الشركات والأفراد المقبلون على توقيع عقد ذي أثر مالي معتبر',
    en: {
      title: 'Contract review and drafting',
      short: 'Reading the contract the way a judge would — before it reaches one.',
      description:
        'A structured review that identifies legal risks, ambiguities and dispute triggers, measures the balance of obligations, rights and liabilities between the parties, and examines the clarity, enforceability and internal consistency of the clauses, setting out missing protections and proposing precise alternative wording.',
      deliverables: [
        'A review report classifying findings by severity',
        'An annotated copy of the contract with proposed amendments',
        'Alternative drafting for the critical clauses (liability, termination, force majeure, dispute resolution)',
        'A negotiating-position memorandum on request',
      ],
      audience: 'Companies and individuals about to sign a contract with material financial effect',
    },
  },
  {
    slug: 'zakat-tax',
    title: 'الزكاة والضرائب',
    short: 'امتثال ضريبي وزكوي مبنيّ على النصوص لا على الاجتهاد.',
    icon: 'calculator',
    description:
      'استشارات في الوعاء الزكوي وأسس تقديره، والتعامل مع الربوط التقديرية والاعتراض عليها، ومسائل ضريبة القيمة المضافة والفوترة الإلكترونية، وإعداد المذكّرات أمام لجان الطعن، مع مراعاة الفروق بين المنظومة المصرية والسعودية.',
    deliverables: [
      'تحليل الوضع الزكوي/الضريبي الحالي وتحديد مواطن المخاطرة',
      'مذكّرة اعتراض أو طعن مدعّمة بالنصوص والقرارات',
      'مراجعة الالتزامات الإجرائية ومواعيدها',
      'تقدير الأثر المالي للسيناريوهات البديلة',
    ],
    audience: 'المنشآت الخاضعة للزكاة أو الضريبة في مصر والسعودية',
    en: {
      title: 'Zakat and tax',
      short: 'Compliance built on the texts, not on guesswork.',
      description:
        'Advice on the Zakat base and the bases for assessing it, dealing with and objecting to deemed assessments, value-added tax and e-invoicing questions, and preparation of memoranda before appeal committees, with attention to the differences between the Egyptian and Saudi regimes.',
      deliverables: [
        'Analysis of the current Zakat/tax position and identification of risk areas',
        'An objection or appeal memorandum supported by the texts and decisions',
        'Review of procedural obligations and their deadlines',
        'Estimated financial impact of alternative scenarios',
      ],
      audience: 'Entities subject to Zakat or tax in Egypt and Saudi Arabia',
    },
  },
  {
    slug: 'labour-law',
    title: 'عقود ولوائح العمل',
    short: 'علاقة عمل موثّقة تحمي المنشأة والعامل معاً.',
    icon: 'users',
    description:
      'إعداد عقود العمل واللوائح الداخلية ولوائح الجزاءات، ومعالجة إنهاء الخدمة وحساب المستحقات، وتقييم مخاطر الدعاوى العمالية، وتسوية المنازعات ودّياً قبل التقاضي.',
    deliverables: [
      'نماذج عقود عمل مطابقة للقانون الواجب التطبيق',
      'لائحة داخلية ولائحة جزاءات قابلة للاعتماد',
      'رأي في مشروعية الإنهاء وحساب المستحقات',
      'تمثيل في التسويات الودّية',
    ],
    audience: 'أصحاب الأعمال وإدارات الموارد البشرية',
    en: {
      title: 'Employment contracts and workplace policies',
      short: 'A documented employment relationship that protects employer and employee alike.',
      description:
        'Preparation of employment contracts, internal regulations and disciplinary rules, handling termination and the calculation of entitlements, assessment of employment-claim exposure, and amicable settlement of disputes before litigation.',
      deliverables: [
        'Employment contract templates compliant with the applicable law',
        'Internal regulations and disciplinary rules ready for adoption',
        'An opinion on the lawfulness of a termination and the calculation of entitlements',
        'Representation in amicable settlements',
      ],
      audience: 'Business owners and HR departments',
    },
  },
  {
    slug: 'disputes-arbitration',
    title: 'المنازعات والتحكيم',
    short: 'تقدير واقعي لفرص النزاع قبل خوضه.',
    icon: 'scale',
    description:
      'دراسة مركز الموكّل القانوني وتقدير فرص النجاح، وإعداد المذكّرات وصحف الدعاوى، وصياغة شروط التحكيم ومتابعة الإجراءات، وبحث بدائل التقاضي حين تكون أجدى اقتصادياً.',
    deliverables: [
      'مذكّرة تقييم مركز قانوني مع تقدير للمخاطر',
      'إعداد صحف الدعاوى والمذكّرات',
      'صياغة شرط التحكيم أو اتفاق التحكيم',
      'خطة تفاوض للتسوية',
    ],
    audience: 'أطراف النزاعات التجارية والمدنية',
    en: {
      title: 'Disputes and arbitration',
      short: 'A realistic assessment of a dispute’s prospects before entering it.',
      description:
        'Assessment of the client’s legal position and prospects of success, preparation of memoranda and statements of claim, drafting arbitration clauses and conducting proceedings, and examining alternatives to litigation where they are economically sounder.',
      deliverables: [
        'A position-assessment memorandum with a risk estimate',
        'Preparation of statements of claim and memoranda',
        'Drafting of the arbitration clause or arbitration agreement',
        'A negotiation plan for settlement',
      ],
      audience: 'Parties to commercial and civil disputes',
    },
  },
  {
    slug: 'regulatory-compliance',
    title: 'الامتثال والتنظيم',
    short: 'قراءة الإطار التنظيمي قبل أن يقرأك المنظِّم.',
    icon: 'shield-check',
    description:
      'تحليل الأطر التنظيمية المؤثرة على النشاط — بما فيها حماية البيانات الشخصية وحماية المستهلك والاشتراطات القطاعية — وبناء سياسات امتثال عملية، مع اهتمام خاص بالأطر التنظيمية والاقتصادية للاقتصاد الدائري والاستدامة.',
    deliverables: [
      'خريطة الالتزامات التنظيمية للنشاط',
      'سياسات وإجراءات امتثال مكتوبة',
      'تقييم فجوات مقارَن بالمتطلبات النظامية',
      'مذكّرات تفسيرية للأحكام محل الإشكال',
    ],
    audience: 'الشركات الخاضعة لتنظيم قطاعي أو المتوسّعة في أسواق جديدة',
    en: {
      title: 'Compliance and regulation',
      short: 'Reading the regulatory framework before the regulator reads you.',
      description:
        'Analysis of the regulatory frameworks bearing on the business — including personal data protection, consumer protection and sector-specific requirements — and the construction of workable compliance policies, with particular attention to the regulatory and economic frameworks of the circular economy and sustainability.',
      deliverables: [
        'A map of the regulatory obligations applying to the business',
        'Written compliance policies and procedures',
        'A gap assessment measured against the statutory requirements',
        'Interpretive memoranda on provisions that raise difficulty',
      ],
      audience: 'Companies under sector regulation or expanding into new markets',
    },
  },
];

export const getService = (slug: string) => services.find((service) => service.slug === slug);
