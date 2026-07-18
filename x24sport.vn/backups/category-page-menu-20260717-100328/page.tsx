import type { Metadata } from 'next'
import Image from 'next/image'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '../../_components/json-ld'
import { Pagination } from '../../_components/pagination'
import { ProductCard } from '../../_components/product-card'
import { SiteHeader } from '../../_components/site-header'
import { getCategories, getCategory, getProductsPage } from '../../../lib/content'
import { breadcrumbSchema, metadataDescription, pageCanonical, pageTitle, truncateText } from '../../../lib/seo'

export async function generateStaticParams() { return (await getCategories()).map(({ slug }) => ({ slug })) }
export async function generateMetadata({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ page?: string; sort?: string }> }): Promise<Metadata> {
  const category = await getCategory((await params).slug)
  if (!category) return { title: 'Không tìm thấy danh mục' }
  const search = await searchParams
  const page = Math.max(1, Number(search.page) || 1)
  const title = pageTitle(`Sản phẩm ${category.name}`, search.sort ? 1 : page)
  return {
    title, description: metadataDescription(category.description, `Sản phẩm ${category.name} thiết kế theo yêu cầu tại X24Sport.`),
    alternates: { canonical: search.sort ? `/danh-muc/${category.slug}/` : pageCanonical(`/danh-muc/${category.slug}`, page) },
    robots: search.sort ? { index: false, follow: true } : undefined,
    openGraph: { title, description: metadataDescription(category.description), url: pageCanonical(`/danh-muc/${category.slug}`, page) },
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
  const result = await getProductsPage({ categorySlug: category.slug, page, limit: 20, sort })
  if (page > 1 && (result.totalPages === 0 || page > result.totalPages)) notFound()
  return (
    <div className="page-shell">
      <JsonLd data={breadcrumbSchema([{ name: 'Trang chủ', path: '/' }, { name: category.name, path: `/danh-muc/${category.slug}/` }])} />
      <SiteHeader />
      <main id="noi-dung" className="catalog-page">
        <section className="catalog-banner category-catalog-banner" style={{ '--tone': category.tone } as React.CSSProperties}>
          <Image src={category.image} alt="" fill sizes="100vw" preload quality={72} />
          <div><p>Trang chủ / Danh mục</p><h1>Sản phẩm {category.name}</h1></div>
          <form>
            <label htmlFor="sort">Sắp xếp</label>
            <select id="sort" name="sort" defaultValue={search.sort || 'newest'}>
              <option value="newest">Mới nhất</option>
              <option value="price">Giá thấp đến cao</option>
              <option value="price-desc">Giá cao đến thấp</option>
            </select>
            <button type="submit">Áp dụng</button>
          </form>
        </section>
        <div className="catalog-body site-container">
          <div className="catalog-count"><span>{truncateText(category.description, 260)}</span><strong>{result.totalDocs} sản phẩm</strong></div>
          {result.products.length > 0
            ? <div className="product-grid catalog-grid">{result.products.map((product, index) => <ProductCard product={product} headingLevel={2} imagePriority={index < 2} key={product.slug} />)}</div>
            : <section className="catalog-no-results" role="status"><h2>Danh mục đang được cập nhật</h2><p>Sản phẩm mới sẽ sớm xuất hiện tại đây.</p><Link href="/san-pham/">Xem tất cả sản phẩm</Link></section>}
          <Pagination basePath={`/danh-muc/${category.slug}/`} page={page} totalPages={result.totalPages} params={{ sort: search.sort }} />
        </div>
      </main>
    </div>
  )
}
