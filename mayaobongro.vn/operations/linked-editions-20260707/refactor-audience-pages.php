<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$backupRoot = $argv[2] ?? $siteRoot . '/wp-content/uploads/codex-ops/audience-refactor-' . gmdate('Ymd-His');

require rtrim($siteRoot, '/') . '/wp-load.php';

if (!wp_mkdir_p($backupRoot)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupRoot}\n");
    exit(2);
}

$frontPageId = (int) get_option('page_on_front');
$kidsPageId = 2694;
$adultPageId = 2743;
$kidsMenuItemId = 2749;
$adultMenuItemId = 2750;
$legacyCategorySlugs = ['ao-bong-ro-tre-em', 'ao-bong-ro-nguoi-lon'];
$audienceTagSlugs = ['ao-bong-ro-tre-em', 'ao-bong-ro-nguoi-lon'];

$legacyTerms = [];
$productIds = [];
foreach ($legacyCategorySlugs as $slug) {
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term instanceof WP_Term) {
        $legacyTerms[$slug] = null;
        continue;
    }

    $legacyTerms[$slug] = [
        'term_id' => (int) $term->term_id,
        'name' => $term->name,
        'slug' => $term->slug,
        'count' => (int) $term->count,
    ];

    $termProducts = get_objects_in_term((int) $term->term_id, 'product_cat');
    foreach ($termProducts as $productId) {
        $productIds[(int) $productId] = (int) $productId;
    }
}
$productIds = array_values($productIds);

$backup = [
    'captured_at' => current_time('c'),
    'front_page_id' => $frontPageId,
    'pages' => [],
    'menu_items' => [],
    'legacy_categories' => $legacyTerms,
    'audience_tags' => [],
    'product_ids' => $productIds,
];

foreach ([$frontPageId, $kidsPageId, $adultPageId, 2623] as $pageId) {
    $page = get_post($pageId);
    if ($page instanceof WP_Post) {
        $backup['pages'][$pageId] = [
            'post_title' => $page->post_title,
            'post_name' => $page->post_name,
            'post_status' => $page->post_status,
            'post_content' => $page->post_content,
        ];
    }
}

foreach ([$kidsMenuItemId, $adultMenuItemId] as $menuItemId) {
    $item = wp_setup_nav_menu_item(get_post($menuItemId));
    if ($item instanceof WP_Post || is_object($item)) {
        $terms = wp_get_post_terms($menuItemId, 'nav_menu');
        $backup['menu_items'][$menuItemId] = [
            'title' => $item->title ?? '',
            'url' => $item->url ?? '',
            'type' => $item->type ?? '',
            'object' => $item->object ?? '',
            'object_id' => isset($item->object_id) ? (int) $item->object_id : 0,
            'menu_id' => isset($terms[0]) ? (int) $terms[0]->term_id : 0,
        ];
    }
}

foreach ($audienceTagSlugs as $slug) {
    $term = get_term_by('slug', $slug, 'product_tag');
    $backup['audience_tags'][$slug] = $term instanceof WP_Term ? [
        'term_id' => (int) $term->term_id,
        'name' => $term->name,
        'slug' => $term->slug,
        'count' => (int) $term->count,
    ] : null;
}

file_put_contents(
    trailingslashit($backupRoot) . 'before.json',
    wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);

$tagDefinitions = [
    'ao-bong-ro-tre-em' => [
        'name' => 'Áo bóng rổ trẻ em',
        'description' => 'Mẫu áo bóng rổ cho học sinh tiểu học, trẻ em và đội bóng thiếu nhi.',
    ],
    'ao-bong-ro-nguoi-lon' => [
        'name' => 'Áo bóng rổ người lớn',
        'description' => 'Mẫu áo bóng rổ cho học sinh trung học, người lớn, câu lạc bộ và đội phong trào.',
    ],
];

$tagIds = [];
foreach ($tagDefinitions as $slug => $definition) {
    $term = get_term_by('slug', $slug, 'product_tag');
    if ($term instanceof WP_Term) {
        wp_update_term((int) $term->term_id, 'product_tag', [
            'name' => $definition['name'],
            'description' => $definition['description'],
            'slug' => $slug,
        ]);
        $tagIds[$slug] = (int) $term->term_id;
        continue;
    }

    $created = wp_insert_term($definition['name'], 'product_tag', [
        'slug' => $slug,
        'description' => $definition['description'],
    ]);
    if (is_wp_error($created)) {
        throw new RuntimeException($created->get_error_message());
    }
    $tagIds[$slug] = (int) $created['term_id'];
}

