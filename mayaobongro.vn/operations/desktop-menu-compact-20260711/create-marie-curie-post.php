<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$imageOne = $argv[2] ?? '';
$imageTwo = $argv[3] ?? '';
$imageThree = $argv[4] ?? '';
$batchRoot = $argv[5] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/desktop-menu-compact-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

foreach ([$imageOne, $imageTwo, $imageThree] as $sourceImage) {
    if (!$sourceImage || !is_file($sourceImage)) {
        fwrite(STDERR, "Source image not found: {$sourceImage}\n");
        exit(1);
    }
}

if (!wp_mkdir_p($batchRoot)) {
    fwrite(STDERR, "Unable to create batch directory: {$batchRoot}\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-marie-curie-post';
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

$slug = 'mau-ao-bong-ro-truong-marie-curie';
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

function x24_create_or_update_attachment(string $sourceImage, string $filename, string $title, string $excerpt, string $alt): array
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

$primary = x24_create_or_update_attachment(
    $imageOne,
    'truong-marie-curie-mau-ao-bong-ro-da-lam-20260712-1.jpg',
    'Mẫu áo bóng rổ Trường Marie Curie',
    'Bộ áo bóng rổ Trường Marie Curie tông trắng phối xanh tím và hồng nhạt.',
    'Bộ áo bóng rổ Trường Marie Curie tông trắng phối xanh tím và hồng nhạt'
);

$packed = x24_create_or_update_attachment(
    $imageTwo,
    'truong-marie-curie-mau-ao-bong-ro-da-lam-20260712-2.jpg',
    'Áo bóng rổ Trường Marie Curie đã đóng gói',
    'Các áo bóng rổ Trường Marie Curie đã in số và đóng gói theo từng thành viên.',
    'Áo bóng rổ Trường Marie Curie đã in số và đóng gói theo từng thành viên'
);

$detail = x24_create_or_update_attachment(
    $imageThree,
    'truong-marie-curie-mau-ao-bong-ro-da-lam-20260712-3.jpg',
    'Chi tiết logo mẫu áo bóng rổ Trường Marie Curie',
    'Chi tiết logo, viền cổ và số áo trên mẫu áo bóng rổ Trường Marie Curie.',
    'Chi tiết logo, viền cổ và số áo trên mẫu áo bóng rổ Trường Marie Curie'
);

$title = 'Mẫu áo bóng rổ Trường Marie Curie';
$excerpt = 'Hình ảnh thực tế mẫu áo bóng rổ Trường Marie Curie tông trắng phối xanh tím, có logo trường, logo lớp và số áo in đồng bộ.';
$content = <<<HTML
<p><strong>Trường Marie Curie</strong> là mẫu áo bóng rổ đã may theo phong cách trắng sáng, phối xanh tím và hồng nhạt. Bộ áo sử dụng form sát nách quen thuộc của bóng rổ, kết hợp logo trường, logo lớp và số áo để tạo nhận diện riêng cho đội.</p>

<figure class="wp-block-image size-full"><img src="{$primary['url']}" alt="{$primary['alt']}" class="wp-image-{$primary['id']}" loading="eager" decoding="async" fetchpriority="high" /></figure>

<h2>Điểm nổi bật của mẫu áo</h2>
<ul>
<li>Tông trắng chủ đạo sạch, sáng, dễ nổi bật khi chụp ảnh tập thể.</li>
<li>Viền xanh tím ở cổ và nách tạo điểm nhấn nhẹ, hợp với phong cách học sinh.</li>
<li>Họa tiết hai bên thân áo và quần giúp bộ đồ không bị đơn điệu.</li>
<li>Logo trường, logo lớp và số áo được in rõ ràng, đồng bộ cho từng thành viên.</li>
</ul>

<figure class="wp-block-image size-full"><img src="{$packed['url']}" alt="{$packed['alt']}" class="wp-image-{$packed['id']}" loading="lazy" decoding="async" /></figure>

<h2>Đóng gói theo từng áo</h2>
<p>Sau khi hoàn thiện, áo được in số riêng và đóng gói gọn gàng để dễ kiểm tra, chia size và bàn giao cho đội. Cách đóng gói này phù hợp với đơn hàng trường học, lớp học hoặc câu lạc bộ có nhiều thành viên.</p>

<figure class="wp-block-image size-full"><img src="{$detail['url']}" alt="{$detail['alt']}" class="wp-image-{$detail['id']}" loading="lazy" decoding="async" /></figure>

<h2>Gợi ý khi đặt mẫu tương tự</h2>
<p>Nếu đội của bạn muốn đặt mẫu áo theo phong cách tương tự, hãy chuẩn bị logo trường hoặc logo lớp, màu chủ đạo, danh sách số áo, size từng thành viên và thời gian cần nhận. Mayaobongro.vn sẽ tư vấn lại bố cục in, chất liệu và phương án sản xuất trước khi chốt đơn.</p>

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
set_post_thumbnail($postId, (int) $primary['id']);
foreach ([$primary, $packed, $detail] as $image) {
    wp_update_post(['ID' => (int) $image['id'], 'post_parent' => $postId]);
}

file_put_contents(
    $backupDir . '/after.json',
    wp_json_encode([
        'post_id' => $postId,
        'post_url' => get_permalink($postId),
        'attachments' => [
            'primary' => $primary,
            'packed' => $packed,
            'detail' => $detail,
        ],
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
    'packed_attachment_id' => (int) $packed['id'],
    'packed_attachment_url' => $packed['url'],
    'detail_attachment_id' => (int) $detail['id'],
    'detail_attachment_url' => $detail['url'],
    'category_id' => $categoryId,
    'category_url' => get_category_link($categoryId),
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
