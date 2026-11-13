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
const { about, careers, clients, khamsat, marketplace, missionValues, team } = await import('../../src/content/firm');
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

const data = {
  site,
  sectors,
  practiceGroups,
  professionalServices,
  services,
  products,
  contractTemplates,
  shippingFlatRate: SHIPPING_FLAT_RATE,
  memberships: { annualMonthsCharged: ANNUAL_MONTHS_CHARGED, audiences: memberships },
  articles: articles.map(({ body, ...rest }) => ({ ...rest, html: md(body) })),
  faqs,
  legal: {
    privacy: { ...privacyPolicy.ar, html: legalHtml(privacyPolicy.ar) },
    terms: { ...termsOfUse.ar, html: legalHtml(termsOfUse.ar) },
  },
  library: libraryItems,
  firm: { about, missionValues, team, careers, clients, khamsat, marketplace },
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

console.log(`seed ${version}: ${sectors.length} sectors, ${services.length} services, ${products.length} products, ${articles.length} articles`);
