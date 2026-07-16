<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? '/tmp/running-to-basketball-page2';
$manifestPath = rtrim($batchRoot, '/') . '/manifest.json';
$backupDir = rtrim($batchRoot, '/') . '/backups';

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

global $wpdb;

function page2_category_id(string $slug): int
{
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term || is_wp_error($term)) {
        throw new RuntimeException("Missing product category: {$slug}");
    }
    return (int) $term->term_id;
}

function page2_backup_product(int $productId): array
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

function page2_ensure_media(string $path, string $assetKey, string $title, string $alt, string $caption): int
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
        wp_update_post(['ID' => $attachmentId, 'post_title' => $title, 'post_excerpt' => $caption]);
        update_post_meta($attachmentId, '_wp_attachment_image_alt', $alt);
        return $attachmentId;
    }

    if (!is_file($path) || !is_readable($path)) {
        throw new RuntimeException("Generated image is missing or unreadable: {$path}");
    }

    $file = ['name' => basename($path), 'tmp_name' => $path];
    $attachmentId = media_handle_sideload($file, 0, $title);
    if (is_wp_error($attachmentId)) {
        throw new RuntimeException($attachmentId->get_error_message());
    }

    wp_update_post(['ID' => $attachmentId, 'post_title' => $title, 'post_excerpt' => $caption]);
    update_post_meta((int) $attachmentId, '_wp_attachment_image_alt', $alt);
    update_post_meta((int) $attachmentId, '_mayaobongro_generated_asset_key', $assetKey);
    return (int) $attachmentId;
}

function page2_description(array $record, string $elementaryUrl, string $highSchoolUrl): string
{
    $title = esc_html($record['new_title']);
    $design = esc_html(str_replace('Bộ Quần Áo Bóng Rổ ', '', preg_replace('/ X24-BR-\d{3}$/', '', $record['new_title'])));
    $code = esc_html(preg_match('/X24-BR-\d{3}/', $record['new_title'], $m) ? $m[0] : '');
    return <<<HTML
<h2>{$title}</h2>
<p>Thiết kế {$design} được chuyển sang form bóng rổ với áo sát nách vai rộng, cổ và nách viền rib, thân suông dài che cạp quần và quần bóng rổ rộng ngang gối. Bảng màu, logo và mảng họa tiết chính được giữ theo tinh thần mẫu gốc nhưng trình bày lại cho sân bóng rổ.</p>
<p>Bộ {$code} phù hợp đặt may cho nam, nữ, người lớn, trẻ em, đội trường, câu lạc bộ, công ty hoặc nhóm thi đấu phong trào. Có thể tùy chỉnh tên đội, số áo, logo và phối màu theo file khách cung cấp.</p>
<h3>Ảnh mẫu tiểu học lớp 4-5</h3>
<p>Ảnh mẫu tiểu học giúp phụ huynh và giáo viên hình dung áo bóng rổ tiểu học và áo bóng rổ cho trẻ lớp 4-5. Khi đặt may, chiều dài áo, rộng thân và form quần có thể cân theo chiều cao, cân nặng của từng nhóm học sinh.</p>
<figure class="mayaobongro-age-reference"><img src="{$elementaryUrl}" alt="Ảnh mẫu tiểu học lớp 4-5 mặc {$title}"><figcaption>Ảnh mẫu tiểu học lớp 4-5 cho thiết kế {$design}.</figcaption></figure>
<h3>Ảnh mẫu trung học / cấp 3</h3>
<p>Ảnh mẫu trung học thể hiện cùng thiết kế khi may cho học sinh lớn hơn. Mẫu này dùng tốt cho áo bóng rổ học sinh THCS, áo bóng rổ lớp 9, áo bóng rổ học sinh cấp 3 và áo bóng rổ THPT khi đội cần form rộng dễ vận động.</p>
<figure class="mayaobongro-age-reference"><img src="{$highSchoolUrl}" alt="Ảnh mẫu học sinh cấp 3 mặc {$title}"><figcaption>Ảnh mẫu trung học / cấp 3 cho thiết kế {$design}.</figcaption></figure>
<h3>May theo đội nhóm</h3>
<ul>
<li>Giữ bảng màu và nhận diện chính của mẫu thiết kế.</li>
<li>Áo và quần phối cùng màu, viền và họa tiết để thành một bộ bóng rổ hoàn chỉnh.</li>
<li>Có thể đổi sang trắng, đen, hồng, đỏ, vàng, xanh blue, green hoặc phối màu riêng.</li>
<li>Tư vấn size cho nam, nữ, người lớn, trẻ em và từng nhóm vận động cụ thể.</li>
</ul>
HTML;
}

$manifest = json_decode((string) file_get_contents($manifestPath), true);
if (!is_array($manifest)) {
    throw new RuntimeException('Could not read manifest JSON.');
}
if (!is_dir($backupDir) && !mkdir($backupDir, 0755, true)) {
    throw new RuntimeException("Could not create backup dir: {$backupDir}");
}

$categoryIds = [
    page2_category_id('ao-bong-ro-sat-nach'),
    page2_category_id('ao-bong-ro-tre-em'),
    page2_category_id('ao-bong-ro-tieu-hoc-lop-4-5'),
    page2_category_id('ao-bong-ro-trung-hoc-lop-11-12'),
    page2_category_id('may-ao-bong-ro-thiet-ke-rieng-x24'),
    page2_category_id('bo-quan-ao-bong-ro'),
];

