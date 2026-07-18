<?php

declare(strict_types=1);

$outputPath = $argv[1] ?? '';
if ($outputPath === '') {
    fwrite(STDERR, "Usage: php export-product-prices.php <output.json>\n");
    exit(1);
}

require '/var/www/mayaobongro.vn/wp-load.php';

$ids = get_posts([
    'post_type' => 'product',
    'post_status' => 'publish',
    'posts_per_page' => -1,
    'fields' => 'ids',
    'orderby' => 'ID',
    'order' => 'ASC',
]);

$products = [];
foreach ($ids as $id) {
    $product = wc_get_product($id);
    if (!$product instanceof WC_Product) {
        throw new RuntimeException("Cannot load WooCommerce product {$id}");
    }
    if (!$product->is_type('simple')) {
        throw new RuntimeException("Unexpected product type {$product->get_type()} for source ID {$id}");
    }
    $current = $product->get_price();
    $regular = $product->get_regular_price();
    if ($current === '' || !is_numeric($current)) {
        throw new RuntimeException("Missing current price for source ID {$id}");
    }
    $price = (float) $current;
    $regularPrice = $regular !== '' && is_numeric($regular) ? (float) $regular : null;
    $products[] = [
        'sourceId' => (string) $id,
        'slug' => $product->get_slug(),
        'sku' => $product->get_sku(),
        'productType' => $product->get_type(),
        'price' => $price,
        'compareAtPrice' => $regularPrice !== null && $regularPrice > $price ? $regularPrice : null,
    ];
}

$payload = [
    'schemaVersion' => 1,
    'source' => 'wordpress',
    'tenantSlug' => 'mayaobongro',
    'exportedAt' => gmdate(DATE_ATOM),
    'products' => $products,
];
$encoded = json_encode($payload, JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
if (file_put_contents($outputPath, $encoded . "\n", LOCK_EX) === false) {
    throw new RuntimeException("Cannot write {$outputPath}");
}

echo json_encode([
    'output' => $outputPath,
    'products' => count($products),
    'priced' => count(array_filter($products, static fn(array $product): bool => $product['price'] > 0)),
], JSON_UNESCAPED_UNICODE | JSON_THROW_ON_ERROR) . "\n";
