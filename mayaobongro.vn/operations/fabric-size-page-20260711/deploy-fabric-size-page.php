<?php
declare(strict_types=1);

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? ($siteRoot . '/wp-content/uploads/codex-ops/fabric-size-page-20260711');

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';

$pageId = 2625;
$page = get_post($pageId);
if (!$page instanceof WP_Post || $page->post_type !== 'page') {
    throw new RuntimeException('Target page not found.');
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . date('Ymd-His');
if (!wp_mkdir_p($backupDir)) {
    throw new RuntimeException('Unable to create backup directory: ' . $backupDir);
}

$backup = [
    'page_id' => $pageId,
    'post_title' => $page->post_title,
    'post_name' => $page->post_name,
    'post_content' => $page->post_content,
    'post_excerpt' => $page->post_excerpt,
    'post_modified' => $page->post_modified,
    'post_modified_gmt' => $page->post_modified_gmt,
];
file_put_contents(
    $backupDir . '/page-2625-content.json',
    wp_json_encode($backup, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
);

$sourceDir = rtrim($batchRoot, '/') . '/source';
$fabrics = [
    [
        'key' => 'thun-lanh',
        'file' => $sourceDir . '/thun-lanh.jpg',
        'title' => 'Vải thun lạnh áo bóng rổ',
        'alt' => 'Vải thun lạnh may áo bóng rổ',
        'name' => 'Vải Thun lạnh',
        'desc' => 'Bề mặt mịn, mát tay, ít nhăn và dễ mặc trong điều kiện vận động thường xuyên.',
        'tags' => ['Mát lạnh', 'Ít nhăn', 'Dễ mặc'],
    ],
    [
        'key' => 'me-thai',
        'file' => $sourceDir . '/me-thai.jpg',
        'title' => 'Vải mè Thái áo bóng rổ',
        'alt' => 'Vải mè Thái may áo bóng rổ',
        'name' => 'Vải Mè Thái',
        'desc' => 'Chất vải nhẹ, thoáng khí, bề mặt lỗ mè nhỏ giúp thoát mồ hôi tốt khi thi đấu.',
        'tags' => ['Thoáng khí', 'Nhẹ', 'Nhanh khô'],
    ],
    [
        'key' => 'me-texa',
        'file' => $sourceDir . '/me-texa.jpg',
        'title' => 'Vải mè Texa áo bóng rổ',
        'alt' => 'Vải mè Texa may áo bóng rổ',
        'name' => 'Vải Mè Texa',
        'desc' => 'Bề mặt dệt nổi dạng ô nhỏ, tạo cảm giác chắc vải, đứng form và bền khi sử dụng lâu dài.',
        'tags' => ['Đứng form', 'Bền bỉ', 'Dệt nổi'],
    ],
    [
        'key' => 'me-lava',
        'file' => $sourceDir . '/me-lava.jpg',
        'title' => 'Vải mè Lava áo bóng rổ',
        'alt' => 'Vải mè Lava may áo bóng rổ',
        'name' => 'Vải Mè Lava',
        'desc' => 'Kiểu dệt lưới thoáng, phù hợp áo bóng rổ cần độ thoải mái và khả năng thoát nhiệt tốt.',
        'tags' => ['Lưới thoáng', 'Thoát nhiệt', 'Thể thao'],
    ],
];

function x24_import_image(array $fabric, int $pageId): array
{
    if (!is_readable($fabric['file'])) {
        throw new RuntimeException('Missing source image: ' . $fabric['file']);
    }

    $existing = get_posts([
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'post_parent' => $pageId,
        'title' => $fabric['title'],
        'posts_per_page' => 1,
        'fields' => 'ids',
    ]);

    if (!empty($existing)) {
        $attachmentId = (int) $existing[0];
        update_post_meta($attachmentId, '_wp_attachment_image_alt', $fabric['alt']);
        return [
            'id' => $attachmentId,
            'url' => wp_get_attachment_url($attachmentId),
        ];
    }

    $upload = wp_upload_bits(
        sanitize_title($fabric['title']) . '-' . date('Ymd-His') . '.jpg',
        null,
        file_get_contents($fabric['file'])
    );
    if (!empty($upload['error'])) {
        throw new RuntimeException('Upload failed: ' . $upload['error']);
    }

    $attachmentId = wp_insert_attachment([
        'post_mime_type' => 'image/jpeg',
        'post_title' => $fabric['title'],
        'post_content' => '',
        'post_status' => 'inherit',
        'post_parent' => $pageId,
    ], $upload['file'], $pageId);

    if (is_wp_error($attachmentId)) {
        throw new RuntimeException($attachmentId->get_error_message());
    }

    $metadata = wp_generate_attachment_metadata((int) $attachmentId, $upload['file']);
    wp_update_attachment_metadata((int) $attachmentId, $metadata);
    update_post_meta((int) $attachmentId, '_wp_attachment_image_alt', $fabric['alt']);

    return [
        'id' => (int) $attachmentId,
        'url' => wp_get_attachment_url((int) $attachmentId),
    ];
}

$cards = '';
$manifest = [];
foreach ($fabrics as $fabric) {
    $media = x24_import_image($fabric, $pageId);
    $manifest[$fabric['key']] = $media;
    $tagHtml = '';
    foreach ($fabric['tags'] as $tag) {
        $tagHtml .= '<span>' . esc_html($tag) . '</span>';
    }
    $cards .= sprintf(
        '<article class="x24-br-fabric-card"><a class="x24-br-fabric-media" href="%1$s" data-x24-br-lightbox aria-label="Phóng to %2$s"><img src="%1$s" alt="%3$s" loading="lazy" decoding="async"></a><div class="x24-br-fabric-body"><h2>%2$s</h2><p>%4$s</p><div class="x24-br-fabric-tags">%5$s</div></div></article>',
        esc_url($media['url']),
        esc_html($fabric['name']),
        esc_attr($fabric['alt']),
        esc_html($fabric['desc']),
        $tagHtml
    );
}

file_put_contents(
    $backupDir . '/imported-media.json',
    wp_json_encode($manifest, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
);

$content = <<<HTML
<style>
.x24-br-material-page{--x24-blue:#073e68;--x24-red:#e30613;--x24-ink:#122033;--x24-soft:#eef4fb;--x24-line:#d9e5f2;color:var(--x24-ink);font-family:Montserrat,Arial,sans-serif}.x24-br-hero{padding:34px 0 22px;border-bottom:1px solid var(--x24-line);margin-bottom:30px}.x24-br-hero h1{font-size:clamp(30px,5vw,56px);line-height:1.05;margin:0 0 14px;color:var(--x24-blue);text-transform:uppercase}.x24-br-hero p{font-size:18px;max-width:820px;margin:0;color:#425269}.x24-br-section-head{display:flex;justify-content:space-between;gap:20px;align-items:end;margin:28px 0 18px}.x24-br-section-head h2{font-size:clamp(24px,3vw,36px);margin:0;color:var(--x24-blue)}.x24-br-section-head p{margin:0;max-width:560px;color:#536276}.x24-br-fabric-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:18px}.x24-br-fabric-card{border:1px solid var(--x24-line);border-radius:8px;background:#fff;overflow:hidden;box-shadow:0 14px 35px rgba(7,62,104,.08)}.x24-br-fabric-media{display:block;position:relative;background:#f5f7fa;aspect-ratio:1/1;cursor:zoom-in;overflow:hidden}.x24-br-fabric-media:after{content:"Click để phóng to";position:absolute;right:12px;bottom:12px;background:rgba(7,62,104,.9);color:#fff;font-size:12px;font-weight:700;padding:7px 10px;border-radius:999px}.x24-br-fabric-media img{width:100%;height:100%;object-fit:cover;display:block;transition:transform .25s ease}.x24-br-fabric-media:hover img{transform:scale(1.035)}.x24-br-fabric-body{padding:18px}.x24-br-fabric-body h2{font-size:20px;margin:0 0 9px;color:var(--x24-blue)}.x24-br-fabric-body p{font-size:14px;line-height:1.55;margin:0 0 14px;color:#46556a}.x24-br-fabric-tags{display:flex;flex-wrap:wrap;gap:7px}.x24-br-fabric-tags span{font-size:12px;font-weight:700;background:#eaf3fb;color:#073e68;border:1px solid #cfe2f3;padding:6px 9px;border-radius:999px}.x24-br-size-panel{margin-top:34px;padding:26px;border:1px solid var(--x24-line);border-radius:8px;background:linear-gradient(180deg,#fff,#f8fbfe)}.x24-br-size-title{text-align:center;margin-bottom:24px}.x24-br-size-title h2{font-size:clamp(30px,5vw,54px);line-height:1;margin:0;color:var(--x24-blue);text-transform:uppercase}.x24-br-size-title p{font-size:22px;color:var(--x24-red);font-weight:800;margin:10px 0 0}.x24-br-table-block{margin-top:22px}.x24-br-table-block h3{font-size:24px;color:var(--x24-blue);text-transform:uppercase;margin:0 0 12px}.x24-br-table-scroll{overflow-x:auto;-webkit-overflow-scrolling:touch}.x24-br-size-table{width:100%;min-width:760px;border-collapse:separate;border-spacing:0;text-align:center;font-weight:800;color:var(--x24-blue)}.x24-br-size-table th,.x24-br-size-table td{border:2px solid #fff;padding:16px 14px;background:#dce9f8}.x24-br-size-table thead th{background:var(--x24-blue);color:#fff;font-size:25px}.x24-br-size-table tbody th{background:#d2e1f4;text-transform:uppercase;font-size:15px;white-space:nowrap}.x24-br-size-table tbody td{font-size:21px}.x24-br-size-note{text-align:center;color:var(--x24-red);font-size:20px;font-weight:800;margin:28px 0 22px}.x24-br-size-cta{background:var(--x24-blue);color:#fff;text-align:center;font-size:26px;font-weight:800;padding:18px 20px;border-radius:4px}.x24-br-actions{display:flex;flex-wrap:wrap;gap:12px;margin:28px 0 0}.x24-br-actions a{display:inline-flex;align-items:center;justify-content:center;min-height:44px;border-radius:4px;padding:0 18px;font-weight:800}.x24-br-actions .primary{background:var(--x24-red);color:#fff}.x24-br-actions .secondary{background:var(--x24-blue);color:#fff}.x24-br-lightbox{position:fixed;inset:0;background:rgba(3,12,24,.9);z-index:999999;display:none;align-items:center;justify-content:center;padding:24px}.x24-br-lightbox.is-open{display:flex}.x24-br-lightbox img{max-width:92vw;max-height:84vh;object-fit:contain;transition:transform .2s ease;cursor:zoom-in}.x24-br-lightbox.is-zoomed img{transform:scale(1.55);cursor:zoom-out}.x24-br-lightbox button{position:absolute;top:18px;border:0;border-radius:999px;background:#fff;color:#073e68;font-weight:800;min-width:44px;height:44px;padding:0 14px;cursor:pointer}.x24-br-lightbox .x24-br-close{right:18px;font-size:24px}.x24-br-lightbox .x24-br-zoom{right:72px;font-size:14px}@media (max-width:980px){.x24-br-fabric-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.x24-br-section-head{display:block}.x24-br-section-head p{margin-top:8px}.x24-br-size-panel{padding:18px}.x24-br-size-table tbody td{font-size:18px}.x24-br-size-cta{font-size:20px}}@media (max-width:560px){.x24-br-hero{padding-top:18px}.x24-br-fabric-grid{grid-template-columns:1fr}.x24-br-fabric-card{display:grid;grid-template-columns:42% 58%}.x24-br-fabric-media{aspect-ratio:auto;min-height:170px}.x24-br-fabric-media:after{font-size:11px;right:8px;bottom:8px}.x24-br-fabric-body{padding:14px}.x24-br-fabric-body h2{font-size:18px}.x24-br-size-title p{font-size:18px}.x24-br-table-block h3{font-size:20px}.x24-br-size-table{min-width:680px}.x24-br-size-table th,.x24-br-size-table td{padding:13px 10px}.x24-br-size-note{font-size:16px}.x24-br-size-cta{font-size:16px}.x24-br-actions a{width:100%}.x24-br-lightbox{padding:12px}.x24-br-lightbox.is-zoomed img{transform:scale(1.25)}}@media (prefers-reduced-motion:reduce){.x24-br-fabric-media img,.x24-br-lightbox img{transition:none}}
</style>
<div class="x24-br-material-page">
  <section class="x24-br-hero">
    <h1>Chất liệu &amp; bảng size áo bóng rổ</h1>
    <p>Chọn đúng chất liệu và kích thước giúp đồng phục thoải mái khi vận động, đồng thời giữ form áo đồng đều cho cả đội.</p>
  </section>

  <section class="x24-br-fabrics" aria-labelledby="x24-br-fabric-heading">
    <div class="x24-br-section-head">
      <h2 id="x24-br-fabric-heading">Chất liệu áo bóng rổ</h2>
      <p>Bấm vào từng ảnh để phóng to và xem rõ bề mặt vải trước khi chọn chất liệu cho đội.</p>
    </div>
    <div class="x24-br-fabric-grid">
      {$cards}
    </div>
  </section>

  <section class="x24-br-size-panel" aria-labelledby="x24-br-size-heading">
    <div class="x24-br-size-title">
      <h2 id="x24-br-size-heading">Hướng dẫn chọn size</h2>
      <p>(Bảng size Châu Á)</p>
    </div>

    <div class="x24-br-table-block">
      <h3>Bảng size người lớn</h3>
      <div class="x24-br-table-scroll" role="region" aria-label="Bảng size người lớn" tabindex="0">
        <table class="x24-br-size-table">
          <thead>
            <tr><th>SIZE</th><th>S</th><th>M</th><th>L</th><th>XL</th><th>2XL</th><th>3XL</th><th>4,5,6XL</th></tr>
          </thead>
          <tbody>
            <tr><th>Cân nặng (kg)</th><td>40 - 53</td><td>53 - 60</td><td>60 - 68</td><td>68 - 74</td><td>74 - 80</td><td>80 - 86</td><td>86 - 120</td></tr>
            <tr><th>Chiều cao (m)</th><td>1.45 - 1.60</td><td>1.60 - 1.65</td><td>1.65 - 1.70</td><td>1.70 - 1.75</td><td>1.75 - 1.80</td><td>1.80 - 1.85</td><td>1.80 - 1.85</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <div class="x24-br-table-block">
      <h3>Bảng size trẻ em</h3>
      <div class="x24-br-table-scroll" role="region" aria-label="Bảng size trẻ em" tabindex="0">
        <table class="x24-br-size-table">
          <thead>
            <tr><th>SIZE</th><th>1</th><th>3</th><th>5</th><th>7</th><th>9</th><th>11</th><th>13</th></tr>
          </thead>
          <tbody>
            <tr><th>Cân nặng (kg)</th><td>8 - 10</td><td>10 - 15</td><td>15 - 20</td><td>20 - 25</td><td>25 - 30</td><td>30 - 35</td><td>35 - 40</td></tr>
            <tr><th>Tuổi</th><td>&lt;= 2 tuổi</td><td>&lt;= 3 tuổi</td><td>&lt;= 5 tuổi</td><td>&lt;= 7 tuổi</td><td>&lt;= 9 tuổi</td><td>&lt;= 11 tuổi</td><td>&lt;= 13 tuổi</td></tr>
          </tbody>
        </table>
      </div>
    </div>

    <p class="x24-br-size-note">Nếu muốn mặc rộng rãi, thoải mái, quý khách vui lòng chọn tăng 1 - 2 size. Xin cảm ơn ạ!</p>
    <div class="x24-br-size-cta">Website: mayaobongro.vn - Hotline/Zalo: 0989.353.247</div>
  </section>

  <div class="x24-br-actions">
    <a class="primary" href="https://zalo.me/0989353247">Gửi danh sách size qua Zalo</a>
    <a class="secondary" href="/dat-may-ao-bong-ro/">Đặt may áo bóng rổ</a>
  </div>
</div>
<script>
(function(){var links=document.querySelectorAll('[data-x24-br-lightbox]');if(!links.length)return;var box=document.createElement('div');box.className='x24-br-lightbox';box.setAttribute('role','dialog');box.setAttribute('aria-modal','true');box.innerHTML='<button class="x24-br-zoom" type="button">Zoom</button><button class="x24-br-close" type="button" aria-label="Đóng">×</button><img alt="">';document.body.appendChild(box);var img=box.querySelector('img');function close(){box.classList.remove('is-open','is-zoomed');img.removeAttribute('src');document.body.style.overflow=''}function toggle(){box.classList.toggle('is-zoomed')}links.forEach(function(link){link.addEventListener('click',function(e){e.preventDefault();img.src=link.href;img.alt=(link.querySelector('img')||{}).alt||'Ảnh chất liệu vải';box.classList.add('is-open');document.body.style.overflow='hidden'})});box.querySelector('.x24-br-close').addEventListener('click',close);box.querySelector('.x24-br-zoom').addEventListener('click',toggle);img.addEventListener('click',toggle);box.addEventListener('click',function(e){if(e.target===box)close()});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&box.classList.contains('is-open'))close()})})();
</script>
HTML;

$updated = wp_update_post([
    'ID' => $pageId,
    'post_content' => $content,
    'post_excerpt' => '',
], true);

if (is_wp_error($updated)) {
    throw new RuntimeException($updated->get_error_message());
}

clean_post_cache($pageId);
if (function_exists('rocket_clean_post')) {
    rocket_clean_post($pageId);
}
if (function_exists('w3tc_flush_post')) {
    w3tc_flush_post($pageId);
}
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
}

echo wp_json_encode([
    'ok' => true,
    'page_id' => $pageId,
    'backup_dir' => $backupDir,
    'media' => $manifest,
    'url' => get_permalink($pageId),
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . PHP_EOL;
