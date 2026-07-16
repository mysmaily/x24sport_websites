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

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-custom-css';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$stylesheet = get_stylesheet();
$beforeCss = wp_get_custom_css($stylesheet);
file_put_contents($backupDir . '/custom-css-before.css', $beforeCss);

$block = <<<'CSS'

/* Compact desktop menu contact CTA - 20260711 */
@media (min-width: 850px) {
  .header-nav-main.nav-left li.x24-menu-contact {
    display: inline-flex;
    align-items: center;
  }

  .header-nav-main.nav-left li.x24-menu-contact a.nav-top-link {
    height: 36px;
    line-height: 36px !important;
    padding: 0 14px !important;
    margin-left: 8px;
    border-radius: 4px;
    background: #e31b23;
    color: #fff !important;
  }

  .header-nav-main.nav-left li.x24-menu-contact a.nav-top-link:hover {
    background: #ff2b32;
  }
}
CSS;

$pattern = '/\n?\/\* Compact desktop menu contact CTA - 20260711 \*\/.*?(?=\n\/\*|\z)/s';
$newCss = preg_replace($pattern, '', $beforeCss);
$newCss = rtrim((string) $newCss) . $block . "\n";

$result = wp_update_custom_css_post($newCss, ['stylesheet' => $stylesheet]);
if (is_wp_error($result)) {
    fwrite(STDERR, $result->get_error_message() . "\n");
    exit(1);
}

file_put_contents($backupDir . '/custom-css-after.css', $newCss);

echo wp_json_encode([
    'status' => 'applied',
    'stylesheet' => $stylesheet,
    'backup_dir' => $backupDir,
    'custom_css_post_id' => $result instanceof WP_Post ? (int) $result->ID : null,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
