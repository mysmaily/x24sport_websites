'use client'

import { FormEvent, useState } from 'react'
import { Send } from 'lucide-react'

type ProductInterestFormProps = {
  productName: string
  productUrl: string
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export function ProductInterestForm({ productName, productUrl }: ProductInterestFormProps) {
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
            <input inputMode="numeric" max="10000" min="1" name="quantity" required type="number" />
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
