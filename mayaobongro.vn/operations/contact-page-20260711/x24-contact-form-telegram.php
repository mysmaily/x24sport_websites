<?php
/**
 * Plugin Name: X24 Contact Form Telegram
 * Description: Renders the Mayaobongro.vn contact form and sends submissions to Telegram.
 */

declare(strict_types=1);

if (!defined('ABSPATH')) {
    exit;
}

function x24_contact_config(): array
{
    $path = '/var/www/_secrets/mayaobongro-contact-telegram.php';
    if (!is_readable($path)) {
        return [];
    }

    $config = require $path;
    return is_array($config) ? $config : [];
}

function x24_contact_current_url(): string
{
    $referer = wp_get_referer();
    if ($referer) {
        return remove_query_arg(['x24_contact', 'x24_order'], $referer);
    }

    return home_url('/lien-he/');
}

function x24_contact_started_fields(string $context): array
{
    $startedAt = (string) time();
    return [
        'started_at' => $startedAt,
        'started_sig' => wp_hash($startedAt . '|' . $context),
        'context' => $context,
    ];
}

function x24_contact_validate_started_fields(string $context): bool
{
    $startedAt = isset($_POST['x24_started_at']) ? (int) $_POST['x24_started_at'] : 0;
    $startedSig = isset($_POST['x24_started_sig']) ? sanitize_text_field(wp_unslash($_POST['x24_started_sig'])) : '';
    $expectedSig = wp_hash((string) $startedAt . '|' . $context);
    $age = time() - $startedAt;

    return $startedAt > 0 && hash_equals($expectedSig, $startedSig) && $age >= 3 && $age <= DAY_IN_SECONDS;
}

function x24_contact_form_shortcode(): string
{
    $status = isset($_GET['x24_contact']) ? sanitize_key((string) $_GET['x24_contact']) : '';
    $started = x24_contact_started_fields('x24_contact_started_at');

    ob_start();
    ?>
    <div class="x24-contact-box" style="background:#fff;border:1px solid #ececec;padding:20px;border-radius:8px;">
        <?php if ($status === 'sent') : ?>
            <div style="margin:0 0 16px;padding:12px 14px;border-radius:6px;background:#eaf7ef;color:#176b34;font-weight:700;">Cảm ơn bạn. Mayaobongro.vn đã nhận được yêu cầu và sẽ liên hệ lại sớm.</div>
        <?php elseif ($status === 'error') : ?>
            <div style="margin:0 0 16px;padding:12px 14px;border-radius:6px;background:#fff0f0;color:#a40000;font-weight:700;">Chưa gửi được yêu cầu. Vui lòng thử lại hoặc gọi hotline.</div>
        <?php endif; ?>

        <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" style="display:grid;gap:10px;" data-x24-contact-form>
            <input type="hidden" name="action" value="x24_contact_submit">
            <input type="hidden" name="x24_started_at" value="<?php echo esc_attr($started['started_at']); ?>">
            <input type="hidden" name="x24_started_sig" value="<?php echo esc_attr($started['started_sig']); ?>">
            <?php wp_nonce_field('x24_contact_submit', 'x24_contact_nonce'); ?>
            <p style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">
                <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
            </p>
            <label style="display:grid;gap:4px;font-weight:700;color:#222;">
                Tên
                <input type="text" name="x24_name" required maxlength="80" autocomplete="name" style="width:100%;border:1px solid #d8d8d8;border-radius:6px;padding:9px 11px;font-weight:400;">
            </label>
            <label style="display:grid;gap:4px;font-weight:700;color:#222;">
                Số điện thoại
                <input type="tel" name="x24_phone" required maxlength="30" autocomplete="tel" style="width:100%;border:1px solid #d8d8d8;border-radius:6px;padding:9px 11px;font-weight:400;">
            </label>
            <label style="display:grid;gap:4px;font-weight:700;color:#222;">
                Yêu cầu
                <textarea name="x24_request" required maxlength="1200" rows="4" placeholder="Tôi cần đặt may áo bóng rổ cho trường" style="width:100%;border:1px solid #d8d8d8;border-radius:6px;padding:9px 11px;font-weight:400;resize:vertical;"></textarea>
            </label>
            <button type="submit" data-x24-submit-label="Gửi yêu cầu" data-x24-loading-label="Đang gửi..." style="border:0;border-radius:6px;background:#d50000;color:#fff;font-weight:800;padding:11px 16px;cursor:pointer;">Gửi yêu cầu</button>
        </form>
        <script>
        (function(){
            var forms = document.querySelectorAll('[data-x24-contact-form]');
            forms.forEach(function(form){
                form.addEventListener('submit', function(){
                    var button = form.querySelector('button[type="submit"]');
                    if (!button || button.disabled) return;
                    button.dataset.x24SubmitLabel = button.dataset.x24SubmitLabel || button.textContent;
                    button.textContent = button.dataset.x24LoadingLabel || 'Đang gửi...';
                    button.disabled = true;
                    button.style.opacity = '0.72';
                    button.style.cursor = 'wait';
                });
            });
        })();
        </script>
    </div>
    <?php
    return (string) ob_get_clean();
}
add_shortcode('x24_contact_form', 'x24_contact_form_shortcode');

