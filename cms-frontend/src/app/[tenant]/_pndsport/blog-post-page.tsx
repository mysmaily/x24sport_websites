import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'

import { getPostsPage, getWebContentBySlug, prepareContentHtml } from '../../../lib/content'
import { Breadcrumbs, QuoteBand } from '../../pndsport-preview/components'
import styles from '../../pndsport-preview/pnd.module.css'
import { postImage } from './lib'
import { PndShell } from './shell'

export async function getPndBlogPostMetadata(slug: string): Promise<Metadata> {
  const post = await getWebContentBySlug(slug)
  if (!post || post.kind !== 'post') return { title: 'Không tìm thấy bài viết' }
  const description = post.excerpt || `Đọc ${post.title} tại PND Sport Việt Nam.`
  return { title: post.title, description, alternates: { canonical: `/blog/${post.slug}/` }, openGraph: { title: post.title, description, url: `/blog/${post.slug}/` } }
}

export async function PndBlogPostPage({ slug }: { slug: string }) {
  const [post, posts] = await Promise.all([getWebContentBySlug(slug), getPostsPage(1, 6)])
  if (!post || post.kind !== 'post') notFound()
  const related = posts.docs.filter((item) => item.slug !== post.slug).slice(0, 3)
  return <PndShell>
    <Breadcrumbs base="" items={[{ label: 'Góc tư vấn', href: '/blog/' }, { label: post.title }]} />
    <div className={styles.articleLayout}><article className={styles.article}><span>Góc tư vấn PND</span><h1>{post.title}</h1>{post.excerpt ? <p className={styles.articleLead}>{post.excerpt}</p> : null}{/* eslint-disable-next-line @next/next/no-img-element */}<img src={postImage(post, 0)} alt="" />{post.contentHtml ? <div className={styles.richContent} dangerouslySetInnerHTML={{ __html: prepareContentHtml(post.contentHtml) || '' }} /> : <p>Nội dung đang được biên tập. Vui lòng liên hệ PND Sport nếu bạn cần tư vấn ngay.</p>}<QuoteBand compact /></article><aside className={styles.articleAside}><h2>Bài liên quan</h2>{related.map((item) => <Link href={`/blog/${item.slug}/`} key={item.id}>{item.title}</Link>)}<h2>Tìm mẫu phù hợp</h2><Link href="/san-pham/">Xem toàn bộ sản phẩm</Link></aside></div>
  </PndShell>
}
