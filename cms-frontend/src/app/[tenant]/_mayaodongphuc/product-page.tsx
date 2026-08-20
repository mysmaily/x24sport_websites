import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight, Check, PackageCheck, Palette, Ruler, Shirt } from 'lucide-react'
import Link from 'next/link'

import { hasProductInterestForm } from '../../../lib/content'
import { JsonLd } from '../../_components/json-ld'
import { ProductInterestForm } from '../../_components/product-interest-form'
import { ProductMediaGallery } from '../../_components/product-media-gallery'
import styles from './mayaodongphuc.module.css'
import { Breadcrumbs, UniformProductCard } from './components'
import { cleanContentHtml, getRelatedUniformProducts, getUniformProduct, productCategory, productColors, productDescriptionParagraphs, productImages, productMaterial } from './lib'
import { MayAoDongPhucShell } from './shell'

export async function getMayAoDongPhucProductMetadata(slug: string): Promise<Metadata> {
  const product = await getUniformProduct(slug)
  if (!product) return { title: 'Không tìm thấy sản phẩm' }
  const description = product.metaDescription || product.shortDescription || `${product.name} — mẫu đồng phục đặt may theo yêu cầu.`
  const images = productImages(product).map((image) => ({ url: image.url || '', alt: image.alt || product.name }))
  const canonical = `/san-pham/${product.slug}/`
  return { title: { absolute: product.seoTitle || `${product.name} | May Áo Đồng Phục` }, description, alternates: { canonical }, openGraph: { title: product.name, description, url: canonical, images } }
}

