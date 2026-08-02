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

const fabricColumns = [
  ['Mè Thái', 'Cân bằng, dễ mặc'],
  ['Mè Zennix', 'Lên màu sắc nét'],
  ['Mè Nano', 'Mặt vải mịn'],
  ['Mè Lava', 'Thoáng khí'],
] as const

const included = [
  ['Thiết kế', 'Hỗ trợ lên maket theo màu đội, logo và phong cách thi đấu.'],
  ['In ấn', 'Bao gồm in tên số hoặc logo cơ bản theo danh sách đội gửi trước khi sản xuất.'],
  ['Tư vấn chất liệu', 'Đối chiếu ngân sách, số lượng và lịch sử dụng để chọn chất vải phù hợp.'],
  ['VAT & vận chuyển', 'Bảng giá tham khảo đã bao gồm VAT và phí giao hàng toàn quốc.'],
] as const

const orderSteps = [
  ['Gửi mẫu', 'Gửi bộ môn, logo, màu chủ đạo và mẫu áo đội đang thích.'],
  ['Chọn vải', 'X24Sport tư vấn chất liệu theo ngân sách, lịch thi đấu và số lượng.'],
  ['Duyệt thiết kế', 'Kiểm tra maket, tên số, logo và thông tin in trước khi sản xuất.'],
  ['Chốt sản xuất', 'Xưởng lên lịch may in và giao hàng theo thời gian đã thống nhất.'],
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
      <main className="x24-price-page" id="noi-dung">
        <section className="x24-price-hero">
          <div className="x24-price-hero-copy">
            <nav className="x24-price-breadcrumb" aria-label="Breadcrumb">
              <Link href="/">Trang chủ</Link>
              <span>/</span>
              <Link href={`/danh-muc/${page.slug}`}>Áo {page.name}</Link>
            </nav>
            <p className="x24-price-kicker">X24Sport bảng giá</p>
            <h1>Bảng giá may áo {page.name}</h1>
            <p>{page.description} Gửi mẫu, số lượng và ngày cần nhận để X24Sport tư vấn báo giá sát hơn.</p>
            <div className="x24-price-actions">
              <a href="tel:0989353247">Nhận tư vấn <ArrowRight size={18} /></a>
              <Link href={`/danh-muc/${page.slug}`}>Xem mẫu áo {page.name}</Link>
            </div>
          </div>
          <aside className="x24-price-summary" aria-label="Tóm tắt bảng giá">
            <div className="x24-price-summary-top">
              <CircleDollarSign size={24} />
              <span>Giá tham khảo từ</span>
            </div>
            <strong>105.000đ/{page.priceUnit}</strong>
            <dl>
              <div>
                <dt>Đơn tối thiểu</dt>
                <dd>5 {page.contactUnit}</dd>
              </div>
              <div>
                <dt>Tư vấn</dt>
                <dd>Hotline 0989 353 247</dd>
              </div>
              <div>
                <dt>Áp dụng</dt>
                <dd>Theo chất liệu và số lượng</dd>
              </div>
            </dl>
          </aside>
        </section>

        <section className="x24-price-board" aria-labelledby="x24-pricing-table-title">
          <div className="x24-price-board-heading">
            <div>
              <p className="x24-price-kicker">So sánh nhanh</p>
              <h2 id="x24-pricing-table-title">Bảng giá theo chất liệu và số lượng</h2>
            </div>
            <p>Giá tham khảo cho đơn hàng may áo đội nhóm. Nếu không lấy quần trong đơn theo bộ, giá giảm 20.000đ/bộ.</p>
          </div>

          <div className="x24-price-table-wrap" role="region" aria-label={`Bảng giá may áo ${page.name}`} tabIndex={0}>
            <table className="x24-price-table">
              <caption>Bảng giá may áo {page.name} theo chất liệu và số lượng</caption>
              <thead>
                <tr>
                  <th scope="col">Số lượng</th>
                  {fabricColumns.map(([name, note], index) => (
                    <th className={index % 2 === 1 ? 'is-highlight' : undefined} scope="col" key={name}>
                      <span>{name}</span>
                      <small>{note}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {priceRows.map((row) => (
                  <tr key={row[0]}>
                    <th scope="row">{row[0]} {page.contactUnit}</th>
                    {row.slice(1).map((price, index) => (
                      <td className={index % 2 === 1 ? 'is-highlight' : undefined} key={`${row[0]}-${price}`}>
                        {price}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        <section className="x24-price-includes" aria-label="Dịch vụ đi kèm">
          {included.map(([title, text]) => (
            <div key={title}>
              <Check />
              <strong>{title}</strong>
              <span>{text}</span>
            </div>
          ))}
        </section>

        <section className="x24-price-steps" aria-labelledby="x24-price-steps-title">
          <div className="x24-price-steps-heading">
            <p className="x24-price-kicker">Quy trình đặt may</p>
            <h2 id="x24-price-steps-title">Từ ý tưởng đến áo thành phẩm</h2>
          </div>
          <div className="x24-price-step-grid">
            {orderSteps.map(([title, text]) => (
              <div key={title}>
                <strong>{title}</strong>
                <p>{text}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="x24-price-cta">
          <div>
            <p className="x24-price-kicker">Báo giá theo mẫu riêng</p>
            <h2>Cần báo giá sát mẫu của đội?</h2>
            <p>Gửi bộ môn, số lượng, logo, màu áo, danh sách tên số và thời gian cần nhận.</p>
          </div>
          <div className="x24-price-actions">
            <a href="tel:0989353247">Gọi X24Sport <ArrowRight size={18} /></a>
            <Link href={`/danh-muc/${page.slug}`}>Xem danh mục áo {page.name}</Link>
          </div>
        </section>
      </main>
      <StoreFooter categories={categories} />
      <FloatingContact />
    </div>
  )
}
