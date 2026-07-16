<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$assetRoot = $argv[2] ?? $siteRoot . '/wp-content/uploads/codex-ops/home-banner-text-overlay-20260711/assets';
$batchRoot = $argv[3] ?? $siteRoot . '/wp-content/uploads/codex-ops/home-banner-text-overlay-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$pageId = 75;
$page = get_post($pageId);
if (!$page instanceof WP_Post) {
    throw new RuntimeException('Homepage post 75 not found.');
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His');
wp_mkdir_p($backupDir);
file_put_contents(
    $backupDir . '/homepage-before.json',
    wp_json_encode([
        'page_id' => $pageId,
        'captured_at' => gmdate('c'),
        'post_title' => $page->post_title,
        'post_content' => $page->post_content,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);

function hero_ensure_attachment(string $assetRoot, string $filename, string $title, string $alt): int
{
    $uploads = wp_upload_dir();
    $relativePath = '2026/07/' . $filename;
    $absolutePath = trailingslashit($uploads['basedir']) . $relativePath;
    $sourcePath = rtrim($assetRoot, '/') . '/' . $filename;

    if (!is_file($sourcePath)) {
        throw new RuntimeException('Missing asset: ' . $sourcePath);
    }

    wp_mkdir_p(dirname($absolutePath));
    if (!copy($sourcePath, $absolutePath)) {
        throw new RuntimeException('Unable to copy asset to uploads: ' . $absolutePath);
    }

    $existing = get_posts([
        'post_type' => 'attachment',
        'post_status' => 'inherit',
        'posts_per_page' => 1,
        'fields' => 'ids',
        'meta_key' => '_wp_attached_file',
        'meta_value' => $relativePath,
    ]);

    if ($existing) {
        $attachmentId = (int) $existing[0];
    } else {
        $attachmentId = wp_insert_attachment([
            'post_mime_type' => 'image/webp',
            'post_title' => $title,
            'post_content' => '',
            'post_status' => 'inherit',
        ], $absolutePath);

        if (is_wp_error($attachmentId) || !$attachmentId) {
            throw new RuntimeException('Failed to insert attachment: ' . $filename);
        }
    }

    update_attached_file($attachmentId, $absolutePath);
    update_post_meta($attachmentId, '_wp_attachment_image_alt', $alt);
    $metadata = wp_generate_attachment_metadata($attachmentId, $absolutePath);
    if ($metadata) {
        wp_update_attachment_metadata($attachmentId, $metadata);
    }

    return $attachmentId;
}

$ids = [];
foreach ([1, 2, 3] as $slide) {
    foreach (['desktop', 'tablet', 'mobile'] as $device) {
        $filename = "mayaobongro-clean-hero-{$slide}-{$device}-20260711.webp";
        $ids[$device][$slide] = hero_ensure_attachment(
            $assetRoot,
            $filename,
            "Mayaobongro clean homepage hero {$slide} {$device} 20260711",
            "Mẫu áo bóng rổ thiết kế riêng Mayaobongro.vn"
        );
    }
}

function hero_text_block(int $slide, bool $isH1): string
{
    $slides = [
        1 => [
            'class' => '',
            'kicker' => 'Đơn gấp vẫn đẹp',
            'headline' => 'MAY ÁO BÓNG RỔ<br><strong>LẤY NHANH 1-3 NGÀY</strong>',
            'subtitle' => 'Chốt mẫu hôm nay, lên thiết kế và sản xuất nhanh cho đội bóng, lớp học, giải đấu.',
            'benefits' => [
                'May nhanh 1-3 ngày',
                'Ưu tiên đơn cần gấp',
                'Tư vấn form theo đội',
                'Giao hàng toàn quốc',
            ],
            'proof' => ['Áo 3 lỗ', 'Áo có tay', 'Quần đồng bộ'],
            'link' => 'https://mayaobongro.vn/mau-ao-bong-ro/',
            'button' => 'Xem mẫu',
        ],
        2 => [
            'class' => '',
            'kicker' => 'Thiết kế không tính phí',
            'headline' => 'THIẾT KẾ ÁO ĐỘI<br><strong>THEO ĐÚNG YÊU CẦU</strong>',
            'subtitle' => 'Lên phối màu, tên số, logo đội và mockup duyệt trước khi may.',
            'benefits' => [
                'Miễn phí thiết kế',
                'Duyệt mockup trước',
                'In tên số sắc nét',
                'Chỉnh màu theo logo',
            ],
            'proof' => ['Logo đội', 'Tên số riêng', 'Bảng màu tự chọn'],
            'link' => 'https://mayaobongro.vn/dat-may-ao-bong-ro/',
            'button' => 'Đặt may',
        ],
        3 => [
            'class' => ' x24-home-hero-copy--dark x24-home-hero-copy--orange',
            'kicker' => 'May càng nhiều, giá càng tốt',
            'headline' => 'ĐỒNG PHỤC BÓNG RỔ<br><strong>CHO TEAM &amp; GIẢI ĐẤU</strong>',
            'subtitle' => 'Tối ưu chi phí cho CLB, trường học, công ty và giải phong trào.',
            'benefits' => [
                'Chiết khấu cao',
                'Bảo hành 1 đổi 1',
                'Size trẻ em đến người lớn',
                'Đồng bộ áo và quần',
            ],
            'proof' => ['Đội lớp', 'CLB công ty', 'Giải phong trào'],
            'link' => 'https://mayaobongro.vn/bang-gia-may-ao-bong-ro/',
            'button' => 'Xem giá',
        ],
    ];

    $data = $slides[$slide];
    $titleTag = $isH1 ? 'h1' : 'h2';
    $benefits = implode('', array_map(static function (string $benefit): string {
        return '<span class="x24-home-hero-benefit">' . esc_html($benefit) . '</span>';
    }, $data['benefits']));
    $proof = implode('', array_map(static function (string $item): string {
        return '<span>' . esc_html($item) . '</span>';
    }, $data['proof']));

    return <<<HTML
<div class="x24-home-hero-copy{$data['class']}">
  <p class="x24-home-hero-kicker">{$data['kicker']}</p>
  <{$titleTag} class="x24-home-hero-title">{$data['headline']}</{$titleTag}>
  <p class="x24-home-hero-subtitle">{$data['subtitle']}</p>
  <div class="x24-home-hero-benefits">{$benefits}</div>
  <div class="x24-home-hero-proof">{$proof}</div>
  <a class="x24-home-hero-button" href="{$data['link']}">{$data['button']}</a>
</div>
HTML;
}

function hero_banner(int $slide, int $bgId, string $height, bool $isH1, bool $dark = false): string
{
    $bannerClass = $dark ? 'x24-home-hero-banner x24-home-hero-banner--dark' : 'x24-home-hero-banner';
    $text = hero_text_block($slide, $isH1);

    return <<<TXT
[ux_banner class="{$bannerClass}" height="{$height}" bg="{$bgId}" bg_size="cover" bg_pos="50% 50%"]

[text_box width="44" width__md="52" width__sm="58" position_x="17" position_x__md="17" position_x__sm="6" position_y="47" position_y__sm="50" text_align="left"]

{$text}

[/text_box]

[/ux_banner]
TXT;
}

$newHero = "[section]\n\n";
$newHero .= "[ux_slider timer=\"5000\" visibility=\"hide-for-medium\"]\n\n";
foreach ([1, 2, 3] as $slide) {
    $newHero .= hero_banner($slide, $ids['desktop'][$slide], '560px', $slide === 1, $slide === 3) . "\n";
}
$newHero .= "\n[/ux_slider]\n";
$newHero .= "[ux_slider timer=\"5000\" visibility=\"show-for-medium hide-for-small\"]\n\n";
foreach ([1, 2, 3] as $slide) {
    $newHero .= hero_banner($slide, $ids['tablet'][$slide], '500px', $slide === 1, $slide === 3) . "\n";
}
$newHero .= "\n[/ux_slider]\n";
$newHero .= "[ux_slider hide_nav=\"true\" timer=\"5000\" visibility=\"show-for-small\"]\n\n";
foreach ([1, 2, 3] as $slide) {
    $newHero .= hero_banner($slide, $ids['mobile'][$slide], '200px', $slide === 1, $slide === 3) . "\n";
}
$newHero .= "\n[/ux_slider]\n\n[/section]\n";

$content = (string) $page->post_content;
$secondSectionPos = strpos($content, '[section label="Mbile"');
if ($secondSectionPos === false) {
    throw new RuntimeException('Could not find boundary after homepage hero section.');
}

$updatedContent = $newHero . substr($content, $secondSectionPos);
$result = wp_update_post([
    'ID' => $pageId,
    'post_content' => $updatedContent,
], true);
if (is_wp_error($result)) {
    throw new RuntimeException($result->get_error_message());
}

$desktopOneUrl = wp_get_attachment_url($ids['desktop'][1]);
update_post_meta($pageId, '_yoast_wpseo_opengraph-image', $desktopOneUrl);
update_post_meta($pageId, '_yoast_wpseo_opengraph-image-id', $ids['desktop'][1]);
update_post_meta($pageId, '_yoast_wpseo_twitter-image', $desktopOneUrl);
update_post_meta($pageId, '_yoast_wpseo_twitter-image-id', $ids['desktop'][1]);

if (function_exists('wc_delete_product_transients')) {
    wc_delete_product_transients();
}
if (class_exists('autoptimizeCache')) {
    autoptimizeCache::clearall();
}

echo wp_json_encode([
    'backup_dir' => $backupDir,
    'page_id' => $pageId,
    'attachments' => $ids,
    'desktop_1_url' => $desktopOneUrl,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
