import { ArrowRight, Check, PackageCheck, Palette, Ruler, Shirt } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ProductMediaGallery } from '../../../_components/product-media-gallery'
import { products } from '../../../mayaodongphuc-preview/data'
import { Breadcrumbs, ProductCard, v2Base } from '../../components'
import { V2QuoteForm } from '../../quote-form'
import styles from '../../v2.module.css'

export default async function V2Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = products.find((item) => item.slug === slug)
  if (!product) notFound()
  const media = [
    { id: `${product.slug}-1`, url: product.image, alt: product.name },
    { id: `${product.slug}-2`, url: '/images/mayaodongphuc-preview/hero-atelier.webp', alt: `${product.name} trong bối cảnh studio` },
  ]

  return <>
    <section className={styles.productPage}>
      <Breadcrumbs items={[{ label: product.category, href: `${v2Base}/danh-muc/dong-phuc-doanh-nghiep` }, { label: product.name }]} />
      <h1 className={styles.mobileProductTitle}>{product.name}</h1>
      <div className={styles.productLayout}>
        <div className={styles.galleryWrap}><ProductMediaGallery images={media} productName={product.name} variant="utility" /></div>
        <div className={styles.productContent}>
          <span className={styles.productCode}>{product.code} · MADE TO ORDER</span>
          <p className={styles.productIntro}>Một cấu hình khởi đầu cân bằng giữa hình ảnh chuyên nghiệp, khả năng vận động và độ ổn định khi sử dụng thường xuyên.</p>
          <div className={styles.priceBlock}><span>ĐƠN GIÁ</span><strong>Báo giá theo cấu hình</strong><p>Phụ thuộc vật liệu, kỹ thuật logo và số lượng.</p></div>
          <div className={styles.configBlock}><h2>Màu khởi đầu</h2><div className={styles.colorOptions}>{product.colors.map((color, index) => <button aria-label={`Màu mẫu ${index + 1}`} className={index === 0 ? styles.selectedColor : ''} key={color} style={{ '--swatch': color } as React.CSSProperties} type="button" />)}</div></div>
          <div className={styles.specList}><div><Shirt /><span><b>Form</b>Regular · điều chỉnh theo đội ngũ</span></div><div><Palette /><span><b>Vật liệu</b>{product.material}</span></div><div><Ruler /><span><b>Size</b>Tư vấn từ bảng size thực tế</span></div><div><PackageCheck /><span><b>Sản xuất</b>Sau khi duyệt thiết kế & thông số</span></div></div>
          <Link className={styles.primaryCta} href="#nhan-bao-gia">Cấu hình mẫu này <ArrowRight /></Link>
          <p className={styles.productNote}><Check /> Không phát sinh sản xuất trước khi xác nhận.</p>
        </div>
      </div>
    </section>
    <section className={styles.detailBand}><div><span>01 / DESIGN INTENT</span><h2>Ít chi tiết hơn.<br />Đúng chi tiết hơn.</h2></div><p>Vị trí logo, đường phối và độ tương phản được điều chỉnh để nhận diện rõ nhưng không tạo cảm giác như áo quảng cáo.</p><ul><li>Logo theo tỉ lệ trang phục</li><li>Màu phối có vai trò cụ thể</li><li>Form theo hoạt động thực tế</li></ul></section>
    <section className={styles.productQuote} id="nhan-bao-gia"><div><span>02 / REQUEST SPEC</span><h2>Nhận cấu hình riêng cho<br />{product.name}.</h2><p>Để lại số lượng và thông tin liên hệ. Đây là mô phỏng luồng tư vấn của sản phẩm.</p></div><V2QuoteForm compact /></section>
    <section className={styles.related}><div className={styles.sectionHead}><div><span>03 / CÙNG HỆ THIẾT KẾ</span><h2>Có thể bạn cũng cần</h2></div></div><div className={styles.productGrid}>{products.filter((item) => item.slug !== product.slug).slice(0, 4).map((item) => <ProductCard key={item.slug} product={item} />)}</div></section>
  </>
}
