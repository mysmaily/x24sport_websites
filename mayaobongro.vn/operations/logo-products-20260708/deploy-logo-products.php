<?php

declare(strict_types=1);

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? $siteRoot . '/wp-content/uploads/codex-ops/logo-products-20260708';

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$manifestPath = rtrim($batchRoot, '/') . '/manifest.json';
if (!is_file($manifestPath)) {
    fwrite(STDERR, "Missing manifest: {$manifestPath}\n");
    exit(1);
}

$items = json_decode((string) file_get_contents($manifestPath), true);
if (!is_array($items) || $items === []) {
    fwrite(STDERR, "Manifest is empty or invalid.\n");
    exit(1);
}

$category = get_term_by('slug', 'logo-doi-bong-ro', 'product_cat');
if (!$category instanceof WP_Term) {
    fwrite(STDERR, "Missing product category logo-doi-bong-ro.\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His');
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$existingProducts = get_posts([
    'post_type' => 'product',
    'posts_per_page' => -1,
    'post_status' => ['publish', 'draft', 'pending', 'private'],
    'tax_query' => [[
        'taxonomy' => 'product_cat',
        'field' => 'term_id',
        'terms' => [$category->term_id],
    ]],
]);

$backupPayload = [
    'captured_at' => gmdate('c'),
    'category' => [
        'term_id' => $category->term_id,
        'name' => $category->name,
        'slug' => $category->slug,
    ],
    'existing_count' => count($existingProducts),
    'existing_products' => array_map(static function (WP_Post $post): array {
        return [
            'ID' => $post->ID,
            'post_title' => $post->post_title,
            'post_name' => $post->post_name,
            'post_status' => $post->post_status,
            'price' => get_post_meta($post->ID, '_price', true),
            'regular_price' => get_post_meta($post->ID, '_regular_price', true),
            'thumbnail_id' => get_post_thumbnail_id($post->ID),
        ];
    }, $existingProducts),
];

file_put_contents(
    $backupDir . '/before.json',
    wp_json_encode($backupPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);

function ensure_logo_attachment(string $batchRoot, string $filename, string $title): int
{
    $uploads = wp_upload_dir();
    $assetPath = rtrim($batchRoot, '/') . '/assets/products/' . $filename;
    if (!is_file($assetPath)) {
        throw new RuntimeException('Missing asset: ' . $assetPath);
    }

    $relativePath = trim($uploads['subdir'], '/') . '/' . $filename;
    $absolutePath = trailingslashit($uploads['basedir']) . $filename;

    if (!is_file($absolutePath) && !copy($assetPath, $absolutePath)) {
        throw new RuntimeException('Unable to copy asset into uploads: ' . $absolutePath);
    }

    $existing = get_posts([
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'posts_per_page' => 1,
        'fields' => 'ids',
        'meta_key' => '_wp_attached_file',
        'meta_value' => $relativePath,
    ]);

    if ($existing) {
        $attachmentId = (int) $existing[0];
    } else {
        $mime = wp_check_filetype($filename, null);
        $attachmentId = wp_insert_attachment([
            'post_mime_type' => $mime['type'] ?: 'image/webp',
            'post_title' => $title,
            'post_content' => '',
            'post_status' => 'inherit',
        ], $absolutePath);

        if (is_wp_error($attachmentId) || !$attachmentId) {
            throw new RuntimeException('Failed to create attachment for ' . $filename);
        }
    }

    update_attached_file($attachmentId, $absolutePath);
    update_post_meta($attachmentId, '_wp_attachment_image_alt', $title);

    $metadata = wp_generate_attachment_metadata($attachmentId, $absolutePath);
    if (!empty($metadata)) {
        wp_update_attachment_metadata($attachmentId, $metadata);
    }

    return $attachmentId;
}

$baseTags = [
    'logo-bong-ro',
    'logo-doi-bong-ro',
    'logo-mien-phi',
    'logo-ao-bong-ro',
    'thiet-ke-logo-bong-ro',
];

$created = [];
$updated = [];

foreach ($items as $item) {
    $slug = (string) ($item['slug'] ?? '');
    $title = (string) ($item['title'] ?? '');
    $description = (string) ($item['description'] ?? '');
    $shortDescription = (string) ($item['short_description'] ?? '');
    $filename = (string) ($item['image_file'] ?? '');

    if ($slug === '' || $title === '' || $filename === '') {
        throw new RuntimeException('Manifest item is missing required fields.');
    }

    $attachmentId = ensure_logo_attachment($batchRoot, $filename, $title);
    $existing = get_page_by_path($slug, OBJECT, 'product');

    $postarr = [
        'post_type' => 'product',
        'post_status' => 'publish',
        'post_title' => $title,
        'post_name' => $slug,
        'post_content' => $description,
        'post_excerpt' => $shortDescription,
        'menu_order' => (int) ($item['index'] ?? 0),
    ];

    if ($existing instanceof WP_Post) {
        $postarr['ID'] = $existing->ID;
        $productId = wp_update_post($postarr, true);
        $updated[] = $slug;
    } else {
        $productId = wp_insert_post($postarr, true);
        $created[] = $slug;
    }

    if (is_wp_error($productId) || !$productId) {
        throw new RuntimeException('Unable to save product: ' . $title);
    }

    wp_set_object_terms((int) $productId, [$category->term_id], 'product_cat', false);
    wp_set_object_terms((int) $productId, ['simple'], 'product_type', false);

    $themeTags = array_map(static fn(string $tag): string => str_replace('_', '-', sanitize_title($tag)), (array) ($item['themes'] ?? []));
    $allTags = array_values(array_unique(array_merge($baseTags, $themeTags)));
    wp_set_object_terms((int) $productId, $allTags, 'product_tag', false);

    set_post_thumbnail((int) $productId, $attachmentId);
    delete_post_meta((int) $productId, '_product_image_gallery');

    update_post_meta((int) $productId, '_regular_price', '0');
    update_post_meta((int) $productId, '_sale_price', '');
    update_post_meta((int) $productId, '_price', '0');
    update_post_meta((int) $productId, '_stock_status', 'instock');
    update_post_meta((int) $productId, '_manage_stock', 'no');
    update_post_meta((int) $productId, '_virtual', 'yes');
    update_post_meta((int) $productId, '_downloadable', 'no');
    update_post_meta((int) $productId, '_sold_individually', 'no');
    update_post_meta((int) $productId, '_visibility', 'visible');
    update_post_meta((int) $productId, '_sku', (string) ($item['sku'] ?? ''));
    update_post_meta((int) $productId, '_source_reference_url', (string) ($item['source_url'] ?? ''));
    update_post_meta((int) $productId, '_source_reference_title', (string) ($item['source_title'] ?? ''));

    update_post_meta((int) $productId, '_yoast_wpseo_title', $title . ' | Mayaobongro.vn');
    update_post_meta(
        (int) $productId,
        '_yoast_wpseo_metadesc',
        wp_strip_all_tags($shortDescription) ?: ('Thiết kế logo bóng rổ miễn phí cho mẫu ' . mb_strtolower($title))
    );
}

echo wp_json_encode([
    'category_id' => $category->term_id,
    'backup_dir' => $backupDir,
    'manifest_count' => count($items),
    'created_count' => count($created),
    'updated_count' => count($updated),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
