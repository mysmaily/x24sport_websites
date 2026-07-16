<?php

require '/var/www/mayaobongro.vn/wp-load.php';
require_once ABSPATH . 'wp-admin/includes/image.php';
require_once ABSPATH . 'wp-admin/includes/file.php';
require_once ABSPATH . 'wp-admin/includes/media.php';

$base_dir = __DIR__;
$generated_dir = $base_dir . '/generated';
$backup_dir = '/tmp/mayaobongro-blog-image-refresh-' . date('Ymd-His');
wp_mkdir_p($backup_dir);

$config = [
    1041 => [
        'generated' => 'article-1041-ao-bong-ro-dep.jpg',
        'replace' => ['ao_chay_bo_dep-3.png'],
    ],
    1043 => [
        'generated' => 'article-1043-ao-bong-ro-ca-nhan.jpg',
        'replace' => ['ao_chay_bo_ca_nhan-2.png'],
    ],
    1048 => [
        'generated' => 'article-1048-ao-bong-ro-nhom.jpg',
        'replace' => ['ao_chay_bo_dep_1.png'],
    ],
    1051 => [
        'generated' => 'article-1051-ao-bong-ro-giai-dau.jpg',
        'replace' => ['ao_chay_bo_dep_1-1.png'],
    ],
    1054 => [
        'generated' => 'article-1054-ao-bong-ro-team-building.jpg',
        'replace' => ['ao_chay_bo_dep_1-2.png'],
    ],
    1057 => [
        'generated' => 'article-1057-ao-bong-ro-thi-dau.jpg',
        'replace' => ['ao_chay_bo_dep_1-3.png'],
    ],
    1060 => [
        'generated' => 'article-1060-ao-bong-ro-thi-dau-doi.jpg',
        'replace' => ['ao_chay_bo_dep_1-4.png'],
    ],
    1066 => [
        'generated' => 'article-1066-dong-phuc-bong-ro-cong-ty.jpg',
        'replace' => ['ao_chay_bo_dep_1-5.png'],
    ],
    1073 => [
        'generated' => 'article-1073-thiet-ke-ao-bong-ro-dep.jpg',
        'replace' => ['ao_chay_bo_dep_1-7.png'],
    ],
    1077 => [
        'generated' => 'article-1077-xuong-may-ao-bong-ro.jpg',
    ],
    1080 => [
        'generated' => 'article-1080-may-ao-bong-ro-so-luong-lon.jpg',
    ],
    1084 => [
        'generated' => 'article-1084-ao-bong-ro-sat-nach.jpg',
        'replace' => ['ao-áo bóng rổ sát nách-chay-bo-x24-sport-content.jpg'],
    ],
    1090 => [
        'generated' => 'article-1090-cach-thiet-ke-mau-ao-bong-ro.jpg',
    ],
    2274 => [
        'generated' => 'article-2274-ao-bong-ro-zenix.jpg',
    ],
    2286 => [
        'remove' => ['mau-ao-chay-cho-giai-cong-ty-400x400.jpg'],
    ],
    2308 => [
        'generated' => 'article-2308-infographic.jpg',
        'remove' => [
            'ao-bong-ro-thiet-ke-rieng-giai-chay-Eco-Retreat.jpg',
            'ao-bong-ro-giai-chay-Uong-Bi-Club-Cầu thủ.jpg',
            'ao-bong-ro-mau-cam-giai-chay-Dong-Do-Land-1.jpg',
        ],
    ],
    2342 => [
        'remove' => [
            'ao-bong-ro-chay-road-266x400.jpg',
            'ao-bong-ro-theo-mau-giai-chay-400x400.jpg',
        ],
    ],
    2354 => [
        'generated' => 'article-2354-process-overview.jpg',
        'replace_pairs' => [
            'buoc-1.jpg' => 'article-2354-step-1.jpg',
            'buoc-2.jpg' => 'article-2354-step-2.jpg',
            'buoc-3.jpg' => 'article-2354-step-3.jpg',
        ],
    ],
    2360 => [
        'remove' => [
            'ao-bong-ro-giai-chay-chuyen-nghiep-400x400.jpg',
            'ao-bong-ro-danh-cho-su-kien-chay-400x400.jpg',
            'run-for-life-545x400.jpg',
        ],
    ],
];

