import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '../_components/json-ld'
import { Pagination } from '../_components/pagination'
import { ProductCard } from '../_components/product-card'
import { SiteHeader } from '../_components/site-header'
import { getCategories, getProductsPage } from '../../lib/content'
import { breadcrumbSchema, metadataDescription, pageCanonical, pageTitle } from '../../lib/seo'

type ProductSearchParams = { page?: string; q?: string; sort?: string }

export async function generateMetadata({ searchParams }: { searchParams: Promise<ProductSearchParams> }): Promise<Metadata> {
  const search = await searchParams
  const page = Math.max(1, Number(search.page) || 1)
  const isFiltered = Boolean(search.q?.trim() || search.sort)
  const title = pageTitle('Tất cả sản phẩm', isFiltered ? 1 : page)
  return {
    title,
    description: metadataDescription('Khám phá toàn bộ sản phẩm bóng đá, cầu lông, bóng chuyền, bóng rổ, pickleball và chạy bộ tại X24Sport.'),
    alternates: { canonical: isFiltered ? '/san-pham/' : pageCanonical('/san-pham', page) },
    robots: isFiltered ? { index: false, follow: true } : undefined,
    openGraph: { title, description: 'Khám phá toàn bộ sản phẩm thể thao thiết kế tại X24Sport.', url: isFiltered ? '/san-pham/' : pageCanonical('/san-pham', page) },
  }
}

const sortOptions: Record<string, { label: string; value: string }> = {
  newest: { label: 'Mới nhất', value: '-createdAt' },
  price_asc: { label: 'Giá thấp đến cao', value: 'price' },
  price_desc: { label: 'Giá cao đến thấp', value: '-price' },
  name: { label: 'Tên A–Z', value: 'name' },
}

export default async function ProductsPage({ searchParams }: {
  searchParams: Promise<ProductSearchParams>
}) {
  const search = await searchParams
  const page = Math.max(1, Number(search.page) || 1)
  const sort = sortOptions[search.sort || 'newest'] || sortOptions.newest
  const [{ products, totalDocs, totalPages }, categories] = await Promise.all([
    getProductsPage({ page, limit: 20, query: search.q?.trim(), sort: sort.value }),
    getCategories(),
  ])
  if (page > 1 && (totalPages === 0 || page > totalPages)) notFound()
  return (
    <div className="page-shell">
      <JsonLd data={breadcrumbSchema([{ name: 'Trang chủ', path: '/' }, { name: 'Sản phẩm', path: '/san-pham/' }])} />
      <SiteHeader />
      <main id="noi-dung" className="catalog-page">
        <section className="catalog-banner">
          <div><p>Trang chủ / Sản phẩm</p><h1>Tất cả sản phẩm</h1></div>
          <form action="/san-pham">
            {search.q && <input type="hidden" name="q" value={search.q} />}
            <label htmlFor="sort">Sắp xếp</label>
            <select id="sort" name="sort" defaultValue={search.sort || 'newest'}>
              {Object.entries(sortOptions).map(([key, item]) => <option value={key} key={key}>{item.label}</option>)}
            </select>
            <button type="submit">Áp dụng</button>
          </form>
        </section>
        <div className="catalog-body site-container">
          <nav className="filter-links" aria-label="Danh mục bộ môn">
            <Link className="active" href="/san-pham">Tất cả</Link>
            {categories.map((category) => <Link href={`/danh-muc/${category.slug}`} key={category.slug}>{category.name}</Link>)}
          </nav>
          <div className="catalog-count">{search.q ? <span>Kết quả cho “{search.q}”</span> : <span>Danh mục sản phẩm</span>}<strong>{totalDocs} sản phẩm</strong></div>
          {products.length > 0
            ? <div className="product-grid catalog-grid">{products.map((product, index) => <ProductCard product={product} headingLevel={2} imagePriority={index < 2} key={product.slug} />)}</div>
            : <section className="catalog-no-results" role="status"><h2>Chưa tìm thấy sản phẩm phù hợp</h2><p>Hãy thử từ khóa ngắn hơn hoặc xem toàn bộ danh mục hiện có.</p><Link href="/san-pham/">Xem tất cả sản phẩm</Link></section>}
          <Pagination basePath="/san-pham/" page={page} totalPages={totalPages} params={{ q: search.q?.trim(), sort: search.sort }} />
        </div>
      </main>
    </div>
  )
}
