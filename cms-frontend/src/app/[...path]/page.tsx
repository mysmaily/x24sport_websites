import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, MessageCircle, PackageCheck, Phone, ShieldCheck } from 'lucide-react'
import { notFound, permanentRedirect } from 'next/navigation'
import { JsonLd } from '../_components/json-ld'
import { Pagination } from '../_components/pagination'
import { ProductCard } from '../_components/product-card'
import { ProductGallery } from '../_components/product-gallery'
import { ProductViewTracker } from '../_components/product-view-tracker'
import { SiteHeader } from '../_components/site-header'
import { FloatingContact, PageFooter } from '../_components/store-footer'
import {
  getCategoryByLegacyPath, getProductBySlug, getProductsPage,
  getRelatedProducts, getWebContentByLegacyPath, hasProductInterestForm, prepareContentHtml, productImages, type CmsCategory, type CmsProduct, type CmsWebContent,
} from '../../lib/content'
import { ProductInterestForm } from '../_components/product-interest-form'
import { absoluteUrl, breadcrumbSchema, cleanSeoTitle, metadataDescription, pageCanonical, pageTitle, truncateText } from '../../lib/seo'
import { getTenantSlug } from '../../lib/tenant'

const money = (value?: number | null, currency = 'VND') =>
  typeof value === 'number' && value > 0
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
    : 'Liên hệ'
const categoryObjects = (product: CmsProduct) =>
  (product.categories || []).filter((item): item is CmsCategory => typeof item === 'object')
const categoryPath = (category?: CmsCategory) => category?.legacyPath || (category ? `/danh-muc/${category.slug}/` : '/san-pham/')
const currentCategoryPath = (category?: CmsCategory) => category ? `/danh-muc/${category.slug}/` : '/san-pham/'

async function resolve(segments: string[]) {
  if (segments.length === 1) {
    const product = await getProductBySlug(segments[0])
    if (product) return { product }
  }
  const path = `/${segments.join('/')}/`
  const category = await getCategoryByLegacyPath(path)
  if (category) return { category }
  const content = await getWebContentByLegacyPath(path)
  return content ? { content } : {}
}

export async function generateMetadata({ params, searchParams }: {
  params: Promise<{ path: string[] }>
  searchParams: Promise<{ page?: string }>
}): Promise<Metadata> {
  const result = await resolve((await params).path)
  if (result.product) {
    const canonical = result.product.legacyPath || `/${result.product.slug}/`
    const title = cleanSeoTitle(result.product.seoTitle || result.product.name)
    const description = metadataDescription(result.product.metaDescription || result.product.shortDescription, `${result.product.name} tại X24Sport.`)
    const images = productImages(result.product).map((item) => ({ url: item.url, alt: item.alt || result.product!.name }))
    return {
      title, description, alternates: { canonical },
      openGraph: { type: 'website', title, description, url: canonical, images },
      twitter: { card: 'summary_large_image', title, description, images: images.map((item) => item.url) },
    }
  }
  if (result.category) {
    const page = Math.max(1, Number((await searchParams).page) || 1)
    const categoryPath = result.category.legacyPath || `/${result.category.slug}/`
    const title = pageTitle(result.category.name, page)
    return {
      title, description: metadataDescription(result.category.description, `Danh mục ${result.category.name} tại X24Sport.`),
      alternates: { canonical: pageCanonical(categoryPath, page) },
      openGraph: { title, description: metadataDescription(result.category.description), url: pageCanonical(categoryPath, page) },
    }
  }
  if (result.content) {
    const title = cleanSeoTitle(result.content.title)
    const description = metadataDescription(result.content.excerpt, `${result.content.title} – kiến thức thể thao từ X24Sport.`)
    return {
      title, description, alternates: { canonical: result.content.legacyPath },
      openGraph: { type: 'article', title, description, url: result.content.legacyPath, modifiedTime: result.content.sourceModifiedAt },
    }
  }
  return { title: 'Không tìm thấy trang' }
}

