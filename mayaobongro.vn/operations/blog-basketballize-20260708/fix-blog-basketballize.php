<?php

declare(strict_types=1);

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? '/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/blog-basketballize-20260708';

require rtrim($siteRoot, '/') . '/wp-load.php';

$timestamp = gmdate('Ymd-His');
$backupRoot = rtrim($batchRoot, '/') . '/backups/' . $timestamp;
wp_mkdir_p($backupRoot);
if (!is_dir($backupRoot)) {
    mkdir($backupRoot, 0775, true);
}

$postIdsToUpdate = [
    1043,
    1060,
    1066,
    1073,
    1080,
    1084,
    2265,
    2274,
    2284,
    2286,
    2308,
    2315,
    2322,
    2339,
    2342,
    2354,
    2360,
];

$titleOverrides = [
    1060 => 'Áo Bóng Rổ Thi Đấu: Bí Quyết Chọn Đúng Cho Đội Của Bạn',
    1066 => 'Đồng Phục Bóng Rổ Công Ty Giúp Gắn Kết Đội Nhóm',
    1084 => 'Áo Bóng Rổ Sát Nách MAYAOBONGRO.VN - Linh Hoạt Cho Mọi Trận Đấu',
    2286 => 'Hành Trình Thiết Kế Áo Bóng Rổ Riêng Cho Team An Biên',
    2322 => 'Thiết Kế Áo Bóng Rổ Cho Team CEO 1992 – Dấu Ấn Riêng Trên Sân Đấu',
];

$genericReplacements = [
    'https://cdn.mayaobongro.vn/' => 'https://mayaobongro.vn/',
    'Half Marathon' => 'Thi Đấu',
    'half marathon' => 'thi đấu',
    'Marathon' => 'Thi Đấu',
    'marathon' => 'thi đấu',
    'Áo chạy bộ' => 'Áo bóng rổ',
    'áo chạy bộ' => 'áo bóng rổ',
    'Áo Chạy Bộ' => 'Áo Bóng Rổ',
    'AO CHAY BO' => 'AO BONG RO',
    'chạy bộ' => 'bóng rổ',
    'Chạy bộ' => 'Bóng rổ',
    'Chạy Bộ' => 'Bóng Rổ',
    'Runners' => 'Players',
    'runners' => 'players',
    'Runner' => 'Player',
    'runner' => 'player',
    'Running' => 'Thi Đấu',
    'running' => 'thi đấu',
    'cung đường chạy' => 'sân đấu',
    'Cung đường chạy' => 'Sân đấu',
    'đường chạy' => 'sân đấu',
    'Đường chạy' => 'Sân đấu',
    'cung đường' => 'sân đấu',
    'Cung đường' => 'Sân đấu',
    'bước chạy' => 'pha bóng',
    'Bước chạy' => 'Pha bóng',
    'cuộc đua' => 'trận đấu',
    'Cuộc đua' => 'Trận đấu',
    'giải chạy' => 'giải đấu',
    'Giải chạy' => 'Giải đấu',
    'sự kiện chạy' => 'sự kiện thể thao',
    'giải marathon' => 'giải đấu',
    '21km' => '',
];

$postSpecificReplacements = [
    1043 => [
        'đồng hành trên từng cung đường chạy.' => 'đồng hành trong từng buổi tập và trận đấu.',
    ],
    1060 => [
        'Áo bóng rổ Thi Đấu - Bí quyết lựa chọn hoàn hảo' => 'Áo bóng rổ thi đấu - bí quyết lựa chọn đúng cho đội của bạn',
        'thi đấu, hay cự ly bóng rổ , là thử thách vừa sức nhưng đòi hỏi nhiều sự chuẩn bị, đặc biệt là trang phục.' => 'thi đấu bóng rổ đòi hỏi sự chuẩn bị kỹ về trang phục để người mặc luôn linh hoạt, thoải mái và tự tin.',
        'cho vận động viên trong mỗi bước chạy.' => 'cho cầu thủ trong từng pha bóng và mỗi buổi thi đấu.',
    ],
    1073 => [
        'Đơn giản vì áo nhóm không chỉ là trang phục, mà còn giúp thể hiện tinh thần đội ngũ trên từng cung đường chạy hay các sự kiện thể thao.' => 'Đơn giản vì áo nhóm không chỉ là trang phục, mà còn giúp thể hiện tinh thần đội ngũ trong từng buổi tập, giao lưu và giải đấu.',
    ],
    1080 => [
        'các giải marathon, giải chạy cộng đồng hay sự kiện nội bộ' => 'các giải đấu, hoạt động giao lưu hay sự kiện nội bộ',
    ],
    2284 => [
        'Lưu giữ những kỷ niệm đáng nhớ trên từng cung đường' => 'Lưu giữ những kỷ niệm đáng nhớ trên từng trận đấu',
    ],
    2308 => [
        'Các từ khóa như Running Team, Finisher, Race Day hay slogans cá nhân' => 'Các cụm chữ như tên đội, khẩu hiệu thi đấu hoặc thông điệp riêng',
    ],
    2315 => [
        'trải nghiệm của cầu thủ trên từng cung đường.' => 'trải nghiệm của cầu thủ trong từng trận đấu.',
    ],
    2322 => [
        'Thiết kế tối giản nhưng vẫn đủ ấn tượng để tạo nên sự khác biệt trên đường chạy.' => 'Thiết kế tối giản nhưng vẫn đủ ấn tượng để tạo nên sự khác biệt trên sân đấu.',
        'Lưu giữ những kỷ niệm đáng nhớ trên từng cung đường' => 'Lưu giữ những kỷ niệm đáng nhớ trong từng mùa giải',
    ],
    2342 => [
        'tạo dấu ấn riêng trên mọi cung đường.' => 'tạo dấu ấn riêng trên mọi sân đấu.',
    ],
];

