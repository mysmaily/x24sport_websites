<?php
/**
 * Plugin Name: Mayaobongro Linked School Editions
 * Description: Links elementary and high-school basketball products as two selectable editions.
 * Version: 1.0.0
 * Author: Mayaobongro.vn
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

require_once __DIR__ . '/includes/linked-editions-core.php';

const MAYAOBONGRO_EDITION_GROUP_META = '_mayaobongro_edition_group';
const MAYAOBONGRO_SCHOOL_LEVEL_META = '_mayaobongro_school_level';
const MAYAOBONGRO_LINKED_PRODUCT_META = '_mayaobongro_linked_product_id';
const MAYAOBONGRO_AGE_GALLERY_MODEL_META = '_mayaobongro_age_gallery_model';
const MAYAOBONGRO_AGE_IMAGE_TIEU_HOC_META = '_mayaobongro_age_image_tieu_hoc_id';
const MAYAOBONGRO_AGE_IMAGE_THPT_META = '_mayaobongro_age_image_thpt_id';
const MAYAOBONGRO_AGE_KEYWORDS_META = '_mayaobongro_age_keywords';

function mayaobongro_linked_editions_activate(): void
{
    $parent = get_term_by('slug', 'ao-bong-ro-tre-em', 'product_cat');
    if (!$parent || is_wp_error($parent)) {
        $created = wp_insert_term('Áo Bóng Rổ Trẻ Em', 'product_cat', [
            'slug' => 'ao-bong-ro-tre-em',
            'description' => 'Áo bóng rổ dành cho học sinh, đội tuyển trường và lớp năng khiếu.',
        ]);
        if (is_wp_error($created)) {
            throw new RuntimeException($created->get_error_message());
        }
        $parentId = (int) $created['term_id'];
    } else {
        $parentId = (int) $parent->term_id;
    }

    $categories = [
        [
            'name' => 'Áo Bóng Rổ Tiểu Học (Lớp 4–5)',
            'slug' => 'ao-bong-ro-tieu-hoc-lop-4-5',
            'description' => 'Mẫu áo bóng rổ cho học sinh tiểu học lớp 4–5, có form và size phù hợp độ tuổi.',
        ],
        [
            'name' => 'Áo Bóng Rổ Trung Học (Lớp 11–12)',
            'slug' => 'ao-bong-ro-trung-hoc-lop-11-12',
            'description' => 'Mẫu áo bóng rổ cho học sinh trung học lớp 11–12, đội tuyển trường và câu lạc bộ.',
        ],
    ];

    foreach ($categories as $category) {
        $existing = get_term_by('slug', $category['slug'], 'product_cat');
        if ($existing && !is_wp_error($existing)) {
            $updated = wp_update_term((int) $existing->term_id, 'product_cat', [
                'name' => $category['name'],
                'description' => $category['description'],
                'parent' => $parentId,
            ]);
            if (is_wp_error($updated)) {
                throw new RuntimeException($updated->get_error_message());
            }
            continue;
        }

        $created = wp_insert_term($category['name'], 'product_cat', [
            'slug' => $category['slug'],
            'description' => $category['description'],
            'parent' => $parentId,
        ]);
        if (is_wp_error($created)) {
            throw new RuntimeException($created->get_error_message());
        }
    }
}
register_activation_hook(__FILE__, 'mayaobongro_linked_editions_activate');

function mayaobongro_linked_editions_add_meta_box(): void
{
    add_meta_box(
        'mayaobongro-linked-editions',
        'Phiên bản theo cấp học',
        'mayaobongro_linked_editions_render_meta_box',
        'product',
        'side',
        'default'
    );
}
add_action('add_meta_boxes_product', 'mayaobongro_linked_editions_add_meta_box');

function mayaobongro_linked_editions_render_meta_box(WP_Post $post): void
{
    $level = mayaobongro_linked_editions_normalize_level(
        get_post_meta($post->ID, MAYAOBONGRO_SCHOOL_LEVEL_META, true)
    );
    $group = (string) get_post_meta($post->ID, MAYAOBONGRO_EDITION_GROUP_META, true);
    $linkedId = (int) get_post_meta($post->ID, MAYAOBONGRO_LINKED_PRODUCT_META, true);

    wp_nonce_field('mayaobongro_save_linked_editions', 'mayaobongro_linked_editions_nonce');
    ?>
    <p>
        <label for="mayaobongro-school-level"><strong>Cấp học</strong></label>
        <select id="mayaobongro-school-level" name="mayaobongro_school_level" class="widefat">
            <option value="">— Chọn cấp học —</option>
            <option value="tieu-hoc" <?php selected($level, 'tieu-hoc'); ?>>Tiểu học — Lớp 4–5</option>
            <option value="trung-hoc" <?php selected($level, 'trung-hoc'); ?>>Trung học — Lớp 11–12</option>
        </select>
    </p>
    <p>
        <label for="mayaobongro-edition-group"><strong>Mã nhóm thiết kế</strong></label>
        <input
            id="mayaobongro-edition-group"
            name="mayaobongro_edition_group"
            type="text"
            class="widefat"
            value="<?php echo esc_attr($group); ?>"
            placeholder="Ví dụ: x24-cb-059"
        >
    </p>
    <p>
        <label for="mayaobongro-linked-product"><strong>ID sản phẩm cùng mẫu</strong></label>
        <input
            id="mayaobongro-linked-product"
            name="mayaobongro_linked_product_id"
            type="number"
            min="1"
            step="1"
            class="widefat"
            value="<?php echo $linkedId > 0 ? esc_attr((string) $linkedId) : ''; ?>"
            placeholder="ID bản cấp học còn lại"
        >
    </p>
    <p class="description">
        Khi lưu, sản phẩm còn lại sẽ tự liên kết ngược và nhận cấp học đối ứng.
    </p>
    <?php
}

function mayaobongro_linked_editions_save_meta(int $postId, WP_Post $post): void
{
    if (
        !isset($_POST['mayaobongro_linked_editions_nonce'])
        || !wp_verify_nonce(
            sanitize_text_field(wp_unslash($_POST['mayaobongro_linked_editions_nonce'])),
            'mayaobongro_save_linked_editions'
        )
        || (defined('DOING_AUTOSAVE') && DOING_AUTOSAVE)
        || wp_is_post_revision($postId)
        || $post->post_type !== 'product'
        || !current_user_can('edit_post', $postId)
    ) {
        return;
    }

    $level = mayaobongro_linked_editions_normalize_level(
        sanitize_text_field(wp_unslash($_POST['mayaobongro_school_level'] ?? ''))
    );
    $group = sanitize_title(wp_unslash($_POST['mayaobongro_edition_group'] ?? ''));
    $linkedId = absint($_POST['mayaobongro_linked_product_id'] ?? 0);
    $oldLinkedId = (int) get_post_meta($postId, MAYAOBONGRO_LINKED_PRODUCT_META, true);

    if ($level) {
        update_post_meta($postId, MAYAOBONGRO_SCHOOL_LEVEL_META, $level);
    } else {
        delete_post_meta($postId, MAYAOBONGRO_SCHOOL_LEVEL_META);
    }

    if ($oldLinkedId > 0 && $oldLinkedId !== $linkedId) {
        $oldSiblingLink = (int) get_post_meta(
            $oldLinkedId,
            MAYAOBONGRO_LINKED_PRODUCT_META,
            true
        );
        if ($oldSiblingLink === $postId) {
            delete_post_meta($oldLinkedId, MAYAOBONGRO_LINKED_PRODUCT_META);
        }
    }

    $linkedPost = $linkedId > 0 ? get_post($linkedId) : null;
    if (!$linkedPost || $linkedPost->post_type !== 'product' || $linkedId === $postId || !$level) {
        delete_post_meta($postId, MAYAOBONGRO_LINKED_PRODUCT_META);
        if ($group !== '') {
            update_post_meta($postId, MAYAOBONGRO_EDITION_GROUP_META, $group);
        } else {
            delete_post_meta($postId, MAYAOBONGRO_EDITION_GROUP_META);
        }
        return;
    }

    if ($group === '') {
        $ids = [$postId, $linkedId];
        sort($ids, SORT_NUMERIC);
        $group = 'edition-' . implode('-', $ids);
    }

    $siblingLevel = $level === 'tieu-hoc' ? 'trung-hoc' : 'tieu-hoc';
    update_post_meta($postId, MAYAOBONGRO_EDITION_GROUP_META, $group);
    update_post_meta($postId, MAYAOBONGRO_LINKED_PRODUCT_META, $linkedId);
    update_post_meta($linkedId, MAYAOBONGRO_EDITION_GROUP_META, $group);
    update_post_meta($linkedId, MAYAOBONGRO_LINKED_PRODUCT_META, $postId);
    update_post_meta($linkedId, MAYAOBONGRO_SCHOOL_LEVEL_META, $siblingLevel);
}
add_action('save_post_product', 'mayaobongro_linked_editions_save_meta', 10, 2);

function mayaobongro_linked_editions_get_options(int $productId): array
{
    $linkedId = (int) get_post_meta($productId, MAYAOBONGRO_LINKED_PRODUCT_META, true);
    if ($linkedId < 1 || $linkedId === $productId) {
        return [];
    }

    $currentPost = get_post($productId);
    $siblingPost = get_post($linkedId);
    if (
        !$currentPost
        || !$siblingPost
        || $currentPost->post_type !== 'product'
        || $siblingPost->post_type !== 'product'
    ) {
        return [];
    }

    $current = [
        'id' => $productId,
        'level' => get_post_meta($productId, MAYAOBONGRO_SCHOOL_LEVEL_META, true),
        'linked_id' => $linkedId,
        'group' => get_post_meta($productId, MAYAOBONGRO_EDITION_GROUP_META, true),
        'url' => get_permalink($productId),
        'published' => $currentPost->post_status === 'publish',
    ];
    $sibling = [
        'id' => $linkedId,
        'level' => get_post_meta($linkedId, MAYAOBONGRO_SCHOOL_LEVEL_META, true),
        'linked_id' => (int) get_post_meta(
            $linkedId,
            MAYAOBONGRO_LINKED_PRODUCT_META,
            true
        ),
        'group' => get_post_meta($linkedId, MAYAOBONGRO_EDITION_GROUP_META, true),
        'url' => get_permalink($linkedId),
        'published' => $siblingPost->post_status === 'publish',
    ];

    if (!mayaobongro_linked_editions_is_reciprocal_pair($current, $sibling)) {
        return [];
    }

    return mayaobongro_linked_editions_build_options($current, $sibling);
}

function mayaobongro_linked_editions_get_switcher_html(?int $productId = null): string
{
    static $rendered = false;
    global $product;

    if ($rendered) {
        return '';
    }

    if ($productId === null && $product instanceof WC_Product) {
        $productId = $product->get_id();
    }
    if (!$productId) {
        $productId = get_queried_object_id();
    }
    if ($productId < 1) {
        return '';
    }

    $options = mayaobongro_linked_editions_get_options($productId);
    if (count($options) !== 2) {
        return '';
    }

    $rendered = true;
    $headingId = 'mayaobongro-edition-heading-' . $productId;
    ob_start();
    ?>
    <section class="mbro-editions" aria-labelledby="<?php echo esc_attr($headingId); ?>">
        <div class="mbro-editions__heading">
            <h2 id="<?php echo esc_attr($headingId); ?>">Chọn cấp học</h2>
            <span>2 phiên bản cùng thiết kế</span>
        </div>
        <div class="mbro-editions__options" role="list">
            <?php foreach ($options as $option) : ?>
                <?php if ($option['current']) : ?>
                    <span
                        class="mbro-editions__option is-current"
                        aria-current="page"
                        role="listitem"
                    >
                        <span class="mbro-editions__label"><?php echo esc_html($option['label']); ?></span>
                        <span class="mbro-editions__detail"><?php echo esc_html($option['detail']); ?></span>
                        <span class="mbro-editions__status">Đang xem</span>
                    </span>
                <?php else : ?>
                    <a
                        class="mbro-editions__option"
                        href="<?php echo esc_url($option['url']); ?>"
                        role="listitem"
                    >
                        <span class="mbro-editions__label"><?php echo esc_html($option['label']); ?></span>
                        <span class="mbro-editions__detail"><?php echo esc_html($option['detail']); ?></span>
                        <span class="mbro-editions__status">Xem mẫu →</span>
                    </a>
                <?php endif; ?>
            <?php endforeach; ?>
        </div>
    </section>
    <?php

    return trim((string) ob_get_clean());
}

function mayaobongro_linked_editions_render_switcher(): void
{
    $html = mayaobongro_linked_editions_get_switcher_html();
    if ($html === '') {
        return;
    }

    echo $html; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped
}
add_action(
    'woocommerce_single_product_summary',
    'mayaobongro_linked_editions_render_switcher',
    25
);

function mayaobongro_linked_editions_is_age_gallery_product(int $productId): bool
{
    return mayaobongro_linked_editions_is_age_gallery_model(
        get_post_meta($productId, MAYAOBONGRO_AGE_GALLERY_MODEL_META, true)
    );
}

function mayaobongro_linked_editions_get_age_gallery_html(?int $productId = null): string
{
    $productId = $productId ?: get_queried_object_id();
    if ($productId < 1 || !mayaobongro_linked_editions_is_age_gallery_product($productId)) {
        return '';
    }

    $keywords = mayaobongro_linked_editions_normalize_age_keywords(
        get_post_meta($productId, MAYAOBONGRO_AGE_KEYWORDS_META, true)
    );
    $keywordText = $keywords
        ? implode(', ', array_slice($keywords, 0, 4))
        : 'áo bóng rổ tiểu học, áo bóng rổ lớp 9, áo bóng rổ học sinh cấp 3';

    ob_start();
    ?>
    <section class="mbro-age-fit" aria-labelledby="mbro-age-fit-title">
        <div class="mbro-age-fit__heading">
            <h2 id="mbro-age-fit-title">Độ tuổi phù hợp</h2>
            <span>1 mẫu · 2 ảnh tham khảo</span>
        </div>
        <div class="mbro-age-fit__grid">
            <div class="mbro-age-fit__card">
                <strong>Tiểu học lớp 4–5</strong>
                <span>Form nhỏ gọn cho học sinh 9–10 tuổi, áo dài che cạp quần và quần rộng gần gối.</span>
            </div>
            <div class="mbro-age-fit__card">
                <strong>THCS lớp 6–9</strong>
                <span>Cùng thiết kế, xưởng cân size theo chiều cao/cân nặng; phù hợp cả truy vấn áo bóng rổ lớp 9.</span>
            </div>
            <div class="mbro-age-fit__card">
                <strong>THPT / cấp 3</strong>
                <span>Form rộng hơn cho học sinh cấp 3, giữ phối màu áo và quần đồng bộ theo mẫu.</span>
            </div>
        </div>
        <p class="mbro-age-fit__keywords">
            Có thể may theo đội cho: <?php echo esc_html($keywordText); ?>.
        </p>
    </section>
    <?php

    return trim((string) ob_get_clean());
}

function mayaobongro_linked_editions_shortcode(): string
{
    $ageGalleryHtml = mayaobongro_linked_editions_get_age_gallery_html();
    if ($ageGalleryHtml !== '') {
        return $ageGalleryHtml;
    }

    return mayaobongro_linked_editions_get_switcher_html();
}
add_shortcode(
    'mayaobongro_school_edition_switcher',
    'mayaobongro_linked_editions_shortcode'
);

function mayaobongro_linked_editions_product_colors_proxy(): string
{
    $product = wc_get_product(get_queried_object_id());
    if (!$product instanceof WC_Product) {
        return '';
    }
    if (
        !mayaobongro_linked_editions_normalize_level(
            get_post_meta($product->get_id(), MAYAOBONGRO_SCHOOL_LEVEL_META, true)
        )
        && !mayaobongro_linked_editions_is_age_gallery_product($product->get_id())
    ) {
        return '[x24_product_colors]';
    }

    $title = mb_strtolower($product->get_name(), 'UTF-8');
    $palette = [
        'trắng' => '#f5f2ea',
        'cam' => '#ef6c22',
        'đỏ' => '#cf2029',
        'đen' => '#171717',
        'xanh lá' => '#15946f',
        'xanh ngọc' => '#11a6a0',
        'xanh dương' => '#1769aa',
        'xanh' => '#11a6a0',
        'vàng' => '#f0bd2d',
        'hồng' => '#d94879',
        'tím' => '#6d4bb0',
    ];
    $colors = [];
    foreach ($palette as $name => $hex) {
        if (mb_strpos($title, $name, 0, 'UTF-8') !== false) {
            $colors[$name] = $hex;
        }
    }
    if (!$colors) {
        return '';
    }

    ob_start();
    ?>
    <div class="x24-product-colors" aria-label="Màu sắc sản phẩm">
        <?php foreach ($colors as $name => $hex) : ?>
            <span class="x24-product-color">
                <span
                    class="x24-product-color__swatch"
                    style="--x24-swatch: <?php echo esc_attr($hex); ?>"
                    aria-hidden="true"
                ></span>
                <span><?php echo esc_html(mb_convert_case($name, MB_CASE_TITLE, 'UTF-8')); ?></span>
            </span>
        <?php endforeach; ?>
    </div>
    <?php

    return trim((string) ob_get_clean());
}
add_shortcode(
    'mayaobongro_x24_product_colors',
    'mayaobongro_linked_editions_product_colors_proxy'
);

function mayaobongro_linked_editions_product_summary_proxy(): string
{
    $product = wc_get_product(get_queried_object_id());
    if (!$product instanceof WC_Product) {
        return '';
    }

    $level = mayaobongro_linked_editions_normalize_level(
        get_post_meta($product->get_id(), MAYAOBONGRO_SCHOOL_LEVEL_META, true)
    );
    $isAgeGallery = mayaobongro_linked_editions_is_age_gallery_product($product->get_id());
    if (!$level && !$isAgeGallery) {
        return '[x24_product_summary]';
    }

    $group = (string) get_post_meta(
        $product->get_id(),
        MAYAOBONGRO_EDITION_GROUP_META,
        true
    );
    $modelCode = strtoupper(preg_replace('/^([a-z0-9]+)-([a-z]+)-(\d+)$/i', '$1 $2-$3', $group));
    $levelLabel = $isAgeGallery
        ? 'Học sinh · Tiểu học đến THPT'
        : ($level === 'tieu-hoc'
            ? 'Tiểu học · Lớp 4–5'
            : 'Trung học · Lớp 11–12');

    ob_start();
    ?>
    <section class="x24-product-summary mbro-product-summary" aria-label="Thông tin sản phẩm">
        <h1 class="product-title product_title entry-title">
            <?php echo esc_html($product->get_name()); ?>
        </h1>
        <p class="x24-product-subtitle">
            Bộ bóng rổ học sinh với áo và quần phối họa tiết đồng bộ, may theo size từng cấp học.
        </p>
        <div class="x24-product-meta-pills" aria-label="Thông tin mẫu">
            <span class="x24-product-meta-pill">
                <i class="icon-tag" aria-hidden="true"></i>
                <span>Mã mẫu: <strong><?php echo esc_html($modelCode ?: $group); ?></strong></span>
            </span>
            <span class="x24-product-meta-pill">
                <i class="icon-user-o" aria-hidden="true"></i>
                <span><?php echo esc_html($levelLabel); ?></span>
            </span>
        </div>
        <div class="x24-product-price"><?php echo wp_kses_post($product->get_price_html()); ?></div>
        <p class="x24-product-price-note">
            Giá thay đổi theo số lượng, chất liệu và yêu cầu in tên số.
        </p>
        <div class="mbro-product-summary__excerpt">
            <?php echo wp_kses_post(wpautop($product->get_short_description())); ?>
        </div>
        <div class="x24-product-actions" aria-label="Liên hệ đặt may">
            <a
                class="x24-product-actions__zalo"
                href="https://zalo.me/0989353247"
                target="_blank"
                rel="noopener"
            >
                <i class="icon-pen-alt-fill" aria-hidden="true"></i>
                <span>Nhận thiết kế miễn phí</span>
            </a>
            <a class="x24-product-actions__phone" href="tel:0989353247">
                <i class="icon-phone" aria-hidden="true"></i>
                <span>Gọi 0989.353.247</span>
            </a>
        </div>
    </section>
    <?php

    return trim((string) ob_get_clean());
}
add_shortcode(
    'mayaobongro_x24_product_summary',
    'mayaobongro_linked_editions_product_summary_proxy'
);

function mayaobongro_linked_editions_size_guide_proxy(): string
{
    $productId = get_queried_object_id();
    $level = mayaobongro_linked_editions_normalize_level(
        get_post_meta($productId, MAYAOBONGRO_SCHOOL_LEVEL_META, true)
    );
    $isAgeGallery = mayaobongro_linked_editions_is_age_gallery_product($productId);
    if (!$level && !$isAgeGallery) {
        return '[x24_product_size_guide]';
    }

    $levelLabel = $isAgeGallery
        ? 'học sinh tiểu học, THCS và THPT'
        : ($level === 'tieu-hoc'
            ? 'học sinh lớp 4–5'
            : 'học sinh lớp 11–12');

    ob_start();
    ?>
    <section class="x24-size-guide x24-size-guide--full mbro-size-guide" aria-labelledby="mbro-size-guide-title">
        <div class="x24-size-guide__heading">
            <div>
                <p class="x24-size-guide__label">Form bóng rổ theo cấp học</p>
                <h2 id="mbro-size-guide-title">Chọn size cho <?php echo esc_html($levelLabel); ?></h2>
            </div>
            <p>Gửi chiều cao và cân nặng từng học sinh để xưởng lên danh sách size chính xác.</p>
        </div>
        <div class="mbro-size-guide__grid">
            <div>
                <strong>Áo form suông dài</strong>
                <span>Thân áo dài hơn áo thể thao thông thường, che cạp quần và thoải mái khi bật nhảy.</span>
            </div>
            <div>
                <strong>Quần rộng gần gối</strong>
                <span>Họa tiết và màu quần đồng bộ với áo, không mặc định dùng quần đen.</span>
            </div>
            <div>
                <strong>Duyệt size theo đội</strong>
                <span>Xưởng kiểm tra danh sách trước khi cắt may và hỗ trợ điều chỉnh form.</span>
            </div>
        </div>
        <p class="x24-size-guide__note">
            Liên hệ Zalo 0989.353.247 để nhận bảng size phù hợp đúng cấp học.
        </p>
    </section>
    <?php

    return trim((string) ob_get_clean());
}
add_shortcode(
    'mayaobongro_x24_product_size_guide',
    'mayaobongro_linked_editions_size_guide_proxy'
);

function mayaobongro_linked_editions_enqueue_assets(): void
{
    if (!is_product()) {
        return;
    }

    wp_enqueue_style(
        'mayaobongro-linked-editions',
        plugin_dir_url(__FILE__) . 'assets/linked-editions.css',
        [],
        '1.0.0'
    );
}
add_action('wp_enqueue_scripts', 'mayaobongro_linked_editions_enqueue_assets');

function mayaobongro_linked_editions_hide_legacy_related_products(array $relatedPosts, int $productId, array $args): array
{
    unset($args);

    $level = mayaobongro_linked_editions_normalize_level(
        get_post_meta($productId, MAYAOBONGRO_SCHOOL_LEVEL_META, true)
    );
    if (!$level) {
        return $relatedPosts;
    }

    return [];
}
add_filter(
    'woocommerce_related_products',
    'mayaobongro_linked_editions_hide_legacy_related_products',
    20,
    3
);

function mayaobongro_linked_editions_start_output_cleanup(): void
{
    if (!is_product()) {
        return;
    }

    $productId = get_queried_object_id();
    $level = mayaobongro_linked_editions_normalize_level(
        get_post_meta($productId, MAYAOBONGRO_SCHOOL_LEVEL_META, true)
    );
    if (!$level && !mayaobongro_linked_editions_is_age_gallery_product($productId)) {
        return;
    }

    ob_start('mayaobongro_linked_editions_cleanup_product_html');
}
add_action('template_redirect', 'mayaobongro_linked_editions_start_output_cleanup', 2);

function mayaobongro_linked_editions_cleanup_product_html(string $html): string
{
    $html = str_replace('https://mayaochaybo.vn/shop/', home_url('/shop/'), $html);
    $html = preg_replace(
        '~<ul class="next-prev-thumbs\b[^"]*".*?</ul>~s',
        '',
        $html
    ) ?? $html;

    return $html;
}

function mayaobongro_linked_editions_redirect_old_product_slug(): void
{
    if (!is_404()) {
        return;
    }

    $slug = mayaobongro_linked_editions_extract_slug(
        wp_unslash($_SERVER['REQUEST_URI'] ?? '')
    );
    if (!$slug) {
        return;
    }

    global $wpdb;

    $productId = (int) $wpdb->get_var(
        $wpdb->prepare(
            "SELECT p.ID
             FROM {$wpdb->posts} AS p
             INNER JOIN {$wpdb->postmeta} AS pm ON pm.post_id = p.ID
             WHERE p.post_type = 'product'
               AND p.post_status = 'publish'
               AND pm.meta_key = '_wp_old_slug'
               AND pm.meta_value = %s
             ORDER BY p.ID DESC
             LIMIT 1",
            $slug
        )
    );
    if ($productId < 1) {
        return;
    }

    $target = get_permalink($productId);
    if (!$target) {
        return;
    }

    wp_safe_redirect($target, 301, 'Mayaobongro Linked Editions');
    exit;
}
add_action(
    'template_redirect',
    'mayaobongro_linked_editions_redirect_old_product_slug',
    1
);
