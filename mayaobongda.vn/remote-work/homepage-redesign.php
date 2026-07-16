<?php

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "CLI only.\n");
    exit(1);
}

require '/var/www/mayaobongda.vn/wp-load.php';

$page_id = 57;
$expected_hash = 'b167fc71694d349d8da618bae43f6a8e32220d3ec9633ecedcab313ec63334d9';
$dry_run = in_array('--dry-run', $argv, true);
$content = (string) get_post_field('post_content', $page_id);

if (strpos($content, 'x24-home-hero') !== false) {
    fwrite(STDOUT, "Homepage redesign already applied.\n");
    exit(0);
}

if (hash('sha256', $content) !== $expected_hash) {
    fwrite(STDERR, "Homepage content changed after audit. Refusing to update.\n");
    exit(2);
}

function assert_replacement_count($content, $pattern, $replacement, $expected, $label) {
    $updated = preg_replace($pattern, $replacement, $content, -1, $count);
    if ($updated === null || $count !== $expected) {
        fwrite(STDERR, sprintf("%s replacement count was %d, expected %d.\n", $label, $count, $expected));
        exit(3);
    }

    return $updated;
}

$content = str_replace(
    '[section label="Banner top trang chủ" padding="0px" padding__sm="10px"]',
    '[section label="Banner top trang chủ" padding="0px" padding__sm="0px" class="x24-home-hero"]',
    $content,
    $hero_section_count
);
if ($hero_section_count !== 1) {
    fwrite(STDERR, "Hero section replacement failed.\n");
    exit(3);
}

$content = str_replace(
    '[ux_image id="1432" image_size="2048x2048" height="450px" margin="0px" visibility="hide-for-medium"]',
    '[ux_image id="1432" image_size="2048x2048" margin="0px" visibility="hide-for-medium"]',
    $content,
    $desktop_hero_count
);
$content = str_replace(
    '[ux_image id="484" image_size="2048x2048" height="300px" margin="0px"]',
    '[ux_image id="484" image_size="2048x2048" margin="0px"]',
    $content,
    $mobile_hero_count
);
if ($desktop_hero_count !== 1 || $mobile_hero_count !== 1) {
    fwrite(STDERR, "Hero image replacement failed.\n");
    exit(3);
}

$category_modules = array(
    <<<'SHORTCODE'
[ux_html]
<div class="x24-category-feature">
  <div class="x24-category-copy">
    <h2>Áo không logo, sẵn sàng ra sân</h2>
    <p>Form thể thao dễ mặc, nhiều chất liệu thoáng khí và màu sắc đồng đội. Có thể in thêm tên, số và logo theo nhu cầu.</p>
    <a class="button primary" href="https://mayaobongda.vn/ao-khong-logo/">Xem mẫu áo</a>
  </div>
  <div class="x24-category-media">
    <img src="https://cdn.mayaobongda.vn/wp-content/uploads/2025/08/ao-bong-da-khong-logo-phui.jpg" alt="Mẫu áo bóng đá không logo cho đội bóng" width="800" height="800" loading="lazy">
  </div>
</div>
[/ux_html]
SHORTCODE,
    <<<'SHORTCODE'
[ux_html]
<div class="x24-category-feature is-reversed">
  <div class="x24-category-media">
    <img src="https://cdn.mayaobongda.vn/wp-content/uploads/2025/08/ao-bong-da-thiet-ke-theo-yeu-cau.jpg" alt="Áo bóng đá thiết kế theo yêu cầu" width="800" height="800" loading="lazy">
  </div>
  <div class="x24-category-copy">
    <h2>Thiết kế riêng cho bản sắc đội</h2>
    <p>Gửi màu sắc, logo và ý tưởng. Đội ngũ X24 Sport lên mẫu miễn phí, chỉnh sửa rõ ràng trước khi đưa vào may và in.</p>
    <a class="button primary" href="https://mayaobongda.vn/ao-thiet-ke/">Thiết kế áo</a>
  </div>
</div>
[/ux_html]
SHORTCODE,
);

$category_index = 0;
$empty_category_pattern = '/\[ux_banner height="400px" height__sm="200px"\]\s*\[text_box width__sm="60" position_x="50" position_y="50"\]\s*\[\/text_box\]\s*\[\/ux_banner\]/';
$content = preg_replace_callback(
    $empty_category_pattern,
    function () use (&$category_index, $category_modules) {
        return $category_modules[$category_index++];
    },
    $content,
    -1,
    $category_count
);
if ($category_count !== 2) {
    fwrite(STDERR, sprintf("Category banner replacement count was %d, expected 2.\n", $category_count));
    exit(3);
}

