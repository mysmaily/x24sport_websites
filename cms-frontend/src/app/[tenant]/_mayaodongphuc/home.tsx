import { ArrowRight, Check, ClipboardList, Layers3, Ruler, ShieldCheck, Sparkles } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import { hasProductInterestForm } from '../../../lib/content'
import { JsonLd } from '../../_components/json-ld'
import styles from './mayaodongphuc.module.css'
import { UniformCallbackForm } from './callback-form'
import { TrustPill, UniformProductCard, uniformPublicCopy } from './components'
import { getUniformCategories, getUniformProducts } from './lib'
import { MayAoDongPhucShell } from './shell'

const process = [
  { icon: ClipboardList, step: '01', title: 'Nhận brief', text: 'Mục đích sử dụng, số lượng, logo và mốc cần nhận hàng.' },
  { icon: Sparkles, step: '02', title: 'Lập spec & mẫu', text: 'Thống nhất phom, vật liệu, màu và kỹ thuật hoàn thiện.' },
  { icon: Ruler, step: '03', title: 'Duyệt mẫu & size', text: 'Khóa phiên bản thiết kế và ma trận size trước khi vào chuyền.' },
  { icon: ShieldCheck, step: '04', title: 'QC & bàn giao', text: 'Đối chiếu lô hàng với spec đã duyệt trước khi giao.' },
]

