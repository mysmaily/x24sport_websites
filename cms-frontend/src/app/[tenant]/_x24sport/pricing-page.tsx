import { ArrowRight, Check, CircleDollarSign } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { FloatingContact, StoreFooter } from '../../_components/store-footer'
import { SiteHeader } from '../../_components/site-header'
import { getCategories } from '../../../lib/content'
import { absoluteUrl } from '../../../lib/seo'

type SportPricing = {
  contactUnit: string
  description: string
  href: string
  name: string
  priceUnit: string
  slug: string
}

export const x24PricingPages: Record<string, SportPricing> = {
  football: {
    contactUnit: 'bộ',
    description: 'Bảng giá tham khảo khi đặt may áo bóng đá theo số lượng, chất liệu, tên số, logo và nhu cầu thiết kế riêng.',
    href: '/bang-gia-may-ao-bong-da/',
    name: 'bóng đá',
    priceUnit: 'bộ',
    slug: 'bong-da',
  },
  volleyball: {
    contactUnit: 'bộ',
    description: 'Bảng giá tham khảo khi đặt may áo bóng chuyền theo số lượng, chất liệu, tên số, logo và nhu cầu thiết kế riêng.',
    href: '/bang-gia-may-ao-bong-chuyen/',
    name: 'bóng chuyền',
    priceUnit: 'bộ',
    slug: 'bong-chuyen',
  },
  basketball: {
    contactUnit: 'bộ',
    description: 'Bảng giá tham khảo đồng phục bóng rổ theo chất liệu, số lượng, thiết kế, tên số và logo đội.',
    href: '/bang-gia-may-ao-bong-ro/',
    name: 'bóng rổ',
    priceUnit: 'bộ',
    slug: 'bong-ro',
  },
  badminton: {
    contactUnit: 'áo',
    description: 'Bảng giá tham khảo khi đặt may áo cầu lông theo chất vải, số lượng, thiết kế, tên số và logo CLB.',
    href: '/bang-gia-may-ao-cau-long/',
    name: 'cầu lông',
    priceUnit: 'áo',
    slug: 'cau-long',
  },
  pickleball: {
    contactUnit: 'áo',
    description: 'Bảng giá tham khảo khi đặt may áo pickleball theo số lượng, chất liệu, thiết kế, tên số và logo CLB.',
    href: '/bang-gia-may-ao-pickleball/',
    name: 'pickleball',
    priceUnit: 'áo',
    slug: 'pickleball',
  },
  running: {
    contactUnit: 'áo',
    description: 'Bảng giá tham khảo khi đặt may áo chạy bộ cho đội nhóm, câu lạc bộ, doanh nghiệp và giải chạy.',
    href: '/bang-gia-may-ao-chay-bo/',
    name: 'chạy bộ',
    priceUnit: 'áo',
    slug: 'chay-bo',
  },
}

const priceRows = [
  ['5 - 9', '145.000đ', '189.000đ', '219.000đ', '260.000đ'],
  ['10 - 50', '125.000đ', '169.000đ', '199.000đ', '240.000đ'],
  ['50 - 100', '115.000đ', '159.000đ', '189.000đ', '230.000đ'],
  ['Trên 100', '105.000đ', '139.000đ', '169.000đ', '210.000đ'],
] as const

const included = [
  ['Thiết kế', 'Hỗ trợ lên maket theo màu đội, logo và phong cách thi đấu.'],
  ['In ấn', 'Bao gồm in tên số hoặc logo cơ bản theo danh sách đội gửi trước khi sản xuất.'],
  ['Tư vấn chất liệu', 'Đối chiếu ngân sách, số lượng và lịch sử dụng để chọn chất vải phù hợp.'],
  ['VAT & vận chuyển', 'Bảng giá tham khảo đã bao gồm VAT và phí giao hàng toàn quốc.'],
] as const

export function x24PricingMetadata(page: SportPricing): Metadata {
  const title = `Bảng giá may áo ${page.name}`
  return {
    title,
    description: page.description,
    alternates: { canonical: page.href },
    openGraph: {
      title,
      description: page.description,
      type: 'website',
      url: absoluteUrl(page.href),
    },
  }
}

export async function X24PricingPage({ page }: { page: SportPricing }) {
  const categories = await getCategories()

  return (
    <div className="storefront-page">
      <SiteHeader />
      <main className="site-container" id="noi-dung">
        <section className="process-highlight" style={{ marginTop: 24 }}>
          <span>X24SPORT / BẢNG GIÁ</span>
          <h1>Bảng giá may áo {page.name}</h1>
          <p>{page.description} Gửi mẫu, số lượng và ngày cần nhận để X24Sport tư vấn báo giá sát hơn.</p>
          <a href="tel:0989353247">Nhận tư vấn <ArrowRight size={18} /></a>
        </section>

        <section className="brand-story" aria-labelledby="x24-pricing-table-title">
          <div className="brand-story-copy">
            <p className="eyebrow"><span />So sánh trực tiếp</p>
            <h2 id="x24-pricing-table-title">Bảng giá theo chất liệu và số lượng</h2>
            <p>Giá bên dưới được tổng hợp theo nội dung bảng giá của website vệ tinh tương ứng. Nếu không lấy quần trong đơn theo bộ, giá giảm 20.000đ/bộ.</p>
          </div>
          <aside className="brand-story-media" aria-label="Tóm tắt bảng giá">
            <div>
              <span><CircleDollarSign size={18} /> Giá tham khảo từ</span>
              <strong>105.000đ/{page.priceUnit}</strong>
            </div>
          </aside>
        </section>

        <section className="product-shelf" aria-label={`Bảng giá may áo ${page.name}`}>
          <div className="shelf-products" style={{ width: '100%' }}>
            <div className="price-table-scroll" role="region" aria-label={`Bảng giá may áo ${page.name}`} tabIndex={0}>
              <table className="fabric-price-table">
                <caption>Bảng giá may áo {page.name} theo chất liệu và số lượng</caption>
                <thead>
                  <tr>
                    <th className="quantity-heading" scope="col">Số lượng</th>
                    <th scope="col"><span>Mè Thái</span><small>Cân bằng, dễ mặc</small></th>
                    <th className="is-highlight" scope="col"><span>Mè Zennix</span><small>Lên màu sắc nét</small></th>
                    <th scope="col"><span>Mè Nano</span><small>Mặt vải mịn</small></th>
                    <th className="is-highlight" scope="col"><span>Mè Lava</span><small>Thoáng khí</small></th>
                  </tr>
                </thead>
                <tbody>
                  {priceRows.map((row, rowIndex) => (
                    <tr className={rowIndex % 2 === 0 ? 'is-muted' : ''} key={row[0]}>
                      <th scope="row">{row[0]} {page.contactUnit}</th>
                      {row.slice(1).map((price) => <td key={`${row[0]}-${price}`}>{price}</td>)}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="brand-facts" style={{ marginTop: 24 }}>
              {included.map(([title, text]) => (
                <div key={title}>
                  <Check />
                  <strong>{title}</strong>
                  <span>{text}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="process-highlight">
          <span>X24SPORT CUSTOM TEAMWEAR</span>
          <h2>Cần báo giá sát mẫu của đội?</h2>
          <p>Gửi bộ môn, số lượng, logo, màu áo, danh sách tên số và thời gian cần nhận.</p>
          <a href="tel:0989353247">Gọi X24Sport <ArrowRight size={18} /></a>
          <Link href={`/danh-muc/${page.slug}`}>Xem danh mục áo {page.name}</Link>
        </section>
      </main>
      <StoreFooter categories={categories} />
      <FloatingContact />
    </div>
  )
}
