<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$sourceProductId = isset($argv[2]) ? (int) $argv[2] : 1764;
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
    throw new RuntimeException('Linked-editions plugin did not load.');
}
mayaobongro_linked_editions_activate();

function eco_required_category_id(string $slug): int
{
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term || is_wp_error($term)) {
        throw new RuntimeException("Missing product category: {$slug}");
    }
    return (int) $term->term_id;
}

function eco_ensure_media(string $path, string $assetKey, string $title, string $alt): int
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

    $file = [
        'name' => basename($path),
        'tmp_name' => $path,
    ];
    $attachmentId = media_handle_sideload($file, 0, $title);
    if (is_wp_error($attachmentId)) {
        throw new RuntimeException($attachmentId->get_error_message());
    }

    update_post_meta((int) $attachmentId, '_wp_attachment_image_alt', $alt);
    update_post_meta((int) $attachmentId, '_mayaobongro_generated_asset_key', $assetKey);

    return (int) $attachmentId;
}

function eco_set_product_copy(WC_Product $product, string $level): void
{
    $isElementary = $level === 'tieu-hoc';
    $levelLabel = $isElementary ? 'Tiểu Học Lớp 4–5' : 'Trung Học Lớp 11–12';
    $slugLevel = $isElementary ? 'tieu-hoc-lop-4-5' : 'trung-hoc-lop-11-12';
    $audience = $isElementary
        ? 'học sinh tiểu học lớp 4–5'
        : 'học sinh trung học lớp 11–12';

    $product->set_name("Bộ Quần Áo Bóng Rổ {$levelLabel} ECO RETREAT Xanh Lá Nhạt");
    $product->set_slug("bo-quan-ao-bong-ro-{$slugLevel}-eco-retreat-xanh-la-nhat");
    $product->set_short_description(
        "Bộ quần áo bóng rổ ECO RETREAT xanh lá nhạt dành cho {$audience}. "
        . 'Áo sát nách form bóng rổ suông dài, phối gradient xanh lá – trắng; '
        . 'quần rộng ngang gối đồng bộ màu và viền với áo, phù hợp tập luyện '
        . 'và thi đấu trong môi trường trường học.'
    );
    $product->set_description(
        "<h2>Bộ bóng rổ ECO RETREAT cho {$levelLabel}</h2>\n"
        . "<p>Mẫu ECO RETREAT giữ tinh thần xanh lá tươi mát của thiết kế gốc, "
        . "nhưng được chuyển hoàn toàn sang form bóng rổ học sinh: áo sát nách "
        . "rộng vai, thân suông dài hơn áo thể thao thông thường và che cạp quần khi vận động.</p>\n"
        . "<h3>Thiết kế áo và quần đồng bộ</h3>\n"
        . "<ul><li>Áo phối gradient xanh lá nhạt xuống trắng, giữ logo ECO RETREAT.</li>"
        . "<li>Motif vận động được chuyển sang bóng rổ, phù hợp sân trường và nhà thi đấu.</li>"
        . "<li>Quần bóng rổ rộng ngang gối, phối trắng – xanh lá và viền đồng bộ với áo.</li>"
        . "<li>Có thể tùy biến tên đội, tên cầu thủ, số áo và logo theo yêu cầu.</li></ul>\n"
        . "<p>Hình ảnh người mẫu là minh họa cho phiên bản {$audience}. "
        . "Dùng bộ chọn <strong>Chọn cấp học</strong> để xem phiên bản còn lại của cùng thiết kế.</p>"
    );
    $product->set_status('publish');
    $product->set_catalog_visibility('visible');
}

$sourceProduct = wc_get_product($sourceProductId);
if (!$sourceProduct) {
    throw new RuntimeException("Source product not found: {$sourceProductId}");
}

$elementarySlug = 'bo-quan-ao-bong-ro-tieu-hoc-lop-4-5-eco-retreat-xanh-la-nhat';
$existingElementaryPost = get_page_by_path($elementarySlug, OBJECT, 'product');

if ($existingElementaryPost) {
    $elementaryProduct = wc_get_product((int) $existingElementaryPost->ID);
} else {
    if (!class_exists('WC_Admin_Duplicate_Product')) {
        require_once WC_ABSPATH . 'includes/admin/class-wc-admin-duplicate-product.php';
    }
    $duplicator = new WC_Admin_Duplicate_Product();
    $elementaryProduct = $duplicator->product_duplicate($sourceProduct);
}

if (!$elementaryProduct instanceof WC_Product) {
    throw new RuntimeException('Could not create the elementary product.');
}

$satNachId = eco_required_category_id('ao-bong-ro-sat-nach');
$childrenId = eco_required_category_id('ao-bong-ro-tre-em');
$customId = eco_required_category_id('may-ao-bong-ro-thiet-ke-rieng-x24');
$setId = eco_required_category_id('bo-quan-ao-bong-ro');
$elementaryCategoryId = eco_required_category_id('ao-bong-ro-tieu-hoc-lop-4-5');
$highSchoolCategoryId = eco_required_category_id('ao-bong-ro-trung-hoc-lop-11-12');

