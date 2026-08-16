import { ArrowRight, Check, Scissors, Shirt, SwatchBook } from 'lucide-react'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { ProductMediaGallery } from '../../../_components/product-media-gallery'
import { products } from '../../../mayaodongphuc-preview/data'
import { Breadcrumbs, ProductCard, v3Base } from '../../components'
import { V3QuoteForm } from '../../quote-form'
import styles from '../../v3.module.css'

export default async function V3Product({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = products.find((item) => item.slug === slug)
  if (!product) notFound()
  const media = [
    { id: `${product.slug}-a`, url: product.image, alt: product.name },
    { id: `${product.slug}-b`, url: '/images/mayaodongphuc/hero-atelier.webp', alt: `${product.name} trong không gian studio` },
  ]

  return <>
    <section className={styles.productPage}>
      <Breadcrumbs items={[{ label: product.category, href: `${v3Base}/danh-muc/dong-phuc-doanh-nghiep` }, { label: product.name }]} />
      <h1 className={styles.mobileProductTitle}>{product.name}</h1>
      <div className={styles.productLayout}>
        <div className={styles.gallery}><ProductMediaGallery images={media} productName={product.name} variant="utility" /></div>
        <div className={styles.productCopy}>
          <span>{product.code} / STARTING PIECE</span>
          <p>Phom dáng được biên tập để giữ sự gọn gàng trong hình ảnh chung và đủ thoải mái cho nhịp làm việc thật.</p>
          <div className={styles.productPrice}><small>ĐƠN GIÁ THEO CẤU HÌNH</small><strong>Nhận báo giá riêng</strong><p>Vật liệu · Logo · Số lượng · Thời gian</p></div>
          <div className={styles.productColors}><h2>Màu gợi ý</h2>{product.colors.map((color, index) => <button aria-label={`Màu gợi ý ${index + 1}`} className={index === 0 ? styles.selected : ''} key={color} style={{ '--color': color } as React.CSSProperties} type="button" />)}</div>
          <dl><div><dt><Shirt /> Phom</dt><dd>Regular · chỉnh theo đội ngũ</dd></div><div><dt><SwatchBook /> Vật liệu</dt><dd>{product.material}</dd></div><div><dt><Scissors /> Hoàn thiện</dt><dd>Sau khi duyệt thiết kế</dd></div></dl>
          <Link className={styles.productCta} href="#viet-brief">Viết brief cho mẫu này <ArrowRight /></Link>
          <small className={styles.confirm}><Check /> Chỉ sản xuất sau khi thông tin được xác nhận.</small>
        </div>
      </div>
    </section>
    <section className={styles.productStory}><div><span>01 / THE THOUGHT</span><h2>Một nền tốt<br /><i>để nhận diện lên tiếng.</i></h2></div><p>Mỗi đường phối và vị trí logo cần có lý do. Mục tiêu là để đội ngũ trông đồng nhất, không biến người mặc thành một bề mặt quảng cáo.</p><blockquote>“Form áo là nền. Cách đội ngũ hiện diện mới là câu chuyện.”</blockquote></section>
    <section className={styles.productBrief} id="viet-brief"><div><span>02 / YOUR EDIT</span><h2>Biên tập mẫu này<br /><i>cho đội ngũ của bạn.</i></h2><p>Để lại thông tin cơ bản. Đây là mô phỏng trải nghiệm nhận brief của sản phẩm.</p></div><V3QuoteForm compact /></section>
    <section className={styles.moreProducts}><div className={styles.editorialHead}><span>03 / CONTINUE READING</span><h2>Những mẫu tiếp theo</h2></div><div>{products.filter((item) => item.slug !== product.slug).slice(0, 3).map((item, index) => <ProductCard key={item.slug} large={index === 0} product={item} />)}</div></section>
  </>
}
