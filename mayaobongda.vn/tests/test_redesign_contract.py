from pathlib import Path
import re
import unittest


SITE_DIR = Path(__file__).resolve().parents[1]
REMOTE_WORK = SITE_DIR / "remote-work"


class RedesignContractTest(unittest.TestCase):
    def test_redesign_stylesheet_is_enqueued_with_file_version(self):
        functions = (REMOTE_WORK / "functions.php").read_text()

        self.assertIn("x24-redesign.css", functions)
        self.assertIn("filemtime", functions)
        self.assertIn("wp_enqueue_style", functions)
        self.assertIn("array('flatsome-style')", functions)
        self.assertIn("'x24_enqueue_redesign_styles', 999", functions)

    def test_stylesheet_covers_core_surfaces_and_mobile(self):
        css = (REMOTE_WORK / "x24-redesign.css").read_text()

        required_selectors = (
            ".x24-home-hero",
            ".x24-category-feature",
            ".x24-process",
            ".custom-product-card",
            ".tax-product_cat",
            ".single-product",
            ".footer",
        )
        for selector in required_selectors:
            self.assertIn(selector, css)

        self.assertRegex(css, r"@media\s*\([^)]*max-width:\s*768px")
        self.assertIn("prefers-reduced-motion", css)
        self.assertNotIn("#ee2a7b", css.lower())
        self.assertIn(
            ".home #content section.x24-home-hero .img-inner img",
            css,
        )
        self.assertIn(
            ".home #content section.x24-home-hero .img-inner {",
            css,
        )
        self.assertIn("max-height: none", css)
        self.assertIn("position: absolute", css)
        self.assertIn(
            ".home .x24-category-feature .button.primary",
            css,
        )
        self.assertIn(
            ".home .header-wrapper {\n    position: relative !important;",
            css,
        )
        self.assertIn(
            ".home .x24-hidden-flash-sale {\n  display: none !important;",
            css,
        )
        self.assertIn(".home .x24-testimonial-section", css)
        self.assertIn(".home .x24-best-seller-title", css)
        self.assertIn(".home .x24-hidden-category-tabs", css)
        self.assertIn(".home .x24-product-grid", css)
        self.assertIn(".home .x24-product-section-actions", css)
        self.assertIn(".x24-process-lead", css)
        self.assertIn(".x24-process-button", css)
        self.assertIn(".custom-product-card .x24-stars", css)
        self.assertIn(".custom-product-card .rating .review-count", css)
        self.assertIn("margin-top: 0;", css)
        self.assertIn("white-space: nowrap;", css)
        self.assertIn(".custom-product-card .product-thumbnail a", css)
        self.assertIn("display: block;", css)
        self.assertIn("width: 100%;", css)
        self.assertIn("padding: 10px 16px 14px;", css)
        self.assertIn("color: #f5a400 !important;", css)
        self.assertIn("grid-template-columns: repeat(4, minmax(0, 1fr));", css)
        self.assertIn("grid-template-columns: repeat(2, minmax(0, 1fr));", css)
        self.assertIn(".header .x24-mobile-search-trigger", css)
        self.assertIn(".header .header-search-form", css)
        self.assertIn(".header .header-search-lightbox", css)
        self.assertIn(".home .icon-box-center.featured-box", css)
        self.assertNotIn(".home .featured-box {\n", css)
        self.assertIn(
            ".x24-home-hero .hide-for-medium {\n    display: block !important;",
            css,
        )
        self.assertIn(
            ".flash-sale-text {\n    font-size: 16px;",
            css,
        )
        self.assertIn(
            ".flash-sale-end {\n    display: none;",
            css,
        )
        self.assertIn(
            ".s-soft {\n    bottom: 10px !important;",
            css,
        )
        self.assertIn("position: static !important;", css)
        self.assertIn("white-space: nowrap;", css)
        self.assertIn(".header .header-main {", css)

    def test_footer_script_marks_visual_sections(self):
        functions = (REMOTE_WORK / "functions.php").read_text()

        self.assertIn("x24-hidden-flash-sale", functions)
        self.assertIn("x24-testimonial-section", functions)
        self.assertIn("x24-best-seller-title", functions)
        self.assertIn("x24-mobile-search-trigger", functions)
        self.assertIn("x24HideDeadCategoryTabs", functions)
        self.assertIn("x24GridProductRows", functions)
        self.assertIn(".home .row-slider, .home .products.row", functions)
        self.assertIn("Xem Tất Cả Sản Phẩm", functions)
        self.assertIn("Xem Thêm", functions)
        self.assertIn("flickity('destroy')", functions)
        self.assertIn("ĐÁNH GIÁ CỦA KHÁCH HÀNG", functions)
        self.assertIn("header-search-form .search-field", functions)

    def test_product_cards_use_real_woocommerce_metrics(self):
        product = (REMOTE_WORK / "content-product.php").read_text()
        footer = (REMOTE_WORK / "footer.php").read_text()

        self.assertIn("get_review_count", product)
        self.assertIn("get_average_rating", product)
        self.assertIn("get_total_sales", product)
        self.assertIn("crc32", product)
        self.assertIn("display_review_count", product)
        self.assertIn("Lượt đánh giá", product)
        self.assertIn("x24-stars", product)
        self.assertNotIn("</del><br>", product)
        self.assertNotIn("Math.random", product)
        self.assertNotIn("Math.random", footer)
        self.assertNotRegex(product, re.compile(r"★★★★"))

    def test_product_card_sale_price_precedes_regular_price(self):
        product = (REMOTE_WORK / "content-product.php").read_text()
        sale_price = product.index(
            "<strong><?php echo wc_price( $product->get_sale_price() ); ?></strong>"
        )
        regular_price = product.index(
            "<del><?php echo wc_price( $product->get_regular_price() ); ?></del>"
        )

        self.assertLess(sale_price, regular_price)

    def test_product_card_matches_compact_reference_hierarchy(self):
        css = (REMOTE_WORK / "x24-redesign.css").read_text()

        self.assertIn(
            ".custom-product-card .price strong {\n"
            "  color: var(--x24-accent);\n"
            "  font-size: 18px;",
            css,
        )
        self.assertIn(
            ".custom-product-card .price del {\n"
            "  color: var(--x24-ink);\n"
            "  font-size: 17px;",
            css,
        )
        self.assertNotIn(
            ".custom-product-card .rating {\n"
            "  align-items: center;\n"
            "  border-top:",
            css,
        )
        self.assertIn(
            ".custom-product-card .rating .review-count {\n"
            "  color: var(--x24-ink) !important;\n"
            "  display: inline;\n"
            "  font-size: 15px;\n"
            "  font-weight: 400;",
            css,
        )
        self.assertIn(
            ".custom-product-card h2.woocommerce-loop-product__title {\n"
            "  font-size: 16px;\n"
            "  line-height: 1.35;\n"
            "  margin: 0 0 10px;\n"
            "  overflow: hidden;\n"
            "  padding: 0 16px;\n"
            "  text-overflow: ellipsis;\n"
            "  white-space: nowrap;",
            css,
        )

    def test_product_card_overrides_legacy_inline_spacing(self):
        css = (REMOTE_WORK / "x24-redesign.css").read_text()

        self.assertIn(
            "body .custom-product-card {\n"
            "  padding: 0 !important;",
            css,
        )
        self.assertIn("body .custom-product-card .price del", css)
        self.assertIn("body .custom-product-card .price strong", css)
        self.assertIn("body .custom-product-card .rating .review-count", css)
        self.assertIn(
            "body .custom-product-card .product-thumbnail a {\n"
            "  margin: 0 !important;",
            css,
        )
        self.assertIn("font-size: 17px !important;", css)
        self.assertIn("color: var(--x24-ink) !important;", css)
        self.assertIn(
            "@media (max-width: 768px)",
            css,
        )
        self.assertIn(
            "  .custom-product-card .rating {\n"
            "    align-items: center;\n"
            "    flex-direction: row;\n"
            "    gap: 4px;\n"
            "    padding: 0 8px 14px;",
            css,
        )
        self.assertIn(
            "  body .custom-product-card .rating .review-count {\n"
            "    font-size: 10px;",
            css,
        )

    def test_homepage_updater_repairs_empty_banners_and_hero_crop(self):
        updater = (REMOTE_WORK / "homepage-redesign.php").read_text()

        self.assertIn("x24-home-hero", updater)
        self.assertIn("x24-category-feature", updater)
        self.assertIn("x24-process", updater)
        self.assertIn("sub-banner.webp", updater)
        self.assertIn("x24-process-button", updater)
        self.assertIn("expected_hash", updater)
        self.assertIn("dry-run", updater)
        self.assertIn("assert_replacement_count", updater)
        self.assertIn(
            "preg_replace($pattern, $replacement, $content, -1, $count)",
            updater,
        )

    def test_fabric_page_has_accessible_zoomable_lightbox(self):
        functions = (REMOTE_WORK / "functions.php").read_text()
        css = (REMOTE_WORK / "x24-redesign.css").read_text()
        script = (REMOTE_WORK / "x24-fabric-lightbox.js").read_text()

        self.assertIn("is_page(1440)", functions)
        self.assertIn("x24-fabric-lightbox.js", functions)
        self.assertIn("filemtime", functions)

        self.assertIn(".x24-fabric-lightbox", css)
        self.assertIn(".x24-fabric-lightbox__stage", css)
        self.assertIn(".x24-fabric-card-media img[role=\"button\"]", css)

        self.assertIn(".x24-fabric-card-media img", script)
        self.assertIn("setAttribute('role', 'dialog')", script)
        self.assertIn("setAttribute('aria-modal', 'true')", script)
        self.assertIn('data-action="zoom-in"', script)
        self.assertIn('data-action="zoom-out"', script)
        self.assertIn("wheel", script)
        self.assertIn("pointerdown", script)
        self.assertIn("Escape", script)


if __name__ == "__main__":
    unittest.main()
