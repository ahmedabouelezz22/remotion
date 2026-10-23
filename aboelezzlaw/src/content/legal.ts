import type { Locale } from '@/content/i18n';

/**
 * السياسات القانونية بلغتيها، مبنيّةً لا مكتوبةً في JSX.
 *
 * السبب: نسختان من نفس النصّ في شجرتي JSX منفصلتين تتباعدان مع أول تعديل —
 * يُحدَّث النصّ العربي وتبقى الإنجليزية على حالها فتصير السياسة المنشورة
 * متناقضة بين اللغتين، وهذا في وثيقة ملزِمة خطأ لا يُحتمل. بوضع النصّ
 * بنيةً واحدة يُرى الفرق فوراً وتُحدَّثان معاً.
 *
 * `{email}` و `{phone}` تُستبدل وقت العرض، و`**نصّ**` يصير تأكيداً.
 */

export type Block =
  | { kind: 'p'; text: string }
  | { kind: 'ul'; items: string[] };

export interface LegalSection {
  heading: string;
  blocks: Block[];
}

export interface LegalDoc {
  eyebrow: string;
  title: string;
  description: string;
  metaTitle: string;
  metaDescription: string;
  updatedLabel: string;
  sections: LegalSection[];
}

const privacyAr: LegalDoc = {
  eyebrow: 'سياسة الخصوصية',
  title: 'كيف نتعامل مع بياناتك',
  description: 'سياسة مكتوبة لتصف ما يحدث فعلاً على هذا الموقع، لا صيغة عامة منسوخة.',
  metaTitle: 'سياسة الخصوصية',
  metaDescription: 'كيف يجمع مكتب أبو العز للمحاماة بياناتك الشخصية ويستخدمها ويحميها.',
  updatedLabel: 'آخر تحديث',
  sections: [
    {
      heading: 'ما البيانات التي نجمعها',
      blocks: [
        { kind: 'p', text: 'لا يجمع هذا الموقع إلا ما ترسله أنت طوعاً عبر أحد نماذجه:' },
        {
          kind: 'ul',
          items: [
            '**نموذج اتصل بنا:** الاسم، البريد الإلكتروني، رقم الهاتف، موضوع الرسالة ونصّها.',
            '**نموذج حجز الاستشارة:** ما سبق، إضافةً إلى نوع الاستشارة ووسيلة التواصل المفضّلة والموعد المطلوب وملخّص الموضوع.',
            '**إتمام الطلب:** ما سبق، إضافةً إلى عنوان الشحن والمدينة إذا كان الطلب يتضمّن منتجاً يُشحن.',
          ],
        },
        {
          kind: 'p',
          text: 'لا يستقبل هذا الموقع بيانات بطاقتك البنكية ولا يخزّنها في أي مرحلة. الدفع بالبطاقة يتم بالكامل على صفحة بوابة الدفع، ولا يصلنا منها إلا نتيجة العملية (نجاح أو فشل) ورقم العملية.',
        },
      ],
    },
    {
      heading: 'لماذا نعالج هذه البيانات',
      blocks: [
        {
          kind: 'ul',
          items: [
            'الرد على استفسارك أو تنفيذ الخدمة التي طلبتها — وهو أساس تنفيذ العقد.',
            'تأكيد موعد الاستشارة والتواصل بشأنه.',
            'إصدار روابط تحميل المنتجات الرقمية وشحن المطبوعات.',
            'الاحتفاظ بسجلّ المراسلات بما تقتضيه الالتزامات المهنية والقانونية.',
          ],
        },
        {
          kind: 'p',
          text: 'لا نستخدم بياناتك في تسويق مباشر ولم نُنشئ قوائم بريدية تسويقية على هذا الموقع.',
        },
      ],
    },
    {
      heading: 'من يطّلع على بياناتك',
      blocks: [
        {
          kind: 'p',
          text: 'بيانات النماذج تُرسل إلى بريد المكتب وإلى وسائل الإشعار الفوري الخاصة به فقط. ويستعين الموقع بمزوّدي خدمة تقنيين لتشغيل هذه الوظائف — استضافة الموقع، وإرسال البريد، وإشعارات الرسائل الفورية، وبوابة الدفع — ويعالج كلٌّ منهم البيانات لحسابنا وبقدر ما يلزم لأداء وظيفته فقط.',
        },
        {
          kind: 'p',
          text: 'السرّية المهنية تحكم محتوى الاستشارات والمستندات: لا يُفصح عنها لأي طرف ثالث إلا بموافقتك الكتابية أو تنفيذاً لالتزام قانوني.',
        },
      ],
    },
    {
      heading: 'مدة الاحتفاظ',
      blocks: [
        {
          kind: 'ul',
          items: [
            'رسائل الاستفسار العامة: تُحفظ سنتين ثم تُحذف.',
            'بيانات الطلبات والفواتير: تُحفظ للمدة التي تفرضها الالتزامات المحاسبية والضريبية.',
            'ملفات الموكّلين: تُحفظ للمدة التي تفرضها قواعد المهنة.',
          ],
        },
      ],
    },
    {
      heading: 'حقوقك',
      blocks: [
        {
          kind: 'p',
          text: 'لك أن تطلب الاطّلاع على بياناتك لدينا، أو تصحيحها، أو محوها، أو الاعتراض على معالجتها، أو سحب موافقتك. يُقدَّم الطلب على البريد {email} ونستجيب له خلال مدة معقولة، ما لم يقم مانع قانوني — كالتزام مهني بالاحتفاظ بملف الموكّل.',
        },
      ],
    },
    {
      heading: 'ملفات تعريف الارتباط',
      blocks: [
        {
          kind: 'p',
          text: 'لا يستخدم هذا الموقع ملفات تعريف ارتباط تتبّعية ولا أدوات تحليلات تتعقّب الزوار عبر المواقع. تُحفظ محتويات سلة التسوّق في التخزين المحلي لمتصفّحك وحده (localStorage)، ولا تُرسل إلينا إلا عند إتمامك للطلب.',
        },
      ],
    },
    {
      heading: 'أمن البيانات',
      blocks: [
        {
          kind: 'p',
          text: 'يعمل الموقع عبر اتصال مشفّر (HTTPS)، وتُحفظ مفاتيح الخدمات في متغيّرات بيئة على الخادم لا تُعرَض في المتصفّح. وروابط تحميل المنتجات الرقمية موقّعة تشفيرياً ومحدودة المدة، فلا يمكن تخمينها ولا إعادة استخدامها بعد انتهائها.',
        },
      ],
    },
    {
      heading: 'التواصل بشأن الخصوصية',
      blocks: [
        { kind: 'p', text: 'لأي استفسار يتعلّق بهذه السياسة: {email} — أو هاتفياً على {phone}.' },
      ],
    },
  ],
};

