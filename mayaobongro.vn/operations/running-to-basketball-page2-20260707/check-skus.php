<?php

declare(strict_types=1);

require '/var/www/mayaobongro.vn/wp-load.php';

for ($number = 1; $number <= 40; $number += 1) {
    $sku = sprintf('X24-BR-%03d', $number);
    $id = wc_get_product_id_by_sku($sku);
    if (!$id) {
        continue;
    }
    echo $sku . '=' . $id . ' ' . get_post_field('post_name', $id) . PHP_EOL;
}
