import { ArrowRight, MessageCircle, Phone } from 'lucide-react'
import Link from 'next/link'

import { ProductInterestForm } from '../../../_components/product-interest-form'
import { JsonLd } from './json-ld'
import { ProductGallery } from './product-gallery'
import { ProductGrid } from './product-grid'
import { ProductViewTracker } from './product-view-tracker'
import { getProductImages, hasProductInterestForm, type Product, type ProductCategory } from '../lib/cms'
import { canonical, excerpt, PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '../lib/site'

function categoryPath(category: ProductCategory) {
  if (category.slug === 'bo-quan-ao-bong-ro') return '/san-pham/'
  if (category.slug === 'logo-doi-bong-ro') return '/logo-team/'
  return `/san-pham/${category.slug}/`
}

function productBreadcrumbCategory(product: Product) {
  const categories = (product.categories || []).filter(
    (category): category is ProductCategory => typeof category === 'object',
  )
  return categories[0]
}

export async function ProductDetailPage({
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
  const images = getProductImages(product)
  const productPath = `/san-pham/${product.slug}/`
  const showInterestForm = await hasProductInterestForm()
  const breadcrumbCategory = productBreadcrumbCategory(product)
  const breadcrumbItems = [
    { name: 'Trang chủ', item: canonical('/') },
    { name: 'Sản Phẩm', item: canonical('/san-pham/') },
    ...(breadcrumbCategory ? [{ name: breadcrumbCategory.name, item: canonical(categoryPath(breadcrumbCategory)) }] : []),
    { name: product.name, item: canonical(productPath) },
  ]

  return (
    <>
      <ProductViewTracker
        itemCategory="basketball"
        name={product.name}
        price={product.price}
        productId={product.id}
        tenantSlug="mayaobongro"
      />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'Product', name: product.name, description: excerpt(product.shortDescription || product.name, 300), image: images.map((item) => item.url), url: canonical(productPath), brand: { '@type': 'Brand', name: 'May Áo Bóng Rổ' } }} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbItems.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })) }} />
      <article className="section-shell pb-16 sm:pb-22">
        <nav className="flex gap-2 overflow-hidden py-5 text-xs text-slate-500" aria-label="Đường dẫn"><Link className="shrink-0 hover:text-brand" href="/">Trang chủ</Link><span className="shrink-0">/</span><Link className="shrink-0 hover:text-brand" href="/san-pham/">Sản Phẩm</Link>{breadcrumbCategory ? <><span className="shrink-0">/</span><Link className="shrink-0 hover:text-brand" href={categoryPath(breadcrumbCategory)}>{breadcrumbCategory.name}</Link></> : null}<span className="shrink-0">/</span><span className="truncate text-slate-700">{product.name}</span></nav>
        <h1 className="mb-5 font-display text-[20px] font-bold leading-tight tracking-[-.01em] text-slate-950 lg:text-[22px]">{product.name}</h1>

        <div className="grid overflow-hidden rounded-3xl border border-slate-200 bg-white lg:grid-cols-[1.15fr_.85fr]">
          <ProductGallery images={images} key={product.id} productName={product.name} />

          <div className="flex flex-col p-6 sm:p-9 lg:p-12">
            <p className="section-kicker">{isLogo ? 'Mẫu logo team bóng rổ' : 'Mẫu đồng phục bóng rổ'}</p>
            {product.shortDescription ? <p className="mt-5 text-base leading-7 text-slate-600">{product.shortDescription}</p> : null}

            <div className="mt-8 grid gap-3 rounded-2xl bg-orange-50 p-5 text-sm text-slate-700">
              <b className="text-base text-slate-950">Có thể thiết kế theo yêu cầu</b>
              <p>Trao đổi màu sắc, logo, tên và số trước khi xác nhận đặt may.</p>
              <ul className="grid gap-2 font-bold sm:grid-cols-2 lg:grid-cols-1 xl:grid-cols-2">
                {['Đổi màu theo đội', 'Thêm logo riêng', 'In tên và số', 'Tư vấn size'].map((item) => <li className="flex items-center gap-2" key={item}><span className="size-1.5 rounded-full bg-brand" /> {item}</li>)}
              </ul>
            </div>

            <div className="mt-auto grid gap-3 pt-8">
              <a className="inline-flex min-h-13 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle size={19} /> Gửi mẫu này qua Zalo</a>
              <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-slate-300 px-5 text-sm font-black text-slate-950 transition hover:border-brand hover:text-brand" href={`tel:${PHONE_VALUE}`}><Phone size={18} /> Gọi {PHONE_DISPLAY}</a>
            </div>
            {showInterestForm ? <ProductInterestForm productName={product.name} productUrl={canonical(productPath)} variant="utility" /> : null}
          </div>
        </div>

        {product.contentHtml ? (
          <section className="grid gap-8 py-14 sm:py-20 lg:grid-cols-[240px_minmax(0,1fr)] lg:gap-16">
            <div className="self-start border-t-2 border-slate-950 pt-4 text-xs font-black uppercase tracking-wider text-slate-500 lg:sticky lg:top-28"><span>Thông tin mẫu</span><b className="mt-2 block text-brand">Details / {product.slug.slice(-10)}</b></div>
            <div className="prose" dangerouslySetInnerHTML={{ __html: product.contentHtml }} />
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
