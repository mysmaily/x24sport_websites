<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$sourceImage = $argv[2] ?? '';
$batchRoot = $argv[3] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/desktop-menu-compact-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

if (!$sourceImage || !is_file($sourceImage)) {
    fwrite(STDERR, "Source image not found: {$sourceImage}\n");
    exit(1);
}

if (!wp_mkdir_p($batchRoot)) {
    fwrite(STDERR, "Unable to create batch directory: {$batchRoot}\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-embed-ordering-image';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$orderingPage = get_page_by_path('dat-may-ao-bong-ro', OBJECT, 'page');
if (!$orderingPage instanceof WP_Post) {
    fwrite(STDERR, "Page not found: dat-may-ao-bong-ro\n");
    exit(1);
}
$orderingPageId = (int) $orderingPage->ID;

file_put_contents(
    $backupDir . '/page-before.json',
    wp_json_encode([
        'id' => $orderingPageId,
        'title' => $orderingPage->post_title,
        'slug' => $orderingPage->post_name,
        'content' => $orderingPage->post_content,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

$uploads = wp_upload_dir();
$filename = 'mayaobongro-quy-trinh-dat-may-ao-bong-ro-20260711.png';
$targetPath = trailingslashit($uploads['path']) . $filename;
$relativePath = trim($uploads['subdir'], '/') . '/' . $filename;

if (!copy($sourceImage, $targetPath)) {
    fwrite(STDERR, "Unable to copy image to uploads: {$targetPath}\n");
    exit(1);
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
    wp_update_post([
        'ID' => $attachmentId,
        'post_title' => 'Quy trình đặt may áo bóng rổ Mayaobongro.vn',
        'post_content' => '',
        'post_excerpt' => 'Sơ đồ 6 bước đặt may áo bóng rổ tại Mayaobongro.vn.',
    ]);
} else {
    $attachmentId = wp_insert_attachment([
        'post_mime_type' => 'image/png',
        'post_title' => 'Quy trình đặt may áo bóng rổ Mayaobongro.vn',
        'post_content' => '',
        'post_excerpt' => 'Sơ đồ 6 bước đặt may áo bóng rổ tại Mayaobongro.vn.',
        'post_status' => 'inherit',
    ], $targetPath, $orderingPageId);

    if (is_wp_error($attachmentId) || !$attachmentId) {
        fwrite(STDERR, "Unable to create attachment.\n");
        exit(1);
    }
    $attachmentId = (int) $attachmentId;
}

update_attached_file($attachmentId, $targetPath);
update_post_meta($attachmentId, '_wp_attachment_image_alt', 'Sơ đồ quy trình đặt may áo bóng rổ tại Mayaobongro.vn');
$metadata = wp_generate_attachment_metadata($attachmentId, $targetPath);
if (!empty($metadata)) {
    wp_update_attachment_metadata($attachmentId, $metadata);
}

$imageUrl = wp_get_attachment_url($attachmentId);
if (!$imageUrl) {
    fwrite(STDERR, "Unable to resolve attachment URL.\n");
    exit(1);
}

$figure = sprintf(
    '<figure class="x24-ordering-process-figure wp-block-image size-full"><img src="%s" alt="Sơ đồ quy trình đặt may áo bóng rổ tại Mayaobongro.vn" class="wp-image-%d" loading="eager" decoding="async" fetchpriority="high" /></figure>',
    esc_url($imageUrl),
    $attachmentId
);

$content = (string) $orderingPage->post_content;
$content = preg_replace('/\s*<figure class="x24-ordering-process-figure.*?<\/figure>\s*/s', "\n\n", $content);

if (preg_match('/(<h1>.*?<\/h1>\s*<p>.*?<\/p>)/s', $content, $matches)) {
    $content = preg_replace('/(<h1>.*?<\/h1>\s*<p>.*?<\/p>)/s', '$1' . "\n\n" . $figure, $content, 1);
} else {
    $content = $figure . "\n\n" . $content;
}

$updated = wp_update_post(wp_slash([
    'ID' => $orderingPageId,
    'post_content' => $content,
]), true);

if (is_wp_error($updated)) {
    fwrite(STDERR, $updated->get_error_message() . "\n");
    exit(1);
}

file_put_contents(
    $backupDir . '/page-after.json',
    wp_json_encode([
        'id' => $orderingPageId,
        'title' => get_the_title($orderingPageId),
        'slug' => get_post_field('post_name', $orderingPageId),
        'content' => get_post_field('post_content', $orderingPageId),
        'attachment_id' => $attachmentId,
        'attachment_url' => $imageUrl,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

echo wp_json_encode([
    'status' => 'applied',
    'page_id' => $orderingPageId,
    'attachment_id' => $attachmentId,
    'attachment_url' => $imageUrl,
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
