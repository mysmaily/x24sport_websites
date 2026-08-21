import type { Metadata } from 'next'
import { Search } from 'lucide-react'
import { HeaderSearch } from '../_components/header-search'
import { SiteFooter } from '../_components/site-footer'
import { formatPrice, searchProducts, type Product } from '../lib/content'

type SearchParams = { q?: string }

const FALLBACK_IMAGE = '/images/mayaobongchuyen/images/volleyball-team-hero.png'

function productImage(product: Product) {
  return product.gallery?.find((image) => image.url)?.url || FALLBACK_IMAGE
}

function productAlt(product: Product) {
  return product.gallery?.find((image) => image.url)?.alt || `${product.name} đặt may cho đội bóng chuyền`
}

function productSize(product: Product) {
  const image = product.gallery?.find((item) => item.url)
  return { height: image?.height || 900, width: image?.width || 1200 }
}

export async function generateMetadata({ searchParams }: { searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const params = await searchParams
  const query = params.q?.trim() || ''
  return {
    title: query ? `Tìm mẫu áo bóng chuyền: ${query}` : 'Tìm kiếm mẫu áo bóng chuyền',
    description: 'Tìm mẫu áo bóng chuyền theo tên sản phẩm, màu sắc và tag ảnh sản phẩm.',
    alternates: { canonical: '/tim-kiem' },
    robots: query ? { index: false, follow: true } : undefined,
  }
}

export default async function SearchPage({ searchParams }: { searchParams: Promise<SearchParams> }) {
  const params = await searchParams
  const query = params.q?.trim() || ''
  const products = await searchProducts(query)

  return (
    <main>
      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b-[3px] border-[var(--accent)] bg-[#080909] px-4 shadow-[0_10px_28px_rgba(0,0,0,.22)] md:h-[82px] md:px-[clamp(20px,5vw,92px)]">
        <a className="flex min-w-0 items-center gap-3 uppercase md:min-w-[330px]" href="/">
          <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-white/90 bg-[linear-gradient(135deg,var(--accent),#911410)] text-[13px] font-black text-white md:h-11 md:w-11">VB</span>
          <span className="inline-flex flex-col justify-center leading-[0.92]"><strong className="text-base font-black italic text-white md:text-[clamp(16px,1.25vw,22px)]">MAYAOBONGCHUYEN</strong><small className="hidden text-[13px] font-black tracking-[0.08em] text-[var(--accent)] md:block">.VN</small></span>
        </a>
        <HeaderSearch />
      </header>
      <section className="px-[clamp(20px,5vw,76px)] py-[44px]">
        <p className="mb-3 text-xs font-black uppercase text-[var(--accent)]">Tìm kiếm sản phẩm</p>
        <h1 className="max-w-[980px] text-[clamp(38px,6vw,76px)] font-black leading-[0.92]">{query ? `Kết quả tìm kiếm: ${query}` : 'Tìm mẫu áo bóng chuyền'}</h1>
        <form action="/tim-kiem" className="mt-6 grid max-w-3xl grid-cols-[auto_1fr_auto] overflow-hidden border border-[var(--line)] bg-white" role="search">
          <Search className="ml-3 self-center text-[#555]" size={18} />
          <label className="sr-only" htmlFor="search-q">Từ khóa</label>
          <input className="min-h-12 min-w-0 px-3 text-[#111] outline-none focus-visible:ring-2 focus-visible:ring-[var(--accent)]" id="search-q" name="q" defaultValue={query} placeholder="Tên mẫu, màu áo, tag ảnh…" type="search" />
          <button className="bg-[var(--accent)] px-5 font-black text-white" type="submit">Tìm</button>
        </form>
      </section>
      <section className="grid gap-5 px-[clamp(20px,5vw,76px)] pb-[72px] md:grid-cols-2 xl:grid-cols-3">
        {products.map((product, index) => (
          <article className="mbc-product-card border border-[var(--line)] bg-white/6" key={product.id}>
            <a className="mbc-product-card-media mbc-product-card-media-compact" href={product.slug ? `/san-pham/${product.slug}/` : '/lien-he'}>
              <img alt={productAlt(product)} className="mbc-product-card-image" height={productSize(product).height} loading={index < 2 ? 'eager' : 'lazy'} src={productImage(product)} width={productSize(product).width} />
              <span className="mbc-product-card-badge">{String(index + 1).padStart(2, '0')}</span>
            </a>
            <div className="p-[22px]"><p className="mb-2 text-xs font-black text-[var(--accent)]">{product.sku}</p><h2 className="mb-2.5 text-[23px]"><a href={product.slug ? `/san-pham/${product.slug}/` : '/lien-he'}>{product.name}</a></h2><span className="leading-[1.55] text-[var(--muted)]">{product.shortDescription}</span><strong className="mt-4 block text-2xl">{formatPrice(product.price)}</strong></div>
          </article>
        ))}
        {!products.length ? <p className="border border-dashed border-[var(--line)] p-8 text-[var(--muted)]">Chưa tìm thấy mẫu phù hợp. Hãy thử tên mẫu, màu áo hoặc tag ảnh ngắn hơn.</p> : null}
      </section>
      <SiteFooter />
    </main>
  )
}