function x24_contact_loading_script(): string
{
    return <<<'HTML'
<script>
(function(){
    var forms = document.querySelectorAll('[data-x24-contact-form]');
    forms.forEach(function(form){
        if (form.dataset.x24LoadingBound === '1') return;
        form.dataset.x24LoadingBound = '1';
        form.addEventListener('submit', function(){
            var button = form.querySelector('button[type="submit"]');
            if (!button || button.disabled) return;
            button.dataset.x24SubmitLabel = button.dataset.x24SubmitLabel || button.textContent;
            button.textContent = button.dataset.x24LoadingLabel || 'Đang gửi...';
            button.disabled = true;
            button.style.opacity = '0.72';
            button.style.cursor = 'wait';
        });
    });
})();
</script>
HTML;
}

function x24_home_order_form_shortcode(): string
{
    $status = isset($_GET['x24_order']) ? sanitize_key((string) $_GET['x24_order']) : '';
    $started = x24_contact_started_fields('x24_home_order_started_at');

    ob_start();
    ?>
    <div class="x24-home-order-overlay">
        <div class="x24-home-order-panel">
            <?php if ($status === 'sent') : ?>
                <div class="x24-home-order-status x24-home-order-status--sent">Mayaobongro.vn đã nhận yêu cầu đặt áo và sẽ liên hệ lại sớm.</div>
            <?php elseif ($status === 'error') : ?>
                <div class="x24-home-order-status x24-home-order-status--error">Vui lòng nhập số điện thoại và thử lại.</div>
            <?php endif; ?>
            <form method="post" action="<?php echo esc_url(admin_url('admin-post.php')); ?>" class="x24-home-order-form" data-x24-contact-form data-x24-home-order-form>
                <input type="hidden" name="action" value="x24_home_order_submit">
                <input type="hidden" name="x24_started_at" value="<?php echo esc_attr($started['started_at']); ?>">
                <input type="hidden" name="x24_started_sig" value="<?php echo esc_attr($started['started_sig']); ?>">
                <?php wp_nonce_field('x24_home_order_submit', 'x24_home_order_nonce'); ?>
                <p style="position:absolute;left:-9999px;top:auto;width:1px;height:1px;overflow:hidden;">
                    <label>Website <input type="text" name="website" tabindex="-1" autocomplete="off"></label>
                </p>
                <input type="text" name="x24_order_name" maxlength="80" autocomplete="name" placeholder="tên" aria-label="Tên">
                <input type="tel" name="x24_order_phone" required maxlength="30" autocomplete="tel" placeholder="số điện thoại" aria-label="Số điện thoại">
                <input type="number" name="x24_order_quantity" min="1" max="9999" inputmode="numeric" placeholder="số áo cần đặt" aria-label="Số áo cần đặt">
                <select name="x24_order_date" aria-label="Ngày cần áo">
                    <option value="">ngày cần áo</option>
                    <option value="4 ngày">4 ngày</option>
                    <option value="5 ngày">5 ngày</option>
                    <option value="1 tuần">1 tuần</option>
                    <option value="Trên 1 tuần">Trên 1 tuần</option>
                </select>
                <button type="submit" data-x24-submit-label="Nhận tư vấn" data-x24-loading-label="Đang gửi...">Nhận tư vấn</button>
            </form>
        </div>
    </div>
    <style>
    .section:has(.x24-home-order-overlay),
    .x24-home-order-overlay {
        position: relative;
    }
    .section:has(.x24-home-order-overlay) {
        overflow: visible;
    }
    .section:has(.x24-home-order-overlay) > .section-content {
        position: relative;
        overflow: visible;
    }
    .section:has(.x24-home-order-overlay) .x24-home-hero-benefits,
    .section:has(.x24-home-order-overlay) .x24-home-hero-proof,
    .section:has(.x24-home-order-overlay) .x24-home-hero-button {
        display: none !important;
    }
    .x24-home-order-overlay {
        position: absolute;
        left: max(32px, calc((100vw - 1180px) / 2 + 20px));
        bottom: 42px;
        z-index: 35;
        width: min(560px, calc(58% - 36px));
        pointer-events: none;
    }
    .x24-home-order-panel {
        position: relative;
        isolation: isolate;
        pointer-events: auto;
        width: 100%;
        padding: 12px;
        overflow: hidden;
        border: 0;
        border-radius: 10px;
        background: #00000045;
        box-shadow: none;
        backdrop-filter: none;
        -webkit-backdrop-filter: none;
    }
    .x24-home-order-status {
        margin: 0 0 8px;
        padding: 8px 10px;
        border-radius: 10px;
        font-size: 13px;
        font-weight: 800;
        line-height: 1.25;
        text-align: center;
    }
    .x24-home-order-status--sent {
        background: #eaf7ef;
        color: #176b34;
    }
    .x24-home-order-status--error {
        background: #fff0f0;
        color: #a40000;
    }
    .x24-home-order-form {
        display: grid;
        grid-template-columns: 1fr 1fr;
        gap: 8px;
        align-items: center;
        margin: 0;
    }
    .x24-home-order-form input[name="x24_order_name"],
    .x24-home-order-form select,
    .x24-home-order-form button {
        grid-column: 1 / -1;
    }
    .x24-home-order-form input,
    .x24-home-order-form select {
        width: 100%;
        min-width: 0;
        height: 38px;
        margin: 0;
        border: 0;
        border-radius: 8px;
        background: rgba(255,255,255,.88);
        color: #111318;
        font-size: 13px;
        font-weight: 700;
        line-height: 1.2;
        padding: 0 12px;
        box-shadow: none;
        transition: border-color .18s ease, background-color .18s ease, box-shadow .18s ease;
    }
    .x24-home-order-form input::placeholder {
        color: rgba(17,19,24,.48);
        opacity: 1;
    }
    .x24-home-order-form input:focus,
    .x24-home-order-form select:focus {
        outline: none;
        background: rgba(255,255,255,.96);
        box-shadow: 0 0 0 2px rgba(213,0,0,.22);
    }
    .x24-home-order-form select {
        color: rgba(17,19,24,.62);
        cursor: pointer;
    }
    .x24-home-order-form select:valid {
        color: #151515;
    }
    .x24-home-order-form button {
        height: 38px;
        min-width: 0;
        border: 0;
        border-radius: 8px;
        background: #d50000;
        color: #fff;
        font-size: 13px;
        font-weight: 900;
        line-height: 1;
        padding: 0 16px;
        cursor: pointer;
        white-space: nowrap;
        box-shadow: none;
        transition: transform .18s ease, box-shadow .18s ease, filter .18s ease;
    }
    .x24-home-order-form button:hover {
        filter: brightness(.96);
        box-shadow: none;
    }
    .x24-home-order-form button:active {
        transform: translateY(1px);
    }
    @supports not selector(:has(*)) {
        .x24-home-order-overlay {
            margin-top: -86px;
        }
    }
    @media (max-width: 849px) {
        .x24-home-order-overlay {
            left: 24px;
            bottom: 20px;
            width: min(520px, calc(100% - 48px));
        }
        .x24-home-order-panel {
            padding: 10px;
            border-radius: 10px;
        }
        .x24-home-order-form {
            grid-template-columns: 1fr 1fr !important;
            gap: 7px !important;
        }
        .x24-home-order-lede {
            display: none !important;
        }
        .x24-home-order-form button {
            width: 100% !important;
            grid-column: 1 / -1 !important;
        }
    }
    @media (max-width: 549px) {
        .x24-home-order-overlay {
            position: relative;
            left: auto;
            right: auto;
            bottom: auto;
            width: calc(100% - 20px);
            margin: 10px auto 12px;
            transform: none;
            pointer-events: auto;
        }
        .x24-home-order-panel {
            padding: 10px;
            border-radius: 0;
            background: #fff;
        }
        .x24-home-order-form {
            grid-template-columns: 1fr 1fr !important;
            gap: 7px !important;
        }
        .x24-home-order-form input,
        .x24-home-order-form select,
        .x24-home-order-form button {
            height: 34px !important;
            min-height: 0 !important;
            border-radius: 8px;
            font-size: 12px;
            line-height: 1 !important;
            padding: 0 10px;
            background: #f4f5f7;
        }
        .x24-home-order-form button {
            height: 38px !important;
            min-width: 0;
            font-size: 13px;
            background: #d50000 !important;
            color: #fff !important;
        }
    }
    </style>
    <?php echo x24_contact_loading_script(); ?>
    <?php
    return (string) ob_get_clean();
}
add_shortcode('x24_home_order_form', 'x24_home_order_form_shortcode');

