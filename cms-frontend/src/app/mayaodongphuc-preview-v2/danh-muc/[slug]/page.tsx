import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { industries, products, productTypes } from '../../../mayaodongphuc-preview/data'
import { Breadcrumbs, ProductCard, v2Base } from '../../components'
import styles from '../../../[tenant]/_mayaodongphuc/mayaodongphuc.module.css'

export default async function V2Category({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const industry = industries.find((item) => item.slug === slug)
  if (!industry) notFound()
  return <>
    <section className={styles.categoryHero}><Breadcrumbs items={[{ label: industry.name }]} /><div><span>CATALOG / {industry.code}</span><h1>{industry.name}</h1><p>{industry.note} Tất cả mẫu là điểm khởi đầu để tinh chỉnh theo nhận diện riêng.</p><aside><b>{String(products.length).padStart(2, '0')}</b><span>mẫu khởi đầu</span></aside></div></section>
    <section className={styles.catalogPage}><nav className={styles.filterRow} aria-label="Lọc sản phẩm"><Link className={styles.activeFilter} href={`${v2Base}/danh-muc/${slug}`}>Tất cả</Link>{productTypes.slice(0, 5).map((type) => <Link href={`${v2Base}/danh-muc/${slug}?loai=${encodeURIComponent(type)}`} key={type}>{type}</Link>)}<button type="button"><SlidersHorizontal /> Bộ lọc</button></nav><div className={styles.catalogSummary}><p>Đang hiển thị <b>{products.length} mẫu</b> có thể cấu hình</p><span>Sắp xếp: Đề xuất</span></div><div className={styles.categoryGrid}>{products.map((product, index) => <ProductCard eager={index < 4} key={product.slug} product={product} />)}</div><div className={styles.catalogCta}><div><span>CHƯA THẤY MẪU PHÙ HỢP?</span><h2>Bắt đầu từ yêu cầu thật của đội ngũ.</h2></div><Link href={`${v2Base}/#bao-gia`}>Tạo brief riêng <ArrowRight /></Link></div></section>
  </>
}
