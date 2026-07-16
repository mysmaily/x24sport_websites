<?php

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? '/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/sidebar-copy-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';

if (!function_exists('wp_update_term')) {
    throw new RuntimeException('WordPress did not load correctly.');
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . date('Ymd-His');
if (!wp_mkdir_p($backupDir)) {
    throw new RuntimeException('Unable to create backup directory: ' . $backupDir);
}

$term = get_term_by('slug', 'mau-ao-bong-ro-da-lam', 'category');
if (!$term || is_wp_error($term)) {
    throw new RuntimeException('Category not found: mau-ao-bong-ro-da-lam');
}

$sidebars = get_option('sidebars_widgets');
$widgetText = get_option('widget_text');

$backup = [
    'created_at' => gmdate('c'),
    'term' => [
        'term_id' => (int) $term->term_id,
        'taxonomy' => $term->taxonomy,
        'name' => $term->name,
        'slug' => $term->slug,
        'description' => $term->description,
    ],
    'sidebars_widgets' => $sidebars,
    'widget_text' => $widgetText,
];

$backupFile = $backupDir . '/blog-copy-before.json';
file_put_contents(
    $backupFile,
    wp_json_encode($backup, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
);

$newDescription = 'Tổng hợp hình ảnh thực tế các mẫu áo bóng rổ đã hoàn thiện cho đội nhóm, trường học và câu lạc bộ.';
$result = wp_update_term((int) $term->term_id, 'category', [
    'description' => $newDescription,
]);
if (is_wp_error($result)) {
    throw new RuntimeException($result->get_error_message());
}

$removedWidgets = [];
$targetWidgetIds = [];
if (is_array($widgetText)) {
    foreach ($widgetText as $number => $settings) {
        if (!is_array($settings)) {
            continue;
        }

        $title = trim((string) ($settings['title'] ?? ''));
        $text = trim(wp_strip_all_tags((string) ($settings['text'] ?? '')));
        if (
            strtolower($title) === 'about'
            && str_contains($text, 'Lorem ipsum dolor sit amet')
        ) {
            $targetWidgetIds[] = 'text-' . $number;
            unset($widgetText[$number]);
        }
    }
}

if ($targetWidgetIds && is_array($sidebars)) {
    foreach ($sidebars as $sidebarId => $widgets) {
        if (!is_array($widgets)) {
            continue;
        }

        $filtered = array_values(array_diff($widgets, $targetWidgetIds));
        if ($filtered !== array_values($widgets)) {
            $removedWidgets[$sidebarId] = array_values(array_intersect($widgets, $targetWidgetIds));
            $sidebars[$sidebarId] = $filtered;
        }
    }
}

if ($targetWidgetIds) {
    update_option('widget_text', $widgetText);
    update_option('sidebars_widgets', $sidebars);
}

clean_term_cache([(int) $term->term_id], 'category');
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
}
if (class_exists('autoptimizeCache')) {
    autoptimizeCache::clearall();
}

echo wp_json_encode([
    'backup_file' => $backupFile,
    'term_id' => (int) $term->term_id,
    'new_description' => $newDescription,
    'removed_widgets' => $removedWidgets,
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . PHP_EOL;
