export interface FaqItem {
  question: string;
  answer: string;
}

export interface Faq extends FaqItem {
  /** الترجمة الإنجليزية — إلزامية فلا يظهر سؤال بلا جوابه بلغة الصفحة */
  en: FaqItem;
}

export const faqs: Faq[] = [
  {
    question: 'كيف تبدأ الاستشارة عملياً؟',
    answer:
      'تحجز موعداً من صفحة حجز الاستشارة وترسل مستنداتك مسبقاً. تُدرس المستندات قبل الموعد حتى تكون الجلسة مخصّصة للرأي والخيارات لا لجمع المعلومات، ثم تتسلّم ملخّصاً مكتوباً بالرأي والخطوات التالية.',
    en: {
      question: 'How does a consultation work in practice?',
      answer:
        'You book a slot on the booking page and send your documents in advance. The documents are studied before the session so that the time is spent on the opinion and the options rather than on gathering information, and you then receive a written summary of the opinion and the next steps.',
    },
  },
  {
    question: 'ما مدة تسليم مراجعة العقد؟',
    answer:
      'المستوى القياسي يُسلَّم خلال ثلاثة أيام عمل من استلام العقد والمستندات المؤيّدة. العقود المركّبة أو التي تتجاوز أربعين صفحة تحتاج مدة أطول تُحدَّد قبل البدء.',
    en: {
      question: 'How long does a contract review take?',
      answer:
        'The standard turnaround is three business days from receipt of the contract and its supporting documents. Complex contracts, or those running beyond forty pages, need longer, and the period is agreed before work begins.',
    },
  },
  {
    question: 'هل تتعاملون مع القانون المصري والسعودي معاً؟',
    answer:
      'نعم. تغطّي الخدمات المسائل الخاضعة للقانون المصري وتلك الخاضعة للأنظمة السعودية، مع بيان القانون الواجب التطبيق في كل حالة. وفي المسائل التي تستلزم مرافعة أمام جهة قضائية سعودية يُنسَّق مع محامٍ مرخَّص هناك.',
    en: {
      question: 'Do you handle both Egyptian and Saudi law?',
      answer:
        'Yes. The services cover matters governed by Egyptian law and those governed by Saudi regulations, with the applicable law identified in each case. Where a matter requires advocacy before a Saudi judicial body, it is coordinated with a lawyer licensed there.',
    },
  },
  {
    question: 'هل بياناتي ومستنداتي سرّية؟',
    answer:
      'السرّية المهنية التزام قانوني لا اختياري. لا تُفصح المستندات ولا محتوى الاستشارة لأي طرف ثالث إلا بموافقتك الكتابية أو تنفيذاً لالتزام قانوني. ويمكن توقيع اتفاقية عدم إفصاح قبل إرسال المستندات إذا رغبت.',
    en: {
      question: 'Are my data and documents confidential?',
      answer:
        'Professional confidentiality is a legal obligation, not an option. Neither the documents nor the content of the consultation is disclosed to any third party except with your written consent or in performance of a legal obligation. A non-disclosure agreement can be signed before you send documents if you prefer.',
    },
  },
  {
    question: 'ما وسائل الدفع المتاحة؟',
    answer:
      'التحويل البنكي وإنستاباي والمحافظ الإلكترونية متاحة الآن، وكذلك PayPal للعملاء خارج مصر. الدفع بالبطاقة عبر بوابة Paymob يُفعَّل فور اكتمال إجراءات الحساب.',
    en: {
      question: 'Which payment methods are available?',
      answer:
        'Bank transfer, InstaPay and mobile wallets are available now, as is PayPal for clients outside Egypt. Card payment through the Paymob gateway will be enabled as soon as the account formalities are complete.',
    },
  },
  {
    question: 'هل يمكن استرداد قيمة الخدمة؟',
    answer:
      'المنتجات الرقمية غير قابلة للاسترداد بعد التحميل بحكم طبيعتها. أما الخدمات فيجوز استرداد قيمتها كاملة قبل بدء التنفيذ، وبما يتناسب مع ما أُنجز بعد البدء. تفاصيل ذلك في صفحة الشروط والأحكام.',
    en: {
      question: 'Can a service be refunded?',
      answer:
        'Digital products are not refundable once downloaded, by their nature. Services are refundable in full before work begins, and proportionately to what has been done after it begins. The details are on the terms and conditions page.',
    },
  },
  {
    question: 'كم تستغرق الاستجابة للرسائل؟',
    answer:
      'الرد على رسائل الموقع وواتساب خلال يوم عمل واحد في الأحوال المعتادة. المسائل العاجلة يُشار إليها في الرسالة لتُعطى أولوية.',
    en: {
      question: 'How quickly do you reply to messages?',
      answer:
        'Messages through the website and WhatsApp are answered within one business day under normal circumstances. Flag an urgent matter in the message itself so it is given priority.',
    },
  },
];

/** السؤال وجوابه بلغة الصفحة */
export const faqText = (item: Faq, locale: 'ar' | 'en'): FaqItem =>
  locale === 'ar' ? { question: item.question, answer: item.answer } : item.en;
