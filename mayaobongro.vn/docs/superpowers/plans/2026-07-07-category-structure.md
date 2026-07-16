# Mayaobongro.vn Category Structure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Reorganize the live WooCommerce catalog and primary navigation around customer ordering intent while preserving existing product URLs and content.

**Architecture:** Use WordPress APIs from a temporary site-local PHP utility so taxonomy, pages, and menus are changed through WordPress rather than raw SQL. Export every affected term, page, menu item, and theme menu assignment to a timestamped JSON backup before applying idempotent changes.

**Tech Stack:** WordPress 6.x APIs, WooCommerce product categories, Flatsome navigation menus, PHP CLI, HTTP/browser verification.

---

### Task 1: Capture the live baseline

**Files:**
- Create: `mayaobongro.vn/operations/category-structure-20260707/site-structure.php`
- Create remotely at runtime: `/root/backups/mayaobongro.vn/category-structure-<timestamp>/before.json`

- [ ] Run the utility in `audit` mode and record product categories, published pages, menus, menu locations, and relevant permalink settings.
- [ ] Confirm the active primary menu and the IDs/slugs of reusable live content.
- [ ] Confirm that existing product-category permalinks will not change when parent relationships are added.

### Task 2: Create the customer-facing catalog structure

**Files:**
- Modify remotely through WordPress APIs: `wp_terms`, `wp_term_taxonomy`

- [ ] Keep the existing categories `Áo Bóng Rổ Sát Nách`, `Áo Bóng Rổ Có Tay`, `Áo Bóng Rổ Cờ Đỏ Sao Vàng`, and `Áo Bóng Rổ Thiết Kế Riêng` at taxonomy root so their short live URLs cannot change.
- [ ] Create a populated landing page `Mẫu Áo Bóng Rổ` with slug `mau-ao-bong-ro` to provide the customer-facing parent hierarchy.
- [ ] Create the future-facing top-level categories `Bộ Quần Áo Bóng Rổ`, `Áo Bóng Rổ 2 Mặt`, `Áo Bóng Rổ Trẻ Em`, and `Quần Bóng Rổ` without assigning products artificially.
- [ ] Leave `Logo Đội Bóng Rổ` independent because it is inspiration/design content rather than an apparel type.

### Task 3: Create useful intent pages

**Files:**
- Modify remotely through WordPress APIs: `wp_posts`, `wp_postmeta`

- [ ] Create or update `Bảng giá may áo bóng rổ` without inventing fixed prices; explain the quote inputs and provide the verified contact CTA.
- [ ] Create or update `Chất liệu & Bảng size` as a hub that links to the existing fabric page and gives a practical size-selection workflow.
- [ ] Create or update `Mẫu áo bóng rổ đã làm` with the existing real-product category shortcode.
- [ ] Reuse the existing rich `Áo Bóng Rổ Thiết Kế Riêng` archive as the `May theo yêu cầu` destination.

### Task 4: Build the primary menu

**Files:**
- Modify remotely through WordPress APIs: `wp_terms`, `wp_term_taxonomy`, `wp_posts`, `wp_postmeta`, `wp_options`

- [ ] Back up the current primary menu and theme-location assignments.
- [ ] Create a new menu named `Menu chính 2026` without deleting the old menu.
- [ ] Add, in order: `Trang chủ`, `Mẫu áo bóng rổ`, `May theo yêu cầu`, `Bảng giá`, `Chất liệu & Size`, `Mẫu đã làm`, `Blog`, and `Liên hệ`.
- [ ] Add only populated or established catalog archives beneath the `Mẫu áo bóng rổ` landing page; do not expose empty future categories in navigation.
- [ ] Assign the new menu to the currently active primary menu location.

### Task 5: Verify and hand off

**Files:**
- Create remotely at runtime: `/root/backups/mayaobongro.vn/category-structure-<timestamp>/after.json`

- [ ] Run the utility again in `audit` mode and compare the resulting taxonomy/menu tree with the intended structure.
- [ ] Clear only the documented/site-local Nginx cache directory discovered on the target host.
- [ ] Verify all menu destinations return HTTP 200 and existing category URLs still resolve.
- [ ] Verify the homepage header/menu at desktop and mobile widths, and check for browser console errors.
- [ ] Report the backup path, modified database objects, cache actions, evidence, and any intentionally deferred content.
