import { notFound } from 'next/navigation'

import MayaoCauLongBlogPostPage, { generateMetadata as generateMayaoCauLongBlogPostMetadata } from '../../_mayaocaulong/blog/[slug]/page'
import MayaoPickleballBlogPostPage, { generateMetadata as generateMayaoPickleballBlogPostMetadata } from '../../_mayaopickleball/blog/[slug]/page'

type Props = {
  params: Promise<{ tenant: string; slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { tenant, slug } = await params
  if (tenant === 'pndsport') {
    const { getPndBlogPostMetadata } = await import('../../_pndsport/blog-post-page')
    return getPndBlogPostMetadata(slug)
  }
  if (tenant === 'mayaodongphuc') {
    const { getMayAoDongPhucBlogPostMetadata } = await import('../../_mayaodongphuc/blog-post-page')
    return getMayAoDongPhucBlogPostMetadata(slug)
  }
  if (tenant === 'mayaopickleball') return generateMayaoPickleballBlogPostMetadata({ params: Promise.resolve({ slug }) })
  if (tenant !== 'mayaocaulong') return {}
  return generateMayaoCauLongBlogPostMetadata({ params: Promise.resolve({ slug }) })
}

export default async function TenantBlogPostPage({ params }: Props) {
  const { tenant, slug } = await params
  if (tenant === 'pndsport') {
    const { PndBlogPostPage } = await import('../../_pndsport/blog-post-page')
    return <PndBlogPostPage slug={slug} />
  }
  if (tenant === 'mayaodongphuc') {
    const { MayAoDongPhucBlogPostPage } = await import('../../_mayaodongphuc/blog-post-page')
    return <MayAoDongPhucBlogPostPage slug={slug} />
  }
  if (tenant === 'mayaopickleball') return <MayaoPickleballBlogPostPage params={Promise.resolve({ slug })} />
  if (tenant !== 'mayaocaulong') notFound()
  return <MayaoCauLongBlogPostPage params={Promise.resolve({ slug })} />
}
