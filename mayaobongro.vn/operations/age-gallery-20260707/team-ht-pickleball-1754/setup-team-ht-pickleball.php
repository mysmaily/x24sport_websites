<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$productId = isset($argv[2]) ? (int) $argv[2] : 1754;
$elementaryImagePath = $argv[3] ?? '';
$highSchoolImagePath = $argv[4] ?? '';

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$plugin = 'mayaobongro-linked-editions/mayaobongro-linked-editions.php';
if (!is_plugin_active($plugin)) {
    $activated = activate_plugin($plugin);
    if (is_wp_error($activated)) {
        throw new RuntimeException($activated->get_error_message());
    }
}

if (!function_exists('mayaobongro_linked_editions_activate')) {
    throw new RuntimeException('Mayaobongro linked editions plugin did not load.');
}
mayaobongro_linked_editions_activate();

function team_ht_category_id(string $slug): int
{
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term || is_wp_error($term)) {
        throw new RuntimeException("Missing product category: {$slug}");
    }
    return (int) $term->term_id;
}

function team_ht_media(string $path, string $assetKey, string $title, string $alt, string $caption): int
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
        return (int) $existing[0];
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
        'post_excerpt' => $caption,
        'post_content' => $caption,
    ]);
    update_post_meta((int) $attachmentId, '_wp_attachment_image_alt', $alt);
    update_post_meta((int) $attachmentId, '_mayaobongro_generated_asset_key', $assetKey);

    return (int) $attachmentId;
}

$product = wc_get_product($productId);
if (!$product instanceof WC_Product) {
    throw new RuntimeException("Product not found: {$productId}");
}

$oldSlug = get_post_field('post_name', $productId);
$oldSourceMediaId = (int) $product->get_image_id();

$elementaryMediaId = team_ht_media(
    $elementaryImagePath,
    'team-ht-pickleball-tieu-hoc-1754',
    'Bộ bóng rổ tiểu học Team HT Pickleball đỏ xanh núi Việt Nam',
    'Áo bóng rổ tiểu học lớp 4-5 Team HT Pickleball phối đỏ xanh, họa tiết núi và quần đồng bộ',
    'Ảnh mẫu tiểu học lớp 4–5 của bộ bóng rổ học sinh Team HT Pickleball đỏ xanh.'
);
$highSchoolMediaId = team_ht_media(
    $highSchoolImagePath,
    'team-ht-pickleball-thpt-1754',
    'Bộ bóng rổ học sinh cấp 3 Team HT Pickleball đỏ xanh núi Việt Nam',
    'Áo bóng rổ học sinh cấp 3 Team HT Pickleball phối đỏ xanh, họa tiết núi và quần đồng bộ',
    'Ảnh mẫu trung học / THPT lớp 11–12 của bộ bóng rổ học sinh Team HT Pickleball đỏ xanh.'
);

$categories = [
    team_ht_category_id('ao-bong-ro-sat-nach'),
    team_ht_category_id('ao-bong-ro-tre-em'),
    team_ht_category_id('ao-bong-ro-tieu-hoc-lop-4-5'),
    team_ht_category_id('ao-bong-ro-trung-hoc-lop-11-12'),
    team_ht_category_id('may-ao-bong-ro-thiet-ke-rieng-x24'),
    team_ht_category_id('bo-quan-ao-bong-ro'),
];

$title = 'Bộ Quần Áo Bóng Rổ Học Sinh Team HT Pickleball Đỏ Xanh Núi Việt Nam';
$slug = 'bo-quan-ao-bong-ro-hoc-sinh-team-ht-pickleball-do-xanh-nui-viet-nam';
$keywords = [
    'bộ quần áo bóng rổ học sinh',
    'áo bóng rổ tiểu học',
    'áo bóng rổ cho trẻ lớp 4-5',
    'áo bóng rổ học sinh THCS',
    'áo bóng rổ lớp 9',
    'áo bóng rổ học sinh cấp 3',
    'áo bóng rổ THPT',
    'đồng phục bóng rổ trường học',
];

$excerpt = 'Bộ quần áo bóng rổ học sinh Team HT Pickleball phối đỏ – xanh, họa tiết núi và quốc kỳ Việt Nam; có ảnh mẫu cho tiểu học lớp 4–5, THCS lớp 9 và học sinh cấp 3/THPT.';
$description = <<<HTML
<h2>Bộ bóng rổ học sinh Team HT Pickleball đỏ xanh</h2>
<p>Mẫu Team HT Pickleball giữ phối màu đỏ – xanh, quốc kỳ Việt Nam và họa tiết núi của thiết kế gốc, nhưng được chuyển sang form bóng rổ học sinh: áo sát nách rộng vai, thân suông dài che cạp quần và quần bóng rổ rộng gần gối phối đồng bộ với áo.</p>

