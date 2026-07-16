<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$backupRoot = $argv[2] ?? '/tmp/mayaobongro-audience-followup-' . gmdate('Ymd-His');

require rtrim($siteRoot, '/') . '/wp-load.php';

if (!wp_mkdir_p($backupRoot)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupRoot}\n");
    exit(2);
}

$pageIds = [2694, 2743];
$audienceTagSlugs = ['ao-bong-ro-tre-em', 'ao-bong-ro-nguoi-lon'];
$logoCategory = get_term_by('slug', 'logo-doi-bong-ro', 'product_cat');
$logoProductIds = $logoCategory instanceof WP_Term
    ? array_map('intval', get_objects_in_term((int) $logoCategory->term_id, 'product_cat'))
    : [];

$backup = [
    'captured_at' => current_time('c'),
    'logo_category' => $logoCategory instanceof WP_Term ? [
        'id' => (int) $logoCategory->term_id,
        'slug' => $logoCategory->slug,
        'count' => (int) $logoCategory->count,
    ] : null,
    'pages' => [],
    'logo_products' => [],
];

foreach ($pageIds as $pageId) {
    $page = get_post($pageId);
    if ($page instanceof WP_Post) {
        $backup['pages'][$pageId] = [
            'title' => $page->post_title,
            'slug' => $page->post_name,
            'content' => $page->post_content,
        ];
    }
}

foreach ($logoProductIds as $productId) {
    $backup['logo_products'][$productId] = [
        'title' => get_the_title($productId),
        'tags' => wp_get_post_terms($productId, 'product_tag', ['fields' => 'slugs']),
    ];
}

file_put_contents(
    trailingslashit($backupRoot) . 'before.json',
    wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);

$removedCount = 0;
foreach ($logoProductIds as $productId) {
    $tagSlugs = wp_get_post_terms($productId, 'product_tag', ['fields' => 'slugs']);
    $filtered = array_values(array_diff($tagSlugs, $audienceTagSlugs));
    if ($filtered === $tagSlugs) {
        continue;
    }

    wp_set_post_terms($productId, $filtered, 'product_tag', false);
    $removedCount++;
}

$paginationMap = [
    2694 => '[products tag="ao-bong-ro-tre-em" limit="12" columns="4" orderby="date" order="DESC" paginate="true"]',
    2743 => '[products tag="ao-bong-ro-nguoi-lon" limit="12" columns="4" orderby="date" order="DESC" paginate="true"]',
];

foreach ($paginationMap as $pageId => $replacement) {
    $page = get_post($pageId);
    if (!$page instanceof WP_Post) {
        continue;
    }

    $updatedContent = preg_replace(
        '/\[products\s+tag="[^"]+"\s+limit="12"\s+columns="4"\s+orderby="date"\s+order="DESC"\]/',
        $replacement,
        $page->post_content,
        1
    );

    if (!is_string($updatedContent) || $updatedContent === $page->post_content) {
        continue;
    }

    $result = wp_update_post([
        'ID' => $pageId,
        'post_content' => $updatedContent,
    ], true);

    if (is_wp_error($result)) {
        throw new RuntimeException($result->get_error_message());
    }
}

clean_term_cache([], 'product_tag');
clean_post_cache(2694);
clean_post_cache(2743);

$after = [
    'removed_audience_tags_from_logo_products' => $removedCount,
    'logo_products_total' => count($logoProductIds),
    'kids_page_url' => get_permalink(2694),
    'adults_page_url' => get_permalink(2743),
    'pages' => [],
];

foreach ($pageIds as $pageId) {
    $page = get_post($pageId);
    if ($page instanceof WP_Post) {
        $after['pages'][$pageId] = [
            'content' => $page->post_content,
        ];
    }
}

file_put_contents(
    trailingslashit($backupRoot) . 'after.json',
    wp_json_encode($after, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);

echo wp_json_encode($after, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES), PHP_EOL;
