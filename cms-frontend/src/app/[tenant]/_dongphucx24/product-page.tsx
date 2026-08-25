import { ArrowRight, Check, PackageCheck, Palette, Ruler, Shirt } from 'lucide-react'
import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getProductBySlug as getCmsProductBySlug } from '../../../lib/content'
import { getPublicStoreSettings } from '../../../lib/store-settings'
import { ProductViewTracker } from '../../_components/product-view-tracker'
import { getCategory, getProduct, products } from './data'
import { ProductCard } from './home'
import { QuoteForm } from './quote-form'
import { DongPhucX24Shell } from './shell'
import styles from './dongphucx24.module.css'

export function getDongPhucX24ProductMetadata(slug: string): Metadata {
  const product = getProduct(slug)
  if (!product) return { title: 'Không tìm thấy mẫu | Đồng Phục X24', robots: { index: false, follow: false } }
  const description = `${product.name}: mẫu áo đồng phục có thể phối màu, in thêu logo, chọn chất liệu, form và size theo yêu cầu.`
  return { title: { absolute: `${product.name} | Đồng Phục X24` }, description, alternates: { canonical: `https://dongphucx24.vn/san-pham/${slug}/` }, openGraph: { title: product.name, description, url: `https://dongphucx24.vn/san-pham/${slug}/`, images: [{ url: product.image, alt: product.alt }] } }
}

async function getTrackingProduct(slug: string) {
  try {
    return await getCmsProductBySlug(slug)
  } catch (error) {
    console.error('Unable to load Đồng Phục X24 product tracking record.', error)
    return undefined
  }
}

export async function DongPhucX24ProductPage({ slug }: { slug: string }) {
  const product = getProduct(slug)
  if (!product) notFound()
  const [storeSettings, trackingProduct] = await Promise.all([
    getPublicStoreSettings(),
    getTrackingProduct(slug),
  ])
  const consultationEnabled = Boolean(storeSettings.telegramChatId)
  const category = getCategory(product.category)
  const related = products.filter((item) => item.category === product.category && item.slug !== product.slug).slice(0, 4)
  return <DongPhucX24Shell><main className={styles.productPage} id="main-content">
    {trackingProduct ? <ProductViewTracker
      itemCategory={product.category}
      name={product.name}
      productId={trackingProduct.id}
      sku={product.sku}
      tenantSlug="dongphucx24"
    /> : null}
    <nav aria-label="Breadcrumb" className={styles.breadcrumb}><Link href="/">Trang chủ</Link><span>/</span><Link href="/san-pham/">Sản phẩm</Link><span>/</span>{category ? <Link href={`/danh-muc/${category.slug}/`}>{category.name}</Link> : null}</nav>
    <h1 className={styles.mobileProductTitle}>{product.name}</h1>
    <section className={styles.productLayout}>
      <div className={styles.productStage}><Image alt={product.alt} fill priority sizes="(max-width: 820px) 100vw, 52vw" src={product.image} /><span>Mẫu khởi đầu · Có thể tùy chỉnh</span></div>
      <div className={styles.productDetail}><small>{product.sku} · MAY THEO YÊU CẦU</small><p>Mẫu tham khảo dành cho {product.useCase.toLowerCase()}. X24 sẽ tư vấn phối màu, in thêu logo, chất liệu, form và dải size theo yêu cầu của từng tổ chức.</p>
        <div className={styles.priceBox}><span>Đơn giá</span><strong>Báo giá theo yêu cầu</strong><p>Phụ thuộc số lượng, chất liệu, kỹ thuật in thêu và yêu cầu hoàn thiện.</p></div>
        <div className={styles.swatch}><span>Màu gợi ý</span><i style={{ background: product.accent }} /><i style={{ background: '#fe590d' }} /><i style={{ background: '#17202a' }} /><i style={{ background: '#f4efe8' }} /></div>
        <div className={styles.specGrid}><div><Shirt aria-hidden="true" /><span><b>Form</b>Điều chỉnh theo đội ngũ</span></div><div><Palette aria-hidden="true" /><span><b>Chất liệu</b>{product.material}</span></div><div><Ruler aria-hidden="true" /><span><b>Size</b>Thống nhất theo form được duyệt</span></div><div><PackageCheck aria-hidden="true" /><span><b>Sản xuất</b>Sau khi duyệt mẫu thiết kế</span></div></div>
        <Link className={styles.primaryButton} href="#nhan-tu-van">{consultationEnabled ? 'Nhận tư vấn mẫu này' : 'Xem cách phát triển mẫu'} <ArrowRight aria-hidden="true" /></Link><p className={styles.productNote}><Check aria-hidden="true" /> Chỉ sản xuất sau khi thông tin được xác nhận.</p>
      </div>
    </section>
    <section className={styles.productQuote} id="nhan-tu-van"><div><span>THIẾT KẾ THEO MẪU ĐÃ CHỌN</span><h2>Phát triển thiết kế riêng<br />từ mẫu này.</h2><p>Gửi số lượng dự kiến, logo và thời điểm cần nhận để được tư vấn chất liệu, phối màu, in thêu và báo giá.</p></div>{consultationEnabled ? <QuoteForm productName={product.name} /> : <div className={styles.quoteFallback}><b>Tiếp tục khám phá catalog</b><p>Xem thêm mẫu cùng nhóm để xác định rõ phong cách và phối màu phù hợp.</p><Link className={styles.primaryButton} href={`/danh-muc/${product.category}/`}>Xem mẫu cùng nhóm <ArrowRight aria-hidden="true" /></Link></div>}</section>
    {related.length ? <section className={styles.related}><div><span>MẪU CÙNG NHÓM</span><h2>Có thể bạn muốn xem thêm</h2></div><div className={styles.productGrid}>{related.map((item) => <ProductCard key={item.slug} product={item} />)}</div></section> : null}
  </main></DongPhucX24Shell>
}
