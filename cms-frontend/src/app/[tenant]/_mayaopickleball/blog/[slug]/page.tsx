import type { Metadata } from 'next'
import { notFound } from 'next/navigation'

import { getPostBySlug } from '../../lib/content'
import { pageMetadata } from '../../lib/seo'

type Props = {
  params: Promise<{ slug: string }>
}

type RichTextNode = {
  text?: string
  children?: RichTextNode[]
}

function flattenRichText(node?: RichTextNode): string[] {
  if (!node) return []
  if (node.text?.trim()) return [node.text.trim()]
  return (node.children || []).flatMap(flattenRichText)
}

function postParagraphs(post: Awaited<ReturnType<typeof getPostBySlug>>) {
  const bodyChildren = post?.body?.root?.children || []
  const paragraphs = bodyChildren
    .map((child) => flattenRichText(child).join(' ').trim())
    .filter(Boolean)

  return paragraphs.length ? paragraphs : post?.excerpt ? [post.excerpt] : []
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) return {}

  return pageMetadata({
    title: `${post.title} | MayaoPickleball`,
    description: post.excerpt,
    path: `/blog/${post.slug}`,
  })
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params
  const post = await getPostBySlug(slug)
  if (!post) notFound()

  return (
    <main className="blog-detail-page">
      <article>
        <a className="blog-back-link" href="/blog/">← Blog áo pickleball</a>
        <p className="section-eyebrow">Bài viết</p>
        <h1>{post.title}</h1>
        <p className="blog-detail-excerpt">{post.excerpt}</p>
        <div className="blog-detail-content">
          {postParagraphs(post).map((paragraph, index) => (
            <p key={index}>{paragraph}</p>
          ))}
        </div>
      </article>
    </main>
  )
}
