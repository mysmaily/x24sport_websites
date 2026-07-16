<?php

require '/var/www/mayaobongro.vn/wp-load.php';

$checks = [
    1041 => ['featured_not' => ['ao_chay_bo_dep-3.png'], 'content_not' => ['ao_chay_bo_dep-3.png']],
    1043 => ['featured_not' => ['ao_chay_bo_ca_nhan-2.png'], 'content_not' => ['ao_chay_bo_ca_nhan-2.png']],
    1048 => ['content_not' => ['ao_chay_bo_dep_1.png']],
    1051 => ['content_not' => ['ao_chay_bo_dep_1-1.png']],
    1054 => ['content_not' => ['ao_chay_bo_dep_1-2.png']],
    1057 => ['content_not' => ['ao_chay_bo_dep_1-3.png']],
    1060 => ['content_not' => ['ao_chay_bo_dep_1-4.png']],
    1066 => ['content_not' => ['ao_chay_bo_dep_1-5.png']],
    1073 => ['content_not' => ['ao_chay_bo_dep_1-7.png']],
    1084 => ['content_not' => ['ao-áo bóng rổ sát nách-chay-bo-x24-sport-content.jpg']],
    2286 => ['content_not' => ['mau-ao-chay-cho-giai-cong-ty-400x400.jpg']],
    2308 => ['featured_not' => ['in-gi-len-ao-chay-bo.jpg'], 'content_not' => ['ao-bong-ro-thiet-ke-rieng-giai-chay-Eco-Retreat.jpg', 'ao-bong-ro-giai-chay-Uong-Bi-Club-Cầu thủ.jpg', 'ao-bong-ro-mau-cam-giai-chay-Dong-Do-Land-1.jpg']],
    2342 => ['content_not' => ['ao-bong-ro-chay-road-266x400.jpg', 'ao-bong-ro-theo-mau-giai-chay-400x400.jpg']],
    2354 => ['featured_not' => ['quy-trinh-dat-may.jpg'], 'content_not' => ['buoc-1.jpg', 'buoc-2.jpg', 'buoc-3.jpg']],
    2360 => ['content_not' => ['ao-bong-ro-giai-chay-chuyen-nghiep-400x400.jpg', 'ao-bong-ro-danh-cho-su-kien-chay-400x400.jpg', 'run-for-life-545x400.jpg']],
];

$failures = [];
foreach ($checks as $post_id => $rules) {
    $post = get_post($post_id);
    if (!$post) {
        $failures[] = "Missing post $post_id";
        continue;
    }
    $featured = get_the_post_thumbnail_url($post_id, 'full') ?: '';
    foreach ($rules['featured_not'] ?? [] as $needle) {
        if (str_contains(urldecode($featured), $needle)) {
            $failures[] = "Post $post_id still has forbidden featured image $needle";
        }
    }
    foreach ($rules['content_not'] ?? [] as $needle) {
        if (str_contains(urldecode($post->post_content), $needle)) {
            $failures[] = "Post $post_id still references $needle";
        }
    }
}

if ($failures) {
    echo "FAIL\n";
    foreach ($failures as $failure) {
        echo $failure . "\n";
    }
    exit(1);
}

echo "PASS\n";