const privacyEn: LegalDoc = {
  eyebrow: 'Privacy policy',
  title: 'How we handle your data',
  description:
    'A policy written to describe what actually happens on this website, not a copied boilerplate.',
  metaTitle: 'Privacy policy',
  metaDescription:
    'How Abo Elezz Law Firm collects, uses and protects your personal data.',
  updatedLabel: 'Last updated',
  sections: [
    {
      heading: 'What data we collect',
      blocks: [
        { kind: 'p', text: 'This website collects only what you send voluntarily through one of its forms:' },
        {
          kind: 'ul',
          items: [
            '**Contact form:** name, email address, phone number, subject and body of the message.',
            '**Consultation booking form:** the above, plus the consultation type, preferred channel, requested time and a summary of the matter.',
            '**Completing an order:** the above, plus the delivery address and city where the order includes an item that is shipped.',
          ],
        },
        {
          kind: 'p',
          text: 'This website never receives or stores your card details at any stage. Card payment takes place entirely on the payment gateway’s own page, and all we receive is the outcome of the transaction (success or failure) and its reference.',
        },
      ],
    },
    {
      heading: 'Why we process it',
      blocks: [
        {
          kind: 'ul',
          items: [
            'To answer your enquiry or carry out the service you requested — the performance of our contract.',
            'To confirm the consultation appointment and communicate about it.',
            'To issue download links for digital products and to ship printed items.',
            'To keep a record of correspondence as professional and legal obligations require.',
          ],
        },
        {
          kind: 'p',
          text: 'We do not use your data for direct marketing, and no marketing mailing lists have been created on this website.',
        },
      ],
    },
    {
      heading: 'Who sees your data',
      blocks: [
        {
          kind: 'p',
          text: 'Form submissions are sent to the firm’s mailbox and its own instant-notification channels only. The website relies on technical service providers to run these functions — hosting, email delivery, instant-messaging notifications, and the payment gateway — and each processes the data on our behalf and only so far as its function requires.',
        },
        {
          kind: 'p',
          text: 'Professional confidentiality governs the content of consultations and documents: it is not disclosed to any third party except with your written consent or in performance of a legal obligation.',
        },
      ],
    },
    {
      heading: 'Retention periods',
      blocks: [
        {
          kind: 'ul',
          items: [
            'General enquiry messages: kept for two years, then deleted.',
            'Order and invoice data: kept for the period imposed by accounting and tax obligations.',
            'Client files: kept for the period imposed by the rules of the profession.',
          ],
        },
      ],
    },
    {
      heading: 'Your rights',
      blocks: [
        {
          kind: 'p',
          text: 'You may ask to access the data we hold about you, to correct it, to erase it, to object to its processing, or to withdraw your consent. Requests go to {email} and we respond within a reasonable period, unless a legal impediment applies — such as a professional obligation to retain a client file.',
        },
      ],
    },
    {
      heading: 'Cookies',
      blocks: [
        {
          kind: 'p',
          text: 'This website uses no tracking cookies and no analytics tools that follow visitors across sites. The contents of your shopping cart are kept in your own browser’s local storage (localStorage) and are sent to us only when you complete an order.',
        },
      ],
    },
    {
      heading: 'Data security',
      blocks: [
        {
          kind: 'p',
          text: 'The site runs over an encrypted connection (HTTPS), and service keys are held in server environment variables that are never exposed to the browser. Download links for digital products are cryptographically signed and time-limited, so they cannot be guessed or reused once they expire.',
        },
      ],
    },
    {
      heading: 'Privacy enquiries',
      blocks: [
        { kind: 'p', text: 'For any question about this policy: {email} — or by phone on {phone}.' },
      ],
    },
  ],
};

