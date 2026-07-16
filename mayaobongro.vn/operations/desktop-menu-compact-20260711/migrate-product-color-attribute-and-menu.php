<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/desktop-menu-compact-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';

if (!function_exists('wc_get_attribute_taxonomies')) {
    fwrite(STDERR, "WooCommerce functions are not available.\n");
    exit(1);
}

if (!wp_mkdir_p($batchRoot)) {
    fwrite(STDERR, "Unable to create batch directory: {$batchRoot}\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-product-color-attribute-menu';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$colors = [
    [
        'name' => 'Áo màu đen',
        'slug' => 'den',
        'menu' => 'Áo màu đen',
        'patterns' => ['đen', 'den', 'black'],
        'anti_patterns' => ['đen đá'],
    ],
    [
        'name' => 'Áo màu trắng',
        'slug' => 'trang',
        'menu' => 'Áo màu trắng',
        'patterns' => ['trắng', 'trang', 'white'],
        'anti_patterns' => [],
    ],
    [
        'name' => 'Áo màu xanh',
        'slug' => 'xanh',
        'menu' => 'Áo màu xanh',
        'patterns' => ['xanh', 'blue', 'navy'],
        'anti_patterns' => [],
    ],
    [
        'name' => 'Áo màu đỏ',
        'slug' => 'do',
        'menu' => 'Áo màu đỏ',
        'patterns' => ['đỏ', 'red', 'do-cam', 'do-chuyen', 'do-gradient', 'do-phoi', 'phoi-do', 'mau-do'],
        'anti_patterns' => [],
    ],
    [
        'name' => 'Áo màu vàng',
        'slug' => 'vang',
        'menu' => 'Áo màu vàng',
        'patterns' => ['vàng', 'vang', 'yellow'],
        'anti_patterns' => ['sao-vang'],
    ],
    [
        'name' => 'Áo màu cam',
        'slug' => 'cam',
        'menu' => 'Áo màu cam',
        'patterns' => ['cam', 'orange'],
        'anti_patterns' => [],
    ],
    [
        'name' => 'Áo màu hồng',
        'slug' => 'hong',
        'menu' => 'Áo màu hồng',
        'patterns' => ['hồng', 'hong', 'pink'],
        'anti_patterns' => [],
    ],
    [
        'name' => 'Áo màu tím',
        'slug' => 'tim',
        'menu' => 'Áo màu tím',
        'patterns' => ['tím', 'tim', 'purple', 'violet'],
        'anti_patterns' => [],
    ],
    [
        'name' => 'Áo gradient',
        'slug' => 'gradient',
        'menu' => 'Áo gradient',
        'patterns' => ['gradient', 'ombre', 'chuyển sắc', 'chuyen sac', 'chuyển màu', 'chuyen mau'],
        'anti_patterns' => [],
    ],
];

function x24_normalize_text(string $text): string
{
    $text = html_entity_decode(wp_strip_all_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = mb_strtolower($text);
    $replacements = [
        'á' => 'a', 'à' => 'a', 'ả' => 'a', 'ã' => 'a', 'ạ' => 'a', 'ă' => 'a', 'ắ' => 'a', 'ằ' => 'a', 'ẳ' => 'a', 'ẵ' => 'a', 'ặ' => 'a', 'â' => 'a', 'ấ' => 'a', 'ầ' => 'a', 'ẩ' => 'a', 'ẫ' => 'a', 'ậ' => 'a',
        'é' => 'e', 'è' => 'e', 'ẻ' => 'e', 'ẽ' => 'e', 'ẹ' => 'e', 'ê' => 'e', 'ế' => 'e', 'ề' => 'e', 'ể' => 'e', 'ễ' => 'e', 'ệ' => 'e',
        'í' => 'i', 'ì' => 'i', 'ỉ' => 'i', 'ĩ' => 'i', 'ị' => 'i',
        'ó' => 'o', 'ò' => 'o', 'ỏ' => 'o', 'õ' => 'o', 'ọ' => 'o', 'ô' => 'o', 'ố' => 'o', 'ồ' => 'o', 'ổ' => 'o', 'ỗ' => 'o', 'ộ' => 'o', 'ơ' => 'o', 'ớ' => 'o', 'ờ' => 'o', 'ở' => 'o', 'ỡ' => 'o', 'ợ' => 'o',
        'ú' => 'u', 'ù' => 'u', 'ủ' => 'u', 'ũ' => 'u', 'ụ' => 'u', 'ư' => 'u', 'ứ' => 'u', 'ừ' => 'u', 'ử' => 'u', 'ữ' => 'u', 'ự' => 'u',
        'ý' => 'y', 'ỳ' => 'y', 'ỷ' => 'y', 'ỹ' => 'y', 'ỵ' => 'y',
        'đ' => 'd',
    ];
    $text = strtr($text, $replacements);
    $text = preg_replace('/[^a-z0-9]+/u', ' ', $text) ?: $text;
    return ' ' . trim(preg_replace('/\s+/', ' ', $text) ?: $text) . ' ';
}

function x24_text_has_phrase(string $normalizedText, string $phrase): bool
{
    $needle = trim(x24_normalize_text($phrase));
    if ($needle === '') {
        return false;
    }
    return str_contains($normalizedText, ' ' . $needle . ' ');
}

function x24_raw_search_text(string $text): string
{
    $text = html_entity_decode(wp_strip_all_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = mb_strtolower($text);
    $text = preg_replace('/[^\p{L}\p{N}\-_]+/u', ' ', $text) ?: $text;
    return ' ' . trim(preg_replace('/\s+/', ' ', $text) ?: $text) . ' ';
}

function x24_text_has_raw_phrase(string $rawText, string $phrase): bool
{
    $needle = trim(x24_raw_search_text($phrase));
    if ($needle === '') {
        return false;
    }
    return preg_match('/(^|[\s\-_])' . preg_quote($needle, '/') . '($|[\s\-_])/u', $rawText) === 1;
}

function x24_product_search_text(WP_Post $product): array
{
    $pieces = [
        $product->post_title,
        $product->post_name,
        $product->post_excerpt,
    ];

    $terms = wp_get_post_terms($product->ID, ['product_tag', 'product_cat'], ['fields' => 'all']);
    if (!is_wp_error($terms)) {
        foreach ($terms as $term) {
            $pieces[] = $term->name;
            $pieces[] = $term->slug;
        }
    }

    foreach (['_yoast_wpseo_title', '_mayaobongro_edition_group'] as $metaKey) {
        $value = get_post_meta($product->ID, $metaKey, true);
        if (is_scalar($value)) {
            $pieces[] = (string) $value;
        }
    }

    $raw = implode(' ', array_filter($pieces));
    return [
        'raw' => x24_raw_search_text($raw),
        'normalized' => x24_normalize_text($raw),
    ];
}

function x24_color_matches_product(array $texts, array $color): bool
{
    foreach ($color['anti_patterns'] as $antiPattern) {
        if (x24_text_has_phrase($texts['normalized'], $antiPattern) || x24_text_has_raw_phrase($texts['raw'], $antiPattern)) {
            return false;
        }
    }
    foreach ($color['patterns'] as $pattern) {
        $hasNonAscii = preg_match('/[^\x00-\x7F]/', $pattern) === 1;
        if (x24_text_has_raw_phrase($texts['raw'], $pattern) || (!$hasNonAscii && x24_text_has_phrase($texts['normalized'], $pattern))) {
            return true;
        }
    }
    return false;
}

function x24_find_menu_item(int $menuId, string $title, int $parentId = 0): ?WP_Post
{
    $items = wp_get_nav_menu_items($menuId, ['post_status' => 'publish']);
    foreach ($items ?: [] as $item) {
        if ((int) $item->menu_item_parent === $parentId && trim($item->title) === $title) {
            return $item;
        }
    }
    return null;
}

$attributeTaxonomy = 'pa_mau-sac';
$attributeId = 0;
foreach (wc_get_attribute_taxonomies() as $attribute) {
    if ($attribute->attribute_name === 'mau-sac') {
        $attributeId = (int) $attribute->attribute_id;
        if (function_exists('wc_update_attribute')) {
            wc_update_attribute($attributeId, [
                'name' => 'Màu sắc',
                'slug' => 'mau-sac',
                'type' => $attribute->attribute_type ?: 'select',
                'order_by' => $attribute->attribute_orderby ?: 'menu_order',
                'has_archives' => true,
            ]);
            delete_transient('wc_attribute_taxonomies');
        }
        break;
    }
}

if ($attributeId === 0 && function_exists('wc_create_attribute')) {
    $created = wc_create_attribute([
        'name' => 'Màu sắc',
        'slug' => 'mau-sac',
        'type' => 'select',
        'order_by' => 'menu_order',
        'has_archives' => true,
    ]);
    if (is_wp_error($created)) {
        fwrite(STDERR, $created->get_error_message() . "\n");
        exit(1);
    }
    $attributeId = (int) $created;
    delete_transient('wc_attribute_taxonomies');
}

register_taxonomy(
    $attributeTaxonomy,
    ['product'],
    [
        'hierarchical' => false,
        'show_ui' => true,
        'query_var' => true,
        'rewrite' => ['slug' => 'mau-sac'],
    ]
);

$beforeTerms = get_terms(['taxonomy' => $attributeTaxonomy, 'hide_empty' => false]);
$beforeProducts = get_posts([
    'post_type' => 'product',
    'post_status' => 'publish',
    'fields' => 'ids',
    'posts_per_page' => -1,
]);
$beforeAssignments = [];
foreach ($beforeProducts as $productId) {
    $terms = wp_get_post_terms((int) $productId, $attributeTaxonomy, ['fields' => 'slugs']);
    $attrs = get_post_meta((int) $productId, '_product_attributes', true);
    if ((!is_wp_error($terms) && $terms) || $attrs) {
        $beforeAssignments[(int) $productId] = [
            'terms' => is_wp_error($terms) ? [] : $terms,
            '_product_attributes' => $attrs,
        ];
    }
}

$locations = get_nav_menu_locations();
$primaryMenuId = isset($locations['primary']) ? (int) $locations['primary'] : 0;
$primaryMenu = $primaryMenuId ? wp_get_nav_menu_object($primaryMenuId) : null;
$menuBefore = $primaryMenuId ? wp_get_nav_menu_items($primaryMenuId, ['post_status' => 'publish']) : [];

file_put_contents(
    $backupDir . '/before.json',
    wp_json_encode([
        'attribute_id' => $attributeId,
        'attribute_taxonomy' => $attributeTaxonomy,
        'terms' => is_wp_error($beforeTerms) ? [] : array_map(fn (WP_Term $term): array => [
            'id' => (int) $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug,
            'count' => (int) $term->count,
        ], $beforeTerms),
        'assignments_and_product_attributes' => $beforeAssignments,
        'primary_menu_id' => $primaryMenuId,
        'primary_menu_name' => $primaryMenu ? $primaryMenu->name : null,
        'menu_items' => array_map(fn (WP_Post $item): array => [
            'ID' => (int) $item->ID,
            'title' => $item->title,
            'url' => $item->url,
            'menu_item_parent' => (int) $item->menu_item_parent,
            'object' => $item->object,
            'object_id' => (int) $item->object_id,
            'type' => $item->type,
        ], $menuBefore ?: []),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

$termIdsBySlug = [];
foreach ($colors as $index => $color) {
    $term = get_term_by('slug', $color['slug'], $attributeTaxonomy);
    if (!$term) {
        $created = wp_insert_term($color['name'], $attributeTaxonomy, [
            'slug' => $color['slug'],
            'description' => 'Các mẫu áo bóng rổ theo màu ' . mb_strtolower(str_replace('Áo màu ', '', $color['name'])) . ' tại Mayaobongro.vn.',
        ]);
        if (is_wp_error($created)) {
            fwrite(STDERR, $created->get_error_message() . "\n");
            exit(1);
        }
        $termId = (int) $created['term_id'];
    } else {
        $termId = (int) $term->term_id;
        wp_update_term($termId, $attributeTaxonomy, ['name' => $color['name']]);
    }
    update_term_meta($termId, 'order_' . $attributeTaxonomy, $index);
    $termIdsBySlug[$color['slug']] = $termId;
}

$products = get_posts([
    'post_type' => 'product',
    'post_status' => 'publish',
    'posts_per_page' => -1,
]);

$matchedProducts = [];
$coloredProductCount = 0;
$counts = array_fill_keys(array_column($colors, 'slug'), 0);
foreach ($products as $product) {
    $text = x24_product_search_text($product);
    $matchedTermIds = [];
    $matchedSlugs = [];
    foreach ($colors as $color) {
        if (x24_color_matches_product($text, $color)) {
            $matchedTermIds[] = $termIdsBySlug[$color['slug']];
            $matchedSlugs[] = $color['slug'];
            $counts[$color['slug']]++;
        }
    }

    wp_set_object_terms((int) $product->ID, $matchedTermIds, $attributeTaxonomy, false);

    if (!$matchedTermIds) {
        $attributes = get_post_meta((int) $product->ID, '_product_attributes', true);
        if (is_array($attributes) && isset($attributes[$attributeTaxonomy])) {
            unset($attributes[$attributeTaxonomy]);
            update_post_meta((int) $product->ID, '_product_attributes', $attributes);
        }
        $matchedProducts[] = [
            'id' => (int) $product->ID,
            'title' => get_the_title($product),
            'colors' => [],
        ];
        continue;
    }

    $coloredProductCount++;
    $attributes = get_post_meta((int) $product->ID, '_product_attributes', true);
    if (!is_array($attributes)) {
        $attributes = [];
    }
    $attributes[$attributeTaxonomy] = [
        'name' => $attributeTaxonomy,
        'value' => '',
        'position' => isset($attributes[$attributeTaxonomy]['position']) ? (int) $attributes[$attributeTaxonomy]['position'] : count($attributes),
        'is_visible' => 1,
        'is_variation' => 0,
        'is_taxonomy' => 1,
    ];
    update_post_meta((int) $product->ID, '_product_attributes', $attributes);

    $matchedProducts[] = [
        'id' => (int) $product->ID,
        'title' => get_the_title($product),
        'colors' => $matchedSlugs,
    ];
}

if ($primaryMenuId === 0) {
    fwrite(STDERR, "Primary menu not found.\n");
    exit(1);
}

$mauAoParent = x24_find_menu_item($primaryMenuId, 'Mẫu áo');
$parentId = $mauAoParent ? (int) $mauAoParent->ID : 0;
$colorParent = x24_find_menu_item($primaryMenuId, 'Áo Theo Màu', $parentId);
if (!$colorParent) {
    $colorParentId = wp_update_nav_menu_item($primaryMenuId, 0, [
        'menu-item-title' => 'Áo Theo Màu',
        'menu-item-url' => '#',
        'menu-item-status' => 'publish',
        'menu-item-parent-id' => $parentId,
    ]);
    if (is_wp_error($colorParentId)) {
        fwrite(STDERR, $colorParentId->get_error_message() . "\n");
        exit(1);
    }
    $colorParentId = (int) $colorParentId;
} else {
    $colorParentId = (int) $colorParent->ID;
    wp_update_nav_menu_item($primaryMenuId, $colorParentId, [
        'menu-item-title' => 'Áo Theo Màu',
        'menu-item-url' => '#',
        'menu-item-status' => 'publish',
        'menu-item-parent-id' => $parentId,
    ]);
}

foreach ($colors as $index => $color) {
    $term = get_term($termIdsBySlug[$color['slug']], $attributeTaxonomy);
    $url = get_term_link($term, $attributeTaxonomy);
    if (is_wp_error($url)) {
        continue;
    }
    $existing = x24_find_menu_item($primaryMenuId, $color['menu'], $colorParentId);
    $args = [
        'menu-item-title' => $color['menu'],
        'menu-item-url' => $url,
        'menu-item-status' => 'publish',
        'menu-item-parent-id' => $colorParentId,
        'menu-item-position' => $index + 1,
    ];
    if ($existing) {
        wp_update_nav_menu_item($primaryMenuId, (int) $existing->ID, $args);
    } else {
        $created = wp_update_nav_menu_item($primaryMenuId, 0, $args);
        if (is_wp_error($created)) {
            fwrite(STDERR, $created->get_error_message() . "\n");
            exit(1);
        }
    }
}

flush_rewrite_rules(false);
wc_delete_product_transients();
clean_taxonomy_cache($attributeTaxonomy);

$afterTerms = get_terms(['taxonomy' => $attributeTaxonomy, 'hide_empty' => false]);
$menuAfter = wp_get_nav_menu_items($primaryMenuId, ['post_status' => 'publish']);

$termUrls = [];
foreach ($colors as $color) {
    $term = get_term($termIdsBySlug[$color['slug']], $attributeTaxonomy);
    $url = get_term_link($term, $attributeTaxonomy);
    $termUrls[$color['slug']] = [
        'name' => $term instanceof WP_Term ? $term->name : $color['name'],
        'url' => is_wp_error($url) ? null : $url,
        'count' => $term instanceof WP_Term ? (int) $term->count : null,
    ];
}

file_put_contents(
    $backupDir . '/after.json',
    wp_json_encode([
        'attribute_id' => $attributeId,
        'attribute_taxonomy' => $attributeTaxonomy,
        'terms' => is_wp_error($afterTerms) ? [] : array_map(fn (WP_Term $term): array => [
            'id' => (int) $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug,
            'count' => (int) $term->count,
        ], $afterTerms),
        'term_urls' => $termUrls,
        'matched_product_count' => $coloredProductCount,
        'counts_by_color' => $counts,
        'matched_products' => $matchedProducts,
        'primary_menu_id' => $primaryMenuId,
        'primary_menu_name' => $primaryMenu ? $primaryMenu->name : null,
        'menu_items' => array_map(fn (WP_Post $item): array => [
            'ID' => (int) $item->ID,
            'title' => $item->title,
            'url' => $item->url,
            'menu_item_parent' => (int) $item->menu_item_parent,
            'object' => $item->object,
            'object_id' => (int) $item->object_id,
            'type' => $item->type,
        ], $menuAfter ?: []),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

echo wp_json_encode([
    'status' => 'applied',
    'attribute_id' => $attributeId,
    'taxonomy' => $attributeTaxonomy,
    'matched_product_count' => $coloredProductCount,
    'counts_by_color' => $counts,
    'term_urls' => $termUrls,
    'primary_menu_id' => $primaryMenuId,
    'color_menu_parent_id' => $colorParentId,
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
