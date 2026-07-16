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

$backupDir = rtrim($batchRoot, '/') . '/backups/' . gmdate('Ymd-His');
if (!wp_mkdir_p($backupDir)) {
    fwrite(STDERR, "Unable to create backup directory: {$backupDir}\n");
    exit(1);
}

$page = get_page_by_path('elements/pages/gioi-thieu', OBJECT, 'page');
if (!$page instanceof WP_Post) {
    $page = get_page_by_path('gioi-thieu', OBJECT, 'page');
}
if (!$page instanceof WP_Post) {
    fwrite(STDERR, "About page not found.\n");
    exit(1);
}

$pageId = (int) $page->ID;
$backup = [
    'captured_at' => current_time('c'),
    'page_id' => $pageId,
    'before_permalink' => get_permalink($pageId),
    'post' => $wpdb->get_row(
        $wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $pageId),
        ARRAY_A
    ),
    'meta' => $wpdb->get_results(
        $wpdb->prepare("SELECT * FROM {$wpdb->postmeta} WHERE post_id = %d ORDER BY meta_id", $pageId),
        ARRAY_A
    ),
];

file_put_contents(
    $backupDir . '/page-92-before.json',
    wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL
);

$content = <<<'HTML'
[ux_banner height="260px" bg="19" bg_overlay="rgba(0, 0, 0, 0.54)" parallax="3"]

[text_box position_x="50" position_y="50"]

[ux_text]

<h1 style="text-align: center;">Giới thiệu về Mayaobongro.vn</h1>
<p style="text-align: center;"><strong>Thiết kế và sản xuất áo bóng rổ theo yêu cầu bởi X24 Sport</strong></p>

[/ux_text]

[/text_box]

[/ux_banner]

[row]

[col span__sm="12"]

<h2>May áo bóng rổ theo yêu cầu cho đội nhóm, trường học và câu lạc bộ</h2>
<p><strong>Mayaobongro.vn</strong> là website chuyên về thiết kế, tư vấn và sản xuất áo bóng rổ theo yêu cầu, thuộc <strong>Công ty TNHH Thương Mại - Dịch Vụ Thể Thao X24</strong>. Chúng tôi tập trung vào đồng phục bóng rổ cho đội nhóm, câu lạc bộ, trường học, giải đấu và các đơn vị cần một bộ trang phục đồng bộ, nổi bật, đúng tinh thần của đội.</p>
<p>Đứng sau Mayaobongro.vn là đội ngũ X24 Sport với kinh nghiệm tư vấn và sản xuất áo đấu thể thao cho nhiều bộ môn như bóng đá, bóng rổ, bóng chuyền, cầu lông và chạy bộ. Nhờ hiểu đặc thù vận động của từng môn, chúng tôi không chỉ làm áo đẹp trên bản thiết kế mà còn chú trọng form áo, chất liệu, độ thoáng và sự thoải mái khi thi đấu.</p>

<h2>Đồng hành cùng khách hàng từ ý tưởng đến sản phẩm hoàn thiện</h2>
<p>Dù bạn đã có sẵn mẫu tham khảo, logo đội, màu chủ đạo hay chỉ mới có một ý tưởng ban đầu, Mayaobongro.vn đều có thể hỗ trợ phát triển thành mẫu áo bóng rổ hoàn chỉnh. Đội ngũ tư vấn sẽ cùng bạn thống nhất phong cách thiết kế, phối màu, vị trí logo, tên cầu thủ, số áo và các chi tiết nhận diện riêng của đội.</p>
<p>Chúng tôi hướng đến các mẫu áo có tính cá nhân hóa cao, phù hợp với từng độ tuổi và mục đích sử dụng: thi đấu phong trào, giải học sinh - sinh viên, giải công ty, câu lạc bộ bán chuyên hoặc đội nhóm muốn có hình ảnh chuyên nghiệp hơn khi ra sân.</p>

<h2>Vì sao khách hàng chọn Mayaobongro.vn?</h2>
<ul>
<li><strong>Tư vấn sát nhu cầu:</strong> CEO Thu Hiền có hơn 5 năm kinh nghiệm tư vấn và sản xuất áo đấu thể thao, trực tiếp định hướng quy trình phục vụ khách hàng của X24.</li>
<li><strong>Thiết kế linh hoạt:</strong> hỗ trợ phát triển mẫu theo màu sắc, logo, concept đội bóng hoặc mẫu tham khảo của khách hàng.</li>
<li><strong>Chất liệu thể thao phù hợp:</strong> ưu tiên vải nhẹ, thoáng, co giãn và thấm hút tốt để vận động thoải mái trên sân bóng rổ.</li>
<li><strong>Sản xuất theo yêu cầu:</strong> nhận đơn cho đội nhóm nhỏ, câu lạc bộ, trường học, doanh nghiệp và các giải đấu cần số lượng lớn.</li>
<li><strong>Quy trình rõ ràng:</strong> tư vấn, lên thiết kế, xác nhận thông tin, sản xuất và giao hàng theo từng bước minh bạch.</li>
</ul>

<h2>Giải pháp đồng phục bóng rổ trọn gói</h2>
<p>Mayaobongro.vn không chỉ cung cấp một mẫu áo, mà là giải pháp đồng phục bóng rổ trọn gói cho đội của bạn. Từ form áo sát nách, áo có tay, quần bóng rổ đồng bộ, logo đội, tên - số áo cho đến lựa chọn chất liệu và size, chúng tôi đều cố gắng tối ưu để sản phẩm khi nhận về có thể sử dụng ngay cho tập luyện, thi đấu hoặc sự kiện.</p>
<p>Nếu đội của bạn đang cần may áo bóng rổ thiết kế riêng, hãy gửi cho Mayaobongro.vn logo, màu sắc mong muốn, số lượng dự kiến và thời gian cần nhận hàng. X24 Sport sẽ tư vấn phương án phù hợp để đội có một bộ đồng phục đẹp, dễ mặc và mang dấu ấn riêng trên sân.</p>

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
    'status' => 'updated',
    'page_id' => $pageId,
    'before_permalink' => $backup['before_permalink'],
    'after_permalink' => get_permalink($pageId),
    'backup_dir' => $backupDir,
    'post_parent' => (int) get_post_field('post_parent', $pageId),
    'post_name' => (string) get_post_field('post_name', $pageId),
    'post_title' => (string) get_post_field('post_title', $pageId),
];

file_put_contents(
    $backupDir . '/page-92-after.json',
    wp_json_encode($after, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL
);

echo wp_json_encode($after, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
