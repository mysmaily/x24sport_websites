import { VariantPage } from '../../pndsport-preview/variant-page'

const base = '/pndsport-preview-v2'

export default async function PndPreviewV2Page({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  return <VariantPage path={path} base={base} />
}
