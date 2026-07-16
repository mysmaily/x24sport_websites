<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$productId = isset($argv[2]) ? (int) $argv[2] : 2121;

require rtrim($siteRoot, '/') . '/wp-load.php';

$product = wc_get_product($productId);
if (!$product) {
    fwrite(STDERR, "Product not found: {$productId}\n");
    exit(2);
}

$categories = get_terms([
    'taxonomy' => 'product_cat',
    'hide_empty' => false,
]);

$activePlugins = (array) get_option('active_plugins', []);

$output = [
    'captured_at' => current_time('c'),
    'site_url' => site_url('/'),
    'theme' => wp_get_theme()->get('Name'),
    'woocommerce_version' => defined('WC_VERSION') ? WC_VERSION : null,
    'active_plugins' => $activePlugins,
    'product' => [
        'id' => $product->get_id(),
        'type' => $product->get_type(),
        'status' => $product->get_status(),
        'name' => $product->get_name(),
        'slug' => $product->get_slug(),
        'permalink' => $product->get_permalink(),
        'sku' => $product->get_sku(),
        'regular_price' => $product->get_regular_price(),
        'sale_price' => $product->get_sale_price(),
        'price' => $product->get_price(),
        'featured_media_id' => $product->get_image_id(),
        'gallery_media_ids' => $product->get_gallery_image_ids(),
        'category_ids' => $product->get_category_ids(),
        'attributes' => $product->get_attributes(),
        'short_description' => $product->get_short_description(),
        'description' => $product->get_description(),
        'meta_data' => array_map(
            static fn(WC_Meta_Data $item): array => $item->get_data(),
            $product->get_meta_data()
        ),
    ],
    'categories' => array_map(
        static fn(WP_Term $term): array => [
            'id' => (int) $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug,
            'parent' => (int) $term->parent,
            'count' => (int) $term->count,
        ],
        is_wp_error($categories) ? [] : $categories
    ),
];

echo wp_json_encode(
    $output,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
), PHP_EOL;