$elementaryMediaId = eco_ensure_media(
    $elementaryImagePath,
    'eco-retreat-xanh-la-nhat-tieu-hoc-1764',
    'Bộ bóng rổ tiểu học ECO RETREAT xanh lá nhạt',
    'Học sinh tiểu học lớp 4–5 mặc bộ bóng rổ ECO RETREAT xanh lá nhạt đồng bộ áo quần'
);
$highSchoolMediaId = eco_ensure_media(
    $highSchoolImagePath,
    'eco-retreat-xanh-la-nhat-trung-hoc-1764',
    'Bộ bóng rổ trung học ECO RETREAT xanh lá nhạt',
    'Học sinh trung học lớp 11–12 mặc bộ bóng rổ ECO RETREAT xanh lá nhạt đồng bộ áo quần'
);

$oldSourceMediaId = (int) $sourceProduct->get_image_id();
$oldSlug = get_post_field('post_name', $sourceProductId);
$editionGroup = 'eco-retreat-xanh-la-nhat';

eco_set_product_copy($elementaryProduct, 'tieu-hoc');
$elementaryProduct->set_image_id($elementaryMediaId);
$elementaryProduct->set_gallery_image_ids([]);
$elementaryProduct->set_category_ids([
    $satNachId,
    $childrenId,
    $elementaryCategoryId,
    $customId,
    $setId,
]);
$elementaryProductId = $elementaryProduct->save();
wp_set_object_terms($elementaryProductId, [], 'product_tag');

eco_set_product_copy($sourceProduct, 'trung-hoc');
$sourceProduct->set_image_id($highSchoolMediaId);
$sourceProduct->set_gallery_image_ids([]);
$sourceProduct->set_category_ids([
    $satNachId,
    $childrenId,
    $highSchoolCategoryId,
    $customId,
    $setId,
]);
$highSchoolProductId = $sourceProduct->save();
wp_set_object_terms($highSchoolProductId, [], 'product_tag');

if ($oldSlug && $oldSlug !== get_post_field('post_name', $highSchoolProductId)) {
    add_post_meta($highSchoolProductId, '_wp_old_slug', $oldSlug, false);
}

update_post_meta($elementaryProductId, MAYAOBONGRO_EDITION_GROUP_META, $editionGroup);
update_post_meta($elementaryProductId, MAYAOBONGRO_SCHOOL_LEVEL_META, 'tieu-hoc');
update_post_meta($elementaryProductId, MAYAOBONGRO_LINKED_PRODUCT_META, $highSchoolProductId);
update_post_meta($highSchoolProductId, MAYAOBONGRO_EDITION_GROUP_META, $editionGroup);
update_post_meta($highSchoolProductId, MAYAOBONGRO_SCHOOL_LEVEL_META, 'trung-hoc');
update_post_meta($highSchoolProductId, MAYAOBONGRO_LINKED_PRODUCT_META, $elementaryProductId);

update_post_meta(
    $elementaryProductId,
    '_yoast_wpseo_metadesc',
    'Bộ bóng rổ tiểu học lớp 4–5 ECO RETREAT xanh lá nhạt, áo và quần phối đồng bộ cho học sinh.'
);
update_post_meta($elementaryProductId, '_yoast_wpseo_focuskw', 'bộ quần áo bóng rổ tiểu học');
update_post_meta(
    $highSchoolProductId,
    '_yoast_wpseo_metadesc',
    'Bộ bóng rổ trung học lớp 11–12 ECO RETREAT xanh lá nhạt, áo và quần phối đồng bộ cho học sinh.'
);
update_post_meta($highSchoolProductId, '_yoast_wpseo_focuskw', 'bộ quần áo bóng rổ trung học');

update_post_meta(
    $oldSourceMediaId,
    '_wp_attachment_image_alt',
    'Ảnh thiết kế gốc ECO RETREAT xanh lá nhạt trước khi chuyển sang bóng rổ'
);

clean_post_cache($elementaryProductId);
clean_post_cache($highSchoolProductId);
wc_delete_product_transients($elementaryProductId);
wc_delete_product_transients($highSchoolProductId);

$result = [
    'plugin_active' => is_plugin_active($plugin),
    'edition_group' => $editionGroup,
    'old_source_media_id' => $oldSourceMediaId,
    'old_slug' => $oldSlug,
    'elementary' => [
        'product_id' => $elementaryProductId,
        'url' => get_permalink($elementaryProductId),
        'media_id' => $elementaryMediaId,
        'category_ids' => wc_get_product($elementaryProductId)->get_category_ids(),
        'gallery_media_ids' => wc_get_product($elementaryProductId)->get_gallery_image_ids(),
        'linked_product_id' => (int) get_post_meta($elementaryProductId, MAYAOBONGRO_LINKED_PRODUCT_META, true),
    ],
    'high_school' => [
        'product_id' => $highSchoolProductId,
        'url' => get_permalink($highSchoolProductId),
        'media_id' => $highSchoolMediaId,
        'category_ids' => wc_get_product($highSchoolProductId)->get_category_ids(),
        'gallery_media_ids' => wc_get_product($highSchoolProductId)->get_gallery_image_ids(),
        'linked_product_id' => (int) get_post_meta($highSchoolProductId, MAYAOBONGRO_LINKED_PRODUCT_META, true),
    ],
    'categories' => [
        'elementary' => $elementaryCategoryId,
        'high_school' => $highSchoolCategoryId,
    ],
];

echo wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