function basename_matches(string $src, string $expected): bool {
    $path = parse_url($src, PHP_URL_PATH);
    return $path && basename(urldecode($path)) === $expected;
}

function upload_generated_asset(string $path, int $post_id): array {
    $bits = wp_upload_bits(basename($path), null, file_get_contents($path));
    if (!empty($bits['error'])) {
        throw new RuntimeException('Upload failed for ' . basename($path) . ': ' . $bits['error']);
    }

    $mime = wp_check_filetype($bits['file'], null);
    $attachment = [
        'post_mime_type' => $mime['type'] ?: 'image/jpeg',
        'post_title' => preg_replace('/\.[^.]+$/', '', basename($path)),
        'post_content' => '',
        'post_status' => 'inherit',
    ];

    $attachment_id = wp_insert_attachment($attachment, $bits['file'], $post_id);
    if (is_wp_error($attachment_id)) {
        throw new RuntimeException($attachment_id->get_error_message());
    }

    update_attached_file($attachment_id, $bits['file']);

    return [
        'id' => $attachment_id,
        'url' => wp_get_attachment_url($attachment_id),
    ];
}

function replace_or_remove_images(string $html, array $replace_map, array $remove_list): string {
    if (trim($html) === '') {
        return $html;
    }

    libxml_use_internal_errors(true);
    $doc = new DOMDocument();
    $doc->loadHTML('<?xml encoding="utf-8" ?>' . $html, LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD);
    $images = iterator_to_array($doc->getElementsByTagName('img'));
    foreach ($images as $img) {
        $src = $img->getAttribute('src');
        foreach ($remove_list as $basename) {
            if (basename_matches($src, $basename)) {
                $img->parentNode->removeChild($img);
                continue 2;
            }
        }
        foreach ($replace_map as $basename => $new_url) {
            if (basename_matches($src, $basename)) {
                $img->setAttribute('src', $new_url);
                if ($img->hasAttribute('data-src')) {
                    $img->setAttribute('data-src', $new_url);
                }
                if ($img->hasAttribute('data-lazy-src')) {
                    $img->setAttribute('data-lazy-src', $new_url);
                }
            }
        }
    }
    return $doc->saveHTML();
}

$report = [
    'backup_dir' => $backup_dir,
    'updated_posts' => [],
];

foreach ($config as $post_id => $rules) {
    $post = get_post($post_id);
    if (!$post) {
        continue;
    }

    $snapshot = [
        'ID' => $post->ID,
        'post_title' => $post->post_title,
        'featured_id' => get_post_thumbnail_id($post_id),
        'featured_url' => get_the_post_thumbnail_url($post_id, 'full'),
        'post_content' => $post->post_content,
    ];
    file_put_contents($backup_dir . '/post-' . $post_id . '.json', wp_json_encode($snapshot, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));

    $replace_map = [];
    $remove_list = $rules['remove'] ?? [];
    $new_featured = null;

    if (!empty($rules['generated'])) {
        $asset = upload_generated_asset($generated_dir . '/' . $rules['generated'], $post_id);
        set_post_thumbnail($post_id, $asset['id']);
        $new_featured = $asset;
        if (!empty($rules['replace'])) {
            foreach ($rules['replace'] as $basename) {
                $replace_map[$basename] = $asset['url'];
            }
        }
    }

    if (!empty($rules['replace_pairs'])) {
        foreach ($rules['replace_pairs'] as $old_basename => $generated_filename) {
            $asset = upload_generated_asset($generated_dir . '/' . $generated_filename, $post_id);
            $replace_map[$old_basename] = $asset['url'];
        }
    }

    $new_content = replace_or_remove_images($post->post_content, $replace_map, $remove_list);
    if ($new_content !== $post->post_content) {
        wp_update_post([
            'ID' => $post_id,
            'post_content' => $new_content,
        ]);
    }

    clean_post_cache($post_id);
    $report['updated_posts'][] = [
        'post_id' => $post_id,
        'title' => $post->post_title,
        'featured_url' => get_the_post_thumbnail_url($post_id, 'full'),
        'new_featured' => $new_featured,
        'removed' => $remove_list,
        'replaced' => array_keys($replace_map),
    ];
}

file_put_contents($backup_dir . '/report.json', wp_json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES));
echo wp_json_encode($report, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES) . PHP_EOL;
