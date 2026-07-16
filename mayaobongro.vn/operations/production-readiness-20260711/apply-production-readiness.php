<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? '/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/production-readiness-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';

$timestamp = gmdate('Ymd-His');
$backupRoot = rtrim($batchRoot, '/') . '/backups/' . $timestamp;
wp_mkdir_p($backupRoot);

function pr_is_demo_page(WP_Post $post): bool
{
    $protectedPageIds = array_filter([
        (int) get_option('page_on_front'),
        (int) get_option('page_for_posts'),
    ]);
    if (in_array((int) $post->ID, $protectedPageIds, true)) {
        return false;
    }

    if ($post->post_type !== 'page') {
        return false;
    }

    $path = trim((string) get_page_uri($post), '/');
    return $path === 'test'
        || $path === 'trang-mau'
        || $path === 'elements'
        || str_starts_with($path, 'elements/')
        || $path === 'demos'
        || str_starts_with($path, 'demos/');
}

$demoPages = array_values(array_filter(get_posts([
    'post_type' => 'page',
    'post_status' => ['publish', 'draft', 'private'],
    'posts_per_page' => -1,
    'orderby' => 'ID',
    'order' => 'ASC',
]), static fn ($post): bool => $post instanceof WP_Post && pr_is_demo_page($post)));

$backup = [
    'captured_at' => gmdate('c'),
    'options' => [
        'blogname' => get_option('blogname'),
        'blogdescription' => get_option('blogdescription'),
        'wpseo_titles' => get_option('wpseo_titles'),
    ],
    'demo_pages' => array_map(static function (WP_Post $post): array {
        return [
            'ID' => (int) $post->ID,
            'post_title' => $post->post_title,
            'post_name' => $post->post_name,
            'post_status' => $post->post_status,
            'path' => trim((string) get_page_uri($post), '/'),
            'url' => get_permalink($post),
            'yoast_noindex' => get_post_meta((int) $post->ID, '_yoast_wpseo_meta-robots-noindex', true),
            'yoast_canonical' => get_post_meta((int) $post->ID, '_yoast_wpseo_canonical', true),
        ];
    }, $demoPages),
];

file_put_contents(
    $backupRoot . '/production-readiness-before.json',
    wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);

update_option('blogname', 'May Áo Bóng Rổ - VN');
update_option('blogdescription', 'Xưởng may áo bóng rổ thiết kế riêng cho đội nhóm, CLB và giải đấu');

$titles = get_option('wpseo_titles');
if (!is_array($titles)) {
    $titles = [];
}

$titles['website_name'] = 'May Áo Bóng Rổ - VN';
$titles['alternate_website_name'] = 'Mayaobongro.vn';
$titles['company_or_person'] = 'company';
$titles['company_name'] = 'Mayaobongro.vn - Xưởng May Áo Bóng Rổ';
$titles['company_alternate_name'] = 'May Áo Bóng Rổ - VN';
$titles['org-description'] = 'Xưởng may áo bóng rổ trực tiếp, thiết kế riêng miễn phí cho đội nhóm, câu lạc bộ và giải đấu bóng rổ.';
$titles['org-phone'] = '+84989353247';
$titles['org-legal-name'] = 'Mayaobongro.vn';
update_option('wpseo_titles', $titles);

$updatedPages = [];
foreach ($demoPages as $post) {
    update_post_meta((int) $post->ID, '_yoast_wpseo_meta-robots-noindex', '1');
    update_post_meta((int) $post->ID, '_yoast_wpseo_meta-robots-nofollow', '0');
    clean_post_cache((int) $post->ID);
    $updatedPages[] = [
        'ID' => (int) $post->ID,
        'path' => trim((string) get_page_uri($post), '/'),
        'url' => get_permalink($post),
    ];
}

if (class_exists('WPSEO_Options')) {
    WPSEO_Options::clear_cache();
}

if (function_exists('wc_delete_product_transients')) {
    wc_delete_product_transients();
}

if (class_exists('autoptimizeCache')) {
    autoptimizeCache::clearall();
}

echo wp_json_encode([
    'backup_root' => $backupRoot,
    'updated_demo_pages' => count($updatedPages),
    'updated_sample' => array_slice($updatedPages, 0, 20),
    'blogname' => get_option('blogname'),
    'blogdescription' => get_option('blogdescription'),
    'company_name' => get_option('wpseo_titles')['company_name'] ?? null,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), PHP_EOL;
