import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const productId = 1774;
const slug = 'bo-quan-ao-bong-ro-hoc-sinh-dong-do-land-cam-x24-br-002';
const oldSlug = 'ao-chay-bo-mau-cam-noi-bat-dong-hanh-cung-giai-chay-dong-do-land';
const requiredCategories = [70, 97, 101, 102, 75, 95];
const forbidden = ['chạy bộ', 'runner', 'running', 'marathon', 'trail', '5k', '10k', 'half marathon', 'đường chạy', 'giải chạy', 'finisher'];
const requiredPhrases = ['áo bóng rổ tiểu học', 'áo bóng rổ cho trẻ lớp 4-5', 'áo bóng rổ lớp 9', 'áo bóng rổ học sinh cấp 3', 'áo bóng rổ THPT'];

async function fetchJson(url) {
  const response = await fetch(url);
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`${url} HTTP ${response.status}: ${text.slice(0, 300)}`);
  }
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

const product = await fetchJson(`https://mayaobongro.vn/wp-json/wp/v2/product/${productId}?_fields=id,slug,title,link,featured_media,product_cat,categories,content,excerpt,yoast_head_json,meta`);
const productCategories = product.categories || product.product_cat || [];
const htmlResponse = await fetch(`https://mayaobongro.vn/${slug}/?cb=${Date.now()}`);
const html = await htmlResponse.text();

const mediaIds = [product.featured_media];
const mediaMatches = [...html.matchAll(/wp-image-(\d+)/g)].map((match) => Number(match[1]));
for (const id of mediaMatches) {
  if (!mediaIds.includes(id)) mediaIds.push(id);
}

const media = [];
for (const id of mediaIds) {
  try {
    const item = await fetchJson(`https://mayaobongro.vn/wp-json/wp/v2/media/${id}?_fields=id,source_url,alt_text,media_type,mime_type`);
    media.push({ ...item, head: await head(item.source_url) });
  } catch (error) {
    media.push({ id, error: error.message });
  }
}

const oldHead = await head(`https://mayaobongro.vn/${oldSlug}/`);
const normalized = `${product.title?.rendered || ''}\n${product.slug}\n${product.excerpt?.rendered || ''}\n${product.content?.rendered || ''}`.toLowerCase();
const htmlLower = html.toLowerCase();
const bodyImageUrls = [...(product.content?.rendered || '').matchAll(/<img[^>]+src="([^"]+)"/g)].map((match) => match[1].replaceAll('\\/', '/'));
const bodyImages = [];
for (const url of bodyImageUrls) {
  bodyImages.push({ source_url: url, head: await head(url) });
}

const report = {
  product_id: product.id,
  slug: product.slug,
  link: product.link,
  title: product.title?.rendered,
  status: htmlResponse.status,
  categories: productCategories,
  required_categories_present: requiredCategories.every((id) => productCategories.includes(id)),
  category_100_absent: !productCategories.includes(100),
  forbidden_terms_found: forbidden.filter((term) => normalized.includes(term.toLowerCase())),
  required_phrases_present: requiredPhrases.filter((phrase) => normalized.includes(phrase.toLowerCase()) || htmlLower.includes(phrase.toLowerCase())),
  source_domain_in_product_fields: normalized.includes('mayaochaybo.vn'),
  source_domain_in_html: htmlLower.includes('mayaochaybo.vn'),
  has_age_fit_box: html.includes('Độ tuổi phù hợp'),
  featured_media: product.featured_media,
  media,
  body_images: bodyImages,
  old_url_head: oldHead,
};

await writeFile(path.join(root, 'verification', 'public-verification.json'), JSON.stringify(report, null, 2));

if (product.slug !== slug) throw new Error(`Slug mismatch: ${product.slug}`);
if (!report.required_categories_present) throw new Error('Missing required categories.');
if (!report.category_100_absent) throw new Error('Category 100 is still assigned.');
if (report.forbidden_terms_found.length) throw new Error(`Forbidden terms found: ${report.forbidden_terms_found.join(', ')}`);
if (report.source_domain_in_product_fields || report.source_domain_in_html) throw new Error('Public product still includes source domain.');
if (report.required_phrases_present.length < requiredPhrases.length) throw new Error('Missing required age phrases.');
if (report.has_age_fit_box) throw new Error('Standalone age-fit box is present.');
if (!media.every((item) => item.head?.status === 200 && /^image\//.test(item.head?.contentType || ''))) throw new Error('One or more media URLs failed image HEAD check.');
if (!bodyImages.every((item) => item.head?.status === 200 && /^image\//.test(item.head?.contentType || ''))) throw new Error('One or more body image URLs failed image HEAD check.');
if (![301, 302, 308].includes(oldHead.status)) throw new Error(`Old URL did not redirect. Status ${oldHead.status}`);

console.log(JSON.stringify(report, null, 2));
