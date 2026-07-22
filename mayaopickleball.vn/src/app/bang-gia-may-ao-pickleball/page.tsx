import type { Metadata } from 'next'
import { ArrowRight, Check, CircleDollarSign, Palette, Shirt, Truck } from 'lucide-react'
import { InfoFooter, SiteHeader, phone, zaloHref } from '../_components/info-pages'
import { pageMetadata } from '../../lib/seo'

export const metadata: Metadata = pageMetadata({
  title: 'Bảng giá may áo pickleball | MayaoPickleball',
  description: 'Bảng giá tham khảo khi đặt may áo pickleball theo số lượng, chất liệu, thiết kế, tên số và logo CLB.',
  path: '/bang-gia-may-ao-pickleball',
})

const fabricColumns = [
  {
    name: 'Mè Thái',
    note: 'Cân bằng, dễ mặc',
    image: 'https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/vai-me-thai-ao-bong-ro-20260711-112613.jpg',
  },
  {
    name: 'Mè Zennix',
    note: 'Lên màu sắc nét',
    image: 'https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/vai-thun-lanh-ao-bong-ro-20260711-112610.jpg',
  },
  {
    name: 'Mè Nano',
    note: 'Mặt vải mịn',
    image: 'https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/vai-me-texa-ao-bong-ro-20260711-112616.jpg',
  },
  {
    name: 'Mè Lava',
    note: 'Thoáng khí',
    image: 'https://cdn.mayaobongro.vn/wp-content/uploads/2026/07/vai-me-lava-ao-bong-ro-20260711-112620.jpg',
  },
] as const

const priceRows = [
  { quantity: '5 - 9 áo', prices: ['145.000đ', '189.000đ', '219.000đ', '260.000đ'] },
  { quantity: '10 - 50 áo', prices: ['125.000đ', '169.000đ', '199.000đ', '240.000đ'] },
  { quantity: '50 - 100 áo', prices: ['115.000đ', '159.000đ', '189.000đ', '230.000đ'] },
  { quantity: '>100 áo', prices: ['105.000đ', '139.000đ', '169.000đ', '210.000đ'] },
] as const

const included = [
  { icon: Palette, title: 'Miễn phí thiết kế' },
  { icon: Shirt, title: 'Miễn phí in ấn' },
  { icon: Truck, title: 'Miễn phí vận chuyển' },
] as const

export default function PricePage() {
  return (
    <main className="site-page info-page price-page">
      <SiteHeader />

      <section className="price-page-head">
        <div>
          <p className="hero-kicker">Bảng giá may áo pickleball</p>
          <h1>Bảng giá may áo thể thao</h1>
          <p>
            Bảng giá theo chất liệu vải và số lượng đặt may. Hotline/Zalo: <a href={zaloHref}>{phone}</a>.
          </p>
        </div>
        <a className="primary-button" href={zaloHref}>
          Nhận báo giá <ArrowRight size={18} />
        </a>
      </section>

      <section className="price-board-section" aria-labelledby="price-table-title">
        <div className="price-board">
          <div className="price-board-title">
            <CircleDollarSign size={30} strokeWidth={1.7} />
            <div>
              <h2 id="price-table-title">Bảng giá theo chất vải và số lượng</h2>
              <p>Giá dưới đây tính theo áo, đã bao gồm thuế VAT.</p>
            </div>
          </div>

          <div className="price-table-scroll" role="region" aria-label="Bảng giá may áo pickleball theo chất vải và số lượng" tabIndex={0}>
            <table className="fabric-price-table">
              <caption>Bảng giá may áo pickleball theo chất vải và số lượng đặt may</caption>
              <thead>
                <tr>
                  <th className="quantity-heading" scope="col">
                    Số lượng đặt may
                  </th>
                  {fabricColumns.map((fabric, index) => (
                    <th className={index % 2 === 0 ? 'is-highlight' : ''} key={fabric.name} scope="col">
                      <span>{fabric.name}</span>
                      <small>{fabric.note}</small>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {priceRows.map((row, rowIndex) => (
                  <tr className={rowIndex % 2 === 0 ? 'is-muted' : ''} key={row.quantity}>
                    <th scope="row">{row.quantity}</th>
                    {row.prices.map((price) => (
                      <td key={`${row.quantity}-${price}`}>{price}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <div className="pants-note">
            <h2>Giá đã bao gồm quần</h2>
            <p><strong>Không lấy quần:</strong> giảm <b>20k/bộ</b> so với bảng giá trên.</p>
          </div>

          <div className="price-included-row">
            {included.map(({ icon: Icon, title }) => (
              <div key={title}>
                <span><Check size={18} strokeWidth={3} /></span>
                <strong>{title}</strong>
              </div>
            ))}
          </div>

          <p className="vat-note">Lưu ý: Giá trên đã bao gồm thuế VAT</p>
        </div>
      </section>

      <section className="fabric-surface-section">
        <div className="info-section-heading compact">
          <h2>Ảnh mặt vải tham khảo</h2>
          <p>Các ảnh bề mặt vải được lấy từ trang chất liệu của May Áo Bóng Rổ để đội dễ xem độ mịn, độ thoáng và kiểu dệt trước khi chốt đơn.</p>
        </div>
        <div className="fabric-surface-grid">
          {fabricColumns.map((fabric) => (
            <a className="fabric-surface-card" href={fabric.image} key={fabric.name} rel="noreferrer" target="_blank">
              <img alt={`Ảnh mặt vải ${fabric.name} dùng may áo pickleball`} src={fabric.image} />
              <span>{fabric.name}</span>
            </a>
          ))}
        </div>
      </section>

      <InfoFooter />
    </main>
  )
}
