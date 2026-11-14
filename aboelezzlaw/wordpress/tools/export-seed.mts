/**
 * يحوّل محتوى الموقع (ملفات src/content) إلى ملف بيانات واحد تستورده إضافة
 * ووردبريس. مصدر المحتوى واحد: يُعدَّل هنا في الكود أو من لوحة ووردبريس بعد
 * الاستيراد — ولا يُعاد الاستيراد فوق ما عدّله المالك (انظر المستورد).
 *
 * التشغيل: npx tsx wordpress/tools/export-seed.mts
 */
import { createHash } from 'node:crypto';
import { copyFileSync, mkdirSync, readdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { createElement } from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

const { articles } = await import('../../src/content/blog');
const { faqs } = await import('../../src/content/faq');
const { about, careers, clients, reviews, marketplace, missionValues, team } = await import('../../src/content/firm');
const platform = await import('../../src/content/platform');
const { privacyPolicy, termsOfUse } = await import('../../src/content/legal');
const { libraryItems } = await import('../../src/content/library');
const { ANNUAL_MONTHS_CHARGED, memberships } = await import('../../src/content/memberships');
const { practiceGroups, professionalServices } = await import('../../src/content/practice-areas');
const { contractTemplates, products, SHIPPING_FLAT_RATE } = await import('../../src/content/products');
const { sectors } = await import('../../src/content/sectors');
const { services } = await import('../../src/content/services');
const { site } = await import('../../src/content/site');

const root = path.resolve(import.meta.dirname, '..', '..');
const out = path.join(root, 'wordpress', 'abo-elezz-core', 'seed');

const md = (text: string) =>
  renderToStaticMarkup(createElement(ReactMarkdown, { remarkPlugins: [remarkGfm] }, text));

const legalHtml = (doc: (typeof privacyPolicy)['ar']) =>
  doc.sections
    .map(
      (section) =>
        `<h2>${section.heading}</h2>` +
        section.blocks
          .map((block) =>
            block.kind === 'p'
              ? `<p>${block.text}</p>`
              : `<ul>${block.items.map((item) => `<li>${item}</li>`).join('')}</ul>`,
          )
          .join(''),
    )
    .join('')
    .replaceAll('{email}', site.contact.publicEmail)
    .replaceAll('{phone}', site.contact.phoneLocal)
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>');

/* العضويات المسعَّرة تصير منتجات في المتجر: شهري/سنوي، أو دفعة واحدة لباقات السياح */
const membershipProducts = memberships.flatMap((audience) =>
  audience.tiers
    .filter((tier) => typeof tier.price === 'number' && tier.price > 0 && !tier.productSlug)
    .map((tier) => ({
      slug: `membership-${audience.key}-${tier.key}`,
      name: tier.oneTime
        ? `باقة ${tier.name.ar} — ${audience.name.ar} (${tier.oneTime.ar})`
        : `عضوية ${audience.name.ar} — ${tier.name.ar}`,
      kind: tier.oneTime ? 'service' : 'subscription',
      category: tier.oneTime ? 'باقات السياح' : 'العضويات',
      price: tier.price as number,
      currency: 'EGP',
      summary: audience.tagline.ar,
      description: tier.oneTime
        ? `باقة حماية قانونية مدفوعة مسبقاً ${tier.oneTime.ar} من تاريخ التفعيل. ${audience.note?.ar ?? ''}`
        : `عضوية ${tier.name.ar} لفئة ${audience.name.ar}: تُدفع مقدَّماً عن شهر أو سنة، ويُطبَّق خصم العضوية تلقائياً في السلة طوال مدتها.`,
      highlights: tier.features.map((feature) => feature.ar),
      membershipDiscount: tier.discount ?? 0,
      membershipDays: tier.oneTime ? Number(tier.oneTime.ar.replace(/\D+/g, '')) : 0,
      membershipLabel: `${audience.name.ar} — ${tier.name.ar}`,
      en: { name: `${audience.name.en} — ${tier.name.en}`, summary: audience.tagline.en, highlights: tier.features.map((feature) => feature.en) },
    })),
);
const retainerDiscounts = Object.fromEntries(
  memberships.flatMap((audience) => audience.tiers.filter((tier) => tier.productSlug && tier.discount).map((tier) => [tier.productSlug, { discount: tier.discount, label: `${audience.name.ar} — ${tier.name.ar}` }])),
);
const allProducts = [
  ...products.map((product) => ({ ...product, ...(retainerDiscounts[product.slug] ? { membershipDiscount: retainerDiscounts[product.slug].discount, membershipLabel: retainerDiscounts[product.slug].label } : {}) })),
  ...membershipProducts,
];
const membershipsOut = memberships.map((audience) => ({
  ...audience,
  tiers: audience.tiers.map((tier) => (typeof tier.price === 'number' && tier.price > 0 && !tier.productSlug ? { ...tier, productSlug: `membership-${audience.key}-${tier.key}` } : tier)),
}));

const data = {
  site,
  sectors,
  practiceGroups,
  professionalServices,
  services,
  products: allProducts,
  contractTemplates,
  shippingFlatRate: SHIPPING_FLAT_RATE,
  memberships: { annualMonthsCharged: ANNUAL_MONTHS_CHARGED, audiences: membershipsOut },
  articles: articles.map(({ body, ...rest }) => ({ ...rest, html: md(body) })),
  faqs,
  legal: {
    privacy: { ...privacyPolicy.ar, html: legalHtml(privacyPolicy.ar) },
    terms: { ...termsOfUse.ar, html: legalHtml(termsOfUse.ar) },
  },
  library: libraryItems,
  firm: { about, missionValues, team, careers, clients, reviews, marketplace },
  platform: {
    sectorGroups: platform.sectorGroups, sectorPhotos: platform.sectorPhotos, servicePhotos: platform.servicePhotos,
    categoryPhotos: platform.categoryPhotos, departments: platform.departments, departmentsNote: platform.departmentsNote,
    lawFirms: platform.lawFirms, accountTypes: platform.accountTypes, support: platform.support, quiz: platform.quiz, glossary: platform.glossary, serviceDetails: platform.serviceDetails,
  },
};

const json = JSON.stringify(data);
const version = createHash('sha256').update(json).digest('hex').slice(0, 12);
mkdirSync(out, { recursive: true });
writeFileSync(path.join(out, 'seed.json'), JSON.stringify({ version, ...data }));

// ملفات النماذج وصور الفريق ترافق البيانات
const downloads = path.join(root, 'private', 'downloads');
mkdirSync(path.join(out, 'downloads'), { recursive: true });
for (const file of readdirSync(downloads).filter((name) => /\.(docx|zip)$/.test(name))) {
  copyFileSync(path.join(downloads, file), path.join(out, 'downloads', file));
}
mkdirSync(path.join(out, 'media'), { recursive: true });
for (const file of readdirSync(path.join(root, 'public', 'brand', 'team'))) {
  copyFileSync(path.join(root, 'public', 'brand', 'team', file), path.join(out, 'media', file));
}

console.log(`seed ${version}: ${sectors.length} sectors, ${services.length} services, ${allProducts.length} products, ${articles.length} articles`);
