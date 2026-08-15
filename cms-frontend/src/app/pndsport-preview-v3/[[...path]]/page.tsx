import { VariantPage } from '../../pndsport-preview/variant-page'

const base = '/pndsport-preview-v3'

export default async function PndPreviewV3Page({ params }: { params: Promise<{ path?: string[] }> }) {
  const { path } = await params
  return <VariantPage path={path} base={base} heroImage="/images/pndsport/hero-v3.webp" heroDescription="Chọn mẫu theo môn, gửi màu sắc, logo và tên số để PND hoàn thiện theo đội." />
}
