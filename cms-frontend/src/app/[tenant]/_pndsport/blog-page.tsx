import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'

import { getPostsPage } from '../../../lib/content'
import { Breadcrumbs, QuoteBand } from '../../pndsport-preview/components'
import styles from '../../pndsport-preview/pnd.module.css'
import { postImage } from './lib'
import { PndShell } from './shell'

export function getPndBlogMetadata(page: number): Metadata {
  const title = `Góc tư vấn PND${page > 1 ? ` - Trang ${page}` : ''}`
  const canonical = page > 1 ? `/blog/?page=${page}` : '/blog/'
  return {
    title,
    description: 'Kinh nghiệm chọn mẫu, chuẩn bị thiết kế, size và đặt trang phục thể thao cho đội nhóm.',
    alternates: { canonical },
    openGraph: { title, description: 'Hướng dẫn chọn mẫu và chuẩn bị thông tin đặt áo đội tại PND Sport.', url: canonical },
  }
}

export async function PndBlogPage({ page = 1 }: { page?: number }) {
  const result = await getPostsPage(page, 12)
  if (page > 1 && (result.totalPages === 0 || page > result.totalPages)) notFound()
  return <PndShell>
    <Breadcrumbs base="" items={[{ label: 'Góc tư vấn' }]} />
    <section className={styles.pageHero}><div className={styles.pageHeroInner}><div><span className={styles.eyebrow}>Kiến thức hữu ích</span><h1>Góc tư vấn PND</h1><p>Hướng dẫn thực tế để đội trưởng chọn mẫu, chuẩn bị nhận diện và tổng hợp thông tin đặt áo.</p></div><aside>{result.totalDocs} bài</aside></div></section>
    <section className={styles.section}><div className={styles.sectionInner}><nav className={styles.filterBar} aria-label="Chủ đề bài viết"><Link className={styles.active} href="/blog/">Tất cả</Link><Link href="/thiet-ke-ao-bong-da-doi-nhom/">Kinh nghiệm đặt áo</Link><Link href="/thiet-ke-dong-phuc-the-thao-doi-nhom/">Thiết kế và nhận diện</Link></nav><div className={styles.blogGrid}>{result.docs.map((post, index) => <article className={styles.postCard} key={post.id}><Link className={styles.postImage} href={`/blog/${post.slug}/`}>{/* eslint-disable-next-line @next/next/no-img-element */}<img src={postImage(post, index)} alt="" /></Link><div className={styles.postBody}><span>Góc tư vấn</span><h3><Link href={`/blog/${post.slug}/`}>{post.title}</Link></h3><p>{post.excerpt}</p><small><Link href={`/blog/${post.slug}/`}>Đọc bài <ArrowRight size={11} /></Link></small></div></article>)}</div>{result.totalPages > 1 ? <nav className={styles.pagination} aria-label="Phân trang">{Array.from({ length: result.totalPages }, (_, index) => index + 1).slice(Math.max(0, page - 3), page + 2).map((value) => <Link aria-current={value === page ? 'page' : undefined} className={value === page ? styles.active : undefined} href={value === 1 ? '/blog/' : `/blog/?page=${value}`} key={value}>{value}</Link>)}</nav> : null}<QuoteBand compact /></div></section>
  </PndShell>
}
