<?php

declare(strict_types=1);

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? '/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/cleanup-running-residuals-20260708';

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

if (!function_exists('remove_accents')) {
    require_once ABSPATH . 'wp-includes/formatting.php';
}

$timestamp = gmdate('Ymd-His');
$backupRoot = rtrim($batchRoot, '/') . '/backups/' . $timestamp;
wp_mkdir_p($backupRoot);

$attachmentReplacements = [
    1610 => [
        'source' => rtrim($batchRoot, '/') . '/assets/Banner-01-5.jpg',
        'alt' => 'Cầu thủ bóng rổ mặc mẫu áo bóng rổ có tay xanh ngọc tại Mayaobongro.vn',
        'title' => 'Banner-01-5',
    ],
    1632 => [
        'source' => rtrim($batchRoot, '/') . '/assets/Banner-01-8.jpg',
        'alt' => 'Banner áo bóng rổ có tay màu xanh ngọc của Mayaobongro.vn',
        'title' => 'Banner-01-8',
    ],
    2361 => [
        'source' => rtrim($batchRoot, '/') . '/assets/20-ao-chay-bo-mau-xanh.jpg',
        'alt' => 'Tổng hợp các mẫu áo bóng rổ màu xanh đẹp năm 2026',
        'title' => '20-mau-ao-bong-ro-mau-xanh-2026',
    ],
];

$productOverrides = [
    1291 => 'Bộ Quần Áo Bóng Rổ Logo Đội Bóng Rổ Hiện Đại Cam Vàng Năng Động',
    1259 => 'Bộ Quần Áo Bóng Rổ Logo Đội Bóng Rổ Tím Hồng Gradient',
    1253 => 'Bộ Quần Áo Bóng Rổ Logo Đội Bóng Rổ Thiết Kế Màu Đỏ Năng Động',
    1249 => 'Bộ Quần Áo Bóng Rổ Logo Đội Bóng Rổ Đen Trắng Năng Động',
    1247 => 'Bộ Quần Áo Bóng Rổ Logo Đội Bóng Rổ Việt Năng Lượng Sắc Đỏ Cam',
    1219 => 'Bộ Quần Áo Bóng Rổ Logo Đội Bóng Rổ Mạnh Mẽ Tông Đỏ Năng Động',
    1213 => 'Bộ Quần Áo Bóng Rổ Logo Đội Bóng Rổ Đơn Giản Đen Trắng Hiện Đại',
    1209 => 'Bộ Quần Áo Bóng Rổ Logo Đội Bóng Rổ Cá Tính',
    998 => 'Bộ Quần Áo Bóng Rổ Sát Nách LUX Phối Màu Gradient Nổi Bật',
    995 => 'Bộ Quần Áo Bóng Rổ Sát Nách LUX Phối Màu Đỏ Cam',
    965 => 'Bộ Quần Áo Bóng Rổ Cam Năng Động Form Sát Nách',
    925 => 'Bộ Quần Áo Bóng Rổ Sát Nách Xanh Dương Xanh Ngọc Năng Động',
    839 => 'Bộ Quần Áo Bóng Rổ Sát Nách Kem Chuyển Sắc Xanh Thời Trang',
    836 => 'Bộ Quần Áo Bóng Rổ Đỏ Gradient Dáng Sát Nách Thoáng Mát',
    671 => 'Bộ Quần Áo Bóng Rổ Màu Xanh Lá Năng Động Kiểu Dáng Sát Nách Nhẹ Thoáng',
    668 => 'Bộ Quần Áo Bóng Rổ Màu Cam Chuyển Sắc Sát Nách Nổi Bật Năng Động',
];

$result = [
    'timestamp' => $timestamp,
    'backup_root' => $backupRoot,
    'attachments' => [],
    'products' => [],
    'terms_deleted' => [],
    'homepage' => [],
    'old_slug_meta_deleted' => 0,
];

function cleanup_copy_file(string $source, string $destination): void
{
    $dir = dirname($destination);
    if (!is_dir($dir)) {
        wp_mkdir_p($dir);
    }
    if (!copy($source, $destination)) {
        throw new RuntimeException("Failed to copy {$source} -> {$destination}");
    }
}

