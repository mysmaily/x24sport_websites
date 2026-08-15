import type { Metadata } from 'next'
import Link from 'next/link'

import { Pagination } from '../../../_components/pagination'
import { SiteFooter, SiteHeader } from '../_components/info-pages'
import { getPostHref, getPostsPage } from '../lib/content'
import { pageMetadata } from '../lib/seo'

type SearchParams = Promise<{ page?: string | string[] }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)

  return pageMetadata({
    title: `Blog áo cầu lông${page > 1 ? ` – Trang ${page}` : ''} | MayaoCauLong`,
    description: 'Kinh nghiệm chọn mẫu, vải, size và cách đặt may áo cầu lông cho đội nhóm, câu lạc bộ và trường học.',
    path: page > 1 ? `/blog/?page=${page}` : '/blog/',
  })
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams
  const requestedPage = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const posts = await getPostsPage(requestedPage)

  return (
    <main className="blog-archive-page">
      <SiteHeader />
      <section className="blog-hero-section">
        <p className="section-eyebrow">Blog áo cầu lông</p>
        <h1>Kinh nghiệm chọn mẫu, vải và đặt may áo cầu lông</h1>
        <p>Gợi ý thực tế giúp đội nhóm chọn form áo, phối màu, gom size, chuẩn bị logo và đặt may đúng tiến độ.</p>
      </section>

      <section className="blog-list-section">
        {posts.docs.length ? (
          <div className="blog-card-grid">
            {posts.docs.map((post) => (
              <article className="blog-card" key={post.id}>
                <p>Góc tư vấn</p>
                <h2><Link href={getPostHref(post)}>{post.title}</Link></h2>
                <span>{post.excerpt}</span>
                <Link href={getPostHref(post)}>Đọc bài viết →</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="blog-empty-state">
            <h2>Chưa có bài viết để hiển thị.</h2>
            <p>Bạn vẫn có thể xem mẫu áo hoặc liên hệ để được tư vấn chất liệu, size và phối màu.</p>
          </div>
        )}

        <Pagination basePath="/blog/" page={posts.page} totalPages={posts.totalPages} />
      </section>
      <SiteFooter />
    </main>
  )
}
