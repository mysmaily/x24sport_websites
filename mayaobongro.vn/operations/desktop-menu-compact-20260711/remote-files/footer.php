<?php
/**
 * The template for displaying the footer.
 *
 * @package          Flatsome\Templates
 * @flatsome-version 3.16.0
 */
?>

</main>

<footer id="footer" class="x24-footer footer-wrapper" role="contentinfo">
  <div class="x24-footer__inner">
    <div class="x24-footer__brand">
      <p class="x24-footer__eyebrow">Mayaobongro.vn</p>
      <h2>Xưởng may áo bóng rổ trực tiếp</h2>
      <p>Thiết kế, in ấn và sản xuất áo bóng rổ theo yêu cầu cho đội nhóm, câu lạc bộ và giải đấu bóng rổ.</p>
      <form role="search" method="get" class="x24-footer-search" action="<?php echo esc_url( home_url( '/' ) ); ?>">
        <label class="screen-reader-text" for="x24-footer-search-field">Tìm kiếm sản phẩm</label>
        <input type="search" id="x24-footer-search-field" class="search-field" placeholder="Tìm mẫu áo, chất liệu, đội bóng..." value="<?php echo get_search_query(); ?>" name="s" />
        <button type="submit" value="Search">Tìm</button>
        <input type="hidden" name="post_type" value="product" />
      </form>
    </div>

    <div class="x24-footer__section">
      <h3>Tư vấn trực tiếp</h3>
      <ul class="x24-footer__list">
        <li><span>Hotline</span><a href="tel:0989353247">0989.353.247</a></li>
        <li><span>Thời gian làm việc</span><strong>08:00 - 17:00 hàng ngày</strong></li>
        <li><span>Thiết kế</span><strong>Miễn phí theo yêu cầu</strong></li>
      </ul>
      <div class="x24-footer__socials" aria-label="Kênh tư vấn Mayaobongro.vn">
        <a href="https://zalo.me/0989353247" target="_blank" rel="noopener">Zalo</a>
        <a href="https://facebook.com/mayaobongro" target="_blank" rel="noopener">Facebook</a>
      </div>
    </div>

    <div class="x24-footer__section">
      <h3>Sản phẩm</h3>
      <ul class="x24-footer__links">
        <li><a href="<?php echo esc_url( home_url( '/may-ao-bong-ro-thiet-ke-rieng-x24/' ) ); ?>">Thiết kế riêng</a></li>
        <li><a href="<?php echo esc_url( home_url( '/ao-bong-ro-co-tay/' ) ); ?>">Áo bóng rổ có tay</a></li>
        <li><a href="<?php echo esc_url( home_url( '/ao-bong-ro-sat-nach/' ) ); ?>">Áo bóng rổ sát nách</a></li>
        <li><a href="<?php echo esc_url( home_url( '/logo-doi-bong-ro/' ) ); ?>">Logo đội bóng rổ</a></li>
      </ul>
    </div>

    <div class="x24-footer__section">
      <h3>Khám phá</h3>
      <ul class="x24-footer__links">
        <li><a href="<?php echo esc_url( home_url( '/gioi-thieu/' ) ); ?>">Giới thiệu</a></li>
        <li><a href="<?php echo esc_url( home_url( '/blog/' ) ); ?>">Blog</a></li>
        <li><a href="<?php echo esc_url( home_url( '/shop/' ) ); ?>">Tất cả sản phẩm</a></li>
        <li><a href="tel:0989353247">Nhận tư vấn may áo bóng rổ</a></li>
      </ul>
    </div>
  </div>

  <div class="x24-footer__bottom">
    <p>&copy; <?php echo esc_html( wp_date( 'Y' ) ); ?> Mayaobongro.vn. Thiết kế và sản xuất áo bóng rổ theo yêu cầu.</p>
    <p>mayaobongro.vn</p>
  </div>
</footer>

</div>

<?php wp_footer(); ?>

</body>
</html>
