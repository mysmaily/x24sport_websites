<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$productId = isset($argv[2]) ? (int) $argv[2] : 1754;

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';

$errors = [];
$plugin = 'mayaobongro-linked-editions/mayaobongro-linked-editions.php';
$product = wc_get_product($productId);

if (!is_plugin_active($plugin)) {
    $errors[] = 'Plugin is inactive.';
}
if (!$product instanceof WC_Product) {
    $errors[] = 'Product is missing.';
}

$requiredCategories = [
    'ao-bong-ro-sat-nach',
    'ao-bong-ro-tre-em',
    'ao-bong-ro-tieu-hoc-lop-4-5',
    'ao-bong-ro-trung-hoc-lop-11-12',
    'may-ao-bong-ro-thiet-ke-rieng-x24',
    'bo-quan-ao-bong-ro',
];
$termIds = [];
foreach ($requiredCategories as $slug) {
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term || is_wp_error($term)) {
        $errors[] = "Missing category {$slug}.";
        continue;
    }
    $termIds[$slug] = (int) $term->term_id;
}

$data = [];
if ($product instanceof WC_Product) {
    $copy = mb_strtolower($product->get_name() . ' ' . $product->get_short_description() . ' ' . $product->get_description(), 'UTF-8');
    $categories = array_map('intval', $product->get_category_ids());
    $featuredId = (int) $product->get_image_id();
    $galleryIds = array_map('intval', $product->get_gallery_image_ids());
    $elementaryId = (int) get_post_meta($productId, MAYAOBONGRO_AGE_IMAGE_TIEU_HOC_META, true);
    $highSchoolId = (int) get_post_meta($productId, MAYAOBONGRO_AGE_IMAGE_THPT_META, true);
    $keywords = (string) get_post_meta($productId, MAYAOBONGRO_AGE_KEYWORDS_META, true);
    $model = (string) get_post_meta($productId, MAYAOBONGRO_AGE_GALLERY_MODEL_META, true);

    if ($product->get_status() !== 'publish') {
        $errors[] = 'Product is not published.';
    }
    if ($model !== 'single-product') {
        $errors[] = 'Age gallery model is not single-product.';
    }
    if ($elementaryId < 1 || $highSchoolId < 1) {
        $errors[] = 'Age image metadata is incomplete.';
    }
    if ($featuredId !== $highSchoolId) {
        $errors[] = 'Featured image is not the high-school image.';
    }
    if (!in_array($elementaryId, $galleryIds, true)) {
        $errors[] = 'Elementary image is not in the product gallery.';
    }
    foreach ($termIds as $slug => $termId) {
        if (!in_array($termId, $categories, true)) {
            $errors[] = "Product is missing category {$slug}.";
        }
    }
    foreach (['chạy bộ', 'runner', 'running', 'marathon', 'mayaochaybo.vn'] as $forbidden) {
        if (str_contains($copy, $forbidden)) {
            $errors[] = "Product copy contains forbidden term: {$forbidden}.";
        }
    }
    foreach (['áo bóng rổ tiểu học', 'áo bóng rổ lớp 9', 'áo bóng rổ học sinh cấp 3'] as $requiredKeyword) {
        if (!str_contains($copy . ' ' . mb_strtolower($keywords, 'UTF-8'), $requiredKeyword)) {
            $errors[] = "Missing age-search keyword: {$requiredKeyword}.";
        }
    }

    $data = [
        'id' => $productId,
        'name' => $product->get_name(),
        'url' => get_permalink($productId),
        'status' => $product->get_status(),
        'model' => $model,
        'featured_media_id' => $featuredId,
        'featured_url' => wp_get_attachment_url($featuredId),
        'gallery_media_ids' => $galleryIds,
        'age_image_tieu_hoc_id' => $elementaryId,
        'age_image_thpt_id' => $highSchoolId,
        'category_ids' => $categories,
        'keywords' => $keywords,
    ];
}

$result = [
    'verified_at' => current_time('c'),
    'ok' => !$errors,
    'errors' => $errors,
    'plugin_active' => is_plugin_active($plugin),
    'product' => $data,
];

echo wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), PHP_EOL;
exit($errors ? 2 : 0);
