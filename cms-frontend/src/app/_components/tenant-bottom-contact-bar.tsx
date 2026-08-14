'use client'

import { FormEvent, useEffect, useId, useState } from 'react'
import { Facebook, MapPin, MessageCircle, PhoneCall, Send, X } from 'lucide-react'

import type { PublicStoreSettings, StoreMapLocation } from '../../lib/store-settings'

type TenantBottomContactBarProps = {
  settings: PublicStoreSettings
  tenantName: string
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

const quantityOptions = ['5-15 bộ', '15-30 bộ', 'Trên 30 bộ']

function telHref(phone?: string | null) {
  return phone ? `tel:${phone}` : ''
}

function displayPhone(phone?: string | null) {
  if (!phone) return ''
  const local = phone.startsWith('+84') ? `0${phone.slice(3)}` : phone
  return local.replace(/(\d{4})(\d{3})(\d+)/, '$1 $2 $3')
}

function ZaloIcon() {
  return (
    <svg aria-hidden="true" viewBox="0 0 48 48" focusable="false">
      <path d="M11.6 37.7c-4.2-3.5-6.4-8.1-6.4-13.3C5.2 13.9 13.8 6 24.6 6s18.2 7.3 18.2 17.5S34.7 41 24.1 41c-2.2 0-4.4-.3-6.5-1l-8.1 2.1 2.1-4.4Z" fill="currentColor" />
      <path d="M15.3 28.9h8.1v-2.4h-4.6l4.5-6.2v-2.2h-7.6v2.4h4.1l-4.5 6.2v2.2Zm10.2 0h2.7v-5.1c0-1.4.8-2.3 2-2.3 1.1 0 1.7.7 1.7 2v5.4h2.7v-5.9c0-2.4-1.4-3.8-3.6-3.8-1.2 0-2.1.5-2.8 1.3v-1.1h-2.7v9.5Z" fill="#fff" />
    </svg>
  )
}

function Dialog({
  children,
  labelledBy,
  onClose,
}: {
  children: React.ReactNode
  labelledBy: string
  onClose: () => void
}) {
  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') onClose()
    }
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [onClose])

  return (
    <div className="x24-contact-dialog-backdrop" role="presentation" onMouseDown={onClose}>
      <div
        aria-labelledby={labelledBy}
        aria-modal="true"
        className="x24-contact-dialog"
        role="dialog"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <button aria-label="Đóng" className="x24-contact-dialog-close" onClick={onClose} type="button">
          <X size={20} />
        </button>
        {children}
      </div>
    </div>
  )
}

export function TenantBottomContactBar({ settings, tenantName }: TenantBottomContactBarProps) {
  const [dialog, setDialog] = useState<'callback' | 'maps' | null>(null)
  const [state, setState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')
  const [startedAt, setStartedAt] = useState(() => Date.now())
  const callbackTitleId = useId()
  const mapTitleId = useId()
  const phone = settings.contactPhone || ''
  const phoneLabel = displayPhone(phone)
  const mapLocations = (settings.mapLocations || []) as StoreMapLocation[]
  const actionCount = [
    phone,
    settings.facebookUrl,
    settings.zaloUrl,
    settings.telegramChatId,
    mapLocations.length,
  ].filter(Boolean).length

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
      productName: 'Gọi lại cho tôi',
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

  const hasAnyAction = phone || settings.facebookUrl || settings.zaloUrl || settings.telegramChatId || mapLocations.length
  if (!hasAnyAction) return null

  return (
    <>
      <nav
        aria-label="Liên hệ nhanh"
        className="x24-bottom-contact-bar"
        style={{ gridTemplateColumns: `repeat(${actionCount}, minmax(0, 1fr))` }}
      >
        {phone ? (
          <a className="x24-bottom-contact-item is-call" href={telHref(phone)} title={phoneLabel}>
            <span className="x24-bottom-contact-icon"><PhoneCall size={31} strokeWidth={3} /></span>
            <span>Gọi điện</span>
          </a>
        ) : null}
        {settings.facebookUrl ? (
          <a className="x24-bottom-contact-item is-facebook" href={settings.facebookUrl} rel="noreferrer" target="_blank">
            <span className="x24-bottom-contact-icon"><Facebook size={34} fill="currentColor" strokeWidth={0} /></span>
            <span>Facebook</span>
          </a>
        ) : null}
        {settings.zaloUrl ? (
          <a className="x24-bottom-contact-item is-zalo" href={settings.zaloUrl} rel="noreferrer" target="_blank">
            <span className="x24-bottom-contact-icon"><ZaloIcon /></span>
            <span>Chat Zalo</span>
          </a>
        ) : null}
        {settings.telegramChatId ? (
          <button className="x24-bottom-contact-item is-callback" onClick={openCallback} type="button">
            <span className="x24-bottom-contact-icon"><MessageCircle size={34} /></span>
            <span>Gọi lại cho tôi</span>
          </button>
        ) : null}
        {mapLocations.length === 1 ? (
          <a className="x24-bottom-contact-item is-map" href={mapLocations[0].googleMapUrl || '#'} rel="noreferrer" target="_blank">
            <span className="x24-bottom-contact-icon"><MapPin size={36} fill="currentColor" strokeWidth={0} /></span>
            <span>Chỉ đường</span>
          </a>
        ) : mapLocations.length > 1 ? (
          <button className="x24-bottom-contact-item is-map" onClick={() => setDialog('maps')} type="button">
            <span className="x24-bottom-contact-icon"><MapPin size={36} fill="currentColor" strokeWidth={0} /></span>
            <span>Chỉ đường</span>
          </button>
        ) : null}
      </nav>

      {dialog === 'callback' ? (
        <Dialog labelledBy={callbackTitleId} onClose={() => setDialog(null)}>
          <h2 id={callbackTitleId}>Gọi lại cho tôi</h2>
          <p>Để lại số điện thoại, {tenantName} sẽ liên hệ tư vấn sớm.</p>
          <form className="x24-callback-form" onSubmit={handleSubmit}>
            <label>
              <span>Số điện thoại</span>
              <input autoComplete="tel" autoFocus inputMode="tel" maxLength={20} name="phone" pattern="[0-9+ .-]{9,20}" required type="tel" />
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
              <Send size={18} />
              {state === 'submitting' ? 'Đang gửi...' : 'Gửi yêu cầu'}
            </button>
            <p aria-live="polite" className={`x24-contact-status is-${state}`} role="status">{message}</p>
          </form>
        </Dialog>
      ) : null}

      {dialog === 'maps' ? (
        <Dialog labelledBy={mapTitleId} onClose={() => setDialog(null)}>
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
    </>
  )
}
