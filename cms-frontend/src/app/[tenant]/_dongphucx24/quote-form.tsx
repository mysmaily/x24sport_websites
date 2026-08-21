'use client'

import { ArrowRight, CheckCircle2 } from 'lucide-react'
import { FormEvent, useState } from 'react'

import styles from './dongphucx24.module.css'

type State = 'idle' | 'submitting' | 'success' | 'error'

export function QuoteForm({ productName }: { productName?: string }) {
  const [state, setState] = useState<State>('idle')
  const [message, setMessage] = useState('')
  const [startedAt] = useState(() => Date.now())

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    const form = event.currentTarget
    if (!form.reportValidity()) return
    const data = new FormData(form)
    setState('submitting')
    setMessage('')
    try {
      const response = await fetch('/api/product-interest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          intent: 'callback',
          phone: String(data.get('phone') || ''),
          quantity: String(data.get('quantity') || ''),
          productName,
          productUrl: window.location.href,
          website: String(data.get('website') || ''),
          startedAt,
        }),
      })
      const result = await response.json() as { message?: string }
      if (!response.ok) throw new Error(result.message || 'Chưa gửi được yêu cầu. Vui lòng thử lại.')
      form.reset()
      setState('success')
      setMessage('Yêu cầu đã được ghi nhận. Đội ngũ tư vấn sẽ liên hệ lại với bạn.')
    } catch (error) {
      setState('error')
      setMessage(error instanceof Error ? error.message : 'Chưa gửi được yêu cầu. Vui lòng thử lại.')
    }
  }

  if (state === 'success') return <div className={styles.formSuccess} role="status"><CheckCircle2 aria-hidden="true" /><div><strong>Đã nhận yêu cầu</strong><p>{message}</p></div><button onClick={() => setState('idle')} type="button">Gửi yêu cầu khác</button></div>

  return <form className={styles.quoteForm} onSubmit={submit}>
    <div className={styles.field}><label htmlFor={`dpx-phone-${productName ? 'product' : 'home'}`}>Số điện thoại <b>*</b></label><input autoComplete="tel" id={`dpx-phone-${productName ? 'product' : 'home'}`} inputMode="tel" maxLength={20} name="phone" pattern="[0-9+ .-]{9,20}" placeholder="09xx xxx xxx…" required type="tel" /></div>
    <div className={styles.field}><label htmlFor={`dpx-quantity-${productName ? 'product' : 'home'}`}>Số lượng dự kiến <b>*</b></label><select defaultValue="20-50 bộ" id={`dpx-quantity-${productName ? 'product' : 'home'}`} name="quantity" required><option>10-20 bộ</option><option>20-50 bộ</option><option>50-100 bộ</option><option>Trên 100 bộ</option></select></div>
    <label aria-hidden="true" hidden><span>Website</span><input autoComplete="off" name="website" tabIndex={-1} /></label>
    <button disabled={state === 'submitting'} type="submit">{state === 'submitting' ? 'Đang gửi…' : 'Nhận tư vấn đặt may'} <ArrowRight aria-hidden="true" /></button>
    <p aria-live="polite" className={state === 'error' ? styles.formError : styles.formNote} role="status">{state === 'error' ? message : 'Thông tin chỉ được dùng để tư vấn yêu cầu đồng phục.'}</p>
  </form>
}
