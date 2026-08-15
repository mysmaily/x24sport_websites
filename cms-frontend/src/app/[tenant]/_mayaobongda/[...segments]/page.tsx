import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound, permanentRedirect } from 'next/navigation'

import { CatalogPageView } from '../components/catalog-page-view'
import { FabricGuidePage } from '../components/fabric-guide-page'
import { PostArchivePage } from '../components/post-archive-page'
import { getProducts, productImages, productPath, resolveCategoryPath, resolveContentPath, resolveProductPath } from '../lib/cms'
import { HOT_FOOTBALL_DESCRIPTION, HOT_FOOTBALL_PATH, HOT_FOOTBALL_TITLE, HOT_FOOTBALL_YEAR, isCurrentHotFootballPath } from '../lib/hot-football'
import { rewriteLegacyHtml } from '../lib/legacy-content'
import { getPostCategoryArchive, isIndexableContent } from '../lib/legacy-routes'
import { DEFAULT_OG_IMAGE, excerpt } from '../lib/site'

export const revalidate = 180

type SearchParams = Record<string, string | string[] | undefined>

function pathFrom(segments: string[]) {
  const encoded = segments.map((segment) => encodeURIComponent(decodeURIComponent(segment)).replace(/%[0-9A-F]{2}/g, (token) => token.toLowerCase()))
  return `/${encoded.join('/')}/`
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ segments: string[] }>; searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const [{ segments }, query] = await Promise.all([params, searchParams])
  const path = pathFrom(segments)
  if (isCurrentHotFootballPath(path)) {
    const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
    const search = String(Array.isArray(query.q) ? query.q[0] : query.q || '').trim()
    const canonical = page > 1 ? `${HOT_FOOTBALL_PATH}?page=${page}` : HOT_FOOTBALL_PATH
    return {
      title: `${HOT_FOOTBALL_TITLE}${page > 1 ? ` - Trang ${page}` : ''}`,
      description: HOT_FOOTBALL_DESCRIPTION,
      alternates: { canonical },
      robots: search ? { index: false, follow: true } : undefined,
      openGraph: {
        title: HOT_FOOTBALL_TITLE,
        description: HOT_FOOTBALL_DESCRIPTION,
        images: [DEFAULT_OG_IMAGE],
        url: canonical,
      },
      twitter: {
        card: 'summary_large_image',
        title: HOT_FOOTBALL_TITLE,
        description: HOT_FOOTBALL_DESCRIPTION,
        images: [DEFAULT_OG_IMAGE.url],
      },
    }
  }
  if (path === '/chat-lieu-vai/') {
    return {
      title: 'Chất liệu vải may áo bóng đá',
      description: 'So sánh 5 chất liệu vải may áo bóng đá: Thun lạnh, Mè sọc mịn, Mè luxury, Mè Thái và Mè nano.',
      alternates: { canonical: path },
    }
  }
  const postCategory = getPostCategoryArchive(path)
  if (postCategory) {
    const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
    return {
      title: `${postCategory.title}${page > 1 ? ` - Trang ${page}` : ''}`,
      description: postCategory.description,
      alternates: { canonical: page > 1 ? `${path}?page=${page}` : path },
    }
  }
  const [product, category, content] = await Promise.all([resolveProductPath(path), resolveCategoryPath(path), resolveContentPath(path)])
  if (product) {
    const image = productImages(product)[0]
    return {
      title: product.seoTitle || product.name,
      description: product.metaDescription || excerpt(product.shortDescription || product.name, 160),
      alternates: { canonical: productPath(product) },
      openGraph: { images: image?.url ? [image.url] : [] },
    }
  }
  if (category) {
    const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
    const search = String(Array.isArray(query.q) ? query.q[0] : query.q || '').trim()
    const description = excerpt(category.description || `Khám phá các mẫu ${category.name.toLocaleLowerCase('vi-VN')} và tùy chỉnh theo nhu cầu đội bóng.`, 160)
    const canonical = page > 1 ? `${path}?page=${page}` : path
    const preview = await getProducts({ categorySlug: category.slug, limit: 1 })
    const image = preview.docs[0] ? productImages(preview.docs[0])[0] : undefined
    return {
      title: `${category.name}${page > 1 ? ` - Trang ${page}` : ''}`,
      description,
      alternates: { canonical },
      robots: search || preview.totalDocs === 0 ? { index: false, follow: true } : undefined,
      openGraph: { title: category.name, description, url: canonical, images: image?.url ? [{ url: image.url, alt: category.name }] : [] },
    }
  }
  if (content) {
    return {
      title: content.title,
      description: excerpt(content.excerpt, 160),
      alternates: { canonical: path },
      robots: isIndexableContent(content.kind, path) ? undefined : { index: false, follow: true },
    }
  }
  return { title: 'Không tìm thấy nội dung', robots: { index: false, follow: false } }
}

