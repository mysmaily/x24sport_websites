import type { Metadata } from 'next'

import { ContentPathPage } from '../../[...path]/page'
import { getProductBySlug, productImages } from '../../../lib/content'
import { cleanSeoTitle, metadataDescription } from '../../../lib/seo'
import { getTenantContext } from '../../../lib/tenant'

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const [product, tenant] = await Promise.all([
    getProductBySlug((await params).slug),
    getTenantContext(),
  ])
  if (!product) return { title: 'Không tìm thấy sản phẩm' }

  const title = cleanSeoTitle(product.seoTitle || product.name)
  const description = metadataDescription(product.metaDescription || product.shortDescription, `${product.name} tại ${tenant.name}.`)
  const images = productImages(product).map((image) => ({ url: image.url, alt: image.alt || product.name }))
  const canonical = `/san-pham/${product.slug}/`
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { type: 'website', title, description, url: canonical, images },
    twitter: { card: 'summary_large_image', title, description, images: images.map((image) => image.url) },
  }
}

export default async function ProductPage({ params, searchParams }: {
  params: Promise<{ slug: string }>
  searchParams: Promise<{ page?: string }>
}) {
  return <ContentPathPage
    params={params.then(({ slug }) => ({ path: [slug] }))}
    searchParams={searchParams}
  />
}
