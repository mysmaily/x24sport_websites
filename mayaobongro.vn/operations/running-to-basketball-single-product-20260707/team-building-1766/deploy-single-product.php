<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/root/websites/sites/mayaobongro.vn';
$productId = isset($argv[2]) ? (int) $argv[2] : 1766;
$elementaryImagePath = $argv[3] ?? '';
$highSchoolImagePath = $argv[4] ?? '';
$backupPath = $argv[5] ?? '';

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

global $wpdb;

function tb_required_category_id(string $slug): int
{
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term || is_wp_error($term)) {
        throw new RuntimeException("Missing product category: {$slug}");
    }
    return (int) $term->term_id;
}

function tb_backup_product(int $productId): array
{
    global $wpdb;
    return [
        'captured_at' => current_time('c'),
        'site_url' => site_url('/'),
        'product_id' => $productId,
        'records' => [
            'posts' => $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $productId),
                ARRAY_A
            ),
            'postmeta' => $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$wpdb->postmeta} WHERE post_id = %d ORDER BY meta_id", $productId),
                ARRAY_A
            ),
            'term_relationships' => $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$wpdb->term_relationships} WHERE object_id = %d", $productId),
                ARRAY_A
            ),
        ],
    ];
}

function tb_ensure_media(string $path, string $assetKey, string $title, string $alt, string $caption): int
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
        ]);
        update_post_meta($attachmentId, '_wp_attachment_image_alt', $alt);
        return $attachmentId;
    }

    if (!is_file($path) || !is_readable($path)) {
        throw new RuntimeException("Generated image is missing or unreadable: {$path}");
    }

    $file = [
        'name' => basename($path),
        'tmp_name' => $path,
    ];
    $attachmentId = media_handle_sideload($file, 0, $title);
    if (is_wp_error($attachmentId)) {
        throw new RuntimeException($attachmentId->get_error_message());
    }

    wp_update_post([
        'ID' => $attachmentId,
        'post_title' => $title,
        'post_excerpt' => $caption,
    ]);
    update_post_meta((int) $attachmentId, '_wp_attachment_image_alt', $alt);
    update_post_meta((int) $attachmentId, '_mayaobongro_generated_asset_key', $assetKey);

    return (int) $attachmentId;
}

$product = wc_get_product($productId);
if (!$product instanceof WC_Product) {
    throw new RuntimeException("Product not found: {$productId}");
}

$backup = tb_backup_product($productId);
$backupJson = wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if (!is_string($backupJson)) {
    throw new RuntimeException('Could not encode backup JSON.');
}
if ($backupPath !== '') {
    if (file_put_contents($backupPath, $backupJson . PHP_EOL) === false) {
        throw new RuntimeException("Could not write backup: {$backupPath}");
    }
}

$oldSlug = get_post_field('post_name', $productId);

$elementaryMediaId = tb_ensure_media(
    $elementaryImagePath,
    'team-building-x24-br-003-tieu-hoc-1766-v2-guide-overlay',
    'Bộ bóng rổ tiểu học Team Building trắng xanh X24-BR-003',
    'Ảnh mẫu tiểu học lớp 4-5 mặc bộ quần áo bóng rổ Team Building trắng xanh X24-BR-003',
    'Ảnh mẫu tiểu học lớp 4-5 cho thiết kế bóng rổ Team Building trắng xanh'
);
$highSchoolMediaId = tb_ensure_media(
    $highSchoolImagePath,
    'team-building-x24-br-003-thpt-1766-v2-guide-overlay',
    'Bộ bóng rổ THPT Team Building trắng xanh X24-BR-003',
    'Ảnh mẫu học sinh cấp 3 mặc bộ quần áo bóng rổ Team Building trắng xanh X24-BR-003',
    'Ảnh mẫu trung học / cấp 3 cho thiết kế bóng rổ Team Building trắng xanh'
);

