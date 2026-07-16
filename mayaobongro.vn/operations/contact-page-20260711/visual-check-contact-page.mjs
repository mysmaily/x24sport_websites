import playwright from '/Users/hoang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const { chromium } = playwright;
const outDir = path.resolve('mayaobongro.vn/tmp-generated/contact-page-visual-20260711');
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const cases = [
  { name: 'mobile-390', width: 390, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const results = [];
for (const testCase of cases) {
  const page = await browser.newPage({ viewport: { width: testCase.width, height: testCase.height } });
  await page.goto(`https://mayaobongro.vn/lien-he/?visual_check=${Date.now()}`, {
    waitUntil: 'networkidle',
    timeout: 45000,
  });
  const screenshot = path.join(outDir, `${testCase.name}.png`);
  await page.screenshot({ path: screenshot, fullPage: false });
  const metrics = await page.evaluate(() => {
    const rect = (selector) => {
      const node = document.querySelector(selector);
      if (!node) return null;
      const r = node.getBoundingClientRect();
      return { top: Math.round(r.top), bottom: Math.round(r.bottom), width: Math.round(r.width), height: Math.round(r.height) };
    };
    const text = document.body.innerText;
    return {
      title: rect('h1'),
      form: rect('form[action*="admin-post.php"]'),
      map: rect('iframe[src*="google.com/maps/embed"]'),
      hasName: Boolean(document.querySelector('input[name="x24_name"]')),
      hasPhone: Boolean(document.querySelector('input[name="x24_phone"]')),
      hasRequest: Boolean(document.querySelector('textarea[name="x24_request"]')),
      hasPlaceholder: document.querySelector('textarea[name="x24_request"]')?.getAttribute('placeholder') === 'Tôi cần đặt may áo bóng rổ cho trường',
      hasLoadingLabel: Boolean(document.querySelector('button[data-x24-loading-label="Đang gửi..."]')),
      hasAntiSpam: Boolean(document.querySelector('input[name="website"]'))
        && Boolean(document.querySelector('input[name="x24_started_at"]'))
        && Boolean(document.querySelector('input[name="x24_started_sig"]')),
      hasAddress: text.includes('Số 6 Khu tập thể quân đội'),
      hasFacebook: document.body.innerHTML.includes('facebook.com/mayaobongro247'),
      leaksToken: document.body.innerHTML.includes('8859811830:') || document.body.innerHTML.includes('AAFS3'),
    };
  });
  await page.close();
  results.push({
    ...testCase,
    screenshot,
    ...metrics,
    pass: Boolean(metrics.title)
      && Boolean(metrics.form)
      && Boolean(metrics.map)
      && metrics.hasName
      && metrics.hasPhone
      && metrics.hasRequest
      && metrics.hasPlaceholder
      && metrics.hasLoadingLabel
      && metrics.hasAntiSpam
      && metrics.hasAddress
      && metrics.hasFacebook
      && !metrics.leaksToken,
  });
}

await browser.close();
await fs.writeFile(path.join(outDir, 'report.json'), `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify(results, null, 2));
if (results.some((result) => !result.pass)) {
  process.exit(1);
}
