import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { getCategory, getProductsPage } from '../../../lib/content'
import { Breadcrumbs, ProductGrid, QuoteBand, SectionHeading } from '../../pndsport-preview/components'
import styles from '../../pndsport-preview/pnd.module.css'
import { getPndLanding, toPndProduct } from './lib'
import { PndShell } from './shell'

export async function getPndLandingMetadata(slug: string): Promise<Metadata> {
  const landing = getPndLanding(slug)
  if (!landing) return { title: 'Không tìm thấy trang' }
  return {
    title: landing.title,
    description: landing.lead,
    alternates: { canonical: `/${landing.slug}/` },
    openGraph: { title: landing.title, description: landing.lead, url: `/${landing.slug}/` },
  }
}

export async function PndCategoryLandingPage({ slug }: { slug: string }) {
  const landing = getPndLanding(slug)
  if (!landing) notFound()
  const [category, result] = await Promise.all([
    getCategory(landing.categorySlug),
    getProductsPage({ categorySlug: landing.categorySlug, limit: 4, sort: '-viewCount' }),
  ])
  if (!category) notFound()
  const products = result.products.map(toPndProduct)

  return <PndShell>
    <Breadcrumbs base="" items={[{ label: category.name, href: `/danh-muc/${category.slug}/` }, { label: landing.title }]} />
    <section className={styles.seoHero}><div><span className={styles.eyebrow}>Tư vấn thiết kế theo bộ môn</span><h1>{landing.title}</h1><p>{landing.lead}</p><div className={styles.heroActions}><Link href={`/danh-muc/${category.slug}/`}>Xem mẫu {category.name.toLocaleLowerCase('vi')} <ArrowRight size={17} /></Link></div></div><aside className={styles.seoHeroCard}><h2>Chuẩn bị thông tin</h2><p>Môn và nhóm sử dụng, số lượng dự kiến, màu đội, logo, tên số và mốc thời gian cần áo.</p><a href="https://zalo.me/0989353247" target="_blank" rel="noreferrer">Gửi thông tin qua Zalo</a></aside></section>
    <div className={styles.seoBody}>{products.length ? <section><SectionHeading eyebrow="Mẫu phù hợp" title="Điểm bắt đầu cho thiết kế của đội" note={`Các mẫu ${category.name.toLocaleLowerCase('vi')} đang có giá thấp nhất công khai để ${landing.audience} tham khảo.`} /><ProductGrid items={products} base="" /></section> : null}<section className={styles.seoColumns}><article className={styles.seoPanel}><h2>Chọn mẫu theo cách đội sẽ sử dụng</h2><p>Hãy cho bộ phận tư vấn biết đội dùng áo để tập luyện, thi đấu hay tham gia sự kiện. Bối cảnh sử dụng giúp việc chọn mẫu và sắp xếp nhận diện tập trung hơn.</p><h3>Màu sắc và nhận diện</h3><p>Chuẩn bị một màu chính, một màu phụ và màu dành cho tên số. Logo nên được gửi ở định dạng rõ nhất hiện có để kiểm tra trước khi hoàn thiện phương án.</p><h3>Giá hiển thị và báo giá</h3><p>Mỗi sản phẩm có giá thấp nhất để đội sàng lọc ban đầu. Báo giá cuối cùng được xác nhận sau khi có số lượng và yêu cầu tùy chỉnh.</p></article><aside className={`${styles.seoPanel} ${styles.faq}`}><h2>Câu hỏi thường gặp</h2><details open><summary>Có thể đổi màu từ mẫu có sẵn không?</summary><p>Hãy gửi màu đội và logo để bộ phận tư vấn kiểm tra phạm vi điều chỉnh trên mẫu đã chọn.</p></details><details><summary>Cần chuẩn bị gì để nhận báo giá?</summary><p>Số lượng, mẫu quan tâm, nội dung tùy chỉnh và thời gian dự kiến là những thông tin nên có.</p></details><details><summary>Giá trên sản phẩm có phải giá cuối cùng?</summary><p>Không. Đây là giá thấp nhất; báo giá cuối cùng phụ thuộc cấu hình thực tế được xác nhận.</p></details></aside></section><nav className={styles.miniLinks} aria-label="Nội dung liên quan"><Link href={`/danh-muc/${category.slug}/`}><span>Danh mục</span>Kho mẫu {category.name}</Link><Link href="/blog/"><span>Hướng dẫn</span>Góc tư vấn đặt áo</Link><Link href="/san-pham/"><span>Kho mẫu</span>Tất cả sản phẩm PND</Link></nav><QuoteBand compact /></div>
  </PndShell>
}
