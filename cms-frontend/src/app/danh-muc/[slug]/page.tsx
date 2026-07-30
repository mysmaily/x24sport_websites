import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCategorySeoProfile } from '../../../lib/catalog'
import { JsonLd } from '../../_components/json-ld'
import { Pagination } from '../../_components/pagination'
import { ProductCard } from '../../_components/product-card'
import { SiteHeader } from '../../_components/site-header'
import { FloatingContact, PageFooter } from '../../_components/store-footer'
import { getCategory, getProductsPage, type CatalogPage } from '../../../lib/content'
import { breadcrumbSchema, metadataDescription, pageCanonical, pageTitle, truncateText } from '../../../lib/seo'

const PRODUCTS_PER_PAGE = 20

async function getProductWindow(options: {
  categorySlugs: string[]
  excludeCategorySlugs?: string[]
  offset: number
  count: number
  sort: string
}) {
  if (options.count <= 0) return []

  const firstPage = Math.floor(options.offset / PRODUCTS_PER_PAGE) + 1
  const startIndex = options.offset % PRODUCTS_PER_PAGE
  const firstResult = await getProductsPage({
    categorySlugs: options.categorySlugs,
    excludeCategorySlugs: options.excludeCategorySlugs,
    page: firstPage,
    limit: PRODUCTS_PER_PAGE,
    sort: options.sort,
  })
  const products = firstResult.products.slice(startIndex)

  if (products.length < options.count && firstPage < firstResult.totalPages) {
    const nextResult = await getProductsPage({
      categorySlugs: options.categorySlugs,
      excludeCategorySlugs: options.excludeCategorySlugs,
      page: firstPage + 1,
      limit: PRODUCTS_PER_PAGE,
      sort: options.sort,
    })
    products.push(...nextResult.products)
  }

  return products.slice(0, options.count)
}

async function getProductsWithDeferredCategories(options: {
  categorySlugs: string[]
  deferredCategorySlugs: string[]
  page: number
  sort: string
}): Promise<CatalogPage> {
  const priorityCategorySlugs = options.categorySlugs.filter(
    (slug) => !options.deferredCategorySlugs.includes(slug),
  )
  const [priorityMeta, deferredMeta] = await Promise.all([
    getProductsPage({
      categorySlugs: priorityCategorySlugs,
      excludeCategorySlugs: options.deferredCategorySlugs,
      page: 1,
      limit: 1,
      sort: options.sort,
    }),
    getProductsPage({
      categorySlugs: options.deferredCategorySlugs,
      page: 1,
      limit: 1,
      sort: options.sort,
    }),
  ])
  const totalDocs = priorityMeta.totalDocs + deferredMeta.totalDocs
  const offset = (options.page - 1) * PRODUCTS_PER_PAGE
  const priorityCount = Math.min(
    PRODUCTS_PER_PAGE,
    Math.max(0, priorityMeta.totalDocs - offset),
  )
  const deferredOffset = Math.max(0, offset - priorityMeta.totalDocs)
  const deferredCount = Math.min(
    PRODUCTS_PER_PAGE - priorityCount,
    Math.max(0, deferredMeta.totalDocs - deferredOffset),
  )
  const [priorityProducts, deferredProducts] = await Promise.all([
    getProductWindow({
      categorySlugs: priorityCategorySlugs,
      excludeCategorySlugs: options.deferredCategorySlugs,
      offset,
      count: priorityCount,
      sort: options.sort,
    }),
    getProductWindow({
      categorySlugs: options.deferredCategorySlugs,
      offset: deferredOffset,
      count: deferredCount,
      sort: options.sort,
    }),
  ])

  return {
    products: [...priorityProducts, ...deferredProducts],
    totalDocs,
    totalPages: Math.ceil(totalDocs / PRODUCTS_PER_PAGE),
    page: options.page,
  }
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string; sort?: string }> }): Promise<Metadata> {
  const category = await getCategory((await params).slug)
  if (!category) return { title: 'Không tìm thấy danh mục' }
  const search = await searchParams
  const page = Math.max(1, Number(search.page) || 1)
  const seo = getCategorySeoProfile(category)
  const title = pageTitle(seo.title, search.sort ? 1 : page)
  const description = metadataDescription(seo.description, `Sản phẩm ${category.name} thiết kế theo yêu cầu tại X24Sport.`)
  return {
    title, description,
    alternates: { canonical: search.sort ? `/danh-muc/${category.slug}/` : pageCanonical(`/danh-muc/${category.slug}`, page) },
    robots: search.sort ? { index: false, follow: true } : undefined,
    openGraph: { title, description, url: pageCanonical(`/danh-muc/${category.slug}`, page) },
  }
}

