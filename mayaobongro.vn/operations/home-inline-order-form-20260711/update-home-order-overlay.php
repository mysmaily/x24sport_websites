<?php
declare(strict_types=1);

chdir('/var/www/mayaobongro.vn');
require 'wp-load.php';

$postId = 75;
$backupDir = '/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/home-order-overlay-20260711/backups/' . date('Ymd-His');
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Could not create backup directory: {$backupDir}\n");
    exit(1);
}

$post = get_post($postId);
if (!$post instanceof WP_Post) {
    fwrite(STDERR, "Post {$postId} not found\n");
    exit(1);
}

$content = (string) $post->post_content;
file_put_contents($backupDir . '/front-page-75-before.txt', $content);

$shortcode = '[x24_home_order_form]';
$newContent = $content;

if (substr_count($newContent, $shortcode) === 0) {
    $firstSectionEnd = strpos($newContent, '[/section]');
    if ($firstSectionEnd === false) {
        fwrite(STDERR, "Could not find the first hero section close tag\n");
        exit(1);
    }
    $newContent = substr_replace($newContent, "\n\n{$shortcode}\n", $firstSectionEnd, 0);
} elseif (substr_count($newContent, $shortcode) === 1) {
    $firstSectionEnd = strpos($newContent, '[/section]');
    $shortcodePos = strpos($newContent, $shortcode);

    if ($firstSectionEnd === false || $shortcodePos === false) {
        fwrite(STDERR, "Could not locate shortcode or hero section close tag\n");
        exit(1);
    }

    if ($shortcodePos > $firstSectionEnd) {
        $newContent = str_replace("\n\n{$shortcode}\n", "\n", $newContent);
        $newContent = str_replace("\n{$shortcode}\n", "\n", $newContent);
        $newContent = str_replace($shortcode, '', $newContent);

        $firstSectionEnd = strpos($newContent, '[/section]');
        if ($firstSectionEnd === false) {
            fwrite(STDERR, "Could not find hero section close tag after removing shortcode\n");
            exit(1);
        }

        $newContent = substr_replace($newContent, "\n\n{$shortcode}\n", $firstSectionEnd, 0);
    }
} else {
    fwrite(STDERR, "Found more than one {$shortcode}; refusing to update\n");
    exit(1);
}

if ($newContent !== $content) {
    $updated = wp_update_post([
        'ID' => $postId,
        'post_content' => $newContent,
    ], true);

    if (is_wp_error($updated)) {
        fwrite(STDERR, $updated->get_error_message() . "\n");
        exit(1);
    }

    clean_post_cache($postId);
}

if (function_exists('rocket_clean_domain')) {
    rocket_clean_domain();
}
if (function_exists('autoptimizeCache')) {
    autoptimizeCache::clearall();
}

echo json_encode([
    'post_id' => $postId,
    'changed' => $newContent !== $content,
    'backup_dir' => $backupDir,
    'shortcode_count' => substr_count($newContent, $shortcode),
    'shortcode_before_first_section_close' => strpos($newContent, $shortcode) < strpos($newContent, '[/section]'),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
