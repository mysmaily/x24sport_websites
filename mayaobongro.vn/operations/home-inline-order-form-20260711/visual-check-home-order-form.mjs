import playwright from '/Users/hoang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const { chromium } = playwright;
const outDir = path.resolve('mayaobongro.vn/tmp-generated/home-order-form-visual-20260711');
await fs.mkdir(outDir, { recursive: true });

const cases = [
  { name: 'mobile-390', width: 390, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const browser = await chromium.launch({ headless: true });
const results = [];

for (const testCase of cases) {
  const page = await browser.newPage({ viewport: { width: testCase.width, height: testCase.height } });
  await page.goto(`https://mayaobongro.vn/?home_order_visual=${Date.now()}`, {
    waitUntil: 'networkidle',
    timeout: 45000,
  });
  const screenshot = path.join(outDir, `${testCase.name}.png`);
  await page.screenshot({ path: screenshot, fullPage: false });
  const metrics = await page.evaluate(() => {
    const rect = (selector) => {
      const node = [...document.querySelectorAll(selector)].find((candidate) => {
        const style = window.getComputedStyle(candidate);
        const r = candidate.getBoundingClientRect();
        return style.display !== 'none' && style.visibility !== 'hidden' && r.width > 1 && r.height > 1;
      });
      if (!node) return null;
      const r = node.getBoundingClientRect();
      return {
        top: Math.round(r.top),
        bottom: Math.round(r.bottom),
        left: Math.round(r.left),
        right: Math.round(r.right),
        width: Math.round(r.width),
        height: Math.round(r.height),
      };
    };
    const html = document.body.innerHTML;
    return {
      header: rect('#header'),
      hero: rect('.x24-home-hero-banner'),
      overlay: rect('.x24-home-order-overlay'),
      panel: rect('.x24-home-order-panel'),
      form: rect('form[data-x24-home-order-form]'),
      hasName: Boolean(document.querySelector('input[name="x24_order_name"]')),
      hasPhone: Boolean(document.querySelector('input[name="x24_order_phone"][required]')),
      hasQuantity: Boolean(document.querySelector('input[name="x24_order_quantity"]')),
      hasDate: Boolean(document.querySelector('select[name="x24_order_date"]')),
      hasDateChoices: ['4 ngày', '5 ngày', '1 tuần', 'Trên 1 tuần'].every((choice) => {
        return [...document.querySelectorAll('select[name="x24_order_date"] option')].some((option) => option.textContent?.trim() === choice);
      }),
      hasButton: [...document.querySelectorAll('form[data-x24-home-order-form] button')].some((button) => button.textContent?.trim() === 'Nhận tư vấn'),
      hasLoadingLabel: Boolean(document.querySelector('form[data-x24-home-order-form] button[data-x24-loading-label="Đang gửi..."]')),
      visibleLabels: [...document.querySelectorAll('form[data-x24-home-order-form] label')].filter((label) => label.getBoundingClientRect().width > 2 && label.getBoundingClientRect().height > 2).length,
      hasAntiSpam: Boolean(document.querySelector('form[data-x24-home-order-form] input[name="website"]'))
        && Boolean(document.querySelector('form[data-x24-home-order-form] input[name="x24_started_at"]'))
        && Boolean(document.querySelector('form[data-x24-home-order-form] input[name="x24_started_sig"]')),
      leaksToken: html.includes('8859811830:') || html.includes('AAFS3'),
    };
  });
  await page.close();
  const insideHero = metrics.hero && metrics.panel
    ? metrics.panel.top >= metrics.hero.top - 5 && metrics.panel.bottom <= metrics.hero.bottom + 5
    : false;
  const mobileUnderHero = testCase.width < 550 && metrics.hero && metrics.panel
    ? metrics.panel.top >= metrics.hero.bottom - 5
    : false;
  const placementOk = testCase.width < 550 ? mobileUnderHero : insideHero;
  results.push({
    ...testCase,
    screenshot,
    ...metrics,
    insideHero,
    mobileUnderHero,
    pass: Boolean(metrics.form)
      && Boolean(metrics.hero)
      && Boolean(metrics.overlay)
      && Boolean(metrics.panel)
      && placementOk
      && metrics.hasName
      && metrics.hasPhone
      && metrics.hasQuantity
      && metrics.hasDate
      && metrics.hasDateChoices
      && metrics.hasButton
      && metrics.hasLoadingLabel
      && metrics.visibleLabels === 0
      && metrics.hasAntiSpam
      && !metrics.leaksToken,
  });
}

await browser.close();
await fs.writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => !result.pass)) {
  process.exit(1);
}
