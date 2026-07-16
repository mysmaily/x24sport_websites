<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/root/websites/sites/mayaobongro.vn';
$productId = isset($argv[2]) ? (int) $argv[2] : 1758;
$backupPath = $argv[3] ?? '';

require rtrim($siteRoot, '/') . '/wp-load.php';

global $wpdb;

function su60_backup_product(int $productId): array
{
    global $wpdb;

    return [
        'captured_at' => current_time('c'),
        'site_url' => site_url('/'),
        'product_id' => $productId,
        'records' => [
            'posts' => $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $productId),
                ARRAY_A
            ),
            'postmeta' => $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$wpdb->postmeta} WHERE post_id = %d ORDER BY meta_id", $productId),
                ARRAY_A
            ),
            'term_relationships' => $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$wpdb->term_relationships} WHERE object_id = %d", $productId),
                ARRAY_A
            ),
        ],
    ];
}

$product = wc_get_product($productId);
if (!$product instanceof WC_Product) {
    throw new RuntimeException("Product not found: {$productId}");
}

$backup = su60_backup_product($productId);
$backupJson = wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if (!is_string($backupJson)) {
    throw new RuntimeException('Could not encode backup JSON.');
}
if ($backupPath !== '') {
    if (file_put_contents($backupPath, $backupJson . PHP_EOL) === false) {
        throw new RuntimeException("Could not write backup: {$backupPath}");
    }
}

$oldSlug = get_post_field('post_name', $productId);
$newSlug = 'bo-quan-ao-bong-ro-saigon-u60-gradient-x24-br-004';
$newTitle = 'Bộ Quần Áo Bóng Rổ SAIGON U60 Gradient X24-BR-004';
$excerpt = 'Bộ quần áo bóng rổ SAIGON U60 Gradient X24-BR-004 phối hồng, vàng và xanh dương nổi bật, form bóng rổ suông cùng quần đồng bộ cho đội nhóm.';

$description = $product->get_description();
$description = str_replace(
    [
        'Bộ quần áo bóng rổ học sinh SAIGON U60 gradient',
        'form bóng rổ học sinh',
        'đội trường.',
    ],
    [
        'Bộ quần áo bóng rổ SAIGON U60 gradient',
        'form bóng rổ',
        'đội nhóm.',
    ],
    $description
);

$product->set_name($newTitle);
$product->set_slug($newSlug);
$product->set_short_description($excerpt);
$product->set_description($description);
$savedProductId = $product->save();

if ($oldSlug && $oldSlug !== $newSlug) {
    $existingOldSlugs = get_post_meta($savedProductId, '_wp_old_slug', false);
    if (!in_array($oldSlug, $existingOldSlugs, true)) {
        add_post_meta($savedProductId, '_wp_old_slug', $oldSlug, false);
    }
}

update_post_meta($savedProductId, '_yoast_wpseo_focuskw', 'bộ quần áo bóng rổ thiết kế riêng');
update_post_meta(
    $savedProductId,
    '_yoast_wpseo_metadesc',
    'Bộ quần áo bóng rổ SAIGON U60 Gradient X24-BR-004 phối hồng, vàng, xanh dương, form áo bóng rổ suông và quần đồng bộ thoáng khí.'
);

clean_post_cache($savedProductId);
wc_delete_product_transients($savedProductId);

$freshProduct = wc_get_product($savedProductId);
$result = [
    'product_id' => $savedProductId,
    'old_slug' => $oldSlug,
    'new_slug' => get_post_field('post_name', $savedProductId),
    'title' => get_the_title($savedProductId),
    'url' => get_permalink($savedProductId),
    'excerpt' => $freshProduct ? $freshProduct->get_short_description() : '',
    'backup_path' => $backupPath,
    'old_slugs' => get_post_meta($savedProductId, '_wp_old_slug', false),
    'yoast_focuskw' => get_post_meta($savedProductId, '_yoast_wpseo_focuskw', true),
    'yoast_metadesc' => get_post_meta($savedProductId, '_yoast_wpseo_metadesc', true),
];

echo wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
