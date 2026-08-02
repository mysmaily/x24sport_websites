import type { Metadata } from 'next'
import { ArrowLeft, Phone, ShieldCheck } from 'lucide-react'
import { notFound } from 'next/navigation'

import { ProductInterestForm } from '../../_components/product-interest-form'
import { formatPrice, getProductBreadcrumbCategory, getProductBySlug, hasProductInterestForm } from '../../lib/content'
import { ProductGallery } from './product-gallery'

type ProductPageProps = {
  params: Promise<{ slug: string }>
}

export async function generateMetadata({ params }: ProductPageProps): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Không tìm thấy sản phẩm | MayaoBongChuyen' }

  return {
    title: `${product.name} | MayaoBongChuyen`,
    description: product.shortDescription,
    alternates: { canonical: `/san-pham/${slug}` },
    openGraph: {
      title: `${product.name} | MayaoBongChuyen`,
      description: product.shortDescription,
      images: product.gallery?.[0]?.url ? [{ url: product.gallery[0].url }] : undefined,
      type: 'website',
      url: `/san-pham/${slug}`,
    },
  }
}

export default async function ProductDetailPage({ params }: ProductPageProps) {
  const { slug } = await params
  const [product, showInterestForm] = await Promise.all([getProductBySlug(slug), hasProductInterestForm()])
  if (!product) notFound()

  const images = product.gallery || []
  const productPath = `/san-pham/${product.slug || slug}`
  const breadcrumbCategory = getProductBreadcrumbCategory(product)
  const breadcrumbItems = [
    { '@type': 'ListItem', position: 1, name: 'Trang chủ', item: 'https://mayaobongchuyen.vn/' },
    { '@type': 'ListItem', position: 2, name: 'Sản Phẩm', item: 'https://mayaobongchuyen.vn/tim-kiem' },
    ...(breadcrumbCategory ? [{ '@type': 'ListItem', position: 3, name: breadcrumbCategory.name, item: `https://mayaobongchuyen.vn/${breadcrumbCategory.slug}` }] : []),
    { '@type': 'ListItem', position: breadcrumbCategory ? 4 : 3, name: product.name, item: `https://mayaobongchuyen.vn${productPath}` },
  ]
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems,
  }

  return (
    <main className="min-h-screen bg-[#080909] text-white">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }} />
      <header className="sticky top-0 z-40 flex h-[72px] items-center justify-between border-b-[3px] border-[var(--accent)] bg-[#080909] px-4 shadow-[0_10px_28px_rgba(0,0,0,.22)] md:h-[82px] md:px-[clamp(20px,5vw,92px)]">
        <a className="flex items-center gap-3 uppercase" href="/">
          <span className="inline-flex h-[38px] w-[38px] items-center justify-center rounded-full border-2 border-white/90 bg-[linear-gradient(135deg,var(--accent),#911410)] text-[13px] font-black text-white md:h-11 md:w-11">VB</span>
          <span className="text-base font-black italic text-white md:text-[clamp(16px,1.25vw,22px)]">MayaoBongChuyen</span>
        </a>
        <a className="inline-flex h-11 w-11 items-center justify-center border border-white/16 text-white transition duration-200 hover:-translate-y-px hover:border-[rgba(238,43,36,.8)]" href="/lien-he" aria-label="Liên hệ">
          <Phone size={18} />
        </a>
      </header>

      <article className="px-[clamp(20px,5vw,76px)] pb-16">
        <nav className="flex gap-2 overflow-hidden py-5 text-xs text-[#b9b9b9]" aria-label="Đường dẫn">
          <a className="inline-flex items-center gap-2 hover:text-white" href="/">
            <ArrowLeft size={16} />
            Trang chủ
          </a>
          <span>/</span>
          <a className="hover:text-white" href="/tim-kiem">Sản Phẩm</a>
          <span>/</span>
          {breadcrumbCategory ? <><a className="hover:text-white" href={`/${breadcrumbCategory.slug}`}>{breadcrumbCategory.name}</a><span>/</span></> : null}
          <span className="truncate">{product.name}</span>
        </nav>

        <h1 className="mb-5 max-w-5xl text-[20px] font-black leading-tight text-white lg:text-[22px]">{product.name}</h1>

        <div className="grid overflow-hidden border border-[var(--line)] bg-white/6 lg:grid-cols-[1.08fr_.92fr]">
          <div className="relative bg-[#111]">
            {images.some((image) => image.url) ? (
              <ProductGallery images={images} productName={product.name} />
            ) : (
              <div className="flex aspect-square min-h-[340px] items-center justify-center sm:min-h-[520px]">
                <ShieldCheck className="text-[var(--accent)]" size={64} />
              </div>
            )}
          </div>

          <section className="grid content-start gap-5 p-5 sm:p-8 lg:p-10">
            <p className="text-xs font-black uppercase text-[var(--accent)]">{product.sku}</p>
            <p className="text-base leading-7 text-[#b9b9b9]">{product.shortDescription}</p>
            <div className="border-l-4 border-[var(--accent)] bg-white/8 p-5">
              <span className="text-sm text-[#b9b9b9]">Giá tham khảo</span>
              <strong className="mt-1 block text-3xl text-white">{formatPrice(product.price)}</strong>
              {product.compareAtPrice ? <del className="mt-1 block text-sm text-[#b9b9b9]">{formatPrice(product.compareAtPrice)}</del> : null}
            </div>
            <div className="grid gap-2 border border-white/12 bg-black/20 p-5 text-sm text-[#d8d8d8]">
              <b className="text-base text-white">Có thể chỉnh theo yêu cầu đội bóng</b>
              <p>Trao đổi màu sắc, logo, tên số và số lượng trước khi chốt sản xuất.</p>
            </div>
            {showInterestForm ? <ProductInterestForm productName={product.name} productUrl={`https://mayaobongchuyen.vn/san-pham/${product.slug || slug}`} /> : null}
          </section>
        </div>
      </article>
    </main>
  )
}
