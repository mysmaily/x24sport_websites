import { notFound } from 'next/navigation'
import X24CategoryPage from '../../../danh-muc/[slug]/page'
import { RynoCategoryPage } from '../../ryno-catalog'
export default async function TenantCategoryPage(props: Parameters<typeof X24CategoryPage>[0] & { params: Promise<{ tenant: string; slug: string }> }) {
  const { tenant, slug } = await props.params
  if (tenant === 'rynosport') return <RynoCategoryPage slug={slug} />
  if (tenant !== 'x24sport') notFound()
  return <X24CategoryPage params={Promise.resolve({ slug })} searchParams={props.searchParams} />
}
