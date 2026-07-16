<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/desktop-menu-compact-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';

if (!wp_mkdir_p($batchRoot)) {
    fwrite(STDERR, "Unable to create batch directory: {$batchRoot}\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-portfolio-category-description';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$term = get_category_by_slug('mau-ao-bong-ro-da-lam');
if (!$term) {
    fwrite(STDERR, "Category not found: mau-ao-bong-ro-da-lam\n");
    exit(1);
}

$newDescription = 'Với hơn 5 năm kinh nghiệm tư vấn, thiết kế, may áo đấu thể thao, mayaobongro.vn đã hoàn thành đơn hàng cho hàng trăm khách hàng. Được sự cho phép của khách hàng dưới đây là một số thiết kế mà mayaobongro.vn đã thực hiện cho team, trường học và câu lạc bộ';

file_put_contents(
    $backupDir . '/before.json',
    wp_json_encode([
        'term_id' => (int) $term->term_id,
        'name' => $term->name,
        'slug' => $term->slug,
        'description' => $term->description,
        'url' => get_category_link((int) $term->term_id),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

$updated = wp_update_term((int) $term->term_id, 'category', [
    'description' => $newDescription,
]);

if (is_wp_error($updated)) {
    fwrite(STDERR, $updated->get_error_message() . "\n");
    exit(1);
}

clean_term_cache([(int) $term->term_id], 'category');
$term = get_term((int) $term->term_id, 'category');

file_put_contents(
    $backupDir . '/after.json',
    wp_json_encode([
        'term_id' => (int) $term->term_id,
        'name' => $term->name,
        'slug' => $term->slug,
        'description' => $term->description,
        'url' => get_category_link((int) $term->term_id),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

echo wp_json_encode([
    'status' => 'applied',
    'term_id' => (int) $term->term_id,
    'description' => $term->description,
    'url' => get_category_link((int) $term->term_id),
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
