import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { JsonLd } from '../_components/json-ld'
import { Pagination } from '../_components/pagination'
import { SiteHeader } from '../_components/site-header'
import { getPostsPage } from '../../lib/content'
import { breadcrumbSchema, metadataDescription, pageCanonical, pageTitle } from '../../lib/seo'

export async function generateMetadata({ searchParams }: { searchParams: Promise<{ page?: string }> }): Promise<Metadata> {
  const page = Math.max(1, Number((await searchParams).page) || 1)
  const title = pageTitle('Blog thể thao X24Sport', page)
  return {
    title, description: metadataDescription('Kiến thức chọn áo, thiết kế đồng phục và xu hướng trang phục thể thao từ X24Sport.'),
    alternates: { canonical: pageCanonical('/blog', page) },
    openGraph: { title, description: 'Kiến thức chọn áo và thiết kế đồng phục thể thao từ X24Sport.', url: pageCanonical('/blog', page) },
  }
}

export default async function BlogPage({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Number((await searchParams).page) || 1)
  const result = await getPostsPage(page)
  if (page > 1 && (result.totalPages === 0 || page > result.totalPages)) notFound()
  return <div className="page-shell">
    <JsonLd data={breadcrumbSchema([{ name: 'Trang chủ', path: '/' }, { name: 'Blog', path: '/blog/' }])} />
    <SiteHeader />
    <main id="noi-dung" className="blog-page site-container">
      <header><p className="eyebrow"><span /> X24Sport Journal</p><h1>Kiến thức & cảm hứng thể thao</h1><p>Chọn trang phục phù hợp, xây dựng nhận diện đội nhóm và cập nhật xu hướng thiết kế mới.</p></header>
      <div className="blog-grid">{result.docs.map((post) => <article key={post.id}><p>Kiến thức thể thao</p><h2><Link href={post.legacyPath}>{post.title}</Link></h2><span>{post.excerpt}</span><Link className="blog-read" href={post.legacyPath}>Đọc bài viết →</Link></article>)}</div>
      <Pagination basePath="/blog/" page={page} totalPages={result.totalPages} />
    </main>
  </div>
}
