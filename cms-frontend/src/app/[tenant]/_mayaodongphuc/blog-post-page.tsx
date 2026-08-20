import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'

import { getPostsPage, getWebContentBySlug, prepareContentHtml } from '../../../lib/content'
import { Breadcrumbs } from './components'
import styles from './mayaodongphuc.module.css'
import { MayAoDongPhucShell } from './shell'

const ARTICLE_IMAGE = '/images/mayaodongphuc/polo-navy.webp'

export async function getMayAoDongPhucBlogPostMetadata(slug: string): Promise<Metadata> {
  const post = await getWebContentBySlug(slug)
  if (!post || post.kind !== 'post') return { title: 'Không tìm thấy bài viết' }
  const description = post.excerpt || `Đọc hướng dẫn ${post.title} tại May Áo Đồng Phục.`
  return {
    title: post.title,
    description,
    alternates: { canonical: `/blog/${post.slug}/` },
    openGraph: { title: post.title, description, url: `/blog/${post.slug}/` },
  }
}

export async function MayAoDongPhucBlogPostPage({ slug }: { slug: string }) {
  const [post, posts] = await Promise.all([getWebContentBySlug(slug), getPostsPage(1, 6)])
  if (!post || post.kind !== 'post') notFound()
  const related = posts.docs.filter((item) => item.slug !== post.slug).slice(0, 4)

  return <MayAoDongPhucShell>
    <article className={styles.articleLayout}>
      <Breadcrumbs items={[{ label: 'Góc tư vấn', href: '/blog/' }, { label: post.title }]} />
      <div className={styles.articleHeader}>
        <span>TƯ VẤN ĐỒNG PHỤC</span>
        <h1>{post.title}</h1>
        {post.excerpt ? <p>{post.excerpt}</p> : null}
      </div>
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img className={styles.articleImage} src={ARTICLE_IMAGE} alt="" height={630} width={1200} />
      <div className={styles.articleBody}>
        <div className={styles.richContent} dangerouslySetInnerHTML={{ __html: prepareContentHtml(post.contentHtml) || '<p>Nội dung đang được biên tập.</p>' }} />
        <aside className={styles.articleAside}>
          <h2>Bài liên quan</h2>
          {related.map((item) => <Link href={`/blog/${item.slug}/`} key={item.id}>{item.title}</Link>)}
          <h2>Chuẩn bị báo giá</h2>
          <Link href="/san-pham/">Xem mẫu đồng phục</Link>
          <Link href="/#quy-trinh">Xem quy trình đặt may</Link>
        </aside>
      </div>
    </article>
  </MayAoDongPhucShell>
}