const termsAr: LegalDoc = {
  eyebrow: 'الشروط والأحكام',
  title: 'شروط الاستخدام والشراء',
  description: 'اقرأ هذه الشروط قبل استخدام الموقع أو شراء أي خدمة منه.',
  metaTitle: 'الشروط والأحكام',
  metaDescription: 'شروط استخدام موقع مكتب أبو العز للمحاماة وشروط شراء الخدمات والمنتجات منه.',
  updatedLabel: 'آخر تحديث',
  sections: [
    {
      heading: 'طبيعة المحتوى المنشور',
      blocks: [
        {
          kind: 'p',
          text: 'المحتوى المنشور على هذا الموقع — بما فيه مقالات المدونة وصفحات الخدمات والمكتبة القانونية — ذو طبيعة تعريفية عامة. **ولا يُعدّ استشارة قانونية** في واقعة بعينها، ولا تنشأ بمجرّد تصفّحه أو الاعتماد عليه أي علاقة مهنية بين الزائر والمكتب. العلاقة المهنية لا تنشأ إلا باتفاق صريح يحدّد نطاق العمل والأتعاب.',
        },
      ],
    },
    {
      heading: 'الطلبات والأسعار',
      blocks: [
        {
          kind: 'ul',
          items: [
            'الأسعار المعروضة بالجنيه المصري وتشمل الخدمة الموصوفة في صفحة المنتج فقط.',
            'يُحتسب الشحن بشكل منفصل للمنتجات المطبوعة ويظهر قبل الدفع.',
            'يُعتمد سعر الخدمة كما هو مسجَّل على الخادم وقت إتمام الطلب، لا كما يظهر في متصفّح العميل.',
            'للمكتب أن يعتذر عن تنفيذ طلب — مع ردّ قيمته كاملة — إذا تبيّن بعد الاطّلاع أن نطاق العمل يتجاوز وصف الخدمة المشتراة جوهرياً، أو أن تنفيذها يخلّ بالتزام مهني.',
          ],
        },
      ],
    },
    {
      heading: 'التنفيذ والتسليم',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**المنتجات الرقمية:** يصلك رابط تحميل مؤمَّن صالح 72 ساعة بعد تأكيد الدفع. عند انتهاء صلاحيته يُصدَر رابط جديد بناءً على طلبك.',
            '**الخدمات:** يبدأ التنفيذ خلال يوم عمل من استلام المستندات المطلوبة، وتُحتسب مدة التسليم المعلنة من تاريخ اكتمال المستندات لا من تاريخ الدفع.',
            '**الاستشارات:** يُثبَّت الموعد بعد تأكيد المكتب. طلب الحجز وحده لا يُعدّ حجزاً نهائياً.',
            '**المنتجات المطبوعة:** تُشحن خلال 3–7 أيام عمل داخل مصر.',
          ],
        },
      ],
    },
    {
      heading: 'الإلغاء والاسترداد',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**المنتجات الرقمية:** غير قابلة للاسترداد بعد التحميل بحكم طبيعتها. أما إن تعذّر التحميل لخلل من جانبنا ولم يُعالَج، فتُردّ القيمة كاملة.',
            '**الخدمات:** تُردّ القيمة كاملة قبل بدء التنفيذ. وبعد البدء يُردّ ما يقابل الجزء غير المنفَّذ.',
            '**الاستشارات:** يجوز الإلغاء أو التأجيل قبل الموعد بأربع وعشرين ساعة على الأقل. أما التخلّف عن الموعد دون إشعار فتُستحقّ عنه الأتعاب كاملة.',
            '**الاشتراكات:** تُلغى بإشعار قبل بدء الدورة التالية، ولا تُردّ قيمة الدورة الجارية.',
            '**المنتجات المطبوعة:** تُردّ خلال 14 يوماً من الاستلام بحالتها الأصلية، وتقع أجرة الإرجاع على المشتري ما لم يكن السبب عيباً في المنتج.',
          ],
        },
        { kind: 'p', text: 'يُقدَّم طلب الاسترداد على {email} مرفقاً برقم الطلب.' },
      ],
    },
    {
      heading: 'التزامات العميل',
      blocks: [
        {
          kind: 'ul',
          items: [
            'تقديم معلومات صحيحة وكاملة؛ فدقّة الرأي القانوني رهن بدقّة ما يُعرض عليه.',
            'عدم إرسال مستندات لا يملك حق التصرّف فيها أو الإفصاح عنها.',
            'استخدام النماذج والوثائق المشتراة لأغراضه الخاصة فقط — ولا يجوز إعادة بيعها ولا توزيعها ولا نشرها.',
          ],
        },
      ],
    },
    {
      heading: 'الملكية الفكرية',
      blocks: [
        {
          kind: 'p',
          text: 'جميع محتويات الموقع من نصوص ومقالات ونماذج مملوكة للمكتب ومحمية قانوناً. يجوز الاقتباس منها مع الإسناد والإحالة إلى المصدر، ولا يجوز إعادة نشرها بالكامل أو استخدامها تجارياً دون إذن كتابي.',
        },
      ],
    },
    {
      heading: 'حدود المسؤولية',
      blocks: [
        {
          kind: 'p',
          text: 'لا يتحمّل المكتب مسؤولية عن قرار اتُّخذ استناداً إلى محتوى الموقع العام دون استشارة مباشرة. أما مسؤوليته عن الخدمات المنفَّذة فتخضع لأحكام المسؤولية المهنية المقرّرة قانوناً، ولا يجوز الاتفاق على الإعفاء منها في حالات الغش أو الخطأ الجسيم.',
        },
      ],
    },
    {
      heading: 'القانون الواجب التطبيق',
      blocks: [
        {
          kind: 'p',
          text: 'تخضع هذه الشروط لأحكام القانون المصري، وتختصّ المحاكم المصرية بنظر ما ينشأ عنها من منازعات، ما لم يُتفق كتابةً على خلاف ذلك في عقد الخدمة.',
        },
      ],
    },
    {
      heading: 'تعديل الشروط',
      blocks: [
        {
          kind: 'p',
          text: 'يجوز تعديل هذه الشروط، وتسري النسخة المنشورة وقت إتمام الطلب على ذلك الطلب. يُنصح بمراجعة الصفحة دورياً.',
        },
      ],
    },
  ],
};

