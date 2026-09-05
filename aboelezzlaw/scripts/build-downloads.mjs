/**
 * يبني ملفات المنتجات الرقمية من مصادرها النصّية.
 *
 *   content/templates/*.md  ──►  private/downloads/contract-templates-pack.zip
 *
 * لماذا التوليد بدل رفع ملفات جاهزة؟
 *   • النماذج تبقى نصّاً قابلاً للتحرير والمقارنة في Git بدل ملفات ثنائية.
 *   • تعديل بند واحد لا يتطلّب إعادة رفع الحزمة كاملة.
 *   • الحزمة تُبنى بنفس الطريقة في كل مرة، فلا تختلف نسخة عن أخرى.
 *
 * التشغيل:  npm run build:downloads
 */

import { readdir, readFile, mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  AlignmentType,
  BorderStyle,
  Document,
  HeadingLevel,
  Packer,
  Paragraph,
  ShadingType,
  Table,
  TableCell,
  TableRow,
  TextRun,
  WidthType,
} from 'docx';
import JSZip from 'jszip';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const TEMPLATES_DIR = path.join(root, 'content', 'templates');
const OUTPUT_DIR = path.join(root, 'private', 'downloads');
const OUTPUT_FILE = path.join(OUTPUT_DIR, 'contract-templates-pack.zip');

const FONT = 'Arial';
const NAVY = '1A3A52';
const GOLD = 'C49D2F';
const MUTED = '5A6B7B';

/** كل فقرة عربية تحتاج bidirectional على الفقرة و rightToLeft على النص */
const rtl = (options) => ({ bidirectional: true, alignment: AlignmentType.RIGHT, ...options });

/** يحوّل نصّاً يحوي **عريض** و *مائل* و `شفرة` إلى مقاطع TextRun */
function inlineRuns(text, base = {}) {
  const runs = [];
  const pattern = /(\*\*[^*]+\*\*|\*[^*]+\*|`[^`]+`)/g;
  let last = 0;

  for (const match of text.matchAll(pattern)) {
    if (match.index > last) {
      runs.push(new TextRun({ text: text.slice(last, match.index), rightToLeft: true, font: FONT, ...base }));
    }

    const token = match[0];
    if (token.startsWith('**')) {
      runs.push(new TextRun({ text: token.slice(2, -2), bold: true, rightToLeft: true, font: FONT, ...base }));
    } else if (token.startsWith('`')) {
      runs.push(new TextRun({ text: token.slice(1, -1), font: 'Courier New', rightToLeft: true, ...base }));
    } else {
      runs.push(new TextRun({ text: token.slice(1, -1), italics: true, rightToLeft: true, font: FONT, ...base }));
    }
    last = match.index + token.length;
  }

  if (last < text.length) {
    runs.push(new TextRun({ text: text.slice(last), rightToLeft: true, font: FONT, ...base }));
  }
  return runs.length > 0 ? runs : [new TextRun({ text: '', font: FONT })];
}

const splitRow = (line) =>
  line.replace(/^\||\|$/g, '').split('|').map((cell) => cell.trim());

function buildTable(rows) {
  const [header, ...body] = rows;

  const cell = (text, isHeader) =>
    new TableCell({
      shading: isHeader ? { type: ShadingType.CLEAR, fill: 'F1F4F7' } : undefined,
      margins: { top: 80, bottom: 80, left: 120, right: 120 },
      children: [
        new Paragraph(
          rtl({
            spacing: { before: 0, after: 0 },
            children: inlineRuns(text, isHeader ? { bold: true, color: NAVY } : {}),
          }),
        ),
      ],
    });

  return new Table({
    width: { size: 100, type: WidthType.PERCENTAGE },
    visuallyRightToLeft: true,
    rows: [
      new TableRow({ tableHeader: true, children: header.map((text) => cell(text, true)) }),
      ...body.map((row) => new TableRow({ children: row.map((text) => cell(text, false)) })),
    ],
  });
}

