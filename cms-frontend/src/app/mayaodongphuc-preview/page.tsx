import { ArrowDownRight, ArrowRight, Check, MoveRight, Scissors, Shirt, SwatchBook } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { AtelierMark, ProductCard, SectionTitle } from './components'
import { industries, previewBase, products } from './data'
import { QuoteForm } from './quote-form'
import styles from './studio.module.css'

export default function MayAoDongPhucPreviewHome() {
  return <>
    <section className={styles.hero}>
      <div className={styles.heroCopy}>
        <AtelierMark />
        <h1>May một<br /><em>hình ảnh chung.</em></h1>
        <p>Đồng phục được bắt đầu từ công việc thực tế, rồi mới đến kiểu áo, chất liệu và màu nhận diện.</p>
        <div className={styles.heroActions}><Link href={`${previewBase}/danh-muc/dong-phuc-doanh-nghiep`}>Khám phá mẫu <ArrowRight /></Link><Link href="#bao-gia">Bắt đầu yêu cầu <ArrowDownRight /></Link></div>
        <div className={styles.heroFoot}><span>01 — 06</span><p>Giải pháp cho doanh nghiệp, F&B, trường học, bảo hộ, y tế và đội nhóm.</p></div>
      </div>
      <div className={styles.heroVisual}>
        <Image alt="Nhóm nhân sự mặc đồng phục doanh nghiệp, F&B, bảo hộ và công sở trong xưởng thiết kế" fetchPriority="high" fill loading="eager" sizes="(max-width: 820px) 100vw, 58vw" src="/images/mayaodongphuc-preview/hero-atelier.webp" />
        <div className={styles.heroCaption}><span>ATELIER / 01</span><p>Thiết kế để mỗi vai trò đều thuộc về cùng một thương hiệu.</p></div>
        <span className={styles.measureY}>0&nbsp;&nbsp;10&nbsp;&nbsp;20&nbsp;&nbsp;30&nbsp;&nbsp;40&nbsp;&nbsp;50&nbsp;&nbsp;60</span>
      </div>
    </section>

    <section className={styles.industrySection}>
      <SectionTitle code="01 / CHỌN ĐÚNG BỐI CẢNH" title="Bạn đang may cho ai?" note="Một hệ đồng phục tốt bắt đầu từ môi trường làm việc, nhịp vận động và ấn tượng cần tạo ra." />
      <div className={styles.industryGrid}>{industries.map((item, index) => <Link className={styles.industryCard} href={`${previewBase}/danh-muc/${item.slug}`} key={item.slug}>
        <span>{item.code}</span><div><h3>{item.name}</h3><p>{item.note}</p></div><ArrowDownRight />
        <i style={{ '--index': index } as React.CSSProperties} />
      </Link>)}</div>
    </section>

    <section className={styles.productsSection}>
      <SectionTitle code="02 / MẪU KHỞI ĐẦU" title="Một form tốt. Nhiều cách thuộc về." note="Các mẫu dưới đây là dữ liệu đại diện cho trải nghiệm duyệt catalog." href={`${previewBase}/danh-muc/dong-phuc-doanh-nghiep`} />
      <div className={styles.productGrid}>{products.slice(0, 4).map((product) => <ProductCard key={product.slug} product={product} />)}</div>
    </section>

    <section className={styles.processSection} id="quy-trinh">
      <div className={styles.processIntro}><span>03 / QUY TRÌNH ĐẶT MAY</span><h2>Từ một ý tưởng rời rạc<br />đến một đội ngũ đồng nhất.</h2><p>Mỗi bước chỉ yêu cầu đúng thông tin cần thiết, giúp người đặt hàng biết mình đang quyết định điều gì.</p><Link href="#bao-gia">Bắt đầu với brief ngắn <MoveRight /></Link></div>
      <ol className={styles.processList}>
        <li><span>01</span><div><Shirt /><h3>Hiểu nhu cầu</h3><p>Ngành nghề, vị trí sử dụng, số lượng và ngân sách dự kiến.</p></div></li>
        <li><span>02</span><div><SwatchBook /><h3>Chọn giải pháp</h3><p>Form áo, chất liệu, bảng màu và kỹ thuật thể hiện nhận diện.</p></div></li>
        <li><span>03</span><div><Scissors /><h3>Chốt trước khi may</h3><p>Duyệt thiết kế, danh sách size và các chi tiết cần xác nhận.</p></div></li>
      </ol>
    </section>

    <section className={styles.materialSection} id="chat-lieu">
      <div className={styles.materialHeading}><span>04 / MATERIAL LIBRARY</span><h2>Chất liệu không phải phần ghi chú.</h2><p>Nó quyết định cảm giác mặc, cách giữ form và hình ảnh đội ngũ sau nhiều giờ làm việc.</p></div>
      <div className={styles.fabricCards}>
        <article className={styles.fabricNavy}><span>01</span><div><h3>Polo dệt mắt nhỏ</h3><p>Đứng form vừa phải · Bề mặt gọn · Phù hợp nhận diện doanh nghiệp</p></div></article>
        <article className={styles.fabricRust}><span>02</span><div><h3>Canvas</h3><p>Bền mặt · Có cấu trúc · Phù hợp tạp dề và chi tiết phối</p></div></article>
        <article className={styles.fabricOlive}><span>03</span><div><h3>Ripstop</h3><p>Hạn chế rách lan · Nhẹ · Phù hợp môi trường vận hành</p></div></article>
      </div>
      <Link className={styles.textLink} href="#bao-gia">Nhận tư vấn chất liệu <ArrowRight /></Link>
    </section>

    <section className={styles.projectSection} id="du-an">
      <div className={styles.projectImage}><Image alt="Chi tiết người thợ chuẩn bị rập giấy và vật liệu trong xưởng may" fill sizes="(max-width: 820px) 100vw, 48vw" src="/images/mayaodongphuc-preview/hero-atelier.webp" /></div>
      <div className={styles.projectContent}><span>05 / CÁCH CHÚNG TÔI NHÌN MỘT DỰ ÁN</span><blockquote>“Không bắt đầu bằng việc chọn một chiếc áo. Bắt đầu bằng việc hiểu người mặc cần làm gì trong chiếc áo đó.”</blockquote><ul><li><Check /> Nhìn toàn bộ đội ngũ, không chỉ một vị trí</li><li><Check /> Cân bằng nhận diện và sự thoải mái</li><li><Check /> Chốt thông tin rõ ràng trước sản xuất</li></ul><p>Dự án thực tế sẽ được bổ sung khi có hình ảnh và thông tin được phép công bố.</p></div>
    </section>

    <section className={styles.quoteSection} id="bao-gia">
      <div className={styles.quoteCopy}><span>06 / BẮT ĐẦU TỪ ĐÂY</span><h2>Chưa cần biết tên vải.<br />Chỉ cần kể về đội ngũ.</h2><p>Gửi nhu cầu cơ bản. Hệ thống sẽ thu thập các thông tin cần thiết để chuẩn bị một cuộc tư vấn hiệu quả.</p><div className={styles.quoteChecklist}><span>01 Ngành nghề</span><span>02 Số lượng</span><span>03 Thời gian dự kiến</span><span>04 Logo / mẫu tham khảo</span></div></div>
      <QuoteForm />
    </section>
  </>
}
