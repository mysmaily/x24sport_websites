import type { Metadata } from 'next'
import { Search } from 'lucide-react'
import { SiteHeader } from '../_components/site-header'
import { SiteFooter } from '../_components/site-footer'
import { fallbackNavigation, formatPrice, productHref, searchProducts, type Product } from '../lib/content'

type SearchParams = { q?: string }

const FALLBACK_IMAGE = '/images/mayaobongchuyen/images/volleyball-team-hero.png'

function productImage(product: Product) {
  return product.gallery?.find((image) => image.url)?.url || FALLBACK_IMAGE
}

function productAlt(product: Product) {
  return product.gallery?.find((image) => image.url)?.alt || `${product.name} đặt may cho đội bóng chuyền`
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams
  const query = params.q?.trim() || ''
  return {
    title: query ? `Tìm mẫu áo bóng chuyền: ${query}` : 'Tìm kiếm mẫu áo bóng chuyền',
    description: 'Tìm mẫu áo bóng chuyền theo tên sản phẩm, màu sắc và tag ảnh sản phẩm.',
    alternates: { canonical: '/tim-kiem/' },
    robots: { index: false, follow: true },
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const query = params.q?.trim() || ''
  const products = await searchProducts(query)

  return (
    <main>
      <SiteHeader legacyNavigation={fallbackNavigation} />
      <section className="mbc-search-header px-[clamp(20px,5vw,76px)]">
        <p className="mb-3 text-xs font-black uppercase text-[var(--accent)]">Tìm kiếm sản phẩm</p>
        <h1 className="mbc-search-title max-w-[980px] font-black">{query ? `Kết quả tìm kiếm: ${query}` : 'Tìm mẫu áo bóng chuyền'}</h1>
        <form action="/tim-kiem/" className="mbc-search-form grid max-w-3xl grid-cols-[auto_1fr_auto] overflow-hidden border border-[var(--line)] bg-white" role="search">
          <Search aria-hidden="true" className="ml-3 self-center text-[#555]" size={18} />
          <label className="sr-only" htmlFor="search-q">Từ khóa</label>
          <input autoComplete="off" className="min-h-12 min-w-0 px-3 text-[#111]" id="search-q" name="q" defaultValue={query} placeholder="Tên mẫu, màu áo, tag ảnh…" type="search" />
          <button className="bg-[var(--accent)] px-5 font-black text-white" type="submit">Tìm</button>
        </form>
      </section>
      <section className="grid gap-5 px-[clamp(20px,5vw,76px)] pb-[72px] md:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => (
          <article className="mbc-product-card border border-[var(--line)] bg-white/6" key={product.id}>
            <a className="mbc-product-card-media mbc-product-card-media-compact" href={productHref(product)}>
              <img alt={productAlt(product)} className="mbc-product-card-image" height={product.gallery?.find((image) => image.url)?.height || 941} loading={index < 2 ? 'eager' : 'lazy'} src={productImage(product)} width={product.gallery?.find((image) => image.url)?.width || 1672} />
              <span className="mbc-product-card-badge">{String(index + 1).padStart(2, '0')}</span>
            </a>
            <div className="p-[22px]"><p className="mb-2 text-xs font-black text-[var(--accent)]">{product.sku}</p><h2 className="mbc-product-card-title mb-2.5"><a href={productHref(product)}>{product.name}</a></h2><span className="leading-[1.55] text-[var(--muted)]">{product.shortDescription}</span><strong className="mt-4 block text-2xl">{formatPrice(product.price)}</strong></div>
          </article>
        ))}
        {!products.length ? <p className="border border-dashed border-[var(--line)] p-8 text-[var(--muted)]">Chưa tìm thấy mẫu phù hợp. Hãy thử tên mẫu, màu áo hoặc tag ảnh ngắn hơn.</p> : null}
      </section>
      <SiteFooter />
    </main>
  )
}