export default async function CategoryPage({ params, searchParams }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string; sort?: string }>
}) {
  const category = await getCategory((await params).slug)
  if (!category) notFound()
  const search = await searchParams
  const page = Math.max(1, Number(search.page) || 1)
  const sort = search.sort === 'price' ? 'price' : search.sort === 'price-desc' ? '-price' : '-createdAt'
  const seo = getCategorySeoProfile(category)
  const categorySlugs = seo.role === 'parent'
    ? [category.slug, ...seo.siblings.map((child) => child.slug)]
    : [category.slug]
  const result = category.slug === 'bong-ro' && seo.role === 'parent'
    ? await getProductsWithDeferredCategories({
      categorySlugs,
      deferredCategorySlugs: ['logo-bong-ro'],
      page,
      sort,
    })
    : await getProductsPage({ categorySlugs, page, limit: PRODUCTS_PER_PAGE, sort })
  const intro = truncateText(seo.intro, 320)
  if (page > 1 && (result.totalPages === 0 || page > result.totalPages)) notFound()
  const categoryGroup = seo.parent || { slug: category.slug, name: category.name }
  const breadcrumbs = seo.parent
    ? [
      { name: 'Trang chủ', path: '/' },
      { name: seo.parent.name, path: `/danh-muc/${seo.parent.slug}/` },
      { name: category.name, path: `/danh-muc/${category.slug}/` },
    ]
    : [{ name: 'Trang chủ', path: '/' }, { name: category.name, path: `/danh-muc/${category.slug}/` }]
  return (
    <div className="page-shell">
      <JsonLd data={breadcrumbSchema(breadcrumbs)} />
      <SiteHeader />
      <main id="noi-dung" className="catalog-page">
        <section className="catalog-banner category-catalog-banner category-banner-plain" style={{ '--tone': category.tone } as React.CSSProperties}>
          <div><p>Trang chủ / Danh mục</p><h1>{category.name}</h1>{intro && <span>{intro}</span>}</div>
        </section>
        <div className="catalog-body site-container">
          {seo.siblings.length > 0 && (
            <nav className="subcategory-links" aria-label={`Danh mục con ${categoryGroup.name}`}>
              <Link className={seo.role === 'parent' ? 'active' : undefined} href={`/danh-muc/${categoryGroup.slug}/`}>Tất cả {categoryGroup.name}</Link>
              {seo.siblings.map((child) => (
                <Link className={child.slug === category.slug ? 'active' : undefined} href={`/danh-muc/${child.slug}/`} key={child.slug}>{child.name}</Link>
              ))}
            </nav>
          )}
          <div className="catalog-toolbar">
            <strong>{result.totalDocs} sản phẩm</strong>
            <form className="catalog-sort">
              <label htmlFor="sort">Sắp xếp</label>
              <select id="sort" name="sort" defaultValue={search.sort || 'newest'}>
                <option value="newest">Mới nhất</option>
                <option value="price">Giá thấp đến cao</option>
                <option value="price-desc">Giá cao đến thấp</option>
              </select>
              <button type="submit">Áp dụng</button>
            </form>
          </div>
          {result.products.length > 0
            ? <div className="product-grid catalog-grid">{result.products.map((product, index) => <ProductCard product={product} headingLevel={2} imagePriority={index < 2} key={product.slug} />)}</div>
            : <section className="catalog-no-results" role="status"><h2>Danh mục đang được cập nhật</h2><p>Sản phẩm mới sẽ sớm xuất hiện tại đây.</p><Link href="/san-pham/">Xem tất cả sản phẩm</Link></section>}
          <Pagination basePath={`/danh-muc/${category.slug}/`} page={page} totalPages={result.totalPages} params={{ sort: search.sort }} />
        </div>
      </main>
      <PageFooter />
      <FloatingContact />
    </div>
  )
}
