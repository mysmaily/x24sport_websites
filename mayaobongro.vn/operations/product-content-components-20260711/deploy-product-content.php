<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    http_response_code(404);
    exit;
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? '/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/product-content-components-20260711';
$mode = $argv[3] ?? 'apply';
$dryRun = $mode === 'dry-run';

require rtrim($siteRoot, '/') . '/wp-load.php';

global $wpdb;

$timestamp = gmdate('Ymd-His');
$backupRoot = rtrim($batchRoot, '/') . '/backups/' . $timestamp;
if (!$dryRun && !wp_mkdir_p($backupRoot)) {
    throw new RuntimeException('Unable to create backup directory: ' . $backupRoot);
}

function mbro_content_term_id(string $slug): int
{
    $term = get_term_by('slug', $slug, 'product_cat');
    if (!$term || is_wp_error($term)) {
        throw new RuntimeException('Missing product category: ' . $slug);
    }

    return (int) $term->term_id;
}

function mbro_content_backup_product(int $productId): array
{
    global $wpdb;

    return [
        'captured_at' => current_time('c'),
        'site_url' => site_url('/'),
        'product_id' => $productId,
        'records' => [
            'posts' => $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $productId), ARRAY_A),
            'postmeta' => $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->postmeta} WHERE post_id = %d ORDER BY meta_id", $productId), ARRAY_A),
            'term_relationships' => $wpdb->get_results($wpdb->prepare("SELECT * FROM {$wpdb->term_relationships} WHERE object_id = %d", $productId), ARRAY_A),
        ],
    ];
}

function mbro_content_design_name(WC_Product $product): string
{
    $title = html_entity_decode($product->get_name(), ENT_QUOTES | ENT_HTML5, 'UTF-8');
    $sku = (string) $product->get_sku();
    if ($sku !== '') {
        $title = preg_replace('/\b' . preg_quote($sku, '/') . '\b/iu', ' ', $title) ?? $title;
    }
    $title = preg_replace('/^.*?Bóng\s+Rổ\s*/iu', '', $title, 1) ?? $title;
    $title = preg_replace('/\bX24[\s-]*(BR|CB)[\s-]*\d+\b/iu', ' ', $title) ?? $title;
    $title = preg_replace('/\s+/u', ' ', trim($title)) ?? $title;

    return $title !== '' ? $title : 'thiết kế bóng rổ năng động';
}

function mbro_content_detect_colors(string $text): array
{
    $map = [
        'trắng' => ['trắng', 'white'],
        'đen' => ['đen', 'black'],
        'xanh navy' => ['navy'],
        'xanh biển' => ['xanh biển'],
        'xanh dương' => ['xanh dương'],
        'xanh bích' => ['xanh bích'],
        'xanh ngọc' => ['xanh ngọc'],
        'xanh lá' => ['xanh lá'],
        'xanh chuối' => ['xanh chuối'],
        'đỏ' => ['đỏ'],
        'cam' => ['cam'],
        'vàng' => ['vàng'],
        'hồng' => ['hồng'],
        'tím' => ['tím'],
        'pastel' => ['pastel'],
        'nhiều màu' => ['nhiều màu'],
    ];

    $found = [];
    foreach ($map as $label => $needles) {
        foreach ($needles as $needle) {
            if (mb_stripos($text, $needle) !== false) {
                $found[] = $label;
                break;
            }
        }
    }

    return array_values(array_unique($found));
}

