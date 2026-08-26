'use client'

import { FormEvent, useCallback, useEffect, useId, useRef, useState } from 'react'
import { Facebook, Headphones, MapPin, MessageCircle, Phone, PhoneCall, Send, X } from 'lucide-react'

import type { PublicStoreSettings, StoreMapLocation } from '../../lib/store-settings'

type TenantBottomContactBarProps = {
  settings: PublicStoreSettings
  tenantName: string
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

const quantityOptions = ['5-15 bộ', '15-30 bộ', 'Trên 30 bộ']

const regionalSalesContacts = [
  { region: 'Miền Bắc', name: 'Thu Hiền', phone: '0989353247', phoneLabel: '0989 353 247' },
  { region: 'Miền Trung', name: 'Thanh Nga', phone: '0988643904', phoneLabel: '0988 643 904' },
  { region: 'Miền Nam', name: 'Hà Phương', phone: '0982254458', phoneLabel: '0982 254 458' },
]

function telHref(phone?: string | null) {
  return phone ? `tel:${phone}` : ''
}

function displayPhone(phone?: string | null) {
  if (!phone) return ''
  const local = phone.startsWith('+84') ? `0${phone.slice(3)}` : phone
  return local.replace(/(\d{4})(\d{3})(\d+)/, '$1 $2 $3')
}

function BrandIcon({ alt, src }: { alt: string; src: string }) {
  return <img alt={alt} height={34} src={src} width={34} />
}

function Dialog({
  children,
  className = '',
  labelledBy,
  onClose,
}: {
  children: React.ReactNode
  className?: string
  labelledBy: string
  onClose: () => void
}) {
  const dialogRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    const previousActiveElement = document.activeElement instanceof HTMLElement ? document.activeElement : null
    const previousOverflow = document.body.style.overflow
    const dialogElement = dialogRef.current

    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
      if (event.key !== 'Tab' || !dialogElement) return

      const focusableElements = Array.from(dialogElement.querySelectorAll<HTMLElement>(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ))
      if (focusableElements.length === 0) return
      const firstElement = focusableElements[0]
      const lastElement = focusableElements[focusableElements.length - 1]
      if (event.shiftKey && document.activeElement === firstElement) {
        event.preventDefault()
        lastElement.focus()
      } else if (!event.shiftKey && document.activeElement === lastElement) {
        event.preventDefault()
        firstElement.focus()
      }
    }

    document.body.style.overflow = 'hidden'
    dialogElement?.querySelector<HTMLElement>('[data-dialog-close]')?.focus()
    document.addEventListener('keydown', handleKeyDown)
    return () => {
      document.removeEventListener('keydown', handleKeyDown)
      document.body.style.overflow = previousOverflow
      previousActiveElement?.focus()
    }
  }, [onClose])

  return (
    <div className="x24-contact-dialog-backdrop" role="presentation" onPointerDown={onClose}>
      <div
        aria-labelledby={labelledBy}
        aria-modal="true"
        className={`x24-contact-dialog ${className}`.trim()}
        ref={dialogRef}
        role="dialog"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button aria-label="Đóng" className="x24-contact-dialog-close" data-dialog-close onClick={onClose} type="button">
          <X aria-hidden="true" size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}

