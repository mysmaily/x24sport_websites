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
$product = wc_get_product($productId);
$plugin = 'mayaobongro-linked-editions/mayaobongro-linked-editions.php';

if (!is_plugin_active($plugin)) {
    $errors[] = 'Plugin is inactive.';
}
if (!$product instanceof WC_Product) {
    $errors[] = 'Product is missing.';
}

$data = [];
if ($product instanceof WC_Product) {
    $name = $product->get_name();
    $excerpt = $product->get_short_description();
    $description = $product->get_description();
    $copy = mb_strtolower($name . ' ' . $excerpt . ' ' . $description, 'UTF-8');
    $featuredId = (int) $product->get_image_id();
    $galleryIds = array_map('intval', $product->get_gallery_image_ids());
    $elementaryId = (int) get_post_meta($productId, MAYAOBONGRO_AGE_IMAGE_TIEU_HOC_META, true);
    $highSchoolId = (int) get_post_meta($productId, MAYAOBONGRO_AGE_IMAGE_THPT_META, true);
    $keywords = mb_strtolower((string) get_post_meta($productId, MAYAOBONGRO_AGE_KEYWORDS_META, true), 'UTF-8');
    $model = (string) get_post_meta($productId, MAYAOBONGRO_AGE_GALLERY_MODEL_META, true);
    $tagNames = wp_get_object_terms($productId, 'product_tag', ['fields' => 'names']);
    $tagText = is_wp_error($tagNames) ? '' : mb_strtolower(implode(', ', $tagNames), 'UTF-8');

    if ($product->get_status() !== 'publish') {
        $errors[] = 'Product is not published.';
    }
    if ($product->get_sku() !== 'X24-BR-001') {
        $errors[] = 'Product SKU is not X24-BR-001.';
    }
    if (!str_contains($name, 'X24-BR-001')) {
        $errors[] = 'Product title is missing X24-BR-001.';
    }
    if ($model !== 'single-product') {
        $errors[] = 'Age gallery model is not single-product.';
    }
    if ($featuredId !== $highSchoolId || $featuredId < 1) {
        $errors[] = 'Featured image is not the branded high-school image.';
    }
    if ($elementaryId < 1 || !in_array($elementaryId, $galleryIds, true)) {
        $errors[] = 'Branded elementary image is missing from gallery.';
    }
    foreach ([$elementaryId, $highSchoolId] as $attachmentId) {
        $url = wp_get_attachment_url($attachmentId);
        $alt = (string) get_post_meta($attachmentId, '_wp_attachment_image_alt', true);
        $assetKey = (string) get_post_meta($attachmentId, '_mayaobongro_generated_asset_key', true);
        if (!$url || !str_contains($url, '-branded-contact.webp')) {
            $errors[] = "Attachment {$attachmentId} is not a branded contact WebP URL.";
        }
        if ($alt === '' || !str_contains(mb_strtolower($alt, 'UTF-8'), 'bóng rổ')) {
            $errors[] = "Attachment {$attachmentId} is missing basketball alt text.";
        }
        if (!str_contains($assetKey, '-branded-contact-1754')) {
            $errors[] = "Attachment {$attachmentId} is missing branded asset key.";
        }
    }
    foreach (['chạy bộ', 'runner', 'running', 'marathon', 'mayaochaybo.vn'] as $forbidden) {
        if (str_contains($copy, $forbidden)) {
            $errors[] = "Product copy contains forbidden term: {$forbidden}.";
        }
    }
    foreach (['<figure', '<img ', '<figcaption'] as $htmlNeedle) {
        if (!str_contains($description, $htmlNeedle)) {
            $errors[] = "Product content is missing {$htmlNeedle}.";
        }
    }
    foreach (['team-ht-pickleball-thpt-branded-contact.webp', 'team-ht-pickleball-tieu-hoc-branded-contact.webp'] as $imageNeedle) {
        if (!str_contains($description, $imageNeedle)) {
            $errors[] = "Product content is missing {$imageNeedle}.";
        }
    }
    foreach (['áo bóng rổ tiểu học', 'áo bóng rổ lớp 9', 'áo bóng rổ học sinh cấp 3'] as $requiredKeyword) {
        if (!str_contains($keywords . ' ' . $tagText . ' ' . $copy, $requiredKeyword)) {
            $errors[] = "Missing age-search coverage: {$requiredKeyword}.";
        }
    }
    if (mb_substr_count($copy, 'tiểu học', 'UTF-8') > 3 || mb_substr_count($copy, 'thpt', 'UTF-8') > 3) {
        $errors[] = 'Body copy appears to repeat age terms too often.';
    }

    $data = [
        'id' => $productId,
        'name' => $name,
        'url' => get_permalink($productId),
        'status' => $product->get_status(),
        'sku' => $product->get_sku(),
        'model' => $model,
        'featured_media_id' => $featuredId,
        'featured_url' => wp_get_attachment_url($featuredId),
        'gallery_media_ids' => $galleryIds,
        'age_image_tieu_hoc_id' => $elementaryId,
        'age_image_thpt_id' => $highSchoolId,
        'tag_count' => is_wp_error($tagNames) ? 0 : count($tagNames),
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
