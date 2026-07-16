<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$backupPath = $argv[2] ?? '';

require rtrim($siteRoot, '/') . '/wp-load.php';

$post = get_post(1647);
if (!$post) {
    throw new RuntimeException('Block 1647 not found.');
}

if ($backupPath !== '') {
    $backupDir = dirname($backupPath);
    if (!is_dir($backupDir)) {
        mkdir($backupDir, 0755, true);
    }
    file_put_contents(
        $backupPath,
        wp_json_encode(
            [
                'backup_time' => gmdate('c'),
                'post' => get_object_vars($post),
            ],
            JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
        )
    );
}

$target = <<<'BLOCK'

[section]

[row]

[col span__sm="12"]

<h3>SẢN PHẨM TƯƠNG TỰ</h3>
[ux_products cat="75,71,70" products="20"]

[/col]

[/row]

[/section]
BLOCK;

$content = (string) $post->post_content;
$newContent = str_replace($target, "\n", $content, $count);
if ($count !== 1) {
    throw new RuntimeException('Related products section was not found exactly once.');
}

wp_update_post([
    'ID' => 1647,
    'post_content' => $newContent,
]);
clean_post_cache(1647);

echo "RELATED_SECTION_REMOVED\n";
