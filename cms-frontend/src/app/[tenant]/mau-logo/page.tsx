import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import LogoLibraryPage, { logoLibraryMetadata } from '../../mau-logo/page'

export async function generateMetadata({ params }: { params: Promise<{ tenant: string }> }): Promise<Metadata> {
  const { tenant } = await params
  if (tenant !== 'x24sport') return {}
  return logoLibraryMetadata
}

export default async function TenantLogoLibraryPage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant !== 'x24sport') notFound()
  return <LogoLibraryPage />
}
