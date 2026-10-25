export type Jurisdiction = 'مصر' | 'السعودية' | 'دولي' | 'مقارن';
export type LibraryType =
  | 'تشريع'
  | 'بوابة نظامية'
  | 'اتفاقية دولية'
  | 'مبادئ نموذجية'
  | 'تقرير أو دراسة'
  | 'قاعدة بيانات';
export type AccessKind = 'مجاني ومفتوح' | 'مجاني بتسجيل';

export interface LibraryItem {
  slug: string;
  title: string;
  publisher: string;
  jurisdiction: Jurisdiction;
  type: LibraryType;
  description: string;
  url: string;
  access: AccessKind;
  language: string;
  tags: string[];
  /** الترجمة الإنجليزية — إلزامية فلا يُدرَج مرجع بلا مقابله */
  en: { title: string; publisher: string; description: string; language: string };
}

/**
 * التصنيفات قيمها عربية (وهي ما يُفلتَر به)، وهذه تسمياتها بالإنجليزية.
 * لو تُرجمت القيم نفسها لانقسم كل تصنيف إلى اثنين لا يتقابلان.
 */
export const jurisdictionLabelsEn: Record<Jurisdiction, string> = {
  'مصر': 'Egypt',
  'السعودية': 'Saudi Arabia',
  'دولي': 'International',
  'مقارن': 'Comparative',
};

export const accessLabelsEn: Record<AccessKind, string> = {
  'مجاني ومفتوح': 'Free and open',
  'مجاني بتسجيل': 'Free with registration',
};

export const typeLabelsEn: Record<LibraryType, string> = {
  'تشريع': 'Legislation',
  'بوابة نظامية': 'Official portal',
  'اتفاقية دولية': 'International convention',
  'مبادئ نموذجية': 'Model principles',
  'تقرير أو دراسة': 'Report or study',
  'قاعدة بيانات': 'Database',
};

/**
 * المكتبة القانونية — مراجع مفتوحة المصدر فقط.
 *
 * المبدأ التحريري: لا يُدرَج هنا إلا ما هو متاح مجاناً وبصفة مشروعة من
 * جهة رسمية أو مؤسسة دولية معترف بها. لا تُرفع نسخ من مؤلفات محمية بحقوق
 * ملكية فكرية، وإنما يُحال إلى المصدر الأصلي مباشرةً.
 */