$newTitle = 'Bộ Quần Áo Bóng Rổ Học Sinh Team Building Trắng Xanh X24-BR-003';
$newSlug = 'bo-quan-ao-bong-ro-hoc-sinh-team-building-trang-xanh-x24-br-003';
$excerpt = 'Bộ quần áo bóng rổ học sinh Team Building trắng xanh X24-BR-003 phối gradient xanh hiện đại, form áo bóng rổ suông và quần đồng bộ cho đội trường.';
$description = <<<HTML
<h2>Bộ quần áo bóng rổ học sinh Team Building trắng xanh</h2>
<p>Thiết kế Team Building trắng xanh được chuyển sang form bóng rổ học sinh với nền trắng sạch, mảng xanh dương năng động và các đường gradient hiện đại. Áo sát nách có vai rộng hơn, cổ và nách viền rib, thân suông dài che cạp quần để học sinh thoải mái dẫn bóng, chuyền bóng và phối hợp đồng đội.</p>
<p>Quần bóng rổ đi kèm dùng dáng rộng ngang gối, phối trắng, xanh blue và navy đồng bộ với áo. Mẫu này phù hợp cho đội lớp, câu lạc bộ, hoạt động team building trường học hoặc giải giao hữu cần một bộ đồng phục bóng rổ trường học sáng màu, dễ nhận diện.</p>
<h3>Ảnh mẫu tiểu học lớp 4-5</h3>
<p>Ảnh mẫu tiểu học giúp phụ huynh và giáo viên hình dung áo bóng rổ tiểu học cho học sinh khoảng lớp 4-5. Khi đặt may, chiều dài áo, rộng thân và form quần có thể cân theo chiều cao, cân nặng của từng nhóm học sinh.</p>
<figure class="mayaobongro-age-reference"><img src="[TB_ELEMENTARY_URL]" alt="Ảnh mẫu tiểu học lớp 4-5 mặc bộ quần áo bóng rổ Team Building trắng xanh X24-BR-003"><figcaption>Ảnh mẫu tiểu học lớp 4-5 cho thiết kế bóng rổ Team Building trắng xanh.</figcaption></figure>
<h3>Ảnh mẫu trung học / cấp 3</h3>
<p>Ảnh mẫu trung học thể hiện cùng thiết kế khi may cho học sinh lớn hơn. Mẫu này dùng tốt cho áo bóng rổ học sinh THCS, áo bóng rổ lớp 9, áo bóng rổ học sinh cấp 3 và áo bóng rổ THPT khi đội cần form rộng dễ vận động.</p>
<figure class="mayaobongro-age-reference"><img src="[TB_THPT_URL]" alt="Ảnh mẫu học sinh cấp 3 mặc bộ quần áo bóng rổ Team Building trắng xanh X24-BR-003"><figcaption>Ảnh mẫu trung học / cấp 3 cho thiết kế bóng rổ Team Building trắng xanh.</figcaption></figure>
<h3>May theo đội trường</h3>
<ul>
<li>Giữ tinh thần trắng xanh, gradient năng động và nhận diện Team Building.</li>
<li>Áo và quần phối cùng mảng xanh, viền và đường chéo để thành một bộ bóng rổ hoàn chỉnh.</li>
<li>Có thể tùy chỉnh số áo, tên đội, logo lớp hoặc câu lạc bộ nếu khách cung cấp file hợp lệ.</li>
<li>Có thể đổi sang nhiều màu nền khác như trắng, đen, hồng, đỏ, vàng, xanh blue, green hoặc phối màu riêng.</li>
</ul>
<h3>Câu hỏi thường gặp</h3>
<h4>Mẫu này có may cho học sinh tiểu học không?</h4>
<p>Có. Xưởng có thể may áo bóng rổ cho trẻ lớp 4-5 với form suông dễ vận động, chiều dài áo và quần được cân theo vóc dáng học sinh tiểu học.</p>
<h4>Lớp 9/THCS mặc form nào?</h4>
<p>Với học sinh THCS hoặc lớp 9, form thường nằm giữa ảnh mẫu tiểu học và ảnh mẫu THPT. Khi đặt may, đội ngũ sẽ tư vấn size theo chiều cao, cân nặng và cách mặc mong muốn.</p>
<h4>Có may cho học sinh cấp 3 không?</h4>
<p>Có. Cùng thiết kế này có thể sản xuất cho học sinh cấp 3 với form bóng rổ rộng rãi hơn, quần ngang gối và phối màu đồng bộ như ảnh mẫu trung học.</p>
HTML;

$elementaryUrl = wp_get_attachment_url($elementaryMediaId);
$highSchoolUrl = wp_get_attachment_url($highSchoolMediaId);
$description = str_replace(
    ['[TB_ELEMENTARY_URL]', '[TB_THPT_URL]'],
    [$elementaryUrl, $highSchoolUrl],
    $description
);

