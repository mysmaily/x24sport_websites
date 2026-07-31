import { notFound } from 'next/navigation'
import X24BlogPage from '../../blog/page'
import MayaoCauLongBlogPage, { generateMetadata as generateMayaoCauLongBlogMetadata } from '../_mayaocaulong/blog/page'
import MayaoPickleballBlogPage, { generateMetadata as generateMayaoPickleballBlogMetadata } from '../_mayaopickleball/blog/page'

type Props = Parameters<typeof X24BlogPage>[0] & { params: Promise<{ tenant: string }> }

export async function generateMetadata(props: Props) {
  const tenant = (await props.params).tenant
  if (tenant === 'mayaocaulong') return generateMayaoCauLongBlogMetadata({ searchParams: props.searchParams })
  if (tenant === 'mayaopickleball') return generateMayaoPickleballBlogMetadata({ searchParams: props.searchParams })
  return {}
}

export default async function TenantBlogPage(props: Props) {
  const tenant = (await props.params).tenant
  if (tenant === 'mayaocaulong') return <MayaoCauLongBlogPage searchParams={props.searchParams} />
  if (tenant === 'mayaopickleball') return <MayaoPickleballBlogPage searchParams={props.searchParams} />
  if (tenant !== 'x24sport') notFound()
  return <X24BlogPage searchParams={props.searchParams} />
}
