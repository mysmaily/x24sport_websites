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
    throw new RuntimeException('Mayaobongro linked editions plugin is inactive.');
}

function team_ht_feedback_category_id(string $slug): int
{
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term || is_wp_error($term)) {
        throw new RuntimeException("Missing product category: {$slug}");
    }

    return (int) $term->term_id;
}

function team_ht_feedback_media(string $path, string $assetKey, string $title, string $alt, string $caption): int
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
        throw new RuntimeException("Branded image is missing or unreadable: {$path}");
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

$productCode = 'X24-BR-001';
$elementaryAlt = 'Ảnh mẫu áo bóng rổ tiểu học lớp 4-5 Team HT Pickleball đỏ xanh, form sát nách và quần bóng rổ đồng bộ';
$elementaryCaption = 'Ảnh tham khảo bản áo bóng rổ tiểu học lớp 4–5: cùng phối đỏ xanh, thân áo gọn và quần đồng bộ theo thiết kế Team HT.';
$highSchoolAlt = 'Ảnh mẫu áo bóng rổ học sinh cấp 3 Team HT Pickleball đỏ xanh, jersey sát nách dài và quần phối họa tiết núi';
$highSchoolCaption = 'Ảnh tham khảo bản học sinh cấp 3 / THPT: form áo dài hơn, quần rộng gần gối, giữ trọn phối màu và họa tiết núi.';

$elementaryMediaId = team_ht_feedback_media(
    $elementaryImagePath,
    'team-ht-pickleball-tieu-hoc-branded-contact-1754',
    "Bộ bóng rổ Team HT Pickleball {$productCode} - ảnh tiểu học",
    $elementaryAlt,
    $elementaryCaption
);
$highSchoolMediaId = team_ht_feedback_media(
    $highSchoolImagePath,
    'team-ht-pickleball-thpt-branded-contact-1754',
    "Bộ bóng rổ Team HT Pickleball {$productCode} - ảnh THPT",
    $highSchoolAlt,
    $highSchoolCaption
);

$elementaryUrl = wp_get_attachment_url($elementaryMediaId);
$highSchoolUrl = wp_get_attachment_url($highSchoolMediaId);
if (!$elementaryUrl || !$highSchoolUrl) {
    throw new RuntimeException('Unable to resolve branded attachment URLs.');
}

$categories = [
    team_ht_feedback_category_id('ao-bong-ro-sat-nach'),
    team_ht_feedback_category_id('ao-bong-ro-tre-em'),
    team_ht_feedback_category_id('ao-bong-ro-tieu-hoc-lop-4-5'),
    team_ht_feedback_category_id('ao-bong-ro-trung-hoc-lop-11-12'),
    team_ht_feedback_category_id('may-ao-bong-ro-thiet-ke-rieng-x24'),
    team_ht_feedback_category_id('bo-quan-ao-bong-ro'),
];

$title = "Bộ Quần Áo Bóng Rổ Team HT Pickleball Đỏ Xanh Núi Việt Nam {$productCode}";
$slug = 'bo-quan-ao-bong-ro-team-ht-pickleball-do-xanh-nui-viet-nam-x24-br-001';
$excerpt = "Bộ bóng rổ Team HT Pickleball {$productCode} phối đỏ – xanh ngọc, điểm quốc kỳ Việt Nam và họa tiết núi; áo sát nách form dài kết hợp quần bóng rổ đồng bộ, phù hợp đặt may theo đội.";

$description = <<<HTML
<h2>Bộ bóng rổ Team HT Pickleball đỏ xanh {$productCode}</h2>
<p>Mẫu Team HT Pickleball được chuyển từ tinh thần thể thao ngoài trời sang form bóng rổ rõ ràng hơn: áo sát nách vai rộng, cổ bo gọn, thân áo dài che cạp quần và quần bóng rổ rộng gần gối. Phối đỏ – xanh ngọc tạo cảm giác nổi bật trên sân, trong khi mảng núi và chi tiết quốc kỳ Việt Nam giữ lại nhận diện của thiết kế gốc.</p>

