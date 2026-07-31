import { headers } from 'next/headers'
import { notFound } from 'next/navigation'

export type TenantContext = {
  slug: 'x24sport' | 'rynosport' | 'mayaocaulong' | 'mayaopickleball' | 'mayaobongchuyen' | 'mayaobongro' | 'mayaochaybo' | 'mayaobongda'
  domain: string
  name: string
  description: string
}

const tenantsByHost: Record<string, TenantContext> = {
  'x24sport.vn': { slug: 'x24sport', domain: 'x24sport.vn', name: 'X24Sport', description: 'Khám phá trang phục bóng đá, cầu lông, bóng chuyền, bóng rổ, pickleball và chạy bộ tại X24Sport.' },
  'www.x24sport.vn': { slug: 'x24sport', domain: 'x24sport.vn', name: 'X24Sport', description: 'Khám phá trang phục bóng đá, cầu lông, bóng chuyền, bóng rổ, pickleball và chạy bộ tại X24Sport.' },
  '10.10.0.58': { slug: 'x24sport', domain: 'x24sport.vn', name: 'X24Sport', description: 'Khám phá trang phục bóng đá, cầu lông, bóng chuyền, bóng rổ, pickleball và chạy bộ tại X24Sport.' },
  'rynosport.vn': { slug: 'rynosport', domain: 'rynosport.vn', name: 'RynoSport', description: 'Khám phá trang phục thể thao tại RynoSport.' },
  'www.rynosport.vn': { slug: 'rynosport', domain: 'rynosport.vn', name: 'RynoSport', description: 'Khám phá trang phục thể thao tại RynoSport.' },
  'mayaocaulong.vn': { slug: 'mayaocaulong', domain: 'mayaocaulong.vn', name: 'MayaoCauLong', description: 'Đồng phục cầu lông đặt may, in tên số, logo và thiết kế theo màu đội cho CLB, trường lớp, doanh nghiệp.' },
  'www.mayaocaulong.vn': { slug: 'mayaocaulong', domain: 'mayaocaulong.vn', name: 'MayaoCauLong', description: 'Đồng phục cầu lông đặt may, in tên số, logo và thiết kế theo màu đội cho CLB, trường lớp, doanh nghiệp.' },
  'mayaopickleball.vn': { slug: 'mayaopickleball', domain: 'mayaopickleball.vn', name: 'MayaoPickleball', description: 'Đồng phục pickleball đặt may, in tên số, logo và thiết kế theo màu đội cho CLB, trường lớp, doanh nghiệp.' },
  'www.mayaopickleball.vn': { slug: 'mayaopickleball', domain: 'mayaopickleball.vn', name: 'MayaoPickleball', description: 'Đồng phục pickleball đặt may, in tên số, logo và thiết kế theo màu đội cho CLB, trường lớp, doanh nghiệp.' },
  'mayaobongchuyen.vn': { slug: 'mayaobongchuyen', domain: 'mayaobongchuyen.vn', name: 'MayaoBongChuyen', description: 'Đồng phục bóng chuyền đặt may, thiết kế theo màu đội, in tên số và logo cho câu lạc bộ, trường lớp, đội thi đấu.' },
  'www.mayaobongchuyen.vn': { slug: 'mayaobongchuyen', domain: 'mayaobongchuyen.vn', name: 'MayaoBongChuyen', description: 'Đồng phục bóng chuyền đặt may, thiết kế theo màu đội, in tên số và logo cho câu lạc bộ, trường lớp, đội thi đấu.' },
  'mayaobongro.vn': { slug: 'mayaobongro', domain: 'mayaobongro.vn', name: 'MayaoBongRo', description: 'Mẫu đồng phục bóng rổ và dịch vụ đặt may thiết kế riêng cho đội, câu lạc bộ và trường học.' },
  'www.mayaobongro.vn': { slug: 'mayaobongro', domain: 'mayaobongro.vn', name: 'MayaoBongRo', description: 'Mẫu đồng phục bóng rổ và dịch vụ đặt may thiết kế riêng cho đội, câu lạc bộ và trường học.' },
  'mayaochaybo.vn': { slug: 'mayaochaybo', domain: 'mayaochaybo.vn', name: 'MayaoChayBo', description: 'Mẫu áo chạy bộ và dịch vụ đặt may thiết kế riêng cho câu lạc bộ, giải chạy, đội nhóm và doanh nghiệp.' },
  'www.mayaochaybo.vn': { slug: 'mayaochaybo', domain: 'mayaochaybo.vn', name: 'MayaoChayBo', description: 'Mẫu áo chạy bộ và dịch vụ đặt may thiết kế riêng cho câu lạc bộ, giải chạy, đội nhóm và doanh nghiệp.' },
  'mayaobongda.vn': { slug: 'mayaobongda', domain: 'mayaobongda.vn', name: 'MayaoBongDa', description: 'Mẫu áo bóng đá thiết kế và áo không logo cho đội bóng, câu lạc bộ, công ty và giải phong trào.' },
  'www.mayaobongda.vn': { slug: 'mayaobongda', domain: 'mayaobongda.vn', name: 'MayaoBongDa', description: 'Mẫu áo bóng đá thiết kế và áo không logo cho đội bóng, câu lạc bộ, công ty và giải phong trào.' },
}

function hostname(value: string | null) {
  return (value || '').split(',')[0].trim().toLowerCase().replace(/:\d+$/, '')
}

/**
 * Resolves the public tenant from the request Host header.  Keep this allow-list
 * in sync with the reverse-proxy server names; never select a tenant directly
 * from a client supplied query parameter or cookie.
 */
export async function getTenantContext(): Promise<TenantContext> {
  const requestHeaders = await headers()
  const host = hostname(requestHeaders.get('host'))
  if (host === 'localhost' || host === '127.0.0.1' || !host) return tenantsByHost['x24sport.vn']

  const tenant = tenantsByHost[host]
  if (!tenant) notFound()
  return tenant
}

export async function getTenantSlug() {
  return (await getTenantContext()).slug
}

export async function getTenantBaseUrl() {
  return `https://${(await getTenantContext()).domain}`
}
