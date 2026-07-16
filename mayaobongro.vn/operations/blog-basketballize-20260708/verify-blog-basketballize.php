<?php

declare(strict_types=1);

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';

require rtrim($siteRoot, '/') . '/wp-load.php';

$failures = [];
$blogPage = get_page_by_path('blog');

if (!$blogPage instanceof WP_Post) {
    $failures[] = 'Missing blog page.';
} else {
    if ((int) get_option('page_for_posts') !== (int) $blogPage->ID) {
        $failures[] = 'page_for_posts does not point to the blog page.';
    }

    if (str_contains($blogPage->post_content, 'setup your blog page')) {
        $failures[] = 'Blog page still contains the Flatsome placeholder content.';
    }
}

$needles = [
    'chạy bộ',
    'áo chạy bộ',
    'runner',
    'runners',
    'running',
    'cung đường',
    'marathon',
    'cdn.mayaobongro.vn',
];

$posts = get_posts([
    'post_type' => 'post',
    'posts_per_page' => -1,
    'post_status' => 'publish',
]);

foreach ($posts as $post) {
    $joined = strtolower($post->post_title . "\n" . $post->post_excerpt . "\n" . wp_strip_all_tags($post->post_content));
    foreach ($needles as $needle) {
        if (str_contains($joined, $needle)) {
            $failures[] = "Post {$post->ID} still contains residual term: {$needle}";
            break;
        }
    }

    $yoastTitle = strtolower((string) get_post_meta($post->ID, '_yoast_wpseo_title', true));
    foreach (['chạy bộ', 'áo chạy bộ', 'running', 'runner', 'marathon'] as $needle) {
        if ($yoastTitle !== '' && str_contains($yoastTitle, $needle)) {
            $failures[] = "Post {$post->ID} still has old Yoast title term: {$needle}";
            break;
        }
    }
}

global $wpdb;
$blogPageId = $blogPage instanceof WP_Post ? (int) $blogPage->ID : 0;
if ($blogPageId > 0) {
    $indexable = $wpdb->get_row(
        $wpdb->prepare(
            "SELECT permalink FROM {$wpdb->prefix}yoast_indexable WHERE object_id = %d AND object_type = 'post'",
            $blogPageId
        ),
        ARRAY_A
    );

    if ($indexable && !empty($indexable['permalink']) && $indexable['permalink'] !== 'https://mayaobongro.vn/blog/') {
        $failures[] = 'Blog page Yoast indexable permalink is still incorrect.';
    }
}

if ($failures) {
    fwrite(STDERR, implode(PHP_EOL, $failures) . PHP_EOL);
    exit(1);
}

echo "PASS\n";
