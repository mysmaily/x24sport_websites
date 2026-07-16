'use client'

import { FormEvent, useState } from 'react'
import { Send } from 'lucide-react'

type QuickOrderFormProps = {
  productName: string
  productUrl: string
}

type SubmitState = 'idle' | 'submitting' | 'success' | 'error'

export function QuickOrderForm({ productName, productUrl }: QuickOrderFormProps) {
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
      name: String(data.get('name') || ''),
      phone: String(data.get('phone') || ''),
      quantity: String(data.get('quantity') || ''),
      neededDate: String(data.get('neededDate') || ''),
      website: String(data.get('website') || ''),
      startedAt,
      productName,
      productUrl: window.location.href || productUrl,
    }

    try {
      const response = await fetch('/api/quick-order', {
        body: JSON.stringify(payload),
        headers: { 'Content-Type': 'application/json' },
        method: 'POST',
      })
      const result = (await response.json()) as { message?: string }

      if (!response.ok) throw new Error(result.message || 'Không thể gửi yêu cầu.')

      form.reset()
      setState('success')
      setMessage('Đã gửi yêu cầu. MayaoPickleball sẽ liên hệ lại với bạn sớm.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Chưa gửi được yêu cầu. Vui lòng thử lại hoặc gọi hotline.')
    }
  }

  return (
    <section className="quick-order-card" id="dat-ao-nhanh">
      <div className="quick-order-heading">
        <p className="section-label">Đặt áo nhanh</p>
        <h2>Để lại thông tin, xưởng sẽ tư vấn và báo giá</h2>
        <p>Thông tin sản phẩm đang xem sẽ được gửi kèm để tư vấn đúng mẫu.</p>
      </div>

      <form className="quick-order-form" onSubmit={handleSubmit}>
        <label>
          <span>Tên</span>
          <input autoComplete="name" maxLength={80} name="name" placeholder="Tên của bạn" required type="text" />
        </label>

        <label>
          <span>Số điện thoại</span>
          <input
            autoComplete="tel"
            inputMode="tel"
            maxLength={20}
            name="phone"
            pattern="[0-9+ .-]{9,20}"
            placeholder="Ví dụ: 0900000000"
            required
            type="tel"
          />
        </label>

        <label>
          <span>Số lượng</span>
          <input inputMode="numeric" max="10000" min="5" name="quantity" placeholder="Từ 5 áo" required type="number" />
        </label>

        <label>
          <span>Ngày cần áo</span>
          <select defaultValue="" name="neededDate" required>
            <option disabled value="">Chọn thời gian cần áo</option>
            <option value="4 ngày nữa">4 ngày nữa</option>
            <option value="5 ngày nữa">5 ngày nữa</option>
            <option value="1 tuần">1 tuần nữa</option>
            <option value="Trên 1 tuần">Trên 1 tuần</option>
          </select>
        </label>

        <label className="quick-order-honeypot" aria-hidden="true" hidden>
          <span>Website</span>
          <input autoComplete="off" name="website" tabIndex={-1} type="text" />
        </label>

        <button disabled={state === 'submitting'} type="submit">
          <Send aria-hidden="true" size={18} />
          {state === 'submitting' ? 'Đang gửi...' : 'Gửi yêu cầu đặt áo'}
        </button>

        <p
          aria-live="polite"
          className={`quick-order-status${state === 'success' ? ' is-success' : state === 'error' ? ' is-error' : ''}`}
          role="status"
        >
          {message}
        </p>
      </form>
    </section>
  )
}