function x24_contact_map_shortcode(): string
{
    return '<div style="overflow:hidden;border-radius:8px;border:1px solid #ececec;background:#f5f5f5;">'
        . '<iframe title="Bản đồ X24 Sport" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d232.8454953689386!2d105.84012805493546!3d20.971464823776046!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad9e9eb3800b%3A0xa21f7473bf767fee!2sX24%20Sport!5e0!3m2!1sen!2s!4v1783784496555!5m2!1sen!2s" width="600" height="520" style="border:0;width:100%;display:block;" allowfullscreen="" loading="lazy" referrerpolicy="strict-origin-when-cross-origin"></iframe>'
        . '</div>';
}
add_shortcode('x24_contact_map', 'x24_contact_map_shortcode');

function x24_contact_handle_submit(): void
{
    $redirect = x24_contact_current_url();

    if (
        !isset($_POST['x24_contact_nonce'])
        || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['x24_contact_nonce'])), 'x24_contact_submit')
    ) {
        wp_safe_redirect(add_query_arg('x24_contact', 'error', $redirect));
        exit;
    }

    if (!empty($_POST['website'])) {
        wp_safe_redirect(add_query_arg('x24_contact', 'sent', $redirect));
        exit;
    }

    if (!x24_contact_validate_started_fields('x24_contact_started_at')) {
        wp_safe_redirect(add_query_arg('x24_contact', 'error', $redirect));
        exit;
    }

    $name = sanitize_text_field(wp_unslash($_POST['x24_name'] ?? ''));
    $phone = sanitize_text_field(wp_unslash($_POST['x24_phone'] ?? ''));
    $request = sanitize_textarea_field(wp_unslash($_POST['x24_request'] ?? ''));

    if ($name === '' || $phone === '' || $request === '') {
        wp_safe_redirect(add_query_arg('x24_contact', 'error', $redirect));
        exit;
    }

    $config = x24_contact_config();
    $token = (string) ($config['token'] ?? '');
    $chatId = (string) ($config['chat_id'] ?? '');
    if ($token === '' || $chatId === '') {
        wp_safe_redirect(add_query_arg('x24_contact', 'error', $redirect));
        exit;
    }

    $message = implode("\n", [
        'Yêu cầu liên hệ mới từ Mayaobongro.vn',
        '',
        'Tên: ' . $name,
        'Số điện thoại: ' . $phone,
        'Yêu cầu: ' . $request,
        '',
        'Nguồn: ' . home_url('/lien-he/'),
        'Thời gian: ' . current_time('Y-m-d H:i:s'),
    ]);

    $response = wp_remote_post(
        'https://api.telegram.org/bot' . rawurlencode($token) . '/sendMessage',
        [
            'timeout' => 12,
            'body' => [
                'chat_id' => $chatId,
                'text' => $message,
                'disable_web_page_preview' => 'true',
            ],
        ]
    );

    $ok = !is_wp_error($response) && (int) wp_remote_retrieve_response_code($response) >= 200 && (int) wp_remote_retrieve_response_code($response) < 300;
    wp_safe_redirect(add_query_arg('x24_contact', $ok ? 'sent' : 'error', $redirect));
    exit;
}
add_action('admin_post_nopriv_x24_contact_submit', 'x24_contact_handle_submit');
add_action('admin_post_x24_contact_submit', 'x24_contact_handle_submit');

