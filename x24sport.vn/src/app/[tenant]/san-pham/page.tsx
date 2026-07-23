import { notFound } from 'next/navigation'
import X24ProductsPage from '../../san-pham/page'
export default async function TenantProductsPage(props: Parameters<typeof X24ProductsPage>[0] & { params: Promise<{ tenant: string }> }) {
  if ((await props.params).tenant !== 'x24sport') notFound()
  return <X24ProductsPage searchParams={props.searchParams} />
}
