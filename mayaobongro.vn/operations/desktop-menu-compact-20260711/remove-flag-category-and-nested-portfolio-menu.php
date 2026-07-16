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

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-remove-flag-category-nested-portfolio-menu';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

function x24_menu_snapshot(int $menuId): array
{
    $items = wp_get_nav_menu_items($menuId, ['post_status' => 'any']);
    return array_map(static fn (WP_Post $item): array => [
        'ID' => (int) $item->ID,
        'title' => $item->title,
        'url' => $item->url,
        'type' => $item->type,
        'object' => $item->object,
        'object_id' => (int) $item->object_id,
        'menu_item_parent' => (int) $item->menu_item_parent,
        'status' => $item->post_status,
        'classes' => get_post_meta((int) $item->ID, '_menu_item_classes', true),
    ], $items ?: []);
}

function x24_find_menu_item_by_title(array $items, string $title, ?int $parentId = null): ?array
{
    foreach ($items as $item) {
        if (trim((string) $item['title']) !== $title) {
            continue;
        }
        if ($parentId !== null && (int) $item['menu_item_parent'] !== $parentId) {
            continue;
        }
        return $item;
    }
    return null;
}

$locations = get_nav_menu_locations();
$menuId = isset($locations['primary']) ? (int) $locations['primary'] : 0;
if (!$menuId) {
    fwrite(STDERR, "Primary menu location not found.\n");
    exit(1);
}

$menuObject = wp_get_nav_menu_object($menuId);
$flagTerm = get_term_by('slug', 'ao-bong-ro-co-do-sao-vang', 'product_cat');

file_put_contents(
    $backupDir . '/before.json',
    wp_json_encode([
        'primary_menu_id' => $menuId,
        'primary_menu_name' => $menuObject ? $menuObject->name : null,
        'menu_items' => x24_menu_snapshot($menuId),
        'flag_product_cat' => $flagTerm instanceof WP_Term ? [
            'term_id' => (int) $flagTerm->term_id,
            'name' => $flagTerm->name,
            'slug' => $flagTerm->slug,
            'count' => (int) $flagTerm->count,
            'description' => $flagTerm->description,
        ] : null,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

$items = x24_menu_snapshot($menuId);
$deletedMenuItems = [];

$flagMenuItem = null;
foreach ($items as $item) {
    $title = trim((string) $item['title']);
    $url = (string) $item['url'];
    if (
        $title === 'Áo cờ đỏ sao vàng'
        || str_contains($url, '/ao-bong-ro-co-do-sao-vang/')
        || ((string) $item['object'] === 'product_cat' && $flagTerm instanceof WP_Term && (int) $item['object_id'] === (int) $flagTerm->term_id)
    ) {
        $flagMenuItem = $item;
        break;
    }
}

if ($flagMenuItem) {
    wp_delete_post((int) $flagMenuItem['ID'], true);
    $deletedMenuItems[] = $flagMenuItem;
}

$items = x24_menu_snapshot($menuId);
$mauAoItem = x24_find_menu_item_by_title($items, 'Mẫu áo');
$nestedPortfolioItem = $mauAoItem ? x24_find_menu_item_by_title($items, 'Mẫu đã làm', (int) $mauAoItem['ID']) : null;
if ($nestedPortfolioItem) {
    wp_delete_post((int) $nestedPortfolioItem['ID'], true);
    $deletedMenuItems[] = $nestedPortfolioItem;
}

$deletedTerm = null;
$skippedTermDeleteReason = null;
if ($flagTerm instanceof WP_Term) {
    if ((int) $flagTerm->count === 0) {
        $deletedTerm = [
            'term_id' => (int) $flagTerm->term_id,
            'name' => $flagTerm->name,
            'slug' => $flagTerm->slug,
        ];
        $result = wp_delete_term((int) $flagTerm->term_id, 'product_cat');
        if (is_wp_error($result)) {
            fwrite(STDERR, $result->get_error_message() . "\n");
            exit(1);
        }
    } else {
        $skippedTermDeleteReason = 'Product category has products assigned.';
    }
}

flush_rewrite_rules(false);

$afterFlagTerm = get_term_by('slug', 'ao-bong-ro-co-do-sao-vang', 'product_cat');
$afterItems = x24_menu_snapshot($menuId);

file_put_contents(
    $backupDir . '/after.json',
    wp_json_encode([
        'primary_menu_id' => $menuId,
        'primary_menu_name' => $menuObject ? $menuObject->name : null,
        'deleted_menu_items' => $deletedMenuItems,
        'deleted_product_cat' => $deletedTerm,
        'skipped_term_delete_reason' => $skippedTermDeleteReason,
        'flag_product_cat_exists_after' => $afterFlagTerm instanceof WP_Term,
        'menu_items' => $afterItems,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

echo wp_json_encode([
    'status' => 'applied',
    'primary_menu_id' => $menuId,
    'deleted_menu_items' => array_map(static fn (array $item): array => [
        'ID' => (int) $item['ID'],
        'title' => $item['title'],
        'url' => $item['url'],
        'parent' => (int) $item['menu_item_parent'],
    ], $deletedMenuItems),
    'deleted_product_cat' => $deletedTerm,
    'skipped_term_delete_reason' => $skippedTermDeleteReason,
    'flag_product_cat_exists_after' => $afterFlagTerm instanceof WP_Term,
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