$legacyCategoryIds = array_values(array_filter(array_map(
    static fn(?array $term): int => $term['term_id'] ?? 0,
    $legacyTerms
)));

foreach ($productIds as $productId) {
    wp_set_post_terms($productId, array_values($tagIds), 'product_tag', true);

    $currentCategoryIds = wp_get_post_terms($productId, 'product_cat', ['fields' => 'ids']);
    $keptCategoryIds = array_values(array_diff(array_map('intval', $currentCategoryIds), $legacyCategoryIds));
    wp_set_post_terms($productId, $keptCategoryIds, 'product_cat', false);
}

$renamedCategories = [];
foreach ($legacyCategorySlugs as $slug) {
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term instanceof WP_Term) {
        continue;
    }

    $newSlug = 'luu-tru-' . $slug;
    $newName = '[Lưu trữ] ' . $term->name;
    $updated = wp_update_term((int) $term->term_id, 'product_cat', [
        'name' => $newName,
        'slug' => $newSlug,
    ]);
    if (is_wp_error($updated)) {
        throw new RuntimeException($updated->get_error_message());
    }

    $renamedCategories[$slug] = [
        'term_id' => (int) $term->term_id,
        'new_slug' => $newSlug,
        'new_name' => $newName,
    ];
}

$kidsContent = <<<HTML
<h1>Áo bóng rổ trẻ em</h1>
<p>Mẫu áo bóng rổ dành cho học sinh tiểu học, lớp năng khiếu và đội bóng thiếu nhi. Mỗi mẫu đều có thể chỉnh màu sắc, logo, tên số và form áo theo độ tuổi của từng nhóm.</p>

<h2>Phù hợp cho</h2>
<ul>
<li>Đội bóng rổ trẻ em và học sinh tiểu học.</li>
<li>Lớp học năng khiếu, câu lạc bộ thiếu nhi và giải đấu nội bộ.</li>
<li>Nhóm cần mẫu áo nổi bật, dễ nhận diện và linh hoạt size.</li>
</ul>

<h2>Mẫu áo bóng rổ trẻ em tham khảo</h2>
[products tag="ao-bong-ro-tre-em" limit="12" columns="4" orderby="date" order="DESC"]

<p><a class="button primary" href="https://zalo.me/0989353247">Tư vấn áo bóng rổ trẻ em</a></p>
HTML;

$adultContent = <<<HTML
<h1>Áo bóng rổ người lớn</h1>
<p>Mẫu áo bóng rổ cho học sinh trung học, người lớn, đội phong trào, câu lạc bộ và đội tuyển trường. Có thể cá nhân hóa logo, tên số, màu sắc và form áo theo từng đội.</p>

<h2>Phù hợp cho</h2>
<ul>
<li>Đội bóng rổ học sinh trung học, THPT và đại diện trường lớp.</li>
<li>Câu lạc bộ bóng rổ, đội công ty và nhóm bạn thi đấu phong trào.</li>
<li>Nhóm cần form rộng, màu gọn và dễ vận động.</li>
</ul>

<h2>Mẫu áo bóng rổ người lớn tham khảo</h2>
[products tag="ao-bong-ro-nguoi-lon" limit="12" columns="4" orderby="date" order="DESC"]

<p><a class="button primary" href="https://zalo.me/0989353247">Tư vấn áo bóng rổ người lớn</a></p>
HTML;

$kidsPageResult = wp_update_post([
    'ID' => $kidsPageId,
    'post_title' => 'Áo Bóng Rổ Trẻ Em',
    'post_name' => 'ao-bong-ro-tre-em',
    'post_content' => $kidsContent,
    'post_status' => 'publish',
], true);
if (is_wp_error($kidsPageResult)) {
    throw new RuntimeException($kidsPageResult->get_error_message());
}

$adultPageResult = wp_update_post([
    'ID' => $adultPageId,
    'post_title' => 'Áo Bóng Rổ Người Lớn',
    'post_name' => 'ao-bong-ro-nguoi-lon',
    'post_content' => $adultContent,
    'post_status' => 'publish',
], true);
if (is_wp_error($adultPageResult)) {
    throw new RuntimeException($adultPageResult->get_error_message());
}

$frontPage = get_post($frontPageId);
if (!$frontPage instanceof WP_Post) {
    throw new RuntimeException('Front page not found.');
}

