import { ArrowRight, SlidersHorizontal } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { industries, products, productTypes } from '../../../mayaodongphuc-preview/data'
import { Breadcrumbs, ProductCard, v3Base } from '../../components'
import styles from '../../v3.module.css'

export default async function V3Category({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const industry = industries.find((item) => item.slug === slug)
  if (!industry) notFound()
  return <>
    <section className={styles.categoryHero}><Breadcrumbs items={[{ label: industry.name }]} /><span>COLLECTION / {industry.code}</span><div><h1>{industry.name}</h1><p>{industry.note}</p><aside><b>{String(products.length).padStart(2, '0')}</b><small>phom dáng khởi đầu</small></aside></div></section>
    <section className={styles.categoryCatalog}><nav className={styles.filters} aria-label="Lọc sản phẩm"><Link className={styles.active} href={`${v3Base}/danh-muc/${slug}`}>Tất cả</Link>{productTypes.slice(0, 5).map((type) => <Link href={`${v3Base}/danh-muc/${slug}?loai=${encodeURIComponent(type)}`} key={type}>{type}</Link>)}<button type="button"><SlidersHorizontal /> Lọc</button></nav><p className={styles.resultNote}>Sáu cấu trúc để tùy chỉnh theo màu, vật liệu và nhận diện của đội ngũ.</p><div className={styles.categoryProducts}>{products.map((product, index) => <ProductCard eager={index < 3} key={product.slug} large={index === 0 || index === 3} product={product} />)}</div><div className={styles.categoryEnd}><span>NOTHING OFF THE RACK</span><h2>Không tìm thấy đúng mẫu?<br /><i>Đó có thể là một khởi đầu tốt.</i></h2><Link href={`${v3Base}/#brief`}>Viết brief riêng <ArrowRight /></Link></div></section>
  </>
}
