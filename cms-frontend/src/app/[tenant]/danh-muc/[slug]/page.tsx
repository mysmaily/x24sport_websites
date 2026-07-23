import { notFound } from 'next/navigation'
import X24CategoryPage from '../../../danh-muc/[slug]/page'
export default async function TenantCategoryPage(props: Parameters<typeof X24CategoryPage>[0] & { params: Promise<{ tenant: string; slug: string }> }) {
  const { tenant, slug } = await props.params
  if (!['x24sport', 'rynosport'].includes(tenant)) notFound()
  return <X24CategoryPage params={Promise.resolve({ slug })} searchParams={props.searchParams} />
}
