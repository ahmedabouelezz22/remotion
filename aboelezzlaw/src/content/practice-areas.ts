/**
 * مجالات الممارسة والخدمات المهنية — المستوى الثاني من الكتالوج.
 *
 * المجال عابر للقطاعات: «التحكيم» يخدم الإنشاءات والطاقة والرياضة معاً، و
 * «حماية البيانات» تخدم المستشفيات والسيارات والتكنولوجيا. لذلك تُحفظ
 * المجالات قائمةً مستقلّة لا فروعاً تحت قطاع بعينه.
 */

export interface Bilingual {
  ar: string;
  en: string;
}

export interface PracticeGroup {
  key: string;
  title: Bilingual;
  items: Bilingual[];
}

export const practiceGroups: PracticeGroup[] = [
  {
    key: 'corporate',
    title: { ar: 'الشركات والمعاملات', en: 'Corporate & Transactions' },
    items: [
      { ar: 'القانون التجاري والشركات', en: 'Corporate & commercial law' },
      { ar: 'صياغة ومراجعة العقود', en: 'Contract drafting and review' },
      { ar: 'الاندماج والاستحواذ', en: 'Mergers and acquisitions' },
      { ar: 'الحوكمة المؤسسية ومجالس الإدارة', en: 'Corporate governance and boards' },
      { ar: 'الامتياز التجاري والوكالات والتوزيع', en: 'Franchise, commercial agency and distribution' },
      { ar: 'الاستثمار وتمويل المشروعات', en: 'Investment and project finance' },
      { ar: 'البنوك والتمويل', en: 'Banking and finance' },
      { ar: 'العقارات والتسجيل والملكية', en: 'Real estate, registration and title' },
    ],
  },
  {
    key: 'disputes',
    title: { ar: 'المنازعات', en: 'Disputes' },
    items: [
      { ar: 'التقاضي المدني والتجاري والإداري', en: 'Civil, commercial and administrative litigation' },
      { ar: 'التحكيم التجاري المحلي والدولي', en: 'Domestic and international commercial arbitration' },
      { ar: 'التحكيم الهندسي والإنشائي', en: 'Construction arbitration' },
      { ar: 'التحكيم الاستثماري', en: 'Investment arbitration' },
      { ar: 'الوساطة وتسوية المنازعات', en: 'Mediation and dispute settlement' },
      { ar: 'الإفلاس والإعسار والتصفية', en: 'Bankruptcy, insolvency and liquidation' },
      { ar: 'المنازعات الحكومية والعقود العامة', en: 'Government disputes and public contracts' },
    ],
  },
  {
    key: 'crime',
    title: { ar: 'الجرائم الاقتصادية والتحقيقات', en: 'White-Collar Crime & Investigations' },
    items: [
      { ar: 'جرائم الشركات والمديرين', en: 'Corporate and directors’ offences' },
      { ar: 'الجرائم الإلكترونية وجرائم تقنية المعلومات', en: 'Cybercrime and information-technology offences' },
      { ar: 'الجرائم المالية والمصرفية', en: 'Financial and banking crime' },
      { ar: 'غسل الأموال وتمويل الإرهاب', en: 'Money laundering and terrorist financing' },
      { ar: 'جرائم سوق الفن والآثار', en: 'Art market and antiquities crime' },
      { ar: 'الجرائم الضريبية والجمركية', en: 'Tax and customs offences' },
      { ar: 'جرائم الملكية الفكرية والتقليد', en: 'Intellectual property crime and counterfeiting' },
      { ar: 'الرشوة والفساد واستغلال النفوذ', en: 'Bribery, corruption and influence peddling' },
      { ar: 'التحقيقات الداخلية', en: 'Internal investigations' },
      { ar: 'تتبّع الأصول واستردادها', en: 'Asset tracing and recovery' },
    ],
  },
  {
    key: 'regulatory',
    title: { ar: 'التنظيم والامتثال', en: 'Regulatory & Compliance' },
    items: [
      { ar: 'الزكاة والضرائب والجمارك', en: 'Zakat, tax and customs' },
      { ar: 'حماية البيانات والخصوصية', en: 'Data protection and privacy' },
      { ar: 'المنافسة ومنع الاحتكار', en: 'Competition and antitrust' },
      { ar: 'حماية المستهلك ومسؤولية المنتج', en: 'Consumer protection and product liability' },
      { ar: 'التجارة الدولية والاستيراد والتصدير', en: 'International trade, import and export' },
      { ar: 'العقوبات الاقتصادية والرقابة على الصادرات', en: 'Economic sanctions and export controls' },
      { ar: 'القانون البيئي والمناخي', en: 'Environmental and climate law' },
      { ar: 'التأمين وإعادة التأمين', en: 'Insurance and reinsurance' },
      { ar: 'القانون الإداري والدستوري', en: 'Administrative and constitutional law' },
    ],
  },
  {
    key: 'ip-tech',
    title: { ar: 'الملكية الفكرية والتقنية والإعلام', en: 'IP, Technology & Media' },
    items: [
      { ar: 'الملكية الفكرية والعلامات وبراءات الاختراع', en: 'Intellectual property, trade marks and patents' },
      { ar: 'قانون التكنولوجيا والذكاء الاصطناعي', en: 'Technology and AI law' },
      { ar: 'قانون الإعلام والنشر والترفيه', en: 'Media, publishing and entertainment law' },
      { ar: 'قانون الرياضة', en: 'Sports law' },
      { ar: 'القانون البحري والجوي', en: 'Maritime and aviation law' },
    ],
  },
  {
    key: 'people',
    title: { ar: 'العمل والأفراد والثروات', en: 'Employment, Individuals & Private Wealth' },
    items: [
      { ar: 'قانون العمل والموارد البشرية', en: 'Employment law and human resources' },
      { ar: 'الهجرة والإقامة وتصاريح العمل', en: 'Immigration, residence and work permits' },
      { ar: 'التركات والمواريث ونقل الثروة', en: 'Estates, inheritance and wealth transfer' },
      { ar: 'قانون الأسرة والعملاء الأفراد', en: 'Family law and private clients' },
      { ar: 'القانون الدولي الخاص وتنازع القوانين', en: 'Private international law and conflict of laws' },
      { ar: 'المسؤولية المهنية', en: 'Professional liability' },
    ],
  },
];

