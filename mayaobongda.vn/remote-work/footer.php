<?php
/**
 * The template for displaying the footer.
 *
 * @package          Flatsome\Templates
 * @flatsome-version 3.16.0
 */

global $flatsome_opt;
?>

<!-- Font Awesome 6 (CDN) -->
<link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
<style>
.footer {
  background-color: #000000;
  color: #fff;
  padding: 40px 0;
  font-size: 14px;
}
.footer-title {
  font-size: 22px;
  font-weight: bold;
  margin-bottom: 20px;
}

.footer h3 {
  font-size: 15px;
  font-weight: 700;
  margin-bottom: 15px;
  color: #ffffff;
  text-transform: uppercase;
}

.cus-search-footer{
    border:1px solid #ffffff !important;
    border-radius:10px !important;
    padding:20px 10px !important;
    margin-bottom:20px;
}

.cus-btn-search-footer{
    top:4px !important;
	right:4px !important;
    background:#000000;
    border-radius:10px !important;
    margin: 0 !important;
    color:#ffffff;
}

.footer ul {
  list-style: none;
  padding: 0;
  margin: 0;
}

.footer ul li {
  margin-bottom: 8px;
}
.footer ul li a {
  text-decoration: none;
  color: #ffffff;
  display: inline-block;
}

.footer ul li a:hover {
  color: #ff6600; /* Màu khi hover */
}

.social-icons img,
.footer .banking-logos {
    display: flex;  
    gap: 10px;
}
.footer .banking-logos img {
    height: 40px;
    padding: 4px;
    border: 1px solid #ddd;
    border-radius: 6px;
    background-color: #ffffff;
    min-width: 60px;
}
.footer .social-icons {
    display: flex;
    gap: 10px;
}
.footer .social-icon {
    width: 28px;
    height: 28px;
    border-radius: 5px;
    color: #ffffff;
    display: flex;
    border: 1px solid #ffffff;
    align-items: center;
    justify-content: center;
    text-decoration: none;
    font-size: 15px;
    margin-bottom: 20px;
}
.photo-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 10px; /* khoảng cách giữa các hình */
  max-width: 600px; /* có thể thay đổi */
  margin: 0 auto;
}

.photo-item img {
  width: 100%;
  height: 100%;
  object-fit: cover; /* hình không bị méo */
  display: block;
  transition: transform 0.3s ease;
}

.photo-item img:hover {
  transform: scale(1.05); /* zoom nhẹ khi hover */
}
</style>

<footer class="footer">
  <div class="container">
    <!-- Hàng 2: Các cột -->
    <div class="row">
      <!-- Cột 1 -->
      <div class="col medium-6 small-12 large-3">
      	<h3>THÔNG TIN LIÊN HỆ</h3>
        <p>Miền Bắc: 6 Ngõ 50 Nguyễn Hữu Thọ, Hoàng Liệt, Hà Nội</p>
        <p>Miền Nam: 86/10 đường 12, P.Tam Bình, Thủ Đức, TP.HCM</p>
        <p>Xưởng SX: Ngõ 32 Đại Từ, Hoàng Mai, Hà Nội</p>
        <p>Điện thoại: 0989.353.247</p>
        <p>Email: x24sport.vn@gmail.com</p>
        <p>Website: https://mayaobongda.vn</p>
         <form role="search" method="get" class="woocommerce-product-search flex mb-0 relative" action="https://phuchaidang.com.vn/">
    <label class="screen-reader-text" for="woocommerce-product-search-field-0">Search for:</label>
    <input type="search" id="woocommerce-product-search-field-0" class="search-field cus-search-footer" placeholder="Tìm kiếm sản phẩm…" value="" name="s" />
    <button class="m-0 absolute cus-btn-search-footer" type="submit" value="Search">Tìm Kiếm</button>
    <input type="hidden" name="post_type" value="product" />
</form>
        <p>Copyright: <strong>2025 © mayaobongda.vn</strong></p>
      </div>

      <!-- Cột 3 -->
      <div class="col medium-6 small-12 large-3">
        <h3>Liên Kết FaceBook</h3>
        <iframe title="Facebook X24 Sport"
  src="https://www.facebook.com/plugins/page.php?href=https%3A%2F%2Fwww.facebook.com%2Fx24sport.vn&tabs=timeline&width=580&height=300&small_header=false&adapt_container_width=true&hide_cover=false&show_facepile=true&appId" 
  width="100%" height="305"
  scrolling="no" frameborder="0" allowfullscreen="true" 
  allow="autoplay; clipboard-write; encrypted-media; picture-in-picture; web-share">
