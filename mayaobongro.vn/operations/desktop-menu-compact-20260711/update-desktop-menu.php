<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$mode = $argv[2] ?? 'audit';
$batchRoot = $argv[3] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/desktop-menu-compact-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';

function compact_menu_item_payload(WP_Post $item): array
{
    return [
        'id' => (int) $item->ID,
        'title' => $item->title,
        'url' => $item->url,
        'type' => $item->type,
        'object' => $item->object,
        'object_id' => (int) $item->object_id,
        'parent' => (int) $item->menu_item_parent,
        'order' => (int) $item->menu_order,
        'classes' => array_values(array_filter((array) $item->classes)),
        'status' => $item->post_status,
    ];
}

function compact_menu_state(): array
{
    $menus = [];
    foreach (wp_get_nav_menus() as $menu) {
        $items = wp_get_nav_menu_items($menu->term_id, ['post_status' => 'any']) ?: [];
        $menus[] = [
            'id' => (int) $menu->term_id,
            'name' => $menu->name,
            'slug' => $menu->slug,
            'items' => array_map('compact_menu_item_payload', $items),
        ];
    }

    return [
        'captured_at' => current_time('c'),
        'home_url' => home_url('/'),
        'theme' => wp_get_theme()->get_stylesheet(),
        'locations' => get_nav_menu_locations(),
        'theme_mod_locations' => get_theme_mod('nav_menu_locations', []),
        'menus' => $menus,
    ];
}

function compact_output_json(array $value): void
{
    echo wp_json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
}

function compact_require_page(string $slug): int
{
    $page = get_page_by_path($slug, OBJECT, 'page');
    if (!$page instanceof WP_Post) {
        throw new RuntimeException("Required page not found: {$slug}");
    }
    return (int) $page->ID;
}

function compact_add_menu_item(int $menuId, array $args): int
{
    $result = wp_update_nav_menu_item($menuId, 0, array_merge([
        'menu-item-status' => 'publish',
    ], $args));

    if (is_wp_error($result)) {
        throw new RuntimeException($result->get_error_message());
    }

    return (int) $result;
}

if ($mode === 'audit') {
    compact_output_json(compact_menu_state());
    exit;
}

if ($mode !== 'apply') {
    fwrite(STDERR, "Unknown mode: {$mode}\n");
    exit(2);
}

if (!wp_mkdir_p($batchRoot)) {
    fwrite(STDERR, "Unable to create batch directory: {$batchRoot}\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His');
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

file_put_contents(
    $backupDir . '/menu-before.json',
    wp_json_encode(compact_menu_state(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

$menuName = 'Menu chính gọn 2026';
$menu = wp_get_nav_menu_object($menuName);
if ($menu) {
    $menuId = (int) $menu->term_id;
    $oldItemIds = get_objects_in_term($menuId, 'nav_menu');
    if (is_wp_error($oldItemIds)) {
        throw new RuntimeException($oldItemIds->get_error_message());
    }
    foreach ($oldItemIds as $oldItemId) {
        wp_delete_post((int) $oldItemId, true);
    }
} else {
    $created = wp_create_nav_menu($menuName);
    if (is_wp_error($created)) {
        throw new RuntimeException($created->get_error_message());
    }
    $menuId = (int) $created;
}

$samplesPageId = compact_require_page('mau-ao-bong-ro');
$pricingPageId = compact_require_page('bang-gia-may-ao-bong-ro');
$materialsPageId = compact_require_page('chat-lieu-va-bang-size-ao-bong-ro');
$portfolioPageId = compact_require_page('mau-ao-bong-ro-da-lam');
$contactPageId = compact_require_page('lien-he');

$samplesMenuId = compact_add_menu_item($menuId, [
    'menu-item-title' => 'Mẫu áo',
    'menu-item-object-id' => $samplesPageId,
    'menu-item-object' => 'page',
    'menu-item-type' => 'post_type',
]);

foreach ([
    ['slug' => 'ao-bong-ro-sat-nach', 'label' => 'Áo sát nách'],
    ['slug' => 'ao-bong-ro-co-do-sao-vang', 'label' => 'Áo cờ đỏ sao vàng'],
    ['slug' => 'may-ao-bong-ro-thiet-ke-rieng-x24', 'label' => 'Thiết kế riêng'],
] as $category) {
    $term = get_term_by('slug', $category['slug'], 'product_cat');
    if ($term) {
        compact_add_menu_item($menuId, [
            'menu-item-title' => $category['label'],
            'menu-item-object-id' => (int) $term->term_id,
            'menu-item-object' => 'product_cat',
            'menu-item-type' => 'taxonomy',
            'menu-item-parent-id' => $samplesMenuId,
        ]);
    }
}

foreach ([
    ['slug' => 'mau-ao-bong-ro-tre-em', 'label' => 'Áo trẻ em'],
    ['slug' => 'ao-bong-ro-hoc-sinh-trung-hoc', 'label' => 'Học sinh trung học'],
    ['slug' => 'ao-bong-ro-3x3', 'label' => 'Áo bóng rổ 3x3'],
    ['slug' => 'ao-bong-ro-training', 'label' => 'Áo training'],
] as $page) {
    $existingPage = get_page_by_path($page['slug'], OBJECT, 'page');
    if ($existingPage instanceof WP_Post) {
        compact_add_menu_item($menuId, [
            'menu-item-title' => $page['label'],
            'menu-item-object-id' => (int) $existingPage->ID,
            'menu-item-object' => 'page',
            'menu-item-type' => 'post_type',
            'menu-item-parent-id' => $samplesMenuId,
        ]);
    }
}

compact_add_menu_item($menuId, [
    'menu-item-title' => 'Mẫu đã làm',
    'menu-item-object-id' => $portfolioPageId,
    'menu-item-object' => 'page',
    'menu-item-type' => 'post_type',
    'menu-item-parent-id' => $samplesMenuId,
]);

compact_add_menu_item($menuId, [
    'menu-item-title' => 'Đặt may',
    'menu-item-url' => home_url('/may-ao-bong-ro-thiet-ke-rieng-x24/'),
    'menu-item-type' => 'custom',
]);

foreach ([
    [$pricingPageId, 'Bảng giá', []],
    [$materialsPageId, 'Vải & Size', []],
    [$portfolioPageId, 'Mẫu đã làm', []],
    [$contactPageId, 'Liên hệ', ['x24-menu-contact']],
] as [$pageId, $label, $classes]) {
    compact_add_menu_item($menuId, [
        'menu-item-title' => $label,
        'menu-item-object-id' => $pageId,
        'menu-item-object' => 'page',
        'menu-item-type' => 'post_type',
        'menu-item-classes' => implode(' ', $classes),
    ]);
}

$locations = get_theme_mod('nav_menu_locations', []);
$locations['primary'] = $menuId;
$locations['primary_mobile'] = $menuId;
set_theme_mod('nav_menu_locations', $locations);

file_put_contents(
    $backupDir . '/menu-after.json',
    wp_json_encode(compact_menu_state(), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

compact_output_json([
    'status' => 'applied',
    'menu_id' => $menuId,
    'menu_name' => $menuName,
    'backup_dir' => $backupDir,
    'assigned_locations' => [
        'primary' => $locations['primary'] ?? null,
        'primary_mobile' => $locations['primary_mobile'] ?? null,
    ],
]);
