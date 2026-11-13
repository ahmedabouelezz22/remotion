import { chromium } from 'playwright';
const [out, base, list] = process.argv.slice(2);
const browser = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--headless=new', '--no-sandbox'] });
for (const [w, h, tag] of [[1440, 900, 'd'], [390, 844, 'm']]) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h }, deviceScaleFactor: 1, isMobile: tag === 'm', hasTouch: tag === 'm', ignoreHTTPSErrors: true });
  const page = await ctx.newPage();
  const errors = [];
  page.on('pageerror', (e) => errors.push(String(e)));
  for (const p of list.split(',')) {
    const res = await page.goto(base + p, { waitUntil: 'networkidle', timeout: 120000 });
    await page.evaluate(async () => { for (let y = 0; y < document.body.scrollHeight; y += 500) { window.scrollTo({ top: y, behavior: 'instant' }); await new Promise(r => setTimeout(r, 40)); } window.scrollTo({ top: 0, behavior: 'instant' }); });
    await page.waitForTimeout(900);
    const info = await page.evaluate(() => ({ h1: document.querySelectorAll('h1').length, over: document.documentElement.scrollWidth - document.documentElement.clientWidth, dir: document.documentElement.dir }));
    console.log(tag, p, res.status(), JSON.stringify(info));
    await page.screenshot({ path: `${out}/stg-${tag}-${p.replace(/\W+/g, '_') || 'home'}.png`, fullPage: tag === 'm' });
  }
  if (errors.length) console.log('errors', errors.slice(0, 3));
  await ctx.close();
}
await browser.close();
