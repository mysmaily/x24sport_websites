import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.dirname(new URL(import.meta.url).pathname);
const jobs = JSON.parse(await readFile(path.join(root, 'jobs.json'), 'utf8'));
const logoPath = path.resolve(root, '../../../image-references/logo.png');
const contactText = 'mayaobongro.vn | Hotline/Zalo: 0989.353.247';

await mkdir(path.join(root, 'final'), { recursive: true });

async function prepareLogo(width) {
  return sharp(logoPath)
    .ensureAlpha()
    .resize({ width: Math.round(width * 0.15), withoutEnlargement: true })
    .png()
    .toBuffer();
}

function escapeSvg(text) {
  return text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function overlaySvg(width, height) {
  const fontSize = Math.round(width * 0.02);
  const pillWidth = Math.round(width * 0.53);
  const pillHeight = Math.round(width * 0.046);
  const pillX = Math.round((width - pillWidth) / 2);
  const pillY = height - pillHeight - Math.round(width * 0.028);
  const radius = Math.round(pillHeight / 2);
  const textY = pillY + Math.round(pillHeight * 0.66);
  const dotX = Math.round(width * 0.945);
  const dotStartY = Math.round(width * 0.35);
  const dotGap = Math.round(width * 0.034);
  const dotRadius = Math.round(width * 0.011);
  const colors = [
    ['#ffffff', '#aab3bd'],
    ['#111827', '#ffffff'],
    ['#ec4899', '#ffffff'],
    ['#ef233c', '#ffffff'],
    ['#facc15', '#ffffff'],
    ['#0284c7', '#ffffff'],
    ['#22c55e', '#ffffff'],
  ];

  const dots = colors.map(([fill, stroke], index) => {
    const y = dotStartY + index * dotGap;
    return `<circle cx="${dotX}" cy="${y}" r="${dotRadius}" fill="${fill}" stroke="${stroke}" stroke-width="2"/>`;
  }).join('');

  const plusY = dotStartY + colors.length * dotGap;

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${pillX}" y="${pillY}" width="${pillWidth}" height="${pillHeight}" rx="${radius}" fill="rgba(35,35,35,0.52)" stroke="rgba(255,255,255,0.72)" stroke-width="1.5"/>
      <text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${escapeSvg(contactText)}</text>
      <g filter="drop-shadow(0 2px 5px rgba(0,0,0,0.28))">
        ${dots}
        <circle cx="${dotX}" cy="${plusY}" r="${dotRadius}" fill="rgba(255,255,255,0.86)" stroke="rgba(17,24,39,0.45)" stroke-width="1.5"/>
        <text x="${dotX}" y="${plusY + Math.round(dotRadius * 0.45)}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${Math.round(width * 0.02)}" font-weight="700" fill="#111827">+</text>
      </g>
    </svg>
  `);
}

const summary = [];
for (const job of jobs) {
  const input = path.join(root, job.generated);
  const output = path.join(root, job.final);
  const base = sharp(input).resize(1000, 1000, { fit: 'cover' });
  const logo = await prepareLogo(1000);
  await base
    .composite([
      { input: logo, top: 24, left: 24, blend: 'over' },
      { input: overlaySvg(1000, 1000), top: 0, left: 0, blend: 'over' },
    ])
    .webp({ quality: 84, effort: 5 })
    .toFile(output);

  const bytes = await readFile(output);
  summary.push({ id: job.id, final: job.final, bytes: bytes.length });
}

await writeFile(path.join(root, 'final-summary.json'), JSON.stringify(summary, null, 2));
