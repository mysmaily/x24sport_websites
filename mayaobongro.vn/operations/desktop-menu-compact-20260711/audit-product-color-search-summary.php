<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
require rtrim($siteRoot, '/') . '/wp-load.php';

global $wpdb;

$patterns = ['%vàng%', '%vang%', '%xanh%', '%gradient%', '%đỏ%', '%do%', '%đen%', '%den%', '%trắng%', '%trang%', '%hồng%', '%hong%', '%tím%', '%tim%', '%cam%', '%ombre%'];
$whereParts = [];
$params = [];
foreach ($patterns as $pattern) {
    $whereParts[] = '(t.name LIKE %s OR t.slug LIKE %s)';
    $params[] = $pattern;
    $params[] = $pattern;
}
$termWhere = implode(' OR ', $whereParts);

$productCount = (int) $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->posts} WHERE post_type = 'product' AND post_status = 'publish'");

$colorTagSummary = $wpdb->get_row(
    $wpdb->prepare(
        "SELECT COUNT(DISTINCT t.term_id) AS term_count, COUNT(DISTINCT p.ID) AS product_count
         FROM {$wpdb->terms} t
         INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = t.term_id
         LEFT JOIN {$wpdb->term_relationships} tr ON tr.term_taxonomy_id = tt.term_taxonomy_id
         LEFT JOIN {$wpdb->posts} p ON p.ID = tr.object_id AND p.post_type = 'product' AND p.post_status = 'publish'
         WHERE tt.taxonomy = 'product_tag' AND ({$termWhere})",
        ...$params
    ),
    ARRAY_A
);

$topColorTags = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT t.name, t.slug, tt.count
         FROM {$wpdb->terms} t
         INNER JOIN {$wpdb->term_taxonomy} tt ON tt.term_id = t.term_id
         WHERE tt.taxonomy = 'product_tag' AND ({$termWhere})
         ORDER BY tt.count DESC, t.name ASC
         LIMIT 30",
        ...$params
    ),
    ARRAY_A
);

$attributeTaxonomies = array_values(array_filter(get_object_taxonomies('product'), fn (string $taxonomy): bool => str_starts_with($taxonomy, 'pa_')));
$attributes = [];
foreach ($attributeTaxonomies as $taxonomy) {
    $terms = get_terms(['taxonomy' => $taxonomy, 'hide_empty' => false]);
    $attributes[] = [
        'taxonomy' => $taxonomy,
        'terms' => is_wp_error($terms) ? [] : array_map(fn (WP_Term $term): array => [
            'name' => $term->name,
            'slug' => $term->slug,
            'count' => (int) $term->count,
        ], $terms),
    ];
}

$metaKeys = $wpdb->get_results(
    "SELECT pm.meta_key, COUNT(DISTINCT pm.post_id) AS product_count
     FROM {$wpdb->postmeta} pm
     INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
     WHERE p.post_type = 'product'
       AND p.post_status = 'publish'
       AND (pm.meta_key LIKE '%color%' OR pm.meta_key LIKE '%mau%' OR pm.meta_key LIKE '%attribute%')
     GROUP BY pm.meta_key
     ORDER BY product_count DESC, pm.meta_key ASC",
    ARRAY_A
);

$valueWhereParts = [];
$valueParams = [];
foreach ($patterns as $pattern) {
    $valueWhereParts[] = 'pm.meta_value LIKE %s';
    $valueParams[] = $pattern;
}
$metaValueHits = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT pm.meta_key, COUNT(DISTINCT pm.post_id) AS product_count
         FROM {$wpdb->postmeta} pm
         INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
         WHERE p.post_type = 'product'
           AND p.post_status = 'publish'
           AND (" . implode(' OR ', $valueWhereParts) . ")
         GROUP BY pm.meta_key
         ORDER BY product_count DESC, pm.meta_key ASC
         LIMIT 20",
        ...$valueParams
    ),
    ARRAY_A
);

$productAttributeSamples = $wpdb->get_results(
    "SELECT p.ID, p.post_title, pm.meta_value
     FROM {$wpdb->postmeta} pm
     INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
     WHERE p.post_type = 'product'
       AND p.post_status = 'publish'
       AND pm.meta_key = '_product_attributes'
     LIMIT 10",
    ARRAY_A
);

$searchFieldHits = $wpdb->get_row(
    $wpdb->prepare(
        "SELECT COUNT(DISTINCT ID) AS product_count
         FROM {$wpdb->posts}
         WHERE post_type = 'product'
           AND post_status = 'publish'
           AND (" . implode(' OR ', array_fill(0, count($patterns), '(post_title LIKE %s OR post_excerpt LIKE %s OR post_content LIKE %s)')) . ")",
        ...array_merge(...array_map(fn ($pattern): array => [$pattern, $pattern, $pattern], $patterns))
    ),
    ARRAY_A
);

echo wp_json_encode([
    'published_product_count' => $productCount,
    'products_with_color_like_product_tags' => [
        'color_like_tag_terms' => (int) ($colorTagSummary['term_count'] ?? 0),
        'products_linked_to_those_tags' => (int) ($colorTagSummary['product_count'] ?? 0),
        'top_terms' => $topColorTags,
    ],
    'product_attributes_pa_taxonomies' => $attributes,
    'meta_keys_named_color_or_attribute' => $metaKeys,
    'meta_values_containing_color_words' => $metaValueHits,
    '_product_attributes_samples' => $productAttributeSamples,
    'products_with_color_words_in_title_excerpt_content' => (int) ($searchFieldHits['product_count'] ?? 0),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
