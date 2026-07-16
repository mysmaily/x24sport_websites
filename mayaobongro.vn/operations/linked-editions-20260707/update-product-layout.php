<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$blockId = isset($argv[2]) ? (int) $argv[2] : 1647;

require rtrim($siteRoot, '/') . '/wp-load.php';

$block = get_post($blockId);
if (!$block || $block->post_type !== 'blocks') {
    throw new RuntimeException("Flatsome product-layout block not found: {$blockId}");
}

$content = (string) $block->post_content;
$replacements = [
    '[ux_text][x24_product_colors][/ux_text]' => '[ux_text][mayaobongro_x24_product_colors][/ux_text]',
    '[ux_text][x24_product_summary][/ux_text]' => '[ux_text][mayaobongro_x24_product_summary][/ux_text]',
    '[ux_text][x24_product_size_guide][/ux_text]' => '[ux_text][mayaobongro_x24_product_size_guide][/ux_text]',
    '[x24_product_colors]' => '[ux_text][mayaobongro_x24_product_colors][/ux_text]',
    '[x24_product_summary]' => "[ux_text][mayaobongro_x24_product_summary][/ux_text]\n"
        . '[ux_text][mayaobongro_school_edition_switcher][/ux_text]',
    '[x24_product_size_guide]' => '[ux_text][mayaobongro_x24_product_size_guide][/ux_text]',
];

foreach ($replacements as $source => $replacement) {
    if (str_contains($content, $replacement)) {
        continue;
    }
    if (!str_contains($content, $source)) {
        throw new RuntimeException("Expected layout token is missing: {$source}");
    }
    $content = str_replace($source, $replacement, $content);
}

$updated = wp_update_post(wp_slash([
    'ID' => $blockId,
    'post_content' => $content,
]), true);

if (is_wp_error($updated)) {
    throw new RuntimeException($updated->get_error_message());
}

clean_post_cache($blockId);

echo wp_json_encode([
    'block_id' => $blockId,
    'updated' => true,
    'summary_wrapped' => str_contains(
        $content,
        '[ux_text][mayaobongro_x24_product_summary][/ux_text]'
    ),
    'switcher_added' => str_contains(
        $content,
        '[ux_text][mayaobongro_school_edition_switcher][/ux_text]'
    ),
    'colors_wrapped' => str_contains(
        $content,
        '[ux_text][mayaobongro_x24_product_colors][/ux_text]'
    ),
    'size_guide_wrapped' => str_contains(
        $content,
        '[ux_text][mayaobongro_x24_product_size_guide][/ux_text]'
    ),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES), PHP_EOL;
