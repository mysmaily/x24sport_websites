<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/about-page-20260711';

require rtrim($siteRoot, '/') . '/wp-load.php';

global $wpdb;

if (!wp_mkdir_p($batchRoot)) {
    fwrite(STDERR, "Unable to create batch directory: {$batchRoot}\n");
    exit(1);
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His') . '-fix-rendered-css';
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$page = get_page_by_path('gioi-thieu', OBJECT, 'page');
if (!$page instanceof WP_Post) {
    fwrite(STDERR, "About page not found.\n");
    exit(1);
}

$pageId = (int) $page->ID;
$backup = [
    'captured_at' => current_time('c'),
    'page_id' => $pageId,
    'permalink' => get_permalink($pageId),
    'post' => $wpdb->get_row(
        $wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $pageId),
        ARRAY_A
    ),
];

file_put_contents(
    $backupDir . '/page-92-before-fix-rendered-css.json',
    wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL
);

$content = <<<'HTML'
[ux_banner height="190px" height__sm="145px" bg="19" bg_overlay="rgba(0, 0, 0, 0.56)" parallax="0"]

[text_box position_x="50" position_y="50"]

[ux_text]

<h1 style="text-align: center; font-size: 34px; line-height: 1.15; margin: 0 0 10px;">Giới thiệu về Mayaobongro.vn</h1>
<p style="text-align: center; font-size: 18px; line-height: 1.45; margin: 0;"><strong>Xưởng may áo bóng rổ thiết kế riêng cho đội nhóm</strong></p>

[/ux_text]

[/text_box]

[/ux_banner]

[row]

[col span__sm="12"]

<div style="max-width: 980px; margin: 0 auto;">
<h2>May áo bóng rổ theo yêu cầu</h2>
<p><strong>Mayaobongro.vn</strong> chuyên tư vấn, thiết kế và sản xuất áo bóng rổ theo yêu cầu cho đội nhóm, câu lạc bộ, lớp học, trường học, doanh nghiệp và các giải đấu phong trào.</p>
<p>Chúng tôi tập trung vào những bộ đồng phục dễ mặc, dễ vận động và có dấu ấn riêng của từng đội: màu sắc chủ đạo, logo, tên cầu thủ, số áo, slogan hoặc họa tiết nhận diện.</p>

<h2>Thiết kế riêng, tư vấn rõ ràng</h2>
<p>Khách hàng có thể gửi mẫu tham khảo, logo đội hoặc chỉ cần mô tả ý tưởng. Đội ngũ Mayaobongro.vn sẽ tư vấn phương án phối màu, form áo, chất liệu và bố cục in để mẫu áo lên hình hài hòa trước khi sản xuất.</p>
<p>Mỗi đơn hàng đều được xác nhận thiết kế, size, số lượng và thông tin in ấn trước khi may, giúp đội hạn chế sai sót và chủ động thời gian nhận hàng.</p>

<h2>Điều chúng tôi ưu tiên</h2>
<ul>
<li><strong>Đúng tinh thần đội:</strong> thiết kế đồng bộ, nổi bật nhưng vẫn dễ sử dụng lâu dài.</li>
<li><strong>Form thể thao thoải mái:</strong> phù hợp tập luyện, thi đấu và sinh hoạt đội nhóm.</li>
<li><strong>Chất liệu dễ vận động:</strong> ưu tiên độ thoáng, nhẹ và thấm hút tốt.</li>
<li><strong>Quy trình gọn:</strong> tư vấn, lên mẫu, xác nhận, sản xuất và giao hàng theo từng bước rõ ràng.</li>
</ul>

<h2>Phù hợp cho nhiều nhu cầu</h2>
<p>Mayaobongro.vn nhận may áo bóng rổ cho đội học sinh, sinh viên, câu lạc bộ, nhóm bạn, công ty, giải đấu và các đội cần đồng phục thi đấu riêng. Tùy mục đích sử dụng, chúng tôi sẽ gợi ý form áo, kiểu phối màu và chất liệu phù hợp.</p>
<p>Nếu đội của bạn đang cần một mẫu áo bóng rổ riêng, hãy gửi logo, màu sắc mong muốn, số lượng và thời gian cần nhận hàng. Mayaobongro.vn sẽ tư vấn phương án phù hợp để đội có một bộ đồng phục đẹp, rõ nhận diện và sẵn sàng ra sân.</p>
</div>

[/col]

[/row]
HTML;

$result = wp_update_post([
    'ID' => $pageId,
    'post_title' => 'Giới thiệu về Mayaobongro.vn',
    'post_name' => 'gioi-thieu',
    'post_parent' => 0,
    'post_content' => $content,
], true);

if (is_wp_error($result)) {
    fwrite(STDERR, $result->get_error_message() . "\n");
    exit(1);
}

clean_post_cache($pageId);
flush_rewrite_rules(false);

if (class_exists('autoptimizeCache')) {
    autoptimizeCache::clearall();
}

$after = [
    'status' => 'fixed_rendered_css',
    'page_id' => $pageId,
    'permalink' => get_permalink($pageId),
    'backup_dir' => $backupDir,
    'has_style_tag' => str_contains($content, '<style'),
    'has_private_terms' => [
        'ceo' => mb_stripos($content, 'CEO') !== false,
        'thu_hien' => mb_stripos($content, 'Thu Hiền') !== false,
        'legal_company' => mb_stripos($content, 'Công ty TNHH') !== false,
        'x24_sport' => mb_stripos($content, 'X24 Sport') !== false,
    ],
];

file_put_contents(
    $backupDir . '/page-92-after-fix-rendered-css.json',
    wp_json_encode($after, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL
);

echo wp_json_encode($after, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
