<?php
/**
 * Plugin Name: X24 About Page Redirect
 * Description: Redirects the old Flatsome demo page path to the live about page.
 */

declare(strict_types=1);

add_action('template_redirect', static function (): void {
    $path = parse_url($_SERVER['REQUEST_URI'] ?? '', PHP_URL_PATH);
    if ($path !== '/elements/pages/gioi-thieu/' && $path !== '/elements/pages/gioi-thieu') {
        return;
    }

    wp_safe_redirect(home_url('/gioi-thieu/'), 301);
    exit;
}, 1);
