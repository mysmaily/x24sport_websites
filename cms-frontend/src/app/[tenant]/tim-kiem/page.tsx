import { notFound } from 'next/navigation'
import X24SearchPage, { generateMetadata as generateX24SearchMetadata } from '../../tim-kiem/page'

type TenantSearchProps = Parameters<typeof X24SearchPage>[0] & {
  params: Promise<{ tenant: string }>
}

export async function generateMetadata({ params, searchParams }: TenantSearchProps) {
  const { tenant } = await params
  if (tenant !== 'x24sport') return {}
  return generateX24SearchMetadata({ searchParams })
}

export default async function TenantSearchPage(props: TenantSearchProps) {
  const { tenant } = await props.params
  if (tenant !== 'x24sport') notFound()
  return <X24SearchPage searchParams={props.searchParams} />
}