export async function MayAoDongPhucProductPage({ slug }: { slug: string }) {
  const product = await getUniformProduct(slug)
  if (!product) notFound()
  const [related, consultationEnabled] = await Promise.all([getRelatedUniformProducts(product), hasProductInterestForm()])
  const category = productCategory(product)
  const images = productImages(product)
  const canonical = `https://mayaodongphuc.com.vn/san-pham/${product.slug}/`
  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    sku: product.sku || undefined,
    image: images.map((image) => image.url),
    description: product.shortDescription,
    brand: { '@type': 'Brand', name: 'May Áo Đồng Phục' },
    url: canonical,
  }
  const descriptionParagraphs = productDescriptionParagraphs(product)
  const contextualImages = images.slice(1)
  const attributes = (product.attributes || [])
    .map((attribute) => ({
      name: attribute.name?.trim(),
      values: (attribute.values || []).map((item) => item.value?.trim()).filter(Boolean),
    }))
    .filter((attribute) => attribute.name && attribute.values.length)

  return <MayAoDongPhucShell>
    <JsonLd data={structuredData} />
    <section className={styles.productPage}><Breadcrumbs items={[...(category ? [{ label: category.name, href: `/danh-muc/${category.slug}/` }] : []), { label: product.name }]} /><h1 className={styles.mobileProductTitle}>{product.name}</h1><div className={styles.productLayout}><div className={styles.galleryWrap}><ProductMediaGallery images={images} productName={product.name} variant="utility" /></div><div className={styles.productContent}><span className={styles.productCode}>{product.sku || product.id} · MADE TO ORDER</span><p className={styles.productIntro}>{product.shortDescription || 'Mẫu đồng phục để phát triển theo bối cảnh, vai trò và nhận diện của tổ chức.'}</p><div className={styles.priceBlock}><span>ĐƠN GIÁ</span><strong>Báo giá theo yêu cầu</strong><p>Phụ thuộc vật liệu, kỹ thuật logo và số lượng được xác nhận.</p></div><div className={styles.configBlock}><h2>Màu khởi đầu</h2><div className={styles.colorOptions}>{productColors(product).map((color, index) => <span aria-label={`Màu gợi ý ${index + 1}`} className={index === 0 ? styles.selectedColor : ''} key={color} style={{ '--swatch': color } as React.CSSProperties} />)}</div></div><div className={styles.specList}><div><Shirt aria-hidden="true" /><span><b>Form</b>Điều chỉnh theo đội ngũ</span></div><div><Palette aria-hidden="true" /><span><b>Vật liệu gợi ý</b>{productMaterial(product)}</span></div><div><Ruler aria-hidden="true" /><span><b>Size</b>Tư vấn từ bảng size thực tế</span></div><div><PackageCheck aria-hidden="true" /><span><b>Sản xuất</b>Sau khi duyệt thiết kế & thông số</span></div></div>{consultationEnabled ? <Link className={styles.primaryCta} href="#nhan-bao-gia">Nhận tư vấn mẫu này <ArrowRight aria-hidden="true" /></Link> : <Link className={styles.primaryCta} href="/san-pham/">Xem thêm mẫu <ArrowRight aria-hidden="true" /></Link>}<p className={styles.productNote}><Check aria-hidden="true" /> Chỉ sản xuất sau khi thông tin được xác nhận.</p></div></div></section>
    <section className={styles.detailBand}><div><span>01 / DESIGN INTENT</span><h2>Ít chi tiết hơn.<br />Đúng chi tiết hơn.</h2></div><p>Vị trí logo, đường phối và độ tương phản được điều chỉnh để nhận diện rõ nhưng không tạo cảm giác như áo quảng cáo.</p><ul><li>Logo theo tỉ lệ trang phục</li><li>Màu phối có vai trò cụ thể</li><li>Form theo hoạt động thực tế</li></ul></section>
    {descriptionParagraphs.length || product.contentHtml || attributes.length ? (
      <section className={styles.productEditorial} aria-labelledby="product-description-heading">
        <article>
          <span>02 / CHI TIẾT MẪU</span>
          <h2 id="product-description-heading">Mô tả sản phẩm</h2>
          {descriptionParagraphs.length ? (
            <div className={styles.productCopyFlow}>
              {descriptionParagraphs.map((paragraph, index) => <p key={`${index}-${paragraph}`}>{paragraph}</p>)}
            </div>
          ) : product.contentHtml ? (
            <div className={styles.productCopyFlow} dangerouslySetInnerHTML={{ __html: cleanContentHtml(product.contentHtml) }} />
          ) : null}
          {contextualImages.length ? (
            <div className={styles.contextualMedia}>
              {contextualImages.map((image, index) => {
                const caption = image.alt || `${product.name} — hình ảnh ${index + 2}`
                return (
                  <figure key={image.id || image.url}>
                    <img
                      src={image.url}
                      alt={caption}
                      width={image.width || 1254}
                      height={image.height || 1254}
                      loading="lazy"
                      decoding="async"
                    />
                    <figcaption>{caption}</figcaption>
                  </figure>
                )
              })}
            </div>
          ) : null}
        </article>
        {attributes.length ? (
          <aside>
            <h2>Thông tin mẫu</h2>
            <dl className={styles.productAttributes}>
              {attributes.map((attribute) => (
                <div key={attribute.name}>
                  <dt>{attribute.name}</dt>
                  <dd>{attribute.values.join(', ')}</dd>
                </div>
              ))}
            </dl>
          </aside>
        ) : null}
      </section>
    ) : null}
    {consultationEnabled ? <section className={styles.productQuote} id="nhan-bao-gia"><div><span>03 / NHẬN TƯ VẤN</span><h2>Nhận phương án riêng cho<br />{product.name}.</h2><p>Gửi số lượng và số điện thoại để đội ngũ tư vấn chuẩn bị phương án phù hợp.</p></div><ProductInterestForm productName={product.name} productUrl={canonical} variant="utility" /></section> : null}
    {related.length ? <section className={styles.related}><div className={styles.sectionHead}><div><span>04 / CÙNG HỆ THIẾT KẾ</span><h2>Có thể bạn cũng cần</h2></div></div><div className={styles.productGrid}>{related.map((item) => <UniformProductCard key={item.id} product={item} />)}</div></section> : null}
  </MayAoDongPhucShell>
}