function ProductDetail({ product, related, showInterestForm, tenantSlug }: { product: CmsProduct; related: Awaited<ReturnType<typeof getRelatedProducts>>; showInterestForm: boolean; tenantSlug: string }) {
  const categories = categoryObjects(product)
  const currency = product.currency || 'VND'
  const inStock = product.stockStatus !== 'outofstock'
  const originalPrice = typeof product.price === 'number' && product.price > 0
    ? (typeof product.compareAtPrice === 'number' && product.compareAtPrice > product.price
        ? product.compareAtPrice
        : Math.round((product.price * 1.2) / 1000) * 1000)
    : null
  const canonical = `/san-pham/${product.slug}/`
  const images = productImages(product)
  const primaryCategory = categories[0]
  const primaryCategoryPath = currentCategoryPath(primaryCategory)
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Product', name: product.name,
    image: images.map((item) => item.url),
    ...(product.shortDescription ? { description: metadataDescription(product.shortDescription) } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    brand: { '@type': 'Brand', name: 'X24Sport' },
    ...(primaryCategory ? { category: primaryCategory.name } : {}),
    ...(typeof product.price === 'number' && product.price > 0 ? { offers: {
      '@type': 'Offer', priceCurrency: currency, price: product.price,
      availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
      url: absoluteUrl(canonical),
    } } : {}),
  }
  const breadcrumbs = breadcrumbSchema([
    { name: 'Trang chủ', path: '/' },
    { name: 'Sản Phẩm', path: '/san-pham/' },
    ...(primaryCategory ? [{ name: primaryCategory.name, path: primaryCategoryPath }] : []),
    { name: product.name, path: canonical },
  ])
  const lazyContentHtml = prepareContentHtml(product.contentHtml)
  return (
    <>
      <ProductViewTracker
        currency={currency}
        itemCategory={product.sport}
        name={product.name}
        price={product.price}
        productId={product.id}
        sku={product.sku}
        tenantSlug={tenantSlug}
      />
      <JsonLd data={jsonLd} />
      <JsonLd data={breadcrumbs} />
      <nav className="detail-breadcrumb site-container" aria-label="Đường dẫn">
        <Link href="/">Trang chủ</Link><span>/</span><Link href="/san-pham/">Sản Phẩm</Link>{primaryCategory ? <><span>/</span><Link href={primaryCategoryPath}>{primaryCategory.name}</Link></> : null}<span>/</span><b>{product.name}</b>
      </nav>
      <header className="product-detail-heading site-container">
        <h1>{product.name}</h1>
      </header>
      <main id="noi-dung" className="product-detail site-container">
        <ProductGallery images={images} name={product.name} />
        <div className="detail-side">
          <section className="detail-summary">
            <div className="detail-prices">
              <div className="detail-price-main">
                <strong>{money(product.price, currency)}</strong>
                {originalPrice && <del>{money(originalPrice, currency)}</del>}
              </div>
              <div className="detail-price-meta">
                <span>Đã bao gồm VAT</span>
                <small>Giá đã bao gồm tư vấn thiết kế và phí ship.</small>
              </div>
            </div>
            {product.shortDescription && <p className="detail-excerpt">{product.shortDescription}</p>}
            <aside className="detail-assurance" aria-label="Hỗ trợ đặt hàng">
              <div><PackageCheck /><span><b>Chọn mẫu theo đội</b><small>Hỗ trợ điều chỉnh màu sắc và số lượng.</small></span></div>
              <div><ShieldCheck /><span><b>Tư vấn trước khi đặt</b><small>Xác nhận size, mẫu và thời gian thực hiện.</small></span></div>
              <div><Check /><span><b>Trao đổi rõ ràng</b><small>Chốt thông tin đơn hàng trước khi sản xuất.</small></span></div>
            </aside>
            <ul className="detail-facts">
              {product.sku && <li><span>Mã sản phẩm</span><b>{product.sku}</b></li>}
              <li><span>Tình trạng</span><b className={inStock ? 'in-stock' : 'out-stock'}>{inStock ? 'Còn hàng' : 'Tạm hết hàng'}</b></li>
              {categories.length > 0 && <li><span>Danh mục</span><b>{categories.map((item) => item.name).join(', ')}</b></li>}
            </ul>
            <div className="detail-actions">
              <a className="detail-primary" href="tel:0989353247"><Phone size={18} /> Gọi 0989 353 247</a>
              <a className="detail-secondary" href="https://zalo.me/0989353247" target="_blank" rel="noopener noreferrer"><MessageCircle size={18} /> Tư vấn Zalo</a>
            </div>
            {showInterestForm ? <ProductInterestForm productName={product.name} productUrl={absoluteUrl(canonical)} /> : null}
          </section>
        </div>
      </main>
      {lazyContentHtml && <section className="product-description site-container">
        <h2>Thông tin sản phẩm</h2>
        <div dangerouslySetInnerHTML={{ __html: lazyContentHtml }} />
      </section>}
      {related.length > 0 && <section className="related-products site-container">
        <div className="section-heading"><div><p className="eyebrow"><span /> Gợi ý thêm</p><h2>Sản phẩm liên quan</h2></div></div>
        <div className="product-grid">{related.map((item) => <ProductCard product={item} key={item.slug} />)}</div>
      </section>}
    </>
  )
}

