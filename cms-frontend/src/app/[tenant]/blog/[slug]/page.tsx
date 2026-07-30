import { notFound } from 'next/navigation'

import MayaoCauLongBlogPostPage, { generateMetadata as generateMayaoCauLongBlogPostMetadata } from '../../_mayaocaulong/blog/[slug]/page'

type Props = {
  params: Promise<{ tenant: string; slug: string }>
}

export async function generateMetadata({ params }: Props) {
  const { tenant, slug } = await params
  if (tenant !== 'mayaocaulong') return {}
  return generateMayaoCauLongBlogPostMetadata({ params: Promise.resolve({ slug }) })
}

export default async function TenantBlogPostPage({ params }: Props) {
  const { tenant, slug } = await params
  if (tenant !== 'mayaocaulong') notFound()
  return <MayaoCauLongBlogPostPage params={Promise.resolve({ slug })} />
}
