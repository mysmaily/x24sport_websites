import { ArrowRight, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'

import { JsonLd } from '@/components/json-ld'
import { ProductGallery } from '@/components/product-gallery'
import { ProductGrid } from '@/components/product-grid'
import { productImages, type Product } from '@/lib/cms'
import { canonical, excerpt, PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '@/lib/site'
import { rewriteLegacyHtml } from '@/lib/legacy-content'

export function ProductDetailPage({
  catalogHref,
  catalogLabel,
  isLogo,
  product,
  related,
}: {
  catalogHref: string
  catalogLabel: string
  isLogo: boolean
  product: Product
  related: Product[]
}) {
  const images = productImages(product)
  const productPath = product.legacyPath || `/${product.slug}/`
  const hasPrice = !isLogo && typeof product.price === 'number' && product.price > 0
  const productSchema = hasPrice ? { '@context': 'https://schema.org', '@type': 'Product', name: product.name, sku: product.sku || undefined, description: excerpt(product.shortDescription || product.name, 300), image: images.map((item) => item.url), url: canonical(productPath), brand: { '@type': 'Brand', name: 'X24 Sport' }, offers: { '@type': 'Offer', priceCurrency: 'VND', price: product.price, availability: product.stockStatus === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock', url: canonical(productPath) } } : null

  return (
    <>
      {productSchema ? <JsonLd data={productSchema} /> : null}
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: canonical('/') }, { '@type': 'ListItem', position: 2, name: catalogLabel, item: canonical(catalogHref) }, { '@type': 'ListItem', position: 3, name: product.name, item: canonical(productPath) }] }} />
      <article className="section-shell pb-16 sm:pb-22">
        <nav className="flex gap-2 overflow-hidden py-4 text-xs text-slate-500" aria-label="Đường dẫn"><Link className="hover:text-brand" href="/">Trang chủ</Link><span>/</span><Link className="hover:text-brand" href={catalogHref}>{catalogLabel}</Link><span>/</span><span className="truncate text-slate-700">{product.name}</span></nav>
        <h1 className="pb-4 font-display text-xl font-bold leading-tight tracking-[-.01em] text-slate-950 lg:text-[22px]">{product.name}</h1>

        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white lg:grid-cols-[1.15fr_.85fr]">
          <ProductGallery images={images} key={product.id} productName={product.name} />

          <div className="flex flex-col p-5 sm:p-7 lg:p-8 xl:p-10">
            <p className="section-kicker">{isLogo ? 'Thiết kế logo đội chạy' : 'Mẫu áo chạy bộ'}</p>
            {product.shortDescription ? <p className="text-base leading-7 text-slate-600">{product.shortDescription}</p> : null}
            {hasPrice ? <p className="mt-4 text-sm font-bold text-slate-600">Giá tham khảo: <strong className="text-xl text-brand">{product.price!.toLocaleString('vi-VN')} ₫</strong></p> : null}

            <div className="mt-6 grid gap-2 rounded-2xl bg-orange-50 p-4 text-sm text-slate-700">
              <b className="text-base text-slate-950">Có thể thiết kế theo yêu cầu</b>
              <p>Trao đổi màu sắc, logo, tên đội và thông tin cự ly trước khi xác nhận đặt may.</p>
              <ul className="grid gap-2 font-bold sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {['Đổi màu theo đội', 'Thêm logo riêng', 'In tên & cự ly', 'Tư vấn size'].map((item) => <li className="flex items-center gap-2" key={item}><span className="size-1.5 rounded-full bg-brand" /> {item}</li>)}
              </ul>
            </div>

            <div className="mt-auto grid gap-3 pt-6">
              <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle size={19} /> Gửi mẫu này qua Zalo</a>
              <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 text-sm font-black text-slate-950 transition hover:border-brand hover:text-brand" href={`tel:${PHONE_VALUE}`}><Phone size={18} /> Gọi {PHONE_DISPLAY}</a>
            </div>
          </div>
        </div>

        {product.contentHtml ? (
          <section className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
            <div className="self-start border-t-2 border-slate-950 pt-4 text-xs font-black uppercase tracking-wider text-slate-500 lg:sticky lg:top-28"><span>Thông tin mẫu</span><b className="mt-2 block text-brand">Details / {product.slug.slice(-10)}</b></div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: rewriteLegacyHtml(product.contentHtml) }} />
          </section>
        ) : null}
      </article>

      <section className="border-t border-slate-200 bg-white py-16 sm:py-22">
        <div className="section-shell">
          <div className="flex flex-col gap-5 sm:flex-row sm:items-end sm:justify-between"><div><p className="section-kicker">Tiếp tục khám phá</p><h2 className="section-title">Mẫu mới cập nhật.</h2></div><Link className="inline-flex min-h-11 items-center gap-2 self-start text-sm font-black text-brand" href={catalogHref}>Tất cả {catalogLabel.toLocaleLowerCase('vi-VN')} <ArrowRight size={18} /></Link></div>
          <div className="mt-9"><ProductGrid products={related.filter((item) => item.id !== product.id).slice(0, 4)} /></div>
        </div>
      </section>
    </>
  )
}
