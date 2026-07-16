<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
require rtrim($siteRoot, '/') . '/wp-load.php';

$colorRegex = '/(^|[\s\-_])(xanh|vàng|vang|gradient|đỏ|do|đen|den|trắng|trang|hồng|hong|tím|tim|cam|ombre)([\s\-_]|$)/iu';

$productIds = get_posts([
    'post_type' => 'product',
    'post_status' => 'publish',
    'fields' => 'ids',
    'posts_per_page' => -1,
]);

$colorTags = [];
$productIdsWithColorTags = [];
$terms = get_terms([
    'taxonomy' => 'product_tag',
    'hide_empty' => false,
]);
if (!is_wp_error($terms)) {
    foreach ($terms as $term) {
        if (!preg_match($colorRegex, $term->name . ' ' . $term->slug)) {
            continue;
        }
        $objectIds = get_objects_in_term((int) $term->term_id, 'product_tag');
        $publishedLinkedIds = array_values(array_intersect(array_map('intval', $objectIds), array_map('intval', $productIds)));
        foreach ($publishedLinkedIds as $productId) {
            $productIdsWithColorTags[$productId] = true;
        }
        $colorTags[] = [
            'name' => $term->name,
            'slug' => $term->slug,
            'count' => count($publishedLinkedIds),
        ];
    }
}

usort($colorTags, fn (array $a, array $b): int => $b['count'] <=> $a['count'] ?: strcmp($a['name'], $b['name']));

$attributeTerms = [];
$attributeProducts = [];
$paTerms = get_terms([
    'taxonomy' => 'pa_mau-sac',
    'hide_empty' => false,
]);
if (!is_wp_error($paTerms)) {
    foreach ($paTerms as $term) {
        $objectIds = get_objects_in_term((int) $term->term_id, 'pa_mau-sac');
        $publishedLinkedIds = array_values(array_intersect(array_map('intval', $objectIds), array_map('intval', $productIds)));
        foreach ($publishedLinkedIds as $productId) {
            $attributeProducts[$productId] = true;
        }
        $attributeTerms[] = [
            'name' => $term->name,
            'slug' => $term->slug,
            'count' => count($publishedLinkedIds),
        ];
    }
}

$sampleColorTaggedProducts = [];
foreach (array_slice(array_keys($productIdsWithColorTags), 0, 10) as $productId) {
    $sampleColorTaggedProducts[] = [
        'id' => (int) $productId,
        'title' => get_the_title((int) $productId),
        'tags' => array_map(
            fn (WP_Term $term): string => $term->name,
            array_values(array_filter(
                get_the_terms((int) $productId, 'product_tag') ?: [],
                fn (WP_Term $term): bool => preg_match($colorRegex, $term->name . ' ' . $term->slug) === 1
            ))
        ),
    ];
}

echo wp_json_encode([
    'published_product_count' => count($productIds),
    'refined_color_product_tags' => [
        'color_tag_terms' => count($colorTags),
        'products_with_color_tags' => count($productIdsWithColorTags),
        'top_terms' => array_slice($colorTags, 0, 30),
    ],
    'pa_mau_sac_attribute' => [
        'terms' => $attributeTerms,
        'products_with_pa_mau_sac' => count($attributeProducts),
    ],
    'sample_color_tagged_products' => $sampleColorTaggedProducts,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
