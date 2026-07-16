import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const root = path.dirname(new URL(import.meta.url).pathname);
const sourceSite = 'mayaochaybo.vn';
const destinationSite = 'mayaobongro.vn';

const products = [
  {
    id: 1752,
    oldSlug: 'ao-chay-bo-team-cong-chao-mau-xanh-su-ket-hop-hoan-hao-giua-phong-cach-va-hieu-nang',
    oldTitle: 'Áo Chạy Bộ Team Cộng Chào Màu Xanh – Sự Kết Hợp Hoàn Hảo Giữa Phong Cách và Hiệu Năng',
    sourceMediaId: 2408,
    sourceImageUrl: 'https://mayaobongro.vn/wp-content/uploads/2026/07/ao-chay-bo-team-cong-chao-model-20260705.jpg',
    design: 'Team Cộng Chào',
    color: 'Xanh',
    palette: 'deep blue, teal, white, and clean team accents',
    motif: 'Team Cộng Chào identity, blue sports team graphic hierarchy',
    code: 'X24-BR-010',
  },
  {
    id: 1750,
    oldSlug: 'ao-chay-bo-mau-xanh-duong-team-vung-tau-g-o-thiet-ke-nang-dong-tien-dung-cho-runner',
    oldTitle: 'Áo chạy bộ màu xanh dương team Vũng Tàu G.O - Thiết kế năng động, tiện dụng cho runner',
    sourceMediaId: 2413,
    sourceImageUrl: 'https://mayaobongro.vn/wp-content/uploads/2026/07/ao-chay-bo-vung-tau-go-model-20260705.jpg',
    design: 'Team Vũng Tàu G.O',
    color: 'Xanh Dương',
    palette: 'royal blue, sky blue, white, and small orange accents',
    motif: 'Vũng Tàu G.O team identity and ocean-blue sports style',
    code: 'X24-BR-011',
  },
  {
    id: 1748,
    oldSlug: 'ao-chay-bo-mau-xanh-duong-logo-cam-cong-ty-altios',
    oldTitle: 'Áo Chạy Bộ Màu Xanh Dương Logo Cam Công Ty Altios',
    sourceMediaId: 2414,
    sourceImageUrl: 'https://mayaobongro.vn/wp-content/uploads/2026/07/ao-chay-bo-altios-model-20260705.jpg',
    design: 'Altios',
    color: 'Xanh Dương Cam',
    palette: 'blue, cyan, orange, and white corporate accents',
    motif: 'Altios corporate logo placement and orange-blue contrast',
    code: 'X24-BR-012',
  },
  {
    id: 1746,
    oldSlug: 'ao-chay-bo-mau-vang-xanh-team-taekwondo-nang-dong-thoang-mat-the-thao',
    oldTitle: 'Áo Chạy Bộ Màu Vàng Xanh Team Taekwondo – Năng Động, Thoáng Mát, Thể Thao',
    sourceMediaId: 2415,
    sourceImageUrl: 'https://mayaobongro.vn/wp-content/uploads/2026/07/ao-chay-bo-taekwondo-model-20260705.jpg',
    design: 'Team Taekwondo',
    color: 'Vàng Xanh',
    palette: 'yellow, royal blue, white, and martial arts team accents',
    motif: 'Taekwondo-inspired team motif and yellow-blue contrast',
    code: 'X24-BR-013',
  },
  {
    id: 1744,
    oldSlug: 'ao-chay-bo-binh-minh-running-mau-vang-xanh-tuoi-sang-nang-dong',
    oldTitle: 'Áo Chạy Bộ Bình Minh Running Màu Vàng Xanh – Tươi Sáng, Năng Động',
    sourceMediaId: 2416,
    sourceImageUrl: 'https://mayaobongro.vn/wp-content/uploads/2026/07/ao-chay-bo-binh-minh-running-model-20260705.jpg',
    design: 'Bình Minh',
    color: 'Vàng Xanh',
    palette: 'sunrise yellow, blue, white, and fresh morning accents',
    motif: 'Bình Minh sunrise identity; replace any Running wording with basketball team wording',
    code: 'X24-BR-014',
  },
  {
    id: 1742,
    oldSlug: 'ao-chay-bo-team-run-finish-mau-vang-gradient-suc-song-dot-pha',
    oldTitle: 'Áo Chạy Bộ Team Run Finish Màu Vàng Gradient - Sức Sống & Đột Phá',
    sourceMediaId: 2417,
    sourceImageUrl: 'https://mayaobongro.vn/wp-content/uploads/2026/07/ao-chay-bo-team-run-finish-model-20260705.jpg',
    design: 'Team Finish',
    color: 'Vàng Gradient',
    palette: 'yellow gradient, black, white, and energetic team accents',
    motif: 'replace Run Finish with Team Finish or Hoops Finish; preserve yellow gradient energy',
    code: 'X24-BR-015',
  },
  {
    id: 1740,
    oldSlug: 'ao-chay-bo-nam-nu-mau-vang-team-ho-da-nang-dong-thoang-khi-thiet-ke-doc-quyen',
    oldTitle: 'Áo Chạy Bộ Nam Nữ Màu Vàng Team Hồ Đá – Năng Động, Thoáng Khí, Thiết Kế Độc Quyền',
    sourceMediaId: 2418,
    sourceImageUrl: 'https://mayaobongro.vn/wp-content/uploads/2026/07/ao-chay-bo-ho-da-runners-page2-final-model-20260705.jpg',
    design: 'Team Hồ Đá',
    color: 'Vàng',
    palette: 'yellow, black, white, and outdoor team accents',
    motif: 'Team Hồ Đá identity with bold yellow custom-team style',
    code: 'X24-BR-016',
  },
  {
    id: 1738,
    oldSlug: 'ao-chay-bo-trang-speed-coffee-ca-tinh-nang-luong-va-thoi-trang-tre-trung',
    oldTitle: 'Áo chạy bộ trắng Speed Coffee cá tính – Năng lượng và thời trang trẻ trung',
    sourceMediaId: 2419,
    sourceImageUrl: 'https://mayaobongro.vn/wp-content/uploads/2026/07/ao-chay-bo-speed-coffee-model-20260705.jpg',
    design: 'Speed Coffee',
    color: 'Trắng',
    palette: 'white, coffee brown, black, and warm cafe accents',
    motif: 'Speed Coffee identity; remove running cues and keep cafe-team style',
    code: 'X24-BR-017',
  },
  {
    id: 1736,
    oldSlug: 'ao-chay-bo-team-review-hn-mau-tim-nang-dong',
    oldTitle: 'Áo Chạy Bộ Team Review HN Màu Tím Năng Động',
    sourceMediaId: 2420,
    sourceImageUrl: 'https://mayaobongro.vn/wp-content/uploads/2026/07/ao-chay-bo-review-hn-tim-model-20260705.jpg',
    design: 'Team Review HN',
    color: 'Tím',
    palette: 'purple, violet, white, and modern review-team accents',
    motif: 'Team Review HN identity and purple custom-team graphic style',
    code: 'X24-BR-018',
  },
  {
    id: 1733,
    oldSlug: 'ao-chay-bo-gradient-hong-xanh-vinastar-thiet-ke-ca-nhan-hoa-vai-thoang-mat',
    oldTitle: 'Áo Chạy Bộ Gradient Hồng Xanh VINASTAR - Thiết Kế Cá Nhân Hóa, Vải Thoáng Mát',
    sourceMediaId: 2421,
    sourceImageUrl: 'https://mayaobongro.vn/wp-content/uploads/2026/07/ao-chay-bo-vinastar-model-20260705.jpg',
    design: 'VINASTAR',
    color: 'Hồng Xanh',
    palette: 'pink, cyan, blue, white, and star-like accents',
    motif: 'VINASTAR identity and pink-blue gradient sports design',
    code: 'X24-BR-019',
  },
  {
    id: 1731,
    oldSlug: 'ao-chay-bo-mau-hong-vang-thiet-ke-rieng-nang-luong-dot-pha',
    oldTitle: 'Áo chạy bộ màu hồng vàng thiết kế riêng – Năng lượng & Đột phá',
    sourceMediaId: 2422,
    sourceImageUrl: 'https://mayaobongro.vn/wp-content/uploads/2026/07/ao-chay-bo-hong-vang-model-20260705.jpg',
    design: 'Gradient Năng Lượng',
    color: 'Hồng Vàng',
    palette: 'pink, yellow, orange, white, and energetic gradient accents',
    motif: 'pink-yellow energy gradient; use a neutral custom-team basketball identity if text is needed',
    code: 'X24-BR-020',
  },
  {
    id: 1729,
    oldSlug: 'ao-chay-bo-mau-hong-tuoi-tre-nang-dong-team-review-ha-noi',
    oldTitle: 'Áo chạy bộ màu hồng tươi trẻ năng động - Team Review Hà Nội',
    sourceMediaId: 2423,
    sourceImageUrl: 'https://mayaobongro.vn/wp-content/uploads/2026/07/ao-chay-bo-review-hn-hong-model-20260705.jpg',
    design: 'Team Review Hà Nội',
    color: 'Hồng',
    palette: 'bright pink, white, red, and review-team accents',
    motif: 'Team Review Hà Nội identity with bright pink custom-team style',
    code: 'X24-BR-021',
  },
];

