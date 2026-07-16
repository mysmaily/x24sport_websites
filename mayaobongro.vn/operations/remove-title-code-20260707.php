<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? '/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/update-age-labels-20260707';
$backupDir = rtrim($batchRoot, '/') . '/title-backups';

require rtrim($siteRoot, '/') . '/wp-load.php';

global $wpdb;

if (!is_dir($backupDir) && !mkdir($backupDir, 0755, true)) {
    throw new RuntimeException("Could not create title backup dir: {$backupDir}");
}

$results = [];
for ($i = 34; $i <= 105; $i++) {
    $sku = sprintf('X24-BR-%03d', $i);
    $productId = wc_get_product_id_by_sku($sku);
    if (!$productId) {
        $results[] = ['sku' => $sku, 'status' => 'missing'];
        continue;
    }

    $before = get_post_field('post_title', $productId);
    $after = trim((string) preg_replace('/\s+' . preg_quote($sku, '/') . '$/u', '', $before));
    $backup = [
        'captured_at' => current_time('c'),
        'product_id' => $productId,
        'sku' => $sku,
        'before_title' => $before,
        'after_title' => $after,
        'post' => $wpdb->get_row($wpdb->prepare(
            "SELECT ID, post_title, post_name, post_modified FROM {$wpdb->posts} WHERE ID = %d",
            $productId
        ), ARRAY_A),
    ];
    $backupPath = $backupDir . '/product-' . $productId . '-before-title-code-removal.json';
    if (is_file($backupPath)) {
        $backupPath = $backupDir . '/product-' . $productId . '-before-title-code-removal-rerun-' . gmdate('YmdHis') . '.json';
    }
    file_put_contents(
        $backupPath,
        wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL
    );

    if ($after !== $before && $after !== '') {
        wp_update_post(['ID' => $productId, 'post_title' => $after]);
        clean_post_cache($productId);
        wc_delete_product_transients($productId);
        $status = 'updated';
    } else {
        $status = 'unchanged';
    }

    $results[] = [
        'sku' => $sku,
        'product_id' => $productId,
        'status' => $status,
        'before' => $before,
        'after' => get_post_field('post_title', $productId),
        'backup_path' => $backupPath,
    ];
}

$out = [
    'count' => count($results),
    'updated' => count(array_filter($results, static fn (array $row): bool => ($row['status'] ?? '') === 'updated')),
    'results' => $results,
];
file_put_contents(
    rtrim($batchRoot, '/') . '/title-code-removal-result.json',
    wp_json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL
);

echo wp_json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
