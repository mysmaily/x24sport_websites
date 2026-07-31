import { notFound, permanentRedirect } from 'next/navigation'

type Props = { params: Promise<{ tenant: string }> }

export default async function TenantPickleballLegacySamplesPage({ params }: Props) {
  if ((await params).tenant !== 'mayaopickleball') notFound()
  permanentRedirect('/mau-da-lam/')
}
