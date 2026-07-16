import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.dirname(new URL(import.meta.url).pathname);
const jobs = JSON.parse(await readFile(path.join(root, 'jobs.json'), 'utf8'));
const logoPath = path.resolve(root, '../../image-references/logo.png');
const contactText = 'mayaobongro.vn | Hotline/Zalo: 0989.353.247';
const swatches = [
  { fill: '#ffffff', plus: false },
  { fill: '#111111', plus: false },
  { fill: '#ff5fa2', plus: false },
  { fill: '#e11d2e', plus: false },
  { fill: '#ffd447', plus: false },
  { fill: '#1677ff', plus: false },
  { fill: '#18a957', plus: false },
  { fill: '#f8fafc', plus: true },
];

await mkdir(path.join(root, 'final'), { recursive: true });

async function prepareLogo(width) {
  return sharp(logoPath)
    .trim({ background: '#ffffff', threshold: 18 })
    .resize({ width: Math.round(width * 0.2), withoutEnlargement: true })
    .ensureAlpha()
    .png()
    .toBuffer();
}

function logoBacking(width, logoWidth, logoHeight) {
  const pad = Math.round(width * 0.018);
  const boxWidth = logoWidth + pad * 2;
  const boxHeight = logoHeight + pad * 2;
  const radius = Math.round(width * 0.028);
  return Buffer.from(`
    <svg width="${boxWidth}" height="${boxHeight}" xmlns="http://www.w3.org/2000/svg">
      <defs><filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="6"/></filter></defs>
      <rect x="4" y="4" width="${boxWidth - 8}" height="${boxHeight - 8}" rx="${radius}" fill="rgba(255,255,255,0.14)" filter="url(#soft)"/>
    </svg>
  `);
}

function contactOverlay(width, height) {
  const fontSize = Math.round(width * 0.015);
  const textWidth = Math.round(contactText.length * fontSize * 0.58);
  const pillWidth = Math.min(Math.round(width * 0.58), textWidth + Math.round(width * 0.032));
  const pillHeight = Math.round(width * 0.036);
  const x = Math.round((width - pillWidth) / 2);
  const y = height - pillHeight - Math.round(width * 0.032);
  const radius = Math.round(pillHeight / 2);
  const textY = y + Math.round(pillHeight * 0.64);

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${x}" y="${y}" width="${pillWidth}" height="${pillHeight}" rx="${radius}" fill="rgba(35,35,35,0.55)" stroke="rgba(255,255,255,0.78)" stroke-width="1.4"/>
      <text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${contactText}</text>
    </svg>
  `);
}

function swatchOverlay(width, height, side = 'right') {
  const r = Math.round(width * 0.015);
  const gap = Math.round(width * 0.012);
  const fontSize = Math.round(width * 0.026);
  const pad = Math.round(width * 0.012);
  const columnWidth = pad * 2 + r * 2;
  const columnHeight = pad * 2 + swatches.length * r * 2 + (swatches.length - 1) * gap;
  const x = side === 'left' ? Math.round(width * 0.045) : width - Math.round(width * 0.045) - columnWidth;
  const y = Math.round(width * 0.32);
  let cursor = y + pad;

  const items = swatches.map((swatch) => {
    const circleX = x + Math.round(columnWidth / 2);
    const circleY = cursor + r;
    const plus = swatch.plus
      ? `<text x="${circleX}" y="${circleY + Math.round(fontSize * 0.35)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="800" fill="#111827">+</text>`
      : '';
    cursor += r * 2 + gap;
    return `<circle cx="${circleX}" cy="${circleY}" r="${r}" fill="${swatch.fill}" stroke="rgba(255,255,255,0.92)" stroke-width="2.4"/>${plus}`;
  }).join('\n');

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${x}" y="${y}" width="${columnWidth}" height="${columnHeight}" rx="${Math.round(columnWidth / 2)}" fill="rgba(30,41,59,0.36)" stroke="rgba(255,255,255,0.48)" stroke-width="1.3"/>
      ${items}
    </svg>
  `);
}

const summary = [];
for (const job of jobs) {
  const input = path.join(root, job.generated);
  const output = path.join(root, job.final);
  const logo = await prepareLogo(1000);
  const logoMeta = await sharp(logo).metadata();
  const pad = Math.round(1000 * 0.018);
  const logoLeft = 28;
  const logoTop = 28;
  const swatchSide = job.audience === 'high_school' ? 'left' : 'right';

  await sharp(input)
    .resize(1000, 1000, { fit: 'cover' })
    .composite([
      { input: logoBacking(1000, logoMeta.width, logoMeta.height), top: logoTop - pad, left: logoLeft - pad, blend: 'over' },
      { input: logo, top: logoTop, left: logoLeft, blend: 'over', opacity: 0.88 },
      { input: swatchOverlay(1000, 1000, swatchSide), top: 0, left: 0, blend: 'over' },
      { input: contactOverlay(1000, 1000), top: 0, left: 0, blend: 'over' },
    ])
    .webp({ quality: 84, effort: 5 })
    .toFile(output);

  const bytes = await readFile(output);
  summary.push({ id: job.id, final: job.final, bytes: bytes.length });
}

await writeFile(path.join(root, 'final-summary.json'), JSON.stringify(summary, null, 2));
