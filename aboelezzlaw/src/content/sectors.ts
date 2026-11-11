/**
 * كتالوج القطاعات — المستوى الأول من ثلاثة: قطاع ← مجال ممارسة ← خدمة.
 *
 * كل قطاع عنصر بيانات لا صفحة مكتوبة باليد: إضافة قطاع جديد تعني إضافة
 * عنصر هنا فقط، فيظهر في القائمة المنسدلة وصفحة الفهرس وصفحته الخاصة
 * وخريطة الموقع معاً. وهذا نفسه شكل البيانات الذي يُنقل إلى نوع محتوى
 * مخصّص في ووردبريس (قطاع = Term، خدمة = Post مرتبط بأكثر من قطاع).
 *
 * الخدمات المذكورة تُنفَّذ بفريق المكتب وبالتعاون مع مختصّين مرخَّصين في كل
 * ولاية قضائية حيث يلزم — والنصّ في الصفحة يقول ذلك صراحةً.
 */

export type SectorIcon =
  | 'car'
  | 'hard-hat'
  | 'fuel'
  | 'heart-pulse'
  | 'building'
  | 'landmark'
  | 'cpu'
  | 'palette'
  | 'megaphone'
  | 'ship'
  | 'plane'
  | 'factory'
  | 'wheat'
  | 'shopping-bag'
  | 'hotel'
  | 'trophy'
  | 'graduation-cap'
  | 'umbrella'
  | 'gavel'
  | 'heart-handshake'
  | 'leaf'
  | 'droplets'
  | 'shirt'
  | 'rocket'
  | 'shield'
  | 'truck'
  | 'briefcase';

export interface SectorText {
  name: string;
  summary: string;
  services: string[];
}

export interface Sector extends SectorText {
  slug: string;
  icon: SectorIcon;
  /** يظهر في القائمة المنسدلة والصفحة الرئيسية ضمن القطاعات الأبرز */
  featured?: boolean;
  en: SectorText;
}

