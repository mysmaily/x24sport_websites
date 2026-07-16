<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/root/websites/sites/mayaobongro.vn';
$configPath = $argv[2] ?? '';
$elementaryImagePath = $argv[3] ?? '';
$highSchoolImagePath = $argv[4] ?? '';
$backupPath = $argv[5] ?? '';

if ($configPath === '' || !is_readable($configPath)) {
    throw new RuntimeException("Config JSON is missing or unreadable: {$configPath}");
}

$config = json_decode((string) file_get_contents($configPath), true);
if (!is_array($config)) {
    throw new RuntimeException("Could not parse config JSON: {$configPath}");
}

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

global $wpdb;

function mbro_required_category_id(string $slug): int
{
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term || is_wp_error($term)) {
        throw new RuntimeException("Missing product category: {$slug}");
    }
    return (int) $term->term_id;
}

function mbro_backup_product(int $productId): array
{
    global $wpdb;

    return [
        'captured_at' => current_time('c'),
        'site_url' => site_url('/'),
        'product_id' => $productId,
        'records' => [
            'posts' => $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $productId),
                ARRAY_A
            ),
            'postmeta' => $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$wpdb->postmeta} WHERE post_id = %d ORDER BY meta_id", $productId),
                ARRAY_A
            ),
            'term_relationships' => $wpdb->get_results(
                $wpdb->prepare("SELECT * FROM {$wpdb->term_relationships} WHERE object_id = %d", $productId),
                ARRAY_A
            ),
        ],
    ];
}

function mbro_ensure_media(string $path, string $assetKey, array $media): int
{
    $existing = get_posts([
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'posts_per_page' => 1,
        'fields' => 'ids',
        'meta_query' => [[
            'key' => '_mayaobongro_generated_asset_key',
            'value' => $assetKey,
        ]],
    ]);
    if ($existing) {
        $attachmentId = (int) $existing[0];
        wp_update_post([
            'ID' => $attachmentId,
            'post_title' => (string) $media['title'],
            'post_excerpt' => (string) $media['caption'],
        ]);
        update_post_meta($attachmentId, '_wp_attachment_image_alt', (string) $media['alt']);
        return $attachmentId;
    }

    if (!is_file($path) || !is_readable($path)) {
        throw new RuntimeException("Generated image is missing or unreadable: {$path}");
    }

    $tmpPath = wp_tempnam(basename($path));
    if (!is_string($tmpPath) || !copy($path, $tmpPath)) {
        throw new RuntimeException("Could not create sideload temp file for {$path}");
    }

    $file = [
        'name' => basename($path),
        'tmp_name' => $tmpPath,
    ];
    $attachmentId = media_handle_sideload($file, 0, (string) $media['title']);
    if (is_wp_error($attachmentId)) {
        @unlink($tmpPath);
        throw new RuntimeException($attachmentId->get_error_message());
    }

    wp_update_post([
        'ID' => $attachmentId,
        'post_title' => (string) $media['title'],
        'post_excerpt' => (string) $media['caption'],
    ]);
    update_post_meta((int) $attachmentId, '_wp_attachment_image_alt', (string) $media['alt']);
    update_post_meta((int) $attachmentId, '_mayaobongro_generated_asset_key', $assetKey);

    return (int) $attachmentId;
}

$productId = (int) $config['product_id'];
$product = wc_get_product($productId);
if (!$product instanceof WC_Product) {
    throw new RuntimeException("Product not found: {$productId}");
}

$backup = mbro_backup_product($productId);
$backupJson = wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE);
if (!is_string($backupJson)) {
    throw new RuntimeException('Could not encode backup JSON.');
}
if ($backupPath !== '' && file_put_contents($backupPath, $backupJson . PHP_EOL) === false) {
    throw new RuntimeException("Could not write backup: {$backupPath}");
}

$oldSlug = get_post_field('post_name', $productId);

$elementaryMediaId = mbro_ensure_media(
    $elementaryImagePath,
    (string) $config['media']['elementary']['asset_key'],
    $config['media']['elementary']
);
$highSchoolMediaId = mbro_ensure_media(
    $highSchoolImagePath,
    (string) $config['media']['high_school']['asset_key'],
    $config['media']['high_school']
);

$description = (string) $config['description'];
$description = str_replace(
    ['[TB_ELEMENTARY_URL]', '[TB_THPT_URL]'],
    [wp_get_attachment_url($elementaryMediaId), wp_get_attachment_url($highSchoolMediaId)],
    $description
);

$product->set_name((string) $config['title']);
$product->set_slug((string) $config['slug']);
$product->set_sku((string) $config['sku']);
$product->set_short_description((string) $config['excerpt']);
$product->set_description($description);
$product->set_image_id($highSchoolMediaId);
$product->set_gallery_image_ids([$elementaryMediaId]);
$product->set_category_ids(array_map('mbro_required_category_id', $config['category_slugs']));
$product->set_status('publish');
$product->set_catalog_visibility('visible');
$savedProductId = $product->save();

wp_set_object_terms($savedProductId, $config['tags'], 'product_tag');

if ($oldSlug && $oldSlug !== (string) $config['slug']) {
    $oldSlugs = get_post_meta($savedProductId, '_wp_old_slug', false);
    if (!in_array($oldSlug, $oldSlugs, true)) {
        add_post_meta($savedProductId, '_wp_old_slug', $oldSlug, false);
    }
}

update_post_meta($savedProductId, '_mayaobongro_edition_group', (string) $config['edition_group']);
update_post_meta($savedProductId, '_mayaobongro_age_gallery_model', 'single-product');
update_post_meta($savedProductId, '_mayaobongro_age_image_tieu_hoc_id', $elementaryMediaId);
update_post_meta($savedProductId, '_mayaobongro_age_image_thpt_id', $highSchoolMediaId);
update_post_meta($savedProductId, '_mayaobongro_age_keywords', (string) $config['age_keywords']);
update_post_meta($savedProductId, '_yoast_wpseo_focuskw', (string) $config['yoast_focuskw']);
update_post_meta($savedProductId, '_yoast_wpseo_metadesc', (string) $config['yoast_metadesc']);

clean_post_cache($savedProductId);
wc_delete_product_transients($savedProductId);
clean_post_cache($elementaryMediaId);
clean_post_cache($highSchoolMediaId);

$freshProduct = wc_get_product($savedProductId);
$result = [
    'product_id' => $savedProductId,
    'old_slug' => $oldSlug,
    'new_slug' => get_post_field('post_name', $savedProductId),
    'sku' => $freshProduct ? $freshProduct->get_sku() : '',
    'url' => get_permalink($savedProductId),
    'featured_media_id' => $freshProduct ? (int) $freshProduct->get_image_id() : 0,
    'gallery_media_ids' => $freshProduct ? $freshProduct->get_gallery_image_ids() : [],
    'elementary_media_id' => $elementaryMediaId,
    'high_school_media_id' => $highSchoolMediaId,
    'category_ids' => $freshProduct ? $freshProduct->get_category_ids() : [],
    'backup_path' => $backupPath,
    'meta' => [
        '_mayaobongro_edition_group' => get_post_meta($savedProductId, '_mayaobongro_edition_group', true),
        '_mayaobongro_age_gallery_model' => get_post_meta($savedProductId, '_mayaobongro_age_gallery_model', true),
        '_mayaobongro_age_image_tieu_hoc_id' => (int) get_post_meta($savedProductId, '_mayaobongro_age_image_tieu_hoc_id', true),
        '_mayaobongro_age_image_thpt_id' => (int) get_post_meta($savedProductId, '_mayaobongro_age_image_thpt_id', true),
    ],
];

echo wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
