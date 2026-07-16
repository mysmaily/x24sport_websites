import { execFileSync, spawnSync } from 'node:child_process';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const siteHost = 'root@10.10.0.26';
const batchName = path.basename(root);

const php = String.raw`<?php
require "/var/www/mayaobongro.vn/wp-load.php";
global $wpdb;

$like = "%chạy bộ%";
$rows = $wpdb->get_results($wpdb->prepare(
    "SELECT ID, post_title, post_name, post_excerpt, post_content, post_date
     FROM {$wpdb->posts}
     WHERE post_type = %s
       AND post_status IN ('publish', 'draft', 'private')
       AND (
         LOWER(post_title) LIKE LOWER(%s)
         OR LOWER(post_excerpt) LIKE LOWER(%s)
         OR LOWER(post_content) LIKE LOWER(%s)
       )
     ORDER BY post_date DESC, ID DESC",
    "product",
    $like,
    $like,
    $like
));

$skuRows = $wpdb->get_col(
    $wpdb->prepare(
        "SELECT meta_value FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value LIKE %s",
        "_sku",
        "X24-BR-%"
    )
);
$maxCode = 0;
foreach ($skuRows as $sku) {
    if (preg_match('/^X24-BR-(\d+)$/', (string) $sku, $m)) {
        $maxCode = max($maxCode, (int) $m[1]);
    }
}

$items = [];
foreach ($rows as $r) {
    $p = wc_get_product((int) $r->ID);
    if (!$p instanceof WC_Product) {
        continue;
    }
    $sku = (string) $p->get_sku();
    $img = (string) wp_get_attachment_url($p->get_image_id());
    $gallery = (string) get_post_meta((int) $r->ID, "_product_image_gallery", true);
    $model = (string) get_post_meta((int) $r->ID, "_mayaobongro_age_gallery_model", true);
    $converted = (bool) preg_match('/^X24-BR-/', $sku)
        || $model === "single-product"
        || stripos($img, "ao-bong-ro") !== false
        || stripos($gallery, "ao-bong-ro") !== false;
    if ($converted) {
        continue;
    }
    $items[] = [
        "id" => (int) $r->ID,
        "old_title" => html_entity_decode((string) $r->post_title, ENT_QUOTES | ENT_HTML5, "UTF-8"),
        "old_slug" => (string) $r->post_name,
        "old_url" => get_permalink((int) $r->ID),
        "post_date" => (string) $r->post_date,
        "source_image_url" => $img,
        "regular_price" => (string) $p->get_regular_price(),
        "sale_price" => (string) $p->get_sale_price(),
        "text_hits" => [
            "title" => mb_stripos((string) $r->post_title, "chạy bộ") !== false,
            "excerpt" => mb_stripos((string) $r->post_excerpt, "chạy bộ") !== false,
            "content" => mb_stripos((string) $r->post_content, "chạy bộ") !== false,
        ],
    ];
}

echo wp_json_encode([
    "max_existing_code" => $maxCode,
    "count" => count($items),
    "items" => $items,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT), PHP_EOL;
`;

function runRemotePhp(source) {
  const result = spawnSync('ssh', [siteHost, 'docker', 'exec', '-i', 'wp-php', 'php'], {
    input: source,
    encoding: 'utf8',
    maxBuffer: 1024 * 1024 * 50,
  });
  if (result.status !== 0) {
    throw new Error(result.stderr || result.stdout || `remote PHP failed with ${result.status}`);
  }
  return result.stdout;
}

function decodeBasicEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&#8211;|&ndash;/g, '-')
    .replace(/&#8212;|&mdash;/g, '-')
    .replace(/&quot;/g, '"')
    .replace(/&#039;|&apos;/g, "'");
}

function cleanTitle(oldTitle) {
  let title = decodeBasicEntities(oldTitle)
    .replace(/\bX24[\s-]*CB[\s-]*\d+\b/giu, ' ')
    .replace(/\bX24\b/giu, ' ')
    .replace(/\b(CB)[\s-]*\d+\b/giu, ' ')
    .replace(/\b(Áo|Ao)\s+(Chạy|Chay)\s+(Bộ|Bo)\b/giu, ' ')
    .replace(/\b(Nam|Nữ|Nu|Unisex|Ba\s+Lỗ|Ba\s+Lo|Sát\s+Nách|Sat\s+Nach|Thể\s+Thao|The\s+Thao|Kiểu\s*2|Kieu\s*2|Tank\s*Top)\b/giu, ' ')
    .replace(/\b(RUN|RUNNER|RUNNING|MARATHON|FINISHER|Dân\s+Chạy\s+Bộ|Dan\s+Chay\s+Bo|Chạy\s+Bộ|Chay\s+Bo)\b/giu, ' ')
    .replace(/\b(Thoáng\s+Mát|Thoang\s+Mat|Siêu\s+Thoáng|Sieu\s+Thoang|Thể\s+Thao|The\s+Thao|Tập\s+Luyện|Tap\s+Luyen|Thành\s+Tích|Thanh\s+Tich)\b/giu, ' ')
    .replace(/[–—|:;,]+/g, ' ')
    .replace(/[&+/]+/g, ' ')
    .replace(/\s*-\s*/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
  title = title.replace(/^(Màu|Mau)\s+/iu, '');
  if (!title) {
    title = 'Thiết Kế Năng Động';
  }
  const words = title.split(/\s+/u);
  if (words.length > 9) {
    title = words.slice(0, 9).join(' ');
  }
  return `Bộ Quần Áo Bóng Rổ ${title}`.replace(/\s+/g, ' ').trim();
}

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function promptFor({ audience, modelComposition, title }) {
  const scene = audience === 'elementary'
    ? 'outdoor elementary school court, morning, generic Vietnamese school basketball setting, no readable real school identity'
    : 'covered school court, soft daylight, generic Vietnamese school basketball setting, no readable real school identity';
  const subject = audience === 'elementary'
    ? 'Elementary-school version, fictional Vietnamese student(s), age 9-10, natural child proportions.'
    : 'High-school version, fictional Vietnamese student(s), age 16-17, athletic but age-appropriate.';
  const composition = audience === 'elementary'
    ? 'One fictional Vietnamese elementary-school, age 9-10 basketball female student as the front product model, with at least one visible teammate or soft background teammate/action. The female lead must clearly show the uniform and must not appear alone.'
    : 'One fictional Vietnamese high-school, age 16-17 basketball male student as the only product model, confident and age-appropriate, clearly showing the jersey front and coordinated shorts.';
  const action = audience === 'elementary' ? 'holding ball at waist' : 'ready stance';
  return `Use case: identity-preserve
Asset type: square WooCommerce product image for mayaobongro.vn

Image 1 is a garment-design reference only. Preserve the useful palette, gradient, graphic motif, valid team/design marks, number placement, and approved decorative text from the source design. Remove the adult/running model, running pose, road/track/race context, old promotional frame, old footer, mayaochaybo.vn, old hotline, size label, and running-shirt cut.

Convert the garment into an authentic basketball uniform: wider basketball shoulders, rib-knit neckline and armholes, relaxed straight torso, and a hem 5-8 cm longer than a running or football shirt. The hem must cover the shorts waistband. Pair it with loose knee-length basketball shorts whose palette, gradient, trim, panels, player number, and restrained pattern visibly coordinate with the jersey. Never default the shorts to black solely because the running reference used black shorts.

Text decisions: Replace or remove running/race words. Convert RUN, RUNNER, RUNNING, RUN FASTER, KEEP RUNNING, FINISHER, race, road, marathon, and running slogans to neutral basketball/team identity such as TEAM, HOOPS, BASKETBALL, or remove them. Keep non-running team names and abstract logos when they look like valid design marks.

Scene: ${scene}.

Subject: ${subject}

Model composition: ${composition}

Action/pose: ${action}. The main product model must be front-facing or three-quarter facing, and the jersey plus coordinated shorts must be clearly visible.

Composition: Square 1:1, garment fully visible, clean category-thumbnail readability, natural basketball-ready pose.

Target product title: ${title}

Quality: photorealistic, realistic Vietnamese student proportions, clean commercial product image, no extra watermark, no text overlay, no phone number, no website text.`;
}

async function main() {
  await mkdir(path.join(root, 'source'), { recursive: true });
  await mkdir(path.join(root, 'generated'), { recursive: true });
  await mkdir(path.join(root, 'final'), { recursive: true });
  await mkdir(path.join(root, 'verification'), { recursive: true });

  const discovered = JSON.parse(runRemotePhp(php));
  const manifest = [];
  const jobs = [];
  let codeNumber = discovered.max_existing_code;

  for (let index = 0; index < discovered.items.length; index += 1) {
    const item = discovered.items[index];
    codeNumber += 1;
    const productCode = `X24-BR-${String(codeNumber).padStart(3, '0')}`;
    const codeSlug = productCode.toLowerCase();
    const newTitle = cleanTitle(item.old_title);
    const titleSlug = slugify(newTitle);
    const newSlug = `${titleSlug}-${codeSlug}`;
    const sourceName = `${codeSlug}-${slugify(item.old_title).slice(0, 90) || `product-${item.id}`}.jpg`;
    const sourceRel = `source/${sourceName}`;
    const sourceAbs = path.join(root, sourceRel);
    const order = index + 1;

    if (!item.source_image_url) {
      throw new Error(`Product ${item.id} has no source image URL`);
    }
    execFileSync('curl', ['-L', '-sS', '-A', 'Mozilla/5.0', item.source_image_url, '-o', sourceAbs], {
      stdio: 'inherit',
    });

    const outputs = {
      elementary: `generated/${codeSlug}-ao-bong-ro-tieu-hoc.png`,
      high_school: `generated/${codeSlug}-ao-bong-ro-thpt.png`,
      elementary_final: `final/${codeSlug}-ao-bong-ro-tieu-hoc.webp`,
      high_school_final: `final/${codeSlug}-ao-bong-ro-thpt.webp`,
    };
    const record = {
      job_id: `product-${item.id}`,
      source_shop_order: order,
      source_shop_page: Math.ceil(order / 12),
      destination_product_id: item.id,
      product_code: productCode,
      edition_group: `${codeSlug}-${titleSlug}`,
      old_title: item.old_title,
      new_title: newTitle,
      old_slug: item.old_slug,
      new_slug: newSlug,
      old_url: item.old_url,
      source_image_url: item.source_image_url,
      source_image: `${batchName}/${sourceRel}`,
      model_composition: {
        elementary: 'female_lead_with_teammate',
        high_school: 'male_solo',
      },
      outputs,
      regular_price: item.regular_price || '200000',
      sale_price: item.sale_price || '135000',
      text_hits: item.text_hits,
      qa: {},
      status: 'discovered',
    };
    manifest.push(record);

    jobs.push({
      id: `${codeSlug}-elementary`,
      product_id: item.id,
      product_code: productCode,
      audience: 'elementary',
      source: sourceRel,
      generated: outputs.elementary,
      final: outputs.elementary_final,
      model_composition: 'female_lead_with_teammate',
      expected_gender_lead: 'female',
      title: newTitle,
      prompt: promptFor({ audience: 'elementary', modelComposition: 'female_lead_with_teammate', title: newTitle }),
    });
    jobs.push({
      id: `${codeSlug}-high_school`,
      product_id: item.id,
      product_code: productCode,
      audience: 'high_school',
      source: sourceRel,
      generated: outputs.high_school,
      final: outputs.high_school_final,
      model_composition: 'male_solo',
      expected_gender_lead: 'male',
      title: newTitle,
      prompt: promptFor({ audience: 'high_school', modelComposition: 'male_solo', title: newTitle }),
    });
  }

  await writeFile(path.join(root, 'products-live.json'), JSON.stringify(discovered, null, 2), 'utf8');
  await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2), 'utf8');
  await writeFile(path.join(root, 'jobs.json'), JSON.stringify(jobs, null, 2), 'utf8');
  await writeFile(
    path.join(root, 'discovery-summary.json'),
    JSON.stringify({
      batch: batchName,
      source: 'database title/excerpt/content contains "chạy bộ"; already-converted image products skipped',
      discovered_count: discovered.count,
      manifest_count: manifest.length,
      jobs_count: jobs.length,
      max_existing_code: discovered.max_existing_code,
      first_new_code: manifest[0]?.product_code || null,
      last_new_code: manifest.at(-1)?.product_code || null,
      generated_at: new Date().toISOString(),
    }, null, 2),
    'utf8',
  );
  console.log(JSON.stringify({
    manifest: manifest.length,
    jobs: jobs.length,
    max_existing_code: discovered.max_existing_code,
    first_new_code: manifest[0]?.product_code || null,
    last_new_code: manifest.at(-1)?.product_code || null,
  }, null, 2));
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
