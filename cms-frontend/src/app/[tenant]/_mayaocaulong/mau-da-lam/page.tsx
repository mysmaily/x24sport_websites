import type { Metadata } from 'next'
import Link from 'next/link'

import { SiteFooter, SiteHeader } from '../_components/info-pages'
import { getFinishedSamplePostsPage, getPostHref } from '../lib/content'
import { pageMetadata } from '../lib/seo'

type SearchParams = Promise<{ page?: string | string[] }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)

  return pageMetadata({
    title: `Mẫu áo cầu lông đã làm${page > 1 ? ` – Trang ${page}` : ''} | MayaoCauLong`,
    description: 'Tham khảo các mẫu áo cầu lông đã làm cho đội nhóm, câu lạc bộ, trường học và doanh nghiệp.',
    path: page > 1 ? `/mau-da-lam/?page=${page}` : '/mau-da-lam/',
  })
}

export default async function FinishedSamplesPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams
  const requestedPage = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const posts = await getFinishedSamplePostsPage(requestedPage)

  return (
    <main className="blog-archive-page">
      <SiteHeader />
      <section className="blog-hero-section">
        <p className="section-eyebrow">Hình ảnh thực tế</p>
        <h1>Mẫu áo cầu lông đã làm</h1>
        <p>Tham khảo các mẫu đã may để chọn hướng phối màu, logo, tên số và form áo phù hợp cho đội của bạn.</p>
      </section>

      <section className="blog-list-section">
        {posts.docs.length ? (
          <div className="blog-card-grid">
            {posts.docs.map((post) => (
              <article className="blog-card" key={post.id}>
                <p>Mẫu đã làm</p>
                <h2><Link href={getPostHref(post)}>{post.title}</Link></h2>
                <span>{post.excerpt}</span>
                <Link href={getPostHref(post)}>Xem chi tiết →</Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="blog-empty-state">
            <h2>Chưa có mẫu đã làm để hiển thị.</h2>
            <p>Bạn vẫn có thể xem catalog mẫu áo hoặc gửi mẫu tham khảo để được tư vấn phối lại theo đội.</p>
            <Link href="/san-pham">Xem mẫu áo</Link>
          </div>
        )}

        <BlogPagination basePath="/mau-da-lam/" page={posts.page} totalPages={posts.totalPages} />
      </section>
      <SiteFooter />
    </main>
  )
}

function BlogPagination({ basePath, page, totalPages }: { basePath: string; page: number; totalPages: number }) {
  if (totalPages <= 1) return null

  return (
    <nav className="blog-pagination" aria-label="Phân trang mẫu đã làm">
      {page > 1 ? <Link href={page === 2 ? basePath : `${basePath}?page=${page - 1}`}>← Trang trước</Link> : <span>← Trang trước</span>}
      <p>Trang {page} / {totalPages}</p>
      {page < totalPages ? <Link href={`${basePath}?page=${page + 1}`}>Trang sau →</Link> : <span>Trang sau →</span>}
    </nav>
  )
}
