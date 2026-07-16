<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$productIds = [2121, 2763];
$technicalMediaId = 2120;

require rtrim($siteRoot, '/') . '/wp-load.php';

$updated = [];
foreach ($productIds as $productId) {
    $product = wc_get_product($productId);
    if (!$product instanceof WC_Product) {
        throw new RuntimeException("Product not found: {$productId}");
    }

    $description = str_replace(
        [
            'Áo sát nách form suông, dài hơn áo chạy bộ và che cạp quần.',
            'áo chạy bộ',
            'Áo chạy bộ',
        ],
        [
            'Áo sát nách form suông, thân dài che cạp quần.',
            'áo thể thao',
            'Áo thể thao',
        ],
        $product->get_description()
    );
    $shortDescription = str_replace(
        ['áo chạy bộ', 'Áo chạy bộ'],
        ['áo thể thao', 'Áo thể thao'],
        $product->get_short_description()
    );

    $product->set_description($description);
    $product->set_short_description($shortDescription);
    $product->save();

    wp_set_post_terms($productId, [], 'product_tag', false);
    clean_post_cache($productId);

    $updated[] = [
        'product_id' => $productId,
        'product_tags' => wp_get_post_terms($productId, 'product_tag', ['fields' => 'names']),
    ];
}

wp_update_post([
    'ID' => $technicalMediaId,
    'post_title' => 'Mẫu kỹ thuật X24 CB-059 trắng cam đỏ',
    'post_excerpt' => 'Mẫu kỹ thuật phối màu trắng, cam và đỏ của thiết kế X24 CB-059.',
]);
update_post_meta(
    $technicalMediaId,
    '_wp_attachment_image_alt',
    'Mẫu kỹ thuật thiết kế X24 CB-059 phối trắng cam đỏ'
);
clean_post_cache($technicalMediaId);

echo wp_json_encode([
    'updated_products' => $updated,
    'technical_media_id' => $technicalMediaId,
    'technical_media_alt' => get_post_meta(
        $technicalMediaId,
        '_wp_attachment_image_alt',
        true
    ),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