export async function MayAoDongPhucHome() {
  const [categories, consultationEnabled] = await Promise.all([
    getUniformCategories(),
    hasProductInterestForm(),
  ])
  const categoryShelves = (await Promise.all(categories.map(async (category) => ({
    category,
    result: await getUniformProducts({ categorySlug: category.slug, limit: 8 }),
  })))).filter((shelf) => shelf.result.docs.length > 0)
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
      <div className={styles.heroMain}><TrustPill /><h1>Xưởng may,<br /><span>làm đúng từ brief.</span></h1><p>Yêu cầu được chuyển thành spec, mẫu duyệt và lệnh may rõ ràng để từng lô hàng bám đúng phiên bản đã thống nhất.</p><Link className={styles.primaryCta} href={primaryHref}>{consultationEnabled ? 'Gửi brief cho xưởng' : 'Xem mẫu tham khảo'} <ArrowRight aria-hidden="true" /></Link><div className={styles.heroProof}><span><b>{String(categories.length).padStart(2, '0')}</b> bối cảnh may</span><span><b>04</b> điểm kiểm soát</span><span><b>01</b> spec xuyên suốt</span></div></div>
      <div className={styles.heroImage}><Image alt="Đội ngũ phát triển mẫu đồng phục trong không gian xưởng" fill fetchPriority="high" loading="eager" sizes="(max-width: 850px) 100vw, 45vw" src="/images/mayaodongphuc/hero-atelier.webp" /><div><span>XƯỞNG MAY / 2026</span><p>Từ bản duyệt đến lô hàng, cùng một phiên bản.</p></div></div>
      <aside className={styles.finder}><span>01 / NHẬN YÊU CẦU</span><h2>Đơn hàng của bạn thuộc nhóm nào?</h2><div className={styles.finderLinks}>{categories.slice(0, 4).map((item) => <Link href={`/danh-muc/${item.slug}/`} key={item.slug}><b>{item.name}</b><small>{uniformPublicCopy(item.description)}</small><ArrowRight aria-hidden="true" /></Link>)}</div><Link href="/san-pham/">Xem mẫu tham khảo <ArrowRight aria-hidden="true" /></Link></aside>
      <div className={styles.materialBento}><span>02 / SPEC SẢN XUẤT</span><Layers3 aria-hidden="true" /><h2>Chốt đúng trước khi may</h2><p>Vật liệu, form, màu, logo và size được ghi theo một phiên bản để đối chiếu.</p><Link href="#vat-lieu">Xem các điểm cần chốt <ArrowRight aria-hidden="true" /></Link></div>
    </section>

    <section className={styles.catalogSection}><div className={styles.sectionHead}><div><span>03 / MẪU THAM KHẢO</span><h2>Chọn mẫu gần đúng,<br />phát triển thành spec.</h2></div><p>Mỗi mẫu là điểm bắt đầu để thống nhất cấu tạo, vật liệu, màu, logo và size trước khi đưa vào sản xuất.</p></div>{categoryShelves.length ? <div className={styles.homeShelves}>{categoryShelves.map(({ category, result }) => {
      const description = uniformPublicCopy(category.description)
      return <section className={styles.homeShelf} key={category.slug} aria-labelledby={`home-shelf-${category.slug}`}><div className={styles.homeShelfHead}><div><span>{String(category.order || 1).padStart(2, '0')} / DANH MỤC</span><h3 id={`home-shelf-${category.slug}`}>{category.name}</h3>{description ? <p>{description}</p> : null}</div></div><div className={styles.productGrid}>{result.docs.map((product) => <UniformProductCard key={product.id} product={product} />)}</div><Link className={styles.shelfCta} href={`/danh-muc/${category.slug}/`}>Xem thêm mẫu <ArrowRight aria-hidden="true" /></Link></section>
    })}</div> : <p>Catalog đang được cập nhật.</p>}</section>

    <section className={styles.process} id="quy-trinh"><div className={styles.processTitle}><span>04 / QUY TRÌNH XƯỞNG</span><h2>Một lệnh may.<br />Bốn điểm kiểm soát.</h2><p>Người đặt hàng luôn biết xưởng đang cần xác nhận điều gì trước khi chuyển bước.</p></div><ol>{process.map(({ icon: Icon, step, title, text }) => <li key={step}><span>{step}</span><Icon aria-hidden="true" /><div><h3>{title}</h3><p>{text}</p></div></li>)}</ol></section>

    <section className={styles.standardSection} id="vat-lieu"><div className={styles.standardLead}><span>05 / SPEC CẦN CHỐT</span><h2>Đẹp lúc duyệt.<br />Đúng khi nhận hàng.</h2><p>Xưởng đối chiếu vật liệu, form, logo và size theo spec đã xác nhận — không chỉ theo tên mẫu.</p></div><div className={styles.standardGrid}><article><span>01</span><h3>Vật liệu</h3><p>Cần xác nhận</p><b>Bề mặt & màu</b><p>Đối chiếu</p><b>Mẫu đã duyệt</b><small>Ghi rõ loại vải, màu và chi tiết liên quan trong phiên bản spec.</small></article><article><span>02</span><h3>Logo & hoàn thiện</h3><p>Cần xác nhận</p><b>Vị trí & kỹ thuật</b><p>Đối chiếu</p><b>File đã duyệt</b><small>Chốt kích thước, vị trí và kỹ thuật in hoặc thêu trước khi vào may.</small></article><article><span>03</span><h3>Form & size</h3><p>Cần xác nhận</p><b>Ma trận số lượng</b><p>Đối chiếu</p><b>Bảng size đã chốt</b><small>Tổng số lượng theo size được kiểm lại trước khi phát hành lệnh may.</small></article></div></section>

    <section className={styles.promise} id="tieu-chuan"><span><Check aria-hidden="true" /> Thông tin rõ trước khi báo giá</span><span><Check aria-hidden="true" /> Duyệt thiết kế trước sản xuất</span><span><Check aria-hidden="true" /> Theo dõi theo một quy chuẩn chung</span></section>

    {consultationEnabled ? <section className={styles.quoteSection} id="bao-gia"><div><span>06 / GỬI BRIEF CHO XƯỞNG</span><h2>Cho chúng tôi yêu cầu.<br />Nhận lại bước cần chốt.</h2><p>Không cần biết sẵn tên vải hay kỹ thuật in. Hãy gửi bối cảnh sử dụng, số lượng, logo hoặc mẫu tham khảo để xưởng bắt đầu lập phương án.</p><ul><li>Bối cảnh sử dụng & vai trò mặc</li><li>Số lượng & thời điểm cần nhận</li><li>Logo hoặc mẫu đang tham khảo</li></ul></div><UniformCallbackForm /></section> : null}
  </MayAoDongPhucShell>
}
