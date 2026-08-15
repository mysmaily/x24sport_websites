import Link from 'next/link'

import { Pagination } from '../../../_components/pagination'
import { JsonLd } from './json-ld'
import { getLatestPosts, type WebContent } from '../lib/cms'
import { canonical, excerpt } from '../lib/site'

export async function PostArchivePage({ canonicalPath, description, page, title }: { canonicalPath: string; description: string; page: number; title: string }) {
  const perPage = 12
  const result = await getLatestPosts(perPage, page)
  const posts: WebContent[] = result.docs
  const totalPages = result.totalPages
  const href = (value: number) => value === 1 ? canonicalPath : `${canonicalPath}?page=${value}`
  return <div className="section-shell py-12 sm:py-20">
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: canonical('/') }, { '@type': 'ListItem', position: 2, name: title, item: canonical(canonicalPath) }] }} />
    <p className="section-kicker">Góc tư vấn</p><h1 className="section-title">{title}</h1><p className="section-lead max-w-3xl">{description}</p>
    <div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{posts.map((post) => <article className="flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-6" key={post.id}><h2 className="font-display text-3xl font-bold leading-tight"><Link href={post.legacyPath}>{post.title}</Link></h2><p className="mt-4 text-sm leading-6 text-slate-600">{excerpt(post.excerpt, 150)}</p><Link className="mt-auto pt-6 text-sm font-black text-brand" href={post.legacyPath}>Đọc bài</Link></article>)}</div>
    <Pagination ariaLabel="Phân trang bài viết" hrefForPage={href} page={page} totalPages={totalPages} />
  </div>
}