$results = [];
foreach ($manifest as $record) {
    $productId = (int) $record['destination_product_id'];
    $product = wc_get_product($productId);
    if (!$product instanceof WC_Product) {
        throw new RuntimeException("Product not found: {$productId}");
    }

    $backup = page2_backup_product($productId);
    $backupPath = $backupDir . '/product-' . $productId . '-before-page2-conversion.json';
    file_put_contents($backupPath, wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL);

    $oldSlug = get_post_field('post_name', $productId);
    $code = preg_match('/X24-BR-\d{3}/', $record['new_title'], $m) ? $m[0] : ('product-' . $productId);
    $elementaryPath = rtrim($batchRoot, '/') . '/final/' . strtolower($code) . '-ao-bong-ro-tieu-hoc.webp';
    $highSchoolPath = rtrim($batchRoot, '/') . '/final/' . strtolower($code) . '-ao-bong-ro-thpt.webp';
    $elementaryMediaId = page2_ensure_media(
        $elementaryPath,
        strtolower($code) . '-tieu-hoc-' . $productId,
        'Bộ bóng rổ tiểu học ' . $record['new_title'],
        'Ảnh mẫu tiểu học lớp 4-5 mặc ' . $record['new_title'],
        'Ảnh mẫu tiểu học lớp 4-5 cho ' . $record['new_title']
    );
    $highSchoolMediaId = page2_ensure_media(
        $highSchoolPath,
        strtolower($code) . '-thpt-' . $productId,
        'Bộ bóng rổ THPT ' . $record['new_title'],
        'Ảnh mẫu học sinh cấp 3 mặc ' . $record['new_title'],
        'Ảnh mẫu trung học / cấp 3 cho ' . $record['new_title']
    );

    $elementaryUrl = (string) wp_get_attachment_url($elementaryMediaId);
    $highSchoolUrl = (string) wp_get_attachment_url($highSchoolMediaId);

    $product->set_name($record['new_title']);
    $product->set_slug($record['new_slug']);
    $product->set_sku($code);
    $product->set_short_description($record['new_title'] . ' có form áo bóng rổ suông, quần đồng bộ và phối màu thiết kế riêng cho đội nhóm, CLB, công ty hoặc đặt may theo yêu cầu.');
    $product->set_description(page2_description($record, $elementaryUrl, $highSchoolUrl));
    $product->set_image_id($highSchoolMediaId);
    $product->set_gallery_image_ids([$elementaryMediaId]);
    $product->set_category_ids($categoryIds);
    $product->set_status('publish');
    $product->set_catalog_visibility('visible');
    $savedProductId = $product->save();

    wp_set_object_terms($savedProductId, [
        'bộ quần áo bóng rổ',
        'áo bóng rổ tiểu học',
        'áo bóng rổ cho trẻ lớp 4-5',
        'áo bóng rổ học sinh THCS',
        'áo bóng rổ lớp 9',
        'áo bóng rổ học sinh cấp 3',
        'áo bóng rổ THPT',
        'đồng phục bóng rổ trường học',
    ], 'product_tag');

    if ($oldSlug && $oldSlug !== $record['new_slug']) {
        add_post_meta($savedProductId, '_wp_old_slug', $oldSlug, false);
    }

    update_post_meta($savedProductId, '_mayaobongro_edition_group', $record['edition_group']);
    update_post_meta($savedProductId, '_mayaobongro_age_gallery_model', 'single-product');
    update_post_meta($savedProductId, '_mayaobongro_age_image_tieu_hoc_id', $elementaryMediaId);
    update_post_meta($savedProductId, '_mayaobongro_age_image_thpt_id', $highSchoolMediaId);
    update_post_meta($savedProductId, '_mayaobongro_age_keywords', 'áo bóng rổ tiểu học, áo bóng rổ cho trẻ lớp 4-5, áo bóng rổ học sinh THCS, áo bóng rổ lớp 9, áo bóng rổ học sinh cấp 3, áo bóng rổ THPT');
    update_post_meta($savedProductId, '_yoast_wpseo_focuskw', 'bộ quần áo bóng rổ thiết kế riêng');
    update_post_meta($savedProductId, '_yoast_wpseo_metadesc', $record['new_title'] . ', form bóng rổ suông, quần đồng bộ, có ảnh mẫu tiểu học lớp 4-5 và cấp 3/THPT.');

    clean_post_cache($savedProductId);
    wc_delete_product_transients($savedProductId);
    clean_post_cache($elementaryMediaId);
    clean_post_cache($highSchoolMediaId);

    $fresh = wc_get_product($savedProductId);
    $results[] = [
        'product_id' => $savedProductId,
        'old_slug' => $oldSlug,
        'new_slug' => get_post_field('post_name', $savedProductId),
        'sku' => $fresh ? $fresh->get_sku() : '',
        'featured_media_id' => $fresh ? (int) $fresh->get_image_id() : 0,
        'gallery_media_ids' => $fresh ? $fresh->get_gallery_image_ids() : [],
        'elementary_media_id' => $elementaryMediaId,
        'high_school_media_id' => $highSchoolMediaId,
        'backup_path' => $backupPath,
    ];
}

echo wp_json_encode(['count' => count($results), 'results' => $results], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
