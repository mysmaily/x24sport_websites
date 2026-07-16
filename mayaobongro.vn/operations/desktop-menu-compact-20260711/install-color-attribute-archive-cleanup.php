<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/desktop-menu-compact-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';

if (!wp_mkdir_p($batchRoot)) {
    fwrite(STDERR, "Unable to create batch directory: {$batchRoot}\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-color-attribute-archive-cleanup';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$muPluginsDir = rtrim(WPMU_PLUGIN_DIR, '/');
if (!is_dir($muPluginsDir) && !wp_mkdir_p($muPluginsDir)) {
    fwrite(STDERR, "Unable to create mu-plugins directory: {$muPluginsDir}\n");
    exit(1);
}

$pluginPath = $muPluginsDir . '/x24-color-attribute-archive-cleanup.php';
if (is_file($pluginPath)) {
    copy($pluginPath, $backupDir . '/x24-color-attribute-archive-cleanup.php.before');
}

$plugin = <<<'PHP'
<?php
/**
 * Plugin Name: X24 Color Attribute Archive Cleanup
 * Description: Cleans titles for Mayaobongro.vn color attribute product archives.
 */

if (!defined('ABSPATH')) {
    exit;
}

function x24_is_color_attribute_archive(): bool
{
    return is_tax('pa_mau-sac');
}

function x24_current_color_archive_name(): ?string
{
    $term = get_queried_object();
    return $term instanceof WP_Term && $term->taxonomy === 'pa_mau-sac' ? $term->name : null;
}

add_filter('get_the_archive_title', function (string $title): string {
    if (x24_is_color_attribute_archive()) {
        return x24_current_color_archive_name() ?: $title;
    }
    return $title;
});

add_filter('wpseo_title', function ($title) {
    if (x24_is_color_attribute_archive()) {
        $name = x24_current_color_archive_name();
        if ($name) {
            return $name . ' - May Áo Bóng Rổ - VN';
        }
    }
    return $title;
});

add_filter('wpseo_opengraph_title', function ($title) {
    if (x24_is_color_attribute_archive()) {
        return x24_current_color_archive_name() ?: $title;
    }
    return $title;
});
PHP;

if (false === file_put_contents($pluginPath, $plugin)) {
    fwrite(STDERR, "Unable to write plugin: {$pluginPath}\n");
    exit(1);
}

file_put_contents($backupDir . '/plugin-after.php', $plugin);

echo wp_json_encode([
    'status' => 'applied',
    'plugin_path' => $pluginPath,
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
