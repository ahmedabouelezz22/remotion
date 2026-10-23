/**
 * فحص المتصفّح الحقيقي: تخطيط الهاتف واللوحي والحاسب، اتجاه العربية،
 * إمكانية الوصول، والروابط المكسورة.
 *
 * لماذا متصفّح حقيقي ولا فحص للـ HTML؟ لأن ما يُشتكى منه فعلاً — تمرير أفقي
 * على الهاتف، نصّ يخرج من حدّه، زرّ أصغر من أن يُلمس، تباين لا يُقرأ — لا
 * يظهر إلا بعد حساب التنسيق. فحص النصّ وحده يُمرّر كل هذه العيوب.
 */
import { chromium } from 'playwright';
import { existsSync, readFileSync } from 'node:fs';
import { createRequire } from 'node:module';

const require = createRequire(import.meta.url);
const AXE_SOURCE = readFileSync(require.resolve('axe-core/axe.min.js'), 'utf8');

const BASE = process.env.BASE ?? 'https://localhost:3443';

/**
 * المتصفّح مثبَّت في بيئة التشغيل مسبقاً بنسخة قد لا تطابق ما تتوقّعه حزمة
 * playwright، فنشير إلى الملف التنفيذي صراحةً بدل تنزيل نسخة ثانية.
 * CHROMIUM_PATH يسمح للبيئات الأخرى (ومنها CI) بتجاوز المسار.
 */
const CHROMIUM_PATH =
  process.env.CHROMIUM_PATH ??
  ['/opt/pw-browsers/chromium-1243/chrome-linux64/chrome', '/opt/pw-browsers/chromium/chrome']
    .find((candidate) => existsSync(candidate));

/**
 * الصفحات العامة بلا بادئة لغة — لا تشمل /admin (يُفحص بجلسة مالك في
 * مجموعة منفصلة). كل مسار يُفحص بالعربية والإنجليزية.
 */
const PAGES = [
  ['/', 'الرئيسية'],
  ['/about', 'عن المكتب'],
  ['/services', 'الخدمات'],
  ['/services/contract-review', 'خدمة واحدة'],
  ['/store', 'المتجر'],
  ['/store/contract-templates-pack', 'منتج واحد'],
  ['/cart', 'السلة'],
  ['/booking', 'الحجز'],
  ['/contact', 'اتصل بنا'],
  ['/blog', 'المدونة'],
  ['/blog/limitation-of-liability-clause', 'مقال واحد'],
  ['/library', 'المكتبة'],
  ['/videos', 'الفيديوهات'],
  ['/account', 'الحساب'],
  ['/privacy', 'الخصوصية'],
  ['/terms', 'الشروط'],
  ['/does-not-exist', 'صفحة غير موجودة'],
];

/** خصائص كل لغة: البادئة، الاتجاه، ولغة المتصفّح المحاكاة */
const LOCALES = {
  ar: { dir: 'rtl', browserLocale: 'ar-EG' },
  en: { dir: 'ltr', browserLocale: 'en-US' },
};

/** المسار الكامل: الجذر يصير /ar أو /en بلا شرطة زائدة */
const localePath = (locale, to) => (to === '/' ? `/${locale}` : `/${locale}${to}`);

/**
 * العربية تُفحص على المقاسات الثلاثة لأنها لغة الموقع الأصلية، والإنجليزية
 * على الهاتف والحاسب — وهما المقاسان اللذان يكشفان انقلاب الاتجاه وتجاوز
 * الحدود. إضافة اللوحي بالإنجليزية تضاعف زمن الفحص بلا كشف جديد.
 */
const VIEWPORTS = [
  { name: 'هاتف', width: 390, height: 844, mobile: true, locales: ['ar', 'en'] },
  { name: 'لوحي', width: 820, height: 1180, mobile: false, locales: ['ar'] },
  { name: 'حاسب', width: 1440, height: 900, mobile: false, locales: ['ar', 'en'] },
];

let pass = 0;
const failures = [];
const ok = (what) => {
  pass += 1;
  return what;
};
const bad = (what, detail) => {
  failures.push(`${what}${detail ? ` — ${detail}` : ''}`);
};
const check = (condition, what, detail) => (condition ? ok(what) : bad(what, detail));

/** العيوب التي نعتبرها مانعة: ما يمنع الاستخدام أو يُفقد المعنى */
const BLOCKING_AXE_RULES = new Set([
  'image-alt',
  'label',
  'button-name',
  'link-name',
  'html-has-lang',
  'html-lang-valid',
  'valid-lang',
  'document-title',
  'aria-required-attr',
  'aria-valid-attr-value',
  'duplicate-id-aria',
  'form-field-multiple-labels',
  'frame-title',
  'input-button-name',
  'select-name',
  'color-contrast',
  'meta-viewport',
]);

