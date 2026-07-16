import playwright from '/Users/hoang/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/playwright/index.js';
import fs from 'node:fs/promises';
import path from 'node:path';

const { chromium } = playwright;

const outDir = path.resolve('mayaobongro.vn/tmp-generated/about-page-visual-20260711');
await fs.mkdir(outDir, { recursive: true });

const browser = await chromium.launch({ headless: true });
const cases = [
  { name: 'mobile-390', width: 390, height: 900 },
  { name: 'desktop-1440', width: 1440, height: 900 },
];

const results = [];
for (const testCase of cases) {
  const page = await browser.newPage({
    viewport: { width: testCase.width, height: testCase.height },
    deviceScaleFactor: 1,
  });
  await page.goto(`https://mayaobongro.vn/gioi-thieu/?visual_check=${Date.now()}`, {
    waitUntil: 'networkidle',
    timeout: 45000,
  });
  await page.screenshot({
    path: path.join(outDir, `${testCase.name}.png`),
    fullPage: false,
  });

  const metrics = await page.evaluate(() => {
    const header = document.querySelector('#header');
    const heading = [...document.querySelectorAll('h1')]
      .find((node) => node.textContent?.includes('Giới thiệu về Mayaobongro.vn'));
    const bodyText = document.body.innerText;
    const rect = (node) => {
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
    return {
      header: rect(header),
      heading: rect(heading),
      hasRenderedCss: bodyText.includes('font-size: clamp') || bodyText.includes('.x24-about'),
      hasPrivateTerms: ['CEO', 'Thu Hiền', 'Công ty TNHH', 'X24 Sport'].some((term) => bodyText.includes(term)),
      titleText: heading?.textContent?.trim() ?? '',
    };
  });
  await page.close();

  const headerBottom = metrics.header?.bottom ?? 0;
  const headingTop = metrics.heading?.top ?? -1;
  const headingClearance = headingTop - headerBottom;
  results.push({
    ...testCase,
    screenshot: path.join(outDir, `${testCase.name}.png`),
    ...metrics,
    headingClearance,
    pass: Boolean(metrics.heading)
      && headingClearance >= 12
      && !metrics.hasRenderedCss
      && !metrics.hasPrivateTerms,
  });
}

await browser.close();

const reportPath = path.join(outDir, 'report.json');
await fs.writeFile(reportPath, `${JSON.stringify(results, null, 2)}\n`);
console.log(JSON.stringify({ reportPath, results }, null, 2));

if (results.some((result) => !result.pass)) {
  process.exit(1);
}
