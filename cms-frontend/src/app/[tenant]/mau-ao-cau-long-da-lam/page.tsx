import { notFound, permanentRedirect } from 'next/navigation'

export default async function LegacySamplesPage({ params }: { params: Promise<{ tenant: string }> }) {
  if ((await params).tenant !== 'mayaocaulong') notFound()
  permanentRedirect('/mau-da-lam/')
}