export const libraryItems: LibraryItem[] = [
  {
    slug: 'manshurat-egypt',
    title: 'منشورات — بوابة التشريعات المصرية',
    publisher: 'مبادرة منشورات القانونية',
    jurisdiction: 'مصر',
    type: 'بوابة نظامية',
    description:
      'قاعدة بيانات مفتوحة للتشريعات المصرية تتيح البحث في القوانين والقرارات ولوائحها التنفيذية بنصوصها الكاملة، مع إمكانية تتبّع التعديلات. مرجع أساسي لأي بحث في القانون المصري.',
    url: 'https://manshurat.org/',
    access: 'مجاني ومفتوح',
    language: 'العربية',
    tags: ['تشريعات', 'مصر', 'بحث قانوني'],
    en: {
      title: 'Manshurat — Egyptian legislation portal',
      publisher: 'Manshurat Legal Initiative',
      description:
        'An open database of Egyptian legislation allowing full-text search of statutes, decrees and their implementing regulations, with the ability to trace amendments. An essential starting point for any research in Egyptian law.',
      language: 'Arabic',
    },
  },
  {
    slug: 'boe-saudi-laws',
    title: 'بوابة الأنظمة السعودية — هيئة الخبراء بمجلس الوزراء',
    publisher: 'هيئة الخبراء بمجلس الوزراء — المملكة العربية السعودية',
    jurisdiction: 'السعودية',
    type: 'بوابة نظامية',
    description:
      'المرجع الرسمي للأنظمة واللوائح السعودية بنصوصها النافذة، ويشمل نظام الشركات ونظام المعاملات المدنية ونظام العمل ونظام التحكيم وغيرها، مع بيان تواريخ الصدور والتعديلات.',
    url: 'https://laws.boe.gov.sa/',
    access: 'مجاني ومفتوح',
    language: 'العربية / الإنجليزية',
    tags: ['أنظمة', 'السعودية', 'مصدر رسمي'],
    en: {
      title: 'Saudi laws portal — Bureau of Experts at the Council of Ministers',
      publisher: 'Bureau of Experts at the Council of Ministers — Saudi Arabia',
      description:
        'The official source for Saudi laws and regulations in their operative form, covering the Companies Law, the Civil Transactions Law, the Labour Law, the Arbitration Law and others, with issue and amendment dates.',
      language: 'Arabic / English',
    },
  },
  {
    slug: 'zatca-portal',
    title: 'هيئة الزكاة والضريبة والجمارك — الأنظمة واللوائح والأدلة',
    publisher: 'ZATCA — المملكة العربية السعودية',
    jurisdiction: 'السعودية',
    type: 'بوابة نظامية',
    description:
      'المصدر الرسمي للوائح الزكاة وضريبة القيمة المضافة والضريبة الانتقائية والفوترة الإلكترونية، ويضمّ أدلة إرشادية تفصيلية تشرح التطبيق العملي لكل التزام.',
    url: 'https://zatca.gov.sa/',
    access: 'مجاني ومفتوح',
    language: 'العربية / الإنجليزية',
    tags: ['زكاة', 'ضرائب', 'فوترة إلكترونية'],
    en: {
      title: 'ZATCA — laws, regulations and guidelines',
      publisher: 'ZATCA — Saudi Arabia',
      description:
        'The official source for the Zakat, VAT, excise tax and e-invoicing regulations, together with detailed guidelines explaining how each obligation applies in practice.',
      language: 'Arabic / English',
    },
  },
  {
    slug: 'uncitral-texts',
    title: 'نصوص الأونسيترال النموذجية والاتفاقيات',
    publisher: 'لجنة الأمم المتحدة للقانون التجاري الدولي (UNCITRAL)',
    jurisdiction: 'دولي',
    type: 'اتفاقية دولية',
    description:
      'النصوص الكاملة لاتفاقية نيويورك 1958 والقانون النموذجي للتحكيم التجاري الدولي واتفاقية البيع الدولي للبضائع (CISG) وقوانين نموذجية أخرى، متاحة بلغات الأمم المتحدة الرسمية ومنها العربية.',
    url: 'https://uncitral.un.org/en/texts',
    access: 'مجاني ومفتوح',
    language: 'العربية / الإنجليزية وغيرهما',
    tags: ['تحكيم', 'تجارة دولية', 'قانون نموذجي'],
    en: {
      title: 'UNCITRAL model texts and conventions',
      publisher: 'United Nations Commission on International Trade Law (UNCITRAL)',
      description:
        'Full texts of the 1958 New York Convention, the Model Law on International Commercial Arbitration, the Convention on Contracts for the International Sale of Goods (CISG) and other model laws, available in the official UN languages including Arabic.',
      language: 'Arabic / English and others',
    },
  },
  {
    slug: 'unidroit-principles',
    title: 'مبادئ اليونيدروا للعقود التجارية الدولية',
    publisher: 'المعهد الدولي لتوحيد القانون الخاص (UNIDROIT)',
    jurisdiction: 'دولي',
    type: 'مبادئ نموذجية',
    description:
      'مجموعة مبادئ مرجعية في صياغة وتفسير العقود التجارية الدولية، تُستخدم في التحكيم وفي سدّ ثغرات العقود. مرفقة بتعليقات شارحة تجعلها أداة عملية للصياغة.',
    url: 'https://www.unidroit.org/instruments/commercial-contracts/unidroit-principles-2016/',
    access: 'مجاني ومفتوح',
    language: 'الإنجليزية / الفرنسية',
    tags: ['عقود', 'صياغة', 'تجارة دولية'],
    en: {
      title: 'UNIDROIT Principles of International Commercial Contracts',
      publisher: 'International Institute for the Unification of Private Law (UNIDROIT)',
      description:
        'A body of reference principles for drafting and interpreting international commercial contracts, used in arbitration and to fill contractual gaps. Accompanied by explanatory comments that make them a practical drafting tool.',
      language: 'English / French',
    },
  },
  {
    slug: 'wipo-lex',
    title: 'WIPO Lex — قاعدة بيانات تشريعات الملكية الفكرية',
    publisher: 'المنظمة العالمية للملكية الفكرية (WIPO)',
    jurisdiction: 'مقارن',
    type: 'قاعدة بيانات',
    description:
      'قاعدة بيانات عالمية تضمّ تشريعات الملكية الفكرية والمعاهدات ذات الصلة لأكثر من 200 ولاية قضائية، مع نصوصها الكاملة وإمكانية المقارنة بينها.',
    url: 'https://www.wipo.int/wipolex/en/',
    access: 'مجاني ومفتوح',
    language: 'متعدد اللغات',
    tags: ['ملكية فكرية', 'قانون مقارن'],
    en: {
      title: 'WIPO Lex — intellectual property legislation database',
      publisher: 'World Intellectual Property Organization (WIPO)',
      description:
        'A global database of intellectual property legislation and related treaties for more than 200 jurisdictions, with full texts and the ability to compare them.',
      language: 'Multilingual',
    },
  },
  {
    slug: 'eur-lex',
    title: 'EUR-Lex — القانون الأوروبي بنصوصه الكاملة',
    publisher: 'الاتحاد الأوروبي',
    jurisdiction: 'مقارن',
    type: 'قاعدة بيانات',
    description:
      'المصدر الرسمي للتشريعات الأوروبية وأحكام محكمة العدل الأوروبية. مرجع لا غنى عنه في الدراسات المقارنة، خصوصاً في حماية البيانات وحماية المستهلك والتنظيم البيئي والاقتصاد الدائري.',
    url: 'https://eur-lex.europa.eu/',
    access: 'مجاني ومفتوح',
    language: 'متعدد اللغات',
    tags: ['قانون مقارن', 'الاتحاد الأوروبي', 'تنظيم'],
    en: {
      title: 'EUR-Lex — European law in full text',
      publisher: 'European Union',
      description:
        'The official source for EU legislation and the judgments of the Court of Justice. Indispensable for comparative work, particularly in data protection, consumer protection, environmental regulation and the circular economy.',
      language: 'Multilingual',
    },
  },
  {
    slug: 'oecd-library',
    title: 'OECD iLibrary — دراسات القانون والاقتصاد والتنظيم',
    publisher: 'منظمة التعاون الاقتصادي والتنمية',
    jurisdiction: 'دولي',
    type: 'تقرير أو دراسة',
    description:
      'مكتبة تضمّ تقارير وأوراق عمل في السياسات التنظيمية وحوكمة الشركات والسياسة الضريبية والاقتصاد الدائري. جزء كبير من محتواها متاح للقراءة مجاناً.',
    url: 'https://www.oecd-ilibrary.org/',
    access: 'مجاني بتسجيل',
    language: 'الإنجليزية / الفرنسية',
    tags: ['قانون واقتصاد', 'سياسات تنظيمية', 'أبحاث'],
    en: {
      title: 'OECD iLibrary — law, economics and regulation studies',
      publisher: 'Organisation for Economic Co-operation and Development',
      description:
        'A library of reports and working papers on regulatory policy, corporate governance, tax policy and the circular economy. A large part of its content is free to read.',
      language: 'English / French',
    },
  },
  {
    slug: 'worldbank-open-knowledge',
    title: 'Open Knowledge Repository — البنك الدولي',
    publisher: 'مجموعة البنك الدولي',
    jurisdiction: 'دولي',
    type: 'تقرير أو دراسة',
    description:
      'مستودع مفتوح بالكامل يضمّ آلاف التقارير والدراسات في التنظيم الاقتصادي وبيئة الأعمال والإصلاح القانوني، منشورة برخص مفتوحة تتيح إعادة الاستخدام مع الإسناد.',
    url: 'https://openknowledge.worldbank.org/',
    access: 'مجاني ومفتوح',
    language: 'الإنجليزية وغيرها',
    tags: ['تنمية', 'إصلاح تشريعي', 'اقتصاد'],
    en: {
      title: 'Open Knowledge Repository — World Bank',
      publisher: 'World Bank Group',
      description:
        'A fully open repository of thousands of reports and studies on economic regulation, the business environment and legal reform, published under open licences that permit reuse with attribution.',
      language: 'English and others',
    },
  },
  {
    slug: 'unep-law',
    title: 'UNEP Law and Environment Assistance Platform',
    publisher: 'برنامج الأمم المتحدة للبيئة',
    jurisdiction: 'دولي',
    type: 'قاعدة بيانات',
    description:
      'منصّة تجمع التشريعات البيئية الوطنية والاتفاقيات الدولية وأدلة الصياغة التشريعية. مرجع مباشر للباحثين في تنظيم المخلفات والاقتصاد الدائري.',
    url: 'https://leap.unep.org/',
    access: 'مجاني ومفتوح',
    language: 'الإنجليزية',
    tags: ['قانون بيئي', 'اقتصاد دائري', 'استدامة'],
    en: {
      title: 'UNEP Law and Environment Assistance Platform',
      publisher: 'United Nations Environment Programme',
      description:
        'A platform bringing together national environmental legislation, international agreements and legislative drafting guides. A direct reference for research on waste regulation and the circular economy.',
      language: 'English',
    },
  },
  {
    slug: 'crcica',
    title: 'مركز القاهرة الإقليمي للتحكيم التجاري الدولي',
    publisher: 'CRCICA',
    jurisdiction: 'مصر',
    type: 'بوابة نظامية',
    description:
      'قواعد التحكيم المعتمدة لدى المركز وجداول الأتعاب والنماذج الإجرائية، إضافةً إلى إصدارات في التحكيم التجاري. مرجع عملي عند صياغة شرط التحكيم.',
    url: 'https://crcica.org/',
    access: 'مجاني ومفتوح',
    language: 'العربية / الإنجليزية',
    tags: ['تحكيم', 'مصر', 'إجراءات'],
    en: {
      title: 'Cairo Regional Centre for International Commercial Arbitration',
      publisher: 'CRCICA',
      description:
        'The Centre’s adopted arbitration rules, fee schedules and procedural forms, together with publications on commercial arbitration. A practical reference when drafting an arbitration clause.',
      language: 'Arabic / English',
    },
  },
  {
    slug: 'scca',
    title: 'المركز السعودي للتحكيم التجاري',
    publisher: 'SCCA',
    jurisdiction: 'السعودية',
    type: 'بوابة نظامية',
    description:
      'قواعد التحكيم السعودية المعتمدة ونماذج شروط التحكيم وأدلة الإجراءات وجداول التكاليف، مع إصدارات تحليلية في التحكيم المؤسسي.',
    url: 'https://www.scca.org.sa/',
    access: 'مجاني ومفتوح',
    language: 'العربية / الإنجليزية',
    tags: ['تحكيم', 'السعودية', 'إجراءات'],
    en: {
      title: 'Saudi Center for Commercial Arbitration',
      publisher: 'SCCA',
      description:
        'The adopted Saudi arbitration rules, model arbitration clauses, procedural guides and cost schedules, with analytical publications on institutional arbitration.',
      language: 'Arabic / English',
    },
  },
];

export const libraryJurisdictions = Array.from(
  new Set(libraryItems.map((item) => item.jurisdiction)),
);

export const libraryTypes = Array.from(new Set(libraryItems.map((item) => item.type)));
