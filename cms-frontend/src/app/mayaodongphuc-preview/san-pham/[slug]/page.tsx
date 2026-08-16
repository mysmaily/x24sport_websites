import { ArrowRight, Check, FileText, Layers3, Ruler, SwatchBook } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { ProductMediaGallery } from '../../../_components/product-media-gallery'
import { Breadcrumbs, ProductCard } from '../../components'
import { featuredProduct, previewBase, products } from '../../data'
import { QuoteForm } from '../../quote-form'
import styles from '../../studio.module.css'

export const metadata: Metadata = { title: { absolute: 'Polo doanh nghiệp Atelier 01 | May Áo Đồng Phục' } }

export default async function PreviewProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = products.find((item) => item.slug === slug) || featuredProduct
  const galleryImages = [
    { id: `${product.slug}-1`, url: product.image, alt: `${product.name} nhìn chính diện`, width: 1254, height: 1254 },
    { id: `${product.slug}-2`, url: product.image, alt: `Chi tiết chất liệu và đường may ${product.name}`, width: 1254, height: 1254 },
  ]

  return <div className={styles.productPage}>
    <Breadcrumbs items={[{ label: product.category, href: `${previewBase}/danh-muc/dong-phuc-doanh-nghiep` }, { label: product.name }]} />
    <h1 className={styles.productTitle}>{product.name}</h1>
    <div className={styles.productLayout}>
      <div className={styles.galleryWrap}><ProductMediaGallery images={galleryImages} label="MẪU ĐẠI DIỆN" productName={product.name} /></div>
      <section className={styles.productDecision}>
        <div className={styles.productCode}><span>{product.code}</span><b>{product.category}</b></div>
        <p className={styles.productLead}>Form áo đại diện cho hướng thiết kế “Xưởng nhận diện”: gọn, dễ ứng dụng và có đủ khoảng trống để phát triển màu sắc thương hiệu.</p>
        <div className={styles.quoteState}><span>GIÁ DỰ KIẾN</span><strong>Báo giá theo cấu hình</strong><p>Đơn giá phụ thuộc chất liệu, số lượng, kỹ thuật logo và các chi tiết được xác nhận.</p></div>
        <div className={styles.decisionBlock}><span>01 / MÀU MẪU</span><div className={styles.colorChoices}>{product.colors.map((color, index) => <button aria-label={`Chọn màu ${index + 1}`} className={index === 0 ? styles.colorActive : ''} key={color} style={{ '--swatch': color } as React.CSSProperties} type="button"><i /></button>)}</div><small>Màu hiển thị là dữ liệu minh họa, sẽ đối chiếu bảng màu thực tế.</small></div>
        <div className={styles.decisionBlock}><span>02 / NHU CẦU TÙY CHỈNH</span><div className={styles.optionGrid}><button type="button"><Check /> Phối màu thương hiệu</button><button type="button"><Check /> In hoặc thêu logo</button><button type="button"><Check /> Bổ sung tên / vị trí</button><button type="button"><Check /> Điều chỉnh form</button></div></div>
        <Link className={styles.productCta} href="#yeu-cau-san-pham">Yêu cầu tư vấn mẫu này <ArrowRight /></Link>
        <div className={styles.microTrust}><span><Ruler /> Tư vấn size</span><span><SwatchBook /> Chọn chất liệu</span><span><FileText /> Xác nhận thiết kế</span></div>
      </section>
    </div>
    <section className={styles.productSpecs}>
      <div><span>03 / CẤU TRÚC MẪU</span><h2>Thông tin đủ để quyết định,<br />không phải một bài quảng cáo dài.</h2></div>
      <dl><div><dt>Phom dáng</dt><dd>Unisex, suông vừa — dữ liệu minh họa cần xác nhận khi đưa vào CMS</dd></div><div><dt>Chất liệu gợi ý</dt><dd>{product.material}</dd></div><div><dt>Ứng dụng</dt><dd>Đội ngũ doanh nghiệp, sự kiện nội bộ hoặc vị trí cần nhận diện đồng nhất</dd></div><div><dt>Kỹ thuật nhận diện</dt><dd>Chọn sau khi đánh giá logo, số lượng màu và vị trí thể hiện</dd></div></dl>
    </section>
    <section className={styles.productStory}><div><Layers3 /><span>CHI TIẾT / 01</span><h2>Một điểm nhấn nhỏ<br />đủ để nhận ra nhau.</h2><p>Đường phối bất đối xứng tạo dấu hiệu thị giác riêng mà không làm chiếc áo trở nên khó mặc trong môi trường công việc.</p></div><div><SwatchBook /><span>CHI TIẾT / 02</span><h2>Màu sắc đi theo<br />hệ nhận diện.</h2><p>Bảng màu mẫu chỉ là điểm khởi đầu. Phiên bản sản xuất cần được đối chiếu với logo và vật liệu thực tế.</p></div></section>
    <section className={styles.productQuote} id="yeu-cau-san-pham"><div><span>YÊU CẦU / {product.code}</span><h2>Phát triển mẫu này<br />theo thương hiệu của bạn.</h2><p>Điền thông tin cơ bản để mô phỏng luồng yêu cầu báo giá trên trang sản phẩm.</p></div><QuoteForm compact /></section>
    <section className={styles.relatedSection}><h2>Các hướng thiết kế liên quan</h2><div className={styles.productGrid}>{products.filter((item) => item.slug !== product.slug).slice(0, 3).map((item) => <ProductCard key={item.slug} product={item} />)}</div></section>
  </div>
}
