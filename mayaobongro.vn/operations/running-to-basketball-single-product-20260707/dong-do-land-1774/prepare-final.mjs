import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import sharp from 'sharp';

const root = path.dirname(new URL(import.meta.url).pathname);
const jobs = JSON.parse(await readFile(path.join(root, 'jobs.json'), 'utf8'));
const logoPath = path.resolve(root, '../../../image-references/logo.png');
const contactText = 'mayaobongro.vn | Hotline/Zalo: 0989.353.247';

await mkdir(path.join(root, 'final'), { recursive: true });

async function prepareLogo(width) {
  const resized = await sharp(logoPath)
    .trim({ background: '#ffffff', threshold: 18 })
    .resize({ width: Math.round(width * 0.2), withoutEnlargement: true })
    .png()
    .toBuffer();

  return sharp(resized)
    .ensureAlpha()
    .modulate({ brightness: 1.03 })
    .png()
    .toBuffer();
}

function svgOverlay(width, height) {
  const fontSize = Math.round(width * 0.026);
  const textWidth = Math.round(contactText.length * fontSize * 0.58);
  const pillWidth = Math.min(Math.round(width * 0.86), textWidth + Math.round(width * 0.08));
  const pillHeight = Math.round(width * 0.064);
  const x = Math.round((width - pillWidth) / 2);
  const y = height - pillHeight - Math.round(width * 0.035);
  const radius = Math.round(pillHeight / 2);
  const textY = y + Math.round(pillHeight * 0.66);

  return Buffer.from(`
    <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
      <rect x="${x}" y="${y}" width="${pillWidth}" height="${pillHeight}" rx="${radius}" fill="rgba(35,35,35,0.55)" stroke="rgba(255,255,255,0.78)" stroke-width="2"/>
      <text x="${width / 2}" y="${textY}" text-anchor="middle" font-family="Arial, Helvetica, sans-serif" font-size="${fontSize}" font-weight="700" fill="#ffffff">${contactText}</text>
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
      { input: logo, top: 28, left: 28, blend: 'over' },
      { input: svgOverlay(1000, 1000), top: 0, left: 0, blend: 'over' },
    ])
    .webp({ quality: 84, effort: 5 })
    .toFile(output);

  const bytes = await readFile(output);
  summary.push({ id: job.id, final: job.final, bytes: bytes.length });
}

await writeFile(path.join(root, 'final-summary.json'), JSON.stringify(summary, null, 2));
