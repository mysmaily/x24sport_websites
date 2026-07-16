<?php

declare(strict_types=1);

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
require rtrim($siteRoot, '/') . '/wp-load.php';

global $wpdb;

$needle = '%x24_product_summary%';
$rows = [
    'posts' => $wpdb->get_results(
        $wpdb->prepare(
            "SELECT ID, post_type, post_status, post_title, post_name, post_content
             FROM {$wpdb->posts}
             WHERE post_content LIKE %s",
            $needle
        ),
        ARRAY_A
    ),
    'postmeta' => $wpdb->get_results(
        $wpdb->prepare(
            "SELECT post_id, meta_key, meta_value
             FROM {$wpdb->postmeta}
             WHERE meta_value LIKE %s",
            $needle
        ),
        ARRAY_A
    ),
    'options' => $wpdb->get_results(
        $wpdb->prepare(
            "SELECT option_id, option_name, option_value
             FROM {$wpdb->options}
             WHERE option_value LIKE %s",
            $needle
        ),
        ARRAY_A
    ),
];

echo wp_json_encode(
    $rows,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
), PHP_EOL;
