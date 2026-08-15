import { notFound } from 'next/navigation'
import X24BlogPage from '../../blog/page'
import MayaoCauLongBlogPage, { generateMetadata as generateMayaoCauLongBlogMetadata } from '../_mayaocaulong/blog/page'
import MayaoPickleballBlogPage, { generateMetadata as generateMayaoPickleballBlogMetadata } from '../_mayaopickleball/blog/page'
import MayaoBongChuyenContentPage, { generateMetadata as generateMayaoBongChuyenContentMetadata } from '../_mayaobongchuyen/[slug]/page'
import MayaoChayBoBlogPage, { generateMetadata as generateMayaoChayBoBlogMetadata } from '../_mayaochaybo/blog/page'
import { MayaoChayBoShell } from '../_mayaochaybo/shell'
import MayaoBongDaBlogPage, { generateMetadata as generateMayaoBongDaBlogMetadata } from '../_mayaobongda/blog/page'
import { MayaoBongDaShell } from '../_mayaobongda/shell'

type Props = Parameters<typeof X24BlogPage>[0] & { params: Promise<{ tenant: string }> }

export async function generateMetadata(props: Props) {
  const tenant = (await props.params).tenant
  if (tenant === 'pndsport') {
    const { getPndBlogMetadata } = await import('../_pndsport/blog-page')
    return getPndBlogMetadata(Math.max(1, Number((await props.searchParams).page) || 1))
  }
  if (tenant === 'mayaocaulong') return generateMayaoCauLongBlogMetadata({ searchParams: props.searchParams })
  if (tenant === 'mayaopickleball') return generateMayaoPickleballBlogMetadata({ searchParams: props.searchParams })
  if (tenant === 'mayaobongchuyen') return generateMayaoBongChuyenContentMetadata({ params: Promise.resolve({ slug: 'blog' }) })
  if (tenant === 'mayaochaybo') return generateMayaoChayBoBlogMetadata({ searchParams: props.searchParams })
  if (tenant === 'mayaobongda') return generateMayaoBongDaBlogMetadata({ searchParams: props.searchParams })
  return {}
}

export default async function TenantBlogPage(props: Props) {
  const tenant = (await props.params).tenant
  if (tenant === 'pndsport') {
    const { PndBlogPage } = await import('../_pndsport/blog-page')
    return <PndBlogPage page={Math.max(1, Number((await props.searchParams).page) || 1)} />
  }
  if (tenant === 'mayaocaulong') return <MayaoCauLongBlogPage searchParams={props.searchParams} />
  if (tenant === 'mayaopickleball') return <MayaoPickleballBlogPage searchParams={props.searchParams} />
  if (tenant === 'mayaobongchuyen') return <MayaoBongChuyenContentPage params={Promise.resolve({ slug: 'blog' })} />
  if (tenant === 'mayaochaybo') return <MayaoChayBoShell><MayaoChayBoBlogPage searchParams={props.searchParams} /></MayaoChayBoShell>
  if (tenant === 'mayaobongda') return <MayaoBongDaShell><MayaoBongDaBlogPage searchParams={props.searchParams} /></MayaoBongDaShell>
  if (tenant !== 'x24sport') notFound()
  return <X24BlogPage searchParams={props.searchParams} />
}
