'use client'

import { FormEvent, useEffect, useId, useState } from 'react'
import { Facebook, MessageCircle, PhoneCall, Send, X } from 'lucide-react'

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

function BrandIcon({ alt, src }: { alt: string; src: string }) {
  return <img alt={alt} height={34} src={src} width={34} />
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
            <span className="x24-bottom-contact-icon"><BrandIcon alt="" src="/icons/zalo.svg" /></span>
            <span>Chat Zalo</span>
          </a>
        ) : null}
        {settings.telegramChatId ? (
          <button className="x24-bottom-contact-item is-callback" onClick={openCallback} type="button">
            <span className="x24-bottom-contact-icon"><MessageCircle size={34} /></span>
            <span>Gọi cho tôi</span>
          </button>
        ) : null}
        {mapLocations.length === 1 ? (
          <a className="x24-bottom-contact-item is-map" href={mapLocations[0].googleMapUrl || '#'} rel="noreferrer" target="_blank">
            <span className="x24-bottom-contact-icon"><BrandIcon alt="" src="/icons/google-maps.svg" /></span>
            <span>Chỉ đường</span>
          </a>
        ) : mapLocations.length > 1 ? (
          <button className="x24-bottom-contact-item is-map" onClick={() => setDialog('maps')} type="button">
            <span className="x24-bottom-contact-icon"><BrandIcon alt="" src="/icons/google-maps.svg" /></span>
            <span>Chỉ đường</span>
          </button>
        ) : null}
      </nav>

      {dialog === 'callback' ? (
        <Dialog labelledBy={callbackTitleId} onClose={() => setDialog(null)}>
          <h2 id={callbackTitleId}>Gọi cho tôi</h2>
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
