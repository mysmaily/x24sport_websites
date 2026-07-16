<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$idsPath = $argv[2] ?? '/tmp/mayaobongro-shop-ids.txt';

require rtrim($siteRoot, '/') . '/wp-load.php';

$ids = array_map('intval', file($idsPath, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: []);
$out = [];
foreach ($ids as $idx => $id) {
    $product = wc_get_product($id);
    if (!$product instanceof WC_Product) {
        continue;
    }

    $cats = wp_get_post_terms($id, 'product_cat', ['fields' => 'slugs']);
    $title = (string) get_post_field('post_title', $id);
    $slug = (string) get_post_field('post_name', $id);
    $sku = (string) $product->get_sku();
    $isBasketball = false;

    if (mb_stripos($title, 'bóng rổ') !== false || str_contains($slug, 'bong-ro') || preg_match('/^X24-BR-\d+$/', $sku)) {
        $isBasketball = true;
    }
    foreach ($cats as $cat) {
        if (str_contains((string) $cat, 'bong-ro')) {
            $isBasketball = true;
            break;
        }
    }

    $imageId = (int) $product->get_image_id();
    $out[] = [
        'order' => $idx + 1,
        'id' => $id,
        'title' => $title,
        'slug' => $slug,
        'sku' => $sku,
        'is_basketball' => $isBasketball,
        'image_id' => $imageId,
        'image_url' => $imageId ? wp_get_attachment_url($imageId) : '',
        'cats' => $cats,
        'regular_price' => $product->get_regular_price(),
        'sale_price' => $product->get_sale_price(),
        'price' => $product->get_price(),
    ];
}

echo wp_json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
