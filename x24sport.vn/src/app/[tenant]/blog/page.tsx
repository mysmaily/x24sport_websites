import { notFound } from 'next/navigation'
import X24BlogPage from '../../blog/page'
export default async function TenantBlogPage(props: Parameters<typeof X24BlogPage>[0] & { params: Promise<{ tenant: string }> }) {
  if ((await props.params).tenant !== 'x24sport') notFound()
  return <X24BlogPage searchParams={props.searchParams} />
}
