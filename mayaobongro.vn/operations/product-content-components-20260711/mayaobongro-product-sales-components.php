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
    return '';
}
add_shortcode('mbro_product_sales_boxes', 'mbro_product_sales_boxes_shortcode');

function mbro_product_top_sales_panel_shortcode(): string
{
    ob_start();
    ?>
    <aside class="mbro-top-sales-panel" aria-label="Ưu đãi và bảo hành khi đặt áo bóng rổ">
        <article class="mbro-top-sales-card mbro-top-sales-card--accent">
            <h2>
                <span class="mbro-top-sales-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false"><path d="M13 2 4 14h7l-1 8 10-13h-7l1-7Z"/></svg>
                </span>
                <span>Ưu đãi đặt may</span>
            </h2>
            <ul>
                <li>Miễn phí demo tên đội, tên riêng, số áo và logo.</li>
                <li>Tư vấn size theo chiều cao, cân nặng từng thành viên.</li>
                <li>Chỉnh màu theo lớp, CLB, trường hoặc nhà tài trợ.</li>
            </ul>
        </article>
        <article class="mbro-top-sales-card">
            <h2>
                <span class="mbro-top-sales-icon" aria-hidden="true">
                    <svg viewBox="0 0 24 24" focusable="false"><path d="M20 13c0 5-3.5 7.5-8 9-4.5-1.5-8-4-8-9V5l8-3 8 3v8Z"/><path d="m9 12 2 2 4-5"/></svg>
                </span>
                <span>Bảo hành & kiểm hàng</span>
            </h2>
            <ul>
                <li>Duyệt bố cục logo, tên và số trước khi sản xuất.</li>
                <li>Hỗ trợ xử lý lỗi kỹ thuật từ xưởng.</li>
                <li>Đóng gói dễ chia áo cho cả đội.</li>
            </ul>
        </article>
    </aside>
    <?php
    return trim((string) ob_get_clean());
}
add_shortcode('mbro_product_top_sales_panel', 'mbro_product_top_sales_panel_shortcode');

