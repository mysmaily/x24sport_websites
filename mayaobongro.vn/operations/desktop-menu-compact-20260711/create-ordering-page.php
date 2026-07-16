<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/desktop-menu-compact-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';

function x24_menu_state_for_backup(): array
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
                    'classes' => array_values(array_filter((array) $item->classes)),
                    'status' => $item->post_status,
                ];
            }, $items),
        ];
    }

    return [
        'captured_at' => current_time('c'),
        'home_url' => home_url('/'),
        'locations' => get_nav_menu_locations(),
        'menus' => $menus,
    ];
}

function x24_backup_page_payload(?WP_Post $page): ?array
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

function x24_write_json(string $path, array $payload): void
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

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-ordering-page';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$slug = 'dat-may-ao-bong-ro';
$existingPage = get_page_by_path($slug, OBJECT, 'page');

x24_write_json($backupDir . '/before.json', [
    'page' => x24_backup_page_payload($existingPage instanceof WP_Post ? $existingPage : null),
    'menu_state' => x24_menu_state_for_backup(),
]);

$title = 'Đặt May Áo Bóng Rổ';
$content = <<<'HTML'
<h1>Đặt may áo bóng rổ</h1>
<p>Đặt may áo bóng rổ phù hợp khi đội của bạn cần đồng phục riêng theo màu sắc, logo, tên cầu thủ, số áo và form mặc thực tế. Mayaobongro.vn hỗ trợ từ khâu chọn mẫu, chỉnh thiết kế đến xác nhận size trước khi sản xuất.</p>

<h2>Quy trình đặt may</h2>
<ol>
<li><strong>Gửi nhu cầu:</strong> cho biết số lượng, đối tượng mặc, thời gian cần nhận và mẫu áo bạn thích.</li>
<li><strong>Tư vấn mẫu & chất liệu:</strong> chọn kiểu áo, chất liệu, form mặc và phương án in phù hợp với ngân sách.</li>
<li><strong>Thiết kế theo đội:</strong> gửi logo, màu chủ đạo, tên đội, tên cầu thủ và số áo để lên phương án thiết kế.</li>
<li><strong>Xác nhận size:</strong> gửi chiều cao, cân nặng hoặc danh sách size để kiểm tra trước khi sản xuất.</li>
<li><strong>Báo giá & chốt đơn:</strong> xác nhận số lượng, thiết kế, thời gian giao và chi phí cuối cùng.</li>
<li><strong>Sản xuất & giao hàng:</strong> tiến hành may/in theo mẫu đã duyệt và bàn giao cho đội.</li>
</ol>

<h2>Thông tin nên chuẩn bị trước</h2>
<ul>
<li>Số lượng áo hoặc số bộ cần đặt.</li>
<li>Logo đội, tên đội, màu chủ đạo hoặc ảnh mẫu tham khảo.</li>
<li>Danh sách tên cầu thủ, số áo và size nếu đã có.</li>
<li>Thời gian cần nhận hàng và khu vực giao hàng.</li>
</ul>

<h2>Nếu chưa có mẫu thiết kế</h2>
<p>Bạn chỉ cần gửi màu yêu thích, logo hoặc một mẫu tham khảo gần với ý tưởng. Đội ngũ sẽ tư vấn hướng thiết kế phù hợp cho đội bóng, lớp học, câu lạc bộ hoặc giải đấu.</p>

<p>
<a class="button primary" href="https://zalo.me/0989353247">Gửi yêu cầu qua Zalo</a>
<a class="button" href="/mau-ao-bong-ro/">Xem mẫu áo</a>
<a class="button" href="/bang-gia-may-ao-bong-ro/">Xem cách báo giá</a>
</p>
HTML;

$pageData = [
    'post_type' => 'page',
    'post_title' => $title,
    'post_name' => $slug,
    'post_content' => $content,
    'post_status' => 'publish',
    'post_parent' => 0,
    'comment_status' => 'closed',
    'ping_status' => 'closed',
];

if ($existingPage instanceof WP_Post) {
    $pageData['ID'] = (int) $existingPage->ID;
    $pageId = wp_update_post(wp_slash($pageData), true);
} else {
    $pageId = wp_insert_post(wp_slash($pageData), true);
}

if (is_wp_error($pageId)) {
    fwrite(STDERR, $pageId->get_error_message() . "\n");
    exit(1);
}
$pageId = (int) $pageId;

$locations = get_nav_menu_locations();
$menuId = (int) ($locations['primary'] ?? 0);
if (!$menuId) {
    fwrite(STDERR, "Primary menu location is not assigned.\n");
    exit(1);
}

$items = wp_get_nav_menu_items($menuId, ['post_status' => 'any']) ?: [];
$orderItem = null;
foreach ($items as $item) {
    if ((int) $item->menu_item_parent === 0 && trim((string) $item->title) === 'Đặt may') {
        $orderItem = $item;
        break;
    }
}

if (!$orderItem instanceof WP_Post) {
    fwrite(STDERR, "Could not find top-level Đặt may menu item.\n");
    exit(1);
}

$updatedMenuItem = wp_update_nav_menu_item($menuId, (int) $orderItem->ID, [
    'menu-item-title' => 'Đặt may',
    'menu-item-object-id' => $pageId,
    'menu-item-object' => 'page',
    'menu-item-type' => 'post_type',
    'menu-item-status' => 'publish',
    'menu-item-position' => (int) $orderItem->menu_order,
]);

if (is_wp_error($updatedMenuItem)) {
    fwrite(STDERR, $updatedMenuItem->get_error_message() . "\n");
    exit(1);
}

x24_write_json($backupDir . '/after.json', [
    'page' => x24_backup_page_payload(get_post($pageId)),
    'menu_state' => x24_menu_state_for_backup(),
]);

echo wp_json_encode([
    'status' => 'applied',
    'page_id' => $pageId,
    'page_url' => get_permalink($pageId),
    'menu_id' => $menuId,
    'updated_menu_item_id' => (int) $updatedMenuItem,
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
