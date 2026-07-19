import { notFound, permanentRedirect } from 'next/navigation'
import { resolveProductSlug } from '@/lib/cms'
export const dynamic = 'force-dynamic'
export default async function LegacyProductPage({ params }: { params: Promise<{ slug: string }> }) { const product = await resolveProductSlug((await params).slug); if (!product) notFound(); permanentRedirect(product.legacyPath || `/${product.slug}/`) }
