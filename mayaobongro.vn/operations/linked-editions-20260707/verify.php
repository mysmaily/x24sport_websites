<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$elementaryId = isset($argv[2]) ? (int) $argv[2] : 2763;
$highSchoolId = isset($argv[3]) ? (int) $argv[3] : 2121;

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/plugin.php';

$errors = [];
$plugin = 'mayaobongro-linked-editions/mayaobongro-linked-editions.php';
$elementary = wc_get_product($elementaryId);
$highSchool = wc_get_product($highSchoolId);

if (!is_plugin_active($plugin)) {
    $errors[] = 'Plugin is inactive.';
}
if (!$elementary instanceof WC_Product || !$highSchool instanceof WC_Product) {
    $errors[] = 'One or both products are missing.';
}

$parent = get_term_by('slug', 'ao-bong-ro-tre-em', 'product_cat');
$elementaryCategory = get_term_by('slug', 'ao-bong-ro-tieu-hoc-lop-4-5', 'product_cat');
$highSchoolCategory = get_term_by('slug', 'ao-bong-ro-trung-hoc-lop-11-12', 'product_cat');

if (!$parent || !$elementaryCategory || !$highSchoolCategory) {
    $errors[] = 'Required categories are missing.';
} elseif (
    (int) $elementaryCategory->parent !== (int) $parent->term_id
    || (int) $highSchoolCategory->parent !== (int) $parent->term_id
) {
    $errors[] = 'Age categories are not children of the student category.';
}

$productData = [];
foreach ([
    'elementary' => [$elementary, 'tieu-hoc', $highSchoolId, $elementaryCategory],
    'high_school' => [$highSchool, 'trung-hoc', $elementaryId, $highSchoolCategory],
] as $key => [$product, $expectedLevel, $expectedSiblingId, $ageCategory]) {
    if (!$product instanceof WC_Product) {
        continue;
    }

    $id = $product->get_id();
    $level = get_post_meta($id, MAYAOBONGRO_SCHOOL_LEVEL_META, true);
    $group = get_post_meta($id, MAYAOBONGRO_EDITION_GROUP_META, true);
    $siblingId = (int) get_post_meta($id, MAYAOBONGRO_LINKED_PRODUCT_META, true);
    $categories = $product->get_category_ids();
    $copy = mb_strtolower(
        implode(' ', [
            $product->get_name(),
            $product->get_short_description(),
            $product->get_description(),
        ]),
        'UTF-8'
    );

    if ($product->get_status() !== 'publish') {
        $errors[] = "{$key} product is not published.";
    }
    if ($level !== $expectedLevel) {
        $errors[] = "{$key} has the wrong school level.";
    }
    if ($group !== 'x24-cb-059') {
        $errors[] = "{$key} has the wrong edition group.";
    }
    if ($siblingId !== $expectedSiblingId) {
        $errors[] = "{$key} has a non-reciprocal sibling ID.";
    }
    if (!in_array((int) $ageCategory->term_id, $categories, true)) {
        $errors[] = "{$key} is missing its age category.";
    }
    if ($product->get_image_id() < 1) {
        $errors[] = "{$key} is missing its featured image.";
    }
    foreach (['chạy bộ', 'runner', 'running', 'marathon'] as $forbidden) {
        if (str_contains($copy, $forbidden)) {
            $errors[] = "{$key} copy contains forbidden term: {$forbidden}.";
        }
    }

    $productData[$key] = [
        'id' => $id,
        'name' => $product->get_name(),
        'url' => get_permalink($id),
        'status' => $product->get_status(),
        'level' => $level,
        'group' => $group,
        'sibling_id' => $siblingId,
        'featured_media_id' => $product->get_image_id(),
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
    'categories' => [
        'parent' => $parent ? (int) $parent->term_id : null,
        'elementary' => $elementaryCategory ? [
            'id' => (int) $elementaryCategory->term_id,
            'parent' => (int) $elementaryCategory->parent,
        ] : null,
        'high_school' => $highSchoolCategory ? [
            'id' => (int) $highSchoolCategory->term_id,
            'parent' => (int) $highSchoolCategory->parent,
        ] : null,
    ],
    'products' => $productData,
];

echo wp_json_encode(
    $result,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE
), PHP_EOL;

exit($errors ? 2 : 0);
