import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'

import { getPostsPage } from '../../../lib/content'
import { Breadcrumbs } from './components'
import { blogCover } from './blog-assets'
import styles from './mayaodongphuc.module.css'
import { MayAoDongPhucShell } from './shell'

export function getMayAoDongPhucBlogMetadata(page: number): Metadata {
  const title = `Góc tư vấn đồng phục${page > 1 ? ` - Trang ${page}` : ''}`
  const description = 'Hướng dẫn chọn mẫu, chất liệu, logo, size và quy trình đặt may đồng phục cho doanh nghiệp, trường học, sự kiện và đội ngũ dịch vụ.'
  const canonical = page > 1 ? `/blog/?page=${page}` : '/blog/'
  return {
    title,
    description,
    alternates: { canonical },
    openGraph: { title, description, url: canonical },
  }
}

export async function MayAoDongPhucBlogPage({ page = 1 }: { page?: number }) {
  const result = await getPostsPage(page, 12)
  if (page > 1 && (result.totalPages === 0 || page > result.totalPages)) notFound()

  return <MayAoDongPhucShell>
    <section className={styles.blogHero}>
      <div>
        <Breadcrumbs items={[{ label: 'Góc tư vấn' }]} />
        <span>GÓC TƯ VẤN</span>
        <h1>Chọn đồng phục rõ hơn trước khi đặt may.</h1>
        <p>Những hướng dẫn thực tế về mẫu áo, chất liệu, size, logo và quy trình chuẩn bị để doanh nghiệp gửi yêu cầu báo giá gọn gàng hơn.</p>
      </div>
      <aside><b>{result.totalDocs}</b><span>bài đang có</span></aside>
    </section>
    <section className={styles.blogSection}>
      {result.docs.length ? <div className={styles.blogGrid}>
        {result.docs.map((post, index) => <article className={styles.blogCard} key={post.id}>
          <Link className={styles.blogCardImage} href={`/blog/${post.slug}/`}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img alt="" height={630} src={blogCover(post.slug, index)} width={1200} />
          </Link>
          <div>
            <span>Tư vấn đồng phục</span>
            <h2><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h2>
            {post.excerpt ? <p>{post.excerpt}</p> : null}
            <Link href={`/blog/${post.slug}/`}>Đọc bài <ArrowRight aria-hidden="true" /></Link>
          </div>
        </article>)}
      </div> : <div className={styles.emptyBlog}><h2>Nội dung tư vấn đang được chuẩn bị.</h2><p>Quay lại sau để xem các hướng dẫn chọn mẫu, chất liệu và quy trình đặt may đồng phục.</p></div>}
      {result.totalPages > 1 ? <nav className={styles.pagination} aria-label="Phân trang bài viết">
        {Array.from({ length: result.totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), page + 2).map((value) => (
          <Link aria-current={value === page ? 'page' : undefined} className={value === page ? styles.activePage : undefined} href={value === 1 ? '/blog/' : `/blog/?page=${value}`} key={value}>{value}</Link>
        ))}
      </nav> : null}
    </section>
  </MayAoDongPhucShell>
}
