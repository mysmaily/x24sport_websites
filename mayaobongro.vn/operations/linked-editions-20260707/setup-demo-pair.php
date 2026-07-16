<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$sourceProductId = isset($argv[2]) ? (int) $argv[2] : 2121;
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

function required_category_id(string $slug): int
{
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term || is_wp_error($term)) {
        throw new RuntimeException("Missing product category: {$slug}");
    }
    return (int) $term->term_id;
}

function ensure_demo_media(string $path, string $assetKey, string $title, string $alt): int
{
    $existing = get_posts([
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'posts_per_page' => 1,
        'fields' => 'ids',
        'meta_query' => [[
            'key' => '_mayaobongro_demo_asset_key',
            'value' => $assetKey,
        ]],
    ]);
    if ($existing) {
        return (int) $existing[0];
    }

    if (!is_file($path) || !is_readable($path)) {
        throw new RuntimeException("Demo image is missing or unreadable: {$path}");
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
    update_post_meta((int) $attachmentId, '_mayaobongro_demo_asset_key', $assetKey);

    return (int) $attachmentId;
}

function set_demo_product_copy(WC_Product $product, string $level): void
{
    $isElementary = $level === 'tieu-hoc';
    $levelLabel = $isElementary ? 'Tiểu Học Lớp 4–5' : 'Trung Học Lớp 11–12';
    $slugLevel = $isElementary ? 'tieu-hoc-lop-4-5' : 'trung-hoc-lop-11-12';
    $audience = $isElementary
        ? 'học sinh tiểu học lớp 4–5'
        : 'học sinh trung học lớp 11–12';

    $product->set_name("Bộ Quần Áo Bóng Rổ {$levelLabel} X24 CB-059 Trắng Cam Đỏ");
    $product->set_slug("bo-quan-ao-bong-ro-{$slugLevel}-x24-cb-059-trang-cam-do");
    $product->set_short_description(
        "Bộ quần áo bóng rổ dành cho {$audience}, phối trắng–cam–đỏ với họa tiết "
        . 'chấm chuyển màu đồng bộ trên áo và quần. Form áo suông dài, quần rộng '
        . 'ngang gối, phù hợp tập luyện và thi đấu tại trường.'
    );
    $product->set_description(
        "<h2>Bộ bóng rổ X24 CB-059 cho {$levelLabel}</h2>\n"
        . "<p>Mẫu sử dụng phối màu trắng, cam và đỏ nổi bật. Họa tiết chấm chuyển "
        . "màu được tiếp nối từ thân áo xuống quần để toàn bộ trang phục liền mạch, "
        . "thay vì ghép áo thiết kế với quần trơn không liên quan.</p>\n"
        . "<h3>Form bóng rổ học sinh</h3>\n"
        . "<ul><li>Áo sát nách form suông, thân dài che cạp quần.</li>"
        . "<li>Quần bóng rổ rộng, dài gần gối và thuận tiện vận động.</li>"
        . "<li>Cổ, nách và đường viền được phối theo cùng hệ màu của thiết kế.</li>"
        . "<li>Có thể thay logo, tên đội, tên cầu thủ và số áo theo yêu cầu.</li></ul>\n"
        . "<p>Hình ảnh người mẫu là minh họa cho phiên bản {$audience}. "
        . "Xem bộ chọn <strong>Chọn cấp học</strong> để chuyển sang phiên bản còn lại.</p>"
    );
    $product->set_status('publish');
    $product->set_catalog_visibility('visible');
}

$sourceProduct = wc_get_product($sourceProductId);
if (!$sourceProduct) {
    throw new RuntimeException("Source product not found: {$sourceProductId}");
}

$elementarySlug = 'bo-quan-ao-bong-ro-tieu-hoc-lop-4-5-x24-cb-059-trang-cam-do';
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

$satNachId = required_category_id('ao-bong-ro-sat-nach');
$childrenId = required_category_id('ao-bong-ro-tre-em');
$setId = required_category_id('bo-quan-ao-bong-ro');
$elementaryCategoryId = required_category_id('ao-bong-ro-tieu-hoc-lop-4-5');
$highSchoolCategoryId = required_category_id('ao-bong-ro-trung-hoc-lop-11-12');

$elementaryMediaId = ensure_demo_media(
    $elementaryImagePath,
    'x24-cb-059-tieu-hoc-v2',
    'Bộ bóng rổ tiểu học X24 CB-059 trắng cam đỏ',
    'Học sinh tiểu học lớp 4–5 mặc bộ bóng rổ X24 CB-059 trắng cam đỏ đồng bộ áo quần'
);
$highSchoolMediaId = ensure_demo_media(
    $highSchoolImagePath,
    'x24-cb-059-trung-hoc-v2',
    'Bộ bóng rổ trung học X24 CB-059 trắng cam đỏ',
    'Học sinh trung học lớp 11–12 mặc bộ bóng rổ X24 CB-059 trắng cam đỏ đồng bộ áo quần'
);

$oldTechnicalMediaId = (int) $sourceProduct->get_image_id();
$editionGroup = 'x24-cb-059';

set_demo_product_copy($elementaryProduct, 'tieu-hoc');
$elementaryProduct->set_image_id($elementaryMediaId);
$elementaryProduct->set_gallery_image_ids([$oldTechnicalMediaId]);
$elementaryProduct->set_category_ids([
    $satNachId,
    $childrenId,
    $setId,
    $elementaryCategoryId,
]);
$elementaryProductId = $elementaryProduct->save();

set_demo_product_copy($sourceProduct, 'trung-hoc');
$sourceProduct->set_image_id($highSchoolMediaId);
$sourceProduct->set_gallery_image_ids([$oldTechnicalMediaId]);
$sourceProduct->set_category_ids([
    $satNachId,
    $childrenId,
    $setId,
    $highSchoolCategoryId,
]);
$highSchoolProductId = $sourceProduct->save();

update_post_meta($elementaryProductId, MAYAOBONGRO_EDITION_GROUP_META, $editionGroup);
update_post_meta($elementaryProductId, MAYAOBONGRO_SCHOOL_LEVEL_META, 'tieu-hoc');
update_post_meta(
    $elementaryProductId,
    MAYAOBONGRO_LINKED_PRODUCT_META,
    $highSchoolProductId
);
update_post_meta($highSchoolProductId, MAYAOBONGRO_EDITION_GROUP_META, $editionGroup);
update_post_meta($highSchoolProductId, MAYAOBONGRO_SCHOOL_LEVEL_META, 'trung-hoc');
update_post_meta(
    $highSchoolProductId,
    MAYAOBONGRO_LINKED_PRODUCT_META,
    $elementaryProductId
);

update_post_meta(
    $elementaryProductId,
    '_yoast_wpseo_metadesc',
    'Bộ bóng rổ tiểu học lớp 4–5 X24 CB-059 trắng cam đỏ, áo và quần phối họa tiết đồng bộ.'
);
update_post_meta(
    $elementaryProductId,
    '_yoast_wpseo_focuskw',
    'bộ quần áo bóng rổ tiểu học'
);
update_post_meta(
    $highSchoolProductId,
    '_yoast_wpseo_metadesc',
    'Bộ bóng rổ trung học lớp 11–12 X24 CB-059 trắng cam đỏ, áo và quần phối họa tiết đồng bộ.'
);
update_post_meta(
    $highSchoolProductId,
    '_yoast_wpseo_focuskw',
    'bộ quần áo bóng rổ trung học'
);

clean_post_cache($elementaryProductId);
clean_post_cache($highSchoolProductId);

$result = [
    'plugin_active' => is_plugin_active($plugin),
    'edition_group' => $editionGroup,
    'elementary' => [
        'product_id' => $elementaryProductId,
        'url' => get_permalink($elementaryProductId),
        'media_id' => $elementaryMediaId,
        'category_ids' => wc_get_product($elementaryProductId)->get_category_ids(),
        'linked_product_id' => (int) get_post_meta(
            $elementaryProductId,
            MAYAOBONGRO_LINKED_PRODUCT_META,
            true
        ),
    ],
    'high_school' => [
        'product_id' => $highSchoolProductId,
        'url' => get_permalink($highSchoolProductId),
        'media_id' => $highSchoolMediaId,
        'category_ids' => wc_get_product($highSchoolProductId)->get_category_ids(),
        'linked_product_id' => (int) get_post_meta(
            $highSchoolProductId,
            MAYAOBONGRO_LINKED_PRODUCT_META,
            true
        ),
    ],
    'categories' => [
        'parent' => $childrenId,
        'elementary' => $elementaryCategoryId,
        'high_school' => $highSchoolCategoryId,
    ],
];

echo wp_json_encode(
    $result,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
), PHP_EOL;
