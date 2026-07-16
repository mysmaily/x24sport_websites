import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const apiKeyPath = process.env.OPENAI_API_KEY_FILE || path.resolve(root, '../../../.secrets/open_api_key');
const apiKey = (process.env.OPENAI_API_KEY || await readFile(apiKeyPath, 'utf8')).trim();
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';
const jobs = JSON.parse(await readFile(path.join(root, 'jobs.json'), 'utf8'));
const concurrency = Number(process.env.IMAGE_CONCURRENCY || 2);
const resultsPath = path.join(root, 'generation-results.json');

await mkdir(path.join(root, 'generated'), { recursive: true });

let previous = { results: [] };
try {
  previous = JSON.parse(await readFile(resultsPath, 'utf8'));
} catch {
  previous = { results: [] };
}

const results = Array.isArray(previous.results) ? previous.results : [];
const completed = new Set(results.filter((item) => item.ok).map((item) => item.id));

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function exists(filePath) {
  try {
    await stat(filePath);
    return true;
  } catch {
    return false;
  }
}

async function persist() {
  await writeFile(
    resultsPath,
    JSON.stringify(
      {
        model,
        concurrency,
        updated_at: new Date().toISOString(),
        results,
      },
      null,
      2,
    ),
  );
}

async function runJob(job) {
  const sourcePath = path.join(root, job.source);
  const outputPath = path.join(root, job.generated);
  if (completed.has(job.id) && await exists(outputPath)) {
    return { skipped: true, id: job.id, output: job.generated };
  }

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
        await sleep(2500 * 2 ** attempt);
        continue;
      }
      throw new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);
    }

    const json = JSON.parse(text);
    const b64 = json.data?.[0]?.b64_json;
    if (!b64) {
      throw new Error('response did not include b64_json');
    }
    await writeFile(outputPath, Buffer.from(b64, 'base64'));
    return {
      id: job.id,
      audience: job.audience,
      product_id: job.product_id,
      product_code: job.product_code,
      model_composition: job.model_composition,
      expected_gender_lead: job.expected_gender_lead,
      output: job.generated,
      seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
    };
  }
}

async function worker(queue) {
  while (queue.length) {
    const job = queue.shift();
    try {
      const result = await runJob(job);
      if (result.skipped) {
        console.log(JSON.stringify({ ok: true, skipped: true, id: job.id, output: job.generated }));
        continue;
      }
      const record = { ok: true, ...result };
      results.push(record);
      completed.add(job.id);
      await persist();
      console.log(JSON.stringify({ ok: true, id: job.id, output: job.generated, seconds: result.seconds }));
    } catch (error) {
      const record = {
        ok: false,
        id: job.id,
        audience: job.audience,
        product_id: job.product_id,
        product_code: job.product_code,
        model_composition: job.model_composition,
        expected_gender_lead: job.expected_gender_lead,
        error: error.message,
      };
      results.push(record);
      await persist();
      console.error(JSON.stringify({ ok: false, id: job.id, error: error.message }));
    }
  }
}

const queue = jobs.filter((job) => !completed.has(job.id));
console.log(JSON.stringify({ jobs: jobs.length, remaining: queue.length, concurrency, model }));
await Promise.all(Array.from({ length: Math.min(concurrency, queue.length) }, () => worker(queue)));
await persist();

if (results.some((result) => !result.ok)) {
  process.exit(1);
}