function mbro_content_style_notes(string $text): array
{
    $notes = [];
    if (preg_match('/gradient|ombre|chuyển\s+sắc|chuyển\s+màu/iu', $text)) {
        $notes[] = 'hiệu ứng chuyển sắc giúp bộ đồ nhìn có chiều sâu, lên sân nổi bật hơn ảnh phẳng một màu';
    }
    if (preg_match('/loang|họa\s+tiết|rừng\s+núi|tia|sọc|vằn|pattern/iu', $text)) {
        $notes[] = 'mảng họa tiết tạo cảm giác mạnh và dễ nhận diện khi cả đội di chuyển trên sân';
    }
    if (preg_match('/pastel|hồng|tím/iu', $text)) {
        $notes[] = 'sắc màu mềm nhưng vẫn đủ cá tính, hợp đội học sinh hoặc đội nữ muốn hình ảnh trẻ hơn';
    }
    if (preg_match('/đen|navy|tím\s+than/iu', $text)) {
        $notes[] = 'nền tối giúp tên số và logo sáng màu nhìn chắc, mạnh và ít lộ bẩn khi thi đấu';
    }
    if (preg_match('/trắng|vàng|cam/iu', $text)) {
        $notes[] = 'nền sáng bắt mắt, hợp giải nội bộ, lớp học hoặc đội muốn nhìn tươi trên ảnh chụp tập thể';
    }
    if (preg_match('/đỏ/iu', $text)) {
        $notes[] = 'tông đỏ tạo cảm giác quyết liệt, hợp đội muốn hình ảnh máu lửa và dễ gây chú ý';
    }
    if (preg_match('/xanh/iu', $text)) {
        $notes[] = 'tông xanh đem lại cảm giác thể thao, sạch và dễ phối với logo trường, lớp hoặc CLB';
    }

    $notes[] = 'áo và quần được xử lý đồng bộ để khi mặc theo đội không bị rời rạc giữa thân áo, viền và quần';

    return array_slice(array_values(array_unique($notes)), 0, 4);
}

function mbro_content_audience_notes(string $text): array
{
    $notes = [
        'đội bóng rổ trường học, lớp học hoặc câu lạc bộ cần đồng phục rõ màu, dễ chia size',
        'đội phong trào, giải nội bộ công ty hoặc nhóm bạn muốn đặt một mẫu có thể đổi tên, số, logo',
    ];

    if (preg_match('/học\s+sinh|lớp|tiểu\s+học|thcs|thpt|cấp\s+3/iu', $text)) {
        array_unshift($notes, 'đội học sinh cần form rộng, thoáng, mặc được cho tập luyện lẫn thi đấu giao lưu');
    }
    if (preg_match('/pastel|hồng|tím|nữ/iu', $text)) {
        $notes[] = 'đội nữ hoặc lớp muốn phong cách trẻ, sáng ảnh nhưng không quá nặng chất thi đấu chuyên nghiệp';
    }
    if (preg_match('/đen|đỏ|cam|tia|sọc|vằn/iu', $text)) {
        $notes[] = 'đội chơi 3x3 hoặc giải phong trào muốn hình ảnh mạnh, dễ nhớ ngay từ khu vực khởi động';
    }

    return array_slice(array_values(array_unique($notes)), 0, 4);
}

function mbro_content_color_sentence(array $colors): string
{
    if (!$colors) {
        return 'Bảng màu của mẫu được giữ theo tinh thần thể thao, dễ thay logo và số áo theo nhận diện đội.';
    }

    $joined = implode(', ', $colors);
    return 'Bảng màu chính gồm ' . esc_html($joined) . ', đủ nổi bật khi thi đấu nhưng vẫn dễ phối logo, tên đội và số áo.';
}

