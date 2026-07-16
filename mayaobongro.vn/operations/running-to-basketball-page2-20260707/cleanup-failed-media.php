<?php

declare(strict_types=1);

require '/var/www/mayaobongro.vn/wp-load.php';

$keys = [
    'x24-br-007-tieu-hoc-1752',
    'x24-br-007-thpt-1752',
];

$results = [];
foreach ($keys as $key) {
    $attachments = get_posts([
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'meta_query' => [[
            'key' => '_mayaobongro_generated_asset_key',
            'value' => $key,
        ]],
    ]);
    foreach ($attachments as $attachmentId) {
        $usedAsFeatured = get_posts([
            'post_type' => 'product',
            'post_status' => 'any',
            'posts_per_page' => 1,
            'fields' => 'ids',
            'meta_query' => [[
                'key' => '_thumbnail_id',
                'value' => (string) $attachmentId,
            ]],
        ]);
        $usedAsAgeImage = get_posts([
            'post_type' => 'product',
            'post_status' => 'any',
            'posts_per_page' => 1,
            'fields' => 'ids',
            'meta_query' => [
                'relation' => 'OR',
                ['key' => '_mayaobongro_age_image_tieu_hoc_id', 'value' => (string) $attachmentId],
                ['key' => '_mayaobongro_age_image_thpt_id', 'value' => (string) $attachmentId],
            ],
        ]);
        if ($usedAsFeatured || $usedAsAgeImage) {
            $results[] = ['attachment_id' => (int) $attachmentId, 'key' => $key, 'deleted' => false, 'reason' => 'in_use'];
            continue;
        }
        $deleted = wp_delete_attachment((int) $attachmentId, true);
        $results[] = ['attachment_id' => (int) $attachmentId, 'key' => $key, 'deleted' => (bool) $deleted];
    }
}

echo wp_json_encode(['results' => $results], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), PHP_EOL;
