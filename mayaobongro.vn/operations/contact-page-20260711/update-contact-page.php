<?php

declare(strict_types=1);

if (PHP_SAPI !== 'cli') {
    exit(1);
}

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? rtrim($siteRoot, '/') . '/wp-content/uploads/codex-ops/contact-page-20260711';

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

$page = get_page_by_path('lien-he', OBJECT, 'page');
if (!$page instanceof WP_Post) {
    fwrite(STDERR, "Contact page not found.\n");
    exit(1);
}

$pageId = (int) $page->ID;
file_put_contents(
    $backupDir . '/page-before.json',
    wp_json_encode([
        'captured_at' => current_time('c'),
        'page_id' => $pageId,
        'permalink' => get_permalink($pageId),
        'post' => $wpdb->get_row(
            $wpdb->prepare("SELECT * FROM {$wpdb->posts} WHERE ID = %d", $pageId),
            ARRAY_A
        ),
        'meta' => $wpdb->get_results(
            $wpdb->prepare("SELECT * FROM {$wpdb->postmeta} WHERE post_id = %d ORDER BY meta_id", $pageId),
            ARRAY_A
        ),
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL
);

$content = <<<'HTML'
<div style="padding:34px 0 10px;">
<h1 style="text-align:center;margin:0 0 10px;color:#222;">Liên hệ Mayaobongro.vn</h1>
<p style="text-align:center;max-width:760px;margin:0 auto 28px;color:#555;">Gửi thông tin đội bóng, số lượng và yêu cầu thiết kế. Mayaobongro.vn sẽ liên hệ lại để tư vấn mẫu áo bóng rổ phù hợp.</p>
</div>

[row]

[col span="6" span__sm="12"]

<div style="display:grid;gap:18px;">
<div>
<h2 style="margin-top:0;">Thông tin liên hệ</h2>
<p><strong>Hotline/Zalo:</strong> <a href="tel:0989353247">0989.353.247</a></p>
<p><strong>Facebook:</strong> <a href="https://www.facebook.com/mayaobongro247/" target="_blank" rel="noopener">facebook.com/mayaobongro247</a></p>
<p><strong>Địa chỉ:</strong> Số 6 Khu tập thể quân đội, ngõ 50 Nguyễn Hữu Thọ, Hà Nội</p>
</div>

[x24_contact_form]
</div>

[/col]

[col span="6" span__sm="12"]

<div style="overflow:hidden;border-radius:8px;border:1px solid #ececec;background:#f5f5f5;">
<iframe title="Bản đồ X24 Sport" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d232.8454953689386!2d105.84012805493546!3d20.971464823776046!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad9e9eb3800b%3A0xa21f7473bf767fee!2sX24%20Sport!5e0!3m2!1sen!2s!4v1783784496555!5m2!1sen!2s" width="600" height="520" style="border:0;width:100%;display:block;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>
</div>

[/col]

[/row]
HTML;

$result = wp_update_post([
    'ID' => $pageId,
    'post_title' => 'Liên hệ',
    'post_name' => 'lien-he',
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

file_put_contents(
    $backupDir . '/page-after.json',
    wp_json_encode([
        'status' => 'updated',
        'page_id' => $pageId,
        'permalink' => get_permalink($pageId),
        'backup_dir' => $backupDir,
    ], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE) . PHP_EOL
);

echo wp_json_encode([
    'status' => 'updated',
    'page_id' => $pageId,
    'permalink' => get_permalink($pageId),
    'backup_dir' => $backupDir,
], JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE), PHP_EOL;
