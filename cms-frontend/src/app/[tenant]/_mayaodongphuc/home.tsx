import { ArrowRight, Check, ClipboardList, Layers3, Ruler, ShieldCheck, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { hasProductInterestForm } from '../../../lib/content'
import { JsonLd } from '../../_components/json-ld'
import styles from './mayaodongphuc.module.css'
import { UniformCallbackForm } from './callback-form'
import { TrustPill, UniformProductCard } from './components'
import { getUniformCategories, getUniformProducts } from './lib'
import { MayAoDongPhucShell } from './shell'

const process = [
  { icon: ClipboardList, step: '01', title: 'Gửi brief', text: 'Bối cảnh, số lượng và mốc thời gian dự kiến.' },
  { icon: Sparkles, step: '02', title: 'Đề xuất phương án', text: 'Phom, vật liệu, bảng màu và kỹ thuật logo phù hợp.' },
  { icon: Ruler, step: '03', title: 'Duyệt mẫu & size', text: 'Chốt thiết kế trực quan và danh sách size trước may.' },
  { icon: ShieldCheck, step: '04', title: 'Kiểm tra & bàn giao', text: 'Đối chiếu quy chuẩn đã duyệt trước khi giao.' },
]

export async function MayAoDongPhucHome() {
  const [categories, result, consultationEnabled] = await Promise.all([
    getUniformCategories(),
    getUniformProducts({ limit: 4 }),
    hasProductInterestForm(),
  ])
  const primaryHref = consultationEnabled ? '#bao-gia' : '/san-pham/'
  const structuredData = {
    '@context': 'https://schema.org',
    '@graph': [
      { '@type': 'Organization', '@id': 'https://mayaodongphuc.com.vn/#organization', name: 'May Áo Đồng Phục', url: 'https://mayaodongphuc.com.vn/' },
      { '@type': 'WebSite', '@id': 'https://mayaodongphuc.com.vn/#website', name: 'May Áo Đồng Phục', url: 'https://mayaodongphuc.com.vn/', publisher: { '@id': 'https://mayaodongphuc.com.vn/#organization' }, inLanguage: 'vi-VN' },
    ],
  }

  return <MayAoDongPhucShell>
    <JsonLd data={structuredData} />
    <section className={styles.hero}>
      <div className={styles.heroMain}><TrustPill /><h1>Đồng phục,<br /><span>được thiết kế đúng.</span></h1><p>Chọn theo môi trường, vai trò và tần suất sử dụng. Những yêu cầu rời rạc được sắp xếp thành một bộ quy chuẩn dễ duyệt.</p><Link className={styles.primaryCta} href={primaryHref}>{consultationEnabled ? 'Tạo brief tư vấn' : 'Khám phá catalog'} <ArrowRight /></Link><div className={styles.heroProof}><span><b>{String(categories.length).padStart(2, '0')}</b> nhóm nhu cầu</span><span><b>04</b> điểm duyệt</span><span><b>01</b> quy chuẩn chung</span></div></div>
      <div className={styles.heroImage}><Image alt="Đội ngũ trong nhiều mẫu đồng phục tại không gian thiết kế" fill fetchPriority="high" loading="eager" sizes="(max-width: 850px) 100vw, 45vw" src="/images/mayaodongphuc/hero-atelier.webp" /><div><span>HỆ ĐỒNG PHỤC / 2026</span><p>Mỗi vai trò một yêu cầu. Cùng chung một hình ảnh.</p></div></div>
      <aside className={styles.finder}><span>01 / BẮT ĐẦU NHANH</span><h2>Bạn đang cần may cho?</h2><div className={styles.finderLinks}>{categories.slice(0, 4).map((item) => <Link href={`/danh-muc/${item.slug}/`} key={item.slug}><b>{item.name}</b><small>{item.description}</small><ArrowRight /></Link>)}</div><Link href="/san-pham/">Xem toàn bộ catalog <ArrowRight /></Link></aside>
      <div className={styles.materialBento}><span>02 / VẬT LIỆU</span><Layers3 /><h2>Chọn theo nhịp làm việc</h2><p>Độ thoáng, giữ form và độ bền được cân bằng cho từng bối cảnh.</p><Link href="#vat-lieu">Mở thư viện vật liệu <ArrowRight /></Link></div>
    </section>

    <section className={styles.catalogSection}><div className={styles.sectionHead}><div><span>03 / CATALOG KHỞI ĐẦU</span><h2>Mẫu dễ chọn,<br />dễ chỉnh theo đội nhóm.</h2></div><p>Mỗi mẫu là một điểm xuất phát để điều chỉnh màu, vật liệu, kỹ thuật logo và hệ size.</p><Link href="/san-pham/">Xem catalog <ArrowRight /></Link></div>{result.docs.length ? <div className={styles.productGrid}>{result.docs.map((product, index) => <UniformProductCard eager={index < 2} key={product.id} product={product} />)}</div> : <p>Catalog đang được cập nhật.</p>}</section>

    <section className={styles.process} id="quy-trinh"><div className={styles.processTitle}><span>04 / WORKFLOW</span><h2>Một đường chạy.<br />Bốn điểm duyệt.</h2><p>Người đặt hàng luôn biết đang ở đâu và cần xác nhận điều gì tiếp theo.</p></div><ol>{process.map(({ icon: Icon, step, title, text }) => <li key={step}><span>{step}</span><Icon /><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>

    <section className={styles.standardSection} id="vat-lieu"><div className={styles.standardLead}><span>05 / MATERIAL STANDARD</span><h2>Đẹp lúc duyệt.<br />Ổn định khi mặc.</h2><p>Vật liệu được đánh giá theo đúng bối cảnh sử dụng, không chỉ bằng một tên gọi.</p></div><div className={styles.standardGrid}><article><span>01</span><h3>Polo mắt nhỏ</h3><p>Đặc tính chính</p><b>Giữ form</b><p>Bối cảnh</p><b>Doanh nghiệp</b><small>Phù hợp đội ngũ văn phòng, bán hàng và sự kiện nội bộ.</small></article><article><span>02</span><h3>Canvas</h3><p>Đặc tính chính</p><b>Bền mặt</b><p>Bối cảnh</p><b>F&amp;B</b><small>Phù hợp tạp dề và chi tiết phối cần tạo cấu trúc.</small></article><article><span>03</span><h3>Ripstop</h3><p>Đặc tính chính</p><b>Thực dụng</b><p>Bối cảnh</p><b>Vận hành</b><small>Phù hợp môi trường thường xuyên di chuyển và làm việc.</small></article></div></section>

    <section className={styles.promise} id="tieu-chuan"><span><Check /> Thông tin rõ trước khi báo giá</span><span><Check /> Duyệt thiết kế trước sản xuất</span><span><Check /> Theo dõi theo một quy chuẩn chung</span></section>

    {consultationEnabled ? <section className={styles.quoteSection} id="bao-gia"><div><span>06 / NHẬN TƯ VẤN</span><h2>Cho chúng tôi bối cảnh.<br />Nhận lại một phương án.</h2><p>Không cần biết sẵn tên vải hay kỹ thuật in. Hãy bắt đầu từ đội ngũ, số lượng và điều tổ chức muốn đại diện.</p><ul><li>Ngành nghề & vai trò sử dụng</li><li>Số lượng & thời gian dự kiến</li><li>Logo hoặc mẫu đang tham khảo</li></ul></div><UniformCallbackForm /></section> : null}
  </MayAoDongPhucShell>
}