/** محوّل Markdown مبسّط — يغطّي ما تستخدمه النماذج فقط */
function markdownToDocx(markdown) {
  const lines = markdown.split('\n');
  const children = [];
  let index = 0;

  while (index < lines.length) {
    const line = lines[index];
    const trimmed = line.trim();

    if (trimmed === '') {
      index += 1;
      continue;
    }

    // ── جدول ──
    if (trimmed.startsWith('|')) {
      const rows = [];
      while (index < lines.length && lines[index].trim().startsWith('|')) {
        const current = lines[index].trim();
        // سطر الفواصل |---|---| ليس بياناً
        if (!/^\|[\s:|-]+\|$/.test(current)) rows.push(splitRow(current));
        index += 1;
      }
      if (rows.length > 0) {
        children.push(buildTable(rows));
        children.push(new Paragraph({ text: '', spacing: { after: 160 } }));
      }
      continue;
    }

    // ── فاصل أفقي ──
    if (/^---+$/.test(trimmed)) {
      children.push(
        new Paragraph({
          text: '',
          border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'DDDDDD' } },
          spacing: { before: 200, after: 200 },
        }),
      );
      index += 1;
      continue;
    }

    // ── العناوين ──
    const heading = trimmed.match(/^(#{1,4})\s+(.*)$/);
    if (heading) {
      const level = heading[1].length;
      children.push(
        new Paragraph(
          rtl({
            heading:
              level === 1
                ? HeadingLevel.HEADING_1
                : level === 2
                  ? HeadingLevel.HEADING_2
                  : HeadingLevel.HEADING_3,
            spacing: { before: level === 1 ? 0 : 320, after: 160 },
            children: inlineRuns(heading[2], {
              bold: true,
              color: level === 1 ? NAVY : level === 2 ? NAVY : MUTED,
              size: level === 1 ? 36 : level === 2 ? 26 : 24,
            }),
          }),
        ),
      );
      index += 1;
      continue;
    }

    // ── قائمة مرقّمة ──
    const ordered = trimmed.match(/^(\d+)\.\s+(.*)$/);
    if (ordered) {
      children.push(
        new Paragraph(
          rtl({
            indent: { right: 400 },
            spacing: { after: 100 },
            children: inlineRuns(`${ordered[1]}. ${ordered[2]}`),
          }),
        ),
      );
      index += 1;
      continue;
    }

    // ── قائمة نقطية / مربّعات اختيار ──
    const bullet = trimmed.match(/^-\s+(.*)$/);
    if (bullet) {
      const checkbox = bullet[1].match(/^\[\s?\]\s+(.*)$/);
      children.push(
        new Paragraph(
          rtl({
            indent: { right: 400 },
            spacing: { after: 100 },
            children: inlineRuns(checkbox ? `☐  ${checkbox[1]}` : `•  ${bullet[1]}`),
          }),
        ),
      );
      index += 1;
      continue;
    }

    // ── فقرة عادية: تُجمع أسطرها المتصلة ──
    const buffer = [trimmed];
    index += 1;
    while (
      index < lines.length &&
      lines[index].trim() !== '' &&
      !/^([#|-]|\d+\.|---)/.test(lines[index].trim())
    ) {
      buffer.push(lines[index].trim());
      index += 1;
    }

    const text = buffer.join(' ');
    const isWarning = text.includes('⚠️');

    children.push(
      new Paragraph(
        rtl({
          spacing: { after: 140, line: 320 },
          shading: isWarning ? { type: ShadingType.CLEAR, fill: 'FFF8E6' } : undefined,
          border: isWarning
            ? { right: { style: BorderStyle.SINGLE, size: 18, color: GOLD, space: 8 } }
            : undefined,
          children: inlineRuns(text),
        }),
      ),
    );
  }

  return children;
}

/** صفحة غلاف تحمل التنبيه بأن النموذج يحتاج مراجعة قبل الاستخدام */
function coverPage(title) {
  return [
    new Paragraph(
      rtl({
        alignment: AlignmentType.CENTER,
        spacing: { before: 1200, after: 240 },
        children: [
          new TextRun({ text: 'مكتب أبو العز للمحاماة', bold: true, color: GOLD, size: 24, font: FONT, rightToLeft: true }),
        ],
      }),
    ),
    new Paragraph(
      rtl({
        alignment: AlignmentType.CENTER,
        spacing: { after: 600 },
        children: [new TextRun({ text: title, bold: true, color: NAVY, size: 48, font: FONT, rightToLeft: true })],
      }),
    ),
    new Paragraph(
      rtl({
        alignment: AlignmentType.CENTER,
        spacing: { after: 120 },
        shading: { type: ShadingType.CLEAR, fill: 'FFF8E6' },
        children: [
          new TextRun({
            text: 'نموذج استرشادي — يتطلّب المراجعة والتكييف قبل الاستخدام',
            bold: true,
            color: '8A6D1F',
            size: 22,
            font: FONT,
            rightToLeft: true,
          }),
        ],
      }),
    ),
    new Paragraph(
      rtl({
        alignment: AlignmentType.CENTER,
        spacing: { after: 1200, line: 320 },
        children: [
          new TextRun({
            text: 'هذا النموذج أداة عمل لا عقد جاهز للتوقيع. راجِع كل بند وكيّفه على وقائع حالتك والقانون الواجب التطبيق، واستشر محامياً قبل التوقيع إن كانت قيمة التعاقد معتبرة.',
            color: MUTED,
            size: 20,
            font: FONT,
            rightToLeft: true,
          }),
        ],
      }),
    ),
    new Paragraph({
      text: '',
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: 'DDDDDD' } },
      spacing: { after: 400 },
    }),
  ];
}

async function main() {
  const files = (await readdir(TEMPLATES_DIR)).filter((name) => name.endsWith('.md')).sort();

  if (files.length === 0) {
    console.error(`لا توجد نماذج في ${TEMPLATES_DIR}`);
    process.exit(1);
  }

  const zip = new JSZip();

  for (const file of files) {
    const markdown = await readFile(path.join(TEMPLATES_DIR, file), 'utf8');
    const title = markdown.match(/^#\s+(.*)$/m)?.[1] ?? path.basename(file, '.md');

    const document = new Document({
      creator: 'مكتب أبو العز للمحاماة',
      title,
      description: 'نموذج استرشادي من حزمة نماذج العقود التجارية',
      styles: {
        default: {
          document: { run: { font: FONT, size: 22 }, paragraph: { spacing: { line: 320 } } },
        },
      },
      sections: [
        {
          properties: { page: { margin: { top: 1134, bottom: 1134, left: 1134, right: 1134 } } },
          children: [...coverPage(title), ...markdownToDocx(markdown)],
        },
      ],
    });

    const buffer = await Packer.toBuffer(document);
    zip.file(file.replace(/\.md$/, '.docx'), buffer);
    console.log(`  ✓ ${file.replace(/\.md$/, '.docx')} (${(buffer.length / 1024).toFixed(1)} KB)`);
  }

  await mkdir(OUTPUT_DIR, { recursive: true });
  const archive = await zip.generateAsync({
    type: 'nodebuffer',
    compression: 'DEFLATE',
    compressionOptions: { level: 9 },
  });
  await writeFile(OUTPUT_FILE, archive);

  console.log(
    `\n✅ ${files.length} نموذجاً → ${path.relative(root, OUTPUT_FILE)} (${(archive.length / 1024).toFixed(1)} KB)`,
  );
}

main().catch((error) => {
  console.error('فشل بناء ملفات التحميل:', error);
  process.exit(1);
});
