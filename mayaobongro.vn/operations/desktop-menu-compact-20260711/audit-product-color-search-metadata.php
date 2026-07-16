<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';

require rtrim($siteRoot, '/') . '/wp-load.php';

global $wpdb;

$colorNeedles = [
    'mau',
    'màu',
    'vang',
    'vàng',
    'xanh',
    'do',
    'đỏ',
    'den',
    'đen',
    'trang',
    'trắng',
    'hong',
    'hồng',
    'tim',
    'tím',
    'cam',
    'gradient',
    'ombre',
];

function x24_matches_color_word(string $text, array $needles): bool
{
    $text = mb_strtolower($text);
    foreach ($needles as $needle) {
        if (str_contains($text, mb_strtolower($needle))) {
            return true;
        }
    }
    return false;
}

$publishedProductIds = get_posts([
    'post_type' => 'product',
    'post_status' => 'publish',
    'fields' => 'ids',
    'posts_per_page' => -1,
]);

$taxonomies = get_object_taxonomies('product', 'objects');
$taxonomyReport = [];
foreach ($taxonomies as $taxonomy => $object) {
    $terms = get_terms([
        'taxonomy' => $taxonomy,
        'hide_empty' => false,
    ]);
    if (is_wp_error($terms)) {
        continue;
    }

    $matchingTerms = [];
    foreach ($terms as $term) {
        if (x24_matches_color_word($term->name . ' ' . $term->slug, $colorNeedles)) {
            $matchingTerms[] = [
                'id' => (int) $term->term_id,
                'name' => $term->name,
                'slug' => $term->slug,
                'count' => (int) $term->count,
            ];
        }
    }

    $taxonomyReport[] = [
        'taxonomy' => $taxonomy,
        'label' => $object->label,
        'hierarchical' => (bool) $object->hierarchical,
        'total_terms' => count($terms),
        'color_like_terms' => $matchingTerms,
    ];
}

$metaKeys = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT pm.meta_key, COUNT(DISTINCT pm.post_id) AS product_count
         FROM {$wpdb->postmeta} pm
         INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
         WHERE p.post_type = %s
           AND p.post_status = %s
           AND (
             pm.meta_key LIKE %s OR pm.meta_key LIKE %s OR pm.meta_key LIKE %s
           )
         GROUP BY pm.meta_key
         ORDER BY product_count DESC, pm.meta_key ASC",
        'product',
        'publish',
        '%color%',
        '%mau%',
        '%attribute%'
    ),
    ARRAY_A
);

$metaValueHits = $wpdb->get_results(
    $wpdb->prepare(
        "SELECT pm.meta_key, COUNT(DISTINCT pm.post_id) AS product_count
         FROM {$wpdb->postmeta} pm
         INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id
         WHERE p.post_type = %s
           AND p.post_status = %s
           AND (
             pm.meta_value LIKE %s OR pm.meta_value LIKE %s OR pm.meta_value LIKE %s OR
             pm.meta_value LIKE %s OR pm.meta_value LIKE %s OR pm.meta_value LIKE %s
           )
         GROUP BY pm.meta_key
         ORDER BY product_count DESC, pm.meta_key ASC
         LIMIT 30",
        'product',
        'publish',
        '%vàng%',
        '%vang%',
        '%xanh%',
        '%gradient%',
        '%đỏ%',
        '%do%'
    ),
    ARRAY_A
);

$termRelationships = [];
foreach ($taxonomyReport as $taxonomyData) {
    foreach ($taxonomyData['color_like_terms'] as $term) {
        $termRelationships[] = [
            'taxonomy' => $taxonomyData['taxonomy'],
            'term' => $term['name'],
            'slug' => $term['slug'],
            'count' => $term['count'],
        ];
    }
}

$sampleProducts = get_posts([
    'post_type' => 'product',
    'post_status' => 'publish',
    'posts_per_page' => 12,
    'orderby' => 'date',
    'order' => 'DESC',
]);

$samples = [];
foreach ($sampleProducts as $product) {
    $termsByTax = [];
    foreach (['product_cat', 'product_tag'] as $taxonomy) {
        $terms = get_the_terms($product->ID, $taxonomy);
        $termsByTax[$taxonomy] = is_array($terms)
            ? array_map(fn (WP_Term $term): string => $term->name . ' (' . $term->slug . ')', $terms)
            : [];
    }

    foreach ($taxonomies as $taxonomy => $object) {
        if (!str_starts_with($taxonomy, 'pa_')) {
            continue;
        }
        $terms = get_the_terms($product->ID, $taxonomy);
        if (is_array($terms)) {
            $termsByTax[$taxonomy] = array_map(fn (WP_Term $term): string => $term->name . ' (' . $term->slug . ')', $terms);
        }
    }

    $meta = get_post_meta($product->ID);
    $interestingMeta = [];
    foreach ($meta as $key => $values) {
        $joined = implode(' | ', array_map('maybe_serialize', $values));
        if (x24_matches_color_word($key . ' ' . $joined, $colorNeedles)) {
            $interestingMeta[$key] = mb_substr($joined, 0, 300);
        }
    }

    $samples[] = [
        'id' => (int) $product->ID,
        'title' => get_the_title($product),
        'slug' => $product->post_name,
        'terms' => $termsByTax,
        'color_like_meta' => $interestingMeta,
    ];
}

echo wp_json_encode([
    'published_product_count' => count($publishedProductIds),
    'taxonomies' => $taxonomyReport,
    'color_like_term_relationships' => $termRelationships,
    'meta_keys_color_or_attribute_like' => $metaKeys,
    'meta_values_color_like' => $metaValueHits,
    'sample_latest_products' => $samples,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