<h3>Thiết kế và cảm giác mặc</h3>
<p>Điểm mạnh của mẫu này là bộ áo và quần đi cùng một ngôn ngữ thị giác: mảng chuyển màu trên áo được nối xuống quần, các đường viền đỏ trắng giúp tổng thể khỏe và dễ nhận diện khi cả đội đứng cùng nhau. Chất vải thể thao hướng tới cảm giác nhẹ, thoáng, nhanh khô và dễ vận động trong giờ tập, giao hữu hoặc giải nội bộ.</p>

<h3>Đặt may theo đội</h3>
<p>Xưởng có thể tinh chỉnh tên đội, tên riêng, số áo, logo và danh sách size theo từng nhóm đặt may. Nếu đội muốn giữ nền đỏ xanh nhưng đổi vị trí logo hoặc thêm sponsor, nên gửi trước file/logo để kiểm tra độ rõ khi in lên chất liệu áo bóng rổ.</p>

<div class="mbro-age-reference-images">
  <figure>
    <img src="{$elementaryUrl}" alt="{$elementaryAlt}" loading="lazy" decoding="async">
    <figcaption>{$elementaryCaption}</figcaption>
  </figure>
  <figure>
    <img src="{$highSchoolUrl}" alt="{$highSchoolAlt}" loading="lazy" decoding="async">
    <figcaption>{$highSchoolCaption}</figcaption>
  </figure>
  <p>Với đội THCS hoặc lớp 9, xưởng dùng cùng mẫu thiết kế này và cân lại chiều dài áo, vòng ngực, quần theo danh sách size thực tế.</p>
</div>
HTML;

$keywords = [
    'bộ quần áo bóng rổ thiết kế riêng',
    'bộ quần áo bóng rổ học sinh',
    'áo bóng rổ tiểu học',
    'áo bóng rổ cho trẻ lớp 4-5',
    'áo bóng rổ học sinh THCS',
    'áo bóng rổ lớp 9',
    'áo bóng rổ học sinh cấp 3',
    'áo bóng rổ THPT',
    'đồng phục bóng rổ trường học',
    'áo bóng rổ đỏ xanh',
    'bộ bóng rổ Team HT Pickleball',
];

$oldSlug = get_post_field('post_name', $productId);

$product->set_name($title);
$product->set_slug($slug);
$product->set_sku($productCode);
$product->set_short_description($excerpt);
$product->set_description($description);
$product->set_image_id($highSchoolMediaId);
$product->set_gallery_image_ids([$elementaryMediaId]);
$product->set_category_ids($categories);
$product->set_status('publish');
$product->set_catalog_visibility('visible');
$productId = $product->save();

wp_set_object_terms($productId, $keywords, 'product_tag');
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

update_post_meta($productId, '_yoast_wpseo_focuskw', 'bộ quần áo bóng rổ thiết kế riêng');
update_post_meta(
    $productId,
    '_yoast_wpseo_metadesc',
    'Bộ bóng rổ Team HT Pickleball đỏ xanh, áo sát nách form dài, quần đồng bộ họa tiết núi, vải thể thao thoáng mát và nhận đặt may theo đội.'
);

clean_post_cache($productId);
wc_delete_product_transients($productId);

$freshProduct = wc_get_product($productId);
echo wp_json_encode([
    'product_id' => $productId,
    'url' => get_permalink($productId),
    'old_slug' => $oldSlug,
    'featured_media_id' => $highSchoolMediaId,
    'featured_url' => $highSchoolUrl,
    'gallery_media_ids' => $freshProduct instanceof WC_Product ? $freshProduct->get_gallery_image_ids() : [],
    'elementary_url' => $elementaryUrl,
    'category_ids' => $freshProduct instanceof WC_Product ? $freshProduct->get_category_ids() : [],
    'tags' => $keywords,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), PHP_EOL;
