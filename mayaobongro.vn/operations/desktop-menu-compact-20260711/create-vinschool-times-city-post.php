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

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-vinschool-times-city-post';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$category = get_category_by_slug('mau-ao-bong-ro-da-lam');
if (!$category) {
    fwrite(STDERR, "Category not found: mau-ao-bong-ro-da-lam\n");
    exit(1);
}
$categoryId = (int) $category->term_id;

$slug = 'mau-ao-bong-ro-truong-vinschool-times-city';
$existingPost = get_page_by_path($slug, OBJECT, 'post');

file_put_contents(
    $backupDir . '/before.json',
    wp_json_encode([
        'post' => $existingPost instanceof WP_Post ? [
            'id' => (int) $existingPost->ID,
            'title' => $existingPost->post_title,
            'slug' => $existingPost->post_name,
            'status' => $existingPost->post_status,
            'content' => $existingPost->post_content,
            'excerpt' => $existingPost->post_excerpt,
            'categories' => wp_get_post_categories((int) $existingPost->ID),
            'thumbnail_id' => (int) get_post_thumbnail_id((int) $existingPost->ID),
        ] : null,
        'category_id' => $categoryId,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

$uploads = wp_upload_dir();
$filename = 'truong-vinschool-times-city-mau-ao-bong-ro-da-lam-20260711.jpg';
$targetPath = trailingslashit($uploads['path']) . $filename;
$relativePath = trim($uploads['subdir'], '/') . '/' . $filename;

if (!copy($sourceImage, $targetPath)) {
    fwrite(STDERR, "Unable to copy image to uploads: {$targetPath}\n");
    exit(1);
}

$existingAttachment = get_posts([
    'post_type' => 'attachment',
    'post_status' => 'inherit',
    'posts_per_page' => 1,
    'fields' => 'ids',
    'meta_key' => '_wp_attached_file',
    'meta_value' => $relativePath,
]);

if ($existingAttachment) {
    $attachmentId = (int) $existingAttachment[0];
    wp_update_post([
        'ID' => $attachmentId,
        'post_title' => 'Mẫu áo bóng rổ Trường Vinschool Times City',
        'post_excerpt' => 'Đội bóng Trường Vinschool Times City trong mẫu áo bóng rổ trắng đỏ đã sản xuất.',
    ]);
} else {
    $attachmentId = wp_insert_attachment([
        'post_mime_type' => 'image/jpeg',
        'post_title' => 'Mẫu áo bóng rổ Trường Vinschool Times City',
        'post_content' => '',
        'post_excerpt' => 'Đội bóng Trường Vinschool Times City trong mẫu áo bóng rổ trắng đỏ đã sản xuất.',
        'post_status' => 'inherit',
    ], $targetPath);

    if (is_wp_error($attachmentId) || !$attachmentId) {
        fwrite(STDERR, "Unable to create attachment.\n");
        exit(1);
    }
    $attachmentId = (int) $attachmentId;
}

update_attached_file($attachmentId, $targetPath);
update_post_meta($attachmentId, '_wp_attachment_image_alt', 'Đội bóng Trường Vinschool Times City mặc mẫu áo bóng rổ trắng đỏ');
$metadata = wp_generate_attachment_metadata($attachmentId, $targetPath);
if (!empty($metadata)) {
    wp_update_attachment_metadata($attachmentId, $metadata);
}

$imageUrl = wp_get_attachment_url($attachmentId);
if (!$imageUrl) {
    fwrite(STDERR, "Unable to resolve attachment URL.\n");
    exit(1);
}

$title = 'Mẫu áo bóng rổ Trường Vinschool Times City';
$excerpt = 'Hình ảnh thực tế đội bóng Trường Vinschool Times City trong mẫu áo bóng rổ trắng đỏ, thiết kế đồng bộ cho học sinh thi đấu và sinh hoạt đội nhóm.';
$content = <<<HTML
<p><strong>Trường Vinschool Times City</strong> là khách hàng đầu tiên được đăng trong chuyên mục Mẫu áo bóng rổ đã làm của Mayaobongro.vn. Đây là hình ảnh thực tế đội bóng học sinh trong mẫu áo bóng rổ tông trắng - đỏ, phối họa tiết mạnh mẽ và đồng bộ cho cả đội.</p>

<figure class="wp-block-image size-full"><img src="{$imageUrl}" alt="Đội bóng Trường Vinschool Times City mặc mẫu áo bóng rổ trắng đỏ" class="wp-image-{$attachmentId}" loading="eager" decoding="async" fetchpriority="high" /></figure>

<h2>Điểm nổi bật của mẫu áo</h2>
<ul>
<li>Tông trắng - đỏ nổi bật, dễ nhận diện trên sân.</li>
<li>Form áo bóng rổ phù hợp vận động, thi đấu và sinh hoạt đội nhóm.</li>
<li>Thiết kế đồng bộ tên đội, số áo và mảng họa tiết trước ngực.</li>
<li>Phù hợp cho đội bóng trường học, câu lạc bộ và giải đấu học sinh.</li>
</ul>

<h2>Gợi ý khi đặt mẫu tương tự</h2>
<p>Nếu đội của bạn muốn làm mẫu áo theo phong cách tương tự, hãy chuẩn bị logo đội, màu chủ đạo, danh sách tên - số áo và số lượng cần may. Mayaobongro.vn sẽ tư vấn lại phương án thiết kế, chất liệu và size trước khi sản xuất.</p>

<p><a class="button primary" href="https://zalo.me/0989353247">Tư vấn mẫu áo cho đội của bạn</a> <a class="button" href="/dat-may-ao-bong-ro/">Xem quy trình đặt may</a></p>
HTML;

$postData = [
    'post_type' => 'post',
    'post_title' => $title,
    'post_name' => $slug,
    'post_content' => $content,
    'post_excerpt' => $excerpt,
    'post_status' => 'publish',
    'comment_status' => 'closed',
    'ping_status' => 'closed',
    'post_category' => [$categoryId],
];

if ($existingPost instanceof WP_Post) {
    $postData['ID'] = (int) $existingPost->ID;
    $postId = wp_update_post(wp_slash($postData), true);
} else {
    $postId = wp_insert_post(wp_slash($postData), true);
}

if (is_wp_error($postId)) {
    fwrite(STDERR, $postId->get_error_message() . "\n");
    exit(1);
}
$postId = (int) $postId;

wp_set_post_categories($postId, [$categoryId], false);
set_post_thumbnail($postId, $attachmentId);
wp_update_post(['ID' => $attachmentId, 'post_parent' => $postId]);

file_put_contents(
    $backupDir . '/after.json',
    wp_json_encode([
        'post_id' => $postId,
        'post_url' => get_permalink($postId),
        'attachment_id' => $attachmentId,
        'attachment_url' => $imageUrl,
        'category_id' => $categoryId,
        'category_url' => get_category_link($categoryId),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

echo wp_json_encode([
    'status' => 'applied',
    'post_id' => $postId,
    'post_url' => get_permalink($postId),
    'attachment_id' => $attachmentId,
    'attachment_url' => $imageUrl,
    'category_id' => $categoryId,
    'category_url' => get_category_link($categoryId),
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
