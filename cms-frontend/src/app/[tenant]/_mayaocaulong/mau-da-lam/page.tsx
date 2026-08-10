import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight, BadgeCheck, Images, Palette, Ruler, Shirt } from 'lucide-react'

import { SiteFooter, SiteHeader, zaloHref } from '../_components/info-pages'
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

const sampleImages = [
  {
    alt: 'Đội cầu lông mặc áo trắng xanh đã may trên sân',
    src: '/images/mayaocaulong/home/badminton-club-white-blue-wide.webp',
  },
  {
    alt: 'Đội cầu lông công ty mặc áo trắng đỏ đã may',
    src: '/images/mayaocaulong/home/badminton-company-white-red-wide.webp',
  },
  {
    alt: 'Nhóm vận động viên cầu lông mặc đồng phục navy đã may',
    src: '/images/mayaocaulong/home/badminton-doubles-navy-wide.webp',
  },
] as const

const proofStats = [
  { value: 'CLB', label: 'đội phong trào' },
  { value: 'Tên số', label: 'in theo danh sách' },
  { value: 'Logo', label: 'canh vị trí trước khi may' },
] as const

const guideItems = [
  { icon: Palette, title: 'Chọn hướng phối màu', text: 'Xem tông áo nổi trên sân, dễ ghép logo đội và màu nhận diện.' },
  { icon: Ruler, title: 'Ước lượng form mặc', text: 'So sánh cổ tròn, cổ trụ, sát nách và cách chia size cho nam nữ.' },
  { icon: Shirt, title: 'Đặt mẫu tương tự', text: 'Gửi mẫu thích để đội thiết kế phối lại theo logo, tên số và ngân sách.' },
] as const

export default async function FinishedSamplesPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams
  const requestedPage = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const posts = await getFinishedSamplePostsPage(requestedPage)

  return (
    <main className="blog-archive-page finished-samples-page">
      <SiteHeader />

      <section className="samples-hero">
        <div className="samples-hero-copy">
          <p className="section-eyebrow">Hình ảnh thực tế</p>
          <h1>Mẫu áo cầu lông đã làm cho CLB, trường lớp và đội công ty</h1>
          <p>Tham khảo các mẫu đã may để chọn hướng phối màu, logo, tên số và form áo phù hợp cho đội của bạn.</p>
          <div className="hero-actions">
            <a className="primary-button" href={zaloHref}>
              Gửi mẫu muốn làm <ArrowRight size={18} />
            </a>
            <Link className="secondary-button" href="/dat-may-ao-cau-long/">
              Quy trình đặt may
            </Link>
          </div>
        </div>

        <div className="samples-hero-stack" aria-label="Ảnh mẫu áo cầu lông đã làm">
          {sampleImages.map((image, index) => (
            <img
              alt={image.alt}
              height={820}
              key={image.src}
              src={image.src}
              width={1920}
              className={`samples-stack-image samples-stack-image-${index + 1}`}
            />
          ))}
        </div>

        <div className="samples-proof-row">
          {proofStats.map((stat) => (
            <div key={stat.label}>
              <strong>{stat.value}</strong>
              <span>{stat.label}</span>
            </div>
          ))}
        </div>
      </section>

      <section className="samples-guide-section" aria-label="Cách dùng thư viện mẫu đã làm">
        {guideItems.map(({ icon: Icon, title, text }) => (
          <article key={title}>
            <Icon size={24} strokeWidth={1.7} />
            <h2>{title}</h2>
            <p>{text}</p>
          </article>
        ))}
      </section>

      <section className="blog-list-section samples-list-section">
        <div className="samples-list-heading">
          <div>
            <p className="section-eyebrow">Lookbook</p>
            <h2>Các mẫu đã hoàn thiện</h2>
          </div>
          <span>{posts.totalDocs} mẫu</span>
        </div>

        {posts.docs.length ? (
          <div className="samples-card-grid">
            {posts.docs.map((post, index) => {
              const image = sampleImages[index % sampleImages.length]

              return (
              <article className="sample-card" key={post.id}>
                <Link className="sample-card-media" href={getPostHref(post)}>
                  <img alt={image.alt} height={820} src={image.src} width={1920} />
                  <span>Mẫu đã làm</span>
                </Link>
                <div className="sample-card-body">
                  <p><BadgeCheck size={16} strokeWidth={2} /> Đã hoàn thiện cho đội nhóm</p>
                  <h2><Link href={getPostHref(post)}>{post.title}</Link></h2>
                  <span>{post.excerpt}</span>
                  <Link className="text-link" href={getPostHref(post)}>
                    Xem chi tiết <ArrowRight size={16} />
                  </Link>
                </div>
              </article>
              )
            })}
          </div>
        ) : (
          <div className="blog-empty-state">
            <Images size={32} strokeWidth={1.7} />
            <h2>Chưa có mẫu đã làm để hiển thị.</h2>
            <p>Bạn vẫn có thể xem catalog mẫu áo hoặc gửi mẫu tham khảo để được tư vấn phối lại theo đội.</p>
            <Link href="/san-pham">Xem mẫu áo</Link>
          </div>
        )}

        <BlogPagination basePath="/mau-da-lam/" page={posts.page} totalPages={posts.totalPages} />
      </section>

      <section className="samples-bottom-cta">
        <div>
          <p className="section-eyebrow">Làm mẫu riêng</p>
          <h2>Thích mẫu nào, gửi mẫu đó. Đội thiết kế sẽ phối lại theo màu và logo của bạn.</h2>
        </div>
        <a className="primary-button" href={zaloHref}>
          Nhận tư vấn mẫu tương tự <ArrowRight size={18} />
        </a>
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
