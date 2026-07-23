import { notFound } from 'next/navigation'
import X24ContactPage from '../../lien-he/page'
export default async function TenantContactPage({ params }: { params: Promise<{ tenant: string }> }) {
  if ((await params).tenant !== 'x24sport') notFound()
  return <X24ContactPage />
}
