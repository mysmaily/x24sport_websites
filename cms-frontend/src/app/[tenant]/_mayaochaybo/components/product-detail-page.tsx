import { ArrowRight, ChevronDown, MessageCircle, Phone, Ruler, Sparkles, TimerReset } from 'lucide-react'
import Link from 'next/link'

import { JsonLd } from './json-ld'
import { ProductInterestForm } from './product-interest-form'
import { ProductGallery } from './product-gallery'
import { ProductGrid } from './product-grid'
import { ProductViewTracker } from './product-view-tracker'
import { hasProductInterestForm, productImages, productPath, type Product, type ProductCategory } from '../lib/cms'
import { canonical, excerpt, PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '../lib/site'
import { rewriteLegacyHtml } from '../lib/legacy-content'

function categoryPath(category: ProductCategory) {
  return category.legacyPath || `/${category.slug}/`
}

function productBreadcrumbCategory(product: Product) {
  const categories = (product.categories || []).filter(
    (category): category is ProductCategory => typeof category === 'object',
  )
  return categories.find((category) => category.group === 'type') || categories[0]
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
  const images = productImages(product)
  const productHref = productPath(product)
  const hasPrice = !isLogo && typeof product.price === 'number' && product.price > 0
  const showInterestForm = await hasProductInterestForm()
  const breadcrumbCategory = productBreadcrumbCategory(product)
  const breadcrumbItems = [
    { name: 'Trang chủ', item: canonical('/') },
    { name: 'Sản Phẩm', item: canonical(catalogHref) },
    ...(breadcrumbCategory ? [{ name: breadcrumbCategory.name, item: canonical(categoryPath(breadcrumbCategory)) }] : []),
    { name: product.name, item: canonical(productHref) },
  ]
  const productSchema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    '@id': `${canonical(productHref)}#product`,
    name: product.name,
    sku: product.sku || undefined,
    description: excerpt(product.shortDescription || product.name, 300),
    image: images.map((item) => item.url),
    url: canonical(productHref),
    brand: { '@type': 'Brand', name: 'May Áo Chạy Bộ' },
    offers: hasPrice ? {
      '@type': 'Offer',
      availability: product.stockStatus === 'out_of_stock' ? 'https://schema.org/OutOfStock' : 'https://schema.org/InStock',
      itemCondition: 'https://schema.org/NewCondition',
      price: product.price,
      priceCurrency: 'VND',
      url: canonical(productHref),
    } : undefined,
  }
  const quickFacts = [
    { icon: Sparkles, label: 'Đổi màu, logo, tên đội' },
    { icon: Ruler, label: 'Tư vấn size trước khi may' },
    { icon: TimerReset, label: 'Duyệt maket trước sản xuất' },
  ]
  const processItems = ['Gửi mẫu hoặc logo', 'Chọn số lượng & size', 'Duyệt maket', 'Sản xuất & giao hàng']

  return (
    <>
      <ProductViewTracker
        itemCategory="running"
        name={product.name}
        price={product.price}
        productId={product.id}
        sku={product.sku}
        tenantSlug="mayaochaybo"
      />
      <JsonLd data={productSchema} />
      <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: breadcrumbItems.map((item, index) => ({ '@type': 'ListItem', position: index + 1, ...item })) }} />
      <article className="section-shell pb-12 sm:pb-18">
        <nav className="flex gap-2 overflow-hidden py-3 text-xs text-slate-500 sm:py-4" aria-label="Đường dẫn"><Link className="shrink-0 hover:text-brand" href="/">Trang chủ</Link><span className="shrink-0">/</span><Link className="shrink-0 hover:text-brand" href={catalogHref}>Mẫu áo</Link>{breadcrumbCategory ? <><span className="hidden shrink-0 sm:inline">/</span><Link className="hidden shrink-0 hover:text-brand sm:inline" href={categoryPath(breadcrumbCategory)}>{breadcrumbCategory.name}</Link></> : null}<span className="shrink-0">/</span><span className="truncate text-slate-700">{product.name}</span></nav>
        <h1 className="line-clamp-2 pb-3 font-display text-[22px] font-bold leading-[1.08] tracking-tight text-slate-950 sm:pb-4 lg:text-[28px]">{product.name}</h1>

        <div className="grid overflow-hidden rounded-xl border border-slate-200 bg-white lg:grid-cols-[1.15fr_.85fr]">
          <ProductGallery images={images} key={product.id} productName={product.name} />

          <div className="flex flex-col p-4 sm:p-6 lg:p-7 xl:p-8">
            {hasPrice ? <p className="text-sm font-bold text-slate-600">Giá tham khảo <strong className="ml-1 text-xl text-brand">{product.price!.toLocaleString('vi-VN')} ₫</strong></p> : <p className="text-sm font-bold text-slate-600">Mẫu tham khảo, nhận báo giá theo số lượng</p>}
            {product.shortDescription ? <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{product.shortDescription}</p> : null}

            <div className="mt-4 grid grid-cols-2 gap-2">
              <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand px-3 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle aria-hidden="true" size={18} /> Zalo</a>
              <a className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg border border-slate-300 px-3 text-sm font-black text-slate-950 transition hover:border-brand hover:text-brand" href={`tel:${PHONE_VALUE}`}><Phone aria-hidden="true" size={17} /> Gọi</a>
            </div>
            <ul className="mt-4 grid gap-2 text-xs font-bold text-slate-700 sm:grid-cols-3 lg:grid-cols-1 xl:grid-cols-3">
              {quickFacts.map(({ icon: Icon, label }) => <li className="flex min-h-10 items-center gap-2 rounded-lg bg-orange-50 px-3" key={label}><Icon aria-hidden="true" className="shrink-0 text-brand" size={15} />{label}</li>)}
            </ul>
            <details className="mt-4 rounded-xl border border-slate-200 bg-slate-50">
              <summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-black text-slate-950 [&::-webkit-details-marker]:hidden">Quy trình đặt may <ChevronDown aria-hidden="true" size={16} /></summary>
              <ol className="grid gap-2 border-t border-slate-200 p-4 text-sm text-slate-700">
                {processItems.map((item, index) => <li className="flex items-center gap-2" key={item}><span className="grid size-5 shrink-0 place-items-center rounded-full bg-brand text-[10px] font-black text-white">{index + 1}</span>{item}</li>)}
              </ol>
            </details>
            {showInterestForm ? <details className="mt-3 rounded-xl border border-slate-200 bg-white"><summary className="flex min-h-11 cursor-pointer list-none items-center justify-between px-4 text-sm font-black text-slate-950 [&::-webkit-details-marker]:hidden">Để lại số điện thoại <ChevronDown aria-hidden="true" size={16} /></summary><div className="border-t border-slate-200 p-4"><ProductInterestForm productName={product.name} productUrl={canonical(productHref)} /></div></details> : null}
          </div>
        </div>

        {product.contentHtml ? (
          <section className="py-8 sm:py-12">
            <details className="rounded-xl border border-slate-200 bg-white" open={false}>
              <summary className="flex min-h-12 cursor-pointer list-none items-center justify-between px-4 text-sm font-black text-slate-950 sm:px-5 [&::-webkit-details-marker]:hidden">
                <span>Thông tin chi tiết mẫu áo</span>
                <ChevronDown aria-hidden="true" size={18} />
              </summary>
              <div className="prose border-t border-slate-200 p-4 sm:p-6" dangerouslySetInnerHTML={{ __html: rewriteLegacyHtml(product.contentHtml) }} />
            </details>
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
