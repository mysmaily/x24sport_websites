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

$newContent = <<<'CONTENT'
[section class="x24-product-hero-section"]

[row class="x24-product-hero-row"]

[col span="5" span__sm="12" class="x24-product-media-col"]

[ux_product_gallery]

[ux_text][mayaobongro_x24_product_colors][/ux_text]

[/col]
[col span="7" span__sm="12" align="left" class="x24-product-summary-col"]

[ux_product_breadcrumbs]

[ux_text][mayaobongro_x24_product_summary][/ux_text]
[ux_text][mayaobongro_school_edition_switcher][/ux_text]
[ux_text][mbro_product_top_sales_panel][/ux_text]

[/col]

[/row]

[row class="x24-product-size-row"]

[col span__sm="12"]

[ux_text][mayaobongro_x24_product_size_guide][/ux_text]

[/col]

[/row]

[/section]
[section]

[row]

[col span__sm="12"]

[ux_product_tabs]

[/col]

[/row]

[/section]

CONTENT;

$timestamp = gmdate('Ymd-His');
$backupRoot = rtrim($batchRoot, '/') . '/backups/' . $timestamp;

if (!$dryRun && !wp_mkdir_p($backupRoot)) {
    throw new RuntimeException('Unable to create backup directory: ' . $backupRoot);
}

$backup = [
    'captured_at' => gmdate('c'),
    'block' => $wpdb->get_row($wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $blockId), ARRAY_A),
    'postmeta' => $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->postmeta} WHERE post_id = %d ORDER BY meta_id", $blockId), ARRAY_A),
];

if (!$dryRun) {
    file_put_contents(
        $backupRoot . '/block-1647-before-two-column-product-top.json',
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
    'old_has_separate_sales_col' => str_contains((string) $block->post_content, 'mbro-product-sales-col'),
    'new_has_top_panel_in_summary' => str_contains($newContent, '[mbro_product_top_sales_panel]'),
    'new_columns' => [
        'media' => 'span 5',
        'summary' => 'span 7',
        'sales' => 'inside summary column',
    ],
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), PHP_EOL;
