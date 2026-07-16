#!/usr/bin/env bash
set -u

ROOT="/Users/hoang/hacado/wordpress_websites/mayaobongro.vn/operations/running-to-basketball-db-text-hits-20260708"
REMOTE="root@10.10.0.26"
JUMP="root@103.147.35.95"
REMOTE_BATCH="/root/websites/sites/mayaobongro.vn/wp-content/uploads/codex-ops/running-to-basketball-db-text-hits-20260708"
REMOTE_BATCH_CONTAINER="/var/www/mayaobongro.vn/wp-content/uploads/codex-ops/running-to-basketball-db-text-hits-20260708"
PYTHON="/Users/hoang/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/bin/python3"

cd "$ROOT"

while true; do
  date '+%Y-%m-%d %H:%M:%S retry-remaining-images'
  node retry-remaining-images.mjs
  code=$?
  if [[ "$code" == "0" ]]; then
    break
  fi
  if [[ "$code" == "75" ]]; then
    echo "billing hard limit still active; sleeping 900s"
    sleep 900
    continue
  fi
  echo "retry script exited with $code; sleeping 300s before retry"
  sleep 300
done

date '+%Y-%m-%d %H:%M:%S prepare-final'
"$PYTHON" prepare-final.py

date '+%Y-%m-%d %H:%M:%S upload'
rsync -az -e "ssh -J $JUMP" \
  manifest.json jobs.json manifest-remaining.json jobs-remaining.json generation-results.json final-summary.json remaining-retry-status.json deploy-db-text-hits.php final/ \
  "$REMOTE:$REMOTE_BATCH/"

ssh -J "$JUMP" "$REMOTE" "chown -R www-data:www-data '$REMOTE_BATCH' && docker exec wp-php php '$REMOTE_BATCH_CONTAINER/deploy-db-text-hits.php'"

date '+%Y-%m-%d %H:%M:%S clear-cache'
ssh -J "$JUMP" "$REMOTE" "docker exec wp-php php -r 'require \"/var/www/mayaobongro.vn/wp-load.php\"; if(function_exists(\"wc_delete_product_transients\")) wc_delete_product_transients(); if(class_exists(\"autoptimizeCache\")) autoptimizeCache::clearall(); echo \"cache-cleared\n\";' ; cache=/root/websites/nginx/cache/mayaobongro.vn; find \"\$cache\" -type f -delete 2>/dev/null || true; find \"\$cache\" -type d -empty -delete 2>/dev/null || true"

date '+%Y-%m-%d %H:%M:%S verify'
ssh -J "$JUMP" "$REMOTE" 'docker exec -i wp-php php' <<'PHP'
<?php
require "/var/www/mayaobongro.vn/wp-load.php";
global $wpdb;
$rows = $wpdb->get_results($wpdb->prepare(
    "SELECT ID, post_title, post_name FROM {$wpdb->posts}
     WHERE post_type=%s AND post_status IN ('publish','draft','private')
       AND (
         LOWER(post_title) LIKE LOWER(%s) OR LOWER(post_name) LIKE LOWER(%s)
         OR LOWER(post_title) LIKE LOWER(%s) OR LOWER(post_name) LIKE LOWER(%s)
         OR LOWER(post_title) LIKE LOWER(%s)
       ) ORDER BY ID DESC",
    "product", "%chạy bộ%", "%ao-chay-bo%", "%aochaybo%", "%aochaybo%", "%bước chạy%"
));
$convertedHits = 0;
$unconvertedHits = 0;
$sample = [];
foreach ($rows as $r) {
    $p = wc_get_product((int) $r->ID);
    $sku = $p ? $p->get_sku() : "";
    $model = get_post_meta((int) $r->ID, "_mayaobongro_age_gallery_model", true);
    $converted = (bool) preg_match('/^X24-BR-/', $sku) || $model === "single-product";
    if ($converted) {
        $convertedHits++;
    } else {
        $unconvertedHits++;
    }
    $sample[] = ["id" => (int) $r->ID, "title" => $r->post_title, "sku" => $sku, "converted" => $converted];
}
$convertedRemaining = 0;
foreach ([1269,1267,722,719,716,713,710] as $id) {
    $p = wc_get_product($id);
    if ($p && preg_match('/^X24-BR-/', $p->get_sku())) {
        $convertedRemaining++;
    }
}
echo json_encode([
    "remaining_source_products_converted" => $convertedRemaining,
    "running_text_converted_hits" => $convertedHits,
    "running_text_unconverted_hits" => $unconvertedHits,
    "sample" => array_slice($sample, 0, 20),
], JSON_UNESCAPED_UNICODE | JSON_PRETTY_PRINT), PHP_EOL;
PHP

date '+%Y-%m-%d %H:%M:%S finish-remaining-complete'
