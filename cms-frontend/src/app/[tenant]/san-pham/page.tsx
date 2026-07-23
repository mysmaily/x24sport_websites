import { notFound } from 'next/navigation'
import X24ProductsPage from '../../san-pham/page'
import { RynoProductsPage } from '../ryno-catalog'
export default async function TenantProductsPage(props: Parameters<typeof X24ProductsPage>[0] & { params: Promise<{ tenant: string }> }) {
  const { tenant } = await props.params
  if (tenant === 'rynosport') return <RynoProductsPage searchParams={props.searchParams} />
  if (tenant !== 'x24sport') notFound()
  return <X24ProductsPage searchParams={props.searchParams} />
}