$process_module = <<<'SHORTCODE'
[ux_html]
<div class="x24-process">
  <a class="x24-process-media" href="https://mayaobongda.vn/quy-trinh-may-ao-bong-da-truc-tiep-tai-xuong/" aria-label="Xem quy trình may áo bóng đá tại xưởng X24 Sport">
    <img src="https://cdn.mayaobongda.vn/wp-content/uploads/2026/07/sub-banner.webp" alt="Mẫu áo bóng đá X24 Sport hoàn thiện trên sân" width="1200" height="800" loading="lazy">
  </a>
  <div class="x24-process-copy">
    <h2>Từ ý tưởng đến bộ áo hoàn chỉnh</h2>
    <p class="x24-process-lead">Một luồng làm việc rõ ràng để đội bóng duyệt mẫu nhanh, kiểm soát chất liệu và nhận áo đúng hẹn.</p>
    <ol class="x24-process-list">
      <li><strong>01</strong><span>Gửi logo, màu sắc và số lượng dự kiến</span></li>
      <li><strong>02</strong><span>Nhận thiết kế miễn phí để duyệt</span></li>
      <li><strong>03</strong><span>Chọn chất liệu, in tên số và sản xuất</span></li>
      <li><strong>04</strong><span>Kiểm tra thành phẩm, giao hàng toàn quốc</span></li>
    </ol>
    <a class="button primary x24-process-button" href="https://mayaobongda.vn/quy-trinh-may-ao-bong-da-truc-tiep-tai-xuong/">Xem quy trình may</a>
  </div>
</div>
[/ux_html]
SHORTCODE;

$duplicate_process_pattern = '/\[section padding__sm="0px"\]\s*\[row\]\s*\[col span="6" span__sm="12" class="pb-0"\].*?\[\/row\]\s*\[\/section\]/s';
$content = assert_replacement_count($content, $duplicate_process_pattern, $process_module, 1, 'Process module');

$marketing_module = <<<'SHORTCODE'
[ux_html label="Marketing Strip"]
<div class="x24-marketing-strip">
  <div class="x24-marketing-item">
    <img class="x24-marketing-icon" src="https://cdn.mayaobongda.vn/wp-content/uploads/2025/08/may-sieu-toc.png" alt="" width="30" height="30">
    <span class="x24-marketing-text">May nhanh tại xưởng</span>
  </div>
  <div class="x24-marketing-item">
    <img class="x24-marketing-icon" src="https://cdn.mayaobongda.vn/wp-content/uploads/2025/08/thiet-ke-mien-phi.png" alt="" width="30" height="30">
    <span class="x24-marketing-text">Miễn phí thiết kế</span>
  </div>
  <div class="x24-marketing-item">
    <img class="x24-marketing-icon" src="https://cdn.mayaobongda.vn/wp-content/uploads/2025/08/bao-hanh-in-an.png" alt="" width="30" height="30">
    <span class="x24-marketing-text">In sắc nét, bền màu</span>
  </div>
  <div class="x24-marketing-item">
    <img class="x24-marketing-icon" src="https://cdn.mayaobongda.vn/wp-content/uploads/2025/08/giao-hang-free.png" alt="" width="30" height="30">
    <span class="x24-marketing-text">Giao hàng toàn quốc</span>
  </div>
</div>
[/ux_html]
SHORTCODE;

$marketing_pattern = '/\[ux_html label="Marketing Strip"\].*?\[\/ux_html\]/s';
$content = assert_replacement_count($content, $marketing_pattern, $marketing_module, 1, 'Marketing strip');

$content = str_replace(' margin="-40px"', '', $content);
$content = str_replace(' margin="-70px"', '', $content);
$content = str_replace('[gap height="60px" visibility="hide-for-medium"]', '', $content);
$content = str_replace('[gap visibility="hide-for-medium"]', '', $content);

if (
    strpos($content, 'x24-category-feature') === false
    || strpos($content, 'x24-process') === false
    || strpos($content, 'height="450px"') !== false
) {
    fwrite(STDERR, "Post-update contract failed.\n");
    exit(4);
}

if ($dry_run) {
    fwrite(STDOUT, sprintf("Dry run passed. New content hash: %s\n", hash('sha256', $content)));
    exit(0);
}

$result = wp_update_post(
    array(
        'ID' => $page_id,
        'post_content' => $content,
    ),
    true
);

if (is_wp_error($result)) {
    fwrite(STDERR, $result->get_error_message() . "\n");
    exit(5);
}

clean_post_cache($page_id);
fwrite(STDOUT, sprintf("Updated homepage %d. New content hash: %s\n", $page_id, hash('sha256', $content)));