function mbro_content_description(WC_Product $product): string
{
    $title = esc_html($product->get_name());
    $sku = esc_html((string) $product->get_sku());
    $design = mbro_content_design_name($product);
    $designEsc = esc_html($design);
    $text = mb_strtolower($product->get_name() . ' ' . $design, 'UTF-8');
    $colors = mbro_content_detect_colors($text);
    $colorSentence = mbro_content_color_sentence($colors);
    $styleNotes = mbro_content_style_notes($text);
    $audienceNotes = mbro_content_audience_notes($text);
    $price = $product->get_price();
    $priceText = $price !== '' ? number_format((float) $price, 0, ',', '.') . 'đ' : 'Liên hệ';

    $styleList = implode("\n", array_map(static fn(string $note): string => '<li>' . esc_html($note) . '</li>', $styleNotes));
    $audienceList = implode("\n", array_map(static fn(string $note): string => '<li>' . esc_html($note) . '</li>', $audienceNotes));

    return <<<HTML
<h2>{$title}</h2>
<p><strong>{$title}</strong> là mẫu đồng phục bóng rổ thiết kế riêng cho đội nhóm, lớp học và câu lạc bộ cần một bộ đồ nhìn nổi bật khi cả đội bước vào sân. Mẫu {$designEsc} có thể giữ đúng tinh thần màu sắc hiện tại hoặc chỉnh lại theo logo, tên đội và màu nhận diện riêng.</p>
<p>{$colorSentence} Khi đặt may tại Mayaobongro.vn, đội có thể duyệt demo trước khi sản xuất để kiểm tra vị trí logo, tên riêng, số áo và bố cục mặt trước/mặt sau.</p>

<h3>Điểm nổi bật của mẫu {$designEsc}</h3>
<ul>
{$styleList}
</ul>

<h3>Mẫu này hợp với đội nào?</h3>
<ul>
{$audienceList}
</ul>

<h3>Cá nhân hóa theo đội</h3>
<p>Mẫu {$designEsc} có thể đổi tên đội, thêm tên riêng từng thành viên, số áo, logo lớp/CLB, logo nhà tài trợ và đổi phối màu theo yêu cầu. Nếu đội đã có file logo, nên gửi trước để xưởng kiểm tra độ rõ khi in trên áo bóng rổ.</p>

<h3>Thông số sản phẩm</h3>
<table class="mbro-spec-table">
  <tbody>
    <tr><th>Mã mẫu</th><td>{$sku}</td></tr>
    <tr><th>Kiểu bộ</th><td>Áo bóng rổ form rộng kèm quần đồng bộ</td></tr>
    <tr><th>Form mặc</th><td>Suông thoáng, dễ vận động, phù hợp tập luyện và thi đấu phong trào</td></tr>
    <tr><th>Thiết kế</th><td>Nhận chỉnh màu, logo, tên đội, tên riêng và số áo theo danh sách</td></tr>
    <tr><th>Giá hiển thị</th><td>{$priceText}/bộ, giá thực tế có thể thay đổi theo số lượng và chất liệu</td></tr>
  </tbody>
</table>

[mbro_product_sales_boxes]
HTML;
}

function mbro_content_excerpt(WC_Product $product): string
{
    $design = mbro_content_design_name($product);
    $colors = mbro_content_detect_colors(mb_strtolower($product->get_name() . ' ' . $design, 'UTF-8'));
    $colorPart = $colors ? ' phối ' . implode(', ', array_slice($colors, 0, 3)) : '';

    return sprintf(
        '%s%s, nhận may theo đội với logo, tên riêng và số áo. Form bóng rổ rộng thoáng, có demo thiết kế trước khi sản xuất.',
        $product->get_name(),
        $colorPart
    );
}

