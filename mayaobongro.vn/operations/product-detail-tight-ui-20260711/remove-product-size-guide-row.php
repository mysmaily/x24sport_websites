<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? '/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/product-tight-ui-20260711';
$mode = $argv[3] ?? 'apply';
$dryRun = $mode === 'dry-run';

require rtrim($siteRoot, '/') . '/wp-load.php';

global $wpdb;

$blockId = 1647;
$block = get_post($blockId);
if (!$block instanceof WP_Post || $block->post_type !== 'blocks') {
    throw new RuntimeException('Product layout block not found: ' . $blockId);
}

$oldContent = (string) $block->post_content;
$pattern = '/\n\[row class="x24-product-size-row"\]\s*\[col span__sm="12"\]\s*\[ux_text\]\[mayaobongro_x24_product_size_guide\]\[\/ux_text\]\s*\[\/col\]\s*\[\/row\]\n/s';
$newContent = preg_replace($pattern, "\n", $oldContent, 1, $count);
if (!is_string($newContent)) {
    throw new RuntimeException('Unable to process block content');
}

$timestamp = gmdate('Ymd-His');
$backupRoot = rtrim($batchRoot, '/') . '/backups/' . $timestamp;

if (!$dryRun && !wp_mkdir_p($backupRoot)) {
    throw new RuntimeException('Unable to create backup directory: ' . $backupRoot);
}

if (!$dryRun && $newContent !== $oldContent) {
    $backup = [
        'captured_at' => gmdate('c'),
        'block' => $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $blockId), ARRAY_A),
        'postmeta' => $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->postmeta} WHERE post_id = %d ORDER BY meta_id", $blockId), ARRAY_A),
    ];
    file_put_contents(
        $backupRoot . '/block-1647-before-size-guide-removal.json',
        wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL
    );

    $updated = wp_update_post([
        'ID' => $blockId,
        'post_content' => $newContent,
    ], true);
    if (is_wp_error($updated)) {
        throw new RuntimeException($updated->get_error_message());
    }

    clean_post_cache($blockId);
}

echo wp_json_encode([
    'mode' => $dryRun ? 'dry-run' : 'apply',
    'backup_root' => $dryRun ? null : $backupRoot,
    'block_id' => $blockId,
    'old_has_size_guide' => str_contains($oldContent, 'mayaobongro_x24_product_size_guide'),
    'new_has_size_guide' => str_contains($newContent, 'mayaobongro_x24_product_size_guide'),
    'removed_count' => $count,
    'changed' => $newContent !== $oldContent,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), PHP_EOL;