function slugify(value) {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'D')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function promptFor(product, audience) {
  const isElementary = audience === 'elementary';
  const scene = isElementary
    ? 'covered elementary school basketball court, soft daylight, generic sports setting with hoop visible but no readable school identity'
    : 'high-school basketball court after class, clean daylight, generic sports setting with court lines and hoop visible but no readable school identity';
  const subject = isElementary
    ? 'One fictional Vietnamese elementary-school basketball player, age 9-10, natural child proportions, friendly confident expression, and a safe ready-to-play pose holding or gently dribbling a basketball. The player must look like a child, not a scaled-down adult.'
    : 'One fictional Vietnamese high-school basketball player, age 16-17, athletic but unmistakably age-appropriate, in a confident game-ready basketball pose holding a basketball. No adult bodybuilder proportions and no glamour styling.';

  return `Use case: identity-preserve
Asset type: square WooCommerce product image for mayaobongro.vn

Image 1 is a garment-design reference only. Preserve the ${product.design} design identity if readable, the ${product.palette}, ${product.motif}, and the approved graphic hierarchy. Do not preserve the adult model, running pose, running environment, promotional frame, grey mockup background, website domain, hotline, or running-shirt cut.

Convert the garment into an authentic basketball uniform: wider basketball shoulders, rib-knit crew or V neckline, rib-knit armholes, relaxed straight torso, and a hem 5-8 cm longer than a running or football shirt that covers the shorts waistband. Pair it with loose knee-length basketball shorts. The shorts must coordinate with the jersey palette and design: reuse the dominant colors, matching side panels, gradient/diagonal trim, and restrained repeated motifs. Never default the shorts to black unless black is an intentional design color.

Text decisions: preserve ${product.design} if readable as the design/team name; remove running/race wording, road race cues, marathon cues, mayaochaybo.vn, hotline, and old mockup frame; replace running cues with basketball cues only if text is needed. Do not invent a real school name, student name, or extra sponsor.

Scene: ${scene}.

Subject: ${subject}

Composition: Square 1:1, three-quarter body, garment fully visible, clean category-thumbnail readability, natural basketball-ready pose. Show enough of the uniform to see the longer basketball jersey hem and coordinated shorts.

Style: Photorealistic commercial Vietnamese sportswear photography, realistic breathable mesh, natural folds, correct anatomy, plausible daylight.

Constraints: Fictional student only, age-appropriate, non-sexualized, no exposed midriff, no real school identifiers, no extra logos, no running terminology.

Avoid: running pose, track, road race, marathon cues, running shorts, tight singlet fit, cropped jersey, adult glamour styling, bodybuilder physique, distorted text, distorted hands, copied mockup frame, watermark.`;
}

