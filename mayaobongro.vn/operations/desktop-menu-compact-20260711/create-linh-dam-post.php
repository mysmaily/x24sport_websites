<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$primaryImage = $argv[2] ?? '';
$secondaryImage = $argv[3] ?? '';
$batchRoot = $argv[4] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/desktop-menu-compact-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

foreach ([$primaryImage, $secondaryImage] as $sourceImage) {
    if (!$sourceImage || !is_file($sourceImage)) {
        fwrite(STDERR, "Source image not found: {$sourceImage}\n");
        exit(1);
    }
}

if (!wp_mkdir_p($batchRoot)) {
    fwrite(STDERR, "Unable to create batch directory: {$batchRoot}\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-linh-dam-post';
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

$slug = 'giai-bong-ro-truong-thcs-linh-dam';
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

function create_or_update_attachment(string $sourceImage, string $filename, string $title, string $excerpt, string $alt): array
{
    $uploads = wp_upload_dir();
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
            'post_title' => $title,
            'post_excerpt' => $excerpt,
        ]);
    } else {
        $attachmentId = wp_insert_attachment([
            'post_mime_type' => 'image/jpeg',
            'post_title' => $title,
            'post_content' => '',
            'post_excerpt' => $excerpt,
            'post_status' => 'inherit',
        ], $targetPath);

        if (is_wp_error($attachmentId) || !$attachmentId) {
            fwrite(STDERR, "Unable to create attachment: {$title}\n");
            exit(1);
        }
        $attachmentId = (int) $attachmentId;
    }

    update_attached_file($attachmentId, $targetPath);
    update_post_meta($attachmentId, '_wp_attachment_image_alt', $alt);
    $metadata = wp_generate_attachment_metadata($attachmentId, $targetPath);
    if (!empty($metadata)) {
        wp_update_attachment_metadata($attachmentId, $metadata);
    }

    $imageUrl = wp_get_attachment_url($attachmentId);
    if (!$imageUrl) {
        fwrite(STDERR, "Unable to resolve attachment URL: {$title}\n");
        exit(1);
    }

    return [
        'id' => $attachmentId,
        'url' => $imageUrl,
        'alt' => $alt,
    ];
}

$primary = create_or_update_attachment(
    $primaryImage,
    'giai-bong-ro-truong-thcs-linh-dam-mau-ao-da-lam-20260712-1.jpg',
    'Giải bóng rổ Trường THCS Linh Đàm',
    'Hình ảnh giải bóng rổ Trường THCS Linh Đàm với đội học sinh mặc áo bóng rổ xanh.',
    'Giải bóng rổ Trường THCS Linh Đàm với đội học sinh mặc áo bóng rổ xanh'
);

$secondary = create_or_update_attachment(
    $secondaryImage,
    'giai-bong-ro-truong-thcs-linh-dam-mau-ao-da-lam-20260712-2.jpg',
    'Không khí giải bóng rổ Trường THCS Linh Đàm',
    'Toàn cảnh học sinh tham gia giải bóng rổ Trường THCS Linh Đàm trong nhiều mẫu áo thi đấu.',
    'Toàn cảnh học sinh tham gia giải bóng rổ Trường THCS Linh Đàm trong nhiều mẫu áo thi đấu'
);

$title = 'Giải bóng rổ Trường THCS Linh Đàm';
$excerpt = 'Hình ảnh thực tế tại giải bóng rổ Trường THCS Linh Đàm, nơi nhiều đội học sinh sử dụng áo bóng rổ đồng bộ cho thi đấu và hoạt động thể thao.';
$content = <<<HTML
<p><strong>Giải bóng rổ Trường THCS Linh Đàm</strong> là một hoạt động thể thao học đường có không khí rất sôi nổi. Hình ảnh thực tế cho thấy các đội học sinh sử dụng áo bóng rổ đồng bộ, nhiều màu sắc, phù hợp cho thi đấu, trao giải và lưu lại dấu ấn của giải.</p>

<figure class="wp-block-image size-full"><img src="{$primary['url']}" alt="{$primary['alt']}" class="wp-image-{$primary['id']}" loading="eager" decoding="async" fetchpriority="high" /></figure>

<h2>Không khí giải đấu</h2>
<p>Điểm nổi bật của giải là sự đồng bộ giữa nhận diện sự kiện, huy chương, cúp trao giải và trang phục thi đấu của học sinh. Các mẫu áo xanh, đỏ, vàng, hồng được sử dụng giúp từng đội dễ nhận diện khi tập trung đông và khi thi đấu trên sân.</p>

<figure class="wp-block-image size-full"><img src="{$secondary['url']}" alt="{$secondary['alt']}" class="wp-image-{$secondary['id']}" loading="lazy" decoding="async" /></figure>

<h2>Điểm nổi bật của áo thi đấu học sinh</h2>
<ul>
<li>Màu áo nổi bật, dễ phân biệt đội trong giải trường học.</li>
<li>Form áo bóng rổ thoải mái cho vận động, chạy nhảy và thi đấu liên tục.</li>
<li>Số áo, tên đội và logo được bố trí rõ, đẹp khi chụp ảnh tập thể.</li>
<li>Phù hợp cho giải nội bộ, câu lạc bộ bóng rổ và các hoạt động thể thao ngoại khóa.</li>
</ul>

<h2>Gợi ý khi đặt áo cho giải trường học</h2>
<p>Nếu trường hoặc câu lạc bộ cần đặt áo cho một giải tương tự, hãy chuẩn bị số đội, màu áo từng đội, danh sách size, số lượng, logo trường hoặc logo giải và thời gian cần nhận. Mayaobongro.vn sẽ hỗ trợ tư vấn mẫu, lên thiết kế và sản xuất theo lịch của giải.</p>

<p><a class="button primary" href="https://zalo.me/0989353247">Tư vấn áo cho giải của bạn</a> <a class="button" href="/dat-may-ao-bong-ro/">Xem quy trình đặt may</a></p>
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
set_post_thumbnail($postId, (int) $primary['id']);
wp_update_post(['ID' => (int) $primary['id'], 'post_parent' => $postId]);
wp_update_post(['ID' => (int) $secondary['id'], 'post_parent' => $postId]);

file_put_contents(
    $backupDir . '/after.json',
    wp_json_encode([
        'post_id' => $postId,
        'post_url' => get_permalink($postId),
        'primary_attachment_id' => (int) $primary['id'],
        'primary_attachment_url' => $primary['url'],
        'secondary_attachment_id' => (int) $secondary['id'],
        'secondary_attachment_url' => $secondary['url'],
        'category_id' => $categoryId,
        'category_url' => get_category_link($categoryId),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE)
);

echo wp_json_encode([
    'status' => 'applied',
    'post_id' => $postId,
    'post_url' => get_permalink($postId),
    'primary_attachment_id' => (int) $primary['id'],
    'primary_attachment_url' => $primary['url'],
    'secondary_attachment_id' => (int) $secondary['id'],
    'secondary_attachment_url' => $secondary['url'],
    'category_id' => $categoryId,
    'category_url' => get_category_link($categoryId),
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