function mbro_content_component_plugin(): string
{
    $componentPath = __DIR__ . '/mayaobongro-product-sales-components.php';
    if (is_file($componentPath)) {
        return (string) file_get_contents($componentPath);
    }

    return <<<'PHP'
<?php
/**
 * Plugin Name: Mayaobongro Product Sales Components
 * Description: Shared conversion boxes for Mayaobongro.vn WooCommerce product descriptions.
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

function mbro_product_sales_boxes_shortcode(): string
{
    ob_start();
    ?>
    <section class="mbro-sales-boxes" aria-label="Thông tin đặt may áo bóng rổ">
        <div class="mbro-sales-grid">
            <article class="mbro-sales-card mbro-sales-card--accent">
                <h3>Ưu đãi khi đặt may theo đội</h3>
                <ul>
                    <li>Miễn phí lên demo tên đội, tên riêng, số áo và logo.</li>
                    <li>Tư vấn size theo chiều cao, cân nặng và danh sách thành viên.</li>
                    <li>Nhận chỉnh màu theo nhận diện lớp, CLB, trường hoặc nhà tài trợ.</li>
                    <li>Giao hàng toàn quốc, hỗ trợ chốt đơn nhanh cho đội sắp vào giải.</li>
                </ul>
            </article>
            <article class="mbro-sales-card">
                <h3>Bảng giá tham khảo</h3>
                <div class="mbro-price-table-wrap">
                    <table>
                        <thead>
                            <tr><th>Số lượng</th><th>Gợi ý đặt may</th></tr>
                        </thead>
                        <tbody>
                            <tr><td>1-4 bộ</td><td>Phù hợp đặt mẫu, bổ sung thành viên hoặc đặt lẻ.</td></tr>
                            <tr><td>5-9 bộ</td><td>Phù hợp nhóm bạn, đội 3x3, lớp nhỏ.</td></tr>
                            <tr><td>Từ 10 bộ</td><td>Phù hợp đồng phục đội; nên gửi danh sách size để báo giá tốt hơn.</td></tr>
                        </tbody>
                    </table>
                </div>
                <p>Giá cuối phụ thuộc chất liệu, số lượng, yêu cầu in và thời gian cần hàng.</p>
            </article>
            <article class="mbro-sales-card">
                <h3>Bảo hành & kiểm hàng</h3>
                <ul>
                    <li>Kiểm tra tên, số, logo theo file duyệt trước khi sản xuất.</li>
                    <li>Hỗ trợ xử lý nếu sản phẩm lỗi kỹ thuật từ xưởng.</li>
                    <li>Đóng gói theo đơn đội để dễ chia áo khi nhận hàng.</li>
                </ul>
            </article>
            <article class="mbro-sales-card">
                <h3>Câu hỏi thường gặp</h3>
                <details open>
                    <summary>Có đổi màu và logo được không?</summary>
                    <p>Có. Đội có thể đổi màu phụ, thêm logo, đổi tên đội, tên riêng và số áo theo danh sách.</p>
                </details>
                <details>
                    <summary>In tên số có dễ bong không?</summary>
                    <p>Xưởng sẽ tư vấn công nghệ in phù hợp chất liệu và nhu cầu sử dụng để hạn chế bong tróc khi tập luyện.</p>
                </details>
                <details>
                    <summary>Đặt cho học sinh chọn size thế nào?</summary>
                    <p>Gửi chiều cao, cân nặng từng bạn; xưởng sẽ cân form áo và quần theo nhóm tuổi.</p>
                </details>
            </article>
        </div>
    </section>
    <?php
    return trim((string) ob_get_clean());
}
add_shortcode('mbro_product_sales_boxes', 'mbro_product_sales_boxes_shortcode');

function mbro_product_sales_boxes_styles(): void
{
    if (!is_product()) {
        return;
    }
    ?>
    <style>
        .mbro-spec-table,
        .mbro-sales-boxes table {
            width: 100%;
            border-collapse: collapse;
            margin: 18px 0;
        }
        .mbro-spec-table th,
        .mbro-spec-table td,
        .mbro-sales-boxes th,
        .mbro-sales-boxes td {
            border: 1px solid #e5e7eb;
            padding: 12px 14px;
            vertical-align: top;
            text-align: left;
        }
        .mbro-spec-table th,
        .mbro-sales-boxes th {
            width: 30%;
            background: #f8fafc;
            font-weight: 700;
            color: #111827;
        }
        .mbro-sales-boxes {
            margin: 28px 0 8px;
        }
        .mbro-sales-grid {
            display: grid;
            grid-template-columns: repeat(2, minmax(0, 1fr));
            gap: 14px;
        }
        .mbro-sales-card {
            border: 1px solid #e5e7eb;
            border-radius: 8px;
            padding: 18px;
            background: #ffffff;
        }
        .mbro-sales-card--accent {
            border-color: #f97316;
            background: #fff7ed;
        }
        .mbro-sales-card h3 {
            margin: 0 0 10px;
            font-size: 1.08rem;
            line-height: 1.35;
        }
        .mbro-sales-card ul {
            margin: 0 0 0 18px;
        }
        .mbro-sales-card li + li {
            margin-top: 6px;
        }
        .mbro-sales-card p {
            margin: 10px 0 0;
        }
        .mbro-sales-card details {
            border-top: 1px solid #e5e7eb;
            padding: 10px 0;
        }
        .mbro-sales-card details:first-of-type {
            border-top: 0;
            padding-top: 0;
        }
        .mbro-sales-card summary {
            cursor: pointer;
            font-weight: 700;
            color: #111827;
        }
        .mbro-price-table-wrap {
            overflow-x: auto;
        }
        @media (max-width: 680px) {
            .mbro-sales-grid {
                grid-template-columns: 1fr;
            }
            .mbro-spec-table th,
            .mbro-spec-table td,
            .mbro-sales-boxes th,
            .mbro-sales-boxes td {
                padding: 10px;
            }
        }
    </style>
    <?php
}
add_action('wp_head', 'mbro_product_sales_boxes_styles', 40);
PHP;
}

$categoryId = mbro_content_term_id('bo-quan-ao-bong-ro');
$logoCategoryId = mbro_content_term_id('logo-doi-bong-ro');
$products = wc_get_products([
    'status' => ['publish', 'draft', 'private'],
    'limit' => -1,
    'orderby' => 'ID',
    'order' => 'ASC',
    'category' => ['bo-quan-ao-bong-ro'],
    'return' => 'objects',
]);

$targetProducts = array_values(array_filter($products, static function (WC_Product $product) use ($logoCategoryId): bool {
    return !has_term($logoCategoryId, 'product_cat', $product->get_id());
}));

$muPluginDir = WP_CONTENT_DIR . '/mu-plugins';
$muPluginPath = $muPluginDir . '/mayaobongro-product-sales-components.php';
$component = mbro_content_component_plugin();

$results = [];
$skippedExisting = [];

if (!$dryRun) {
    wp_mkdir_p($muPluginDir);
    if (is_file($muPluginPath)) {
        copy($muPluginPath, $backupRoot . '/mayaobongro-product-sales-components.php.before');
    }
    file_put_contents($backupRoot . '/component-after.php', $component);
    $componentIsCurrent = is_file($muPluginPath) && md5_file($muPluginPath) === md5($component);
    if (!$componentIsCurrent) {
        $canWriteComponent = (is_file($muPluginPath) && is_writable($muPluginPath))
            || (!is_file($muPluginPath) && is_writable($muPluginDir));
        if ($canWriteComponent) {
            file_put_contents($muPluginPath, $component);
        } else {
            fwrite(STDERR, "Component file is not writable by PHP user; skipping component write: {$muPluginPath}\n");
        }
    }
}

foreach ($targetProducts as $product) {
    $productId = $product->get_id();
    $currentContent = (string) get_post_field('post_content', $productId);
    if (
        !$dryRun
        && str_contains($currentContent, '[mbro_product_sales_boxes]')
        && (string) get_post_meta($productId, '_mayaobongro_content_refresh_20260711', true) !== ''
    ) {
        $skippedExisting[] = [
            'id' => $productId,
            'sku' => $product->get_sku(),
            'title' => $product->get_name(),
        ];
        continue;
    }

    $description = mbro_content_description($product);
    $excerpt = mbro_content_excerpt($product);

    if (!$dryRun) {
        $backup = mbro_content_backup_product($productId);
        $backupPath = $backupRoot . '/product-' . $productId . '-before-content-refresh.json';
        file_put_contents($backupPath, wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL);

        $product->set_description($description);
        $product->set_short_description($excerpt);
        $product->save();

        update_post_meta($productId, '_yoast_wpseo_metadesc', wp_strip_all_tags($excerpt));
        update_post_meta($productId, '_mayaobongro_content_refresh_20260711', current_time('mysql'));
        clean_post_cache($productId);
        wc_delete_product_transients($productId);
    }

    $results[] = [
        'id' => $productId,
        'sku' => $product->get_sku(),
        'title' => $product->get_name(),
        'design' => mbro_content_design_name($product),
        'description_chars' => mb_strlen(wp_strip_all_tags(do_shortcode($description))),
        'excerpt_chars' => mb_strlen(wp_strip_all_tags($excerpt)),
        'url' => get_permalink($productId),
    ];
}

if (!$dryRun) {
    if (function_exists('wc_delete_product_transients')) {
        wc_delete_product_transients();
    }
    if (class_exists('autoptimizeCache')) {
        autoptimizeCache::clearall();
    }
}

echo wp_json_encode([
    'mode' => $dryRun ? 'dry-run' : 'apply',
    'backup_root' => $dryRun ? null : $backupRoot,
    'component_path' => $muPluginPath,
    'target_category_id' => $categoryId,
    'excluded_logo_category_id' => $logoCategoryId,
    'updated_count' => count($results),
    'skipped_existing_count' => count($skippedExisting),
    'sample' => array_slice($results, 0, 5),
    'last' => array_slice($results, -5),
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
