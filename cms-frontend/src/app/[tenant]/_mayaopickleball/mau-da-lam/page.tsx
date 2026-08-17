import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BookOpenText, Camera, Newspaper, Palette } from 'lucide-react'

import { Pagination } from '../../../_components/pagination'
import { SiteFooter, SiteHeader, phoneHref, zaloHref } from '../_components/info-pages'
import { getFinishedSamplePostsPage, getPostHref } from '../lib/content'
import { breadcrumbJsonLd, pageMetadata } from '../lib/seo'
import { JsonLd } from '../_components/json-ld'

type SearchParams = Promise<{ page?: string | string[] }>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)

  return pageMetadata({
    title: `Mẫu áo pickleball đã làm${page > 1 ? ` - Trang ${page}` : ''} | MayaoPickleball`,
    description: 'Danh mục bài viết tổng hợp các mẫu áo pickleball đã làm, hình ảnh thực tế và gợi ý phối màu cho đội nhóm.',
    path: page > 1 ? `/mau-da-lam/?page=${page}` : '/mau-da-lam/',
  })
}

export default async function FinishedSamplesPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams
  const requestedPage = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const posts = await getFinishedSamplePostsPage(requestedPage)

  const archiveStats = [
    { label: 'Danh mục', value: 'Mẫu đã làm' },
    { label: 'Bài viết', value: String(posts.totalDocs) },
    { label: 'Nội dung', value: 'Ảnh mẫu, màu áo, logo' },
  ] as const

  const editorialNotes = [
    {
      icon: Camera,
      title: 'Hình ảnh thực tế',
      copy: 'Theo dõi các mẫu áo đã hoàn thiện để đội dễ hình dung form áo, màu sắc và chi tiết in.',
    },
    {
      icon: Palette,
      title: 'Gợi ý phối màu',
      copy: 'Mỗi bài viết giúp tham khảo cách phối màu theo logo, nhận diện đội hoặc bối cảnh thi đấu.',
    },
    {
      icon: BookOpenText,
      title: 'Kinh nghiệm chốt mẫu',
      copy: 'Nội dung tập trung vào cách chuẩn bị logo, tên số, size và ghi chú trước khi đặt may.',
    },
  ] as const

  return (
    <main className="blog-archive-page finished-blog-page">
      <JsonLd
        data={breadcrumbJsonLd([
          { name: 'Trang chủ', path: '/' },
          { name: 'Mẫu đã làm', path: '/mau-da-lam/' },
        ])}
      />
      <SiteHeader />

      <section className="finished-blog-hero" aria-labelledby="finished-blog-title">
        <div className="finished-blog-hero-copy">
          <p className="section-eyebrow">Danh mục bài viết</p>
          <h1 id="finished-blog-title">Mẫu áo pickleball đã làm</h1>
          <p>
            Tổng hợp các bài viết về mẫu áo đã may, phối màu thực tế, vị trí logo và kinh nghiệm chuẩn bị tên số
            cho đội nhóm trước khi đặt may.
          </p>
          <div className="finished-blog-actions">
            <Link className="primary-button" href="/blog/">
              Xem toàn bộ blog <ArrowRight size={18} />
            </Link>
            <a className="secondary-button" href={zaloHref}>
              Gửi ảnh đội cần tư vấn
            </a>
          </div>
        </div>
        <aside className="finished-blog-brief" aria-label="Tóm tắt danh mục mẫu đã làm">
          {archiveStats.map((item) => (
            <div key={item.label}>
              <span>{item.label}</span>
              <strong>{item.value}</strong>
            </div>
          ))}
        </aside>
      </section>

      <section className="finished-blog-notes" aria-label="Nội dung trong danh mục mẫu đã làm">
        {editorialNotes.map(({ icon: Icon, title, copy }) => (
          <article key={title}>
            <Icon size={20} />
            <h2>{title}</h2>
            <p>{copy}</p>
          </article>
        ))}
      </section>

      <section className="blog-list-section finished-blog-list-section" aria-labelledby="finished-blog-list-title">
        <div className="finished-blog-heading">
          <div>
            <p className="section-eyebrow">Bài viết danh mục</p>
            <h2 id="finished-blog-list-title">Các mẫu đã được ghi lại</h2>
          </div>
          <span>{posts.totalDocs} bài viết</span>
        </div>

        {posts.docs.length ? (
          <>
            <div className="finished-blog-card-grid">
              {posts.docs.map((post) => (
                <article className="finished-blog-card" key={post.id}>
                  <p><Newspaper size={15} /> Mẫu đã làm</p>
                  <h2><Link href={getPostHref(post)}>{post.title}</Link></h2>
                  <span>{post.excerpt}</span>
                  <Link href={getPostHref(post)}>
                    Đọc bài viết <ArrowRight size={16} />
                  </Link>
                </article>
              ))}
            </div>
            <Pagination ariaLabel="Phân trang mẫu đã làm" basePath="/mau-da-lam/" page={posts.page} totalPages={posts.totalPages} />
          </>
        ) : (
          <div className="finished-blog-empty" role="status">
            <BookOpenText size={34} />
            <div>
              <h2>Chưa có bài viết mẫu đã làm để hiển thị.</h2>
              <p>
                Bạn có thể xem các bài tư vấn hiện có hoặc gửi ảnh đội để được gợi ý phối màu, logo và tên số
                trước khi đặt may.
              </p>
            </div>
            <div>
              <Link className="primary-button" href="/blog/">
                Xem blog áo pickleball <ArrowRight size={18} />
              </Link>
              <a className="secondary-button" href={zaloHref}>
                Gửi ảnh mẫu
              </a>
            </div>
          </div>
        )}
      </section>

      <SiteFooter />

      <div className="mobile-cta" aria-label="Liên hệ nhanh">
        <a href={phoneHref}>Gọi ngay</a>
        <a href={zaloHref}>Nhắn Zalo</a>
      </div>
    </main>
  )
}