function mbro_product_sales_boxes_full(): string
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
        .x24-product-hero-section {
            --mbro-red: #df2b24;
            --mbro-ink: #111827;
            --mbro-muted: #5f6671;
            --mbro-line: #e2e6eb;
        }
        .x24-product-hero-section .section-content > .row {
            max-width: 1860px;
        }
        .x24-product-hero-row {
            align-items: flex-start;
            row-gap: 18px;
        }
        .x24-product-hero-row .col {
            min-width: 0;
        }
        .x24-product-hero-row .x24-product-media-col,
        .x24-product-hero-row .x24-product-summary-col,
        .x24-product-hero-row .mbro-product-sales-col {
            padding-bottom: 12px;
        }
        .x24-product-hero-row .x24-product-media-col .col-inner {
            border-radius: 10px;
        }
        .x24-product-summary .product-title {
            color: var(--mbro-ink);
            letter-spacing: 0;
            text-wrap: balance;
        }
        .x24-product-summary .x24-product-subtitle,
        .x24-product-summary__excerpt,
        .mbro-product-summary__excerpt {
            color: var(--mbro-muted);
        }
        .x24-product-meta-pills {
            display: flex;
            flex-wrap: wrap;
            gap: 10px;
            margin: 18px 0 22px;
        }
        .x24-product-meta-pill {
            max-width: 100%;
            min-width: 0;
            overflow-wrap: anywhere;
        }
        .x24-product-price {
            color: var(--mbro-red);
            font-size: clamp(3rem, 4.5vw, 4.8rem);
            line-height: .92;
            letter-spacing: 0;
            white-space: nowrap;
            overflow: visible;
        }
        .x24-product-price .amount {
            color: inherit;
            font-size: inherit;
            line-height: inherit;
        }
        .x24-product-actions {
            display: flex;
            flex-wrap: wrap;
            gap: 12px;
            margin-top: 24px;
        }
        .x24-product-actions a {
            min-width: 0;
            min-height: 58px;
            padding: 0 22px;
            border-radius: 8px;
            line-height: 1.15;
            text-align: center;
        }
        .mbro-product-sales-col .col-inner {
            height: 100%;
        }
        .mbro-top-sales-panel {
            position: sticky;
            top: 88px;
            display: grid;
            gap: 12px;
        }
        .mbro-top-sales-card {
            border: 1px solid #d1d5db;
            border-radius: 8px;
            background: #ffffff;
            padding: 18px;
            box-shadow: 0 12px 28px rgba(17, 24, 39, .07);
        }
        .mbro-top-sales-card--accent {
            border-color: #f97316;
            background: linear-gradient(180deg, #fff7ed 0%, #ffffff 100%);
        }
        .mbro-top-sales-card h2 {
            display: flex;
            align-items: center;
            gap: 10px;
            margin: 0 0 10px;
            font-size: clamp(1rem, 1.15vw, 1.22rem);
            line-height: 1.3;
            color: var(--mbro-ink);
            text-wrap: balance;
        }
        .mbro-top-sales-icon {
            display: inline-grid;
            place-items: center;
            flex: 0 0 34px;
            width: 34px;
            height: 34px;
            border-radius: 999px;
            color: #ffffff;
            background: var(--mbro-ink);
            box-shadow: inset 0 0 0 1px rgba(255, 255, 255, .18);
        }
        .mbro-top-sales-card--accent .mbro-top-sales-icon {
            background: #f97316;
        }
        .mbro-top-sales-icon svg {
            width: 18px;
            height: 18px;
            fill: none;
            stroke: currentColor;
            stroke-width: 2.2;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        .mbro-top-sales-card ul {
            margin: 0 0 0 18px;
        }
        .mbro-top-sales-card li {
            margin: 0;
            font-size: clamp(.92rem, .98vw, 1rem);
            line-height: 1.48;
            overflow-wrap: normal;
        }
        .mbro-top-sales-card li + li {
            margin-top: 6px;
        }
        .mbro-top-sales-card p {
            color: #4b5563;
            font-size: .9rem;
            line-height: 1.4;
        }
        .mbro-top-sales-card p {
            margin: 9px 0 0;
        }
        @media (min-width: 850px) {
            .x24-product-hero-row .x24-product-summary-col .product-title {
                font-size: clamp(1.45rem, 1.85vw, 2rem);
                line-height: 1.18;
            }
        }
        @media (min-width: 1200px) {
            .x24-product-hero-row .x24-product-media-col.large-5 {
                flex-basis: 43%;
                max-width: 43%;
            }
            .x24-product-hero-row .x24-product-summary-col.large-4 {
                flex-basis: 33%;
                max-width: 33%;
            }
            .x24-product-hero-row .mbro-product-sales-col.large-3 {
                flex-basis: 24%;
                max-width: 24%;
            }
        }
        @media (min-width: 850px) and (max-width: 1199px) {
            .x24-product-hero-row .x24-product-media-col,
            .x24-product-hero-row .x24-product-summary-col,
            .x24-product-hero-row .mbro-product-sales-col {
                flex-basis: 100%;
                max-width: 100%;
            }
            .x24-product-hero-row .x24-product-media-col {
                flex-basis: 45%;
                max-width: 45%;
            }
            .x24-product-hero-row .x24-product-summary-col {
                flex-basis: 55%;
                max-width: 55%;
            }
            .mbro-top-sales-panel {
                position: static;
                grid-template-columns: repeat(2, minmax(0, 1fr));
                margin-top: 0;
            }
            .mbro-top-sales-card {
                min-height: 100%;
            }
            .x24-product-price {
                font-size: clamp(3.1rem, 6vw, 4.2rem);
            }
        }
        @media (max-width: 849px) {
            .x24-product-hero-section {
                padding-top: 18px !important;
                padding-bottom: 20px !important;
            }
            .x24-product-hero-row {
                row-gap: 10px;
            }
            .x24-product-summary .product-title {
                font-size: clamp(1.65rem, 7vw, 2.25rem);
                line-height: 1.12;
                margin-bottom: 8px;
            }
            .x24-product-summary .x24-product-subtitle {
                font-size: 1rem;
                line-height: 1.45;
                margin-bottom: 0;
            }
            .x24-product-meta-pills {
                margin: 14px 0 18px;
            }
            .x24-product-meta-pill {
                width: 100%;
                justify-content: flex-start;
            }
            .x24-product-price {
                font-size: clamp(2.8rem, 13vw, 4rem);
                max-width: 100%;
                white-space: nowrap;
            }
            .x24-product-actions {
                gap: 10px;
                margin-top: 18px;
            }
            .x24-product-actions a {
                flex: 1 1 100%;
                min-height: 56px;
                padding: 0 16px;
            }
            .mbro-top-sales-panel {
                position: static;
                grid-template-columns: 1fr;
                margin-top: 2px;
            }
            .mbro-top-sales-card {
                padding: 16px;
            }
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
        @media (max-width: 420px) {
            .x24-product-price {
                font-size: clamp(2.45rem, 12vw, 3.2rem);
            }
        }
    </style>
    <?php
}
add_action('wp_head', 'mbro_product_sales_boxes_styles', 40);
