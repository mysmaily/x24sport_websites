<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/google-image-refresh-20260715';

require rtrim($siteRoot, '/') . '/wp-load.php';

$pageId = 75;
$imageId = 3001;
$targetImageUrl = 'https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/x24-br-107-ao-bong-ro-tieu-hoc.webp';
$targetAlt = 'Mẫu áo bóng rổ X24-BR-107 cho học sinh tiểu học';

$page = get_post($pageId);
$image = get_post($imageId);

if (!$page instanceof WP_Post) {
    throw new RuntimeException("Homepage post {$pageId} not found.");
}

if (!$image instanceof WP_Post || $image->post_type !== 'attachment') {
    throw new RuntimeException("Attachment {$imageId} not found.");
}

$imageUrl = wp_get_attachment_url($imageId);
if ($imageUrl !== $targetImageUrl) {
    throw new RuntimeException("Attachment {$imageId} URL mismatch: {$imageUrl}");
}

$timestamp = gmdate('Ymd-His');
$backupRoot = rtrim($batchRoot, '/') . '/backups/' . $timestamp;
wp_mkdir_p($backupRoot);

$metaKeys = [
    '_thumbnail_id',
    '_yoast_wpseo_opengraph-image',
    '_yoast_wpseo_opengraph-image-id',
    '_yoast_wpseo_twitter-image',
    '_yoast_wpseo_twitter-image-id',
    '_yoast_wpseo_meta-robots-noindex',
    '_yoast_wpseo_canonical',
];

$backup = [
    'captured_at' => gmdate('c'),
    'page' => [
        'ID' => $pageId,
        'post_title' => $page->post_title,
        'post_name' => $page->post_name,
        'post_modified_gmt' => $page->post_modified_gmt,
        'featured_media' => (int) get_post_thumbnail_id($pageId),
        'permalink' => get_permalink($pageId),
        'meta' => [],
    ],
    'image' => [
        'ID' => $imageId,
        'url' => $imageUrl,
        'alt' => get_post_meta($imageId, '_wp_attachment_image_alt', true),
        'metadata' => wp_get_attachment_metadata($imageId),
    ],
    'wpseo_titles' => get_option('wpseo_titles'),
];

foreach ($metaKeys as $metaKey) {
    $backup['page']['meta'][$metaKey] = get_post_meta($pageId, $metaKey, false);
}

file_put_contents(
    $backupRoot . '/homepage-google-image-before.json',
    wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);

set_post_thumbnail($pageId, $imageId);
update_post_meta($pageId, '_yoast_wpseo_opengraph-image', $targetImageUrl);
update_post_meta($pageId, '_yoast_wpseo_opengraph-image-id', (string) $imageId);
update_post_meta($pageId, '_yoast_wpseo_twitter-image', $targetImageUrl);
update_post_meta($pageId, '_yoast_wpseo_twitter-image-id', (string) $imageId);
update_post_meta($imageId, '_wp_attachment_image_alt', $targetAlt);

wp_update_post([
    'ID' => $pageId,
    'post_modified' => current_time('mysql'),
    'post_modified_gmt' => current_time('mysql', true),
]);

clean_post_cache($pageId);
clean_post_cache($imageId);

if (class_exists('WPSEO_Options')) {
    WPSEO_Options::clear_cache();
}

if (class_exists('WPSEO_Sitemaps_Cache')) {
    WPSEO_Sitemaps_Cache::clear();
}

if (class_exists('autoptimizeCache')) {
    autoptimizeCache::clearall();
}

if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
}

echo wp_json_encode([
    'backup_root' => $backupRoot,
    'page_id' => $pageId,
    'featured_media' => (int) get_post_thumbnail_id($pageId),
    'opengraph_image' => get_post_meta($pageId, '_yoast_wpseo_opengraph-image', true),
    'twitter_image' => get_post_meta($pageId, '_yoast_wpseo_twitter-image', true),
    'image_alt' => get_post_meta($imageId, '_wp_attachment_image_alt', true),
    'permalink' => get_permalink($pageId),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), PHP_EOL;
