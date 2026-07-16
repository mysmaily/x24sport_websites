<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$productId = isset($argv[2]) ? (int) $argv[2] : 2121;
$outputPath = $argv[3] ?? '';

require rtrim($siteRoot, '/') . '/wp-load.php';

global $wpdb;

$categorySlugs = [
    'ao-bong-ro-tre-em',
    'ao-bong-ro-tieu-hoc-lop-4-5',
    'ao-bong-ro-trung-hoc-lop-11-12',
];

$terms = [];
foreach ($categorySlugs as $slug) {
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term || is_wp_error($term)) {
        $terms[$slug] = null;
        continue;
    }

    $terms[$slug] = [
        'term' => $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$wpdb->terms} WHERE term_id = %d", $term->term_id),
            ARRAY_A
        ),
        'taxonomy' => $wpdb->get_row(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->term_taxonomy} WHERE term_taxonomy_id = %d",
                $term->term_taxonomy_id
            ),
            ARRAY_A
        ),
        'meta' => $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$wpdb->termmeta} WHERE term_id = %d", $term->term_id),
            ARRAY_A
        ),
    ];
}

$backup = [
    'captured_at' => current_time('c'),
    'site_url' => site_url('/'),
    'table_prefix' => $wpdb->prefix,
    'product_id' => $productId,
    'records' => [
        'posts' => $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $productId),
            ARRAY_A
        ),
        'postmeta' => $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->postmeta} WHERE post_id = %d ORDER BY meta_id",
                $productId
            ),
            ARRAY_A
        ),
        'term_relationships' => $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->term_relationships} WHERE object_id = %d",
                $productId
            ),
            ARRAY_A
        ),
        'active_plugins_option' => $wpdb->get_results(
            $wpdb->prepare(
                "SELECT * FROM {$wpdb->options} WHERE option_name = %s",
                'active_plugins'
            ),
            ARRAY_A
        ),
        'affected_terms' => $terms,
    ],
];

$json = wp_json_encode(
    $backup,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
);

if (!is_string($json)) {
    fwrite(STDERR, "Could not encode backup.\n");
    exit(2);
}

if ($outputPath !== '') {
    if (file_put_contents($outputPath, $json . PHP_EOL) === false) {
        fwrite(STDERR, "Could not write backup: {$outputPath}\n");
        exit(3);
    }
    echo $outputPath, PHP_EOL;
    exit;
}

echo $json, PHP_EOL;