$result = [
    'timestamp' => $timestamp,
    'backup_root' => $backupRoot,
    'blog_page' => [],
    'posts' => [],
    'indexables_deleted' => [],
];

function blog_fix_backup_post(int $postId, string $backupRoot): void
{
    $post = get_post($postId, ARRAY_A);
    if (!$post) {
        return;
    }

    $payload = [
        'post' => $post,
        'meta' => get_post_meta($postId),
    ];

    file_put_contents(
        $backupRoot . '/post-' . $postId . '.json',
        wp_json_encode($payload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
    );
}

function blog_fix_replace_text(string $value, array $genericReplacements, array $specificReplacements = []): string
{
    $updated = strtr($value, $genericReplacements);
    if ($specificReplacements) {
        $updated = strtr($updated, $specificReplacements);
    }

    $updated = preg_replace('/\s{2,}/u', ' ', $updated) ?? $updated;
    $updated = preg_replace('/\s+,/u', ',', $updated) ?? $updated;

    return $updated;
}

function blog_fix_strip_problematic_image_classes(string $content): string
{
    return preg_replace_callback(
        '/class=(["\'])([^"\']*)\1/i',
        static function (array $matches): string {
            $classes = preg_split('/\s+/', trim($matches[2])) ?: [];
            $classes = array_values(
                array_filter(
                    $classes,
                    static fn(string $class): bool => !preg_match('/^wp-image-\d+$/', $class)
                )
            );

            if ($classes === []) {
                return '';
            }

            return 'class=' . $matches[1] . implode(' ', $classes) . $matches[1];
        },
        $content
    ) ?? $content;
}

$blogPage = get_page_by_path('blog');
if (!$blogPage instanceof WP_Post) {
    throw new RuntimeException('Blog page not found.');
}

blog_fix_backup_post($blogPage->ID, $backupRoot);

$blogPageUpdate = [
    'ID' => $blogPage->ID,
    'post_content' => '',
];

$blogPageResult = wp_update_post($blogPageUpdate, true);
if (is_wp_error($blogPageResult)) {
    throw new RuntimeException($blogPageResult->get_error_message());
}

$result['blog_page'] = [
    'id' => $blogPage->ID,
    'updated' => true,
];

foreach ($postIdsToUpdate as $postId) {
    $post = get_post($postId);
    if (!$post instanceof WP_Post) {
        continue;
    }

    blog_fix_backup_post($postId, $backupRoot);

    $specificReplacements = $postSpecificReplacements[$postId] ?? [];
    $newTitle = $titleOverrides[$postId] ?? blog_fix_replace_text($post->post_title, $genericReplacements, $specificReplacements);
    $newContent = blog_fix_replace_text($post->post_content, $genericReplacements, $specificReplacements);
    $newContent = blog_fix_strip_problematic_image_classes($newContent);
    $newExcerpt = blog_fix_replace_text($post->post_excerpt, $genericReplacements, $specificReplacements);

    $update = [
        'ID' => $postId,
        'post_title' => trim($newTitle),
        'post_content' => $newContent,
        'post_excerpt' => trim($newExcerpt),
    ];

    $updateResult = wp_update_post($update, true);
    if (is_wp_error($updateResult)) {
        throw new RuntimeException($updateResult->get_error_message());
    }

    $yoastTitle = get_post_meta($postId, '_yoast_wpseo_title', true);
    $yoastDesc = get_post_meta($postId, '_yoast_wpseo_metadesc', true);

    if ($yoastTitle !== '') {
        update_post_meta($postId, '_yoast_wpseo_title', trim(blog_fix_replace_text($yoastTitle, $genericReplacements, $specificReplacements)));
    }

    if ($yoastDesc !== '') {
        update_post_meta($postId, '_yoast_wpseo_metadesc', trim(blog_fix_replace_text($yoastDesc, $genericReplacements, $specificReplacements)));
    }

    clean_post_cache($postId);

    $result['posts'][] = [
        'id' => $postId,
        'title' => get_the_title($postId),
    ];
}

global $wpdb;
$indexableIds = array_merge([$blogPage->ID], $postIdsToUpdate);

foreach ($indexableIds as $objectId) {
    $deleted = $wpdb->delete(
        $wpdb->prefix . 'yoast_indexable',
        [
            'object_id' => $objectId,
            'object_type' => 'post',
        ],
        [
            '%d',
            '%s',
        ]
    );

    $result['indexables_deleted'][] = [
        'object_id' => $objectId,
        'deleted' => $deleted,
    ];
}

file_put_contents(
    $backupRoot . '/result.json',
    wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);

echo wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), PHP_EOL;
