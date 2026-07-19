import { ArrowLeft } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { CatalogPageView } from '@/components/catalog-page-view'
import { ProductDetailPage } from '@/components/product-detail-page'
import { getCatalogLanding } from '@/lib/catalog-landings'
import { getProducts, productImages, resolveCategoryPath, resolveContentPath, resolveProductPath } from '@/lib/cms'
import { excerpt } from '@/lib/site'

export const dynamic = 'force-dynamic'
type SearchParams = Record<string, string | string[] | undefined>
function pathFrom(segments: string[]) {
  const encoded = segments.map((segment) => encodeURIComponent(decodeURIComponent(segment)).replace(/%[0-9A-F]{2}/g, (token) => token.toLowerCase()))
  return `/${encoded.join('/')}/`
}

export async function generateMetadata({ params, searchParams }: { params: Promise<{ segments: string[] }>; searchParams: Promise<SearchParams> }): Promise<Metadata> {
  const [{ segments }, query] = await Promise.all([params, searchParams])
  const path = pathFrom(segments)
  const [product, category, content] = await Promise.all([resolveProductPath(path), resolveCategoryPath(path), resolveContentPath(path)])
  if (product) { const image = productImages(product)[0]; return { title: product.seoTitle || product.name, description: product.metaDescription || excerpt(product.shortDescription || product.name, 160), alternates: { canonical: path }, openGraph: { images: image?.url ? [image.url] : [] } } }
  if (category) {
    const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
    const search = String(Array.isArray(query.q) ? query.q[0] : query.q || '').trim()
    const landing = getCatalogLanding(category.slug, path)
    const description = landing?.description || excerpt(category.description || `Các mẫu ${category.name}`, 160)
    const canonical = page > 1 ? `${path}?page=${page}` : path
    const preview = await getProducts({ categorySlug: category.slug, limit: 1 })
    const image = preview.docs[0] ? productImages(preview.docs[0])[0] : undefined
    return {
      title: `${landing?.title || category.name}${page > 1 ? ` – Trang ${page}` : ''}`,
      description,
      alternates: { canonical },
      robots: search ? { index: false, follow: true } : undefined,
      openGraph: { title: landing?.title || category.name, description, url: canonical, images: image?.url ? [{ url: image.url, alt: landing?.heading || category.name }] : [] },
    }
  }
  if (content) return { title: content.title, description: excerpt(content.excerpt, 160), alternates: { canonical: path } }
  return { title: 'Không tìm thấy nội dung', robots: { index: false, follow: false } }
}

export default async function LegacyRoutePage({ params, searchParams }: { params: Promise<{ segments: string[] }>; searchParams: Promise<SearchParams> }) {
  const [{ segments }, query] = await Promise.all([params, searchParams]); const path = pathFrom(segments)
  const product = await resolveProductPath(path)
  if (product) { const related = await getProducts({ limit: 5 }); return <ProductDetailPage catalogHref="/san-pham/" catalogLabel="Mẫu áo chạy bộ" isLogo={false} product={product} related={related.docs} /> }
  const category = await resolveCategoryPath(path)
  if (category) { const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1); const q = String(Array.isArray(query.q) ? query.q[0] : query.q || ''); const landing = getCatalogLanding(category.slug, path); return <CatalogPageView page={page} search={q} heading={landing?.heading || category.name} description={landing?.description || category.description || `Khám phá các mẫu ${category.name.toLocaleLowerCase('vi-VN')} và tùy chỉnh theo đội.`} canonicalPath={path} breadcrumbLabel={landing?.heading || category.name} categorySlug={category.slug} /> }
  const content = await resolveContentPath(path)
  if (!content) notFound()
  return <article className="section-shell py-10 sm:py-16 lg:py-20"><Link className="inline-flex min-h-11 items-center gap-2 text-sm font-black hover:text-brand" href="/"><ArrowLeft size={18} /> Trang chủ</Link><header className="my-10 max-w-5xl sm:my-16"><p className="section-kicker">{content.kind === 'post' ? 'Góc chạy bộ' : 'MayAoChayBo.vn'}</p><h1 className="section-title">{content.title}</h1>{content.excerpt ? <p className="section-lead">{excerpt(content.excerpt, 300)}</p> : null}</header>{content.contentHtml ? <div className="prose lg:ml-[min(16vw,220px)]" dangerouslySetInnerHTML={{ __html: content.contentHtml }} /> : <div className="rounded-2xl border border-dashed p-10 text-center">Nội dung đang được cập nhật.</div>}</article>
}
