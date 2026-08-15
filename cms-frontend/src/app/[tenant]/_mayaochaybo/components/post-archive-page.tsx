import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Pagination } from '../../../_components/pagination'
import { firstLegacyImage } from '../lib/legacy-content'
import { getLatestPosts, getPostsBySlugs, type WebContent } from '../lib/cms'
import { canonical, DEFAULT_OG_IMAGE, excerpt } from '../lib/site'
import { JsonLd } from './json-ld'

function visibleText(value: string) {
  return value.replace(/[–—]/g, '-').replace(/\s+/g, ' ').trim()
}

function PostImage({ eager = false, post }: { eager?: boolean; post: WebContent }) {
  const image = firstLegacyImage(post.contentHtml) || DEFAULT_OG_IMAGE.url
  return <img
    alt={visibleText(post.title)}
    decoding="async"
    fetchPriority={eager ? 'high' : 'auto'}
    loading={eager ? 'eager' : 'lazy'}
    src={image}
  />
}

export async function PostArchivePage({ canonicalPath, description, page, postSlugs, title }: { canonicalPath: string; description: string; page: number; postSlugs?: readonly string[]; title: string }) {
  const perPage = 12
  let posts: WebContent[], totalPages: number
  if (postSlugs) {
    const all = await getPostsBySlugs([...postSlugs])
    posts = all.slice((page - 1) * perPage, page * perPage)
    totalPages = Math.ceil(all.length / perPage)
  } else {
    const result = await getLatestPosts(perPage, page)
    posts = result.docs
    totalPages = result.totalPages
  }
  const href = (value: number) => value === 1 ? canonicalPath : `${canonicalPath}?page=${value}`
  const featuredPost = canonicalPath === '/blog/' && page === 1 ? posts[0] : undefined
  const gridPosts = featuredPost ? posts.slice(1) : posts

  return <div className="section-shell mcb-blog-page">
    <JsonLd data={{ '@context': 'https://schema.org', '@type': 'BreadcrumbList', itemListElement: [{ '@type': 'ListItem', position: 1, name: 'Trang chủ', item: canonical('/') }, { '@type': 'ListItem', position: 2, name: title, item: canonical(canonicalPath) }] }} />

    <header className="mcb-blog-header">
      <p className="mcb-blog-kicker">Góc chạy bộ</p>
      <h1>{visibleText(title)}</h1>
      <p>{visibleText(description)}</p>
    </header>

    {featuredPost ? <article className="mcb-blog-featured">
      <Link aria-label={`Đọc ${visibleText(featuredPost.title)}`} className="mcb-blog-featured-media" href={featuredPost.legacyPath}>
        <PostImage eager post={featuredPost} />
      </Link>
      <div className="mcb-blog-featured-copy">
        <p>Bài mới</p>
        <h2><Link href={featuredPost.legacyPath}>{visibleText(featuredPost.title)}</Link></h2>
        <p>{visibleText(excerpt(featuredPost.excerpt, 220))}</p>
        <Link className="mcb-blog-read-link" href={featuredPost.legacyPath}>Đọc bài <ArrowRight aria-hidden="true" size={17} /></Link>
      </div>
    </article> : null}

    {gridPosts.length ? <div className="mcb-blog-grid">
      {gridPosts.map((post) => <article className="mcb-blog-card" key={post.id}>
        <Link aria-label={`Đọc ${visibleText(post.title)}`} className="mcb-blog-card-media" href={post.legacyPath}>
          <PostImage post={post} />
        </Link>
        <div className="mcb-blog-card-copy">
          <h2><Link href={post.legacyPath}>{visibleText(post.title)}</Link></h2>
          <p>{visibleText(excerpt(post.excerpt, 135))}</p>
          <Link className="mcb-blog-read-link" href={post.legacyPath}>Đọc bài <ArrowRight aria-hidden="true" size={16} /></Link>
        </div>
      </article>)}
    </div> : <div className="mcb-blog-empty"><h2>Chưa có bài viết trong mục này.</h2><p>Quay lại sau để xem các kinh nghiệm mới cho đội và giải chạy.</p></div>}

    <Pagination ariaLabel="Phân trang bài viết" hrefForPage={href} page={page} totalPages={totalPages} />
  </div>
}
