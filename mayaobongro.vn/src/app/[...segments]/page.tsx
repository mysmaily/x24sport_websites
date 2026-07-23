import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

import { resolveContentPath, resolveProductPath } from '@/lib/cms'
import { DEFAULT_OG_IMAGE, excerpt } from '@/lib/site'

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
  const product = await resolveProductPath(path)
  if (product) return {
    title: product.name,
    description: excerpt(product.shortDescription || product.name, 160),
    alternates: { canonical: `/san-pham/${product.slug}/` },
    openGraph: { title: product.name, description: excerpt(product.shortDescription, 160), images: product.legacyImages?.[0]?.url ? [product.legacyImages[0].url] : [DEFAULT_OG_IMAGE] },
    twitter: { card: 'summary_large_image', title: product.name, description: excerpt(product.shortDescription, 160), images: [product.legacyImages?.[0]?.url || DEFAULT_OG_IMAGE.url] },
  }
  const content = await resolveContentPath(path)
  if (content) return { title: content.title, description: excerpt(content.excerpt, 160), alternates: { canonical: path } }
  return { title: 'Không tìm thấy nội dung', robots: { index: false, follow: false } }
}

export default async function LegacyRoutePage({ params, searchParams }: { params: Promise<{ segments: string[] }>; searchParams: Promise<SearchParams> }) {
  const [{ segments }, query] = await Promise.all([params, searchParams])
  const path = pathFrom(segments)
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
  return (
    <article className="section-shell py-10 sm:py-16 lg:py-20">
      <Link className="inline-flex min-h-11 items-center gap-2 text-sm font-black text-slate-700 hover:text-brand" href="/"><ArrowLeft size={18} /> Trang chủ</Link>
      <header className="my-10 max-w-5xl sm:my-16"><p className="section-kicker">{content.kind === 'post' ? 'Góc tư vấn' : 'MayAoBongRo.vn'}</p><h1 className="section-title">{content.title}</h1>{content.excerpt ? <p className="section-lead">{content.excerpt}</p> : null}</header>
      {content.contentHtml ? <div className="prose lg:ml-[min(16vw,220px)]" dangerouslySetInnerHTML={{ __html: content.contentHtml }} /> : <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center text-slate-600">Nội dung đang được cập nhật.</div>}
    </article>
  )
}
