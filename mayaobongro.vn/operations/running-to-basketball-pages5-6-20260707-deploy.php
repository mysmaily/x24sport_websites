<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? '/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/running-to-basketball-pages5-6-20260707';
$backupDir = rtrim($batchRoot, '/') . '/backups';

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

global $wpdb;

function pages56_category_id(string $slug): int
{
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term || is_wp_error($term)) {
        throw new RuntimeException("Missing product category: {$slug}");
    }

    return (int) $term->term_id;
}

function pages56_backup_product(int $productId): array
{
    global $wpdb;

    return [
        'captured_at' => current_time('c'),
        'site_url' => site_url('/'),
        'product_id' => $productId,
        'records' => [
            'posts' => $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $productId), ARRAY_A),
            'postmeta' => $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->postmeta} WHERE post_id = %d ORDER BY meta_id", $productId), ARRAY_A),
            'term_relationships' => $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->term_relationships} WHERE object_id = %d", $productId), ARRAY_A),
        ],
    ];
}

function pages56_ensure_media(string $path, string $assetKey, string $title, string $alt, string $caption): int
{
    $existing = get_posts([
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'posts_per_page' => 1,
        'fields' => 'ids',
        'meta_query' => [[
            'key' => '_mayaobongro_generated_asset_key',
            'value' => $assetKey,
        ]],
    ]);
    if ($existing) {
        $attachmentId = (int) $existing[0];
        wp_update_post([
            'ID' => $attachmentId,
            'post_title' => $title,
            'post_excerpt' => $caption,
            'post_content' => $caption,
        ]);
        update_post_meta($attachmentId, '_wp_attachment_image_alt', $alt);
        return $attachmentId;
    }

    if (!is_file($path) || !is_readable($path)) {
        throw new RuntimeException("Generated image is missing or unreadable: {$path}");
    }

    $attachmentId = media_handle_sideload([
        'name' => basename($path),
        'tmp_name' => $path,
    ], 0, $title);
    if (is_wp_error($attachmentId)) {
        throw new RuntimeException($attachmentId->get_error_message());
    }

    wp_update_post([
        'ID' => (int) $attachmentId,
        'post_title' => $title,
        'post_excerpt' => $caption,
        'post_content' => $caption,
    ]);
    update_post_meta((int) $attachmentId, '_wp_attachment_image_alt', $alt);
    update_post_meta((int) $attachmentId, '_mayaobongro_generated_asset_key', $assetKey);

    return (int) $attachmentId;
}

function pages56_design_name(array $record): string
{
    $code = preg_quote((string) $record['product_code'], '/');
    $title = preg_replace('/^Bộ Quần Áo Bóng Rổ\s+/u', '', (string) $record['new_title']) ?? (string) $record['new_title'];
    $title = preg_replace('/\s+' . $code . '$/u', '', $title) ?? $title;
    return trim($title);
}

