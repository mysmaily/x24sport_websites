<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaochaybo.vn';
$batchRoot = $argv[2] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/product-color-menu-20260712';

require rtrim($siteRoot, '/') . '/wp-load.php';

if (!function_exists('wc_get_attribute_taxonomies')) {
    fwrite(STDERR, "WooCommerce functions are not available.\n");
    exit(1);
}

if (!wp_mkdir_p($batchRoot)) {
    fwrite(STDERR, "Unable to create batch directory: {$batchRoot}\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-product-color-menu';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$colors = [
    ['name' => 'Áo màu đen', 'slug' => 'den', 'menu' => 'Áo màu đen', 'patterns' => ['đen', 'den', 'black'], 'anti_patterns' => ['đen đá'], 'ball' => ['#111111', 'rgba(255,255,255,.32)']],
    ['name' => 'Áo màu trắng', 'slug' => 'trang', 'menu' => 'Áo màu trắng', 'patterns' => ['trắng', 'trang', 'white'], 'anti_patterns' => [], 'ball' => ['#ffffff', 'rgba(30,30,30,.28)']],
    ['name' => 'Áo màu xanh', 'slug' => 'xanh', 'menu' => 'Áo màu xanh', 'patterns' => ['xanh', 'blue', 'navy'], 'anti_patterns' => [], 'ball' => ['#1278d8', 'rgba(2,23,51,.44)']],
    ['name' => 'Áo màu đỏ', 'slug' => 'do', 'menu' => 'Áo màu đỏ', 'patterns' => ['đỏ', 'red', 'do-cam', 'do-gradient', 'do-phoi', 'phoi-do', 'mau-do'], 'anti_patterns' => [], 'ball' => ['#e21b2d', 'rgba(72,0,8,.42)']],
    ['name' => 'Áo màu vàng', 'slug' => 'vang', 'menu' => 'Áo màu vàng', 'patterns' => ['vàng', 'vang', 'yellow'], 'anti_patterns' => ['sao-vang'], 'ball' => ['#f7c62f', 'rgba(105,63,0,.42)']],
    ['name' => 'Áo màu cam', 'slug' => 'cam', 'menu' => 'Áo màu cam', 'patterns' => ['cam', 'orange'], 'anti_patterns' => [], 'ball' => ['#f27a1a', 'rgba(82,35,0,.44)']],
    ['name' => 'Áo màu hồng', 'slug' => 'hong', 'menu' => 'Áo màu hồng', 'patterns' => ['hồng', 'hong', 'pink'], 'anti_patterns' => [], 'ball' => ['#f05f9d', 'rgba(92,13,48,.4)']],
    ['name' => 'Áo màu tím', 'slug' => 'tim', 'menu' => 'Áo màu tím', 'patterns' => ['tím', 'tim', 'purple', 'violet'], 'anti_patterns' => [], 'ball' => ['#7a4fd3', 'rgba(30,10,78,.42)']],
    ['name' => 'Áo gradient', 'slug' => 'gradient', 'menu' => 'Áo gradient', 'patterns' => ['gradient', 'ombre', 'chuyển sắc', 'chuyen sac', 'chuyển màu', 'chuyen mau'], 'anti_patterns' => [], 'ball' => ['gradient', 'rgba(12,12,12,.42)']],
];

function x24_normalize_text(string $text): string
{
    $text = html_entity_decode(wp_strip_all_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = mb_strtolower($text);
    $text = strtr($text, [
        'á' => 'a', 'à' => 'a', 'ả' => 'a', 'ã' => 'a', 'ạ' => 'a', 'ă' => 'a', 'ắ' => 'a', 'ằ' => 'a', 'ẳ' => 'a', 'ẵ' => 'a', 'ặ' => 'a', 'â' => 'a', 'ấ' => 'a', 'ầ' => 'a', 'ẩ' => 'a', 'ẫ' => 'a', 'ậ' => 'a',
        'é' => 'e', 'è' => 'e', 'ẻ' => 'e', 'ẽ' => 'e', 'ẹ' => 'e', 'ê' => 'e', 'ế' => 'e', 'ề' => 'e', 'ể' => 'e', 'ễ' => 'e', 'ệ' => 'e',
        'í' => 'i', 'ì' => 'i', 'ỉ' => 'i', 'ĩ' => 'i', 'ị' => 'i',
        'ó' => 'o', 'ò' => 'o', 'ỏ' => 'o', 'õ' => 'o', 'ọ' => 'o', 'ô' => 'o', 'ố' => 'o', 'ồ' => 'o', 'ổ' => 'o', 'ỗ' => 'o', 'ộ' => 'o', 'ơ' => 'o', 'ớ' => 'o', 'ờ' => 'o', 'ở' => 'o', 'ỡ' => 'o', 'ợ' => 'o',
        'ú' => 'u', 'ù' => 'u', 'ủ' => 'u', 'ũ' => 'u', 'ụ' => 'u', 'ư' => 'u', 'ứ' => 'u', 'ừ' => 'u', 'ử' => 'u', 'ữ' => 'u', 'ự' => 'u',
        'ý' => 'y', 'ỳ' => 'y', 'ỷ' => 'y', 'ỹ' => 'y', 'ỵ' => 'y',
        'đ' => 'd',
    ]);
    $text = preg_replace('/[^a-z0-9]+/u', ' ', $text) ?: $text;
    return ' ' . trim(preg_replace('/\s+/', ' ', $text) ?: $text) . ' ';
}

function x24_raw_search_text(string $text): string
{
    $text = html_entity_decode(wp_strip_all_tags($text), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $text = mb_strtolower($text);
    $text = preg_replace('/[^\p{L}\p{N}\-_]+/u', ' ', $text) ?: $text;
    return ' ' . trim(preg_replace('/\s+/', ' ', $text) ?: $text) . ' ';
}

function x24_text_has_phrase(string $normalizedText, string $phrase): bool
{
    $needle = trim(x24_normalize_text($phrase));
    return $needle !== '' && str_contains($normalizedText, ' ' . $needle . ' ');
}

function x24_text_has_raw_phrase(string $rawText, string $phrase): bool
{
    $needle = trim(x24_raw_search_text($phrase));
    return $needle !== '' && preg_match('/(^|[\s\-_])' . preg_quote($needle, '/') . '($|[\s\-_])/u', $rawText) === 1;
}

function x24_product_search_text(WP_Post $product): array
{
    $pieces = [$product->post_title, $product->post_name, $product->post_excerpt];
    $terms = wp_get_post_terms($product->ID, ['product_tag', 'product_cat'], ['fields' => 'all']);
    if (!is_wp_error($terms)) {
        foreach ($terms as $term) {
            $pieces[] = $term->name;
            $pieces[] = $term->slug;
        }
    }
    foreach (['_sku', '_yoast_wpseo_title'] as $metaKey) {
        $value = get_post_meta($product->ID, $metaKey, true);
        if (is_scalar($value)) {
            $pieces[] = (string) $value;
        }
    }
    $raw = implode(' ', array_filter($pieces));
    return ['raw' => x24_raw_search_text($raw), 'normalized' => x24_normalize_text($raw)];
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
    foreach (wp_get_nav_menu_items($menuId, ['post_status' => 'publish']) ?: [] as $item) {
        if ((int) $item->menu_item_parent === $parentId && trim($item->title) === $title) {
            return $item;
        }
    }
    return null;
}

function x24_get_primary_menu_id(): int
{
    $locations = get_nav_menu_locations();
    if (isset($locations['primary'])) {
        return (int) $locations['primary'];
    }
    $main = wp_get_nav_menu_object('Main');
    return $main ? (int) $main->term_id : 0;
}

$attributeTaxonomy = 'pa_mau-sac';
$attributeId = 0;
foreach (wc_get_attribute_taxonomies() as $attribute) {
    if ($attribute->attribute_name === 'mau-sac') {
        $attributeId = (int) $attribute->attribute_id;
        wc_update_attribute($attributeId, [
            'name' => 'Màu sắc',
            'slug' => 'mau-sac',
            'type' => $attribute->attribute_type ?: 'select',
            'order_by' => $attribute->attribute_orderby ?: 'menu_order',
            'has_archives' => true,
        ]);
        delete_transient('wc_attribute_taxonomies');
        break;
    }
}

if ($attributeId === 0) {
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

register_taxonomy($attributeTaxonomy, ['product'], [
    'hierarchical' => false,
    'show_ui' => true,
    'query_var' => true,
    'rewrite' => ['slug' => 'mau-sac'],
]);

$primaryMenuId = x24_get_primary_menu_id();
if ($primaryMenuId === 0) {
    fwrite(STDERR, "Primary/Main menu not found.\n");
    exit(1);
}

$primaryMenu = wp_get_nav_menu_object($primaryMenuId);
$beforeTerms = get_terms(['taxonomy' => $attributeTaxonomy, 'hide_empty' => false]);
$beforeProducts = get_posts(['post_type' => 'product', 'post_status' => 'publish', 'fields' => 'ids', 'posts_per_page' => -1]);
$beforeAssignments = [];
foreach ($beforeProducts as $productId) {
    $terms = wp_get_post_terms((int) $productId, $attributeTaxonomy, ['fields' => 'slugs']);
    $attrs = get_post_meta((int) $productId, '_product_attributes', true);
    if ((!is_wp_error($terms) && $terms) || $attrs) {
        $beforeAssignments[(int) $productId] = ['terms' => is_wp_error($terms) ? [] : $terms, '_product_attributes' => $attrs];
    }
}

$menuBefore = wp_get_nav_menu_items($primaryMenuId, ['post_status' => 'publish']);
file_put_contents($backupDir . '/before.json', wp_json_encode([
    'attribute_id' => $attributeId,
    'terms' => is_wp_error($beforeTerms) ? [] : array_map(fn (WP_Term $term): array => ['id' => (int) $term->term_id, 'name' => $term->name, 'slug' => $term->slug, 'count' => (int) $term->count], $beforeTerms),
    'assignments_and_product_attributes' => $beforeAssignments,
    'primary_menu_id' => $primaryMenuId,
    'primary_menu_name' => $primaryMenu ? $primaryMenu->name : null,
    'menu_items' => array_map(fn (WP_Post $item): array => ['ID' => (int) $item->ID, 'title' => $item->title, 'url' => $item->url, 'menu_item_parent' => (int) $item->menu_item_parent], $menuBefore ?: []),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

$termIdsBySlug = [];
foreach ($colors as $index => $color) {
    $term = get_term_by('slug', $color['slug'], $attributeTaxonomy);
    if (!$term) {
        $created = wp_insert_term($color['name'], $attributeTaxonomy, [
            'slug' => $color['slug'],
            'description' => 'Các mẫu áo chạy bộ theo màu tại Mayaochaybo.vn.',
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

$products = get_posts(['post_type' => 'product', 'post_status' => 'publish', 'posts_per_page' => -1]);
$matchedProducts = [];
$coloredProductCount = 0;
$counts = array_fill_keys(array_column($colors, 'slug'), 0);
foreach ($products as $product) {
    $texts = x24_product_search_text($product);
    $matchedTermIds = [];
    $matchedSlugs = [];
    foreach ($colors as $color) {
        if (x24_color_matches_product($texts, $color)) {
            $matchedTermIds[] = $termIdsBySlug[$color['slug']];
            $matchedSlugs[] = $color['slug'];
            $counts[$color['slug']]++;
        }
    }

    wp_set_object_terms((int) $product->ID, $matchedTermIds, $attributeTaxonomy, false);
    $attributes = get_post_meta((int) $product->ID, '_product_attributes', true);

    if (!$matchedTermIds) {
        if (is_array($attributes) && isset($attributes[$attributeTaxonomy])) {
            unset($attributes[$attributeTaxonomy]);
            update_post_meta((int) $product->ID, '_product_attributes', $attributes);
        }
    } else {
        $coloredProductCount++;
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
    }

    $matchedProducts[] = ['id' => (int) $product->ID, 'title' => get_the_title($product), 'colors' => $matchedSlugs];
}

$productParent = x24_find_menu_item($primaryMenuId, 'Sản Phẩm') ?: x24_find_menu_item($primaryMenuId, 'Sản phẩm');
$parentId = $productParent ? (int) $productParent->ID : 0;
$colorParent = x24_find_menu_item($primaryMenuId, 'Áo Theo Màu', $parentId);
$colorParentArgs = [
    'menu-item-title' => 'Áo Theo Màu',
    'menu-item-url' => '#',
    'menu-item-status' => 'publish',
    'menu-item-parent-id' => $parentId,
];
$colorParentId = $colorParent ? (int) $colorParent->ID : 0;
$updatedParent = wp_update_nav_menu_item($primaryMenuId, $colorParentId, $colorParentArgs);
if (is_wp_error($updatedParent)) {
    fwrite(STDERR, $updatedParent->get_error_message() . "\n");
    exit(1);
}
$colorParentId = (int) $updatedParent;

$colorMenuItemIds = [];
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
    $itemId = wp_update_nav_menu_item($primaryMenuId, $existing ? (int) $existing->ID : 0, $args);
    if (is_wp_error($itemId)) {
        fwrite(STDERR, $itemId->get_error_message() . "\n");
        exit(1);
    }
    $colorMenuItemIds[$color['slug']] = (int) $itemId;
}

$muPluginsDir = rtrim(WPMU_PLUGIN_DIR, '/');
if (!is_dir($muPluginsDir) && !wp_mkdir_p($muPluginsDir)) {
    fwrite(STDERR, "Unable to create mu-plugins directory: {$muPluginsDir}\n");
    exit(1);
}

$cleanupPluginPath = $muPluginsDir . '/x24-color-attribute-archive-cleanup.php';
if (is_file($cleanupPluginPath)) {
    copy($cleanupPluginPath, $backupDir . '/x24-color-attribute-archive-cleanup.php.before');
}
$cleanupPlugin = <<<'PHP'
<?php
/**
 * Plugin Name: X24 Color Attribute Archive Cleanup
 * Description: Cleans titles for Mayaochaybo.vn color attribute product archives.
 */

if (!defined('ABSPATH')) {
    exit;
}

function x24_is_color_attribute_archive(): bool
{
    return is_tax('pa_mau-sac');
}

function x24_current_color_archive_name(): ?string
{
    $term = get_queried_object();
    return $term instanceof WP_Term && $term->taxonomy === 'pa_mau-sac' ? $term->name : null;
}

add_filter('get_the_archive_title', function (string $title): string {
    return x24_is_color_attribute_archive() ? (x24_current_color_archive_name() ?: $title) : $title;
});

add_filter('wpseo_title', function ($title) {
    if (x24_is_color_attribute_archive()) {
        $name = x24_current_color_archive_name();
        return $name ? $name . ' - May Áo Chạy Bộ' : $title;
    }
    return $title;
});

add_filter('wpseo_opengraph_title', function ($title) {
    return x24_is_color_attribute_archive() ? (x24_current_color_archive_name() ?: $title) : $title;
});
PHP;
file_put_contents($cleanupPluginPath, $cleanupPlugin);
file_put_contents($backupDir . '/x24-color-attribute-archive-cleanup.php.after', $cleanupPlugin);

$uiPluginPath = $muPluginsDir . '/x24-color-menu-ui.php';
if (is_file($uiPluginPath)) {
    copy($uiPluginPath, $backupDir . '/x24-color-menu-ui.php.before');
}

$ballCss = '';
foreach ($colors as $color) {
    if (!isset($colorMenuItemIds[$color['slug']])) {
        continue;
    }
    $itemId = $colorMenuItemIds[$color['slug']];
    if ($color['slug'] === 'gradient') {
        $ballCss .= "\n        .header-nav-main #menu-item-{$itemId} > a::before { --ball-line: rgba(12, 12, 12, .42); background-color: #f27a1a; background-image: radial-gradient(circle at 32% 24%, rgba(255,255,255,.62) 0 2px, transparent 3px), linear-gradient(90deg, transparent 45%, var(--ball-line) 46% 54%, transparent 55%), linear-gradient(0deg, transparent 45%, var(--ball-line) 46% 54%, transparent 55%), radial-gradient(ellipse at -18% 50%, transparent 0 48%, var(--ball-line) 50% 56%, transparent 58%), radial-gradient(ellipse at 118% 50%, transparent 0 48%, var(--ball-line) 50% 56%, transparent 58%), linear-gradient(135deg, #e21b2d 0%, #f7c62f 34%, #1278d8 68%, #7a4fd3 100%); background-blend-mode: screen, normal, normal, normal, normal, normal; }\n";
        continue;
    }
    $ballCss .= "\n        .header-nav-main #menu-item-{$itemId} > a { --ball-base: {$color['ball'][0]}; --ball-line: {$color['ball'][1]}; }\n";
}

$uiPlugin = <<<PHP
<?php
/**
 * Plugin Name: X24 Color Menu UI
 * Description: Polishes the desktop product dropdown and color menu on Mayaochaybo.vn.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('wp_head', function (): void {
    ?>
    <style id="x24-color-menu-ui">
      @media (min-width: 850px) {
        .header-nav-main #menu-item-{$parentId} {
          --x24-red: #e51b23;
          --x24-ink: #171717;
          --x24-muted: #6f7378;
          --x24-line: #ececec;
        }

        .header-nav-main #menu-item-{$parentId} > .nav-dropdown {
          width: 620px !important;
          min-width: 620px !important;
          max-width: min(620px, calc(100vw - 32px));
          display: grid !important;
          grid-template-columns: 210px minmax(0, 1fr);
          column-gap: 26px;
          padding: 22px 26px 24px !important;
          border: 0 !important;
          border-top: 3px solid var(--x24-red) !important;
          border-radius: 0 0 8px 8px;
          background: linear-gradient(90deg, rgba(229, 27, 35, .055), transparent 35%), #fff;
          box-shadow: 0 22px 48px rgba(0, 0, 0, .18);
          text-transform: none !important;
        }

        .header-nav-main #menu-item-{$parentId} > .nav-dropdown::before {
          content: "Dòng sản phẩm";
          grid-column: 1;
          display: block;
          margin: 0 0 10px;
          color: var(--x24-ink);
          font-size: 12px;
          font-weight: 800;
          line-height: 1.2;
          letter-spacing: .08em;
          text-transform: uppercase;
        }

        .header-nav-main #menu-item-{$parentId} > .nav-dropdown > li {
          grid-column: 1;
          width: auto !important;
          min-width: 0 !important;
          border: 0 !important;
          margin: 0 !important;
        }

        .header-nav-main #menu-item-{$parentId} > .nav-dropdown > li > a {
          display: flex !important;
          align-items: center;
          min-height: 34px;
          padding: 8px 10px !important;
          border-radius: 6px;
          border-bottom: 0 !important;
          color: var(--x24-muted) !important;
          font-size: 13px !important;
          font-weight: 700 !important;
          line-height: 1.25 !important;
          letter-spacing: 0 !important;
          text-transform: none !important;
          transition: color .18s ease, background-color .18s ease, transform .18s ease;
        }

        .header-nav-main #menu-item-{$parentId} > .nav-dropdown > li:not(#menu-item-{$colorParentId}) > a::before {
          content: "";
          width: 4px;
          height: 4px;
          margin-right: 9px;
          border-radius: 999px;
          background: #c6c8cc;
          transition: background-color .18s ease, transform .18s ease;
          flex: 0 0 auto;
        }

        .header-nav-main #menu-item-{$parentId} > .nav-dropdown > li:not(#menu-item-{$colorParentId}) > a:hover {
          color: var(--x24-ink) !important;
          background: #f5f5f5;
          transform: translateX(2px);
        }

        .header-nav-main #menu-item-{$parentId} > .nav-dropdown > li:not(#menu-item-{$colorParentId}) > a:hover::before {
          background: var(--x24-red);
          transform: scale(1.35);
        }

        .header-nav-main #menu-item-{$colorParentId} {
          grid-column: 2 !important;
          grid-row: 1 / span 8;
          align-self: stretch;
          padding-left: 26px !important;
          border-left: 1px solid var(--x24-line) !important;
        }

        .header-nav-main #menu-item-{$colorParentId} > a {
          min-height: 0 !important;
          margin: 0 0 12px !important;
          padding: 0 0 12px !important;
          border-bottom: 1px solid var(--x24-line) !important;
          border-radius: 0 !important;
          color: var(--x24-ink) !important;
          font-size: 15px !important;
          font-weight: 900 !important;
          line-height: 1.2 !important;
          letter-spacing: .02em !important;
          text-transform: uppercase !important;
          pointer-events: none;
        }

        .header-nav-main #menu-item-{$colorParentId} > a::before {
          content: "";
          width: 8px;
          height: 8px;
          margin-right: 9px;
          border-radius: 999px;
          background: var(--x24-red);
          box-shadow: 0 0 0 4px rgba(229, 27, 35, .12);
          flex: 0 0 auto;
        }

        .header-nav-main #menu-item-{$colorParentId} > .sub-menu {
          position: static !important;
          display: grid !important;
          grid-template-columns: repeat(2, minmax(0, 1fr));
          gap: 8px;
          width: auto !important;
          min-width: 0 !important;
          padding: 0 !important;
          margin: 0 !important;
          border: 0 !important;
          box-shadow: none !important;
          background: transparent !important;
        }

        .header-nav-main #menu-item-{$colorParentId} > .sub-menu > li {
          width: auto !important;
          min-width: 0 !important;
          margin: 0 !important;
          border: 0 !important;
        }

        .header-nav-main #menu-item-{$colorParentId} > .sub-menu > li > a {
          position: relative;
          display: flex !important;
          align-items: center;
          min-height: 38px;
          padding: 9px 10px 9px 34px !important;
          border: 1px solid #e9e9e9 !important;
          border-radius: 7px;
          background: rgba(248, 248, 248, .9);
          color: #3d3f43 !important;
          font-size: 12px !important;
          font-weight: 800 !important;
          line-height: 1.15 !important;
          letter-spacing: 0 !important;
          text-transform: none !important;
          white-space: normal;
          transition: border-color .18s ease, box-shadow .18s ease, transform .18s ease, color .18s ease, background-color .18s ease;
        }

        .header-nav-main #menu-item-{$colorParentId} > .sub-menu > li > a::before {
          content: "";
          position: absolute;
          left: 10px;
          top: 50%;
          width: 16px;
          height: 16px;
          border-radius: 999px;
          transform: translateY(-50%);
          border: 1px solid rgba(0, 0, 0, .18);
          background-color: var(--ball-base, #d66a22);
          background-image: radial-gradient(circle at 32% 24%, rgba(255,255,255,.55) 0 2px, transparent 3px), linear-gradient(90deg, transparent 45%, var(--ball-line, rgba(20,20,20,.42)) 46% 54%, transparent 55%), linear-gradient(0deg, transparent 45%, var(--ball-line, rgba(20,20,20,.42)) 46% 54%, transparent 55%), radial-gradient(ellipse at -18% 50%, transparent 0 48%, var(--ball-line, rgba(20,20,20,.42)) 50% 56%, transparent 58%), radial-gradient(ellipse at 118% 50%, transparent 0 48%, var(--ball-line, rgba(20,20,20,.42)) 50% 56%, transparent 58%);
          background-blend-mode: screen, normal, normal, normal, normal;
          box-shadow: inset -2px -3px 4px rgba(0,0,0,.18), inset 2px 2px 3px rgba(255,255,255,.28), 0 1px 2px rgba(0,0,0,.12);
        }

        .header-nav-main #menu-item-{$colorParentId} > .sub-menu > li > a:hover {
          color: var(--x24-ink) !important;
          border-color: rgba(229, 27, 35, .35) !important;
          background: #fff;
          box-shadow: 0 10px 18px rgba(0, 0, 0, .08);
          transform: translateY(-1px);
        }
{$ballCss}
      }
    </style>
    <?php
}, 25);
PHP;
file_put_contents($uiPluginPath, $uiPlugin);
file_put_contents($backupDir . '/x24-color-menu-ui.php.after', $uiPlugin);

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

file_put_contents($backupDir . '/after.json', wp_json_encode([
    'attribute_id' => $attributeId,
    'taxonomy' => $attributeTaxonomy,
    'terms' => is_wp_error($afterTerms) ? [] : array_map(fn (WP_Term $term): array => ['id' => (int) $term->term_id, 'name' => $term->name, 'slug' => $term->slug, 'count' => (int) $term->count], $afterTerms),
    'term_urls' => $termUrls,
    'matched_product_count' => $coloredProductCount,
    'counts_by_color' => $counts,
    'matched_products' => $matchedProducts,
    'primary_menu_id' => $primaryMenuId,
    'primary_menu_name' => $primaryMenu ? $primaryMenu->name : null,
    'product_parent_id' => $parentId,
    'color_menu_parent_id' => $colorParentId,
    'color_menu_item_ids' => $colorMenuItemIds,
    'menu_items' => array_map(fn (WP_Post $item): array => ['ID' => (int) $item->ID, 'title' => $item->title, 'url' => $item->url, 'menu_item_parent' => (int) $item->menu_item_parent], $menuAfter ?: []),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE));

echo wp_json_encode([
    'status' => 'applied',
    'attribute_id' => $attributeId,
    'taxonomy' => $attributeTaxonomy,
    'matched_product_count' => $coloredProductCount,
    'counts_by_color' => $counts,
    'term_urls' => $termUrls,
    'primary_menu_id' => $primaryMenuId,
    'product_parent_id' => $parentId,
    'color_menu_parent_id' => $colorParentId,
    'color_menu_item_ids' => $colorMenuItemIds,
    'plugins' => [$cleanupPluginPath, $uiPluginPath],
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
