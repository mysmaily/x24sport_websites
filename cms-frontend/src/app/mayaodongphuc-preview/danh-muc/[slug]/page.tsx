import { ChevronDown, SlidersHorizontal } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { Breadcrumbs, ProductCard } from '../../components'
import { industries, previewBase, products, productTypes } from '../../data'
import styles from '../../studio.module.css'

export const metadata: Metadata = { title: { absolute: 'Đồng phục doanh nghiệp | May Áo Đồng Phục' } }

export default async function PreviewCategoryPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const industry = industries.find((item) => item.slug === slug) || industries[0]

  return <div className={styles.catalogPage}>
    <Breadcrumbs items={[{ label: 'Mẫu đồng phục' }, { label: industry.name }]} />
    <header className={styles.catalogHeader}><div><span>CATALOG / {industry.code}</span><h1>Đồng phục {industry.name.toLowerCase()}</h1></div><p>{industry.note} Chọn theo kiểu áo hoặc mở bộ lọc để thu hẹp theo nhu cầu sử dụng.</p></header>
    <nav className={styles.primaryFilters} aria-label="Lọc theo kiểu sản phẩm">
      <Link className={styles.filterActive} href={`${previewBase}/danh-muc/${industry.slug}`}>Tất cả</Link>
      {productTypes.map((item) => <Link href={`${previewBase}/danh-muc/${industry.slug}?kieu=${encodeURIComponent(item)}`} key={item}>{item}</Link>)}
    </nav>
    <div className={styles.catalogTools}><p><strong>{products.length}</strong> mẫu đại diện</p><details className={styles.secondaryFilter}><summary><SlidersHorizontal /> Bộ lọc <ChevronDown /></summary><div><fieldset><legend>Môi trường sử dụng</legend>{industries.slice(0, 4).map((item) => <label key={item.slug}><input name="industry" type="checkbox" /> {item.name}</label>)}</fieldset><fieldset><legend>Tông màu</legend><label><input name="color" type="checkbox" /> Xanh đậm</label><label><input name="color" type="checkbox" /> Trung tính</label><label><input name="color" type="checkbox" /> Màu nhận diện</label></fieldset><button type="button">Áp dụng bộ lọc</button></div></details><label className={styles.sortLabel}>Sắp xếp <select defaultValue="featured"><option value="featured">Mẫu nổi bật</option><option value="new">Mới nhất</option></select></label></div>
    <div className={styles.catalogGrid}>{products.map((product, index) => <ProductCard eager={index < 3} key={product.slug} product={product} />)}</div>
    <aside className={styles.catalogNote}><span>CHƯA THẤY MẪU PHÙ HỢP?</span><h2>Một brief rõ còn hữu ích hơn việc xem thêm 100 mẫu.</h2><p>Gửi môi trường sử dụng, số lượng và màu nhận diện để bắt đầu từ nhu cầu thật.</p><Link href={`${previewBase}/#bao-gia`}>Tạo brief đặt may</Link></aside>
  </div>
}
