<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
require rtrim($siteRoot, '/') . '/wp-load.php';

$products = wc_get_products([
    'status' => ['publish', 'draft', 'private'],
    'limit' => -1,
    'orderby' => 'ID',
    'order' => 'ASC',
    'category' => ['bo-quan-ao-bong-ro'],
    'return' => 'objects',
]);

$checked = 0;
$withShortcode = 0;
$withMeta = 0;
$missing = [];
$runningLeaks = [];
$samples = [];

foreach ($products as $product) {
    $id = $product->get_id();
    if (has_term('logo-doi-bong-ro', 'product_cat', $id)) {
        continue;
    }

    $checked++;
    $content = (string) get_post_field('post_content', $id);
    $excerpt = (string) get_post_field('post_excerpt', $id);
    if (str_contains($content, '[mbro_product_sales_boxes]')) {
        $withShortcode++;
    } else {
        $missing[] = ['id' => $id, 'sku' => $product->get_sku(), 'issue' => 'missing_shortcode'];
    }

    if ((string) get_post_meta($id, '_mayaobongro_content_refresh_20260711', true) !== '') {
        $withMeta++;
    }

    $haystack = mb_strtolower(wp_strip_all_tags($content . ' ' . $excerpt . ' ' . $product->get_name()), 'UTF-8');
    if (str_contains($haystack, 'chạy bộ') || str_contains($haystack, 'running') || str_contains($haystack, 'marathon')) {
        $runningLeaks[] = ['id' => $id, 'sku' => $product->get_sku(), 'title' => $product->get_name()];
    }

    if (count($samples) < 8) {
        $samples[] = [
            'id' => $id,
            'sku' => $product->get_sku(),
            'title' => $product->get_name(),
            'content_chars' => mb_strlen(wp_strip_all_tags(do_shortcode($content))),
            'excerpt_chars' => mb_strlen(wp_strip_all_tags($excerpt)),
            'url' => get_permalink($id),
        ];
    }
}

$componentPath = WP_CONTENT_DIR . '/mu-plugins/mayaobongro-product-sales-components.php';
$renderedShortcode = do_shortcode('[mbro_product_sales_boxes]');

echo wp_json_encode([
    'checked_products' => $checked,
    'with_component_shortcode' => $withShortcode,
    'with_refresh_meta' => $withMeta,
    'missing_count' => count($missing),
    'running_leak_count' => count($runningLeaks),
    'component_file_exists' => is_file($componentPath),
    'shortcode_registered' => shortcode_exists('mbro_product_sales_boxes'),
    'shortcode_render_chars' => mb_strlen(wp_strip_all_tags($renderedShortcode)),
    'missing_sample' => array_slice($missing, 0, 10),
    'running_leak_sample' => array_slice($runningLeaks, 0, 10),
    'sample' => $samples,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