/** خدمات مهنية واستشارية تكمل العمل القانوني — تُباع لشركات من قطاعات مختلفة */
export const professionalServices: Bilingual[] = [
  { ar: 'إدارة الوظيفة القانونية (Legal Operations)', en: 'Legal operations' },
  { ar: 'إدارة دورة حياة العقود', en: 'Contract lifecycle management' },
  { ar: 'الإدارة القانونية الخارجية للشركات', en: 'Outsourced legal department' },
  { ar: 'بناء أنظمة الامتثال والرقابة', en: 'Compliance and controls programmes' },
  { ar: 'إدارة المخاطر القانونية والتجارية', en: 'Legal and commercial risk management' },
  { ar: 'الفحص النافي للجهالة', en: 'Due diligence' },
  { ar: 'المحاسبة الجنائية والتحقيقات المالية', en: 'Forensic accounting and financial investigations' },
  { ar: 'الاستشارات الضريبية والزكوية', en: 'Tax and Zakat advisory' },
  { ar: 'استشارات الموارد البشرية وسياسات العمل', en: 'HR consulting and workplace policies' },
  { ar: 'دعم التوظيف والتعاقدات', en: 'Recruitment and contracting support' },
  { ar: 'استشارات المشتريات والمورّدين', en: 'Procurement and supplier advisory' },
  { ar: 'إدارة المناقصات والعطاءات', en: 'Tender and bid management' },
  { ar: 'استشارات المطالبات الهندسية والتعاقدية', en: 'Claims consultancy' },
  { ar: 'ضبط المشروعات ومتابعة مخاطرها', en: 'Project controls' },
  { ar: 'إعادة هيكلة الشركات والأعمال', en: 'Business restructuring' },
  { ar: 'دعم التوسّع ودخول الأسواق الجديدة', en: 'International expansion' },
  { ar: 'أمانة سرّ الشركات ومجالس الإدارة', en: 'Corporate secretarial services' },
  { ar: 'التراخيص والتصاريح القطاعية', en: 'Regulatory licensing' },
  { ar: 'الترجمة القانونية وتوطين المستندات', en: 'Legal translation and localisation' },
  { ar: 'تنسيق الخبراء والتقارير الفنية', en: 'Expert witness coordination' },
  { ar: 'تقييم المخاطر السيبرانية', en: 'Cyber risk advisory' },
  { ar: 'إدارة الأزمات والسمعة', en: 'Crisis and reputation management' },
  { ar: 'استمرارية الأعمال والتعافي', en: 'Business continuity and recovery' },
  { ar: 'تقارير الاستدامة (ESG)', en: 'ESG and sustainability reporting' },
  { ar: 'التفاوض التجاري والتعاقدي', en: 'Commercial negotiation' },
];

export const practiceAreaCount = practiceGroups.reduce((sum, group) => sum + group.items.length, 0);
