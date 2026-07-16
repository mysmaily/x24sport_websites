<?php
declare(strict_types=1);

$mode = $argv[1] ?? 'inspect';
if (!in_array($mode, ['inspect', 'apply'], true)) {
    fwrite(STDERR, "Usage: php archive_cleanup.php [inspect|apply]\n");
    exit(2);
}

require_once getcwd() . '/wp-load.php';

$needles = ['luu-tru', 'lưu trữ', 'archive', 'archived'];
$term_taxonomies = ['product_cat', 'category', 'post_tag'];
$post_types = ['page', 'post', 'product'];
$timestamp = gmdate('Ymd-His');
$backup_dir = WP_CONTENT_DIR . '/uploads/codex-ops/archive-cleanup-20260712';
if (!is_dir($backup_dir) && !wp_mkdir_p($backup_dir)) {
    throw new RuntimeException("Could not create backup directory: {$backup_dir}");
}

function archive_cleanup_norm(string $value): string
{
    return strtolower(remove_accents($value));
}

function archive_cleanup_matches(string $value, array $needles): bool
{
    $haystack = archive_cleanup_norm($value);
    foreach ($needles as $needle) {
        if (strpos($haystack, archive_cleanup_norm($needle)) !== false) {
            return true;
        }
    }
    return false;
}

function archive_cleanup_term_objects(int $term_id, string $taxonomy): array
{
    $objects = get_objects_in_term($term_id, $taxonomy);
    if (is_wp_error($objects) || empty($objects)) {
        return [];
    }

    $result = [];
    foreach (array_map('intval', $objects) as $object_id) {
        $post = get_post($object_id);
        $result[] = [
            'id' => $object_id,
            'post_type' => $post ? $post->post_type : null,
            'post_title' => $post ? $post->post_title : null,
            'post_status' => $post ? $post->post_status : null,
        ];
    }
    return $result;
}

$matches = [
    'terms' => [],
    'posts' => [],
];

foreach ($term_taxonomies as $taxonomy) {
    $terms = get_terms([
        'taxonomy' => $taxonomy,
        'hide_empty' => false,
    ]);
    if (is_wp_error($terms)) {
        continue;
    }

    foreach ($terms as $term) {
        $searchable = $term->slug . ' ' . $term->name . ' ' . $term->description;
        if (!archive_cleanup_matches($searchable, $needles)) {
            continue;
        }

        $matches['terms'][] = [
            'term_id' => (int) $term->term_id,
            'term_taxonomy_id' => (int) $term->term_taxonomy_id,
            'taxonomy' => $taxonomy,
            'slug' => $term->slug,
            'name' => $term->name,
            'description' => $term->description,
            'parent' => (int) $term->parent,
            'count' => (int) $term->count,
            'url' => get_term_link($term),
            'meta' => get_term_meta((int) $term->term_id),
            'objects' => archive_cleanup_term_objects((int) $term->term_id, $taxonomy),
        ];
    }
}

foreach ($post_types as $post_type) {
    $query = new WP_Query([
        'post_type' => $post_type,
        'post_status' => 'any',
        'posts_per_page' => -1,
        'fields' => 'ids',
        'no_found_rows' => true,
    ]);

    foreach ($query->posts as $post_id) {
        $post = get_post((int) $post_id);
        if (!$post) {
            continue;
        }

        $searchable = $post->post_name . ' ' . $post->post_title . ' ' . $post->post_status;
        if (!archive_cleanup_matches($searchable, $needles)) {
            continue;
        }

        $matches['posts'][] = [
            'id' => (int) $post->ID,
            'post_type' => $post->post_type,
            'post_status' => $post->post_status,
            'post_name' => $post->post_name,
            'post_title' => $post->post_title,
            'post_parent' => (int) $post->post_parent,
            'url' => get_permalink($post),
            'meta' => get_post_meta((int) $post->ID),
        ];
    }
}

$backup = [
    'mode' => $mode,
    'created_at_utc' => gmdate('c'),
    'site_url' => site_url(),
    'home_url' => home_url(),
    'needles' => $needles,
    'matches' => $matches,
    'actions' => [],
];

if ($mode === 'apply') {
    foreach ($matches['posts'] as $post_match) {
        $deleted = wp_delete_post((int) $post_match['id'], true);
        $backup['actions'][] = [
            'type' => 'delete_post',
            'id' => (int) $post_match['id'],
            'post_type' => $post_match['post_type'],
            'post_title' => $post_match['post_title'],
            'success' => (bool) $deleted,
        ];
    }

    foreach ($matches['terms'] as $term_match) {
        $deleted = wp_delete_term((int) $term_match['term_id'], $term_match['taxonomy']);
        $backup['actions'][] = [
            'type' => 'delete_term',
            'term_id' => (int) $term_match['term_id'],
            'taxonomy' => $term_match['taxonomy'],
            'name' => $term_match['name'],
            'slug' => $term_match['slug'],
            'success' => !is_wp_error($deleted) && (bool) $deleted,
            'error' => is_wp_error($deleted) ? $deleted->get_error_message() : null,
        ];
    }

    if (function_exists('wc_delete_product_transients')) {
        wc_delete_product_transients();
    }
    clean_taxonomy_cache('product_cat');
}

$backup_file = $backup_dir . '/' . $timestamp . '-' . $mode . '.json';
file_put_contents(
    $backup_file,
    wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL
);

echo wp_json_encode([
    'mode' => $mode,
    'backup_file' => $backup_file,
    'term_matches' => count($matches['terms']),
    'post_matches' => count($matches['posts']),
    'actions' => $backup['actions'],
    'matches' => [
        'terms' => array_map(static function (array $term): array {
            return [
                'term_id' => $term['term_id'],
                'taxonomy' => $term['taxonomy'],
                'name' => $term['name'],
                'slug' => $term['slug'],
                'count' => $term['count'],
                'url' => $term['url'],
                'objects_count' => count($term['objects']),
            ];
        }, $matches['terms']),
        'posts' => array_map(static function (array $post): array {
            return [
                'id' => $post['id'],
                'post_type' => $post['post_type'],
                'post_status' => $post['post_status'],
                'post_title' => $post['post_title'],
                'post_name' => $post['post_name'],
                'url' => $post['url'],
            ];
        }, $matches['posts']),
    ],
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
