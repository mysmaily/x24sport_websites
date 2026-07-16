<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? '/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/update-age-labels-20260707';
$backupDir = rtrim($batchRoot, '/') . '/backups';

require rtrim($siteRoot, '/') . '/wp-load.php';

global $wpdb;

if (!is_dir($backupDir) && !mkdir($backupDir, 0755, true)) {
    throw new RuntimeException("Could not create backup dir: {$backupDir}");
}

function age_labels_design_name(WC_Product $product): string
{
    $title = $product->get_name();
    $sku = preg_quote($product->get_sku(), '/');
    $title = preg_replace('/^Bộ Quần Áo Bóng Rổ\s+/u', '', $title) ?? $title;
    $title = preg_replace('/\s+' . $sku . '$/u', '', $title) ?? $title;
    return trim((string) preg_replace('/\s+/u', ' ', $title));
}

function age_labels_short_design_name(string $design): string
{
    $design = str_replace(['‘', '’', '"', "'"], ' ', $design);
    $design = preg_replace('/\b(Run To Rise|RUN TO RISE|RUN TO|Run To|Happy Hoops|Hoop To Win|Keep Hooping|One Shot Can Change Your Day|Play When You Can|Play Faster)\b/iu', '', $design) ?? $design;
    $design = preg_replace('/\b(Thiết Kế|Thiết kế|Hiện Đại|Hiện đại|Năng Động|Năng động|Thoáng Mát|Thoáng mát|Cá Tính|Cá tính|Thể Thao|Thời Trang|Tự Hào|Tự hào|Năng Lượng|Năng lượng|Mạnh Mẽ|Mạnh mẽ)\b/u', '', $design) ?? $design;
    $design = preg_replace('/\b(Nam|Nữ|Đội Nhóm|đội nhóm|Dành Cho|dành cho|cho team|Cho Team)\b/u', '', $design) ?? $design;
    $design = preg_replace('/\bTeam\s+Team\b/iu', 'Team', $design) ?? $design;
    $design = preg_replace('/\s+/u', ' ', trim($design)) ?? $design;

    $words = preg_split('/\s+/u', $design, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    $colors = [
        'Xanh', 'Dương', 'Lá', 'Navy', 'Biển', 'Đỏ', 'Cam', 'Vàng', 'Hồng',
        'Tím', 'Đen', 'Trắng', 'Ngà', 'Gradient', 'Ombre', 'Chuyển', 'Sắc',
        'Phối', 'Màu',
    ];

    if (preg_match('/\b(?:Màu|màu|Tông|tông|Phối|phối)\s+([\p{L}\s]{2,40})/u', $design, $match)) {
        $candidateWords = preg_split('/\s+/u', trim($match[1]), -1, PREG_SPLIT_NO_EMPTY) ?: [];
        $candidate = [];
        foreach ($candidateWords as $word) {
            $normalized = preg_replace('/[^\p{L}\p{N}]/u', '', $word) ?? $word;
            if (in_array($normalized, $colors, true)) {
                $candidate[] = $word;
                continue;
            }
            break;
        }
        if ($candidate !== []) {
            return trim(implode(' ', array_slice($candidate, 0, 4)));
        }
    }

    $picked = [];
    foreach ($words as $word) {
        $normalized = preg_replace('/[^\p{L}\p{N}]/u', '', $word) ?? $word;
        if (in_array($normalized, $colors, true)) {
            $picked[] = $word;
            continue;
        }
        break;
    }

    if ($picked !== []) {
        $candidate = trim(implode(' ', array_slice($picked, 0, 4)));
        if ($candidate !== '') {
            return $candidate;
        }
    }

    $design = preg_replace('/\s+/u', ' ', trim($design)) ?? $design;
    $parts = preg_split('/\s+/u', $design, -1, PREG_SPLIT_NO_EMPTY) ?: [];
    if (count($parts) > 4) {
        $design = implode(' ', array_slice($parts, 0, 4));
    }

    return trim($design) !== '' ? trim($design) : 'thiết kế riêng';
}

function age_labels_description(WC_Product $product, string $elementaryUrl, string $highSchoolUrl): string
{
    $design = esc_html(age_labels_design_name($product));
    $short = esc_html(age_labels_short_design_name(age_labels_design_name($product)));
    $elementaryLabel = "Mẫu áo bóng rổ {$short} cho trẻ tiểu học, trung học cơ sở.";
    $highSchoolLabel = "Mẫu bóng rổ {$short} cho học sinh trung học phổ thông, người lớn.";
    $elementaryAlt = esc_attr($elementaryLabel);
    $highSchoolAlt = esc_attr($highSchoolLabel);

    return <<<HTML
<h2>Mẫu áo bóng rổ {$design}</h2>
<p>Mẫu {$design} được chuyển sang form bóng rổ với áo sát nách vai rộng, cổ và nách bo gọn, thân áo suông dài che cạp quần và quần bóng rổ rộng gần gối. Bảng màu, logo và mảng họa tiết chính được giữ theo tinh thần thiết kế gốc nhưng trình bày lại gọn hơn cho sân bóng rổ.</p>

<h3>Thiết kế, chất liệu và cảm giác mặc</h3>
<p>Bộ áo ưu tiên cảm giác nhẹ, thoáng và dễ vận động trong tập luyện hoặc thi đấu nội bộ. Áo và quần được phối đồng bộ để khi cả đội đứng cạnh nhau vẫn nhận ra cùng một mẫu, không bị lệch màu giữa thân áo và quần.</p>

<h3>Ảnh mẫu theo nhóm người mặc</h3>
<div class="mbro-age-reference-images">
  <figure>
    <img src="{$elementaryUrl}" alt="{$elementaryAlt}" loading="lazy" decoding="async">
    <figcaption>{$elementaryLabel}</figcaption>
  </figure>
  <figure>
    <img src="{$highSchoolUrl}" alt="{$highSchoolAlt}" loading="lazy" decoding="async">
    <figcaption>{$highSchoolLabel}</figcaption>
  </figure>
  <p>Với đội THCS, lớp 9 hoặc nhóm người lớn cần size riêng, xưởng cân lại chiều dài áo, vòng ngực và quần theo danh sách đặt may thực tế.</p>
</div>

<h3>Đặt may theo đội</h3>
<p>Có thể tinh chỉnh tên đội, tên riêng, số áo, logo, sponsor và bảng size theo từng danh sách đặt may. Nếu đội muốn đổi phối màu hoặc thêm logo riêng, nên gửi file trước để kiểm tra độ rõ khi in lên chất liệu áo bóng rổ.</p>
HTML;
}

function age_labels_backup(int $productId, array $attachmentIds): array
{
    global $wpdb;

    return [
        'captured_at' => current_time('c'),
        'site_url' => site_url('/'),
        'product_id' => $productId,
        'attachment_ids' => $attachmentIds,
        'records' => [
            'posts' => $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM {$wpdb->posts} WHERE ID = %d OR ID IN (" . implode(',', array_fill(0, count($attachmentIds), '%d')) . ")",
                ...array_merge([$productId], $attachmentIds)
            ), ARRAY_A),
            'postmeta' => $wpdb->get_results($wpdb->prepare(
                "SELECT * FROM {$wpdb->postmeta} WHERE post_id = %d OR post_id IN (" . implode(',', array_fill(0, count($attachmentIds), '%d')) . ") ORDER BY post_id, meta_id",
                ...array_merge([$productId], $attachmentIds)
            ), ARRAY_A),
        ],
    ];
}

