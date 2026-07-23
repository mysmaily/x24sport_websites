import { notFound } from 'next/navigation'
import X24HomePage from '../page'

export default async function TenantHomePage({ params }: { params: Promise<{ tenant: string }> }) {
  const { tenant } = await params
  if (tenant === 'x24sport') return <X24HomePage />
  if (tenant !== 'rynosport') notFound()

  return <main className="site-container" id="noi-dung" style={{ minHeight: '100vh', display: 'grid', placeItems: 'center', textAlign: 'center' }}>
    <section><p className="eyebrow"><span />RYNOSPORT</p><h1>Trang phục thể thao RynoSport</h1><p>Danh mục sản phẩm sẽ sớm được cập nhật.</p></section>
  </main>
}
