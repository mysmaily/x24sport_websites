import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const manifest = JSON.parse(await readFile(path.join(root, 'manifest.json'), 'utf8'));
const requiredCategories = [70, 97, 101, 102, 75, 95];
const forbidden = ['chạy bộ', 'runner', 'running', 'marathon', 'trail', '5k', '10k', 'half marathon', 'đường chạy', 'giải chạy', 'finisher', 'mayaochaybo.vn'];
const titleForbidden = ['học sinh', 'trẻ em', 'tiểu học', 'thcs', 'thpt', 'nam ', 'nữ ', 'người lớn'];
const requiredPhrases = ['áo bóng rổ tiểu học', 'áo bóng rổ cho trẻ lớp 4-5', 'áo bóng rổ lớp 9', 'áo bóng rổ học sinh cấp 3', 'áo bóng rổ THPT'];

async function fetchText(url, options = {}) {
  const response = await fetch(url, options);
  const text = await response.text();
  if (!response.ok && options.method !== 'HEAD') {
    throw new Error(`${url} HTTP ${response.status}: ${text.slice(0, 300)}`);
  }
  return { response, text };
}

async function fetchJson(url) {
  const { text } = await fetchText(url);
  return JSON.parse(text);
}

async function head(url) {
  const response = await fetch(url, { method: 'HEAD', redirect: 'manual' });
  return {
    status: response.status,
    location: response.headers.get('location'),
    contentType: response.headers.get('content-type'),
  };
}

await mkdir(path.join(root, 'verification'), { recursive: true });

const reports = [];
for (const record of manifest) {
  const product = await fetchJson(`https://mayaobongro.vn/wp-json/wp/v2/product/${record.destination_product_id}?_fields=id,slug,title,link,featured_media,product_cat,categories,content,excerpt`);
  const categories = product.categories || product.product_cat || [];
  const { response: htmlResponse, text: html } = await fetchText(`https://mayaobongro.vn/${record.new_slug}/?cb=${Date.now()}`);
  const normalized = `${product.title?.rendered || ''}\n${product.slug}\n${product.excerpt?.rendered || ''}\n${product.content?.rendered || ''}`.toLowerCase();
  const titleSlugExcerpt = `${product.title?.rendered || ''}\n${product.slug}\n${product.excerpt?.rendered || ''}`.toLowerCase();
  const bodyImageUrls = [...(product.content?.rendered || '').matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1].replaceAll('\\/', '/'));
  const bodyImages = [];
  for (const url of bodyImageUrls) {
    bodyImages.push({ source_url: url, head: await head(url) });
  }
  const media = await fetchJson(`https://mayaobongro.vn/wp-json/wp/v2/media/${product.featured_media}?_fields=id,source_url,alt_text,media_type,mime_type`);
  media.head = await head(media.source_url);
  const oldHead = await head(`https://mayaobongro.vn/${record.old_slug}/`);
  const report = {
    product_id: product.id,
    slug: product.slug,
    title: product.title?.rendered,
    link: product.link,
    status: htmlResponse.status,
    categories,
    required_categories_present: requiredCategories.every((id) => categories.includes(id)),
    category_100_absent: !categories.includes(100),
    forbidden_terms_found: forbidden.filter((term) => normalized.includes(term.toLowerCase())),
    title_audience_terms_found: titleForbidden.filter((term) => titleSlugExcerpt.includes(term)),
    required_phrases_present: requiredPhrases.filter((phrase) => normalized.includes(phrase.toLowerCase()) || html.toLowerCase().includes(phrase.toLowerCase())),
    has_age_fit_box: html.includes('Độ tuổi phù hợp'),
    featured_media: product.featured_media,
    media,
    body_images: bodyImages,
    old_url_head: oldHead,
  };
  reports.push(report);

  if (product.slug !== record.new_slug) throw new Error(`${record.destination_product_id}: slug mismatch ${product.slug}`);
  if (!report.required_categories_present) throw new Error(`${record.destination_product_id}: missing required categories`);
  if (!report.category_100_absent) throw new Error(`${record.destination_product_id}: category 100 present`);
  if (report.forbidden_terms_found.length) throw new Error(`${record.destination_product_id}: forbidden terms ${report.forbidden_terms_found.join(', ')}`);
  if (report.title_audience_terms_found.length) throw new Error(`${record.destination_product_id}: audience terms in title/slug/excerpt ${report.title_audience_terms_found.join(', ')}`);
  if (report.required_phrases_present.length < requiredPhrases.length) throw new Error(`${record.destination_product_id}: missing required age phrases`);
  if (report.has_age_fit_box) throw new Error(`${record.destination_product_id}: standalone age-fit box present`);
  if (!(media.head.status === 200 && /^image\//.test(media.head.contentType || ''))) throw new Error(`${record.destination_product_id}: featured image failed`);
  if (!bodyImages.every((item) => item.head.status === 200 && /^image\//.test(item.head.contentType || ''))) throw new Error(`${record.destination_product_id}: body image failed`);
  if (![301, 302, 308].includes(oldHead.status)) throw new Error(`${record.destination_product_id}: old URL did not redirect`);
}

await writeFile(path.join(root, 'verification', 'public-verification.json'), JSON.stringify({ count: reports.length, reports }, null, 2));
console.log(JSON.stringify({ count: reports.length, ok: true }, null, 2));
