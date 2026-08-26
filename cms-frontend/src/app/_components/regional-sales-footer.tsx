import { Headphones, MapPin, Phone } from 'lucide-react'

import {
  regionalSalesContacts,
  regionalSalesRole,
  regionalSalesZaloHref,
} from '../../lib/regional-sales-contacts'

export function RegionalSalesFooter() {
  return (
    <section aria-labelledby="regional-sales-footer-title" className="x24-regional-sales-footer" id="tu-van-3-mien">
      <div className="x24-regional-sales-footer-inner">
        <header>
          <span><Headphones aria-hidden="true" /> Hỗ trợ bán hàng toàn quốc</span>
          <h2 id="regional-sales-footer-title">Tư vấn thiết kế theo 3 miền</h2>
          <p>Chọn khu vực phù hợp để trao đổi nhanh về mẫu áo, thiết kế và đơn hàng.</p>
        </header>
        <div className="x24-regional-sales-footer-grid">
          {regionalSalesContacts.map((contact) => {
            const role = regionalSalesRole(contact.region)
            return (
              <article key={contact.region}>
                <span className="x24-regional-sales-footer-pin"><MapPin aria-hidden="true" /></span>
                <div className="x24-regional-sales-footer-copy">
                  <small>{role}</small>
                  <strong>{contact.name}</strong>
                  <a className="x24-regional-sales-footer-phone" href={`tel:${contact.phone}`}>{contact.phoneLabel}</a>
                </div>
                <div className="x24-regional-sales-footer-actions">
                  <a aria-label={`Gọi ${contact.name}, ${role}`} className="is-call" href={`tel:${contact.phone}`}>
                    <Phone aria-hidden="true" />
                  </a>
                  <a
                    aria-label={`Chat Zalo với ${contact.name}, ${role}`}
                    className="is-zalo"
                    href={regionalSalesZaloHref(contact.phone)}
                    rel="noreferrer"
                    target="_blank"
                  >
                    <img alt="" height={24} src="/icons/zalo.svg" width={24} />
                  </a>
                </div>
              </article>
            )
          })}
        </div>
      </div>
    </section>
  )
}