$frontContent = $frontPage->post_content;
$replacements = [
    'link="https://mayaobongro.vn/ao-bong-ro-sat-nach/"' => 'link="https://mayaobongro.vn/ao-bong-ro-nguoi-lon/"',
    'link="https://mayaobongro.vn/may-ao-bong-ro-thiet-ke-rieng-x24/"' => 'link="https://mayaobongro.vn/ao-bong-ro-tre-em/"',
    '[button text="Xem MẪU NGƯỜI LỚN" color="alert" style="outline" radius="99" link="https://mayaobongro.vn/ao-bong-ro-sat-nach/"]' =>
        '[button text="Xem MẪU NGƯỜI LỚN" color="alert" style="outline" radius="99" link="https://mayaobongro.vn/ao-bong-ro-nguoi-lon/"]',
    '[button text="Xem MẪU TRẺ EM" color="alert" style="outline" radius="99" link="https://mayaobongro.vn/may-ao-bong-ro-thiet-ke-rieng-x24/"]' =>
        '[button text="Xem MẪU TRẺ EM" color="alert" style="outline" radius="99" link="https://mayaobongro.vn/ao-bong-ro-tre-em/"]',
    "[col span__sm=\"12\" divider=\"0\" margin=\"-150px 0px -60px 0px\" margin__sm=\"-20px 0px -30px 0px\" margin__md=\"-25px 0px -30px 0px\" align=\"center\"]\n\n[ux_products type=\"row\" columns__sm=\"2\" columns__md=\"3\" cat=\"70\" products=\"12\"]" =>
        "[col span__sm=\"12\" divider=\"0\" margin=\"-150px 0px -60px 0px\" margin__sm=\"-20px 0px -30px 0px\" margin__md=\"-25px 0px -30px 0px\" align=\"center\"]\n\n[ux_products type=\"row\" columns__sm=\"2\" columns__md=\"3\" tags=\"ao-bong-ro-nguoi-lon\" products=\"12\"]",
    "[col span__sm=\"12\" divider=\"0\" margin=\"-150px 0px -37px 0px\" margin__sm=\"-20px 0px -51px 0px\" margin__md=\"-25px 0px -10px 0px\" align=\"center\"]\n\n[ux_products type=\"row\" columns__sm=\"2\" columns__md=\"3\" cat=\"75\" products=\"12\"]" =>
        "[col span__sm=\"12\" divider=\"0\" margin=\"-150px 0px -37px 0px\" margin__sm=\"-20px 0px -51px 0px\" margin__md=\"-25px 0px -10px 0px\" align=\"center\"]\n\n[ux_products type=\"row\" columns__sm=\"2\" columns__md=\"3\" tags=\"ao-bong-ro-tre-em\" products=\"12\"]",
];

foreach ($replacements as $search => $replace) {
    $frontContent = str_replace($search, $replace, $frontContent);
}

$frontPageResult = wp_update_post([
    'ID' => $frontPageId,
    'post_content' => $frontContent,
], true);
if (is_wp_error($frontPageResult)) {
    throw new RuntimeException($frontPageResult->get_error_message());
}

foreach ([
    $kidsMenuItemId => $kidsPageId,
    $adultMenuItemId => $adultPageId,
] as $menuItemId => $pageId) {
    $menuTerms = wp_get_post_terms($menuItemId, 'nav_menu');
    $menuId = isset($menuTerms[0]) ? (int) $menuTerms[0]->term_id : 0;
    if ($menuId < 1) {
        continue;
    }

    $page = get_post($pageId);
    if (!$page instanceof WP_Post) {
        continue;
    }

    $updated = wp_update_nav_menu_item($menuId, $menuItemId, [
        'menu-item-title' => $page->post_title,
        'menu-item-object-id' => $pageId,
        'menu-item-object' => 'page',
        'menu-item-type' => 'post_type',
        'menu-item-status' => 'publish',
        'menu-item-url' => '',
    ]);
    if (is_wp_error($updated)) {
        throw new RuntimeException($updated->get_error_message());
    }
}

flush_rewrite_rules();

$result = [
    'backup_root' => $backupRoot,
    'products_updated' => count($productIds),
    'tag_ids' => $tagIds,
    'renamed_categories' => $renamedCategories,
    'kids_page_url' => get_permalink($kidsPageId),
    'adult_page_url' => get_permalink($adultPageId),
];

file_put_contents(
    trailingslashit($backupRoot) . 'after.json',
    wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);

echo wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), PHP_EOL;
