import { notFound, permanentRedirect } from 'next/navigation'

export default async function TenantStaticPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant !== 'mayaobongda') notFound()
  permanentRedirect('/thiet-ke-ao-bong-da-ngan-hang/')
}
