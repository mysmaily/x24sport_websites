'use client'

import { FormEvent, useState } from 'react'
import { Send } from 'lucide-react'

type ProductInterestFormProps = {
  productName: string
  productUrl: string
  variant?: 'interest' | 'quick-order' | 'utility' | 'accent' | 'mayaochaybo'
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

const quantityOptions = ['5-15 bộ', '15-30 bộ', 'Trên 30 bộ']
const utilityFieldGridClass = 'grid grid-cols-[minmax(0,1fr)_minmax(132px,180px)] gap-3'

export function ProductInterestForm({ productName, productUrl, variant = 'interest' }: ProductInterestFormProps) {
  const [state, setState] = useState<SubmitState>('idle')
  const [message, setMessage] = useState('')
  const [startedAt] = useState(() => Date.now())

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return

    setState('submitting')
    setMessage('')

    const data = new FormData(form)
    const payload = {
      phone: String(data.get('phone') || ''),
      quantity: String(data.get('quantity') || ''),
      website: String(data.get('website') || ''),
      startedAt,
      productName,
      productUrl: window.location.href || productUrl,
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
      setMessage('Đã gửi thông tin. Đội ngũ tư vấn sẽ liên hệ lại với bạn sớm.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Chưa gửi được yêu cầu. Vui lòng thử lại hoặc gọi hotline.')
    }
  }

  if (variant === 'quick-order') {
    return (
      <section className="quick-order-card" id="nhan-tu-van">
        <div className="quick-order-heading">
          <h2>Bạn quan tâm mẫu này?</h2>
        </div>

        <form className="quick-order-form" onSubmit={handleSubmit}>
          <div className="quick-order-fields">
            <label>
              <span>Số điện thoại</span>
              <input autoComplete="tel" inputMode="tel" maxLength={20} name="phone" pattern="[0-9+ .-]{9,20}" required type="tel" />
            </label>

            <label>
              <span>Số lượng cần đặt</span>
              <select name="quantity" required defaultValue="">
                <option disabled value="">Chọn số lượng</option>
                {quantityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>

          <label className="quick-order-honeypot" aria-hidden="true" hidden>
            <span>Website</span>
            <input autoComplete="off" name="website" tabIndex={-1} type="text" />
          </label>

          <button disabled={state === 'submitting'} type="submit">
            <Send aria-hidden="true" size={18} />
            {state === 'submitting' ? 'Đang gửi...' : 'Nhận Tư Vấn'}
          </button>

          <p aria-live="polite" className={`quick-order-status${state === 'success' ? ' is-success' : state === 'error' ? ' is-error' : ''}`} role="status">
            {message}
          </p>
        </form>
      </section>
    )
  }

  if (variant === 'utility' || variant === 'accent' || variant === 'mayaochaybo') {
    const accentInputClass = variant === 'mayaochaybo'
      ? 'min-h-11 rounded-lg border border-slate-300 bg-white px-3 outline-none focus:border-brand focus:ring-4 focus:ring-orange-100'
      : variant === 'accent'
        ? 'min-h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-[var(--accent)] focus:ring-4 focus:ring-red-950'
      : 'min-h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-brand focus:ring-4 focus:ring-orange-100'
    const buttonClass = variant === 'accent'
      ? 'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-[var(--accent)] px-5 text-sm font-black text-white transition hover:brightness-95 disabled:cursor-wait disabled:opacity-60'
      : 'inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60'

    return (
      <section className={variant === 'mayaochaybo' ? 'mcb-interest-form' : 'mt-5 rounded-2xl border border-slate-200 bg-white p-5'} id="nhan-tu-van">
        <h2 className={variant === 'mayaochaybo' ? 'text-lg font-black leading-tight text-slate-950 sm:text-xl' : 'text-xl font-black leading-tight text-slate-950'}>Bạn quan tâm mẫu này?</h2>
        <form className={variant === 'mayaochaybo' ? 'mt-3 grid gap-3' : 'mt-4 grid gap-3'} onSubmit={handleSubmit}>
          <div className={utilityFieldGridClass}>
            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              <span>Số điện thoại</span>
              <input className={accentInputClass} autoComplete="tel" inputMode="tel" maxLength={20} name="phone" pattern="[0-9+ .-]{9,20}" required type="tel" />
            </label>
            <label className="grid gap-1.5 text-sm font-bold text-slate-700">
              <span>Số lượng cần đặt</span>
              <select className={accentInputClass} name="quantity" required defaultValue="">
                <option disabled value="">Chọn số lượng</option>
                {quantityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
              </select>
            </label>
          </div>
          <label className="hidden" aria-hidden="true">
            <span>Website</span>
            <input autoComplete="off" name="website" tabIndex={-1} type="text" />
          </label>
          <button className={buttonClass} disabled={state === 'submitting'} type="submit">
            <Send aria-hidden="true" size={18} />
            {state === 'submitting' ? 'Đang gửi...' : 'Nhận Tư Vấn'}
          </button>
          <p aria-live="polite" className={`min-h-5 text-sm ${state === 'success' ? 'text-emerald-700' : state === 'error' ? 'text-red-700' : 'text-slate-500'}`} role="status">
            {message}
          </p>
        </form>
      </section>
    )
  }

  return (
    <section className="interest-card" id="nhan-tu-van">
      <h2>Bạn quan tâm mẫu này?</h2>
      <form className="interest-form" onSubmit={handleSubmit}>
        <div className="interest-fields">
          <label>
            <span>Số điện thoại</span>
            <input autoComplete="tel" inputMode="tel" maxLength={20} name="phone" pattern="[0-9+ .-]{9,20}" required type="tel" />
          </label>
          <label>
            <span>Số lượng cần đặt</span>
            <select name="quantity" required defaultValue="">
              <option disabled value="">Chọn số lượng</option>
              {quantityOptions.map((option) => <option key={option} value={option}>{option}</option>)}
            </select>
          </label>
        </div>
        <label className="interest-honeypot" aria-hidden="true" hidden>
          <span>Website</span>
          <input autoComplete="off" name="website" tabIndex={-1} type="text" />
        </label>
        <button disabled={state === 'submitting'} type="submit">
          <Send aria-hidden="true" size={18} />
          {state === 'submitting' ? 'Đang gửi...' : 'Nhận Tư Vấn'}
        </button>
        <p aria-live="polite" className={`interest-status${state === 'success' ? ' success' : state === 'error' ? ' error' : ''}`} role="status">
          {message}
        </p>
      </form>
    </section>
  )
}