export default async function LegacyRoutePage({ params, searchParams }: { params: Promise<{ segments: string[] }>; searchParams: Promise<SearchParams> }) {
  const [{ segments }, query] = await Promise.all([params, searchParams])
  const path = pathFrom(segments)
  if (isCurrentHotFootballPath(path)) {
    const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
    const q = String(Array.isArray(query.q) ? query.q[0] : query.q || '')
    return <CatalogPageView
      breadcrumbLabel={`Mẫu áo bóng đá hot ${HOT_FOOTBALL_YEAR}`}
      canonicalPath={HOT_FOOTBALL_PATH}
      description={HOT_FOOTBALL_DESCRIPTION}
      heading={HOT_FOOTBALL_TITLE}
      page={page}
      search={q}
      searchAction={HOT_FOOTBALL_PATH}
      sort="popular"
    />
  }
  if (segments.length >= 2 && segments.at(-2) === 'page' && /^\d+$/.test(segments.at(-1) || '')) {
    const page = Number(segments.at(-1))
    const baseSegments = segments.slice(0, -2)
    const base = `/${baseSegments.join('/')}/`
    if (base === '/san-pham/') permanentRedirect(`${base}?page=${page}`)
    if (base === '/blog/' || getPostCategoryArchive(base) || await resolveCategoryPath(base)) permanentRedirect(`${base}?page=${page}`)
  }

  const postCategory = getPostCategoryArchive(path)
  if (postCategory) {
    const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
    return <PostArchivePage canonicalPath={path} description={postCategory.description} page={page} title={postCategory.title} />
  }

  const product = await resolveProductPath(path)
  if (product) {
    permanentRedirect(productPath(product))
  }

  const category = await resolveCategoryPath(path)
  if (category) {
    const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
    const q = String(Array.isArray(query.q) ? query.q[0] : query.q || '')
    return <CatalogPageView page={page} search={q} heading={category.name} description={category.description || `Khám phá các mẫu ${category.name.toLocaleLowerCase('vi-VN')} và tùy chỉnh theo nhu cầu đội bóng.`} canonicalPath={path} breadcrumbLabel={category.name} categorySlug={category.slug} />
  }

  const content = await resolveContentPath(path)
  if (!content) notFound()

  if (path === '/chat-lieu-vai/') return <FabricGuidePage />

  return <article className="section-shell py-6 sm:py-9 lg:py-10"><Link className="inline-flex min-h-10 items-center gap-2 text-sm font-black hover:text-brand" href="/"><ArrowLeft size={18} /> Trang chủ</Link><header className="my-6 max-w-4xl border-b border-slate-200 pb-5 sm:my-8 sm:pb-6"><p className="section-kicker">{content.kind === 'post' ? 'Góc tư vấn' : 'May Áo Bóng Đá'}</p><h1 className="font-display text-[32px] font-bold leading-[1.02] tracking-normal text-slate-950 sm:text-[42px] lg:text-[48px]">{content.title}</h1>{content.excerpt ? <p className="mt-3 max-w-3xl text-sm leading-6 text-slate-600 sm:text-base sm:leading-7">{excerpt(content.excerpt, 240)}</p> : null}</header>{content.contentHtml ? <div className="prose max-w-4xl text-base leading-7 [&_h2]:mt-8 [&_h2]:text-[28px] [&_h3]:text-[22px] [&_p]:my-4" dangerouslySetInnerHTML={{ __html: rewriteLegacyHtml(content.contentHtml) }} /> : <div className="rounded-xl border border-dashed p-6 text-center">Nội dung đang được cập nhật.</div>}</article>
}
