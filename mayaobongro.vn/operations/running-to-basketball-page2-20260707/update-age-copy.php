<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? '/tmp/running-to-basketball-page2-v2';
$manifestPath = rtrim($batchRoot, '/') . '/manifest.json';
$backupDir = rtrim($batchRoot, '/') . '/backups/content-phrase-fix';

require rtrim($siteRoot, '/') . '/wp-load.php';

function phrase_fix_description(array $record, string $elementaryUrl, string $highSchoolUrl): string
{
    $title = esc_html($record['new_title']);
    $design = esc_html(str_replace('Bộ Quần Áo Bóng Rổ ', '', preg_replace('/ X24-BR-\d{3}$/', '', $record['new_title'])));
    $code = esc_html(preg_match('/X24-BR-\d{3}/', $record['new_title'], $m) ? $m[0] : '');
    return <<<HTML
<h2>{$title}</h2>
<p>Thiết kế {$design} được chuyển sang form bóng rổ với áo sát nách vai rộng, cổ và nách viền rib, thân suông dài che cạp quần và quần bóng rổ rộng ngang gối. Bảng màu, logo và mảng họa tiết chính được giữ theo tinh thần mẫu gốc nhưng trình bày lại cho sân bóng rổ.</p>
<p>Bộ {$code} phù hợp đặt may cho nam, nữ, người lớn, trẻ em, đội trường, câu lạc bộ, công ty hoặc nhóm thi đấu phong trào. Có thể tùy chỉnh tên đội, số áo, logo và phối màu theo file khách cung cấp.</p>
<h3>Ảnh mẫu tiểu học lớp 4-5</h3>
<p>Ảnh mẫu tiểu học giúp phụ huynh và giáo viên hình dung áo bóng rổ tiểu học và áo bóng rổ cho trẻ lớp 4-5. Khi đặt may, chiều dài áo, rộng thân và form quần có thể cân theo chiều cao, cân nặng của từng nhóm học sinh.</p>
<figure class="mayaobongro-age-reference"><img src="{$elementaryUrl}" alt="Ảnh mẫu tiểu học lớp 4-5 mặc {$title}"><figcaption>Ảnh mẫu tiểu học lớp 4-5 cho thiết kế {$design}.</figcaption></figure>
<h3>Ảnh mẫu trung học / cấp 3</h3>
<p>Ảnh mẫu trung học thể hiện cùng thiết kế khi may cho học sinh lớn hơn. Mẫu này dùng tốt cho áo bóng rổ học sinh THCS, áo bóng rổ lớp 9, áo bóng rổ học sinh cấp 3 và áo bóng rổ THPT khi đội cần form rộng dễ vận động.</p>
<figure class="mayaobongro-age-reference"><img src="{$highSchoolUrl}" alt="Ảnh mẫu học sinh cấp 3 mặc {$title}"><figcaption>Ảnh mẫu trung học / cấp 3 cho thiết kế {$design}.</figcaption></figure>
<h3>May theo đội nhóm</h3>
<ul>
<li>Giữ bảng màu và nhận diện chính của mẫu thiết kế.</li>
<li>Áo và quần phối cùng màu, viền và họa tiết để thành một bộ bóng rổ hoàn chỉnh.</li>
<li>Có thể đổi sang trắng, đen, hồng, đỏ, vàng, xanh blue, green hoặc phối màu riêng.</li>
<li>Tư vấn size cho nam, nữ, người lớn, trẻ em và từng nhóm vận động cụ thể.</li>
</ul>
HTML;
}

$manifest = json_decode((string) file_get_contents($manifestPath), true);
if (!is_array($manifest)) {
    throw new RuntimeException('Could not read manifest JSON.');
}
if (!is_dir($backupDir) && !mkdir($backupDir, 0755, true)) {
    throw new RuntimeException("Could not create backup dir: {$backupDir}");
}

$results = [];
foreach ($manifest as $record) {
    $productId = (int) $record['destination_product_id'];
    $product = wc_get_product($productId);
    if (!$product instanceof WC_Product) {
        throw new RuntimeException("Product not found: {$productId}");
    }

    $backupPath = $backupDir . '/product-' . $productId . '-before-content-phrase-fix.json';
    file_put_contents($backupPath, wp_json_encode([
        'captured_at' => current_time('c'),
        'product_id' => $productId,
        'post_content' => get_post_field('post_content', $productId),
        'post_excerpt' => get_post_field('post_excerpt', $productId),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL);

    $elementaryId = (int) get_post_meta($productId, '_mayaobongro_age_image_tieu_hoc_id', true);
    $highSchoolId = (int) get_post_meta($productId, '_mayaobongro_age_image_thpt_id', true);
    $elementaryUrl = (string) wp_get_attachment_url($elementaryId);
    $highSchoolUrl = (string) wp_get_attachment_url($highSchoolId);
    if (!$elementaryUrl || !$highSchoolUrl) {
        throw new RuntimeException("Missing age image URLs for product {$productId}");
    }

    $product->set_description(phrase_fix_description($record, $elementaryUrl, $highSchoolUrl));
    $product->save();
    clean_post_cache($productId);
    wc_delete_product_transients($productId);
    $results[] = ['product_id' => $productId, 'backup_path' => $backupPath];
}

echo wp_json_encode(['count' => count($results), 'results' => $results], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