$product->set_name($newTitle);
$product->set_slug($newSlug);
$product->set_sku('X24-BR-003');
$product->set_short_description($excerpt);
$product->set_description($description);
$product->set_image_id($highSchoolMediaId);
$product->set_gallery_image_ids([$elementaryMediaId]);
$product->set_category_ids([
    tb_required_category_id('ao-bong-ro-sat-nach'),
    tb_required_category_id('ao-bong-ro-tre-em'),
    tb_required_category_id('ao-bong-ro-tieu-hoc-lop-4-5'),
    tb_required_category_id('ao-bong-ro-trung-hoc-lop-11-12'),
    tb_required_category_id('may-ao-bong-ro-thiet-ke-rieng-x24'),
    tb_required_category_id('bo-quan-ao-bong-ro'),
]);
$product->set_status('publish');
$product->set_catalog_visibility('visible');
$savedProductId = $product->save();

wp_set_object_terms($savedProductId, [
    'bộ quần áo bóng rổ học sinh',
    'áo bóng rổ tiểu học',
    'áo bóng rổ cho trẻ lớp 4-5',
    'áo bóng rổ học sinh THCS',
    'áo bóng rổ lớp 9',
    'áo bóng rổ học sinh cấp 3',
    'áo bóng rổ THPT',
    'đồng phục bóng rổ trường học',
    'Team Building',
], 'product_tag');

if ($oldSlug && $oldSlug !== $newSlug) {
    add_post_meta($savedProductId, '_wp_old_slug', $oldSlug, false);
}

update_post_meta($savedProductId, '_mayaobongro_edition_group', 'team-building-retreat-white-blue');
update_post_meta($savedProductId, '_mayaobongro_age_gallery_model', 'single-product');
update_post_meta($savedProductId, '_mayaobongro_age_image_tieu_hoc_id', $elementaryMediaId);
update_post_meta($savedProductId, '_mayaobongro_age_image_thpt_id', $highSchoolMediaId);
update_post_meta(
    $savedProductId,
    '_mayaobongro_age_keywords',
    'áo bóng rổ tiểu học, áo bóng rổ cho trẻ lớp 4-5, áo bóng rổ học sinh THCS, áo bóng rổ lớp 9, áo bóng rổ học sinh cấp 3, áo bóng rổ THPT'
);
update_post_meta($savedProductId, '_yoast_wpseo_focuskw', 'bộ quần áo bóng rổ học sinh');
update_post_meta(
    $savedProductId,
    '_yoast_wpseo_metadesc',
    'Bộ quần áo bóng rổ học sinh Team Building trắng xanh X24-BR-003, có ảnh mẫu tiểu học lớp 4-5, THCS lớp 9 và cấp 3/THPT.'
);

clean_post_cache($savedProductId);
wc_delete_product_transients($savedProductId);
clean_post_cache($elementaryMediaId);
clean_post_cache($highSchoolMediaId);

$freshProduct = wc_get_product($savedProductId);
$result = [
    'product_id' => $savedProductId,
    'old_slug' => $oldSlug,
    'new_slug' => get_post_field('post_name', $savedProductId),
    'sku' => $freshProduct ? $freshProduct->get_sku() : '',
    'url' => get_permalink($savedProductId),
    'featured_media_id' => $freshProduct ? (int) $freshProduct->get_image_id() : 0,
    'gallery_media_ids' => $freshProduct ? $freshProduct->get_gallery_image_ids() : [],
    'elementary_media_id' => $elementaryMediaId,
    'high_school_media_id' => $highSchoolMediaId,
    'category_ids' => $freshProduct ? $freshProduct->get_category_ids() : [],
    'backup_path' => $backupPath,
    'meta' => [
        '_mayaobongro_edition_group' => get_post_meta($savedProductId, '_mayaobongro_edition_group', true),
        '_mayaobongro_age_gallery_model' => get_post_meta($savedProductId, '_mayaobongro_age_gallery_model', true),
        '_mayaobongro_age_image_tieu_hoc_id' => (int) get_post_meta($savedProductId, '_mayaobongro_age_image_tieu_hoc_id', true),
        '_mayaobongro_age_image_thpt_id' => (int) get_post_meta($savedProductId, '_mayaobongro_age_image_thpt_id', true),
    ],
];

echo wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
