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

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-retired-flag-link-cleanup';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$muPluginsDir = rtrim(WPMU_PLUGIN_DIR, '/');
if (!is_dir($muPluginsDir) && !wp_mkdir_p($muPluginsDir)) {
    fwrite(STDERR, "Unable to create mu-plugins directory: {$muPluginsDir}\n");
    exit(1);
}

$pluginPath = $muPluginsDir . '/x24-retired-flag-link-cleanup.php';
if (is_file($pluginPath)) {
    copy($pluginPath, $backupDir . '/x24-retired-flag-link-cleanup.php.before');
}

$plugin = <<<'PHP'
<?php
/**
 * Plugin Name: X24 Retired Flag Link Cleanup
 * Description: Removes retired "Áo cờ đỏ sao vàng" navigation/output links after the category was deleted.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('template_redirect', function (): void {
    if (is_admin() || wp_doing_ajax()) {
        return;
    }

    ob_start(static function (string $html): string {
        $html = preg_replace(
            '#<li[^>]*>\s*<a[^>]+href=["\'](?:https://mayaobongro\.vn)?/ao-bong-ro-co-do-sao-vang/?["\'][^>]*>\s*Áo\s+cờ\s+đỏ\s+sao\s+vàng\s*</a>\s*</li>#iu',
            '',
            $html
        ) ?? $html;

        $html = preg_replace(
            '#<li[^>]*>\s*→\s*<a[^>]+href=["\']/ao-bong-ro-co-do-sao-vang/?["\'][^>]*>\s*Áo\s+Cờ\s+Đỏ\s+Sao\s+Vàng\s*</a>\s*</li>#iu',
            '',
            $html
        ) ?? $html;

        return str_replace(
            [
                '<a href="https://mayaobongro.vn/ao-bong-ro-co-do-sao-vang/">Áo cờ đỏ sao vàng</a>',
                '<a href="/ao-bong-ro-co-do-sao-vang/" style="color:#aaa">Áo Cờ Đỏ Sao Vàng</a>',
            ],
            '',
            $html
        );
    });
}, 0);
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
