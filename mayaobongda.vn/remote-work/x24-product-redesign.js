/**
 * X24 PDP enhancements — product detail page.
 *
 * - Sale countdown timer (deadline stored in localStorage, rolling 3-day window)
 * - Sticky mobile CTA bar: reads the live price from the product summary and
 *   syncs into the fixed bottom bar; hides until the user scrolls past the fold.
 *
 * No dependencies. Scope: single product pages only (enqueued conditionally).
 */
(function () {
  'use strict';

  /* -------------------- Sale countdown -------------------- */
  function pad(n) {
    return n < 10 ? '0' + n : '' + n;
  }

  function startCountdown() {
    var timer = document.querySelector('.x24-pdp-promo-timer');
    if (!timer) {
      return;
    }

    // Rolling deadline: persists across reloads for ~3 days to feel real.
    var KEY = 'x24_pdp_deadline';
    var deadline = parseInt(localStorage.getItem(KEY), 10);
    var now = Date.now();
    var THREE_DAYS = 3 * 24 * 60 * 60 * 1000;

    if (!deadline || isNaN(deadline) || deadline < now) {
      deadline = now + THREE_DAYS;
      try {
        localStorage.setItem(KEY, String(deadline));
      } catch (e) {
        /* private mode — keep in-memory fallback */
      }
    }

    var hh = timer.querySelector('[data-unit="h"]');
    var mm = timer.querySelector('[data-unit="m"]');
    var ss = timer.querySelector('[data-unit="s"]');

    function tick() {
      var remaining = deadline - Date.now();
      if (remaining <= 0) {
        deadline = Date.now() + THREE_DAYS;
        try {
          localStorage.setItem(KEY, String(deadline));
        } catch (e) {}
        remaining = THREE_DAYS;
      }
      var totalSec = Math.floor(remaining / 1000);
      var h = Math.floor(totalSec / 3600);
      var m = Math.floor((totalSec % 3600) / 60);
      var s = totalSec % 60;
      if (hh) hh.textContent = pad(h);
      if (mm) mm.textContent = pad(m);
      if (ss) ss.textContent = pad(s);
    }

    tick();
    setInterval(tick, 1000);
  }

  /* -------------------- Sticky mobile CTA -------------------- */
  function initStickyBar() {
    var bar = document.querySelector('.x24-pdp-sticky');
    if (!bar) {
      return;
    }

    // Sync price text from the product price block into the sticky bar.
    var priceEl = document.querySelector('.single-product .product-page-price, .single-product .product-info .price');
    var salePriceEl = priceEl ? priceEl.querySelector('ins .amount, ins') : null;
    var regPriceEl = priceEl ? priceEl.querySelector('del .amount, del') : null;
    var plainPriceEl = priceEl && !salePriceEl ? priceEl.querySelector('.amount') : null;

    var stickySale = bar.querySelector('[data-sticky-sale]');
    var stickyReg = bar.querySelector('[data-sticky-reg]');
    var stickyPlain = bar.querySelector('[data-sticky-plain]');

    if (salePriceEl && stickySale) {
      stickySale.textContent = salePriceEl.textContent.trim();
    }
    if (regPriceEl && stickyReg) {
      stickyReg.textContent = regPriceEl.textContent.trim();
    }
    if (plainPriceEl && stickyPlain && !salePriceEl) {
      stickyPlain.textContent = plainPriceEl.textContent.trim();
    }

    document.body.classList.add('x24-pdp-has-sticky');

    // Reveal the bar only after the user scrolls past the main add-to-cart area.
    var anchor = document.querySelector('.single-product .product-info .x24-pdp-actions, .single-product .product-info .cart, .single-product .product-info .price');
    var revealed = false;

    function onScroll() {
      if (!anchor) {
        if (!revealed) {
          bar.classList.add('is-visible');
          revealed = true;
        }
        return;
      }
      var rect = anchor.getBoundingClientRect();
      var passed = rect.bottom < window.innerHeight * 0.6;
      if (passed !== revealed) {
        revealed = passed;
        bar.classList.toggle('is-visible', passed);
      }
    }

    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    window.addEventListener('resize', onScroll, { passive: true });
  }

  function init() {
    startCountdown();
    initStickyBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
