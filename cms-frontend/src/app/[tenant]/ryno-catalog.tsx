import Image from 'next/image'
import Link from 'next/link'
import { ArrowRight, Phone, Search, Shirt, Sparkles } from 'lucide-react'

import type { ProductPreview, SportCategory } from '../../lib/catalog'
import { getCategories, getCategory, getProductBySlug, getProductsPage, getRelatedProducts, productImages } from '../../lib/content'
import { RynoSiteFooter, RynoSiteHeader } from './ryno-shell'

const money = (value?: number | null, currency = 'VND') =>
  typeof value === 'number' && value > 0
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
    : 'Liên hệ'

export function RynoCard({ product }: { product: ProductPreview }) {
  return <article className="ryno-product-card">
    <Link className="ryno-product-image" href={`/${product.slug}/`} aria-label={`Xem ${product.name}`}>
      <Image
        src={product.image}
        alt={product.name}
        width={900}
        height={900}
        sizes="(max-width: 720px) 50vw, (max-width: 1080px) 33vw, 25vw"
      />
    </Link>
    <div className="ryno-product-info">
      <span>{product.category}</span>
      <h2><Link href={`/${product.slug}/`}>{product.name}</Link></h2>
      <p>
        {product.compareAtPrice ? <del>{money(product.compareAtPrice, product.currency)}</del> : null}
        <b>{money(product.price, product.currency)}</b>
      </p>
    </div>
  </article>
}

function RynoCatalogBody({
  title,
  description,
  categories,
  products,
  activeSlug,
}: {
  title: string
  description: string
  categories: SportCategory[]
  products: ProductPreview[]
  activeSlug?: string
}) {
  return <main id="noi-dung" className="ryno-catalog">
    <section className="ryno-catalog-intro" aria-labelledby="ryno-catalog-title">
      <p>RynoSport / Bộ sưu tập</p>
      <h1 id="ryno-catalog-title">{title}</h1>
      <span>{description}</span>
    </section>
    <section className="ryno-catalog-content" aria-label="Danh sách sản phẩm">
      <div className="ryno-catalog-toolbar">
        <nav aria-label="Danh mục RynoSport">
          <Link className={!activeSlug ? 'active' : undefined} href="/san-pham/">Tất cả</Link>
          {categories.map((category) => <Link
            className={activeSlug === category.slug ? 'active' : undefined}
            href={`/danh-muc/${category.slug}/`}
            key={category.slug}
          >
            {category.name}
          </Link>)}
        </nav>
        <form action="/san-pham/" role="search">
          <label className="sr-only" htmlFor="ryno-search">Tìm sản phẩm</label>
          <input id="ryno-search" name="q" placeholder="Tìm mẫu áo..." />
          <button aria-label="Tìm kiếm"><Search size={17} /></button>
        </form>
      </div>
      <div className="ryno-result-label">
        <span>{activeSlug ? `Bộ sưu tập ${title}` : 'Tất cả mẫu đang có'}</span>
        <b>{products.length} sản phẩm</b>
      </div>
      {products.length ? <div className="ryno-product-grid">
        {products.map((product) => <RynoCard product={product} key={product.slug} />)}
      </div> : <div className="ryno-empty">
        <h2>Danh mục đang được bổ sung</h2>
        <p>Bạn có thể xem toàn bộ mẫu hiện có hoặc liên hệ để Ryno tư vấn theo môn chơi.</p>
        <Link href="/san-pham/">Xem toàn bộ sản phẩm <ArrowRight size={18} /></Link>
      </div>}
    </section>
  </main>
}

export async function RynoProductsPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const search = await searchParams
  const [{ products }, categories] = await Promise.all([
    getProductsPage({ limit: 60, query: search.q?.trim() }),
    getCategories(),
  ])
  return <div className="ryno-store">
    <RynoSiteHeader />
    <RynoCatalogBody
      title="Sản phẩm RynoSport"
      description="Khám phá trang phục thể thao dành cho đội nhóm, câu lạc bộ và những người muốn ra sân với diện mạo đồng bộ."
      categories={categories}
      products={products}
    />
    <RynoSiteFooter />
  </div>
}

export async function RynoCategoryPage({ slug }: { slug: string }) {
  const [category, categories] = await Promise.all([getCategory(slug), getCategories()])
  if (!category) return null
  const { products } = await getProductsPage({ categorySlug: slug, limit: 60 })

  return <div className="ryno-store">
    <RynoSiteHeader />
    <RynoCatalogBody
      title={category.name}
      description={category.description || `Mẫu trang phục ${category.name.toLowerCase()} được chọn để đội bạn dễ phối màu, đặt logo và ra sân đồng bộ.`}
      categories={categories}
      products={products}
      activeSlug={slug}
    />
    <RynoSiteFooter />
  </div>
}

export async function RynoProductPage({ slug }: { slug: string }) {
  const product = await getProductBySlug(slug)
  if (!product) return null

  const related = await getRelatedProducts(product)
  const image = productImages(product)[0]
  const category = typeof product.categories?.[0] === 'object' ? product.categories[0] : undefined
  const categoryHref = `/danh-muc/${category?.slug || 'bong-da'}/`

  return <div className="ryno-store">
    <RynoSiteHeader />
    <main id="noi-dung" className="ryno-detail">
      <nav className="ryno-breadcrumb" aria-label="Đường dẫn">
        <Link href="/">Trang chủ</Link>
        <span>/</span>
        <Link href={categoryHref}>{category?.name || 'Sản phẩm'}</Link>
        <span>/</span>
        <b>{product.name}</b>
      </nav>

      <header className="ryno-detail-heading">
        <p>{category?.name || 'RynoSport collection'}</p>
        <h1>{product.name}</h1>
      </header>

      <section className="ryno-detail-main" aria-label="Thông tin sản phẩm">
        <div className="ryno-detail-image">
          {image ? <Image
            src={image.url}
            alt={image.alt || product.name}
            width={1000}
            height={1000}
            priority
          /> : <div aria-label="Chưa có ảnh sản phẩm" />}
        </div>
        <div className="ryno-detail-copy">
          <div className="ryno-detail-price">
            {product.compareAtPrice ? <del>{money(product.compareAtPrice, product.currency)}</del> : null}
            <strong>{money(product.price, product.currency)}</strong>
          </div>
          {product.shortDescription ? <span>{product.shortDescription}</span> : <span>Liên hệ Ryno để được tư vấn chất liệu, size và phương án đặt áo phù hợp với đội bạn.</span>}
          <ul>
            <li><Shirt size={18} /> Tư vấn mẫu, màu sắc và logo theo đội hình</li>
            <li><Sparkles size={18} /> Gợi ý phối đồ theo môn chơi và mục đích sử dụng</li>
          </ul>
          <a href="tel:0989371161"><Phone size={18} />Tư vấn 098 937 11 61</a>
        </div>
      </section>

      {related.length > 0 ? <section className="ryno-related" aria-labelledby="ryno-related-title">
        <p>Gợi ý thêm</p>
        <h2 id="ryno-related-title">Mẫu cùng bộ sưu tập</h2>
        <div className="ryno-product-grid">{related.map((item) => <RynoCard product={item} key={item.slug} />)}</div>
      </section> : null}

      <section className="ryno-detail-back">
        <Link href="/san-pham/">← Xem toàn bộ sản phẩm</Link>
      </section>
    </main>
    <RynoSiteFooter />
  </div>
}
