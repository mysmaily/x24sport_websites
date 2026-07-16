import { readFile, writeFile, mkdir } from 'node:fs/promises';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const apiKeyPath = process.env.OPENAI_API_KEY_FILE || '/Users/hoang/wordpress_websites/.secrets/open_api_key';
const apiKey = (process.env.OPENAI_API_KEY || await readFile(apiKeyPath, 'utf8')).trim();
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';
const jobs = JSON.parse(await readFile(path.join(root, 'jobs.json'), 'utf8'));
const concurrency = Number(process.env.IMAGE_CONCURRENCY || 2);

await mkdir(path.join(root, 'generated'), { recursive: true });

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function runJob(job) {
  const sourcePath = path.join(root, job.source);
  const outputPath = path.join(root, job.generated);
  const sourceBytes = await readFile(sourcePath);

  for (let attempt = 0; attempt < 3; attempt += 1) {
    const form = new FormData();
    form.append('model', model);
    form.append('image', new Blob([sourceBytes], { type: 'image/jpeg' }), path.basename(sourcePath));
    form.append('prompt', job.prompt);
    form.append('size', '1024x1024');
    form.append('quality', 'medium');
    form.append('output_format', 'png');
    form.append('background', 'opaque');

    const started = Date.now();
    const response = await fetch('https://api.openai.com/v1/images/edits', {
      method: 'POST',
      headers: { Authorization: `Bearer ${apiKey}` },
      body: form,
    });
    const text = await response.text();
    if (!response.ok) {
      const retryable = [408, 409, 429, 500, 502, 503, 504].includes(response.status);
      if (retryable && attempt < 2) {
        await sleep(2000 * 2 ** attempt);
        continue;
      }
      throw new Error(`${job.id}: HTTP ${response.status} ${text.slice(0, 500)}`);
    }

    const json = JSON.parse(text);
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error(`${job.id}: response did not include b64_json`);
    }
    await writeFile(outputPath, Buffer.from(b64, 'base64'));
    return {
      id: job.id,
      audience: job.audience,
      output: job.generated,
      seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
    };
  }
}

async function worker(queue, results) {
  while (queue.length) {
    const job = queue.shift();
    try {
      const result = await runJob(job);
      results.push({ ok: true, ...result });
      console.log(JSON.stringify({ ok: true, id: job.id, output: job.generated }));
    } catch (error) {
      results.push({ ok: false, id: job.id, audience: job.audience, error: error.message });
      console.error(JSON.stringify({ ok: false, id: job.id, error: error.message }));
    }
  }
}

const queue = [...jobs];
const results = [];
await Promise.all(Array.from({ length: Math.min(concurrency, jobs.length) }, () => worker(queue, results)));
await writeFile(path.join(root, 'generation-results.json'), JSON.stringify({ model, concurrency, results }, null, 2));

if (results.some((result) => !result.ok)) {
  process.exit(1);
}
