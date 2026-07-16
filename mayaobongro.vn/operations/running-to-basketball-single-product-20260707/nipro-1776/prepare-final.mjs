import { copyFile, readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';
import { spawn } from 'node:child_process';

const root = path.dirname(new URL(import.meta.url).pathname);
const jobs = JSON.parse(await readFile(path.join(root, 'jobs.json'), 'utf8'));
await mkdir(path.join(root, 'final'), { recursive: true });
await mkdir(path.join(root, 'backup-unbranded-final'), { recursive: true });
await mkdir(path.join(root, 'tmp'), { recursive: true });

const siteRoot = path.resolve(root, '../../..');
const logoPath = path.join(siteRoot, 'image-references', 'logo.png');
const preparedLogoPath = path.join(root, 'tmp', 'mayaobongro-logo-watermark.png');
const fontPath = '/System/Library/Fonts/Supplemental/Arial Bold.ttf';
const contactText = 'mayaobongro.vn | Hotline/Zalo: 0989.353.247';

function run(cmd, args) {
  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { stdio: 'inherit' });
    child.on('exit', (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} ${args.join(' ')} exited ${code}`));
    });
  });
}

async function exists(filePath) {
  try {
    await readFile(filePath);
    return true;
  } catch {
    return false;
  }
}

await run('magick', [
  logoPath,
  '-fuzz',
  '8%',
  '-transparent',
  'white',
  '-trim',
  '+repage',
  '-resize',
  '205x205>',
  preparedLogoPath,
]);

for (const job of jobs) {
  const finalPath = path.join(root, job.final);
  if (await exists(finalPath)) {
    await copyFile(finalPath, path.join(root, 'backup-unbranded-final', path.basename(finalPath)));
  }

  const resizedPath = path.join(root, 'tmp', `${path.basename(job.final, path.extname(job.final))}-resized.png`);
  await run('cwebp', [
    '-q',
    '82',
    '-resize',
    '1000',
    '1000',
    path.join(root, job.generated),
    '-o',
    path.join(root, 'tmp', `${path.basename(job.final, path.extname(job.final))}-resized.webp`),
  ]);
  await run('magick', [
    path.join(root, 'tmp', `${path.basename(job.final, path.extname(job.final))}-resized.webp`),
    resizedPath,
  ]);
  await run('magick', [
    resizedPath,
    preparedLogoPath,
    '-gravity',
    'NorthEast',
    '-geometry',
    '+24+24',
    '-composite',
    '-fill',
    'rgba(28,32,38,0.56)',
    '-stroke',
    'rgba(255,255,255,0.72)',
    '-strokewidth',
    '2',
    '-draw',
    'roundrectangle 105,910 895,968 29,29',
    '-stroke',
    'none',
    '-fill',
    'white',
    '-font',
    fontPath,
    '-pointsize',
    '28',
    '-gravity',
    'South',
    '-annotate',
    '+0+46',
    contactText,
    '-quality',
    '84',
    finalPath,
  ]);
}

const summary = [];
for (const job of jobs) {
  const bytes = await readFile(path.join(root, job.final));
  summary.push({ id: job.id, final: job.final, bytes: bytes.length });
}
await writeFile(path.join(root, 'final-summary.json'), JSON.stringify(summary, null, 2));
