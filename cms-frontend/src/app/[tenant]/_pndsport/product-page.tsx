import type { Metadata } from 'next'
import { MessageCircle, Phone } from 'lucide-react'
import { notFound } from 'next/navigation'

import { getProductBySlug, getRelatedProducts, prepareContentHtml, productImages } from '../../../lib/content'
import { JsonLd } from '../../_components/json-ld'
import { ProductMediaGallery } from '../../_components/product-media-gallery'
import { Breadcrumbs, ProductGrid, SectionHeading } from '../../pndsport-preview/components'
import { formatPrice } from '../../pndsport-preview/data'
import styles from '../../pndsport-preview/pnd.module.css'
import { cmsProductCategory, toPndProduct } from './lib'
import { PndShell } from './shell'

export async function getPndProductMetadata(slug: string): Promise<Metadata> {
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Không tìm thấy sản phẩm' }
  const description = product.metaDescription || product.shortDescription || `${product.name} tại PND Sport Việt Nam.`
  const images = productImages(product).map((image) => ({ url: image.url, alt: image.alt || product.name }))
  return {
    title: product.seoTitle || product.name,
    description,
    alternates: { canonical: `/san-pham/${product.slug}/` },
    openGraph: { title: product.name, description, url: `/san-pham/${product.slug}/`, images },
  }
}

export async function PndProductPage({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug)
  if (!product) notFound()
  const category = cmsProductCategory(product)
  const images = productImages(product)
  const related = (await getRelatedProducts(product)).map(toPndProduct)
  const price = product.price || product.salePrice || product.regularPrice || product.compareAtPrice
  const categoryName = category?.name || 'Sản phẩm'
  const categorySlug = category?.slug
  const canonical = `https://pndsport.vn/san-pham/${product.slug}/`
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku || undefined,
    image: images.map((image) => image.url),
    description: product.shortDescription,
    brand: { '@type': 'Brand', name: 'PND Sport' },
    ...(price ? {
      offers: {
        '@type': 'Offer',
        url: canonical,
        priceCurrency: product.currency || 'VND',
        price,
        availability: product.stockStatus === 'outofstock' ? 'https://schema.org/OutOfStock' : product.stockStatus === 'onbackorder' ? 'https://schema.org/BackOrder' : 'https://schema.org/InStock',
      },
    } : {}),
  }

  return <PndShell>
    <JsonLd data={structuredData} />
    <Breadcrumbs base="" items={[...(categorySlug ? [{ label: categoryName, href: `/danh-muc/${categorySlug}/` }] : []), { label: product.name }]} />
    <article className={styles.productDetail}>
      <h1>{product.name}</h1>
      <div className={styles.productLayout}>
        <div className={styles.dynamicGallery}><ProductMediaGallery images={images} productName={product.name} variant="utility" /></div>
        <section className={styles.productInfo}>
          <div className={styles.productCode}><span>Mã: {product.sku || product.id}</span><span>Danh mục: {categoryName}</span></div>
          <div className={styles.productPrice}><small>{price ? 'Giá thấp nhất' : 'Đơn giá'}</small><strong>{price ? formatPrice(price) : 'Báo giá theo yêu cầu'}</strong></div>
          <p>{product.shortDescription || 'Mẫu trang phục thể thao để đội tham khảo trước khi trao đổi màu sắc, logo, tên số và số lượng.'}</p>
          <div className={styles.productCta}><a href="https://zalo.me/0989353247" target="_blank" rel="noreferrer"><MessageCircle size={17} /> Gửi yêu cầu thiết kế</a><a href="tel:0989353247"><Phone size={17} /> Gọi báo giá</a></div>
          <div className={styles.detailFacts}><div><small>Giá hiển thị</small><b>Mức thấp nhất</b></div><div><small>Tùy chỉnh</small><b>Màu, logo, tên số</b></div><div><small>Xác nhận</small><b>Trước sản xuất</b></div></div>
        </section>
      </div>
      <section className={styles.contentTabs}><div><h2>Thông tin sản phẩm</h2>{product.contentHtml ? <div className={styles.richContent} dangerouslySetInnerHTML={{ __html: prepareContentHtml(product.contentHtml) || '' }} /> : <><p>Mẫu được dùng làm điểm bắt đầu để đội trao đổi về bố cục và màu sắc. Khi gửi yêu cầu, bạn có thể đính kèm logo, danh sách tên số và mẫu tham khảo.</p><h3>Thông tin nên chuẩn bị</h3><ul><li>Số lượng dự kiến và nhóm người mặc.</li><li>Màu chủ đạo, màu phụ hoặc màu nhận diện hiện có.</li><li>Logo và nội dung cần xuất hiện trên áo.</li><li>Mốc thời gian dự kiến cần nhận sản phẩm.</li></ul></>}</div><div><h2>Thông tin đặt mẫu</h2><div className={styles.specTable}><div><span>Mã mẫu</span><b>{product.sku || product.id}</b></div><div><span>Danh mục</span><b>{categoryName}</b></div><div><span>Đơn giá</span><b>{price ? formatPrice(price) : 'Báo giá theo yêu cầu'}</b></div><div><span>Tình trạng</span><b>{product.stockStatus === 'outofstock' ? 'Tạm hết hàng' : product.stockStatus === 'onbackorder' ? 'Nhận đặt trước' : 'Đang nhận yêu cầu'}</b></div></div></div></section>
      {related.length ? <section className={styles.section}><div className={styles.sectionInner}><SectionHeading eyebrow="Gợi ý tiếp theo" title="Sản phẩm liên quan" href={categorySlug ? `/danh-muc/${categorySlug}/` : '/san-pham/'} /><ProductGrid items={related} base="" /></div></section> : null}
    </article>
  </PndShell>
}
