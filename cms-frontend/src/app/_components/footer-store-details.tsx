import { MapPin } from 'lucide-react'

import type { PublicStoreSettings } from '../../lib/store-settings'

type FooterStoreDetailsProps = {
  className?: string
  settings: PublicStoreSettings
  tone?: 'dark' | 'light'
}

type SocialKey = 'facebook' | 'tiktok' | 'instagram' | 'pinterest' | 'threads'

const socialLinks: Array<{ key: SocialKey; label: string; field: keyof PublicStoreSettings }> = [
  { key: 'facebook', label: 'Facebook', field: 'facebookUrl' },
  { key: 'tiktok', label: 'TikTok', field: 'tiktokUrl' },
  { key: 'instagram', label: 'Instagram', field: 'instagramUrl' },
  { key: 'pinterest', label: 'Pinterest', field: 'pinterestUrl' },
  { key: 'threads', label: 'Threads', field: 'threadsUrl' },
]

type SocialLink = (typeof socialLinks)[number] & { href: string }

function SocialIcon({ type }: { type: SocialKey }) {
  if (type === 'facebook') {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M14 8.4V6.6c0-.8.5-1 1-1h1.8V2.3C16.5 2.2 15.4 2 14.1 2c-2.7 0-4.5 1.6-4.5 4.4v2H6.7V12h2.9v10h3.6V12h3l.5-3.6H13.2Z" /></svg>
  }
  if (type === 'tiktok') {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M16.2 2c.3 2.4 1.6 3.9 4 4.1v3.4a7 7 0 0 1-4-1.2v6.5c0 4.1-2.5 7.2-6.6 7.2a6.1 6.1 0 0 1-6-6.2c0-4 3.4-6.8 7.2-6.1v3.6c-1.7-.5-3.5.5-3.5 2.5a2.4 2.4 0 0 0 2.4 2.5c1.8 0 2.8-1 2.8-3.5V2Z" /></svg>
  }
  if (type === 'instagram') {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M7.7 2h8.6A5.7 5.7 0 0 1 22 7.7v8.6a5.7 5.7 0 0 1-5.7 5.7H7.7A5.7 5.7 0 0 1 2 16.3V7.7A5.7 5.7 0 0 1 7.7 2Zm0 3.4a2.3 2.3 0 0 0-2.3 2.3v8.6a2.3 2.3 0 0 0 2.3 2.3h8.6a2.3 2.3 0 0 0 2.3-2.3V7.7a2.3 2.3 0 0 0-2.3-2.3Zm4.3 3a3.6 3.6 0 1 1 0 7.2 3.6 3.6 0 0 1 0-7.2Zm0 2.4a1.2 1.2 0 1 0 0 2.4 1.2 1.2 0 0 0 0-2.4Zm4-3.3a1 1 0 1 1 0 2.1 1 1 0 0 1 0-2.1Z" /></svg>
  }
  if (type === 'pinterest') {
    return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12.2 2C6.8 2 4 5.7 4 9.7c0 1.9 1 4.3 2.7 5 .3.1.5 0 .6-.4l.3-1.3c.1-.4 0-.5-.2-.8-.5-.6-.8-1.4-.8-2.5 0-2.8 2.1-5.5 5.3-5.5 2.9 0 4.9 2 4.9 4.8 0 3.2-1.6 5.4-3.7 5.4-1.2 0-2.1-1-1.8-2.2.3-1.4 1-2.9 1-3.9 0-.9-.5-1.7-1.5-1.7-1.2 0-2.1 1.2-2.1 2.8 0 1 .3 1.7.3 1.7L7.8 17c-.4 1.8-.2 4.2-.1 4.8 0 .2.3.3.4.1.2-.3 2.2-2.9 2.6-4.6l.5-2c.5.9 1.7 1.6 3 1.6 3.9 0 6.7-3.6 6.7-8 0-3.8-3.2-6.9-8.7-6.9Z" /></svg>
  }
  return <svg aria-hidden="true" viewBox="0 0 24 24"><path d="M12.4 2c5 0 8.2 3 8.2 7.7 0 1.5-.4 2.8-1.1 3.9.9 1 1.4 2.2 1.4 3.6 0 3.1-2.5 4.8-6.2 4.8-3.6 0-6.4-1.6-7.5-4.4l3.1-1.3c.7 1.7 2.1 2.5 4.2 2.5 1.8 0 2.8-.6 2.8-1.7 0-1.2-1.1-1.8-3-1.8h-3v-3.1h3c1.9 0 2.9-.8 2.9-2.4 0-2.8-1.8-4.5-4.8-4.5-3.2 0-5.1 2.1-5.1 5.5 0 1 .2 2 .5 2.9l-3 1C4.3 13.5 4 12.2 4 10.8 4 5.4 7.2 2 12.4 2Z" /></svg>
}

export function FooterStoreDetails({ className = '', settings, tone = 'dark' }: FooterStoreDetailsProps) {
  const locations = settings.mapLocations || []
  const socials = socialLinks
    .map((social) => ({ ...social, href: settings[social.field] }))
    .filter((social): social is SocialLink => typeof social.href === 'string' && social.href.length > 0)
  const toneClass = tone === 'light' ? 'is-light' : 'is-dark'

  if (!locations.length && !socials.length) return null

  return (
    <div className={`x24-footer-store-details ${toneClass} ${className}`.trim()}>
      {locations.length ? (
        <div className="x24-footer-address-list" aria-label="Địa chỉ">
          {locations.map((location) => (
            <a href={location.googleMapUrl || '#'} key={`${location.label}-${location.googleMapUrl}`} rel="noreferrer" target="_blank">
              <MapPin size={16} />
              <span><strong>{location.label}</strong>{location.address}</span>
            </a>
          ))}
        </div>
      ) : null}
      {socials.length ? (
        <div className="x24-footer-socials" aria-label="Theo dõi">
          {socials.map((social) => (
            <a aria-label={social.label} href={social.href} key={social.key} rel="noreferrer" target="_blank" title={social.label}>
              <SocialIcon type={social.key} />
            </a>
          ))}
        </div>
      ) : null}
    </div>
  )
}