function ContentDetail({ content }: { content: CmsWebContent }) {
  const html = prepareContentHtml(content.contentHtml)
  const jsonLd = {
    '@context': 'https://schema.org', '@type': 'Article',
    headline: content.title, description: metadataDescription(content.excerpt),
    mainEntityOfPage: absoluteUrl(content.legacyPath),
    ...(content.sourceModifiedAt ? { dateModified: content.sourceModifiedAt } : {}),
    author: { '@type': 'Organization', name: 'X24Sport', url: absoluteUrl('/') },
    publisher: { '@type': 'Organization', name: 'X24Sport', url: absoluteUrl('/') },
    inLanguage: 'vi-VN',
  }
  return <>
    <JsonLd data={jsonLd} />
    <JsonLd data={breadcrumbSchema([{ name: 'Trang chủ', path: '/' }, { name: 'Blog', path: '/blog/' }, { name: content.title, path: content.legacyPath }])} />
    <main id="noi-dung" className="article-page site-container">
      <nav className="article-breadcrumb" aria-label="Đường dẫn"><Link href="/">Trang chủ</Link><span>/</span><Link href="/blog/">Blog</Link></nav>
      <article>
        <p className="eyebrow"><span /> Kiến thức thể thao</p>
        <h1>{content.title}</h1>
        {content.excerpt && <p className="article-excerpt">{content.excerpt}</p>}
        {html && <div className="article-content" dangerouslySetInnerHTML={{ __html: html }} />}
      </article>
    </main>
  </>
}

export async function ContentPathPage({ params, searchParams, redirectProducts = false }: {
  params: Promise<{ path: string[] }>
  searchParams: Promise<{ page?: string }>
  redirectProducts?: boolean
}) {
  const result = await resolve((await params).path)
  if (result.product) {
    if (redirectProducts) permanentRedirect(`/san-pham/${result.product.slug}/`)
    const [related, showInterestForm, tenantSlug] = await Promise.all([getRelatedProducts(result.product), hasProductInterestForm(), getTenantSlug()])
    return <div className="page-shell"><SiteHeader /><ProductDetail product={result.product} related={related} showInterestForm={showInterestForm} tenantSlug={tenantSlug} /><PageFooter /><FloatingContact /></div>
  }
  if (result.content) return <div className="page-shell"><SiteHeader /><ContentDetail content={result.content} /><PageFooter /><FloatingContact /></div>
  if (result.category) {
    const page = Math.max(1, Number((await searchParams).page) || 1)
    const categoryPath = result.category.legacyPath || `/${result.category.slug}/`
    const products = await getProductsPage({ categorySlug: result.category.slug, page, limit: 20 })
    if (page > 1 && (products.totalPages === 0 || page > products.totalPages)) notFound()
    return <div className="page-shell"><JsonLd data={breadcrumbSchema([{ name: 'Trang chủ', path: '/' }, { name: result.category.name, path: categoryPath }])} /><SiteHeader /><main id="noi-dung" className="catalog-page">
      <section className="catalog-banner"><div><p>Trang chủ / Danh mục</p><h1>{result.category.name}</h1></div></section>
      <div className="catalog-body site-container"><div className="catalog-count"><span>{truncateText(result.category.description || '', 260)}</span><strong>{products.totalDocs} sản phẩm</strong></div>
        {products.products.length > 0
          ? <div className="product-grid catalog-grid">{products.products.map((item, index) => <ProductCard product={item} headingLevel={2} imagePriority={index < 2} key={item.slug} />)}</div>
          : <section className="catalog-no-results" role="status"><h2>Danh mục đang được cập nhật</h2><p>Sản phẩm mới sẽ sớm xuất hiện tại đây.</p><Link href="/san-pham/">Xem tất cả sản phẩm</Link></section>}
        <Pagination basePath={categoryPath} page={page} totalPages={products.totalPages} />
      </div>
    </main><PageFooter /><FloatingContact /></div>
  }
  notFound()
}

export default async function PathPage(props: {
  params: Promise<{ path: string[] }>
  searchParams: Promise<{ page?: string }>
}) {
  return <ContentPathPage {...props} redirectProducts />
}
