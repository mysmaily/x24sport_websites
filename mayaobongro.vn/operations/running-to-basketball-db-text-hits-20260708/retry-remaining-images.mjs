import { mkdir, readFile, stat, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const apiKeyPath = process.env.OPENAI_API_KEY_FILE || path.resolve(root, '../../../.secrets/open_api_key');
const apiKey = (process.env.OPENAI_API_KEY || await readFile(apiKeyPath, 'utf8')).trim();
const model = process.env.OPENAI_IMAGE_MODEL || 'gpt-image-2';
const jobs = JSON.parse(await readFile(path.join(root, 'jobs-remaining.json'), 'utf8'));
const resultsPath = path.join(root, 'generation-results.json');
const statusPath = path.join(root, 'remaining-retry-status.json');

await mkdir(path.join(root, 'generated'), { recursive: true });

let previous = { results: [] };
try {
  previous = JSON.parse(await readFile(resultsPath, 'utf8'));
} catch {
  previous = { results: [] };
}

const results = Array.isArray(previous.results) ? previous.results : [];
const completed = new Set(results.filter((item) => item.ok).map((item) => item.id));

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
    JSON.stringify({ ...previous, model, updated_at: new Date().toISOString(), results }, null, 2),
  );
}

async function writeStatus(status) {
  await writeFile(statusPath, JSON.stringify({ updated_at: new Date().toISOString(), ...status }, null, 2));
}

async function generate(job) {
  const sourcePath = path.join(root, job.source);
  const outputPath = path.join(root, job.generated);
  if (completed.has(job.id) && await exists(outputPath)) {
    return { skipped: true, id: job.id };
  }

  const sourceBytes = await readFile(sourcePath);
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
    const error = new Error(`HTTP ${response.status}: ${text.slice(0, 500)}`);
    error.responseText = text;
    throw error;
  }

  const json = JSON.parse(text);
  const b64 = json.data?.[0]?.b64_json;
  if (!b64) throw new Error('response did not include b64_json');

  await writeFile(outputPath, Buffer.from(b64, 'base64'));
  const record = {
    ok: true,
    id: job.id,
    audience: job.audience,
    product_id: job.product_id,
    product_code: job.product_code,
    model_composition: job.model_composition,
    expected_gender_lead: job.expected_gender_lead,
    output: job.generated,
    seconds: Number(((Date.now() - started) / 1000).toFixed(1)),
  };
  results.push(record);
  completed.add(job.id);
  await persist();
  return record;
}

const queue = [];
for (const job of jobs) {
  if (!completed.has(job.id) || !(await exists(path.join(root, job.generated)))) {
    queue.push(job);
  }
}

console.log(JSON.stringify({ jobs: jobs.length, remaining: queue.length, model }));
await writeStatus({ status: 'running', remaining: queue.length });

for (const job of queue) {
  try {
    const record = await generate(job);
    console.log(JSON.stringify({ ok: true, id: job.id, skipped: !!record.skipped, output: record.output }));
  } catch (error) {
    const billingLimited = /billing_hard_limit_reached|Billing hard limit has been reached/i.test(
      `${error.message}\n${error.responseText || ''}`,
    );
    await writeStatus({
      status: billingLimited ? 'billing_hard_limit_reached' : 'error',
      failed_job: job.id,
      error: error.message,
      remaining: queue.filter((item) => !completed.has(item.id)).length,
    });
    console.error(JSON.stringify({ ok: false, id: job.id, billingLimited, error: error.message }));
    process.exit(billingLimited ? 75 : 1);
  }
}

await writeStatus({ status: 'complete', remaining: 0 });
console.log(JSON.stringify({ ok: true, complete: true }));