const run = async () => {
  const browser = await chromium.launch({
    ...(CHROMIUM_PATH ? { executablePath: CHROMIUM_PATH } : {}),
    args: ['--ignore-certificate-errors'],
  });

  const internalLinks = new Set();

  for (const viewport of VIEWPORTS) {
    for (const locale of viewport.locales) {
      const context = await browser.newContext({
        viewport: { width: viewport.width, height: viewport.height },
        ignoreHTTPSErrors: true,
        isMobile: viewport.mobile,
        hasTouch: viewport.mobile,
        deviceScaleFactor: viewport.mobile ? 3 : 1,
        locale: LOCALES[locale].browserLocale,
      });
      const page = await context.newPage();

      const consoleErrors = [];
      page.on('console', (message) => {
        if (message.type() === 'error') consoleErrors.push(message.text());
      });
      page.on('pageerror', (error) => consoleErrors.push(String(error)));

      console.log(
        `\n── ${viewport.name} (${viewport.width}×${viewport.height}) — ${locale} ──`,
      );

      for (const [to, pageLabel] of PAGES) {
        const label = `${pageLabel} [${locale}]`;
        const path = localePath(locale, to);
        consoleErrors.length = 0;
        const expected404 = to === '/does-not-exist';
        let response;
        try {
          response = await page.goto(`${BASE}${path}`, {
            waitUntil: 'networkidle',
            timeout: 45_000,
          });
        } catch (error) {
          bad(`${label}: فتح الصفحة`, String(error).slice(0, 140));
          continue;
        }

        const status = response?.status() ?? 0;
        check(
          expected404 ? status === 404 : status === 200,
          `${label}: الحالة`,
          `${status}`,
        );

        // الاتجاه واللغة — أساس تجربة العربية
        const htmlAttrs = await page.evaluate(() => ({
          dir: document.documentElement.getAttribute('dir'),
          lang: document.documentElement.getAttribute('lang'),
          bodyBg: getComputedStyle(document.body).backgroundColor,
        }));
        const expectedDir = LOCALES[locale].dir;
        check(
          htmlAttrs.dir === expectedDir,
          `${label}: dir=${expectedDir}`,
          String(htmlAttrs.dir),
        );
        check(
          htmlAttrs.lang?.startsWith(locale),
          `${label}: lang=${locale}`,
          String(htmlAttrs.lang),
        );

        // التمرير الأفقي — أشهر عيب في تخطيط الهاتف
        const overflow = await page.evaluate(() => {
          const doc = document.documentElement;
          return {
            scrollWidth: doc.scrollWidth,
            clientWidth: doc.clientWidth,
            culprits: [...document.querySelectorAll('body *')]
              .filter((element) => {
                const rect = element.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return false;
                // عناصر تتجاوز الحدّ الأيمن أو الأيسر للنافذة
                return rect.right > doc.clientWidth + 2 || rect.left < -2;
              })
              .slice(0, 4)
              .map((element) => {
                const rect = element.getBoundingClientRect();
                return `${element.tagName.toLowerCase()}.${(element.className || '')
                  .toString()
                  .split(' ')
                  .slice(0, 2)
                  .join('.')} [${Math.round(rect.left)}..${Math.round(rect.right)}]`;
              }),
          };
        });
        check(
          overflow.scrollWidth <= overflow.clientWidth + 2,
          `${label}: لا تمرير أفقي`,
          `${overflow.scrollWidth} > ${overflow.clientWidth}: ${overflow.culprits.join(' | ')}`,
        );

        // صورة لم تُحمَّل = رابط مكسور يراه الزائر
        const brokenImages = await page.evaluate(() =>
          [...document.images]
            .filter((image) => image.complete && image.naturalWidth === 0)
            .map((image) => image.currentSrc || image.src)
            .slice(0, 4),
        );
        check(brokenImages.length === 0, `${label}: الصور محمّلة`, brokenImages.join(' | '));

        // عنوان رئيسي واحد — بنية الصفحة وقراءتها بالقارئات
        const headings = await page.evaluate(() => ({
          h1: document.querySelectorAll('h1').length,
          title: document.title,
        }));
        if (!expected404) {
          check(headings.h1 === 1, `${label}: h1 واحد`, `العدد ${headings.h1}`);
          check(headings.title.length > 5, `${label}: عنوان الصفحة`, headings.title);
        }

        // أهداف اللمس على الهاتف — 40 بكسل حدّ أدنى عملي
        if (viewport.mobile) {
          const smallTargets = await page.evaluate(() =>
            [...document.querySelectorAll('a[href], button:not([disabled])')]
              .filter((element) => {
                const rect = element.getBoundingClientRect();
                if (rect.width === 0 || rect.height === 0) return false;
                const style = getComputedStyle(element);
                if (style.visibility === 'hidden' || style.display === 'none') return false;
                // العناصر المخفية بصرياً حتى التركيز (مثل «تخطَّ إلى المحتوى»)
                // ليست أهداف لمس — إخفاؤها ممارسة صحيحة لا عيب
                if (style.clip !== 'auto' || style.clipPath !== 'none') return false;
                if (rect.width <= 2 || rect.height <= 2) return false;
                // الروابط داخل جملة نصّية مستثناة: ارتفاعها ارتفاع السطر
                const inlineInText =
                  element.tagName === 'A' &&
                  element.parentElement &&
                  ['P', 'LI', 'SPAN', 'TD'].includes(element.parentElement.tagName);
                if (inlineInText) return false;
                return rect.height < 40;
              })
              .slice(0, 5)
              .map((element) => {
                const rect = element.getBoundingClientRect();
                return `${element.tagName.toLowerCase()} "${(element.textContent || '')
                  .trim()
                  .slice(0, 22)}" h=${Math.round(rect.height)}`;
              }),
          );
          check(
            smallTargets.length === 0,
            `${label}: أهداف اللمس ≥ 40px`,
            smallTargets.join(' | '),
          );
        }

        // إمكانية الوصول — نُبلّغ فقط عن القواعد المانعة
        await page.addScriptTag({ content: AXE_SOURCE });
        const axe = await page.evaluate(async () => {
          const result = await window.axe.run(document, {
            resultTypes: ['violations'],
            runOnly: { type: 'tag', values: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] },
          });
          return result.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            nodes: violation.nodes.length,
            sample: violation.nodes[0]?.target?.join(' ') ?? '',
          }));
        });
        const blocking = axe.filter((violation) => BLOCKING_AXE_RULES.has(violation.id));
        check(
          blocking.length === 0,
          `${label}: إمكانية الوصول`,
          blocking.map((v) => `${v.id}(${v.nodes}) ${v.sample}`).join(' | '),
        );
        const advisory = axe.filter((violation) => !BLOCKING_AXE_RULES.has(violation.id));
        if (advisory.length > 0 && viewport.mobile) {
          console.log(
            `     ℹ ملاحظات غير مانعة (${label}): ${advisory
              .map((v) => `${v.id}(${v.nodes})`)
              .join(', ')}`,
          );
        }

        // الصفحة غير الموجودة تُسجّل حالة مستندها (404) كخطأ في الطرفية، وهو
        // المتوقَّع منها؛ فنفحص ما عداها
        if (!expected404) {
          check(
            consoleErrors.length === 0,
            `${label}: لا أخطاء في الطرفية`,
            consoleErrors.slice(0, 2).join(' | ').slice(0, 200),
          );
        }

        // نجمع الروابط الداخلية من مقاس واحد فقط — الفحص لاحقاً مرّة واحدة
        if (viewport.width === 1440 && !expected404) {
          const links = await page.evaluate(() =>
            [...document.querySelectorAll('a[href]')]
              .map((anchor) => anchor.getAttribute('href'))
              .filter((href) => href && href.startsWith('/')),
          );
          for (const link of links) internalLinks.add(link.split('#')[0]);
        }
      }

      await context.close();
    }
  }

  // ── بادئة اللغة: المسار المجرّد يُحوَّل إلى العربية ──
  console.log('\n── تحويل المسار المجرّد ──');
  const redirectContext = await browser.newContext({ ignoreHTTPSErrors: true });
  for (const bare of ['/', '/store', '/booking', '/blog', '/account']) {
    const response = await redirectContext.request.get(`${BASE}${bare}`, {
      maxRedirects: 0,
    });
    const status = response.status();
    const location = response.headers()['location'] ?? '';
    const expected = bare === '/' ? '/ar' : `/ar${bare}`;
    check(
      (status === 307 || status === 308) && location.endsWith(expected),
      `تحويل ${bare} ← ${expected}`,
      `${status} ${location}`,
    );
  }
  await redirectContext.close();

  // ── الروابط الداخلية: كلّها يجب أن تستجيب ──
  console.log(`\n── الروابط الداخلية (${internalLinks.size}) ──`);
  const context = await browser.newContext({ ignoreHTTPSErrors: true });
  for (const link of [...internalLinks].sort()) {
    if (!link || link === '/does-not-exist') continue;
    const response = await context.request.get(`${BASE}${link}`, { maxRedirects: 0 });
    const status = response.status();
    check(
      status === 200 || status === 307 || status === 308,
      `رابط ${link}`,
      String(status),
    );
  }
  await context.close();

  await browser.close();

  console.log(`\n════ ناجح: ${pass} — فاشل: ${failures.length} ════`);
  if (failures.length > 0) {
    console.log('\nالعيوب:');
    for (const failure of failures) console.log(`  ❌ ${failure}`);
    process.exitCode = 1;
  }
};

await run();
