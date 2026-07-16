<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$mode = $argv[2] ?? 'audit';

require rtrim($siteRoot, '/') . '/wp-load.php';

function collect_state(): array
{
    $categories = get_terms([
        'taxonomy' => 'product_cat',
        'hide_empty' => false,
    ]);

    $pages = get_posts([
        'post_type' => 'page',
        'post_status' => ['publish', 'draft', 'private'],
        'posts_per_page' => -1,
        'orderby' => 'ID',
        'order' => 'ASC',
    ]);

    $menus = [];
    foreach (wp_get_nav_menus() as $menu) {
        $items = wp_get_nav_menu_items($menu->term_id, ['post_status' => 'any']) ?: [];
        $menus[] = [
            'id' => (int) $menu->term_id,
            'name' => $menu->name,
            'slug' => $menu->slug,
            'items' => array_map(static function ($item): array {
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

    $affectedTerms = [];
    foreach (['ao-bong-ro-2-mat', 'ao-bong-ro-co-tay'] as $slug) {
        $term = get_term_by('slug', $slug, 'product_cat');
        if (!$term) {
            $affectedTerms[$slug] = null;
            continue;
        }
        $affectedTerms[$slug] = [
            'id' => (int) $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug,
            'parent' => (int) $term->parent,
            'count' => (int) $term->count,
            'description' => $term->description,
            'meta' => get_term_meta((int) $term->term_id),
            'product_ids' => get_posts([
                'post_type' => 'product',
                'post_status' => ['publish', 'draft', 'private'],
                'posts_per_page' => -1,
                'fields' => 'ids',
                'tax_query' => [[
                    'taxonomy' => 'product_cat',
                    'field' => 'term_id',
                    'terms' => [(int) $term->term_id],
                ]],
            ]),
        ];
    }

    return [
        'captured_at' => current_time('c'),
        'home_url' => home_url('/'),
        'site_url' => site_url('/'),
        'permalink_structure' => get_option('permalink_structure'),
        'woocommerce_permalinks' => get_option('woocommerce_permalinks'),
        'theme_mods' => get_theme_mods(),
        'menu_locations' => get_nav_menu_locations(),
        'default_product_cat' => (int) get_option('default_product_cat'),
        'affected_terms' => $affectedTerms,
        'categories' => array_map(static function ($term): array {
            return [
                'id' => (int) $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
                'parent' => (int) $term->parent,
                'count' => (int) $term->count,
                'url' => get_term_link($term),
                'description' => $term->description,
            ];
        }, is_wp_error($categories) ? [] : $categories),
        'pages' => array_map(static function ($page): array {
            return [
                'id' => (int) $page->ID,
                'title' => get_the_title($page),
                'slug' => $page->post_name,
                'status' => $page->post_status,
                'url' => get_permalink($page),
                'content' => $page->post_content,
                'excerpt' => $page->post_excerpt,
            ];
        }, $pages),
        'menus' => $menus,
    ];
}

function output_json(array $value): void
{
    echo wp_json_encode($value, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
}

function ensure_category(string $name, string $slug, string $description): int
{
    $existing = get_term_by('slug', $slug, 'product_cat');
    if ($existing) {
        $updated = wp_update_term((int) $existing->term_id, 'product_cat', [
            'name' => $name,
            'description' => $description,
            'parent' => 0,
        ]);
        if (is_wp_error($updated)) {
            throw new RuntimeException($updated->get_error_message());
        }
        return (int) $existing->term_id;
    }

    $created = wp_insert_term($name, 'product_cat', [
        'slug' => $slug,
        'description' => $description,
        'parent' => 0,
    ]);
    if (is_wp_error($created)) {
        throw new RuntimeException($created->get_error_message());
    }
    return (int) $created['term_id'];
}

function ensure_page(string $title, string $slug, string $content): int
{
    $existing = get_page_by_path($slug, OBJECT, 'page');
    $page = [
        'post_type' => 'page',
        'post_title' => $title,
        'post_name' => $slug,
        'post_content' => $content,
        'post_status' => 'publish',
        'post_parent' => 0,
        'comment_status' => 'closed',
    ];

    if ($existing) {
        $page['ID'] = (int) $existing->ID;
        $result = wp_update_post(wp_slash($page), true);
    } else {
        $result = wp_insert_post(wp_slash($page), true);
    }

    if (is_wp_error($result)) {
        throw new RuntimeException($result->get_error_message());
    }
    return (int) $result;
}

function add_menu_item(int $menuId, array $args): int
{
    $defaults = [
        'menu-item-status' => 'publish',
    ];
    $result = wp_update_nav_menu_item($menuId, 0, array_merge($defaults, $args));
    if (is_wp_error($result)) {
        throw new RuntimeException($result->get_error_message());
    }
    return (int) $result;
}

function delete_product_category_preserving_products(string $slug): array
{
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term) {
        return ['slug' => $slug, 'status' => 'already_absent', 'product_count' => 0];
    }

    $productIds = get_posts([
        'post_type' => 'product',
        'post_status' => ['publish', 'draft', 'private'],
        'posts_per_page' => -1,
        'fields' => 'ids',
        'tax_query' => [[
            'taxonomy' => 'product_cat',
            'field' => 'term_id',
            'terms' => [(int) $term->term_id],
        ]],
    ]);
    $defaultCategoryId = (int) get_option('default_product_cat');

    foreach ($productIds as $productId) {
        $otherCategoryIds = array_values(array_diff(
            wp_get_post_terms((int) $productId, 'product_cat', ['fields' => 'ids']),
            [(int) $term->term_id]
        ));
        if (!$otherCategoryIds && $defaultCategoryId) {
            $assigned = wp_set_post_terms((int) $productId, [$defaultCategoryId], 'product_cat', true);
            if (is_wp_error($assigned)) {
                throw new RuntimeException($assigned->get_error_message());
            }
        }
    }

    $deleted = wp_delete_term((int) $term->term_id, 'product_cat');
    if (is_wp_error($deleted)) {
        throw new RuntimeException($deleted->get_error_message());
    }
    if (!$deleted) {
        throw new RuntimeException("Could not delete product category {$slug}.");
    }

    return [
        'slug' => $slug,
        'status' => 'deleted',
        'term_id' => (int) $term->term_id,
        'product_count' => count($productIds),
        'default_category_id' => $defaultCategoryId,
    ];
}

if ($mode === 'audit') {
    output_json(collect_state());
    exit;
}

if ($mode === 'apply') {
    $requiredCategories = [
        ['Chưa Phân Loại', 'chua-phan-loai', 'Danh mục kỹ thuật dành cho sản phẩm chưa được phân loại lại.'],
        ['Bộ Quần Áo Bóng Rổ', 'bo-quan-ao-bong-ro', 'Các mẫu trọn bộ áo và quần bóng rổ để đội nhóm tham khảo và đặt may theo yêu cầu.'],
        ['Áo Bóng Rổ Trẻ Em', 'ao-bong-ro-tre-em', 'Các mẫu áo bóng rổ dành cho trẻ em, đội tuyển trường và học viện.'],
        ['Quần Bóng Rổ', 'quan-bong-ro', 'Các mẫu quần bóng rổ có thể phối đồng bộ với áo và nhận thiết kế theo yêu cầu.'],
    ];
    $categoryIds = [];
    foreach ($requiredCategories as [$name, $slug, $description]) {
        $categoryIds[$slug] = ensure_category($name, $slug, $description);
    }
    update_option('default_product_cat', $categoryIds['chua-phan-loai']);

    $phone = '0989.353.247';
    $facebook = 'https://www.facebook.com/mayaobongro.vn';
    $designCategoryUrl = home_url('/may-ao-bong-ro-thiet-ke-rieng-x24/');

    $intentPageIds = [];
    $intentPageIds['children'] = ensure_page(
        'Áo Bóng Rổ Trẻ Em',
        'mau-ao-bong-ro-tre-em',
        <<<'HTML'
<h1>Áo bóng rổ trẻ em</h1>
<p>Mẫu áo dành cho đội bóng thiếu nhi, lớp năng khiếu và học viện. Có thể điều chỉnh màu sắc, logo, tên số và form áo theo độ tuổi của từng nhóm.</p>

<h2>Điểm cần lưu ý khi đặt áo cho trẻ em</h2>
<ul>
<li>Chọn chất liệu nhẹ, thoáng và dễ vận động.</li>
<li>Gửi chiều cao, cân nặng của từng bé để tư vấn size.</li>
<li>Ưu tiên màu sắc rõ ràng, tên số dễ đọc và nhận diện đội tốt.</li>
</ul>

<h2>Mẫu thiết kế tham khảo</h2>
[products category="may-ao-bong-ro-thiet-ke-rieng-x24" limit="12" columns="4" orderby="date" order="DESC"]

<p><a class="button primary" href="https://zalo.me/0989353247">Tư vấn áo bóng rổ trẻ em</a></p>
HTML
    );

    $intentPageIds['secondary_students'] = ensure_page(
        'Áo Bóng Rổ Học Sinh Trung Học',
        'ao-bong-ro-hoc-sinh-trung-hoc',
        <<<'HTML'
<h1>Áo bóng rổ học sinh trung học</h1>
<p>Thiết kế đồng phục bóng rổ cho học sinh THCS và THPT, đội tuyển trường, câu lạc bộ và giải đấu cấp trường. Mẫu có thể phối theo màu nhận diện, logo và tên lớp hoặc tên đội.</p>

<h2>Phù hợp cho</h2>
<ul>
<li>Đội tuyển bóng rổ trường THCS và THPT.</li>
<li>Câu lạc bộ bóng rổ và hoạt động ngoại khóa.</li>
<li>Giải đấu liên lớp, liên trường và ngày hội thể thao.</li>
</ul>

<h2>Có thể cá nhân hóa</h2>
<ul>
<li>Màu áo theo nhận diện trường hoặc màu của lớp.</li>
<li>Logo, tên đội, tên cầu thủ và số áo riêng.</li>
<li>Form và size theo danh sách từng thành viên.</li>
</ul>

<h2>Mẫu thiết kế tham khảo</h2>
[products category="may-ao-bong-ro-thiet-ke-rieng-x24" limit="12" columns="4" orderby="date" order="DESC"]

<p><a class="button primary" href="https://zalo.me/0989353247">Gửi logo trường để được tư vấn</a></p>
HTML
    );

    $intentPageIds['three_by_three'] = ensure_page(
        'Áo Bóng Rổ 3x3',
        'ao-bong-ro-3x3',
        <<<'HTML'
<h1>Áo bóng rổ 3x3</h1>
<p>Tham khảo mẫu áo dành cho đội bóng rổ 3x3 và giải phong trào. Thiết kế có thể tùy chỉnh màu, logo đội, tên cầu thủ, số áo và logo nhà tài trợ.</p>

[products category="may-ao-bong-ro-thiet-ke-rieng-x24" limit="12" columns="4" orderby="date" order="DESC"]

<p><a class="button primary" href="https://zalo.me/0989353247">Thiết kế áo cho đội 3x3</a></p>
HTML
    );

    $intentPageIds['training'] = ensure_page(
        'Áo Bóng Rổ Training',
        'ao-bong-ro-training',
        <<<'HTML'
<h1>Áo bóng rổ training</h1>
<p>Mẫu áo tập bóng rổ cho đội trường, câu lạc bộ và học viện. Khi đặt áo có thể lựa chọn màu nhận diện riêng, in logo, tên và số áo theo danh sách.</p>

[products category="may-ao-bong-ro-thiet-ke-rieng-x24" limit="12" columns="4" orderby="date" order="DESC"]

<p><a class="button primary" href="https://zalo.me/0989353247">Tư vấn áo tập bóng rổ</a></p>
HTML
    );

    $intentPageIds['samples'] = ensure_page(
        'Mẫu Áo Bóng Rổ',
        'mau-ao-bong-ro',
        <<<'HTML'
<h1>Mẫu áo bóng rổ</h1>
<p>Tham khảo các mẫu áo bóng rổ đã có trên website theo kiểu dáng và nhu cầu của đội. Bạn có thể chọn một mẫu gần với ý tưởng, sau đó gửi logo, màu sắc và danh sách tên số để được hỗ trợ thiết kế.</p>

<h2>Chọn mẫu theo đối tượng và nhu cầu</h2>
<p>
<a class="button primary" href="/mau-ao-bong-ro-tre-em/">Áo bóng rổ trẻ em</a>
<a class="button primary" href="/ao-bong-ro-hoc-sinh-trung-hoc/">Học sinh trung học</a>
<a class="button" href="/ao-bong-ro-3x3/">Bóng rổ 3x3</a>
<a class="button" href="/ao-bong-ro-training/">Áo training</a>
<a class="button" href="/ao-bong-ro-sat-nach/">Áo bóng rổ sát nách</a>
<a class="button" href="/ao-bong-ro-co-do-sao-vang/">Áo bóng rổ cờ đỏ sao vàng</a>
<a class="button" href="/may-ao-bong-ro-thiet-ke-rieng-x24/">Áo bóng rổ thiết kế riêng</a>
</p>

<h2>Mẫu áo mới và mẫu đã sản xuất</h2>
[products category="ao-bong-ro-sat-nach,ao-bong-ro-co-do-sao-vang,may-ao-bong-ro-thiet-ke-rieng-x24" limit="12" columns="4" orderby="date" order="DESC"]

<h2>Bạn chưa có mẫu thiết kế?</h2>
<p>Gửi logo đội, màu chủ đạo hoặc một mẫu bạn thích. Mayaobongro.vn sẽ tư vấn phương án thiết kế phù hợp trước khi sản xuất.</p>
<p><a class="button primary" href="https://zalo.me/0989353247">Gửi ý tưởng qua Zalo</a></p>
HTML
    );

    $intentPageIds['pricing'] = ensure_page(
        'Bảng Giá May Áo Bóng Rổ',
        'bang-gia-may-ao-bong-ro',
        <<<HTML
<h1>Bảng giá may áo bóng rổ</h1>
<p>Chi phí may áo bóng rổ được báo theo đúng yêu cầu của từng đội, vì mỗi đơn có thể khác nhau về số lượng, kiểu áo, chất liệu và nội dung in.</p>

<h2>Thông tin cần có để báo giá nhanh</h2>
<ul>
<li>Số lượng áo hoặc số bộ cần đặt.</li>
<li>Kiểu dáng, form áo và yêu cầu sử dụng.</li>
<li>Mẫu thiết kế, logo và màu chủ đạo của đội.</li>
<li>Danh sách tên, số áo và thời gian cần nhận hàng.</li>
</ul>

<h2>Thiết kế và in ấn</h2>
<p>Gửi mẫu hoặc ý tưởng để đội ngũ kiểm tra yêu cầu in logo, tên và số áo, sau đó xác nhận phương án và báo giá trước khi sản xuất.</p>

<p><strong>Hotline/Zalo: {$phone}</strong></p>
<p><a class="button primary" href="https://zalo.me/0989353247">Nhận báo giá</a> <a class="button" href="{$designCategoryUrl}">Xem mẫu đã thiết kế</a></p>
HTML
    );

    $intentPageIds['materials'] = ensure_page(
        'Chất Liệu & Bảng Size Áo Bóng Rổ',
        'chat-lieu-va-bang-size-ao-bong-ro',
        <<<'HTML'
<h1>Chất liệu & bảng size áo bóng rổ</h1>
<p>Chọn đúng chất liệu và kích thước giúp đồng phục thoải mái khi vận động, đồng thời giữ được form áo đồng đều cho cả đội.</p>

<h2>Chất liệu áo bóng rổ</h2>
<p>Website có trang giới thiệu riêng về các dòng vải đang sử dụng, đặc điểm bề mặt và khả năng thoáng khí.</p>
<p><a class="button primary" href="/chat-lieu-vai/">Xem chi tiết chất liệu vải</a></p>

<h2>Cách chọn size cho đội</h2>
<ol>
<li>Gửi chiều cao và cân nặng của từng thành viên.</li>
<li>Cho biết mong muốn mặc ôm, vừa người hay rộng thoải mái.</li>
<li>Đối chiếu form áo và xác nhận danh sách size trước khi sản xuất.</li>
<li>Nếu đội có nhiều thể trạng khác nhau, hãy gửi danh sách tên, số áo và size theo từng người để hạn chế nhầm lẫn.</li>
</ol>

<p><strong>Lưu ý:</strong> form và thông số có thể khác theo kiểu áo. Hãy xác nhận bảng size của đúng mẫu trước khi chốt đơn.</p>
<p><a class="button primary" href="https://zalo.me/0989353247">Gửi danh sách size qua Zalo</a></p>
HTML
    );

    $intentPageIds['portfolio'] = ensure_page(
        'Mẫu Áo Bóng Rổ Đã Làm',
        'mau-ao-bong-ro-da-lam',
        <<<'HTML'
<h1>Mẫu áo bóng rổ đã làm</h1>
<p>Xem các mẫu áo bóng rổ thiết kế riêng và sản phẩm thực tế đã đăng trên Mayaobongro.vn. Bạn có thể dùng một mẫu làm điểm bắt đầu rồi điều chỉnh màu, logo, tên và số áo theo đội mình.</p>

[products category="may-ao-bong-ro-thiet-ke-rieng-x24" limit="16" columns="4" orderby="date" order="DESC"]

<p><a class="button primary" href="https://zalo.me/0989353247">Gửi mẫu bạn thích để được tư vấn</a></p>
HTML
    );

    $intentPageIds['contact'] = ensure_page(
        'Liên Hệ',
        'lien-he',
        <<<HTML
<h1>Liên hệ Mayaobongro.vn</h1>
<p>Gửi mẫu áo, logo đội, màu sắc, số lượng và thời gian cần nhận để được tư vấn thiết kế và báo giá.</p>

<h2>Thông tin liên hệ</h2>
<p><strong>Hotline/Zalo:</strong> <a href="tel:0989353247">{$phone}</a></p>
<p><strong>Facebook:</strong> <a href="{$facebook}" rel="noopener">May Áo Bóng Rổ - VN</a></p>
<p><strong>Website:</strong> <a href="https://mayaobongro.vn/">mayaobongro.vn</a></p>

<p><a class="button primary" href="https://zalo.me/0989353247">Chat qua Zalo</a> <a class="button" href="{$facebook}">Nhắn tin Facebook</a></p>
HTML
    );

    $deletedCategories = [
        delete_product_category_preserving_products('ao-bong-ro-2-mat'),
        delete_product_category_preserving_products('ao-bong-ro-co-tay'),
    ];

    $menuName = 'Menu chính 2026';
    $menuObject = wp_get_nav_menu_object($menuName);
    if ($menuObject) {
        $menuId = (int) $menuObject->term_id;
        $oldItemIds = get_objects_in_term($menuId, 'nav_menu');
        if (is_wp_error($oldItemIds)) {
            throw new RuntimeException($oldItemIds->get_error_message());
        }
        foreach ($oldItemIds as $oldItemId) {
            $deleted = wp_delete_post((int) $oldItemId, true);
            if (!$deleted) {
                throw new RuntimeException("Could not delete old menu item {$oldItemId}.");
            }
        }
    } else {
        $createdMenu = wp_create_nav_menu($menuName);
        if (is_wp_error($createdMenu)) {
            throw new RuntimeException($createdMenu->get_error_message());
        }
        $menuId = (int) $createdMenu;
    }

    $homePageId = (int) get_option('page_on_front');
    $blogPage = get_page_by_path('blog');
    if (!$homePageId || !$blogPage) {
        throw new RuntimeException('Homepage or Blog page could not be resolved.');
    }

    add_menu_item($menuId, [
        'menu-item-title' => 'Trang chủ',
        'menu-item-object-id' => $homePageId,
        'menu-item-object' => 'page',
        'menu-item-type' => 'post_type',
    ]);

    $samplesMenuId = add_menu_item($menuId, [
        'menu-item-title' => 'Mẫu áo',
        'menu-item-object-id' => $intentPageIds['samples'],
        'menu-item-object' => 'page',
        'menu-item-type' => 'post_type',
    ]);

    foreach ([
        [$intentPageIds['children'], 'Áo bóng rổ trẻ em'],
        [$intentPageIds['secondary_students'], 'Học sinh trung học'],
        [$intentPageIds['three_by_three'], 'Áo bóng rổ 3x3'],
        [$intentPageIds['training'], 'Áo bóng rổ Training'],
    ] as [$pageId, $label]) {
        add_menu_item($menuId, [
            'menu-item-title' => $label,
            'menu-item-object-id' => $pageId,
            'menu-item-object' => 'page',
            'menu-item-type' => 'post_type',
            'menu-item-parent-id' => $samplesMenuId,
        ]);
    }

    foreach ([
        70 => 'Áo bóng rổ sát nách',
        72 => 'Áo cờ đỏ sao vàng',
        75 => 'Thiết kế theo yêu cầu',
    ] as $termId => $label) {
        if (!term_exists($termId, 'product_cat')) {
            throw new RuntimeException("Required product category {$termId} is missing.");
        }
        add_menu_item($menuId, [
            'menu-item-title' => $label,
            'menu-item-object-id' => $termId,
            'menu-item-object' => 'product_cat',
            'menu-item-type' => 'taxonomy',
            'menu-item-parent-id' => $samplesMenuId,
        ]);
    }

    add_menu_item($menuId, [
        'menu-item-title' => 'Mẫu đã sản xuất',
        'menu-item-object-id' => $intentPageIds['portfolio'],
        'menu-item-object' => 'page',
        'menu-item-type' => 'post_type',
        'menu-item-parent-id' => $samplesMenuId,
    ]);

    add_menu_item($menuId, [
        'menu-item-title' => 'May theo yêu cầu',
        'menu-item-url' => $designCategoryUrl,
        'menu-item-type' => 'custom',
    ]);

    foreach ([
        [$intentPageIds['pricing'], 'Bảng giá'],
        [$intentPageIds['materials'], 'Vải & Size'],
        [$intentPageIds['portfolio'], 'Mẫu đã làm'],
        [(int) $blogPage->ID, 'Blog'],
        [$intentPageIds['contact'], 'Liên hệ'],
    ] as [$pageId, $label]) {
        add_menu_item($menuId, [
            'menu-item-title' => $label,
            'menu-item-object-id' => $pageId,
            'menu-item-object' => 'page',
            'menu-item-type' => 'post_type',
        ]);
    }

    $locations = get_theme_mod('nav_menu_locations', []);
    $locations['primary'] = $menuId;
    $locations['primary_mobile'] = $menuId;
    set_theme_mod('nav_menu_locations', $locations);

    clean_term_cache([], 'product_cat');
    flush_rewrite_rules(false);

    output_json([
        'status' => 'applied',
        'category_ids' => $categoryIds,
        'deleted_categories' => $deletedCategories,
        'page_ids' => $intentPageIds,
        'menu_id' => $menuId,
    ]);
    exit;
}

fwrite(STDERR, "Unknown mode: {$mode}\n");
exit(2);