const termsEn: LegalDoc = {
  eyebrow: 'Terms and conditions',
  title: 'Terms of use and purchase',
  description: 'Please read these terms before using the website or buying any service from it.',
  metaTitle: 'Terms and conditions',
  metaDescription:
    'The terms for using the Abo Elezz Law Firm website and for purchasing its services and products.',
  updatedLabel: 'Last updated',
  sections: [
    {
      heading: 'The nature of the published content',
      blocks: [
        {
          kind: 'p',
          text: 'The content published on this website — including the articles, the service pages and the legal library — is general information. **It does not constitute legal advice** on any particular matter, and no professional relationship arises between a visitor and the firm merely by browsing it or relying on it. A professional relationship arises only under an express engagement that defines the scope of work and the fees.',
        },
      ],
    },
    {
      heading: 'Orders and prices',
      blocks: [
        {
          kind: 'ul',
          items: [
            'Prices are shown in Egyptian pounds and cover only the service described on the product page.',
            'Shipping is calculated separately for printed items and is shown before payment.',
            'The price applied is the one recorded on the server at the time the order is completed, not the one displayed in the customer’s browser.',
            'The firm may decline to carry out an order — refunding it in full — if, on review, the scope of work materially exceeds the description of the purchased service, or if carrying it out would breach a professional obligation.',
          ],
        },
      ],
    },
    {
      heading: 'Performance and delivery',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**Digital products:** you receive a secured download link valid for 72 hours after payment is confirmed. Once it expires, a new link is issued on request.',
            '**Services:** work begins within one business day of receiving the required documents, and the stated delivery period runs from the date the documents are complete, not from the date of payment.',
            '**Consultations:** the appointment is fixed once the firm confirms it. A booking request alone is not a final reservation.',
            '**Printed items:** shipped within 3–7 business days within Egypt.',
          ],
        },
      ],
    },
    {
      heading: 'Cancellation and refunds',
      blocks: [
        {
          kind: 'ul',
          items: [
            '**Digital products:** not refundable once downloaded, by their nature. Where the download fails through a fault on our side and is not remedied, the price is refunded in full.',
            '**Services:** refunded in full before work begins. After work has begun, the portion not yet performed is refunded.',
            '**Consultations:** may be cancelled or postponed at least twenty-four hours before the appointment. Failure to attend without notice renders the full fee payable.',
            '**Subscriptions:** cancelled by notice before the next period begins; the current period is not refunded.',
            '**Printed items:** returnable within 14 days of receipt in their original condition, with return carriage borne by the buyer unless the cause is a defect in the item.',
          ],
        },
        { kind: 'p', text: 'Refund requests go to {email}, quoting the order reference.' },
      ],
    },
    {
      heading: 'The client’s obligations',
      blocks: [
        {
          kind: 'ul',
          items: [
            'To provide accurate and complete information; the accuracy of a legal opinion depends on the accuracy of what is put before it.',
            'Not to send documents the client has no right to deal with or to disclose.',
            'To use purchased templates and documents for the client’s own purposes only — they may not be resold, distributed or published.',
          ],
        },
      ],
    },
    {
      heading: 'Intellectual property',
      blocks: [
        {
          kind: 'p',
          text: 'All content on the website — text, articles and templates — belongs to the firm and is protected by law. It may be quoted with attribution and a reference to the source; it may not be republished in full or used commercially without written permission.',
        },
      ],
    },
    {
      heading: 'Limits of liability',
      blocks: [
        {
          kind: 'p',
          text: 'The firm bears no responsibility for a decision taken on the basis of the website’s general content without direct consultation. Its liability for services actually performed is governed by the professional liability rules laid down by law, and liability may not be excluded by agreement in cases of fraud or gross fault.',
        },
      ],
    },
    {
      heading: 'Governing law',
      blocks: [
        {
          kind: 'p',
          text: 'These terms are governed by Egyptian law, and the Egyptian courts have jurisdiction over any dispute arising from them, unless otherwise agreed in writing in the service contract.',
        },
      ],
    },
    {
      heading: 'Changes to these terms',
      blocks: [
        {
          kind: 'p',
          text: 'These terms may be amended, and the version published at the time an order is completed applies to that order. Periodic review of this page is advisable.',
        },
      ],
    },
  ],
};

export const privacyPolicy: Record<Locale, LegalDoc> = { ar: privacyAr, en: privacyEn };
export const termsOfUse: Record<Locale, LegalDoc> = { ar: termsAr, en: termsEn };