</iframe>
        <div class="banking-logos">
    <img src="https://cdn.matasport.vn/wp-content/uploads/2025/07/the-napas-la-gi-1-800x372.png" alt="Thanh toán NAPAS" width="75" height="40">
    <img src="https://cdn.matasport.vn/wp-content/uploads/2025/07/download-1.png" alt="Thanh toán Mastercard" width="81" height="40">
    <img src="https://cdn.matasport.vn/wp-content/uploads/2025/07/png-clipart-visa-logo-credit-card-debit-card-payment-card-bank-visa-blue-text-thumbnail-e1752381849472.png" alt="Thanh toán Visa" width="60" height="40">
  </div>
      </div>
      <div class="col medium-6 small-12 large-3">
        <h3>BẢN ĐỒ</h3>
         <iframe title="Bản đồ X24 Sport" src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d196.70985929399617!2d105.8384573972376!3d20.970940890140014!2m3!1f62.03162024413742!2f45!3f0!3m2!1i1024!2i768!4f35!3m3!1m2!1s0x3135ad9e9eb3800b%3A0xa21f7473bf767fee!2sX24%20Sport!5e1!3m2!1svi!2s!4v1773623783144!5m2!1svi!2s" width="100%" height="305" style="border:0;" allowfullscreen="" loading="lazy" referrerpolicy="no-referrer-when-downgrade"></iframe>
         <div class="social-icons">
    <a class="social-icon facebook" href="https://www.facebook.com/x24sport.vn" target="_blank" rel="noopener noreferrer" aria-label="Facebook X24 Sport">
      <i class="fab fa-facebook-f" aria-hidden="true"></i>
    </a>
    <a class="social-icon tiktok" href="https://www.tiktok.com/@x24sport" target="_blank" rel="noopener noreferrer" aria-label="TikTok X24 Sport">
      <i class="fab fa-tiktok" aria-hidden="true"></i>
    </a>
    <a class="social-icon email" href="mailto:x24sport.vn@gmail.com" aria-label="Email X24 Sport">
      <i class="fas fa-envelope" aria-hidden="true"></i>
    </a>
    <a class="social-icon phone" href="tel:0989353247" aria-label="Gọi X24 Sport">
      <i class="fas fa-phone" aria-hidden="true"></i>
    </a>
    <a class="social-icon instagram" href="https://www.instagram.com/x24sport" target="_blank" rel="noopener noreferrer" aria-label="Instagram X24 Sport">
      <i class="fab fa-instagram" aria-hidden="true"></i>
    </a>
  </div>
      </div>

      <!-- Cột 5 -->
      <div class="col medium-6 small-12 large-3">
        <h3>SẢN PHẨM</h3>
        <div class="photo-grid">
  <div class="photo-item">
    <img src="https://cdn.mayaobongda.vn/wp-content/uploads/2025/08/ao-bong-da-in-ten-so-1-350x350.jpg" alt="Áo bóng đá in tên số" width="350" height="350">
  </div>
  <div class="photo-item">
    <img src="https://cdn.mayaobongda.vn/wp-content/uploads/2025/08/ao-da-banh-team-1-350x350.jpg" alt="Áo đá banh team" width="350" height="350">
  </div>
  <div class="photo-item">
    <img src="https://cdn.mayaobongda.vn/wp-content/uploads/2025/08/ao-da-banh-gia-re-350x350.jpg" alt="Áo đá banh giá rẻ" width="350" height="350">
  </div>
  <div class="photo-item">
    <img src="https://cdn.mayaobongda.vn/wp-content/uploads/2025/08/ao-bong-da-khong-logo-phui-1-350x350.jpg" alt="Áo bóng đá không logo phủi" width="350" height="350">
  </div>
</div>
      </div>
    </div>
  </div>
	<?php do_action('flatsome_footer'); ?>
</footer>

</div>

<?php wp_footer(); ?>

</body>
</html>
<script>
document.addEventListener("DOMContentLoaded", function () {
  const parentBox = document.getElementById("parent-category");
  const childBox = document.getElementById("child-category");
  if (!parentBox || !childBox) return;

  function loadCategories(parent = "", autoLoadFirstChild = false) {
    let url = "/wp-admin/admin-ajax.php?action=load_product_categories";
    if (parent) url += "&parent=" + parent;

    fetch(url)
      .then(res => res.text())
      .then(data => {
        if (!parent) {
          // Render danh mục cha
          parentBox.innerHTML = data;

          // Gán event cho danh mục CHA
          const parentBtns = parentBox.querySelectorAll(".category-button");
          parentBtns.forEach((btn, index) => {
            btn.addEventListener("click", function (e) {
              e.preventDefault();
              parentBtns.forEach(b => b.classList.remove("active"));
              this.classList.add("active");
              loadCategories(this.dataset.category, true);
            });

            // Auto load con của cha đầu tiên
            if (autoLoadFirstChild && index === 0) {
              btn.classList.add("active");
              loadCategories(btn.dataset.category, true);
            }
          });

        } else {
          // Render danh mục CON
          childBox.innerHTML = data;

          // Con không cần JS → click chuyển trang luôn (href đã có sẵn)
        }
      });
  }

  // Lần đầu load cha + auto load con của cha đầu tiên
  loadCategories("", true);
});
</script>