function x24_home_order_handle_submit(): void
{
    $redirect = x24_contact_current_url();

    if (
        !isset($_POST['x24_home_order_nonce'])
        || !wp_verify_nonce(sanitize_text_field(wp_unslash($_POST['x24_home_order_nonce'])), 'x24_home_order_submit')
    ) {
        wp_safe_redirect(add_query_arg('x24_order', 'error', $redirect));
        exit;
    }

    if (!empty($_POST['website'])) {
        wp_safe_redirect(add_query_arg('x24_order', 'sent', $redirect));
        exit;
    }

    if (!x24_contact_validate_started_fields('x24_home_order_started_at')) {
        wp_safe_redirect(add_query_arg('x24_order', 'error', $redirect));
        exit;
    }

    $name = sanitize_text_field(wp_unslash($_POST['x24_order_name'] ?? ''));
    $phone = sanitize_text_field(wp_unslash($_POST['x24_order_phone'] ?? ''));
    $quantity = sanitize_text_field(wp_unslash($_POST['x24_order_quantity'] ?? ''));
    $date = sanitize_text_field(wp_unslash($_POST['x24_order_date'] ?? ''));

    if ($phone === '') {
        wp_safe_redirect(add_query_arg('x24_order', 'error', $redirect));
        exit;
    }

    $config = x24_contact_config();
    $token = (string) ($config['token'] ?? '');
    $chatId = (string) ($config['chat_id'] ?? '');
    if ($token === '' || $chatId === '') {
        wp_safe_redirect(add_query_arg('x24_order', 'error', $redirect));
        exit;
    }

    $message = implode("\n", [
        'Yêu cầu đặt áo nhanh từ trang chủ Mayaobongro.vn',
        '',
        'Tên: ' . ($name !== '' ? $name : 'Chưa nhập'),
        'Số điện thoại: ' . $phone,
        'Số áo cần đặt: ' . ($quantity !== '' ? $quantity : 'Chưa nhập'),
        'Ngày cần áo: ' . ($date !== '' ? $date : 'Chưa nhập'),
        '',
        'Nguồn: ' . home_url('/'),
        'Thời gian: ' . current_time('Y-m-d H:i:s'),
    ]);

    $response = wp_remote_post(
        'https://api.telegram.org/bot' . rawurlencode($token) . '/sendMessage',
        [
            'timeout' => 12,
            'body' => [
                'chat_id' => $chatId,
                'text' => $message,
                'disable_web_page_preview' => 'true',
            ],
        ]
    );

    $ok = !is_wp_error($response) && (int) wp_remote_retrieve_response_code($response) >= 200 && (int) wp_remote_retrieve_response_code($response) < 300;
    wp_safe_redirect(add_query_arg('x24_order', $ok ? 'sent' : 'error', $redirect));
    exit;
}
add_action('admin_post_nopriv_x24_home_order_submit', 'x24_home_order_handle_submit');
add_action('admin_post_x24_home_order_submit', 'x24_home_order_handle_submit');
