import { ArrowRight, Check, ClipboardList, Layers3, Ruler, ShieldCheck, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { industries, products } from '../mayaodongphuc-preview/data'
import { ProductCard, TrustPill, v2Base } from './components'
import { V2QuoteForm } from './quote-form'
import styles from './v2.module.css'

export default function V2Home() {
  return <>
    <section className={styles.hero}>
      <div className={styles.heroMain}><TrustPill /><h1>Đồng phục,<br /><span>được cấu hình đúng.</span></h1><p>Chọn theo môi trường, vai trò và tần suất sử dụng. Chúng tôi biến những yêu cầu rời rạc thành một bộ quy chuẩn dễ duyệt.</p><Link className={styles.primaryCta} href="#bao-gia">Tạo brief trong 2 phút <ArrowRight /></Link><div className={styles.heroProof}><span><b>06</b> nhóm ngành</span><span><b>04</b> bước rõ ràng</span><span><b>01</b> đầu mối tư vấn</span></div></div>
      <div className={styles.heroImage}><Image alt="Nhóm nhân sự trong nhiều mẫu đồng phục tại studio" fill fetchPriority="high" loading="eager" sizes="(max-width: 850px) 100vw, 45vw" src="/images/mayaodongphuc-preview/hero-atelier.webp" /><div><span>HỆ ĐỒNG PHỤC / 2026</span><p>Mỗi vai trò một yêu cầu. Cùng chung một hình ảnh.</p></div></div>
      <aside className={styles.finder}><span>01 / BẮT ĐẦU NHANH</span><h2>Bạn đang cần may cho?</h2><div className={styles.finderLinks}>{industries.slice(0, 4).map((item) => <Link href={`${v2Base}/danh-muc/${item.slug}`} key={item.slug}><b>{item.name}</b><small>{item.note}</small><ArrowRight /></Link>)}</div><Link href={`${v2Base}/danh-muc/dong-phuc-doanh-nghiep`}>Xem đủ 6 nhóm ngành <ArrowRight /></Link></aside>
      <div className={styles.materialBento}><span>02 / VẬT LIỆU</span><Layers3 /><h2>Chọn theo nhịp làm việc</h2><p>Độ thoáng, giữ form và độ bền được cân bằng cho từng bối cảnh.</p><Link href="#vat-lieu">Mở thư viện vật liệu <ArrowRight /></Link></div>
    </section>

    <section className={styles.catalogSection}><div className={styles.sectionHead}><div><span>03 / CATALOG KHỞI ĐẦU</span><h2>Mẫu có cấu trúc,<br />không có giới hạn.</h2></div><p>Mỗi mẫu là một điểm xuất phát để điều chỉnh màu, chất liệu, kỹ thuật logo và hệ size.</p><Link href={`${v2Base}/danh-muc/dong-phuc-doanh-nghiep`}>Xem catalog <ArrowRight /></Link></div><div className={styles.productGrid}>{products.slice(0, 4).map((product, index) => <ProductCard eager={index < 2} key={product.slug} product={product} />)}</div></section>

    <section className={styles.process} id="quy-trinh"><div className={styles.processTitle}><span>04 / WORKFLOW</span><h2>Một đường chạy.<br />Bốn điểm duyệt.</h2><p>Người đặt hàng luôn biết đang ở đâu và cần xác nhận điều gì tiếp theo.</p></div><ol><li><span>01</span><ClipboardList /><div><h3>Gửi brief</h3><p>Ngành nghề, số lượng, ngân sách và mốc cần hàng.</p></div></li><li><span>02</span><Sparkles /><div><h3>Đề xuất cấu hình</h3><p>Form, vật liệu, bảng màu và kỹ thuật logo phù hợp.</p></div></li><li><span>03</span><Ruler /><div><h3>Duyệt mẫu & size</h3><p>Chốt thiết kế trực quan và danh sách size trước may.</p></div></li><li><span>04</span><ShieldCheck /><div><h3>Kiểm tra & bàn giao</h3><p>Đối chiếu quy chuẩn đã duyệt trước khi giao.</p></div></li></ol></section>

    <section className={styles.standardSection} id="vat-lieu"><div className={styles.standardLead}><span>05 / MATERIAL STANDARD</span><h2>Đẹp lúc duyệt.<br />Ổn định khi mặc.</h2><p>Chất liệu được đánh giá theo đúng bối cảnh sử dụng, không chỉ bằng một tên gọi.</p></div><div className={styles.standardGrid}><article><span>01</span><h3>Polo mắt nhỏ</h3><p>Giữ form</p><b>8.5 / 10</b><p>Thoáng khí</p><b>8 / 10</b><small>Phù hợp doanh nghiệp · bán hàng</small></article><article><span>02</span><h3>Canvas</h3><p>Độ bền bề mặt</p><b>9 / 10</b><p>Tạo cấu trúc</p><b>9 / 10</b><small>Phù hợp F&B · tạp dề · chi tiết phối</small></article><article><span>03</span><h3>Ripstop</h3><p>Chống rách lan</p><b>9 / 10</b><p>Vận động</p><b>8 / 10</b><small>Phù hợp vận hành · bảo hộ nhẹ</small></article></div></section>

    <section className={styles.promise} id="tieu-chuan"><span><Check /> Thông tin rõ trước khi báo giá</span><span><Check /> Duyệt thiết kế trước sản xuất</span><span><Check /> Theo dõi theo một quy chuẩn chung</span></section>

    <section className={styles.quoteSection} id="bao-gia"><div><span>06 / BUILD YOUR UNIFORM</span><h2>Cho chúng tôi bối cảnh.<br />Nhận lại một cấu hình.</h2><p>Không cần biết sẵn tên vải hay kỹ thuật in. Chỉ cần mô tả đội ngũ, số lượng và điều bạn muốn họ đại diện.</p><ul><li>Ngành nghề & vai trò sử dụng</li><li>Số lượng & thời gian dự kiến</li><li>Logo hoặc mẫu đang tham khảo</li></ul></div><V2QuoteForm /></section>
  </>
}
