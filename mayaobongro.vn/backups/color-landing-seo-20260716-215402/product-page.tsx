import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { ProductDetailPage } from '@/components/product-detail-page'
import { getProductCategory, getProducts, resolveProductSlug } from '@/lib/cms'
import { excerpt } from '@/lib/site'

export const dynamic = 'force-dynamic'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await resolveProductSlug(slug)
  if (!product) return { title: 'Không tìm thấy sản phẩm', robots: { index: false, follow: false } }
  const path = `/san-pham/${product.slug}/`
  return {
    title: product.name,
    description: excerpt(product.shortDescription || product.name, 160),
    alternates: { canonical: path },
    openGraph: { title: product.name, description: excerpt(product.shortDescription, 160), url: path, images: product.legacyImages?.[0]?.url ? [product.legacyImages[0].url] : [] },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await resolveProductSlug(slug)
  if (!product) notFound()
  const logoCategory = await getProductCategory('logo-doi-bong-ro')
  const isLogo = Boolean(logoCategory && product.categories?.includes(logoCategory.id))
  const catalog = isLogo
    ? { href: '/logo-team/', label: 'Logo team', categorySlug: 'logo-doi-bong-ro' }
    : { href: '/san-pham/', label: 'Mẫu áo', categorySlug: 'bo-quan-ao-bong-ro' }
  const related = await getProducts({ limit: 5, categorySlug: catalog.categorySlug })
  return <ProductDetailPage catalogHref={catalog.href} catalogLabel={catalog.label} isLogo={isLogo} product={product} related={related.docs} />
}