function pages56_short_design_name(array $record): string
{
    $design = pages56_design_name($record);
    $design = preg_replace('/\b(Thiết Kế|Thiết kế|Hiện Đại|Hiện đại|Năng Động|Năng động|Thoáng Mát|Thoáng mát|Cá Tính|Cá tính)\b/u', '', $design) ?? $design;
    $design = preg_replace('/\s+/u', ' ', trim($design)) ?? $design;
    $parts = preg_split('/\s+/u', $design, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    if (count($parts) > 3) {
        $design = implode(' ', array_slice($parts, 0, 3));
    }
    return trim($design) !== '' ? trim($design) : pages56_design_name($record);
}

function pages56_description(array $record, string $elementaryUrl, string $highSchoolUrl): string
{
    $design = esc_html(pages56_design_name($record));
    $shortDesign = esc_html(pages56_short_design_name($record));
    $elementaryLabel = "Mẫu áo bóng rổ {$shortDesign} cho trẻ tiểu học, trung học cơ sở.";
    $highSchoolLabel = "Mẫu bóng rổ {$shortDesign} cho học sinh trung học phổ thông, người lớn.";
    $elementaryAlt = esc_attr($elementaryLabel);
    $highSchoolAlt = esc_attr($highSchoolLabel);

    return <<<HTML
<h2>Mẫu áo bóng rổ {$design}</h2>
<p>Mẫu {$design} được chuyển sang form bóng rổ với áo sát nách vai rộng, cổ và nách bo gọn, thân áo suông dài che cạp quần và quần bóng rổ rộng gần gối. Bảng màu, logo và mảng họa tiết chính được giữ theo tinh thần thiết kế gốc nhưng trình bày lại gọn hơn cho sân bóng rổ.</p>

<h3>Thiết kế, chất liệu và cảm giác mặc</h3>
<p>Bộ áo ưu tiên cảm giác nhẹ, thoáng và dễ vận động trong tập luyện hoặc thi đấu nội bộ. Áo và quần được phối đồng bộ để khi cả đội đứng cạnh nhau vẫn nhận ra cùng một mẫu, không bị lệch màu giữa thân áo và quần.</p>

<h3>Ảnh tham khảo theo form học sinh</h3>
<div class="mbro-age-reference-images">
  <figure>
    <img src="{$elementaryUrl}" alt="{$elementaryAlt}" loading="lazy" decoding="async">
    <figcaption>{$elementaryLabel}</figcaption>
  </figure>
  <figure>
    <img src="{$highSchoolUrl}" alt="{$highSchoolAlt}" loading="lazy" decoding="async">
    <figcaption>{$highSchoolLabel}</figcaption>
  </figure>
  <p>Với đội THCS hoặc lớp 9, xưởng dùng cùng mẫu thiết kế này và cân lại chiều dài áo, vòng ngực, quần theo danh sách size thực tế.</p>
</div>

<h3>Đặt may theo đội</h3>
<p>Có thể tinh chỉnh tên đội, tên riêng, số áo, logo, sponsor và bảng size theo từng danh sách đặt may. Nếu đội muốn đổi phối màu hoặc thêm logo riêng, nên gửi file trước để kiểm tra độ rõ khi in lên chất liệu áo bóng rổ.</p>
HTML;
}

function pages56_excerpt(array $record): string
{
    return sprintf(
        '%s có form áo bóng rổ suông dài, quần đồng bộ theo họa tiết và chất vải thể thao thoáng nhẹ, phù hợp đặt may theo đội.',
        (string) $record['new_title']
    );
}

function pages56_load_manifest(string $batchRoot): array
{
    $records = [];
    foreach (['page5', 'page6'] as $page) {
        $path = rtrim($batchRoot, '/') . '/' . $page . '/manifest.json';
        $items = json_decode((string) file_get_contents($path), true);
        if (!is_array($items)) {
            throw new RuntimeException("Could not read manifest: {$path}");
        }
        foreach ($items as $item) {
            $item['_batch_page'] = $page;
            $records[] = $item;
        }
    }

    return $records;
}

if (!is_dir($backupDir) && !mkdir($backupDir, 0755, true)) {
    throw new RuntimeException("Could not create backup dir: {$backupDir}");
}

$categoryIds = [
    pages56_category_id('ao-bong-ro-sat-nach'),
    pages56_category_id('ao-bong-ro-tre-em'),
    pages56_category_id('ao-bong-ro-tieu-hoc-lop-4-5'),
    pages56_category_id('ao-bong-ro-trung-hoc-lop-11-12'),
    pages56_category_id('may-ao-bong-ro-thiet-ke-rieng-x24'),
    pages56_category_id('bo-quan-ao-bong-ro'),
];

$ageKeywords = [
    'bộ quần áo bóng rổ thiết kế riêng',
    'bộ quần áo bóng rổ học sinh',
    'áo bóng rổ tiểu học',
    'áo bóng rổ cho trẻ lớp 4-5',
    'áo bóng rổ học sinh THCS',
    'áo bóng rổ lớp 9',
    'áo bóng rổ học sinh cấp 3',
    'áo bóng rổ THPT',
    'đồng phục bóng rổ trường học',
];

$results = [];
foreach (pages56_load_manifest($batchRoot) as $record) {
    $productId = (int) $record['destination_product_id'];
    $product = wc_get_product($productId);
    if (!$product instanceof WC_Product) {
        throw new RuntimeException("Product not found: {$productId}");
    }

    $backup = pages56_backup_product($productId);
    $backupPath = $backupDir . '/product-' . $productId . '-before-pages5-6-conversion.json';
    file_put_contents($backupPath, wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL);

    $oldSlug = get_post_field('post_name', $productId);
    $page = (string) $record['_batch_page'];
    $code = (string) $record['product_code'];
    $codeSlug = strtolower($code);
    $elementaryPath = rtrim($batchRoot, '/') . '/' . $page . '/final/' . $codeSlug . '-ao-bong-ro-tieu-hoc.webp';
    $highSchoolPath = rtrim($batchRoot, '/') . '/' . $page . '/final/' . $codeSlug . '-ao-bong-ro-thpt.webp';
    $design = pages56_design_name($record);

    $elementaryMediaId = pages56_ensure_media(
        $elementaryPath,
        $codeSlug . '-tieu-hoc-' . $productId . '-pages5-6',
        'Ảnh tiểu học ' . $record['new_title'],
        'Mẫu áo bóng rổ ' . pages56_short_design_name($record) . ' cho trẻ tiểu học, trung học cơ sở.',
        'Mẫu áo bóng rổ ' . pages56_short_design_name($record) . ' cho trẻ tiểu học, trung học cơ sở.'
    );
    $highSchoolMediaId = pages56_ensure_media(
        $highSchoolPath,
        $codeSlug . '-thpt-' . $productId . '-pages5-6',
        'Ảnh THPT ' . $record['new_title'],
        'Mẫu bóng rổ ' . pages56_short_design_name($record) . ' cho học sinh trung học phổ thông, người lớn.',
        'Mẫu bóng rổ ' . pages56_short_design_name($record) . ' cho học sinh trung học phổ thông, người lớn.'
    );

    $elementaryUrl = (string) wp_get_attachment_url($elementaryMediaId);
    $highSchoolUrl = (string) wp_get_attachment_url($highSchoolMediaId);
    if ($elementaryUrl === '' || $highSchoolUrl === '') {
        throw new RuntimeException("Could not resolve media URLs for product {$productId}");
    }

    $product->set_name((string) $record['new_title']);
    $product->set_slug((string) $record['new_slug']);
    $product->set_sku($code);
    $product->set_short_description(pages56_excerpt($record));
    $product->set_description(pages56_description($record, $elementaryUrl, $highSchoolUrl));
    $product->set_image_id($highSchoolMediaId);
    $product->set_gallery_image_ids([$elementaryMediaId]);
    $product->set_category_ids($categoryIds);
    $product->set_status('publish');
    $product->set_catalog_visibility('visible');
    $savedProductId = $product->save();

    wp_set_object_terms($savedProductId, array_merge($ageKeywords, [$design, $code]), 'product_tag');

    if ($oldSlug && $oldSlug !== $record['new_slug']) {
        add_post_meta($savedProductId, '_wp_old_slug', $oldSlug, false);
    }

    update_post_meta($savedProductId, '_mayaobongro_edition_group', sanitize_title((string) $record['edition_group']));
    update_post_meta($savedProductId, '_mayaobongro_age_gallery_model', 'single-product');
    update_post_meta($savedProductId, '_mayaobongro_age_image_tieu_hoc_id', $elementaryMediaId);
    update_post_meta($savedProductId, '_mayaobongro_age_image_thpt_id', $highSchoolMediaId);
    update_post_meta($savedProductId, '_mayaobongro_age_keywords', implode(', ', $ageKeywords));
    delete_post_meta($savedProductId, '_mayaobongro_school_level');
    delete_post_meta($savedProductId, '_mayaobongro_linked_product_id');
    update_post_meta($savedProductId, '_yoast_wpseo_focuskw', 'bộ quần áo bóng rổ thiết kế riêng');
    update_post_meta(
        $savedProductId,
        '_yoast_wpseo_metadesc',
        $record['new_title'] . ', form bóng rổ suông dài, quần đồng bộ, vải thể thao thoáng nhẹ và nhận đặt may theo đội.'
    );

    clean_post_cache($savedProductId);
    wc_delete_product_transients($savedProductId);

    $fresh = wc_get_product($savedProductId);
    $results[] = [
        'product_id' => $savedProductId,
        'page' => $page,
        'old_slug' => $oldSlug,
        'new_slug' => get_post_field('post_name', $savedProductId),
        'url' => get_permalink($savedProductId),
        'sku' => $fresh ? $fresh->get_sku() : '',
        'featured_media_id' => $fresh ? (int) $fresh->get_image_id() : 0,
        'gallery_media_ids' => $fresh ? $fresh->get_gallery_image_ids() : [],
        'elementary_media_id' => $elementaryMediaId,
        'high_school_media_id' => $highSchoolMediaId,
        'backup_path' => $backupPath,
    ];
}

echo wp_json_encode([
    'count' => count($results),
    'results' => $results,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