export const sectors: Sector[] = [
  {
    slug: 'automotive',
    icon: 'car',
    featured: true,
    name: 'السيارات والتنقّل',
    summary:
      'نخدم سلسلة صناعة السيارات كاملة: المصنّع والمورّد والمستورد والوكيل والموزّع ومركز الخدمة وشركات التنقّل.',
    services: [
      'عقود الوكالة والتوزيع والامتياز التجاري',
      'عقود التصنيع والتجميع وتوريد المركبات وقطع الغيار',
      'الضمان وعيوب الصناعة وخدمات ما بعد البيع',
      'حملات الاستدعاء والنشرات الفنية وسلامة المركبات',
      'المسؤولية عن المنتج ومطالباتها',
      'نزاعات الوكلاء والمصنّعين والمورّدين',
      'الاستيراد والجمارك والامتثال للمواصفات الفنية',
      'المركبات الكهربائية والبطاريات ومحطات الشحن',
      'التمويل والتأجير التمويلي وإدارة الأساطيل',
      'المركبات المتصلة وبيانات المركبات',
    ],
    en: {
      name: 'Automotive & Mobility',
      summary:
        'We serve the whole automotive chain: manufacturer, supplier, importer, agent, distributor, service centre and mobility companies.',
      services: [
        'Agency, distribution and franchise agreements',
        'Manufacturing, assembly and supply of vehicles and spare parts',
        'Warranty, manufacturing defects and after-sales service',
        'Recall campaigns, technical service bulletins and vehicle safety',
        'Product liability and related claims',
        'Disputes between agents, manufacturers and suppliers',
        'Import, customs and compliance with technical standards',
        'Electric vehicles, batteries and charging stations',
        'Financing, finance leasing and fleet management',
        'Connected vehicles and vehicle data',
      ],
    },
  },
  {
    slug: 'construction',
    icon: 'hard-hat',
    featured: true,
    name: 'الإنشاءات والهندسة والبنية التحتية',
    summary:
      'للمقاولين والمطوّرين والاستشاريين والملّاك والمموّلين: من صياغة العقد وإدارة مخاطره إلى المطالبة والتحكيم.',
    services: [
      'عقود فيديك (FIDIC) وإدارة مخاطرها',
      'عقود EPC و EPCM والتصميم والتنفيذ وتسليم المفتاح',
      'عقود المقاولين من الباطن والتصميم والإشراف',
      'إدارة المطالبات التعاقدية',
      'مطالبات التأخير والتعطيل وتمديد مدة التنفيذ (EOT)',
      'أوامر التغيير والمستخلصات ونزاعات السداد',
      'التعويضات وتقدير الخسائر والأضرار',
      'العيوب الفنية وفترة ضمان العيوب',
      'مجالس فضّ المنازعات (DAB/DAAB) والتحكيم الهندسي',
      'الشراكة بين القطاعين العام والخاص ومشروعات البنية التحتية',
    ],
    en: {
      name: 'Construction, Engineering & Infrastructure',
      summary:
        'For contractors, developers, consultants, owners and financiers: from drafting the contract and managing its risk to the claim and the arbitration.',
      services: [
        'FIDIC contracts and their risk management',
        'EPC, EPCM, design-and-build and turnkey contracts',
        'Subcontracts, design and supervision agreements',
        'Contractual claims management',
        'Delay and disruption claims and extension of time (EOT)',
        'Variations, interim payments and payment disputes',
        'Quantum and assessment of loss and damages',
        'Technical defects and the defects liability period',
        'Dispute boards (DAB/DAAB) and construction arbitration',
        'Public-private partnerships and infrastructure projects',
      ],
    },
  },
  {
    slug: 'energy',
    icon: 'fuel',
    featured: true,
    name: 'النفط والغاز والطاقة',
    summary:
      'لشركات النفط ومقدّمي الخدمات والمقاولين والمستثمرين ومشغّلي محطات الطاقة، على امتداد دورة المشروع.',
    services: [
      'عقود الاستكشاف والإنتاج والامتياز والتراخيص',
      'عقود الحفر والخدمات البترولية',
      'عقود EPC و EPCI لمشروعات الطاقة',
      'توريد النفط والغاز والمنتجات البترولية والغاز المسال',
      'اتفاقيات شراء الطاقة (PPA)',
      'الطاقة المتجددة: الشمس والرياح وتخزين الطاقة',
      'الهيدروجين والأمونيا منخفضة الكربون',
      'التعدين والمعادن الحرجة',
      'تمويل مشروعات الطاقة',
      'الامتثال البيئي والسلامة ومنازعات الطاقة',
    ],
    en: {
      name: 'Oil, Gas & Energy',
      summary:
        'For oil companies, service providers, contractors, investors and power-plant operators, across the life of the project.',
      services: [
        'Exploration and production, concession and licensing agreements',
        'Drilling and oilfield services contracts',
        'EPC and EPCI contracts for energy projects',
        'Supply of oil, gas, petroleum products and LNG',
        'Power purchase agreements (PPA)',
        'Renewable energy: solar, wind and energy storage',
        'Hydrogen and low-carbon ammonia',
        'Mining and critical minerals',
        'Energy project finance',
        'Environmental compliance, safety and energy disputes',
      ],
    },
  },
  {
    slug: 'healthcare',
    icon: 'heart-pulse',
    featured: true,
    name: 'الرعاية الصحية وعلوم الحياة',
    summary:
      'منظومة الأعمال الصحية كاملة، لا قضايا الأخطاء الطبية وحدها: المستشفيات والممارسون وشركات الأدوية والأجهزة.',
    services: [
      'عقود إدارة وتشغيل المستشفيات والمراكز الطبية',
      'عقود الأطباء والاستشاريين والامتيازات الطبية',
      'المسؤولية الطبية والأخطاء المهنية',
      'التراخيص الصحية والامتثال التنظيمي',
      'حماية بيانات المرضى والسرّية الطبية',
      'الطب عن بُعد والصحة الرقمية',
      'تسجيل الأدوية والأجهزة الطبية وعقود توزيعها',
      'التجارب السريرية والبحوث الطبية',
      'منازعات المستشفيات والأطباء وشركات التأمين',
    ],
    en: {
      name: 'Healthcare & Life Sciences',
      summary:
        'The whole healthcare business, not malpractice cases alone: hospitals, practitioners, and pharmaceutical and device companies.',
      services: [
        'Management and operation agreements for hospitals and medical centres',
        'Contracts for physicians and consultants, and medical privileges',
        'Medical liability and professional negligence',
        'Healthcare licensing and regulatory compliance',
        'Patient data protection and medical confidentiality',
        'Telemedicine and digital health',
        'Registration of medicines and medical devices and their distribution agreements',
        'Clinical trials and medical research',
        'Disputes between hospitals, physicians and insurers',
      ],
    },
  },
  {
    slug: 'real-estate',
    icon: 'building',
    featured: true,
    name: 'العقارات والأصول والمرافق',
    summary:
      'للمطوّرين والمستثمرين والملّاك ومديري الأصول: من الفحص النافي للجهالة إلى إدارة العقار ومنازعاته.',
    services: [
      'التطوير العقاري والبيع والشراء والاستثمار',
      'عقود الإيجار وإدارة الأملاك',
      'عقود إدارة المرافق والمجمّعات التجارية',
      'الفحص النافي للجهالة العقاري',
      'الرهن والتمويل العقاري',
      'الصناديق العقارية والاستثمار الجماعي',
      'الملكية المشتركة واتحادات الملّاك',
      'تراخيص البناء والتخطيط العمراني',
      'نزاعات المطوّرين والمقاولين والمشترين',
    ],
    en: {
      name: 'Real Estate, Property & Facilities',
      summary:
        'For developers, investors, owners and asset managers: from due diligence to managing the property and its disputes.',
      services: [
        'Property development, sale, purchase and investment',
        'Leases and property management',
        'Facilities and shopping-centre management agreements',
        'Real estate due diligence',
        'Mortgages and real estate finance',
        'Real estate funds and collective investment',
        'Co-ownership and owners’ associations',
        'Building permits and urban planning',
        'Disputes between developers, contractors and buyers',
      ],
    },
  },
  {
    slug: 'banking-finance',
    icon: 'landmark',
    featured: true,
    name: 'البنوك والتمويل والاستثمار',
    summary:
      'للبنوك والمؤسسات المالية والصناديق والمستثمرين وشركات التكنولوجيا المالية.',
    services: [
      'التمويل التجاري وتمويل الشركات والمشروعات',
      'التمويل الإسلامي والصكوك',
      'الاستثمار المباشر ورأس المال الجريء والملكية الخاصة',
      'التكنولوجيا المالية والمدفوعات والمحافظ الإلكترونية',
      'التأجير التمويلي والتخصيم',
      'أسواق المال والإفصاح والحوكمة',
      'مكافحة غسل الأموال وتمويل الإرهاب',
      'العقوبات الاقتصادية والامتثال',
      'الديون المتعثّرة وإعادة الهيكلة والإعسار',
      'تحصيل الديون واسترداد الأصول',
    ],
    en: {
      name: 'Banking, Finance & Investment',
      summary: 'For banks, financial institutions, funds, investors and fintech companies.',
      services: [
        'Trade, corporate and project finance',
        'Islamic finance and sukuk',
        'Direct investment, venture capital and private equity',
        'Fintech, payments and e-wallets',
        'Finance leasing and factoring',
        'Capital markets, disclosure and governance',
        'Anti-money laundering and counter-terrorist financing',
        'Economic sanctions and compliance',
        'Distressed debt, restructuring and insolvency',
        'Debt collection and asset recovery',
      ],
    },
  },
  {
    slug: 'technology',
    icon: 'cpu',
    featured: true,
    name: 'التكنولوجيا والاتصالات والأمن السيبراني',
    summary:
      'قانون التكنولوجيا من جهة، والجرائم الإلكترونية والتحقيق الرقمي من جهة — بالتعاون مع مختصّين تقنيين حيث يلزم.',
    services: [
      'عقود البرمجيات والحوسبة السحابية و SaaS',
      'حماية البيانات الشخصية والخصوصية',
      'الجرائم الإلكترونية وجرائم تقنية المعلومات',
      'الأدلة الرقمية وسلامة سلسلة حيازتها',
      'الاستجابة القانونية للاختراقات وتسريب البيانات',
      'الابتزاز الإلكتروني والاحتيال وسرقة الهوية',
      'حوكمة الذكاء الاصطناعي',
      'التجارة الإلكترونية وحماية المستهلك الرقمي',
      'الاتصالات ومراكز البيانات',
      'الملكية الفكرية التقنية وبراءات الاختراع',
    ],
    en: {
      name: 'Technology, Telecom & Cybersecurity',
      summary:
        'Technology law on one side, cybercrime and digital investigation on the other — working with technical specialists where needed.',
      services: [
        'Software, cloud and SaaS agreements',
        'Personal data protection and privacy',
        'Cybercrime and information-technology offences',
        'Digital evidence and chain of custody',
        'Legal response to breaches and data leaks',
        'Online extortion, fraud and identity theft',
        'AI governance',
        'E-commerce and digital consumer protection',
        'Telecoms and data centres',
        'Technology intellectual property and patents',
      ],
    },
  },
  {
    slug: 'art-luxury',
    icon: 'palette',
    name: 'الفن والثقافة والأصول الفاخرة',
    summary:
      'سوق الفن والتحف والمقتنيات: المعاملات والملكية والمصدر والجرائم — مع خبراء مستقلّين في فحص الأصالة والتقييم.',
    services: [
      'بيع وشراء الأعمال الفنية والتحف',
      'عقود الفنانين والمعارض ودور المزادات',
      'التحقق من مصدر الملكية (Provenance)',
      'التزوير والتقليد والاحتيال في سوق الفن',
      'سرقة الأعمال الفنية والاتجار غير المشروع بالآثار',
      'استرداد وإعادة الممتلكات الثقافية',
      'تأمين الأعمال الفنية ونقلها وتمويلها',
      'الفن الرقمي والأصول الرقمية',
      'المجوهرات والساعات والسيارات الكلاسيكية والمقتنيات النادرة',
    ],
    en: {
      name: 'Art, Culture & Luxury Assets',
      summary:
        'The market for art, antiques and collectibles: transactions, title, provenance and crime — with independent experts for authenticity and valuation.',
      services: [
        'Sale and purchase of artworks and antiques',
        'Agreements for artists, galleries and auction houses',
        'Provenance verification',
        'Forgery, imitation and fraud in the art market',
        'Art theft and illicit trafficking in antiquities',
        'Restitution and repatriation of cultural property',
        'Insurance, transport and financing of artworks',
        'Digital art and digital assets',
        'Jewellery, watches, classic cars and rare collectibles',
      ],
    },
  },
  {
    slug: 'marketing-creators',
    icon: 'megaphone',
    featured: true,
    name: 'الإعلان والتسويق وصنّاع المحتوى',
    summary:
      'لوكالات التسويق والعلامات التجارية والمؤثّرين ووكالات المواهب ومنصّات الإعلان.',
    services: [
      'عقود وكالات التسويق وإدارة الحملات الإعلانية',
      'عقود إدارة حسابات التواصل الاجتماعي',
      'عقود المؤثّرين والإعلانات المدفوعة',
      'عقود سفراء العلامات التجارية وإدارة المواهب',
      'التسويق بالعمولة والتسويق بالأداء',
      'عقود إنتاج المحتوى و UGC والبودكاست والبث المباشر',
      'حقوق الصورة والصوت والاسم والموسيقى',
      'الرعاية والشراكات والتسويق المشترك',
      'مراجعة الادعاءات الإعلانية وشروط المسابقات والعروض',
      'نزاعات السداد والإخلال بمؤشّرات الأداء',
    ],
    en: {
      name: 'Advertising, Marketing & Creator Economy',
      summary:
        'For marketing agencies, brands, influencers, talent agencies and advertising platforms.',
      services: [
        'Marketing agency and campaign management agreements',
        'Social media account management agreements',
        'Influencer and paid advertising agreements',
        'Brand ambassador and talent management agreements',
        'Affiliate and performance marketing',
        'Content production, UGC, podcast and live-stream agreements',
        'Image, voice, name and music rights',
        'Sponsorship, partnerships and co-marketing',
        'Review of advertising claims and terms for contests and promotions',
        'Payment disputes and failure to meet performance indicators',
      ],
    },
  },
  {
    slug: 'maritime',
    icon: 'ship',
    name: 'النقل البحري والموانئ',
    summary: 'لملّاك السفن والشاحنين ومشغّلي الموانئ وشركات الخدمات البحرية.',
    services: [
      'عقود النقل البحري ومشارطات الإيجار',
      'بيع وشراء وتمويل السفن',
      'التأمين البحري ومطالباته',
      'الحجز على السفن',
      'عقود الموانئ والمحطات والخدمات البحرية',
      'التلوث البحري والمسؤولية عنه',
      'منازعات الشحن والبضائع',
    ],
    en: {
      name: 'Maritime & Shipping',
      summary: 'For shipowners, shippers, port operators and marine service companies.',
      services: [
        'Carriage of goods by sea and charterparties',
        'Sale, purchase and financing of vessels',
        'Marine insurance and its claims',
        'Ship arrest',
        'Port, terminal and marine services agreements',
        'Marine pollution and liability for it',
        'Shipping and cargo disputes',
      ],
    },
  },
  {
    slug: 'aviation',
    icon: 'plane',
    name: 'الطيران والفضاء',
    summary: 'لشركات الطيران والمؤجّرين والمطارات ومزوّدي الصيانة ومشغّلي الأقمار الصناعية.',
    services: [
      'تأجير وتمويل الطائرات',
      'عقود الصيانة والتشغيل',
      'عقود المطارات والخدمات الأرضية',
      'الطيران الخاص وإدارة الطائرات',
      'مسؤولية الناقل الجوي ومطالبات الركاب والشحن',
      'الأقمار الصناعية والأنشطة الفضائية وتراخيصها',
    ],
    en: {
      name: 'Aviation & Aerospace',
      summary: 'For airlines, lessors, airports, maintenance providers and satellite operators.',
      services: [
        'Aircraft leasing and financing',
        'Maintenance and operation agreements',
        'Airport and ground-handling agreements',
        'Private aviation and aircraft management',
        'Air carrier liability and passenger and cargo claims',
        'Satellites, space activities and their licensing',
      ],
    },
  },
  {
    slug: 'manufacturing',
    icon: 'factory',
    name: 'الصناعة والتصنيع',
    summary: 'للمصانع ومورّدي الآلات والمواد وشركات الإلكترونيات والكيماويات.',
    services: [
      'عقود التصنيع والتوريد والتعبئة لحساب الغير',
      'عقود خطوط الإنتاج والآلات والصيانة',
      'الجودة والمسؤولية عن المنتج واستدعاؤه',
      'المواد الكيميائية والخطرة والامتثال لها',
      'التراخيص الصناعية والمناطق الصناعية والحرّة',
      'الإلكترونيات وأشباه الموصلات والملكية الصناعية',
      'نزاعات المورّدين والمصنّعين',
    ],
    en: {
      name: 'Manufacturing & Industrial',
      summary: 'For factories, suppliers of machinery and materials, and electronics and chemicals companies.',
      services: [
        'Manufacturing, supply and contract-manufacturing agreements',
        'Production line, machinery and maintenance contracts',
        'Quality, product liability and product recall',
        'Chemicals, hazardous materials and their compliance',
        'Industrial licensing, industrial zones and free zones',
        'Electronics, semiconductors and industrial property',
        'Supplier and manufacturer disputes',
      ],
    },
  },
  {
    slug: 'agriculture-food',
    icon: 'wheat',
    name: 'الزراعة والأغذية',
    summary: 'للمنتجين الزراعيين ومصانع الأغذية وسلاسل التوريد الزراعية والمطاعم.',
    services: [
      'عقود الإنتاج والتوريد الزراعي',
      'الصناعات الغذائية وسلامة الغذاء',
      'الثروة الحيوانية والداجنة والسمكية',
      'التصدير والاستيراد والحجر الزراعي',
      'تسجيل المنتجات الغذائية وبطاقات البيان',
      'استصلاح الأراضي وحقوق الانتفاع',
    ],
    en: {
      name: 'Agriculture & Food',
      summary: 'For agricultural producers, food manufacturers, agricultural supply chains and restaurants.',
      services: [
        'Agricultural production and supply agreements',
        'Food manufacturing and food safety',
        'Livestock, poultry and fisheries',
        'Export, import and agricultural quarantine',
        'Food product registration and labelling',
        'Land reclamation and usufruct rights',
      ],
    },
  },
  {
    slug: 'retail',
    icon: 'shopping-bag',
    name: 'التجزئة والسلع الاستهلاكية',
    summary: 'للسلاسل التجارية والموزّعين وأصحاب الامتياز والمتاجر الإلكترونية.',
    services: [
      'الامتياز التجاري والتوزيع',
      'عقود المتاجر والمراكز التجارية',
      'التجارة الإلكترونية والأسواق الرقمية',
      'حماية المستهلك والضمان والاسترجاع',
      'العروض الترويجية والمسابقات',
      'حماية العلامات التجارية ومكافحة التقليد',
      'عقود المورّدين والعلامات الخاصة',
    ],
    en: {
      name: 'Retail & Consumer Goods',
      summary: 'For retail chains, distributors, franchisors and online stores.',
      services: [
        'Franchising and distribution',
        'Store and shopping-centre agreements',
        'E-commerce and online marketplaces',
        'Consumer protection, warranty and returns',
        'Promotions and contests',
        'Trade mark protection and anti-counterfeiting',
        'Supplier and private-label agreements',
      ],
    },
  },
  {
    slug: 'hospitality',
    icon: 'hotel',
    name: 'الضيافة والسياحة',
    summary: 'للفنادق والمنتجعات والمطاعم والمقاهي وشركات السياحة.',
    services: [
      'عقود إدارة وتشغيل الفنادق',
      'الامتياز التجاري للمطاعم والمقاهي',
      'تراخيص المنشآت السياحية',
      'عقود الحجوزات ومنظّمي الرحلات',
      'الاستثمار والتطوير السياحي',
      'علاقات العمل في قطاع الضيافة',
    ],
    en: {
      name: 'Hospitality & Tourism',
      summary: 'For hotels, resorts, restaurants, cafés and tourism companies.',
      services: [
        'Hotel management and operation agreements',
        'Restaurant and café franchising',
        'Licensing of tourism establishments',
        'Booking and tour operator agreements',
        'Tourism investment and development',
        'Employment relations in hospitality',
      ],
    },
  },
  {
    slug: 'sports-entertainment',
    icon: 'trophy',
    name: 'الرياضة والترفيه والإعلام',
    summary: 'للأندية واللاعبين والوكلاء وشركات الإنتاج والنشر والألعاب الإلكترونية.',
    services: [
      'عقود اللاعبين والمدرّبين والانتقالات',
      'الرعاية وحقوق البث',
      'التحكيم الرياضي',
      'عقود الإنتاج الفني والسينمائي والموسيقي',
      'حقوق النشر والتوزيع الإعلامي',
      'الألعاب والرياضات الإلكترونية',
      'حقوق الصورة والتسويق الرياضي',
    ],
    en: {
      name: 'Sports, Entertainment & Media',
      summary: 'For clubs, players, agents, and production, publishing and esports companies.',
      services: [
        'Player and coach contracts and transfers',
        'Sponsorship and broadcasting rights',
        'Sports arbitration',
        'Film, music and artistic production agreements',
        'Publishing and media distribution rights',
        'Gaming and esports',
        'Image rights and sports marketing',
      ],
    },
  },
  {
    slug: 'education',
    icon: 'graduation-cap',
    name: 'التعليم والبحث العلمي',
    summary: 'للجامعات والمدارس ومراكز التدريب ومنصّات التعليم الرقمي.',
    services: [
      'تأسيس وترخيص المؤسسات التعليمية',
      'عقود أعضاء هيئة التدريس والتدريب',
      'منصّات التعليم الرقمي وشروطها',
      'الملكية الفكرية الأكاديمية والبحثية',
      'اتفاقيات التعاون والاعتماد',
      'حماية بيانات الطلاب',
    ],
    en: {
      name: 'Education & Research',
      summary: 'For universities, schools, training centres and digital learning platforms.',
      services: [
        'Establishment and licensing of educational institutions',
        'Faculty and training contracts',
        'Digital learning platforms and their terms',
        'Academic and research intellectual property',
        'Cooperation and accreditation agreements',
        'Student data protection',
      ],
    },
  },
  {
    slug: 'insurance',
    icon: 'umbrella',
    name: 'التأمين وإعادة التأمين',
    summary: 'لشركات التأمين والوسطاء والمؤمَّن لهم في المطالبات الكبيرة.',
    services: [
      'صياغة ومراجعة وثائق التأمين',
      'مطالبات التأمين ومنازعات التغطية',
      'إعادة التأمين',
      'تأمين المسؤولية المهنية',
      'التأمين البحري والجوي والهندسي',
      'الامتثال التنظيمي لشركات التأمين',
    ],
    en: {
      name: 'Insurance & Reinsurance',
      summary: 'For insurers, brokers, and policyholders in major claims.',
      services: [
        'Drafting and review of insurance policies',
        'Insurance claims and coverage disputes',
        'Reinsurance',
        'Professional liability insurance',
        'Marine, aviation and engineering insurance',
        'Regulatory compliance for insurers',
      ],
    },
  },
  {
    slug: 'public-sector',
    icon: 'gavel',
    name: 'المشتريات الحكومية والقطاع العام',
    summary: 'للمتعاقدين مع الجهات الحكومية والمتقدّمين للمناقصات وأصحاب الامتيازات.',
    services: [
      'المناقصات والمزايدات وإعداد العطاءات',
      'العقود الإدارية وعقود التوريد الحكومي',
      'عقود الامتياز والشراكة مع القطاع العام',
      'المطالبات والتعويضات في العقود الحكومية',
      'التظلّمات والمنازعات الإدارية',
      'الامتثال لقواعد التعاقدات العامة',
    ],
    en: {
      name: 'Government Procurement & Public Sector',
      summary: 'For government contractors, tender bidders and concession holders.',
      services: [
        'Tenders, auctions and bid preparation',
        'Administrative and government supply contracts',
        'Concessions and partnerships with the public sector',
        'Claims and compensation under government contracts',
        'Administrative grievances and disputes',
        'Compliance with public procurement rules',
      ],
    },
  },
  {
    slug: 'nonprofit',
    icon: 'heart-handshake',
    name: 'المنظمات غير الربحية',
    summary: 'للجمعيات والمؤسسات الأهلية والجهات المانحة وبرامج المسؤولية الاجتماعية.',
    services: [
      'تأسيس الجمعيات والمؤسسات الأهلية وقيدها',
      'الحوكمة واللوائح الداخلية',
      'اتفاقيات المنح والتبرعات',
      'الامتثال والتقارير',
      'عقود الشراكة مع القطاع الخاص',
    ],
    en: {
      name: 'Non-Profit Organisations',
      summary: 'For associations, foundations, donors and corporate social responsibility programmes.',
      services: [
        'Establishment and registration of associations and foundations',
        'Governance and bylaws',
        'Grant and donation agreements',
        'Compliance and reporting',
        'Partnership agreements with the private sector',
      ],
    },
  },
  {
    slug: 'environment',
    icon: 'leaf',
    name: 'البيئة والمناخ والاستدامة',
    summary: 'للمنشآت الصناعية والمطوّرين والمستثمرين في الاقتصاد الأخضر والدائري.',
    services: [
      'التصاريح البيئية وتقييم الأثر البيئي',
      'إدارة النفايات وإعادة التدوير والاقتصاد الدائري',
      'أسواق الكربون وشهادات الطاقة المتجددة',
      'تقارير الاستدامة والحوكمة البيئية والاجتماعية (ESG)',
      'المخالفات والجرائم البيئية',
      'المسؤولية عن التلوث وتعويضاته',
    ],
    en: {
      name: 'Environment, Climate & Sustainability',
      summary: 'For industrial facilities, developers and investors in the green and circular economy.',
      services: [
        'Environmental permits and impact assessment',
        'Waste management, recycling and the circular economy',
        'Carbon markets and renewable energy certificates',
        'Sustainability and ESG reporting',
        'Environmental violations and offences',
        'Liability and compensation for pollution',
      ],
    },
  },
  {
    slug: 'water-utilities',
    icon: 'droplets',
    name: 'المياه والمرافق',
    summary: 'لمشروعات التحلية والمعالجة وشبكات المرافق ومشغّليها.',
    services: [
      'مشروعات التحلية ومعالجة المياه',
      'عقود التشغيل والصيانة (O&M)',
      'حقوق المياه والانتفاع بها',
      'امتيازات المرافق العامة',
      'تمويل مشروعات المرافق',
    ],
    en: {
      name: 'Water & Utilities',
      summary: 'For desalination and treatment projects, utility networks and their operators.',
      services: [
        'Desalination and water treatment projects',
        'Operation and maintenance (O&M) agreements',
        'Water rights and rights of use',
        'Public utility concessions',
        'Utility project finance',
      ],
    },
  },
  {
    slug: 'fashion-beauty',
    icon: 'shirt',
    name: 'الأزياء والجمال والعلامات الفاخرة',
    summary: 'للمصمّمين ودور الأزياء وشركات مستحضرات التجميل والعطور.',
    services: [
      'حماية التصاميم والعلامات التجارية',
      'عقود المصمّمين وعارضي الأزياء',
      'التوزيع والامتياز والترخيص',
      'مكافحة التقليد',
      'تسجيل مستحضرات التجميل وبطاقات البيان',
      'عقود التصنيع لحساب الغير',
    ],
    en: {
      name: 'Fashion, Beauty & Luxury Brands',
      summary: 'For designers, fashion houses, and cosmetics and fragrance companies.',
      services: [
        'Protection of designs and trade marks',
        'Designer and model agreements',
        'Distribution, franchising and licensing',
        'Anti-counterfeiting',
        'Cosmetics registration and labelling',
        'Contract-manufacturing agreements',
      ],
    },
  },
  {
    slug: 'startups',
    icon: 'rocket',
    featured: true,
    name: 'الشركات الناشئة ورأس المال الجريء',
    summary: 'للمؤسّسين والمستثمرين والحاضنات ومسرّعات الأعمال، من التأسيس إلى جولة التمويل.',
    services: [
      'التأسيس واختيار الشكل القانوني',
      'اتفاقيات المؤسّسين والشركاء',
      'جولات التمويل وأوراق الشروط (Term Sheet)',
      'خطط خيارات الأسهم للموظفين',
      'حماية الملكية الفكرية',
      'عقود العملاء والمورّدين الأولى',
      'الامتثال التنظيمي للنماذج الجديدة',
    ],
    en: {
      name: 'Startups, Venture Capital & Innovation',
      summary: 'For founders, investors, incubators and accelerators, from incorporation to the funding round.',
      services: [
        'Incorporation and choice of legal form',
        'Founders’ and shareholders’ agreements',
        'Funding rounds and term sheets',
        'Employee share option plans',
        'Intellectual property protection',
        'First customer and supplier contracts',
        'Regulatory compliance for new business models',
      ],
    },
  },
  {
    slug: 'defense-security',
    icon: 'shield',
    name: 'الصناعات الدفاعية والأمنية',
    summary: 'لمورّدي المعدّات والخدمات الأمنية والمتعاقدين في القطاع.',
    services: [
      'عقود التوريد والتصنيع',
      'تراخيص الاستيراد والتصدير والرقابة عليها',
      'الامتثال التجاري والعقوبات',
      'اتفاقيات السرّية وحماية المعلومات',
      'شركات الأمن والحراسة وتراخيصها',
    ],
    en: {
      name: 'Defense & Security Industries',
      summary: 'For suppliers of security equipment and services and contractors in the sector.',
      services: [
        'Supply and manufacturing contracts',
        'Import and export licensing and controls',
        'Trade compliance and sanctions',
        'Confidentiality and information protection agreements',
        'Security and guarding companies and their licensing',
      ],
    },
  },
  {
    slug: 'logistics',
    icon: 'truck',
    name: 'اللوجستيات وسلاسل الإمداد',
    summary: 'لشركات النقل والتخزين والتوزيع والتخليص الجمركي.',
    services: [
      'عقود النقل والتخزين والتوزيع',
      'عقود الخدمات اللوجستية (3PL)',
      'التخليص الجمركي ومنازعاته',
      'مسؤولية الناقل وتأمين البضائع',
      'امتثال المورّدين وسلاسل الإمداد',
      'إدارة الأساطيل وعقودها',
    ],
    en: {
      name: 'Logistics & Supply Chain',
      summary: 'For transport, warehousing, distribution and customs clearance companies.',
      services: [
        'Transport, warehousing and distribution agreements',
        'Third-party logistics (3PL) agreements',
        'Customs clearance and its disputes',
        'Carrier liability and cargo insurance',
        'Supplier and supply-chain compliance',
        'Fleet management and its contracts',
      ],
    },
  },
  {
    slug: 'professional-services',
    icon: 'briefcase',
    name: 'الخدمات المهنية والاستشارية',
    summary: 'لمكاتب المحاسبة والاستشارات الهندسية والإدارية وشركات التوظيف.',
    services: [
      'عقود تقديم الخدمات المهنية وخطابات التكليف',
      'المسؤولية المهنية وحدودها',
      'اتفاقيات الشراكة بين المهنيين',
      'السرّية وتعارض المصالح',
      'الامتثال لقواعد المهنة والترخيص',
      'تحصيل الأتعاب ومنازعاتها',
    ],
    en: {
      name: 'Professional Services & Consulting',
      summary: 'For accounting firms, engineering and management consultancies, and recruitment companies.',
      services: [
        'Professional services agreements and engagement letters',
        'Professional liability and its limits',
        'Partnership agreements between professionals',
        'Confidentiality and conflicts of interest',
        'Compliance with professional rules and licensing',
        'Fee collection and fee disputes',
      ],
    },
  },
];

export const getSector = (slug: string) => sectors.find((sector) => sector.slug === slug);

export const featuredSectors = sectors.filter((sector) => sector.featured);

/** نصّ القطاع بلغة الصفحة */
export function sectorText(sector: Sector, locale: 'ar' | 'en'): SectorText {
  return locale === 'ar'
    ? { name: sector.name, summary: sector.summary, services: sector.services }
    : sector.en;
}