function cleanup_backup_attachment(int $attachmentId, string $backupRoot): array
{
    $original = get_attached_file($attachmentId);
    if (!$original || !is_file($original)) {
        throw new RuntimeException("Attachment {$attachmentId} file is missing.");
    }

    $meta = wp_get_attachment_metadata($attachmentId);
    $targetDir = $backupRoot . '/attachments/' . $attachmentId;
    wp_mkdir_p($targetDir);

    $copied = [];
    cleanup_copy_file($original, $targetDir . '/' . basename($original));
    $copied[] = basename($original);

    if (!empty($meta['sizes']) && is_array($meta['sizes'])) {
        $baseDir = dirname($original);
        foreach ($meta['sizes'] as $sizeMeta) {
            if (empty($sizeMeta['file'])) {
                continue;
            }
            $sizePath = $baseDir . '/' . $sizeMeta['file'];
            if (is_file($sizePath)) {
                cleanup_copy_file($sizePath, $targetDir . '/' . basename($sizePath));
                $copied[] = basename($sizePath);
            }
        }
    }

    file_put_contents(
        $targetDir . '/meta.json',
        wp_json_encode(
            [
                'attached_file' => get_post_meta($attachmentId, '_wp_attached_file', true),
                'meta' => $meta,
                'title' => get_the_title($attachmentId),
                'alt' => get_post_meta($attachmentId, '_wp_attachment_image_alt', true),
            ],
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        )
    );

    return [
        'original' => $original,
        'copied' => $copied,
    ];
}

function cleanup_replace_attachment_file(int $attachmentId, array $config, string $backupRoot): array
{
    $backupInfo = cleanup_backup_attachment($attachmentId, $backupRoot);
    $targetPath = get_attached_file($attachmentId);
    if (!$targetPath) {
        throw new RuntimeException("Attachment {$attachmentId} has no file path.");
    }
    if (!is_file($config['source'])) {
        throw new RuntimeException("Missing replacement source for attachment {$attachmentId}: {$config['source']}");
    }

    cleanup_copy_file($config['source'], $targetPath);
    clearstatcache(true, $targetPath);

    $metadata = wp_generate_attachment_metadata($attachmentId, $targetPath);
    if (is_wp_error($metadata)) {
        throw new RuntimeException($metadata->get_error_message());
    }
    wp_update_attachment_metadata($attachmentId, $metadata);
    update_post_meta($attachmentId, '_wp_attachment_image_alt', $config['alt']);

    wp_update_post([
        'ID' => $attachmentId,
        'post_title' => $config['title'],
        'post_excerpt' => '',
        'post_content' => '',
    ]);

    clean_post_cache($attachmentId);

    return [
        'attachment_id' => $attachmentId,
        'url' => wp_get_attachment_url($attachmentId),
        'backup' => $backupInfo,
    ];
}

foreach ($attachmentReplacements as $attachmentId => $config) {
    $result['attachments'][] = cleanup_replace_attachment_file($attachmentId, $config, $backupRoot);
}

$homepageId = 75;
$homepage = get_post($homepageId);
if (!$homepage instanceof WP_Post) {
    throw new RuntimeException('Homepage post 75 not found.');
}

file_put_contents(
    $backupRoot . '/homepage-post-75.json',
    wp_json_encode(
        [
            'ID' => $homepage->ID,
            'post_title' => $homepage->post_title,
            'post_content' => $homepage->post_content,
        ],
        JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
    )
);

$homepageContent = $homepage->post_content;
$homepageReplacements = [
    '[tab title="ÁO SINGLET"]' => '[tab title="ÁO SÁT NÁCH"]',
    'ĐẶT LOGO ĐỘI CHẠY' => 'ĐẶT LOGO ĐỘI BÓNG RỔ',
    'https://mayaobongro.vn/logo-doi-chay/' => 'https://mayaobongro.vn/logo-doi-bong-ro/',
    'giúp bạn luôn thoải mái và bứt phá trên mọi cung đường.' => 'giúp bạn luôn thoải mái và bứt phá trên mọi trận đấu.',
];
$updatedHomepageContent = strtr($homepageContent, $homepageReplacements);
if ($updatedHomepageContent !== $homepageContent) {
    $updateResult = wp_update_post([
        'ID' => $homepageId,
        'post_content' => $updatedHomepageContent,
    ], true);
    if (is_wp_error($updateResult)) {
        throw new RuntimeException($updateResult->get_error_message());
    }
}

