<?php
declare(strict_types=1);

$siteRoot = $argv[1] ?? '/var/www/mayaobongro.vn';
$batchRoot = $argv[2] ?? ($siteRoot . '/wp-content/uploads/codex-ops/pricing-page-20260711');

require rtrim($siteRoot, '/') . '/wp-load.php';

$pageId = 2624;
$page = get_post($pageId);
if (!$page instanceof WP_Post || $page->post_type !== 'page') {
    throw new RuntimeException('Target pricing page not found.');
}

$backupDir = rtrim($batchRoot, '/') . '/backups/' . date('Ymd-His');
if (!wp_mkdir_p($backupDir)) {
    throw new RuntimeException('Unable to create backup directory: ' . $backupDir);
}

$metaKeys = [
    '_yoast_wpseo_title',
    '_yoast_wpseo_metadesc',
    '_yoast_wpseo_focuskw',
];

$backupMeta = [];
foreach ($metaKeys as $key) {
    $backupMeta[$key] = get_post_meta($pageId, $key, true);
}

file_put_contents(
    $backupDir . '/page-2624-before-pricing-update.json',
    wp_json_encode([
        'page_id' => $pageId,
        'post_title' => $page->post_title,
        'post_name' => $page->post_name,
        'post_content' => $page->post_content,
        'post_excerpt' => $page->post_excerpt,
        'post_modified' => $page->post_modified,
        'post_modified_gmt' => $page->post_modified_gmt,
        'meta' => $backupMeta,
    ], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT)
);

$media = [
    'thun_lanh' => wp_get_attachment_url(4235),
    'me_thai' => wp_get_attachment_url(4236),
    'me_texa' => wp_get_attachment_url(4237),
    'me_lava' => wp_get_attachment_url(4238),
];
foreach ($media as $key => $url) {
    if (!$url) {
        throw new RuntimeException('Missing fabric media URL for ' . $key);
    }
}

$muDir = WP_CONTENT_DIR . '/mu-plugins';
if (!wp_mkdir_p($muDir)) {
    throw new RuntimeException('Unable to create mu-plugins directory.');
}

$pluginFile = $muDir . '/x24-br-pricing-page.php';
if (is_file($pluginFile)) {
    copy($pluginFile, $backupDir . '/x24-br-pricing-page.php.bak');
}

$plugin = <<<'PHP'
<?php
/**
 * Plugin Name: X24 Basketball Pricing Page Assets
 * Description: Page-scoped styling and fabric image modal for the basketball pricing landing page.
 */

