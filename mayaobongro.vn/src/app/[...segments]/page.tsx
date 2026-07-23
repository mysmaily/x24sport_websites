import type { Metadata } from 'next'
import { notFound, permanentRedirect } from 'next/navigation'

import { LegacyContentPage } from '@/components/legacy-content-page'
import { resolveContentPath, resolveProductPath } from '@/lib/cms'
import { DEFAULT_OG_IMAGE, excerpt } from '@/lib/site'
import { isRetiredPath } from '@/lib/retired-routes'

export const dynamic = 'force-dynamic'

type SearchParams = Record<string, string | string[] | undefined>

function pathFrom(segments: string[]) {
  const encoded = segments.map((segment) => {
    let decoded = segment
    try {
      decoded = decodeURIComponent(segment)
    } catch {
      // Preserve malformed legacy segments so the normal 404 path handles them.
    }
    return encodeURIComponent(decoded).replace(/%[0-9A-F]{2}/g, (token) => token.toLowerCase())
  })
  return `/${encoded.join('/')}/`
}

export async function generateMetadata({ params }: { params: Promise<{ segments: string[] }> }): Promise<Metadata> {
  const { segments } = await params
  const path = pathFrom(segments)
  if (isRetiredPath(path)) return { title: 'Không tìm thấy nội dung', robots: { index: false, follow: false } }
  const product = await resolveProductPath(path)
  if (product) return {
    title: product.name,
    description: excerpt(product.shortDescription || product.name, 160),
    alternates: { canonical: `/san-pham/${product.slug}/` },
    openGraph: { title: product.name, description: excerpt(product.shortDescription, 160), images: product.legacyImages?.[0]?.url ? [product.legacyImages[0].url] : [DEFAULT_OG_IMAGE] },
    twitter: { card: 'summary_large_image', title: product.name, description: excerpt(product.shortDescription, 160), images: [product.legacyImages?.[0]?.url || DEFAULT_OG_IMAGE.url] },
  }
  const content = await resolveContentPath(path)
  if (content) {
    const description = excerpt(content.excerpt, 160)
    return {
      title: content.title,
      description,
      alternates: { canonical: path },
      openGraph: { title: content.title, description, images: [DEFAULT_OG_IMAGE], url: path },
      twitter: { card: 'summary_large_image', title: content.title, description, images: [DEFAULT_OG_IMAGE.url] },
    }
  }
  return { title: 'Không tìm thấy nội dung', robots: { index: false, follow: false } }
}

export default async function LegacyRoutePage({ params, searchParams }: { params: Promise<{ segments: string[] }>; searchParams: Promise<SearchParams> }) {
  const [{ segments }, query] = await Promise.all([params, searchParams])
  const path = pathFrom(segments)
  if (isRetiredPath(path)) notFound()
  const product = await resolveProductPath(path)

  if (product) {
    const preservedQuery = new URLSearchParams()
    Object.entries(query).forEach(([key, value]) => {
      if (Array.isArray(value)) value.forEach((item) => preservedQuery.append(key, item))
      else if (value !== undefined) preservedQuery.set(key, value)
    })
    const suffix = preservedQuery.size ? `?${preservedQuery}` : ''
    permanentRedirect(`/san-pham/${product.slug}/${suffix}`)
  }

  const content = await resolveContentPath(path)
  if (!content) notFound()
  return <LegacyContentPage content={content} />
}
