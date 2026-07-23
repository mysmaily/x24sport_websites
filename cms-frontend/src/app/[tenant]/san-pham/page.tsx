import { notFound } from 'next/navigation'
import X24ProductsPage from '../../san-pham/page'
export default async function TenantProductsPage(props: Parameters<typeof X24ProductsPage>[0] & { params: Promise<{ tenant: string }> }) {
  if (!['x24sport', 'rynosport'].includes((await props.params).tenant)) notFound()
  return <X24ProductsPage searchParams={props.searchParams} />
}