add_action('wp_head', static function (): void {
    if (!is_page(2624)) {
        return;
    }
    ?>
<style id="x24-br-pricing-page-css">
.x24-price-page{--blue:#073e68;--deep:#061522;--red:#e30613;--ink:#112235;--muted:#58687c;--line:#d8e4f1;--soft:#f3f8fc;--ice:#eaf3fb;color:var(--ink);font-family:Montserrat,Arial,sans-serif}.x24-price-hero{display:grid;grid-template-columns:minmax(0,1.1fr) minmax(320px,.9fr);gap:28px;align-items:stretch;padding:42px 0 28px;border-bottom:1px solid var(--line)}.x24-price-kicker{display:inline-flex;align-items:center;gap:8px;color:var(--red);font-weight:900;text-transform:uppercase;letter-spacing:.04em;font-size:13px;margin-bottom:12px}.x24-price-hero h1{font-size:clamp(34px,5vw,62px);line-height:1.02;margin:0 0 16px;color:var(--blue);text-transform:uppercase}.x24-price-hero p{font-size:18px;line-height:1.65;color:#415168;max-width:820px;margin:0 0 20px}.x24-price-actions{display:flex;flex-wrap:wrap;gap:12px}.x24-price-btn{display:inline-flex;align-items:center;justify-content:center;min-height:46px;padding:0 18px;border-radius:6px;font-weight:900;text-decoration:none;border:1px solid transparent}.x24-price-btn.x24-primary{background:var(--red);color:#fff}.x24-price-btn.x24-secondary{background:var(--blue);color:#fff}.x24-price-btn.x24-ghost{background:#fff;color:var(--blue);border-color:var(--line)}.x24-price-hero-card{background:var(--deep);color:#fff;border-radius:8px;padding:26px;position:relative;overflow:hidden}.x24-price-hero-card:before{content:"";position:absolute;inset:0;background:linear-gradient(135deg,rgba(227,6,19,.22),transparent 50%),radial-gradient(circle at 85% 15%,rgba(255,255,255,.16),transparent 28%);pointer-events:none}.x24-price-hero-card>*{position:relative}.x24-price-hero-card strong{display:block;font-size:44px;line-height:1;color:#fff;margin:8px 0}.x24-price-hero-card span{color:#b7c8da;font-weight:700}.x24-price-hero-card ul{list-style:none;padding:0;margin:22px 0 0;display:grid;gap:12px}.x24-price-hero-card li{display:flex;justify-content:space-between;gap:16px;border-top:1px solid rgba(255,255,255,.16);padding-top:12px}.x24-price-section{padding:34px 0}.x24-price-section-head{display:flex;justify-content:space-between;gap:24px;align-items:end;margin-bottom:18px}.x24-price-section-head h2{font-size:clamp(26px,3vw,40px);line-height:1.1;margin:0;color:var(--blue)}.x24-price-section-head p{max-width:620px;margin:0;color:var(--muted);line-height:1.6}.x24-price-table-wrap{overflow-x:auto;-webkit-overflow-scrolling:touch;border:1px solid var(--line);border-radius:8px;background:#fff;box-shadow:0 16px 44px rgba(7,62,104,.08)}.x24-price-table{width:100%;min-width:980px;border-collapse:separate;border-spacing:0}.x24-price-table th,.x24-price-table td{border-right:1px solid var(--line);border-bottom:1px solid var(--line);padding:16px 14px;text-align:center;vertical-align:middle}.x24-price-table th:last-child,.x24-price-table td:last-child{border-right:0}.x24-price-table tr:last-child td,.x24-price-table tr:last-child th{border-bottom:0}.x24-price-table thead th{background:var(--blue);color:#fff}.x24-price-table thead th:first-child{min-width:160px}.x24-fabric-head{display:grid;gap:8px;justify-items:center}.x24-fabric-head strong{font-size:17px}.x24-fabric-head span{font-size:12px;color:#d6e6f5}.x24-fabric-view{border:1px solid rgba(255,255,255,.45);background:rgba(255,255,255,.1);color:#fff;border-radius:999px;min-height:30px;padding:0 10px;font-size:12px;font-weight:900;cursor:pointer}.x24-price-table tbody th{background:#f0f6fc;color:var(--blue);font-size:16px}.x24-price-table tbody td{font-size:22px;font-weight:900;color:var(--blue)}.x24-price-table tbody td small{display:block;margin-top:5px;font-size:12px;color:var(--muted);font-weight:700}.x24-price-table .recommended{background:#fff9e9}.x24-price-table .recommended strong{color:#b36b00}.x24-price-note-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;margin-top:16px}.x24-price-note{background:var(--soft);border:1px solid var(--line);border-radius:8px;padding:16px}.x24-price-note strong{display:block;color:var(--blue);margin-bottom:6px}.x24-price-note p{margin:0;color:var(--muted);font-size:14px;line-height:1.55}.x24-fabric-choice-grid{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:16px}.x24-fabric-choice{border:1px solid var(--line);border-radius:8px;background:#fff;overflow:hidden}.x24-fabric-choice button{appearance:none;border:0;background:transparent;padding:0;width:100%;cursor:pointer;text-align:left}.x24-fabric-choice img{width:100%;aspect-ratio:1/1;object-fit:cover;display:block}.x24-fabric-choice-body{padding:16px}.x24-fabric-choice h3{font-size:20px;color:var(--blue);margin:0 0 8px}.x24-fabric-choice p{font-size:14px;color:var(--muted);line-height:1.55;margin:0 0 12px}.x24-pill-row{display:flex;flex-wrap:wrap;gap:7px}.x24-pill-row span{font-size:12px;font-weight:800;color:var(--blue);background:var(--ice);border:1px solid #cee2f4;border-radius:999px;padding:6px 9px}.x24-process{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:14px;counter-reset:step}.x24-process-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:18px;position:relative}.x24-process-card:before{counter-increment:step;content:counter(step);display:grid;place-items:center;width:34px;height:34px;border-radius:50%;background:var(--red);color:#fff;font-weight:900;margin-bottom:14px}.x24-process-card h3{font-size:18px;color:var(--blue);margin:0 0 8px}.x24-process-card p{font-size:14px;line-height:1.55;color:var(--muted);margin:0}.x24-faq{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}.x24-faq-item{border:1px solid var(--line);border-radius:8px;background:#fff;padding:16px}.x24-faq-item h3{font-size:17px;line-height:1.35;margin:0 0 10px;color:var(--blue)}.x24-faq-item p{margin:0;color:var(--muted);line-height:1.6}.x24-price-final{background:var(--deep);color:#fff;border-radius:8px;padding:28px;display:flex;justify-content:space-between;align-items:center;gap:18px}.x24-price-final h2{color:#fff;margin:0 0 8px}.x24-price-final p{color:#b7c8da;margin:0}.x24-fabric-modal{position:fixed;inset:0;background:rgba(3,12,24,.9);z-index:999999;display:none;align-items:center;justify-content:center;padding:24px}.x24-fabric-modal.is-open{display:flex}.x24-fabric-modal-card{background:#fff;border-radius:8px;max-width:min(920px,94vw);width:100%;overflow:hidden;box-shadow:0 28px 80px rgba(0,0,0,.35)}.x24-fabric-modal img{width:100%;max-height:72vh;object-fit:contain;background:#f6f8fb;display:block;cursor:zoom-in;transition:transform .2s ease}.x24-fabric-modal.is-zoomed img{transform:scale(1.45);cursor:zoom-out}.x24-fabric-modal-caption{display:flex;justify-content:space-between;gap:12px;align-items:center;padding:14px 16px}.x24-fabric-modal-caption strong{color:var(--blue)}.x24-fabric-modal-actions{display:flex;gap:8px}.x24-fabric-modal button{border:1px solid var(--line);background:#fff;color:var(--blue);font-weight:900;border-radius:999px;min-height:38px;padding:0 13px;cursor:pointer}@media (max-width:980px){.x24-price-hero{grid-template-columns:1fr}.x24-price-note-grid,.x24-fabric-choice-grid,.x24-process{grid-template-columns:repeat(2,minmax(0,1fr))}.x24-price-final{display:block}.x24-price-final .x24-price-actions{margin-top:16px}.x24-price-table tbody td{font-size:19px}}@media (max-width:560px){.x24-price-hero{padding-top:20px}.x24-price-actions a{width:100%}.x24-price-section-head{display:block}.x24-price-section-head p{margin-top:8px}.x24-price-note-grid,.x24-fabric-choice-grid,.x24-process,.x24-faq{grid-template-columns:1fr}.x24-fabric-choice{display:grid;grid-template-columns:42% 58%}.x24-fabric-choice img{height:100%;aspect-ratio:auto}.x24-price-hero-card strong{font-size:36px}.x24-price-table{min-width:860px}.x24-price-modal{padding:12px}.x24-fabric-modal.is-zoomed img{transform:scale(1.2)}}
</style>
    <?php
}, 20);

add_action('wp_footer', static function (): void {
    if (!is_page(2624)) {
        return;
    }
    ?>
<script id="x24-br-pricing-page-js">
(function(){function ready(fn){if(document.readyState!=='loading'){fn()}else{document.addEventListener('DOMContentLoaded',fn)}}ready(function(){var triggers=document.querySelectorAll('[data-x24-fabric-src]');if(!triggers.length)return;var modal=document.createElement('div');modal.className='x24-fabric-modal';modal.setAttribute('role','dialog');modal.setAttribute('aria-modal','true');modal.innerHTML='<div class="x24-fabric-modal-card"><img alt=""><div class="x24-fabric-modal-caption"><strong></strong><div class="x24-fabric-modal-actions"><button type="button" data-x24-zoom>Zoom</button><button type="button" data-x24-close>Đóng</button></div></div></div>';document.body.appendChild(modal);var img=modal.querySelector('img');var title=modal.querySelector('strong');function open(btn){img.src=btn.getAttribute('data-x24-fabric-src');img.alt=btn.getAttribute('data-x24-fabric-title')||'Ảnh chất liệu vải';title.textContent=btn.getAttribute('data-x24-fabric-title')||'Chất liệu vải';modal.classList.add('is-open');document.body.style.overflow='hidden'}function close(){modal.classList.remove('is-open','is-zoomed');img.removeAttribute('src');document.body.style.overflow=''}function zoom(){modal.classList.toggle('is-zoomed')}triggers.forEach(function(btn){btn.addEventListener('click',function(e){e.preventDefault();open(btn)})});modal.querySelector('[data-x24-close]').addEventListener('click',close);modal.querySelector('[data-x24-zoom]').addEventListener('click',zoom);img.addEventListener('click',zoom);modal.addEventListener('click',function(e){if(e.target===modal)close()});document.addEventListener('keydown',function(e){if(e.key==='Escape'&&modal.classList.contains('is-open'))close()})})})();
</script>
    <?php
}, 20);
PHP;

file_put_contents($pluginFile, $plugin);

$fabricButton = static function (string $label, string $key) use ($media): string {
    return '<button type="button" class="x24-fabric-view" data-x24-fabric-title="' . esc_attr($label) . '" data-x24-fabric-src="' . esc_url($media[$key]) . '">Xem ảnh vải</button>';
};

$content = <<<HTML
<!-- wp:html -->
<div class="x24-price-page">
  <section class="x24-price-hero">
    <div>
      <div class="x24-price-kicker">Bảng giá may áo bóng rổ theo yêu cầu</div>
      <h1>Bảng giá may áo bóng rổ</h1>
      <p>Bảng giá tham khảo cho đồng phục bóng rổ áo + quần, đặt từ 5 bộ. Giá đã bao gồm thiết kế, in ấn, vận chuyển và thuế VAT; nếu chỉ lấy áo thì giảm 20.000đ/bộ.</p>
      <div class="x24-price-actions">
        <a class="x24-price-btn x24-primary" href="https://zalo.me/0989353247">Nhận báo giá qua Zalo</a>
        <a class="x24-price-btn x24-secondary" href="#bang-gia">Xem bảng giá</a>
        <a class="x24-price-btn x24-ghost" href="/chat-lieu-va-bang-size-ao-bong-ro/">Xem bảng size</a>
      </div>
    </div>
    <aside class="x24-price-hero-card" aria-label="Tóm tắt giá">
      <span>Giá từ</span>
      <strong>149.000đ/bộ</strong>
      <span>Áp dụng cho vải Thun lạnh, đơn từ 51 - 100 bộ</span>
      <ul>
        <li><span>Tối thiểu</span><b>5 bộ</b></li>
        <li><span>Gồm</span><b>Áo + quần</b></li>
        <li><span>Thiết kế</span><b>Tư vấn miễn phí</b></li>
      </ul>
    </aside>
  </section>

  <section id="bang-gia" class="x24-price-section">
    <div class="x24-price-section-head">
      <h2>Bảng giá theo chất liệu và số lượng</h2>
      <p>Giá dưới đây đã bao gồm thiết kế, in ấn, vận chuyển và thuế VAT. Quần bóng rổ được may bằng vải thể thao chuyên dụng; nếu chỉ lấy áo thì giá giảm 20.000đ/bộ. Logo thêu cộng thêm 20.000đ/logo, logo in PET cộng thêm 15.000đ/logo.</p>
    </div>
    <div class="x24-price-table-wrap" role="region" aria-label="Bảng giá may áo bóng rổ" tabindex="0">
      <table class="x24-price-table">
        <thead>
          <tr>
            <th>Số lượng</th>
            <th><div class="x24-fabric-head"><strong>Thun lạnh</strong><span>Giá tốt, dễ mặc</span>{$fabricButton('Vải Thun lạnh', 'thun_lanh')}</div></th>
            <th><div class="x24-fabric-head"><strong>Mè Thái</strong><span>Thoáng, nhẹ</span>{$fabricButton('Vải Mè Thái', 'me_thai')}</div></th>
            <th><div class="x24-fabric-head"><strong>Mè Texa</strong><span>Đứng form</span>{$fabricButton('Vải Mè Texa', 'me_texa')}</div></th>
            <th><div class="x24-fabric-head"><strong>Mè Lava</strong><span>Lưới thoáng</span>{$fabricButton('Vải Mè Lava', 'me_lava')}</div></th>
          </tr>
        </thead>
        <tbody>
          <tr><th>5 - 9 bộ</th><td><strong>179.000đ</strong><small>/bộ</small></td><td class="recommended"><strong>200.000đ</strong><small>/bộ</small></td><td><strong>235.000đ</strong><small>/bộ</small></td><td><strong>300.000đ</strong><small>/bộ</small></td></tr>
          <tr><th>10 - 25 bộ</th><td><strong>169.000đ</strong><small>/bộ</small></td><td class="recommended"><strong>190.000đ</strong><small>/bộ</small></td><td><strong>225.000đ</strong><small>/bộ</small></td><td><strong>280.000đ</strong><small>/bộ</small></td></tr>
          <tr><th>26 - 50 bộ</th><td><strong>159.000đ</strong><small>/bộ</small></td><td class="recommended"><strong>180.000đ</strong><small>/bộ</small></td><td><strong>215.000đ</strong><small>/bộ</small></td><td><strong>255.000đ</strong><small>/bộ</small></td></tr>
          <tr><th>51 - 100 bộ</th><td><strong>149.000đ</strong><small>/bộ</small></td><td class="recommended"><strong>170.000đ</strong><small>/bộ</small></td><td><strong>205.000đ</strong><small>/bộ</small></td><td><strong>240.000đ</strong><small>/bộ</small></td></tr>
        </tbody>
      </table>
    </div>
    <div class="x24-price-note-grid">
      <div class="x24-price-note"><strong>Miễn phí thiết kế</strong><p>Hỗ trợ lên mockup theo màu đội, logo và phong cách thi đấu.</p></div>
      <div class="x24-price-note"><strong>Miễn phí in ấn</strong><p>In tên số miễn phí theo danh sách đội gửi, áp dụng cho nội dung cá nhân hóa cơ bản.</p></div>
      <div class="x24-price-note"><strong>Miễn phí vận chuyển</strong><p>Giá đã bao gồm phí ship và thuế VAT theo bảng giá hiện tại.</p></div>
      <div class="x24-price-note"><strong>Chỉ lấy áo</strong><p>Quần bóng rổ may bằng vải thể thao chuyên dụng; nếu chỉ lấy áo thì giảm 20.000đ/bộ.</p></div>
    </div>
  </section>

  <section class="x24-price-section">
    <div class="x24-price-section-head">
      <h2>Chọn vải nào cho đội bóng rổ?</h2>
      <p>Nếu chưa chắc chọn chất liệu nào, hãy bắt đầu từ ngân sách và tần suất sử dụng. Bấm vào ảnh để xem rõ bề mặt vải.</p>
    </div>
    <div class="x24-fabric-choice-grid">
      <article class="x24-fabric-choice"><button type="button" data-x24-fabric-title="Vải Thun lạnh" data-x24-fabric-src="{$media['thun_lanh']}"><img src="{$media['thun_lanh']}" alt="Vải thun lạnh may áo bóng rổ" loading="lazy" decoding="async"></button><div class="x24-fabric-choice-body"><h3>Thun lạnh</h3><p>Phù hợp đội cần giá tốt, đặt nhanh, dùng cho giao hữu, lớp hoặc team phong trào.</p><div class="x24-pill-row"><span>Tiết kiệm</span><span>Mát tay</span></div></div></article>
      <article class="x24-fabric-choice"><button type="button" data-x24-fabric-title="Vải Mè Thái" data-x24-fabric-src="{$media['me_thai']}"><img src="{$media['me_thai']}" alt="Vải mè Thái may áo bóng rổ" loading="lazy" decoding="async"></button><div class="x24-fabric-choice-body"><h3>Mè Thái</h3><p>Lựa chọn cân bằng cho đa số đội: thoáng, nhẹ, dễ mặc khi vận động nhiều.</p><div class="x24-pill-row"><span>Đề xuất</span><span>Thoáng khí</span></div></div></article>
      <article class="x24-fabric-choice"><button type="button" data-x24-fabric-title="Vải Mè Texa" data-x24-fabric-src="{$media['me_texa']}"><img src="{$media['me_texa']}" alt="Vải mè Texa may áo bóng rổ" loading="lazy" decoding="async"></button><div class="x24-fabric-choice-body"><h3>Mè Texa</h3><p>Hợp đội muốn áo đứng form hơn, bề mặt dệt nổi rõ và cảm giác chắc vải.</p><div class="x24-pill-row"><span>Đứng form</span><span>Bền</span></div></div></article>
      <article class="x24-fabric-choice"><button type="button" data-x24-fabric-title="Vải Mè Lava" data-x24-fabric-src="{$media['me_lava']}"><img src="{$media['me_lava']}" alt="Vải mè Lava may áo bóng rổ" loading="lazy" decoding="async"></button><div class="x24-fabric-choice-body"><h3>Mè Lava</h3><p>Phù hợp đội ưu tiên thoát nhiệt, bề mặt lưới thể thao và cảm giác mặc thoải mái.</p><div class="x24-pill-row"><span>Lưới thoáng</span><span>Cao cấp</span></div></div></article>
    </div>
  </section>

  <section class="x24-price-section">
    <div class="x24-price-section-head">
      <h2>Quy trình báo giá và đặt may</h2>
      <p>Gửi đủ thông tin ngay từ đầu giúp đội nhận báo giá sát hơn và hạn chế chỉnh sửa nhiều vòng.</p>
    </div>
    <div class="x24-process">
      <article class="x24-process-card"><h3>Gửi yêu cầu</h3><p>Số lượng, chất liệu mong muốn, logo đội, màu chủ đạo, tên số và deadline.</p></article>
      <article class="x24-process-card"><h3>Chốt chất liệu</h3><p>Đối chiếu bảng giá, xem ảnh vải và chọn phương án hợp ngân sách.</p></article>
      <article class="x24-process-card"><h3>Lên thiết kế</h3><p>Thiết kế mockup áo bóng rổ theo form, màu và nhận diện của đội.</p></article>
      <article class="x24-process-card"><h3>Sản xuất</h3><p>Chốt danh sách size, tên số, thanh toán và tiến hành sản xuất theo lịch hẹn.</p></article>
    </div>
  </section>

  <section class="x24-price-section">
    <div class="x24-price-section-head">
      <h2>Câu hỏi thường gặp về giá áo bóng rổ</h2>
      <p>Một vài điểm đội bóng thường hỏi trước khi chốt đơn.</p>
    </div>
    <div class="x24-faq">
      <article class="x24-faq-item"><h3>Đặt 5 bộ có nhận may không?</h3><p>Có. Bảng giá bắt đầu từ 5 bộ, phù hợp nhóm nhỏ, đội 3x3 hoặc team cần may bổ sung.</p></article>
      <article class="x24-faq-item"><h3>Giá đã chắc chắn chưa?</h3><p>Giá chắc chắn đã bao gồm thiết kế, in ấn, vận chuyển và thuế VAT. Nếu chọn logo thêu cộng thêm 20.000đ/logo; logo in PET cộng thêm 15.000đ/logo.</p></article>
      <article class="x24-faq-item"><h3>Nên chọn vải nào nếu chưa biết?</h3><p>Mè Thái là lựa chọn cân bằng nhất để bắt đầu. Nếu cần tối ưu chi phí chọn Thun lạnh; nếu muốn đứng form hơn chọn Mè Texa hoặc Mè Lava.</p></article>
      <article class="x24-faq-item"><h3>Cần gửi gì để báo giá nhanh?</h3><p>Gửi số lượng, mẫu thích, logo, màu áo, danh sách tên số, size và ngày cần nhận hàng qua Zalo 0989.353.247.</p></article>
    </div>
  </section>

  <section class="x24-price-final">
    <div>
      <h2>Cần báo giá đúng mẫu của đội?</h2>
      <p>Gửi logo, số lượng và chất liệu muốn chọn, Mayaobongro.vn sẽ tư vấn phương án phù hợp ngân sách.</p>
    </div>
    <div class="x24-price-actions">
      <a class="x24-price-btn x24-primary" href="https://zalo.me/0989353247">Nhận báo giá qua Zalo</a>
      <a class="x24-price-btn x24-secondary" href="tel:0989353247">Gọi 0989.353.247</a>
    </div>
  </section>
</div>
<!-- /wp:html -->
HTML;

$updated = wp_update_post([
    'ID' => $pageId,
    'post_content' => $content,
    'post_excerpt' => '',
], true);

if (is_wp_error($updated)) {
    throw new RuntimeException($updated->get_error_message());
}

update_post_meta($pageId, '_yoast_wpseo_title', 'Bảng giá may áo bóng rổ theo yêu cầu từ 149k/bộ');
update_post_meta($pageId, '_yoast_wpseo_metadesc', 'Bảng giá may áo bóng rổ từ 5 bộ, gồm thiết kế, in ấn, vận chuyển và VAT. Chỉ lấy áo giảm 20.000đ/bộ. Tư vấn Zalo 0989.353.247.');
update_post_meta($pageId, '_yoast_wpseo_focuskw', 'bảng giá may áo bóng rổ');

clean_post_cache($pageId);
if (function_exists('wp_cache_flush')) {
    wp_cache_flush();
}

echo wp_json_encode([
    'ok' => true,
    'page_id' => $pageId,
    'backup_dir' => $backupDir,
    'plugin_file' => $pluginFile,
    'url' => get_permalink($pageId),
], JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_PRETTY_PRINT) . PHP_EOL;
