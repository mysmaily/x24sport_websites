import { notFound } from 'next/navigation'
import X24LegacyPage from '../../[...legacy]/page'
export default async function TenantLegacyPage(props: Parameters<typeof X24LegacyPage>[0] & { params: Promise<{ tenant: string; legacy: string[] }> }) {
  const { tenant, legacy } = await props.params
  if (!['x24sport', 'rynosport'].includes(tenant)) notFound()
  return <X24LegacyPage params={Promise.resolve({ legacy })} searchParams={props.searchParams} />
}
