<?php
/**
 * Plugin Name: Mayaobongro Free Logo Price
 * Description: Displays "Miễn phí" for zero-priced logo basketball products.
 */

declare(strict_types=1);

add_filter('woocommerce_get_price_html', static function (string $priceHtml, $product): string {
    if (!($product instanceof WC_Product)) {
        return $priceHtml;
    }

    $price = $product->get_price();
    if ($price === '' || (float) $price !== 0.0) {
        return $priceHtml;
    }

    if (!has_term('logo-doi-bong-ro', 'product_cat', $product->get_id())) {
        return $priceHtml;
    }

    return '<span class="price"><span class="woocommerce-Price-amount amount">Miễn phí</span></span>';
}, 20, 2);

add_action('wp_head', static function (): void {
    if (is_admin()) {
        return;
    }
    ?>
    <style id="mayaobongro-free-logo-price">
        .product_cat-logo-doi-bong-ro .price .woocommerce-Price-amount.amount,
        .product_cat-logo-doi-bong-ro .price-regular .woocommerce-Price-amount.amount {
            font-size: 0 !important;
            line-height: 1;
        }

        .product_cat-logo-doi-bong-ro .price .woocommerce-Price-amount.amount::after,
        .product_cat-logo-doi-bong-ro .price-regular .woocommerce-Price-amount.amount::after {
            content: "Miễn phí";
            font-size: 16px;
            font-weight: 700;
            color: #e53935;
        }
    </style>
    <?php
});

function mayaobongro_is_logo_product(): bool
{
    return function_exists('is_product')
        && is_product()
        && has_term('logo-doi-bong-ro', 'product_cat', get_queried_object_id());
}

function mayaobongro_logo_price_label(): string
{
    return '<div class="maya-free-price">Miễn phí</div>';
}

function mayaobongro_logo_summary_html(): string
{
    $product = wc_get_product(get_queried_object_id());
    if (!$product) {
        return '';
    }

    $title = esc_html($product->get_name());
    $excerpt = wp_kses_post(wpautop($product->get_short_description()));
    $priceLabel = mayaobongro_logo_price_label();

    return <<<HTML
    <div class="maya-logo-summary">
        <h1>{$title}</h1>
        <div class="maya-logo-summary__price">{$priceLabel}</div>
        <div class="maya-logo-summary__excerpt">{$excerpt}</div>
        <ul class="maya-logo-summary__list">
            <li>Miễn phí dựng concept ban đầu theo tên đội hoặc tên lớp.</li>
            <li>Miễn phí chỉnh màu logo để khớp màu áo bóng rổ đang dùng.</li>
            <li>Phù hợp cho in ép, thêu vi tính, patch ngực trái hoặc avatar đội.</li>
        </ul>
        <div class="maya-logo-summary__actions">
            <a class="button primary is-large" href="tel:0989353247">Gọi tư vấn ngay</a>
            <a class="button is-outline is-large" href="https://zalo.me/0989353247" target="_blank" rel="noopener">Nhận mẫu qua Zalo</a>
        </div>
    </div>
    HTML;
}

function mayaobongro_logo_colors_html(): string
{
    return <<<HTML
    <div class="maya-logo-note maya-logo-note--colors">
        <strong>Tùy biến màu logo:</strong> đỏ, đen, trắng, xanh navy, hồng hoặc phối riêng theo màu áo bóng rổ của đội.
    </div>
    HTML;
}

function mayaobongro_logo_size_guide_html(): string
{
    return <<<HTML
    <div class="maya-logo-note maya-logo-note--placements">
        <h3>Vị trí dùng logo trên áo bóng rổ</h3>
        <ul>
            <li>Ngực trái hoặc giữa ngực cho áo thi đấu.</li>
            <li>Tay áo, quần hoặc patch thêu cho bộ đồng phục.</li>
            <li>Avatar đội, ảnh bìa CLB hoặc poster giải nội bộ.</li>
        </ul>
    </div>
    HTML;
}

add_action('template_redirect', static function (): void {
    if (!mayaobongro_is_logo_product()) {
        return;
    }

    ob_start(static function (string $html): string {
        return str_replace(
            ['[x24_product_summary]', '[x24_product_colors]', '[x24_product_size_guide]'],
            [mayaobongro_logo_summary_html(), mayaobongro_logo_colors_html(), mayaobongro_logo_size_guide_html()],
            $html
        );
    });
}, 0);

add_action('wp_head', static function (): void {
    if (!mayaobongro_is_logo_product()) {
        return;
    }
    ?>
    <style id="mayaobongro-logo-product-fallback">
        .maya-logo-summary h1 {
            margin: 0 0 8px;
            font-size: 34px;
            line-height: 1.15;
            color: #162840;
        }

        .maya-logo-summary__price,
        .maya-free-price {
            color: #e53935;
            font-weight: 700;
            font-size: 24px;
            margin-bottom: 12px;
        }

        .maya-logo-summary__excerpt {
            color: #364152;
            margin-bottom: 14px;
        }

        .maya-logo-summary__list,
        .maya-logo-note ul {
            margin: 0 0 18px 18px;
        }

        .maya-logo-summary__actions {
            display: flex;
            gap: 12px;
            flex-wrap: wrap;
            margin-top: 16px;
        }

        .maya-logo-note {
            background: #f7f8fa;
            border: 1px solid #e5e7eb;
            border-radius: 16px;
            padding: 16px 18px;
            margin-top: 16px;
        }

        .maya-logo-note h3 {
            margin: 0 0 10px;
            font-size: 20px;
            color: #162840;
        }
    </style>
    <?php
}, 25);