<h3>Phù hợp nhiều cấp học trong cùng một mẫu</h3>
<p>Sản phẩm dùng một thiết kế duy nhất nhưng có hai ảnh tham khảo: ảnh áo bóng rổ tiểu học lớp 4–5 và ảnh áo bóng rổ học sinh cấp 3/THPT. Khi đặt may, xưởng điều chỉnh size theo chiều cao, cân nặng và danh sách từng đội.</p>
<ul>
  <li><strong>Tiểu học lớp 4–5:</strong> form gọn, thoải mái cho học sinh 9–10 tuổi.</li>
  <li><strong>THCS / lớp 9:</strong> vẫn dùng cùng mẫu, cân size theo từng bạn để đội hình đồng bộ.</li>
  <li><strong>THPT / cấp 3:</strong> form dài và rộng hơn, phù hợp tập luyện và thi đấu ở sân trường.</li>
</ul>

<h3>Câu hỏi thường gặp</h3>
<h4>Mẫu này có may áo bóng rổ tiểu học không?</h4>
<p>Có. Mẫu có ảnh tham khảo cho áo bóng rổ cho trẻ lớp 4-5 và có thể điều chỉnh theo danh sách size của từng lớp.</p>
<h4>Lớp 9/THCS mặc form nào?</h4>
<p>Với áo bóng rổ lớp 9 hoặc đội THCS, xưởng dùng cùng thiết kế nhưng cân đối chiều dài áo, vòng ngực và quần theo số đo thực tế.</p>
<h4>Có may cho học sinh cấp 3 không?</h4>
<p>Có. Đây cũng là mẫu áo bóng rổ học sinh cấp 3 / áo bóng rổ THPT, phù hợp làm đồng phục bóng rổ trường học hoặc đội tuyển lớp.</p>
HTML;

$product->set_name($title);
$product->set_slug($slug);
$product->set_short_description($excerpt);
$product->set_description($description);
$product->set_image_id($highSchoolMediaId);
$product->set_gallery_image_ids([$elementaryMediaId]);
$product->set_category_ids($categories);
$product->set_status('publish');
$product->set_catalog_visibility('visible');
$productId = $product->save();

wp_set_object_terms($productId, [], 'product_tag');
if ($oldSlug && $oldSlug !== get_post_field('post_name', $productId)) {
    add_post_meta($productId, '_wp_old_slug', $oldSlug, false);
}

update_post_meta($productId, MAYAOBONGRO_EDITION_GROUP_META, 'team-ht-pickleball-do-xanh-nui-viet-nam');
update_post_meta($productId, MAYAOBONGRO_AGE_GALLERY_MODEL_META, 'single-product');
update_post_meta($productId, MAYAOBONGRO_AGE_IMAGE_TIEU_HOC_META, $elementaryMediaId);
update_post_meta($productId, MAYAOBONGRO_AGE_IMAGE_THPT_META, $highSchoolMediaId);
update_post_meta($productId, MAYAOBONGRO_AGE_KEYWORDS_META, implode(', ', $keywords));
delete_post_meta($productId, MAYAOBONGRO_SCHOOL_LEVEL_META);
delete_post_meta($productId, MAYAOBONGRO_LINKED_PRODUCT_META);

update_post_meta($productId, '_yoast_wpseo_focuskw', 'bộ quần áo bóng rổ học sinh');
update_post_meta(
    $productId,
    '_yoast_wpseo_metadesc',
    'Bộ bóng rổ học sinh Team HT Pickleball đỏ xanh, có ảnh mẫu áo bóng rổ tiểu học lớp 4–5, lớp 9/THCS và học sinh cấp 3/THPT.'
);

if ($oldSourceMediaId > 0) {
    update_post_meta(
        $oldSourceMediaId,
        '_wp_attachment_image_alt',
        'Ảnh thiết kế gốc Team HT Pickleball đỏ xanh trước khi chuyển sang bóng rổ'
    );
}

clean_post_cache($productId);
wc_delete_product_transients($productId);

echo wp_json_encode([
    'product_id' => $productId,
    'url' => get_permalink($productId),
    'old_slug' => $oldSlug,
    'featured_media_id' => $highSchoolMediaId,
    'gallery_media_ids' => wc_get_product($productId)->get_gallery_image_ids(),
    'source_media_id' => $oldSourceMediaId,
    'category_ids' => wc_get_product($productId)->get_category_ids(),
    'age_gallery_model' => get_post_meta($productId, MAYAOBONGRO_AGE_GALLERY_MODEL_META, true),
    'age_image_tieu_hoc_id' => (int) get_post_meta($productId, MAYAOBONGRO_AGE_IMAGE_TIEU_HOC_META, true),
    'age_image_thpt_id' => (int) get_post_meta($productId, MAYAOBONGRO_AGE_IMAGE_THPT_META, true),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), PHP_EOL;
