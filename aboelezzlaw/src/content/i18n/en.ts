import type { Dictionary } from './ar';

/**
 * English interface copy.
 *
 * The type comes from `ar.ts`, so a missing key fails the build rather than
 * surfacing to a visitor as an empty label or a stray Arabic word on an
 * English page.
 *
 * Long-form legal articles are deliberately not translated here: publishing
 * translated legal analysis under the firm's name needs the owner's review,
 * so the English blog and library list each item with its title and summary
 * and link through to the Arabic original.
 */
export const en: Dictionary = {
  nav: {
    home: 'Home',
    about: 'About',
    services: 'Services',
    store: 'Store',
    blog: 'Insights',
    library: 'Legal library',
    videos: 'Videos',
    booking: 'Book a consultation',
    contact: 'Contact',
    account: 'My account',
    cart: 'Cart',
    menu: 'Menu',
    closeMenu: 'Close menu',
    skipToContent: 'Skip to content',
    switchLanguage: 'العربية',
    switchLanguageLabel: 'Switch language to Arabic',
  },

  common: {
    firmName: 'Abo Elezz Law Firm',
    firmShort: 'Abo Elezz Law',
    tagline: 'Specialist legal services, delivered remotely',
    whatsapp: 'WhatsApp',
    whatsappUs: 'Message us on WhatsApp',
    email: 'Email',
    phone: 'Phone',
    workingHours: 'Working hours',
    required: 'required',
    optional: 'optional',
    send: 'Send',
    sending: 'Sending…',
    retry: 'Try again',
    back: 'Back',
    loading: 'Loading…',
    comingSoon: 'Coming soon',
    notifyMe: 'Notify me when available',
    readMore: 'Read more',
    viewAll: 'View all',
    details: 'Details',
    price: 'Price',
    free: 'Free',
    currency: 'EGP',
    serverError: 'Could not reach the server. Please try again.',
    checkInputs: 'Please check the details you entered.',
  },

  home: {
    heroEyebrow: 'Remote legal counsel',
    heroTitle: 'A written legal opinion you can act on',
    heroBody:
      'A practice focused on drafting and reviewing contracts, corporate disputes, and Zakat and tax matters, for clients in Egypt and Saudi Arabia. Every consultation ends with a written summary setting out the opinion, the risks, and the next step.',
    heroCta: 'Book a consultation',
    heroSecondary: 'Browse services',
    servicesEyebrow: 'Practice areas',
    servicesTitle: 'What we work on',
    servicesBody:
      'Each service has a defined scope and a written deliverable — you know what you are getting before you pay.',
    serviceDetails: 'Service details',
    whyEyebrow: 'How we work',
    whyTitle: 'Why this firm',
    storeEyebrow: 'Store',
    storeTitle: 'Services at published prices',
    storeBody: 'Pick what fits and see the price before you buy — no opening negotiation on fees.',
    storeCta: 'Browse the store',
    blogEyebrow: 'Insights',
    blogTitle: 'Articles with their sources cited',
    blogCta: 'All articles',
    ctaTitle: 'Have a specific matter?',
    ctaBody:
      'Send the details and documents, and you will receive an estimate of scope, price and timeline before you commit to anything.',
    ctaPrimary: 'Book a consultation',
    ctaSecondary: 'Message us on WhatsApp',
  },

  booking: {
    title: 'Book a consultation',
    description:
      'Choose a slot that suits you. You will receive an email confirmation once the request has been reviewed.',
    name: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    type: 'Consultation type',
    channel: 'Preferred channel',
    date: 'Date',
    time: 'Time',
    details: 'Summary of the matter',
    detailsHint:
      'At least 20 characters — a short summary helps us prepare properly before the session.',
    submit: 'Send booking request',
    choosePlaceholder: 'Choose…',
    noSlots: 'No slots available on this day. Please choose another date.',
    dayClosed: 'This day falls outside our working days.',
    slotTaken: 'Taken',
    availableCount: (count: number) => `${count} slot${count === 1 ? '' : 's'} available`,
    successTitle: 'We have your request',
    successBody:
      'You will receive an email confirmation once the request has been reviewed. If you need to change the time, message us on WhatsApp.',
    bookAnother: 'Book another slot',
  },

  contact: {
    title: 'Contact us',
    description:
      'Send your enquiry and you will have a reply within one business day. For anything urgent, WhatsApp is faster.',
    name: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    subject: 'Subject',
    message: 'Message',
    submit: 'Send message',
    successTitle: 'Your message arrived',
    successBody:
      'Thank you. We will review it and reply to your email within one business day.',
    sendAnother: 'Send another message',
    orWhatsapp: 'Or message us on WhatsApp for an immediate reply',
  },

  store: {
    title: 'Legal store',
    description:
      'Legal services at published prices: consultations, contract drafting and review, legal memoranda, internal policies, ready-to-use templates, and monthly retainers.',
    allCategories: 'All',
    addToCart: 'Add to cart',
    added: 'Added ✓',
    buyNow: 'Buy now',
    viewDetails: 'View full details',
    inCart: 'In cart',
    requiresBooking: 'Requires a booked slot',
    instantDownload: 'Instant download',
    service: 'Service',
    subscription: 'Subscription',
    shipped: 'Shipped',
    perMonth: 'per month',
    whatYouGet: 'What you get',
    highlights: 'Highlights',
    backToStore: 'Back to the store',
    askOnWhatsapp: 'Ask on WhatsApp',
    emptyCategory: 'No products in this category.',
  },

  cart: {
    title: 'Your cart',
    empty: 'Your cart is empty',
    emptyBody: 'Browse the store and pick the service that fits.',
    browseStore: 'Browse the store',
    item: 'Item',
    quantity: 'Qty',
    unitPrice: 'Unit price',
    lineTotal: 'Total',
    remove: 'Remove',
    clear: 'Empty cart',
    subtotal: 'Subtotal',
    shipping: 'Shipping',
    total: 'Total',
    checkout: 'Checkout',
    continueShopping: 'Continue shopping',
  },

  checkout: {
    title: 'Checkout',
    description: 'Your details are used only to issue the invoice and deliver the service.',
    name: 'Full name',
    email: 'Email address',
    phone: 'Phone number',
    address: 'Address',
    city: 'City',
    notes: 'Notes',
    notesHint: 'Anything that helps us carry out the service accurately.',
    method: 'Payment method',
    methodPaymob: 'Card or mobile wallet',
    methodPaypal: 'PayPal',
    methodManual: 'Bank transfer or InstaPay',
    submit: 'Confirm order',
    submitting: 'Creating your order…',
    orderSummary: 'Order summary',
    successTitle: 'Your order has been created',
    paidTitle: 'Payment confirmed',
    pendingTitle: 'Your order is awaiting payment',
    reference: 'Order reference',
    downloadsTitle: 'Download links',
    downloadsBody: 'Links are valid for 72 hours, and you can always find them in your account.',
    transferTitle: 'Transfer details',
    transferBody:
      'After transferring, send the receipt on WhatsApp so your order can be activated.',
    goToAccount: 'Go to my account',
  },

  account: {
    title: 'My account',
    description: 'Track your orders, appointments and subscriptions, and download your files.',
    loginTitle: 'Sign in without a password',
    loginBody:
      'Enter your email and you will receive a single-use sign-in link. No password to forget or have stolen.',
    loginSubmit: 'Send sign-in link',
    checkEmail: 'Check your email',
    spamHint: 'Not there? Check your spam folder.',
    sendNewLink: 'Send a new link',
    logout: 'Sign out',
    orders: 'Orders',
    bookings: 'Appointments',
    subscriptions: 'Subscriptions',
    messages: 'Messages',
    noOrders: 'No orders yet.',
    noBookings: 'No appointments yet.',
    noSubscriptions: 'No subscriptions yet.',
    noMessages: 'No messages yet.',
    download: 'Download',
    stopRenewal: 'Stop automatic renewal',
    stopRenewalConfirm:
      'Your subscription stays active until the end of the paid period, then stops. Continue?',
    renewsOn: 'Renews on',
    endsOn: 'Ends on',
    willNotRenew: 'Will not renew',
  },

  blog: {
    title: 'Insights',
    description:
      'Articles on contracts, disputes, Zakat and tax — each citing its official sources.',
    allCategories: 'All',
    readingTime: (minutes: number) => `${minutes} min read`,
    sources: 'Sources',
    backToBlog: 'Back to insights',
    relatedTitle: 'Related articles',
    arabicOnlyNotice:
      'The full text of this article is in Arabic. An English translation will be published once it has been reviewed and approved by the firm — we do not publish unreviewed legal analysis.',
  },

  library: {
    title: 'Legal library',
    description:
      'Open-access legal references — legislation, international instruments, and publications of official bodies.',
    openSource: 'Open access',
    jurisdiction: 'Jurisdiction',
    openReference: 'Open reference',
    disclaimer:
      'Links lead to the publishers’ own websites. The firm neither hosts these materials nor holds rights in them.',
  },

  videos: {
    title: 'Videos',
    description: 'Selected clips from the firm’s YouTube channel.',
    watchOnYoutube: 'Watch on YouTube',
    visitChannel: 'Visit the channel',
    empty: 'No videos are listed at the moment.',
    emptyBody: 'Please visit the channel directly on YouTube.',
  },

  services: {
    title: 'Services',
    description: 'A defined scope and a written deliverable for every service.',
    detailsAndOutputs: 'Scope and deliverables',
    scope: 'Scope',
    outputs: 'Deliverables',
    duration: 'Expected turnaround',
    bookThis: 'Book this service',
    backToServices: 'Back to services',
  },

  about: {
    title: 'About the firm',
    founderRole: 'Founder and legal consultant',
  },

  footer: {
    siteLinks: 'Site links',
    contactUs: 'Get in touch',
    privacy: 'Privacy policy',
    terms: 'Terms and conditions',
    rights: 'All rights reserved.',
    youtubeChannel: 'YouTube channel',
    disclaimer:
      'Disclaimer: the content published on this website — including the articles and the legal library — is general information. It does not constitute legal advice on any particular matter and creates no professional relationship between the reader and the firm. Relying on it without direct consultation is the reader’s own responsibility.',
  },

  notFound: {
    title: 'Page not found',
    body: 'The link you opened is not valid, or the page has moved. Try one of the sections below.',
    home: 'Back to the homepage',
  },

  validation: {
    nameShort: 'That name looks too short — please write it in full',
    nameLong: 'That name is longer than expected',
    phoneShort: 'The phone number is incomplete',
    phoneInvalid: 'That phone number does not look right',
    phoneDigits: 'The phone number should contain digits only',
    emailInvalid: 'That email address does not look right',
    subjectRequired: 'Please add a subject',
    messageShort: 'Please describe your request in at least 20 characters so we can help properly',
    messageLong: 'That message is very long — send a summary and we will follow up',
    typeRequired: 'Choose a consultation type',
    channelRequired: 'Choose your preferred channel',
    dateInvalid: 'Choose a valid date',
    datePast: 'You cannot choose a date in the past',
    timeInvalid: 'Choose one of the available slots',
    detailsShort: 'Please summarise the matter in at least 20 characters',
    cartEmpty: 'Your cart is empty',
    addressRequired: 'An address is required for items that are shipped',
  },

  api: {
    badRequest: 'The request could not be read.',
    checkInputs: 'Please check the details you entered.',
    tooManyContact: (minutes: number) =>
      `You have sent several messages in a short time. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}, or message us on WhatsApp.`,
    tooManyBooking: (minutes: number) =>
      `You have sent several booking requests. Please try again in ${minutes} minute${minutes === 1 ? '' : 's'}, or message us on WhatsApp.`,
    tooManyCheckout: 'Too many attempts. Please wait a moment and try again.',
    contactReceived: 'Your message has been received.',
    contactThanks:
      'Your message arrived. We will review it and reply to your email within one business day.',
    contactFailed:
      'We could not send your message just now. Message us on WhatsApp and we will pick it up immediately.',
    bookingReceived: 'Your request has been received.',
    bookingThanks:
      'We have your booking request. You will receive an email confirmation once it has been reviewed.',
    bookingFailed:
      'We could not send your booking request just now. Message us on WhatsApp and we will book it directly.',
    slotTaken: (date: string, time: string) =>
      `The slot on ${date} at ${time} was just taken. Please choose another available time.`,
    productGone: 'One of the items in your cart is no longer available. Refresh and try again.',
    productComingSoon: (name: string) =>
      `“${name}” is not on sale yet. Remove it from your cart and we will let you know when it is available.`,
    shippingRequired: 'Your cart contains an item that is shipped — please enter the delivery address and city.',
    addressField: 'A delivery address is required',
    cityField: 'A city is required',
    methodUnavailable: 'The payment method you chose is not available right now. Please choose another.',
    orderReceived: 'Your order has been received.',
    checkOrderData: 'Please check your order details.',
    subscriptionMix:
      'A monthly subscription cannot be combined with other items in one order. Please complete the subscription on its own.',
    accountNotConfigured: 'The account service is not set up on this site yet.',
    accountTooMany: 'Too many requests. Please try again shortly.',
    accountLinkSent: (minutes: number) =>
      `If you have orders registered to this address, a sign-in link will arrive within a few minutes. It is valid for ${minutes} minutes.`,
    accountLinkFailed: 'We could not send the sign-in link right now. Try later or contact us.',
    linkInvalid: 'That link is not valid. Please request a new one.',
    linkUsed: 'That link has already been used. Please request a new one.',
    linkExpired: 'That link has expired. Please request a new one.',
    linkIncomplete: 'That link is incomplete. Please request a new one.',
    downloadMissing: 'The download link is incomplete.',
    downloadNotConfigured:
      'The download service is not configured. Contact us and we will send the file directly.',
    downloadUnavailable: 'This product is not available for download.',
    downloadStatusChanged:
      'This link is no longer valid because the order status changed. Contact us with your order reference.',
    downloadFileMissing:
      'The file is not available at the moment. Contact us with your order reference and we will send it directly.',
  },

  clientEmail: {
    contactHeading: 'We have your message',
    contactBody:
      'Thank you for contacting the firm. We have read your message and will reply within one business day under normal circumstances. If the matter is urgent, message us directly on WhatsApp.',
    bookingHeading: 'We have your consultation request',
    bookingBody: (when: string, type: string, channel: string) =>
      `We have received your request for a consultation on ${when}.\n\nConsultation type: ${type}\nChannel: ${channel}\n\nA final confirmation of the appointment will follow once the request has been reviewed. If anything prevents you from attending, let us know before the time.`,
  },

  loginEmail: {
    heading: 'Your sign-in link',
    body: (link: string, minutes: number) =>
      `Open the link below to access your account and follow your orders and appointments:\n\n${link}\n\nThe link is valid for ${minutes} minutes and can be used once only.\n\nIf you did not request it, ignore this message — nothing will happen, and nobody can reach your account without opening this link from your inbox.`,
  },

  forms: {
    namePlaceholder: 'Full name',
    phonePlaceholder: '+20 1x xxx xxxx',
    emailPlaceholder: 'name@example.com',
    subjectPlaceholder: 'e.g. Enquiry about reviewing a supply contract',
    messagePlaceholder: 'Briefly describe your request or enquiry…',
    messageHint: 'The clearer the description, the more precise and faster the reply.',
    detailsPlaceholder: 'Summarise the matter and the documents you have…',
    addressPlaceholder: 'Street, building, apartment',
    cityPlaceholder: 'City',
    notesPlaceholder: 'Anything that helps us carry out the service accurately…',
    honeypotLabel: 'Leave this field empty',
    continueOnWhatsapp: 'Continue on WhatsApp',
    contactOnWhatsapp: (phone: string) => `Message us on WhatsApp ${phone}`,
    privacyConsent:
      'By sending this form you agree to your details being processed to answer your enquiry under our',
    privacyConsentTail:
      '. Do not send confidential documents through this form before agreeing a secure channel.',
  },

  contactPage: {
    eyebrow: 'Get in touch',
    title: 'Tell us about your matter',
    description:
      'Every message sent through this form goes straight to the firm’s mailbox and to the responsible lawyer’s WhatsApp. A reply follows within one business day under normal circumstances.',
    metaDescription:
      'Contact Abo Elezz Law Firm — by form, phone, WhatsApp or email. A reply within one business day.',
    formTitle: 'Contact form',
    requiredNote: 'Fields marked * are required.',
    phoneNote: 'During working hours',
    whatsappNote: 'Fastest reply',
    emailNote: 'For documents and formal correspondence',
    hoursNote: 'Cairo time',
    workingHoursLabel: 'Sunday to Thursday, 10:00 – 18:00',
  },

  libraryPage: {
    eyebrow: 'Legal library',
    title: 'Open-access legal references',
    description:
      'Official and institutional sources, freely and lawfully available. We link straight to the original source and never republish copyright-protected works.',
    metaDescription:
      'Open-access legal references: the Egyptian and Saudi legislation portals, UNCITRAL texts, the UNIDROIT Principles, and intellectual property and comparative law databases.',
    criteriaTitle: 'How we choose what goes here',
    criteriaBody:
      'Nothing enters this library unless it is freely available from an official body or a recognised international institution. That secures two things: the reference is authoritative enough to be relied on, and access to it is lawful and infringes nobody’s rights. When building on a legislative text in a specific matter, always return to the operative version published in the official gazette or the competent official portal.',
    openSource: 'Open the source',
  },

  videosPage: {
    eyebrow: 'Videos',
    title: 'Legal content on video',
    description:
      'This list is pulled directly from the YouTube channel and updates automatically — every new video you publish appears here with no change to the site.',
    metaDescription:
      'Legal video content from Ahmed Abo Elezz’s YouTube channel — explanations and legal guidance on contracts, companies and litigation.',
    latestCount: (count: number) => `Latest ${count} video${count === 1 ? '' : 's'} from the channel`,
    none: 'No videos are listed at the moment',
    fetchFailedTitle: 'The videos could not be fetched right now',
    fetchFailedBody:
      'Setting the YOUTUBE_CHANNEL_ID environment variable to the channel ID makes fetching faster and more reliable. Until then you can visit the channel directly.',
    openChannel: 'Open the channel on YouTube',
    fallbackNote: 'A fallback list is shown — the YouTube feed could not be reached at this moment.',
    youtube: 'YouTube',
  },

  storeExtra: {
    notifySubject: (name: string) => `Notify me when available: ${name}`,
    addedToCart: 'Added to cart',
    subscriptionInCart: 'This subscription is in your cart',
    billingPer: (period: string) => `/ ${period}`,
    assurances: [
      {
        title: 'A price known in advance',
        body: 'Each service’s scope and price are shown before purchase — no opening negotiation on fees.',
      },
      {
        title: 'Secure payment',
        body: 'Payment happens on the gateway’s own page; your card details are never stored on this site.',
      },
      {
        title: 'Several methods',
        body: 'Bank transfer, InstaPay, mobile wallets and PayPal, with cards through Paymob once enabled.',
      },
      {
        title: 'Clear delivery',
        body: 'Digital products download immediately, services begin within one business day, and printed items ship within 3–7 days.',
      },
    ],
    pageTitle: 'Legal services at published prices',
    pageDescription:
      'Choose the service that fits and see its scope, deliverables and price before buying. Payment is online, and work begins as soon as payment is confirmed.',
    billingPeriods: { 'شهري': 'monthly', 'سنوي': 'yearly' } as Record<string, string>,
  },

  productPage: {
    notFound: 'Product not found',
    detailsHeading: 'About this service',
    includesHeading: 'What it includes',
    digitalTitle: 'How you receive it',
    digitalBody:
      'Once payment is confirmed, a secured download link valid for 72 hours arrives in your inbox. Digital files are not refundable once downloaded, by their nature.',
    shippingTitle: 'Shipping',
    shippingBody: (fee: string) =>
      `A flat shipping charge of ${fee} applies within Egypt, and the order arrives within 3–7 business days. For shipping outside Egypt, contact us to agree the carriage before ordering.`,
    bookingTitle: 'Scheduling the session',
    bookingBody:
      'After completing payment, book the session on the booking page. You may also book the slot first and pay once it is confirmed.',
    goToBooking: 'Go to the booking page',
    sessionLength: 'Session length',
    minutes: (count: number) => `${count} minutes`,
    pageCount: 'Pages',
    category: 'Category',
    paymentNote: 'Payment happens on the gateway’s page — your card details are not stored here.',
    questionTitle: 'A question before you buy?',
    questionBody:
      'If you are not sure this service fits your situation, message us and explain the matter — we will point you to the right option, even if it is a cheaper one.',
    enquiryMessage: (name: string) => `Hello, I have a question about: ${name}`,
    sameCategory: 'From the same category',
  },

  cartPage: {
    eyebrow: 'Cart',
    title: 'Review your order',
    description: 'Check the items and quantities before continuing to payment.',
    loading: 'Loading your cart…',
    emptyBody:
      'Browse the store and pick the service that fits — every service has its scope and price shown in advance.',
    decrease: (name: string) => `Decrease quantity of ${name}`,
    increase: (name: string) => `Increase quantity of ${name}`,
    removeItem: (name: string) => `Remove ${name} from the cart`,
    subtotalLabel: 'Subtotal',
    noShipping: 'None',
    proceed: 'Continue to payment',
  },

  checkoutExtra: {
    buyerDetails: 'Your details',
    emailHint: 'Your order confirmation and digital download links go to this address.',
    shippingAddress: 'Delivery address',
    notesOptional: 'Notes (optional)',
    cardNote:
      'Card payment takes place on the payment gateway’s own page. This site never receives or stores your card details at any stage.',
    processing: 'Processing…',
    confirmAndPay: 'Confirm order and pay',
    agreePrefix: 'By confirming you agree to the',
    agreeAnd: 'and the',
    registeredTitle: 'Your order is registered',
    registeredBody:
      'We have your order and a confirmation has been emailed to you. Complete the transfer using the details below and the order will be activated.',
    copyDetails: 'Copy details',
    sendReceipt: 'Send the receipt on WhatsApp',
    receiptMessage: (reference: string) =>
      `Hello, here is the transfer receipt for order ${reference}`,
    emptyBody: 'Add a service or product before continuing to payment.',
    orderFailed: 'The order could not be completed.',
    completeOnWhatsapp: (phone: string) => `Complete the order on WhatsApp ${phone}`,
    pageTitle: 'Checkout',
    pageDescription: 'Review your order, enter your details, and choose a payment method.',
  },

  checkoutPage: {
    eyebrow: 'Checkout',
    title: 'Order details and payment',
    description:
      'One step from completing your order. Your details are used only to carry it out and to contact you about it.',
    noProvidersTitle: 'Payment methods are not configured yet',
    noProvidersBody:
      'No payment provider has been configured in the environment variables. See the README to set up at least the bank transfer details — an option that works immediately with no gateway account.',
  },

  successPage: {
    metaTitle: 'Order received',
    eyebrow: 'Done',
    title: 'We have your order',
    description:
      'The payment notification has arrived and work begins right away. The order details have been emailed to you.',
    thanks: 'Thank you for your trust',
    yourReference: 'Your order reference:',
    keepReference: 'Keep this reference to quote in any correspondence.',
    whatHappens: 'What happens now:',
    steps: [
      'A confirmation email with the order details arrives.',
      'Digital products: a download link valid for 72 hours arrives.',
      'Services: we contact you within one business day to begin.',
      'Consultations: book your slot on the booking page.',
      'Printed items: shipped within 3–7 business days.',
    ],
    bookSlot: 'Book a consultation slot',
    followUp: 'Follow up on WhatsApp',
    followUpMessage: (reference: string) => `Hello, regarding my order ${reference}`,
  },

  bookingForm: {
    receivedTitle: 'We have your booking request',
    receivedBody:
      'A confirmation has been emailed to you. The appointment becomes final once the firm confirms it.',
    quickConfirm: 'Quick confirmation on WhatsApp',
    confirmMessage: 'Hello, I booked a consultation slot through the website and would like to confirm it.',
    dateLabel: 'Preferred date',
    pickDateFirst: 'Choose a date first to see the available slots.',
    dayClosedWithHours: (hours: string) => `This day falls outside our working days. ${hours}`,
    checkingSlots: 'Checking the available slots…',
    allTaken:
      'Every slot on this day is taken. Choose another day, or message us on WhatsApp for an exceptional time.',
    slotTakenTitle: 'This slot is taken',
    timezoneNote:
      'Times are Cairo time. A booking is a provisional request, fixed once the firm confirms it.',
    detailsHint:
      'Set out the substance of the matter and the documents you have — it saves time in the session.',
    detailsPlaceholder:
      'For example: I have an annual supply contract with a foreign supplier and want the termination and liability clauses reviewed before signing.',
    bookOnWhatsapp: (phone: string) => `Book directly on WhatsApp ${phone}`,
    submitting: 'Sending your request…',
    submit: 'Confirm booking request',
    serverError: 'Could not reach the server. Message us on WhatsApp to fix the appointment.',
    consultationTypes: {
      'استشارة قانونية عامة': 'General legal consultation',
      'مراجعة أو صياغة عقد': 'Contract review or drafting',
      'استشارات الشركات والحوكمة': 'Corporate and governance advice',
      'الزكاة والضرائب': 'Zakat and tax',
      'منازعات وتحكيم': 'Disputes and arbitration',
      'عقود ولوائح العمل': 'Employment contracts and policies',
      'الملكية الفكرية': 'Intellectual property',
      'أخرى': 'Other',
    } as Record<string, string>,
    consultationChannels: {
      'مكالمة هاتفية': 'Phone call',
      'واتساب': 'WhatsApp',
      'اجتماع مرئي (Zoom / Meet)': 'Video meeting (Zoom / Meet)',
      'حضور بالمكتب': 'In person at the office',
    } as Record<string, string>,
  },

  bookingPage: {
    eyebrow: 'Booking',
    title: 'Book a legal consultation',
    description: (hours: string) => `Fill in your details and choose a time that suits you. ${hours}`,
    metaDescription:
      'Book a legal consultation with Abo Elezz Law Firm — choose the date, time and channel, and receive confirmation within one business day.',
    howItWorks: 'How a consultation runs',
    notesTitle: 'Important notes',
    notes: [
      'A booking is a provisional request and becomes final only once the firm confirms it.',
      'The times shown are Cairo time.',
      'To cancel or move an appointment, contact us at least 24 hours beforehand.',
      'Do not send confidential documents before agreeing a secure channel.',
    ],
    formTitle: 'Booking details',
    formNote:
      'The request reaches the firm immediately by email and WhatsApp, and the appointment is fixed once confirmed.',
    steps: [
      {
        title: 'Choose a time',
        body: 'Pick a date and hour from the slots available within working days.',
      },
      {
        title: 'Send the documents',
        body: 'Send whatever documents you have before the session so they can be studied in advance.',
      },
      {
        title: 'The session',
        body: 'A discussion focused on the opinion and the options, not on gathering information.',
      },
      { title: 'The summary', body: 'You receive a written summary of the opinion and next steps.' },
    ],
  },

  orderStatus: {
    pending: 'Awaiting payment',
    paid: 'Paid',
    failed: 'Payment failed',
    refunded: 'Refunded',
    cancelled: 'Cancelled',
  },

  bookingStatus: {
    pending: 'Awaiting confirmation',
    confirmed: 'Confirmed',
    completed: 'Completed',
    cancelled: 'Cancelled',
  },

  subscriptionStatus: {
    pending: 'Activating',
    active: 'Active',
    past_due: 'Past due',
    cancelled: 'Cancelled',
    expired: 'Expired',
  },
};
