import type { Metadata } from 'next'
import { Clock3, MapPin, Phone } from 'lucide-react'
import { JsonLd } from '../_components/json-ld'
import { SiteHeader } from '../_components/site-header'
import { contactItems } from '../../lib/contact'
import { absoluteUrl, siteLogoUrl } from '../../lib/seo'
import { ContactForm } from './contact-form'

export const metadata: Metadata = {
  title: 'Liên hệ',
  description: 'Liên hệ X24Sport để tư vấn thiết kế và sản xuất trang phục thể thao theo yêu cầu.',
  alternates: { canonical: '/lien-he/' },
  openGraph: {
    title: 'Liên hệ X24Sport',
    description: 'Kênh tư vấn thiết kế và sản xuất trang phục thể thao theo yêu cầu của X24Sport.',
    url: '/lien-he/',
  },
}

export default function ContactPage() {
  const organization = {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: 'X24Sport',
    url: absoluteUrl('/'),
    logo: siteLogoUrl(),
    telephone: '+84-989-353-247',
    email: 'x24sport.vn@gmail.com',
    sameAs: ['https://www.facebook.com/vnx24sport/'],
  }
  return (
    <div className="contact-page">
      <JsonLd data={organization} />
      <SiteHeader />
      <main id="noi-dung">
        <section className="contact-hero">
          <div className="site-container">
            <p className="eyebrow"><span />X24SPORT CONTACT</p>
            <h1>Liên hệ X24Sport</h1>
            <p>Gửi yêu cầu tư vấn thiết kế, đặt đồng phục đội nhóm hoặc ghé showroom gần bạn.</p>
          </div>
        </section>

        <section className="site-container contact-layout" aria-label="Thông tin liên hệ X24Sport">
          <div className="contact-card contact-info-panel">
            <h2>Thông tin liên hệ</h2>
            <div className="contact-list">
              {contactItems.map((item) => {
                const Icon = item.icon
                const content = <><Icon size={18} /><span><strong>{item.label}:</strong> {item.value}</span></>
                return item.href
                  ? <a href={item.href} key={`${item.label}-${item.value}`}>{content}</a>
                  : <p key={`${item.label}-${item.value}`}>{content}</p>
              })}
            </div>
            <div className="contact-mini-facts">
              <div><Clock3 /><span><strong>08:00 - 22:00</strong><small>Tư vấn mỗi ngày</small></span></div>
              <div><Phone /><span><strong>0989 353 247</strong><small>Hotline đặt áo</small></span></div>
              <div><MapPin /><span><strong>Hà Nội / TP.HCM</strong><small>Showroom và xưởng sản xuất</small></span></div>
            </div>
          </div>

          <div className="contact-card contact-form-panel">
            <h2>Gửi yêu cầu tư vấn</h2>
            <p>Thông tin sẽ được gửi trực tiếp đến đội ngũ X24Sport qua Telegram.</p>
            <ContactForm />
          </div>
        </section>

        <section className="site-container contact-map" aria-label="Bản đồ X24Sport">
          <iframe
            src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3725.5291305181463!2d105.83757267603295!3d20.97141648974425!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3135ad9e9eb3800b%3A0xa21f7473bf767fee!2sX24%20Sport!5e0!3m2!1sen!2s!4v1784301365881!5m2!1sen!2s"
            width="600"
            height="450"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="strict-origin-when-cross-origin"
            title="Bản đồ X24Sport"
          />
        </section>
      </main>
    </div>
  )
}
