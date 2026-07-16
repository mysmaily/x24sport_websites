<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/desktop-menu-compact-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';

function x24_portfolio_menu_state(): array
{
    $menus = [];
    foreach (wp_get_nav_menus() as $menu) {
        $items = wp_get_nav_menu_items($menu->term_id, ['post_status' => 'any']) ?: [];
        $menus[] = [
            'id' => (int) $menu->term_id,
            'name' => $menu->name,
            'slug' => $menu->slug,
            'items' => array_map(static function (WP_Post $item): array {
                return [
                    'id' => (int) $item->ID,
                    'title' => $item->title,
                    'url' => $item->url,
                    'type' => $item->type,
                    'object' => $item->object,
                    'object_id' => (int) $item->object_id,
                    'parent' => (int) $item->menu_item_parent,
                    'order' => (int) $item->menu_order,
                    'status' => $item->post_status,
                ];
            }, $items),
        ];
    }

    return [
        'captured_at' => current_time('c'),
        'home_url' => home_url('/'),
        'permalink_structure' => get_option('permalink_structure'),
        'category_base' => get_option('category_base'),
        'locations' => get_nav_menu_locations(),
        'menus' => $menus,
    ];
}

function x24_portfolio_page_payload(?WP_Post $page): ?array
{
    if (!$page instanceof WP_Post) {
        return null;
    }

    return [
        'id' => (int) $page->ID,
        'title' => $page->post_title,
        'slug' => $page->post_name,
        'status' => $page->post_status,
        'content' => $page->post_content,
        'excerpt' => $page->post_excerpt,
        'url' => get_permalink($page),
    ];
}

function x24_portfolio_write_json(string $path, array $payload): void
{
    file_put_contents(
        $path,
        wp_json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
    );
}

if (!wp_mkdir_p($batchRoot)) {
    fwrite(STDERR, "Unable to create batch directory: {$batchRoot}\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-portfolio-post-category';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$slug = 'mau-ao-bong-ro-da-lam';
$oldPage = get_page_by_path($slug, OBJECT, 'page');
$existingCategory = get_category_by_slug($slug);

x24_portfolio_write_json($backupDir . '/before.json', [
    'page' => x24_portfolio_page_payload($oldPage instanceof WP_Post ? $oldPage : null),
    'category' => $existingCategory ? [
        'term_id' => (int) $existingCategory->term_id,
        'name' => $existingCategory->name,
        'slug' => $existingCategory->slug,
        'description' => $existingCategory->description,
        'count' => (int) $existingCategory->count,
        'url' => get_category_link((int) $existingCategory->term_id),
    ] : null,
    'menu_state' => x24_portfolio_menu_state(),
]);

if ($oldPage instanceof WP_Post) {
    $archiveSlug = $slug . '-page-backup-20260711';
    $updatedPage = wp_update_post(wp_slash([
        'ID' => (int) $oldPage->ID,
        'post_name' => $archiveSlug,
        'post_status' => 'draft',
    ]), true);
    if (is_wp_error($updatedPage)) {
        fwrite(STDERR, $updatedPage->get_error_message() . "\n");
        exit(1);
    }
}

$category = get_category_by_slug($slug);
if ($category) {
    $updatedTerm = wp_update_term((int) $category->term_id, 'category', [
        'name' => 'Mẫu áo bóng rổ đã làm',
        'slug' => $slug,
        'description' => 'Các bài viết, hình ảnh thực tế và case study về mẫu áo bóng rổ đã sản xuất cho đội nhóm, trường học, câu lạc bộ và giải đấu.',
    ]);
    if (is_wp_error($updatedTerm)) {
        fwrite(STDERR, $updatedTerm->get_error_message() . "\n");
        exit(1);
    }
    $categoryId = (int) $category->term_id;
} else {
    $createdTerm = wp_insert_term('Mẫu áo bóng rổ đã làm', 'category', [
        'slug' => $slug,
        'description' => 'Các bài viết, hình ảnh thực tế và case study về mẫu áo bóng rổ đã sản xuất cho đội nhóm, trường học, câu lạc bộ và giải đấu.',
    ]);
    if (is_wp_error($createdTerm)) {
        fwrite(STDERR, $createdTerm->get_error_message() . "\n");
        exit(1);
    }
    $categoryId = (int) $createdTerm['term_id'];
}

$locations = get_nav_menu_locations();
$menuId = (int) ($locations['primary'] ?? 0);
if (!$menuId) {
    fwrite(STDERR, "Primary menu location is not assigned.\n");
    exit(1);
}

$items = wp_get_nav_menu_items($menuId, ['post_status' => 'any']) ?: [];
$updatedItems = [];
foreach ($items as $item) {
    $title = trim((string) $item->title);
    $url = (string) $item->url;
    $isPortfolioItem = $title === 'Mẫu đã làm' || str_contains($url, '/mau-ao-bong-ro-da-lam/');
    if (!$isPortfolioItem) {
        continue;
    }

    $updatedMenuItem = wp_update_nav_menu_item($menuId, (int) $item->ID, [
        'menu-item-title' => 'Mẫu đã làm',
        'menu-item-object-id' => $categoryId,
        'menu-item-object' => 'category',
        'menu-item-type' => 'taxonomy',
        'menu-item-status' => 'publish',
        'menu-item-parent-id' => (int) $item->menu_item_parent,
        'menu-item-position' => (int) $item->menu_order,
    ]);
    if (is_wp_error($updatedMenuItem)) {
        fwrite(STDERR, $updatedMenuItem->get_error_message() . "\n");
        exit(1);
    }
    $updatedItems[] = (int) $updatedMenuItem;
}

flush_rewrite_rules(false);
clean_term_cache([$categoryId], 'category');

$category = get_category($categoryId);
x24_portfolio_write_json($backupDir . '/after.json', [
    'page' => x24_portfolio_page_payload(get_post($oldPage instanceof WP_Post ? (int) $oldPage->ID : 0) ?: null),
    'category' => [
        'term_id' => $categoryId,
        'name' => $category->name,
        'slug' => $category->slug,
        'description' => $category->description,
        'count' => (int) $category->count,
        'url' => get_category_link($categoryId),
    ],
    'updated_menu_item_ids' => $updatedItems,
    'menu_state' => x24_portfolio_menu_state(),
]);

echo wp_json_encode([
    'status' => 'applied',
    'category_id' => $categoryId,
    'category_url' => get_category_link($categoryId),
    'old_page_id' => $oldPage instanceof WP_Post ? (int) $oldPage->ID : null,
    'updated_menu_item_ids' => $updatedItems,
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
