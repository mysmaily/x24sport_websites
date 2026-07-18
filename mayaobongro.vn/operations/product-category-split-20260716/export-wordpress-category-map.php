<?php

declare(strict_types=1);

require '/var/www/mayaobongro.vn/wp-load.php';

$categorySlugs = ['bo-quan-ao-bong-ro', 'logo-doi-bong-ro'];
$categories = [];
$assignedProductIds = [];

foreach ($categorySlugs as $slug) {
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term instanceof WP_Term) {
        fwrite(STDERR, "Missing product category: {$slug}\n");
        exit(1);
    }

    $productIds = get_posts([
        'post_type' => 'product',
        'post_status' => 'publish',
        'fields' => 'ids',
        'posts_per_page' => -1,
        'orderby' => 'ID',
        'order' => 'ASC',
        'tax_query' => [[
            'taxonomy' => 'product_cat',
            'field' => 'term_id',
            'terms' => [(int) $term->term_id],
            'include_children' => true,
        ]],
    ]);

    foreach ($productIds as $productId) {
        $productId = (int) $productId;
        if (isset($assignedProductIds[$productId])) {
            fwrite(STDERR, "Product {$productId} belongs to both split categories\n");
            exit(1);
        }
        $assignedProductIds[$productId] = $slug;
    }

    $categories[] = [
        'sourceId' => (int) $term->term_id,
        'name' => $term->name,
        'slug' => $term->slug,
        'description' => wp_strip_all_tags(term_description($term->term_id, 'product_cat')),
        'productSourceIds' => array_values(array_map('intval', $productIds)),
    ];
}

echo wp_json_encode([
    'source' => 'wordpress',
    'tenantSlug' => 'mayaobongro',
    'exportedAt' => gmdate(DATE_ATOM),
    'categories' => $categories,
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), "\n";
