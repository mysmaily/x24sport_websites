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

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-portfolio-rewrite';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$muPluginsDir = rtrim(WPMU_PLUGIN_DIR, '/');
if (!is_dir($muPluginsDir) && !wp_mkdir_p($muPluginsDir)) {
    fwrite(STDERR, "Unable to create mu-plugins directory: {$muPluginsDir}\n");
    exit(1);
}

$pluginPath = $muPluginsDir . '/x24-portfolio-category-rewrite.php';
if (is_file($pluginPath)) {
    copy($pluginPath, $backupDir . '/x24-portfolio-category-rewrite.php.before');
}

$plugin = <<<'PHP'
<?php
/**
 * Plugin Name: X24 Portfolio Category Rewrite
 * Description: Keeps the "Mẫu áo bóng rổ đã làm" post category at /mau-ao-bong-ro-da-lam/.
 */

if (!defined('ABSPATH')) {
    exit;
}

add_action('init', function (): void {
    add_rewrite_rule(
        '^mau-ao-bong-ro-da-lam/?$',
        'index.php?category_name=mau-ao-bong-ro-da-lam',
        'top'
    );
});

add_filter('term_link', function (string $termlink, WP_Term $term, string $taxonomy): string {
    if ($taxonomy === 'category' && $term->slug === 'mau-ao-bong-ro-da-lam') {
        return home_url('/mau-ao-bong-ro-da-lam/');
    }
    return $termlink;
}, 10, 3);

add_filter('redirect_canonical', function ($redirectUrl, string $requestedUrl) {
    $path = parse_url($requestedUrl, PHP_URL_PATH);
    if ($path === '/mau-ao-bong-ro-da-lam/' || $path === '/mau-ao-bong-ro-da-lam') {
        return false;
    }
    return $redirectUrl;
}, 10, 2);

add_filter('wpseo_canonical', function ($canonical) {
    if (is_category('mau-ao-bong-ro-da-lam')) {
        return home_url('/mau-ao-bong-ro-da-lam/');
    }
    return $canonical;
});

add_filter('wpseo_opengraph_url', function ($url) {
    if (is_category('mau-ao-bong-ro-da-lam')) {
        return home_url('/mau-ao-bong-ro-da-lam/');
    }
    return $url;
});

add_filter('get_the_archive_title', function (string $title): string {
    if (is_category('mau-ao-bong-ro-da-lam')) {
        return 'Mẫu áo bóng rổ đã làm';
    }
    return $title;
});

add_filter('wpseo_title', function ($title) {
    if (is_category('mau-ao-bong-ro-da-lam')) {
        return 'Mẫu áo bóng rổ đã làm - May Áo Bóng Rổ - VN';
    }
    return $title;
});

add_filter('wpseo_opengraph_title', function ($title) {
    if (is_category('mau-ao-bong-ro-da-lam')) {
        return 'Mẫu áo bóng rổ đã làm';
    }
    return $title;
});

add_action('wp_head', function (): void {
    if (!is_category('mau-ao-bong-ro-da-lam')) {
        return;
    }
    ?>
    <style id="x24-portfolio-category-cleanup">
      body.category-mau-ao-bong-ro-da-lam .post-sidebar {
        display: none !important;
      }
      body.category-mau-ao-bong-ro-da-lam .row-divided > .large-9.col {
        flex-basis: 100% !important;
        max-width: 100% !important;
      }
      body.category-mau-ao-bong-ro-da-lam .archive-page-header .page-title {
        text-transform: none !important;
        letter-spacing: 0 !important;
      }
    </style>
    <?php
}, 20);

add_action('wp_footer', function (): void {
    if (!is_category('mau-ao-bong-ro-da-lam')) {
        return;
    }
    ?>
    <script>
      document.addEventListener('DOMContentLoaded', function () {
        var title = document.querySelector('body.category-mau-ao-bong-ro-da-lam .archive-page-header h1.page-title');
        if (title) title.textContent = 'Mẫu áo bóng rổ đã làm';
      });
    </script>
    <?php
}, 20);
PHP;

if (false === file_put_contents($pluginPath, $plugin)) {
    fwrite(STDERR, "Unable to write plugin: {$pluginPath}\n");
    exit(1);
}

flush_rewrite_rules(false);

file_put_contents($backupDir . '/plugin-after.php', $plugin);

$category = get_category_by_slug('mau-ao-bong-ro-da-lam');
echo wp_json_encode([
    'status' => 'applied',
    'plugin_path' => $pluginPath,
    'category_id' => $category ? (int) $category->term_id : null,
    'category_url' => $category ? get_category_link((int) $category->term_id) : null,
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
