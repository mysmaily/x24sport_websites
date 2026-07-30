import type { Metadata } from 'next'
import Link from 'next/link'
import { Search } from 'lucide-react'
import { Pagination } from '../_components/pagination'
import { ProductCard } from '../_components/product-card'
import { SiteHeader } from '../_components/site-header'
import { FloatingContact, PageFooter } from '../_components/store-footer'
import { getProductsPage } from '../../lib/content'

type SearchParams = { page?: string; q?: string }

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams
  const query = params.q?.trim() || ''
  return {
    title: query ? `Tìm kiếm sản phẩm: ${query}` : 'Tìm kiếm sản phẩm',
    description: 'Tìm sản phẩm X24Sport theo tên mẫu, màu sắc và tag ảnh sản phẩm.',
    alternates: { canonical: '/tim-kiem/' },
    robots: query ? { index: false, follow: true } : undefined,
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const query = params.q?.trim() || ''
  const page = Math.max(1, Number(params.page) || 1)
  const result = query ? await getProductsPage({ page, limit: 20, query }) : { products: [], totalDocs: 0, totalPages: 1, page: 1 }

  return (
    <div className="page-shell">
      <SiteHeader />
      <main id="noi-dung" className="catalog-page">
        <section className="catalog-banner">
          <div><p>Trang chủ / Tìm kiếm</p><h1>{query ? `Kết quả tìm kiếm: ${query}` : 'Tìm kiếm sản phẩm'}</h1></div>
          <form action="/tim-kiem" role="search">
            <label className="sr-only" htmlFor="search-q">Từ khóa</label>
            <input id="search-q" name="q" type="search" defaultValue={query} placeholder="Tên mẫu, màu áo, tag ảnh..." />
            <button type="submit" aria-label="Tìm kiếm"><Search size={18} /></button>
          </form>
        </section>
        <div className="catalog-body site-container">
          <div className="catalog-count"><span>{query ? `Đang tìm theo "${query}"` : 'Nhập từ khóa để tìm mẫu áo'}</span><strong>{result.totalDocs} sản phẩm</strong></div>
          {result.products.length > 0
            ? <div className="product-grid catalog-grid">{result.products.map((product, index) => <ProductCard product={product} headingLevel={2} imagePriority={index < 2} key={product.slug} />)}</div>
            : <section className="catalog-no-results" role="status"><h2>Chưa tìm thấy sản phẩm phù hợp</h2><p>Thử tên mẫu, màu áo hoặc tag ảnh ngắn hơn.</p><Link href="/san-pham/">Xem tất cả sản phẩm</Link></section>}
          {query ? <Pagination basePath="/tim-kiem/" page={page} totalPages={result.totalPages} params={{ q: query }} /> : null}
        </div>
      </main>
      <PageFooter />
      <FloatingContact />
    </div>
  )
}
