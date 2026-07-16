<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$elementaryId = isset($argv[2]) ? (int) $argv[2] : 2768;
$highSchoolId = isset($argv[3]) ? (int) $argv[3] : 1764;

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';

$errors = [];
$plugin = 'mayaobongro-linked-editions/mayaobongro-linked-editions.php';
$expectedGroup = 'eco-retreat-xanh-la-nhat';
$elementary = wc_get_product($elementaryId);
$highSchool = wc_get_product($highSchoolId);

if (!is_plugin_active($plugin)) {
    $errors[] = 'Plugin is inactive.';
}
if (!$elementary instanceof WC_Product || !$highSchool instanceof WC_Product) {
    $errors[] = 'One or both products are missing.';
}

$requiredCategories = [
    'sat_nach' => 'ao-bong-ro-sat-nach',
    'student' => 'ao-bong-ro-tre-em',
    'elementary' => 'ao-bong-ro-tieu-hoc-lop-4-5',
    'high_school' => 'ao-bong-ro-trung-hoc-lop-11-12',
    'custom' => 'may-ao-bong-ro-thiet-ke-rieng-x24',
    'set' => 'bo-quan-ao-bong-ro',
];
$terms = [];
foreach ($requiredCategories as $key => $slug) {
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term || is_wp_error($term)) {
        $errors[] = "Missing category {$slug}.";
        continue;
    }
    $terms[$key] = $term;
}

if (isset($terms['student'], $terms['elementary'], $terms['high_school'])) {
    if ((int) $terms['elementary']->parent !== (int) $terms['student']->term_id) {
        $errors[] = 'Elementary category parent is wrong.';
    }
    if ((int) $terms['high_school']->parent !== (int) $terms['student']->term_id) {
        $errors[] = 'High-school category parent is wrong.';
    }
}

$productData = [];
foreach ([
    'elementary' => [$elementary, 'tieu-hoc', $highSchoolId, ['sat_nach', 'student', 'elementary', 'custom', 'set']],
    'high_school' => [$highSchool, 'trung-hoc', $elementaryId, ['sat_nach', 'student', 'high_school', 'custom', 'set']],
] as $key => [$product, $expectedLevel, $expectedSiblingId, $categoryKeys]) {
    if (!$product instanceof WC_Product) {
        continue;
    }

    $id = $product->get_id();
    $level = get_post_meta($id, MAYAOBONGRO_SCHOOL_LEVEL_META, true);
    $group = get_post_meta($id, MAYAOBONGRO_EDITION_GROUP_META, true);
    $siblingId = (int) get_post_meta($id, MAYAOBONGRO_LINKED_PRODUCT_META, true);
    $categories = array_map('intval', $product->get_category_ids());
    $copy = mb_strtolower($product->get_name() . ' ' . $product->get_short_description() . ' ' . $product->get_description(), 'UTF-8');
    $featured = (int) $product->get_image_id();
    $imageUrl = $featured ? wp_get_attachment_url($featured) : '';

    if ($product->get_status() !== 'publish') {
        $errors[] = "{$key} product is not published.";
    }
    if ($level !== $expectedLevel) {
        $errors[] = "{$key} has wrong school level.";
    }
    if ($group !== $expectedGroup) {
        $errors[] = "{$key} has wrong edition group.";
    }
    if ($siblingId !== $expectedSiblingId) {
        $errors[] = "{$key} has wrong sibling ID.";
    }
    foreach ($categoryKeys as $categoryKey) {
        if (!isset($terms[$categoryKey])) {
            continue;
        }
        if (!in_array((int) $terms[$categoryKey]->term_id, $categories, true)) {
            $errors[] = "{$key} is missing category {$categoryKey}.";
        }
    }
    foreach (['chạy bộ', 'runner', 'running', 'marathon', 'mayaochaybo.vn'] as $forbidden) {
        if (str_contains($copy, $forbidden)) {
            $errors[] = "{$key} copy contains forbidden term: {$forbidden}.";
        }
    }
    if ($featured < 1 || !$imageUrl) {
        $errors[] = "{$key} is missing featured image.";
    }

    $productData[$key] = [
        'id' => $id,
        'name' => $product->get_name(),
        'url' => get_permalink($id),
        'status' => $product->get_status(),
        'level' => $level,
        'group' => $group,
        'sibling_id' => $siblingId,
        'featured_media_id' => $featured,
        'featured_url' => $imageUrl,
        'gallery_media_ids' => $product->get_gallery_image_ids(),
        'category_ids' => $categories,
        'switcher_options' => function_exists('mayaobongro_linked_editions_get_options')
            ? mayaobongro_linked_editions_get_options($id)
            : [],
    ];
}

foreach ($productData as $key => $data) {
    if (count($data['switcher_options']) !== 2) {
        $errors[] = "{$key} does not resolve two switcher options.";
    }
}

$result = [
    'verified_at' => current_time('c'),
    'ok' => !$errors,
    'errors' => $errors,
    'plugin_active' => is_plugin_active($plugin),
    'expected_group' => $expectedGroup,
    'products' => $productData,
];

echo wp_json_encode($result, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;

exit($errors ? 2 : 0);
