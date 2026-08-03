import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ProductDetailPage } from '../../components/product-detail-page'
import { getProducts, productImages, productPath, resolveProductSlug } from '../../lib/cms'
import { DEFAULT_OG_IMAGE, seoDescription, seoTitle } from '../../lib/site'
export const revalidate = 300

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const product = await resolveProductSlug((await params).slug)
  if (!product) return { title: 'Không tìm thấy sản phẩm', robots: { index: false, follow: false } }
  const image = productImages(product)[0]
  const title = seoTitle(product.seoTitle || product.name)
  const description = seoDescription(product.metaDescription || product.shortDescription || product.name)
  const path = productPath(product)
  return {
    title,
    description,
    alternates: { canonical: path },
    openGraph: { title, description, images: image?.url ? [image.url] : [DEFAULT_OG_IMAGE], url: path },
    twitter: { card: 'summary_large_image', title, description, images: [image?.url || DEFAULT_OG_IMAGE.url] },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const product = await resolveProductSlug((await params).slug)
  if (!product) notFound()
  const related = await getProducts({ limit: 5 })
  return <ProductDetailPage catalogHref="/san-pham/" catalogLabel="Mẫu áo chạy bộ" isLogo={false} product={product} related={related.docs} />
}