$results = [];
for ($i = 34; $i <= 105; $i++) {
    $sku = sprintf('X24-BR-%03d', $i);
    $productId = wc_get_product_id_by_sku($sku);
    if (!$productId) {
        $results[] = ['sku' => $sku, 'status' => 'missing'];
        continue;
    }

    $product = wc_get_product($productId);
    if (!$product instanceof WC_Product) {
        $results[] = ['sku' => $sku, 'product_id' => $productId, 'status' => 'not_product'];
        continue;
    }

    $elementaryId = (int) get_post_meta($productId, '_mayaobongro_age_image_tieu_hoc_id', true);
    $highSchoolId = (int) get_post_meta($productId, '_mayaobongro_age_image_thpt_id', true);
    if (!$elementaryId) {
        $gallery = $product->get_gallery_image_ids();
        $elementaryId = isset($gallery[0]) ? (int) $gallery[0] : 0;
    }
    if (!$highSchoolId) {
        $highSchoolId = (int) $product->get_image_id();
    }

    $attachmentIds = array_values(array_filter([$elementaryId, $highSchoolId]));
    $backup = age_labels_backup($productId, $attachmentIds);
    $backupPath = $backupDir . '/product-' . $productId . '-before-age-label-update.json';
    if (is_file($backupPath)) {
        $backupPath = $backupDir . '/product-' . $productId . '-before-age-label-update-rerun-' . gmdate('YmdHis') . '.json';
    }
    file_put_contents(
        $backupPath,
        wp_json_encode($backup, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL
    );

    $elementaryUrl = (string) wp_get_attachment_url($elementaryId);
    $highSchoolUrl = (string) wp_get_attachment_url($highSchoolId);
    if ($elementaryUrl === '' || $highSchoolUrl === '') {
        $results[] = ['sku' => $sku, 'product_id' => $productId, 'status' => 'missing_media_url'];
        continue;
    }

    $short = age_labels_short_design_name(age_labels_design_name($product));
    $elementaryLabel = "Mẫu áo bóng rổ {$short} cho trẻ tiểu học, trung học cơ sở.";
    $highSchoolLabel = "Mẫu bóng rổ {$short} cho học sinh trung học phổ thông, người lớn.";

    update_post_meta($elementaryId, '_wp_attachment_image_alt', $elementaryLabel);
    wp_update_post([
        'ID' => $elementaryId,
        'post_title' => 'Mẫu áo bóng rổ ' . $short . ' cho trẻ tiểu học, trung học cơ sở',
        'post_excerpt' => $elementaryLabel,
        'post_content' => $elementaryLabel,
    ]);
    update_post_meta($highSchoolId, '_wp_attachment_image_alt', $highSchoolLabel);
    wp_update_post([
        'ID' => $highSchoolId,
        'post_title' => 'Mẫu bóng rổ ' . $short . ' cho học sinh trung học phổ thông, người lớn',
        'post_excerpt' => $highSchoolLabel,
        'post_content' => $highSchoolLabel,
    ]);

    $product->set_short_description(sprintf(
        'Mẫu %s có form áo bóng rổ suông dài, quần đồng bộ theo họa tiết và chất vải thể thao thoáng nhẹ, phù hợp đặt may theo đội.',
        age_labels_design_name($product)
    ));
    $product->set_description(age_labels_description($product, $elementaryUrl, $highSchoolUrl));
    update_post_meta(
        $productId,
        '_yoast_wpseo_metadesc',
        'Mẫu ' . age_labels_design_name($product) . ' với form bóng rổ suông dài, quần đồng bộ, vải thể thao thoáng nhẹ và nhận đặt may theo đội.'
    );
    $product->save();
    clean_post_cache($productId);
    wc_delete_product_transients($productId);

    $results[] = [
        'sku' => $sku,
        'product_id' => $productId,
        'status' => 'updated',
        'short_design' => $short,
        'elementary_label' => $elementaryLabel,
        'high_school_label' => $highSchoolLabel,
    ];
}

echo wp_json_encode([
    'count' => count($results),
    'updated' => count(array_filter($results, static fn (array $row): bool => ($row['status'] ?? '') === 'updated')),
    'results' => $results,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