await mkdir(path.join(root, 'source'), { recursive: true });
await mkdir(path.join(root, 'generated'), { recursive: true });
await mkdir(path.join(root, 'final'), { recursive: true });

const manifest = [];
const jobs = [];
for (const product of products) {
  const baseSlug = slugify(`${product.design} ${product.color} ${product.code}`);
  const newSlug = `bo-quan-ao-bong-ro-${baseSlug}`;
  const sourceFile = `source/${product.code.toLowerCase()}-${slugify(product.design)}-source.jpg`;
  const response = await fetch(product.sourceImageUrl);
  if (!response.ok) throw new Error(`${product.id}: source image HTTP ${response.status}`);
  await writeFile(path.join(root, sourceFile), Buffer.from(await response.arrayBuffer()));

  const record = {
    job_id: `product-${product.id}-${slugify(product.design)}-page2`,
    source_site: sourceSite,
    destination_site: destinationSite,
    destination_product_id: product.id,
    edition_group: slugify(`${product.design}-${product.color}`),
    old_title: product.oldTitle,
    new_title: `Bộ Quần Áo Bóng Rổ ${product.design} ${product.color} ${product.code}`,
    old_slug: product.oldSlug,
    new_slug: newSlug,
    source_image: path.join(root, sourceFile),
    source_media_id: product.sourceMediaId,
    source_image_url: product.sourceImageUrl,
    text_decisions: [
      { source: product.design, action: 'preserve', target: product.design },
      { source: 'running/race wording', action: 'replace', target: 'basketball wording' },
      { source: 'mayaochaybo.vn / hotline / mockup frame', action: 'remove', target: '' },
    ],
    category_ids: [70, 97, 101, 102, 75, 95],
    outputs: {
      elementary: path.join(root, 'final', `${product.code.toLowerCase()}-ao-bong-ro-tieu-hoc.webp`),
      high_school: path.join(root, 'final', `${product.code.toLowerCase()}-ao-bong-ro-thpt.webp`),
    },
    gallery_roles: { featured: 'high_school', secondary: ['elementary'] },
    seo_keywords: [
      'bộ quần áo bóng rổ',
      'áo bóng rổ tiểu học',
      'áo bóng rổ cho trẻ lớp 4-5',
      'áo bóng rổ học sinh THCS',
      'áo bóng rổ lớp 9',
      'áo bóng rổ học sinh cấp 3',
      'áo bóng rổ THPT',
      'đồng phục bóng rổ trường học',
    ],
    status: 'discovered',
    errors: [],
  };
  manifest.push(record);

  for (const audience of ['elementary', 'high_school']) {
    jobs.push({
      id: `${product.code.toLowerCase()}-${audience}`,
      audience,
      product_id: product.id,
      source: sourceFile,
      generated: `generated/${product.code.toLowerCase()}-ao-bong-ro-${audience === 'elementary' ? 'tieu-hoc' : 'thpt'}.png`,
      final: `final/${product.code.toLowerCase()}-ao-bong-ro-${audience === 'elementary' ? 'tieu-hoc' : 'thpt'}.webp`,
      title: record.new_title,
      prompt: promptFor(product, audience),
    });
  }
}

await writeFile(path.join(root, 'manifest.json'), JSON.stringify(manifest, null, 2));
await writeFile(path.join(root, 'jobs.json'), JSON.stringify(jobs, null, 2));
console.log(JSON.stringify({ products: manifest.length, jobs: jobs.length }, null, 2));