$result['homepage'] = [
    'updated' => $updatedHomepageContent !== $homepageContent,
];

foreach ($productOverrides as $productId => $newTitle) {
    $post = get_post($productId);
    if (!$post instanceof WP_Post) {
        continue;
    }

    file_put_contents(
        $backupRoot . '/product-' . $productId . '.json',
        wp_json_encode(
            [
                'ID' => $post->ID,
                'post_title' => $post->post_title,
                'post_name' => $post->post_name,
            ],
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        )
    );

    $newSlug = sanitize_title(remove_accents($newTitle));
    $updateResult = wp_update_post([
        'ID' => $productId,
        'post_title' => $newTitle,
        'post_name' => $newSlug,
    ], true);
    if (is_wp_error($updateResult)) {
        throw new RuntimeException($updateResult->get_error_message());
    }

    clean_post_cache($productId);
    if (function_exists('wc_delete_product_transients')) {
        wc_delete_product_transients($productId);
    }

    $result['products'][] = [
        'ID' => $productId,
        'title' => $newTitle,
        'slug' => $newSlug,
    ];
}

$terms = get_terms([
    'taxonomy' => 'product_tag',
    'hide_empty' => false,
    'search' => 'chạy bộ',
]);
if (!is_array($terms)) {
    $terms = [];
}

$moreTerms = get_terms([
    'taxonomy' => 'product_tag',
    'hide_empty' => false,
    'search' => 'singlet',
]);
if (is_array($moreTerms)) {
    $terms = array_merge($terms, $moreTerms);
}

$logoTerms = get_terms([
    'taxonomy' => 'product_tag',
    'hide_empty' => false,
    'search' => 'logo đội chạy',
]);
if (is_array($logoTerms)) {
    $terms = array_merge($terms, $logoTerms);
}

$termMap = [];
foreach ($terms as $term) {
    if (!$term instanceof WP_Term) {
        continue;
    }
    $termMap[$term->term_id] = $term;
}

foreach ($termMap as $term) {
    $slug = strtolower($term->slug);
    $name = mb_strtolower($term->name);
    $matches = str_contains($slug, 'chay-bo')
        || str_contains($slug, 'singlet')
        || str_contains($slug, 'logo-doi-chay')
        || str_contains($name, 'chạy bộ')
        || str_contains($name, 'singlet')
        || str_contains($name, 'logo đội chạy');
    if (!$matches) {
        continue;
    }

    $productIds = get_objects_in_term($term->term_id, 'product_tag');
    file_put_contents(
        $backupRoot . '/term-' . $term->term_id . '.json',
        wp_json_encode(
            [
                'term_id' => $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
                'taxonomy' => $term->taxonomy,
                'object_ids' => $productIds,
            ],
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        )
    );

    $deleteResult = wp_delete_term($term->term_id, 'product_tag');
    if (!is_wp_error($deleteResult)) {
        $result['terms_deleted'][] = [
            'term_id' => $term->term_id,
            'name' => $term->name,
            'slug' => $term->slug,
            'object_count' => is_array($productIds) ? count($productIds) : 0,
        ];
    }
}

global $wpdb;
$result['old_slug_meta_deleted'] = (int) $wpdb->query(
    "DELETE FROM {$wpdb->postmeta}
     WHERE meta_key = '_wp_old_slug'
       AND (
         LOWER(meta_value) LIKE '%ao-chay-bo%'
         OR LOWER(meta_value) LIKE '%aochaybo%'
         OR LOWER(meta_value) LIKE '%logo-doi-chay%'
         OR LOWER(meta_value) LIKE '%singlet%'
       )"
);

clean_post_cache($homepageId);

echo wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
