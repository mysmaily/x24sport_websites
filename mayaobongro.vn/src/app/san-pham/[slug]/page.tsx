import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { CatalogPageView } from '@/components/catalog-page-view'
import { ProductDetailPage } from '@/components/product-detail-page'
import { getCatalogLandingBySlug } from '@/lib/catalog-colors'
import { getProductCategory, getProducts, resolveProductSlug } from '@/lib/cms'
import { excerpt } from '@/lib/site'

export const dynamic = 'force-dynamic'

type ProductRouteProps = {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}

function pageNumber(value?: string) {
  return Math.max(1, Number.parseInt(value || '1', 10) || 1)
}

export async function generateMetadata({ params, searchParams }: ProductRouteProps): Promise<Metadata> {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const landing = getCatalogLandingBySlug(slug)
  if (landing) {
    const page = pageNumber(query.page)
    const canonical = `${landing.path}${page > 1 ? `?page=${page}` : ''}`
    const title = `${landing.title}${page > 1 ? ` – Trang ${page}` : ''}`
    const description = landing.metaDescription || landing.description || undefined
    return {
      title,
      description,
      alternates: { canonical },
      openGraph: { title, description, url: canonical },
    }
  }
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

export default async function ProductPage({ params, searchParams }: ProductRouteProps) {
  const [{ slug }, query] = await Promise.all([params, searchParams])
  const landing = getCatalogLandingBySlug(slug)
  if (landing) {
    return <CatalogPageView activeLanding={landing} breadcrumbLabel={landing.label === 'Học sinh' ? 'Áo bóng rổ học sinh' : `Màu ${landing.label.toLocaleLowerCase('vi-VN')}`} canonicalPath={landing.path} description={landing.description} heading={landing.title} page={pageNumber(query.page)} search={landing.query} />
  }
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
