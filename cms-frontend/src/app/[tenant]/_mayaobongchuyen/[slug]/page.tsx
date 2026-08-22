import { ArrowLeft, ArrowUpRight, ShieldCheck } from 'lucide-react'
import { notFound, permanentRedirect } from 'next/navigation'
import { SiteHeader } from '../_components/site-header'
import { SiteFooter } from '../_components/site-footer'
import { fallbackNavigation, formatPrice, getPageData, getProductBySlug, productHref, type Product } from '../lib/content'

type RouteProps = {
  params: Promise<{ slug: string }>
}

const defaultOgImage = {
  url: '/images/mayaobongchuyen/images/volleyball-team-hero.png',
  width: 1672,
  height: 941,
  alt: 'Đội bóng chuyền mặc đồng phục đặt may MayaoBongChuyen',
}

function productImage(product: Product) {
  return product.gallery?.find((image) => image.url)?.url || defaultOgImage.url
}

function productAlt(product: Product) {
  return product.gallery?.find((image) => image.url)?.alt || `${product.name} đặt may cho đội bóng chuyền`
}

export async function generateMetadata({ params }: RouteProps) {
  const { slug } = await params
  const { page, tenant } = await getPageData(slug)

  if (!page) return {}

  return {
    title: `${page.title} | ${tenant.name}`,
    description: page.heroText,
    alternates: { canonical: `/${slug}/` },
    openGraph: {
      title: `${page.title} | ${tenant.name}`,
      description: page.heroText,
      images: [defaultOgImage],
      type: 'website',
      url: `/${slug}/`,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${page.title} | ${tenant.name}`,
      description: page.heroText,
      images: [defaultOgImage.url],
    },
  }
}

export default async function CmsPage({ params }: RouteProps) {
  const { slug } = await params
  const data = await getPageData(slug)
  const { page, products } = data

  if (!page) {
    const product = await getProductBySlug(slug)
    if (product) permanentRedirect(`/san-pham/${product.slug || slug}/`)
    notFound()
  }

  return (
    <main>
      <SiteHeader legacyNavigation={fallbackNavigation} />

      <section className="mbc-content-hero border-b border-[var(--line)] px-[clamp(20px,5vw,76px)]">
        <a className="mbc-content-back inline-flex items-center gap-2 text-sm text-[var(--muted)]" href="/">
          <ArrowLeft aria-hidden="true" size={18} />
          Trang chủ
        </a>
        <p className="mbc-content-kicker text-xs font-black uppercase text-[var(--accent)]">May áo bóng chuyền</p>
        <h1 className="mbc-content-title max-w-[980px] font-black">{page.heroTitle}</h1>
        <p className="mbc-content-description max-w-[720px] text-[var(--muted)]">{page.heroText}</p>
        <a className="mbc-content-cta inline-flex min-h-11 items-center gap-2 border border-[var(--accent)] bg-[var(--accent)] px-[18px] font-black text-white" href="/lien-he/">
          Nhận tư vấn <ArrowUpRight aria-hidden="true" size={18} />
        </a>
      </section>

      <section className="mbc-content-products px-[clamp(20px,5vw,76px)]">
        <div className="mbc-content-products-header flex flex-col justify-between md:flex-row">
          <div>
            <p className="mbc-content-kicker text-xs font-black uppercase text-[var(--accent)]">Mẫu tham khảo</p>
            <h2 className="mbc-content-products-heading max-w-[820px]">Mẫu áo bóng chuyền nổi bật</h2>
          </div>
        </div>
        <div className="grid gap-[18px] md:grid-cols-2 xl:grid-cols-3">
          {products.slice(0, 3).map((product, index) => (
            <article className="mbc-product-card border border-[var(--line)] bg-white/6" key={product.id}>
              <a className="mbc-product-card-media" href={productHref(product)}>
                <img alt={productAlt(product)} className="mbc-product-card-image" height={product.gallery?.find((image) => image.url)?.height || 941} loading={index < 2 ? 'eager' : 'lazy'} src={productImage(product)} width={product.gallery?.find((image) => image.url)?.width || 1672} />
                <span className="mbc-product-card-badge"><ShieldCheck aria-hidden="true" size={18} /> {String(index + 7).padStart(2, '0')}</span>
              </a>
              <div className="p-[22px]">
                <p className="mb-2 text-xs font-black text-[var(--accent)]">{product.sku}</p>
                <h3 className="mbc-product-card-title mb-2.5"><a href={productHref(product)}>{product.name}</a></h3>
                <span className="leading-[1.55] text-[var(--muted)]">{product.shortDescription}</span>
                <strong className="mt-4 block text-2xl">{formatPrice(product.price)}</strong>
              </div>
            </article>
          ))}
        </div>
      </section>
      <section className="mbc-content-info grid grid-cols-1 gap-px border-t border-[var(--line)] px-[clamp(20px,5vw,76px)] md:grid-cols-3">
        {(page.sections || []).map((section, index) => (
          <article className="mbc-content-info-card bg-white/5 p-6" key={section.heading}>
            <span className="font-black text-[var(--accent)]">{String(index + 1).padStart(2, '0')}</span>
            <h2 className="mbc-content-info-heading">{section.heading}</h2>
            <p className="leading-[1.6] text-[var(--muted)]">{section.body}</p>
          </article>
        ))}
      </section>
      <SiteFooter />
    </main>
  )
}
