<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/home-inline-order-form-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';

global $wpdb;

if (!wp_mkdir_p($batchRoot)) {
    fwrite(STDERR, "Unable to create batch directory: {$batchRoot}\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His');
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$pageId = (int) get_option('page_on_front');
$page = $pageId > 0 ? get_post($pageId) : null;
if (!$page instanceof WP_Post) {
    fwrite(STDERR, "Front page not found.\n");
    exit(1);
}

$beforeContent = (string) $page->post_content;
file_put_contents(
    $backupDir . '/front-page-before.json',
    wp_json_encode([
        'captured_at' => current_time('c'),
        'page_id' => $pageId,
        'permalink' => get_permalink($pageId),
        'post' => $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $pageId),
            ARRAY_A
        ),
        'meta' => $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$wpdb->postmeta} WHERE post_id = %d ORDER BY meta_id", $pageId),
            ARRAY_A
        ),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL
);

$shortcode = "\n[x24_home_order_form]\n";
if (str_contains($beforeContent, '[x24_home_order_form]')) {
    $afterContent = $beforeContent;
    $status = 'already_present';
} else {
    $needle = "\n[/section]\n";
    $position = strpos($beforeContent, $needle);
    if ($position === false) {
        fwrite(STDERR, "Could not find first hero section closing tag.\n");
        exit(1);
    }

    $insertAt = $position + strlen($needle);
    $afterContent = substr($beforeContent, 0, $insertAt) . $shortcode . substr($beforeContent, $insertAt);
    $status = 'inserted';
}

$result = wp_update_post([
    'ID' => $pageId,
    'post_content' => $afterContent,
], true);

if (is_wp_error($result)) {
    fwrite(STDERR, $result->get_error_message() . "\n");
    exit(1);
}

clean_post_cache($pageId);
flush_rewrite_rules(false);

if (class_exists('autoptimizeCache')) {
    autoptimizeCache::clearall();
}

$out = [
    'status' => $status,
    'page_id' => $pageId,
    'permalink' => get_permalink($pageId),
    'backup_dir' => $backupDir,
    'shortcode_count' => substr_count($afterContent, '[x24_home_order_form]'),
];

file_put_contents(
    $backupDir . '/front-page-after.json',
    wp_json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL
);

echo wp_json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