export function TenantBottomContactBar({ settings, tenantName }: TenantBottomContactBarProps) {
  const [dialog, setDialog] = useState<'callback' | 'maps' | 'sales' | null>(null)
  const [state, setState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const callbackTitleId = useId()
  const mapTitleId = useId()
  const salesTitleId = useId()
  const phone = settings.contactPhone || ''
  const phoneLabel = displayPhone(phone)
  const mapLocations = (settings.mapLocations || []) as StoreMapLocation[]
  const actionCount = [
    phone,
    settings.facebookUrl,
    settings.zaloUrl,
    settings.telegramChatId,
    mapLocations.length,
    true,
  ].filter(Boolean).length

  const closeDialog = useCallback(() => setDialog(null), [])

  function openCallback() {
    setStartedAt(Date.now())
    setState('idle')
    setMessage('')
    setDialog('callback')
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return

    setState('submitting')
    setMessage('')

    const data = new FormData(form)
    const payload = {
      intent: 'callback',
      phone: String(data.get('phone') || ''),
      quantity: String(data.get('quantity') || ''),
      website: String(data.get('website') || ''),
      startedAt,
      productName: 'Gọi cho tôi',
      productUrl: window.location.href,
    }

    try {
      const response = await fetch('/api/product-interest', {
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = (await response.json()) as { message?: string }
      if (!response.ok) throw new Error(result.message || 'Không thể gửi yêu cầu.')
      form.reset()
      setState('success')
      setMessage('Đã gửi thông tin. Đội ngũ tư vấn sẽ gọi lại cho bạn sớm.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Chưa gửi được yêu cầu. Vui lòng thử lại hoặc gọi hotline.')
    }
  }

  return (
    <>
      <nav
        aria-label="Liên hệ nhanh"
        className="x24-bottom-contact-bar"
        style={{ gridTemplateColumns: `repeat(${actionCount}, minmax(0, 1fr))` }}
      >
        {phone ? (
          <a className="x24-bottom-contact-item is-call" href={telHref(phone)} title={phoneLabel}>
            <span className="x24-bottom-contact-icon"><PhoneCall aria-hidden="true" size={31} strokeWidth={3} /></span>
            <span>Gọi điện</span>
          </a>
        ) : null}
        {settings.facebookUrl ? (
          <a className="x24-bottom-contact-item is-facebook" href={settings.facebookUrl} rel="noreferrer" target="_blank">
            <span className="x24-bottom-contact-icon"><Facebook aria-hidden="true" size={34} fill="currentColor" strokeWidth={0} /></span>
            <span>Facebook</span>
          </a>
        ) : null}
        {settings.zaloUrl ? (
          <a className="x24-bottom-contact-item is-zalo" href={settings.zaloUrl} rel="noreferrer" target="_blank">
            <span className="x24-bottom-contact-icon"><BrandIcon alt="" src="/icons/zalo.svg" /></span>
            <span>Chat Zalo</span>
          </a>
        ) : null}
        {settings.telegramChatId ? (
          <button aria-expanded={dialog === 'callback'} aria-haspopup="dialog" className="x24-bottom-contact-item is-callback" onClick={openCallback} type="button">
            <span className="x24-bottom-contact-icon"><MessageCircle aria-hidden="true" size={34} /></span>
            <span>Gọi cho tôi</span>
          </button>
        ) : null}
        <button aria-expanded={dialog === 'sales'} aria-haspopup="dialog" className="x24-bottom-contact-item is-sales" onClick={() => setDialog('sales')} type="button">
          <span className="x24-bottom-contact-icon"><Headphones aria-hidden="true" size={30} /></span>
          <span>Tư vấn 3 miền</span>
        </button>
        {mapLocations.length === 1 ? (
          <a className="x24-bottom-contact-item is-map" href={mapLocations[0].googleMapUrl || '#'} rel="noreferrer" target="_blank">
            <span className="x24-bottom-contact-icon"><BrandIcon alt="" src="/icons/google-maps.svg" /></span>
            <span>Chỉ đường</span>
          </a>
        ) : mapLocations.length > 1 ? (
          <button aria-expanded={dialog === 'maps'} aria-haspopup="dialog" className="x24-bottom-contact-item is-map" onClick={() => setDialog('maps')} type="button">
            <span className="x24-bottom-contact-icon"><BrandIcon alt="" src="/icons/google-maps.svg" /></span>
            <span>Chỉ đường</span>
          </button>
        ) : null}
      </nav>

      {dialog === 'callback' ? (
        <Dialog labelledBy={callbackTitleId} onClose={closeDialog}>
          <h2 id={callbackTitleId}>Gọi cho tôi</h2>
          <p>Để lại số điện thoại, {tenantName} sẽ liên hệ tư vấn sớm.</p>
          <form className="x24-callback-form" onSubmit={handleSubmit}>
            <label>
              <span>Số điện thoại</span>
              <input autoComplete="tel" inputMode="tel" maxLength={20} name="phone" pattern="[0-9+ .-]{9,20}" required type="tel" />
            </label>
            <label>
              <span>Số lượng dự kiến</span>
              <select name="quantity" required defaultValue={quantityOptions[0]}>
                {quantityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
            <label className="x24-contact-honeypot" aria-hidden="true">
              <span>Website</span>
              <input autoComplete="off" name="website" tabIndex={-1} type="text" />
            </label>
            <button disabled={state === 'submitting'} type="submit">
              <Send aria-hidden="true" size={18} />
              {state === 'submitting' ? 'Đang gửi…' : 'Gửi yêu cầu'}
            </button>
            <p aria-live="polite" className={`x24-contact-status is-${state}`} role="status">{message}</p>
          </form>
        </Dialog>
      ) : null}

      {dialog === 'maps' ? (
        <Dialog labelledBy={mapTitleId} onClose={closeDialog}>
          <h2 id={mapTitleId}>Chọn địa chỉ</h2>
          <div className="x24-map-location-list">
            {mapLocations.map((location) => (
              <a href={location.googleMapUrl || '#'} key={`${location.label}-${location.googleMapUrl}`} rel="noreferrer" target="_blank">
                <strong>{location.label}</strong>
                <span>{location.address}</span>
              </a>
            ))}
          </div>
        </Dialog>
      ) : null}

      {dialog === 'sales' ? (
        <Dialog className="is-sales" labelledBy={salesTitleId} onClose={closeDialog}>
          <div className="x24-sales-hotline-heading">
            <span><Headphones aria-hidden="true" /> Hỗ trợ bán hàng toàn quốc</span>
            <h2 id={salesTitleId}>Chọn tư vấn theo khu vực</h2>
            <p>Liên hệ đúng người phụ trách để được hỗ trợ nhanh về mẫu áo, thiết kế và đơn hàng.</p>
          </div>
          {phone ? (
            <a aria-label={`Gọi hotline chính ${phoneLabel}`} className="x24-primary-hotline" href={telHref(phone)}>
              <span><PhoneCall aria-hidden="true" /></span>
              <span><small>Hotline chính</small><strong>{phoneLabel}</strong></span>
              <Phone aria-hidden="true" />
            </a>
          ) : null}
          <div className="x24-sales-hotline-list">
            {regionalSalesContacts.map((contact) => (
              <a
                aria-label={`Gọi Sale ${contact.region}, ${contact.name}, số ${contact.phoneLabel}`}
                href={`tel:${contact.phone}`}
                key={contact.region}
              >
                <span className="x24-sales-region-icon"><MapPin aria-hidden="true" /></span>
                <span className="x24-sales-contact-copy">
                  <small>Sale {contact.region}</small>
                  <strong>{contact.name}</strong>
                  <b>{contact.phoneLabel}</b>
                </span>
                <span className="x24-sales-call-icon"><Phone aria-hidden="true" /></span>
              </a>
            ))}
          </div>
        </Dialog>
      ) : null}
    </>
  )
}
