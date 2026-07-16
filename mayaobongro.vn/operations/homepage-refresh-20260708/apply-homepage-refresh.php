<?php

declare(strict_types=1);

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? $siteRoot . '/wp-content/uploads/codex-ops/homepage-refresh-20260708';

require rtrim($siteRoot, '/') . '/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';

$pageId = 75;
$page = get_post($pageId);

if (!$page instanceof WP_Post) {
    fwrite(STDERR, "Homepage {$pageId} not found.\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His');
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$backupPayload = [
    'page_id' => $pageId,
    'captured_at' => gmdate('c'),
    'post_title' => $page->post_title,
    'post_content' => $page->post_content,
    'theme_mods' => [
        'site_logo' => get_theme_mod('site_logo'),
        'site_logo_dark' => get_theme_mod('site_logo_dark'),
        'custom_logo' => get_theme_mod('custom_logo'),
        'logo_width' => get_theme_mod('logo_width'),
    ],
];

file_put_contents(
    $backupDir . '/homepage-before.json',
    wp_json_encode($backupPayload, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES)
);

function ensure_attachment(string $assetPath, string $targetFilename, string $title, string $alt): int
{
    $uploads = wp_upload_dir();
    $relativePath = trim($uploads['subdir'], '/') . '/' . $targetFilename;
    $absolutePath = trailingslashit($uploads['basedir']) . $targetFilename;

    if (!is_file($assetPath)) {
        throw new RuntimeException('Missing asset: ' . $assetPath);
    }

    if (!is_file($absolutePath)) {
        if (!copy($assetPath, $absolutePath)) {
            throw new RuntimeException('Unable to copy asset into uploads: ' . $absolutePath);
        }
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
        $mime = wp_check_filetype($targetFilename, null);
        $attachmentId = wp_insert_attachment([
            'post_mime_type' => $mime['type'] ?: 'image/webp',
            'post_title' => $title,
            'post_content' => '',
            'post_status' => 'inherit',
        ], $absolutePath);

        if (is_wp_error($attachmentId) || !$attachmentId) {
            throw new RuntimeException('Failed to create attachment for ' . $targetFilename);
        }
    }

    update_attached_file($attachmentId, $absolutePath);
    update_post_meta($attachmentId, '_wp_attachment_image_alt', $alt);

    $metadata = wp_generate_attachment_metadata($attachmentId, $absolutePath);
    if (!empty($metadata)) {
        wp_update_attachment_metadata($attachmentId, $metadata);
    }

    return $attachmentId;
}

$assetsDir = rtrim($batchRoot, '/') . '/assets';
$headerLogoId = ensure_attachment(
    $assetsDir . '/mayaobongro-header-logo-20260708-v4.png',
    'mayaobongro-header-logo-20260708-v4.png',
    'Mayaobongro.vn header logo 20260708 v4',
    'Mayaobongro.vn'
);
$logoSectionId = ensure_attachment(
    $assetsDir . '/home-logo-basketball-20260708.webp',
    'home-logo-basketball-20260708.webp',
    'Logo doi bong ro homepage 20260708',
    'Logo doi bong ro theo yeu cau'
);
$adultsSectionId = ensure_attachment(
    $assetsDir . '/home-adults-basketball-20260708.webp',
    'home-adults-basketball-20260708.webp',
    'Ao bong ro nguoi lon homepage 20260708',
    'Mau ao bong ro nguoi lon'
);
$kidsSectionId = ensure_attachment(
    $assetsDir . '/home-kids-basketball-20260708.webp',
    'home-kids-basketball-20260708.webp',
    'Ao bong ro tre em homepage 20260708',
    'Mau ao bong ro tre em'
);

set_theme_mod('site_logo', $headerLogoId);
set_theme_mod('site_logo_dark', $headerLogoId);
set_theme_mod('custom_logo', $headerLogoId);
set_theme_mod('logo_width', '330');

$content = $page->post_content;

$content = preg_replace(
    '/\[tab title="SAO VÀNG"\].*?\[\/tab\]\s*/s',
    '',
    $content,
    -1,
    $removedTabs
);

if ($removedTabs < 3) {
    throw new RuntimeException('Expected to remove Sao Vang tabs from all homepage tab groups.');
}

$oldSaoVangSection = <<<'TXT'
[ux_image id="1635" link="https://mayaobongro.vn/ao-bong-ro-co-do-sao-vang/" visibility="show-for-small"]

[ux_image id="1635" link="https://mayaobongro.vn/ao-bong-ro-co-do-sao-vang/" visibility="show-for-medium hide-for-small"]

[section label="VietNam" padding__sm="0px" video_visibility="visible"]

[ux_banner height="35%" bg="1614" bg_size="2048x2048" bg_pos="100% 0%" visibility="hide-for-medium"]

[text_box width="41" width__sm="80" scale__sm="103" position_x="95" position_x__sm="90" position_y="50" position_y__sm="50" text_align="left" visibility="hide-for-medium"]

[ux_text font_size="1.45" font_size__sm="0.75" line_height__sm="1.6" text_align="left" text_align__sm="right" text_color="rgb(22, 40, 64)"]

<h3><strong>ÁO BÓNG RỔ SAO VÀNG</strong></h3>
<p>Thiết kế tại Việt Nam – dành cho người Việt. Áo bóng rổ tối giản, năng động, sẵn sàng đồng hành trên mọi hành trình.</p>
[/ux_text]
[button text="Xem THÊM MẪU" color="alert" style="outline" radius="99" link="https://mayaobongro.vn/ao-bong-ro-co-do-sao-vang/"]


[/text_box]

[/ux_banner]
[row]

[col span__sm="12" divider="0" margin="-150px 0px -47px 0px" margin__sm="-20px 0px -47px 0px" margin__md="-25px 0px -9px 0px" align="center"]

[ux_products type="row" columns="4" columns__md="3" columns__sm="2" cat="72" products="12"]


[/col]

[/row]

[/section]
TXT;

$content = str_replace($oldSaoVangSection . "\n", '', $content, $removedSectionCount);
if ($removedSectionCount !== 1) {
    throw new RuntimeException('Expected to remove the Sao Vang promo section exactly once.');
}

$oldAdultSection = <<<'TXT'
[ux_image id="1634" link="https://mayaobongro.vn/ao-bong-ro-sat-nach/" visibility="show-for-small"]

[ux_image id="1634" link="https://mayaobongro.vn/ao-bong-ro-sat-nach/" visibility="show-for-medium hide-for-small"]

[section label="Áo Bóng Rổ Ko Tay" padding__sm="0px" video_visibility="visible"]

[ux_banner height="35%" bg="1598" bg_size="2048x2048" bg_pos="0% 45%" visibility="hide-for-medium"]

[text_box width="42" width__sm="80" scale__sm="103" position_x="0" position_x__sm="90" position_y="25" position_y__sm="50" text_align="right" visibility="hide-for-medium"]

[ux_text font_size="1.45" font_size__sm="0.75" line_height__sm="1.6" text_align="right" text_align__sm="right" text_color="rgb(22, 40, 64)"]

<h3><strong>ÁO BÓNG RỔ SINGLET</strong></h3>
<p>Áo bóng rổ sát nách Mayaobongro.vn – thiết kế tối giản, thoáng mát tối đa, giúp cơ thể luôn khô ráo và linh hoạt trên từng bước chạy.</p>
[/ux_text]
[button text="Xem THÊM MẪU" color="alert" style="outline" radius="99" link="https://mayaobongro.vn/ao-bong-ro-sat-nach/"]


[/text_box]

[/ux_banner]
[row]

[col span__sm="12" divider="0" margin="-150px 0px -60px 0px" margin__sm="-20px 0px -30px 0px" margin__md="-25px 0px -30px 0px" align="center"]

[ux_products type="row" columns="4" columns__md="3" columns__sm="2" cat="70" products="12"]


[/col]

[/row]

[/section]
TXT;

$newAdultSection = <<<TXT
[ux_image id="{$adultsSectionId}" link="https://mayaobongro.vn/ao-bong-ro-sat-nach/" visibility="show-for-small"]

[ux_image id="{$adultsSectionId}" link="https://mayaobongro.vn/ao-bong-ro-sat-nach/" visibility="show-for-medium hide-for-small"]

[section label="Nguoi Lon" padding__sm="0px" video_visibility="visible"]

[ux_banner height="35%" bg="{$adultsSectionId}" bg_size="2048x2048" bg_pos="50% 50%" visibility="hide-for-medium"]

[text_box width="42" width__sm="80" scale__sm="103" position_x="8" position_x__sm="90" position_y="34" position_y__sm="50" text_align="right" visibility="hide-for-medium"]

[ux_text font_size="1.45" font_size__sm="0.75" line_height__sm="1.6" text_align="right" text_align__sm="right" text_color="rgb(22, 40, 64)"]

<h3><strong>MẪU BÓNG RỔ NGƯỜI LỚN</strong></h3>
<p>Form rộng, phối màu gọn và dễ vận động cho đội phong trào, CLB công ty hoặc nhóm bạn cần mẫu áo bóng rổ nhìn hiện đại ngay từ cái nhìn đầu tiên.</p>
[/ux_text]
[button text="Xem MẪU NGƯỜI LỚN" color="alert" style="outline" radius="99" link="https://mayaobongro.vn/ao-bong-ro-sat-nach/"]


[/text_box]

[/ux_banner]
[row]

[col span__sm="12" divider="0" margin="-150px 0px -60px 0px" margin__sm="-20px 0px -30px 0px" margin__md="-25px 0px -30px 0px" align="center"]

[ux_products type="row" columns="4" columns__md="3" columns__sm="2" cat="70" products="12"]


[/col]

[/row]

[/section]
TXT;

$content = str_replace($oldAdultSection, $newAdultSection, $content, $adultReplaceCount);
if ($adultReplaceCount !== 1) {
    throw new RuntimeException('Expected to replace the adult promo section exactly once.');
}

$oldKidsSection = <<<'TXT'
[ux_image id="1636" link="https://mayaobongro.vn/may-ao-bong-ro-thiet-ke-rieng-x24/" visibility="show-for-small"]

[ux_image id="1636" link="https://mayaobongro.vn/may-ao-bong-ro-thiet-ke-rieng-x24/" visibility="show-for-medium hide-for-small"]

[section label="Thietkerieng" padding__sm="0px" video_visibility="visible"]

[ux_banner height="35%" bg="1615" bg_size="2048x2048" bg_pos="1% 0%" visibility="hide-for-medium"]

[text_box width="42" width__sm="80" scale__sm="103" position_x="5" position_x__sm="90" position_y="50" position_y__sm="50" text_align="right" visibility="hide-for-medium"]

[ux_text font_size="1.45" font_size__sm="0.75" line_height__sm="1.6" text_align="right" text_align__sm="right" text_color="rgb(22, 40, 64)"]

<h3><strong>ÁO CHẠY THIẾT KẾ RIÊNG</strong></h3>
<p>Không đại trà – chỉ dành cho bạn. Áo bóng rổ thiết kế riêng, khác biệt ngay từ cái nhìn đầu tiên.</p>
[/ux_text]
[button text="Xem THÊM MẪU" color="alert" style="outline" radius="99" link="https://mayaobongro.vn/may-ao-bong-ro-thiet-ke-rieng-x24/"]


[/text_box]

[/ux_banner]
[row]

[col span__sm="12" divider="0" margin="-150px 0px -37px 0px" margin__sm="-20px 0px -51px 0px" margin__md="-25px 0px -10px 0px" align="center"]

[ux_products type="row" columns="4" columns__md="3" columns__sm="2" cat="75" products="12"]


[/col]

[/row]

[/section]
TXT;

$newKidsSection = <<<TXT
[ux_image id="{$kidsSectionId}" link="https://mayaobongro.vn/may-ao-bong-ro-thiet-ke-rieng-x24/" visibility="show-for-small"]

[ux_image id="{$kidsSectionId}" link="https://mayaobongro.vn/may-ao-bong-ro-thiet-ke-rieng-x24/" visibility="show-for-medium hide-for-small"]

[section label="Tre Em" padding__sm="0px" video_visibility="visible"]

[ux_banner height="35%" bg="{$kidsSectionId}" bg_size="2048x2048" bg_pos="50% 50%" visibility="hide-for-medium"]

[text_box width="42" width__sm="80" scale__sm="103" position_x="7" position_x__sm="90" position_y="46" position_y__sm="50" text_align="right" visibility="hide-for-medium"]

[ux_text font_size="1.45" font_size__sm="0.75" line_height__sm="1.6" text_align="right" text_align__sm="right" text_color="rgb(22, 40, 64)"]

<h3><strong>MẪU BÓNG RỔ TRẺ EM</strong></h3>
<p>Màu sắc tươi, size linh hoạt theo lứa tuổi và dễ tùy biến cho lớp học, đội trường hoặc nhóm thiếu niên muốn có bộ đồng phục bóng rổ thật nổi bật.</p>
[/ux_text]
[button text="Xem MẪU TRẺ EM" color="alert" style="outline" radius="99" link="https://mayaobongro.vn/may-ao-bong-ro-thiet-ke-rieng-x24/"]


[/text_box]

[/ux_banner]
[row]

[col span__sm="12" divider="0" margin="-150px 0px -37px 0px" margin__sm="-20px 0px -51px 0px" margin__md="-25px 0px -10px 0px" align="center"]

[ux_products type="row" columns="4" columns__md="3" columns__sm="2" cat="75" products="12"]


[/col]

[/row]

[/section]
TXT;

$content = str_replace($oldKidsSection, $newKidsSection, $content, $kidsReplaceCount);
if ($kidsReplaceCount !== 1) {
    throw new RuntimeException('Expected to replace the kids promo section exactly once.');
}

$oldLogoSection = <<<'TXT'
[ux_image id="1637" link="https://mayaobongro.vn/logo-doi-bong-ro/" visibility="show-for-small"]

[ux_image id="1637" link="https://mayaobongro.vn/logo-doi-bong-ro/" visibility="show-for-medium hide-for-small"]

[section label="Logo" padding__sm="0px" video_visibility="visible"]

[ux_banner height="30%" bg="1620" bg_size="2048x2048" bg_pos="49% 100%" visibility="hide-for-medium"]

[text_box width="42" width__sm="80" scale__sm="103" position_x="50" position_x__sm="90" position_y="15" position_y__sm="50" visibility="hide-for-medium"]

[ux_text font_size="1.45" font_size__sm="0.75" line_height__sm="1.6" text_align="center" text_align__sm="right" text_color="rgb(22, 40, 64)"]

<h3><strong>LOGO ĐỘI CHẠY X24</strong></h3>
<p>Thiết kế logo theo yêu cầu – độc quyền, không trùng lặp, thể hiện cá tính đội nhóm.</p>
[/ux_text]
[button text="Xem TẤT CẢ" color="alert" style="outline" radius="99" link="https://mayaobongro.vn/logo-doi-bong-ro/"]


[/text_box]

[/ux_banner]
[row]

[col span__sm="12" divider="0" margin="-150px 0px 0px 0px" margin__sm="-20px 0px -30px 0px" margin__md="-25px 0px -39px 0px" align="center"]

[ux_products type="row" columns="4" columns__md="3" columns__sm="2" cat="73" products="12"]


[/col]

[/row]

[/section]
TXT;

$newLogoSection = <<<TXT
[ux_image id="{$logoSectionId}" link="https://mayaobongro.vn/logo-doi-bong-ro/" visibility="show-for-small"]

[ux_image id="{$logoSectionId}" link="https://mayaobongro.vn/logo-doi-bong-ro/" visibility="show-for-medium hide-for-small"]

[section label="Logo" padding__sm="0px" video_visibility="visible"]

[ux_banner height="30%" bg="{$logoSectionId}" bg_size="2048x2048" bg_pos="50% 50%" visibility="hide-for-medium"]

[text_box width="42" width__sm="80" scale__sm="103" position_x="50" position_x__sm="90" position_y="18" position_y__sm="50" visibility="hide-for-medium"]

[ux_text font_size="1.45" font_size__sm="0.75" line_height__sm="1.6" text_align="center" text_align__sm="right" text_color="rgb(22, 40, 64)"]

<h3><strong>LOGO ĐỘI BÓNG RỔ</strong></h3>
<p>Thiết kế logo theo yêu cầu với tinh thần mạnh, gọn, dễ nhận diện và phù hợp cho đội lớp, CLB hoặc giải phong trào.</p>
[/ux_text]
[button text="Xem TẤT CẢ" color="alert" style="outline" radius="99" link="https://mayaobongro.vn/logo-doi-bong-ro/"]


[/text_box]

[/ux_banner]
[row]

[col span__sm="12" divider="0" margin="-150px 0px 0px 0px" margin__sm="-20px 0px -30px 0px" margin__md="-25px 0px -39px 0px" align="center"]

[ux_products type="row" columns="4" columns__md="3" columns__sm="2" cat="73" products="12"]


[/col]

[/row]

[/section]
TXT;

$content = str_replace($oldLogoSection, $newLogoSection, $content, $logoReplaceCount);
if ($logoReplaceCount !== 1) {
    throw new RuntimeException('Expected to replace the logo promo section exactly once.');
}

$content = str_replace(
    'Phục vụ các CLB bóng rổ, giải marathon, team building trên toàn quốc',
    'Phục vụ các CLB bóng rổ, đội lớp và giải phong trào trên toàn quốc',
    $content,
    $socialProofReplaceCount
);

$content = str_replace(
    '"Áo chất lượng rất tốt, vải thoáng mát, in sắc nét. Đội mình rất hài lòng khi mặc lúc chạy giải. Sẽ ủng hộ dài dài!"',
    '"Áo chất lượng rất tốt, vải thoáng mát, in sắc nét. Đội mình rất hài lòng khi mặc lúc thi đấu. Sẽ ủng hộ dài dài!"',
    $content,
    $testimonialReplaceCount
);

$content = str_replace(
    '<li>→ <a href="/ao-bong-ro-co-do-sao-vang/" style="color:#aaa">Áo Cờ Đỏ Sao Vàng</a></li>' . "\n",
    '',
    $content,
    $footerReplaceCount
);

if ($socialProofReplaceCount !== 1 || $testimonialReplaceCount !== 1 || $footerReplaceCount !== 1) {
    throw new RuntimeException('Expected homepage cleanup strings were not all replaced.');
}

if (strpos($content, 'SAO VÀNG') !== false || strpos($content, 'LOGO ĐỘI CHẠY') !== false || strpos($content, 'ÁO BÓNG RỔ SINGLET') !== false || strpos($content, 'ÁO CHẠY THIẾT KẾ RIÊNG') !== false) {
    throw new RuntimeException('Residual homepage copy detected after replacement.');
}

$updated = wp_update_post([
    'ID' => $pageId,
    'post_content' => $content,
], true);

if (is_wp_error($updated)) {
    throw new RuntimeException($updated->get_error_message());
}

echo wp_json_encode([
    'page_id' => $pageId,
    'backup_dir' => $backupDir,
    'header_logo_id' => $headerLogoId,
    'section_assets' => [
        'logo' => $logoSectionId,
        'adults' => $adultsSectionId,
        'kids' => $kidsSectionId,
    ],
    'removed_sao_vang_tabs' => $removedTabs,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES) . "\n";
