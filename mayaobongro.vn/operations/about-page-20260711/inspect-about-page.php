<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';

require rtrim($siteRoot, '/') . '/wp-load.php';

global $wpdb;

$rows = $wpdb->get_results(
    "SELECT ID, post_title, post_name, post_parent, post_status, post_type, post_modified
     FROM {$wpdb->posts}
     WHERE post_type IN ('page', 'post')
       AND (
         post_name = 'gioi-thieu'
         OR LOWER(post_title) LIKE '%giới thiệu%'
         OR LOWER(post_title) LIKE '%gioi thieu%'
       )
     ORDER BY post_type, ID",
    ARRAY_A
);

$out = [];
foreach ($rows as $row) {
    $id = (int) $row['ID'];
    $row['permalink'] = get_permalink($id);
    $row['ancestors'] = array_map('intval', get_post_ancestors($id));
    $row['content_preview'] = mb_substr(wp_strip_all_tags((string) get_post_field('post_content', $id)), 0, 300);
    $out[] = $row;
}

echo wp_json_encode($out, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), PHP_EOL;
