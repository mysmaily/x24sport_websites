import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight, CheckCircle2, Phone, Ruler, Search, Shirt, Sparkles, SwatchBook } from 'lucide-react'

import { JsonLd } from '../_components/json-ld'
import type { ProductPreview, SportCategory } from '../../lib/catalog'
import { getCategories, getCategory, getProductBySlug, getProductsPage, getRelatedProducts, productImages } from '../../lib/content'
import { RynoSiteFooter, RynoSiteHeader } from './ryno-shell'

const money = (value?: number | null, currency = 'VND') =>
  typeof value === 'number' && value > 0
    ? new Intl.NumberFormat('vi-VN', { style: 'currency', currency, maximumFractionDigits: 0 }).format(value)
    : 'Liên hệ'

export const rynoDesignCards = [
  { title: 'Áo bóng đá đỏ đen', tag: 'Bóng đá', image: '/images/rynosport/football-red.png', text: 'Phom thi đấu mạnh, dễ đặt tên và số áo cho cả đội.' },
  { title: 'Áo bóng chuyền đội nhóm', tag: 'Bóng chuyền', image: '/images/rynosport/volleyball-red.png', text: 'Màu sắc nổi bật, gọn vai tay cho chuyển động bật nhảy.' },
  { title: 'Đồng phục tập luyện', tag: 'Teamwear', image: '/images/rynosport/training-red.png', text: 'Dễ phối màu, phù hợp CLB, lớp học và đội phong trào.' },
  { title: 'Áo esports đồng đội', tag: 'Esports', image: '/images/rynosport/esports-red.png', text: 'Đường nét sắc, lên hình rõ trong sự kiện và giải đấu.' },
]

export function RynoCard({ product, priority = false }: { product: ProductPreview; priority?: boolean }) {
  return <article className="ryno-product-card">
    <Link className="ryno-product-image" href={`/${product.slug}/`} aria-label={`Xem ${product.name}`}>
      <Image
        src={product.image}
        alt={product.name}
        width={900}
        height={900}
        sizes="(max-width: 720px) 50vw, (max-width: 1080px) 33vw, 25vw"
        priority={priority}
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

export function RynoDesignGrid({ limit = rynoDesignCards.length }: { limit?: number }) {
  return <div className="ryno-look-grid">
    {rynoDesignCards.slice(0, limit).map((item, index) => <article className="ryno-look-card" key={item.title}>
      <Image
        src={item.image}
        alt={`${item.title} RynoSport`}
        width={900}
        height={1200}
        sizes="(max-width: 720px) 50vw, (max-width: 1080px) 33vw, 25vw"
        priority={index < 2}
      />
      <div>
        <span>{item.tag}</span>
        <h2>{item.title}</h2>
        <p>{item.text}</p>
        <Link href="/lien-he/">Tư vấn mẫu này <ArrowRight size={17} /></Link>
      </div>
    </article>)}
  </div>
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
        {products.map((product, index) => <RynoCard product={product} priority={index < 4} key={product.slug} />)}
      </div> : <div className="ryno-empty">
        <h2>Mẫu trong CMS đang được bổ sung</h2>
        <p>Trong lúc chờ catalog sản phẩm chi tiết, bạn có thể chọn một hướng thiết kế để Ryno tư vấn màu áo, logo và size cho đội.</p>
        <RynoDesignGrid />
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
      description="Khám phá áo đấu và đồng phục thể thao RynoSport cho đội nhóm, câu lạc bộ, trường học và đội phong trào muốn có màu áo đồng bộ."
      categories={categories}
      products={products}
    />
    <RynoSiteFooter />
  </div>
}

export async function RynoCategoryPage({ slug }: { slug: string }) {
  const [category, categories] = await Promise.all([getCategory(slug), getCategories()])
  if (!category) notFound()
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
  if (!product) notFound()

  const related = await getRelatedProducts(product)
  const image = productImages(product)[0]
  const category = typeof product.categories?.[0] === 'object' ? product.categories[0] : undefined
  const categoryHref = `/danh-muc/${category?.slug || 'bong-da'}/`
  const inStock = product.stockStatus !== 'outofstock'
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.name,
    image: productImages(product).map((item) => item.url),
    ...(product.shortDescription ? { description: product.shortDescription } : {}),
    ...(product.sku ? { sku: product.sku } : {}),
    brand: { '@type': 'Brand', name: 'RynoSport' },
    ...(category ? { category: category.name } : {}),
    ...(typeof product.price === 'number' && product.price > 0 ? {
      offers: {
        '@type': 'Offer',
        priceCurrency: product.currency || 'VND',
        price: product.price,
        availability: inStock ? 'https://schema.org/InStock' : 'https://schema.org/OutOfStock',
        url: `https://rynosport.vn/${product.slug}/`,
      },
    } : {}),
  }
  const breadcrumbsJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://rynosport.vn/' },
      { '@type': 'ListItem', position: 2, name: category?.name || 'Sản phẩm', item: `https://rynosport.vn${categoryHref}` },
      { '@type': 'ListItem', position: 3, name: product.name, item: `https://rynosport.vn/${product.slug}/` },
    ],
  }

  return <div className="ryno-store">
    <JsonLd data={productJsonLd} />
    <JsonLd data={breadcrumbsJsonLd} />
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
            <li><Ruler size={18} /> Hỗ trợ tổng hợp size, tên áo và số áo cho từng thành viên</li>
          </ul>
          <a href="tel:0989371161"><Phone size={18} />Tư vấn 098 937 11 61</a>
        </div>
      </section>

      <section className="ryno-detail-specs" aria-labelledby="ryno-detail-specs-title">
        <p>Thông tin đặt áo</p>
        <h2 id="ryno-detail-specs-title">CHUẨN BỊ GÌ TRƯỚC KHI CHỐT MẪU?</h2>
        <div>
          <article><SwatchBook size={23} /><b>Màu sắc & logo</b><span>Gửi màu chủ đạo, logo đội hoặc hình tham chiếu để Ryno tư vấn cách đặt nhận diện trên áo.</span></article>
          <article><Ruler size={23} /><b>Số lượng & size</b><span>Tổng hợp số lượng thành viên, size dự kiến, tên và số áo nếu đội muốn cá nhân hóa.</span></article>
          <article><CheckCircle2 size={23} /><b>Mục đích sử dụng</b><span>Cho biết đội dùng để tập luyện, thi đấu, đi giải hay sự kiện để chọn chất liệu và phom áo phù hợp.</span></article>
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
