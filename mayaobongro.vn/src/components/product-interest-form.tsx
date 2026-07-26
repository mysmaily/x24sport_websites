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
    <section className="mt-5 rounded-2xl border border-slate-200 bg-white p-5" id="nhan-tu-van">
      <h2 className="text-xl font-black leading-tight text-slate-950">Bạn quan tâm mẫu này?</h2>
      <form className="mt-4 grid gap-3" onSubmit={handleSubmit}>
        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          <span>Số điện thoại</span>
          <input className="min-h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-brand focus:ring-4 focus:ring-orange-100" autoComplete="tel" inputMode="tel" maxLength={20} name="phone" pattern="[0-9+ .-]{9,20}" required type="tel" />
        </label>
        <label className="grid gap-1.5 text-sm font-bold text-slate-700">
          <span>Số lượng cần đặt</span>
          <input className="min-h-11 rounded-lg border border-slate-300 px-3 outline-none focus:border-brand focus:ring-4 focus:ring-orange-100" inputMode="numeric" max="10000" min="1" name="quantity" required type="number" />
        </label>
        <label className="hidden" aria-hidden="true">
          <span>Website</span>
          <input autoComplete="off" name="website" tabIndex={-1} type="text" />
        </label>
        <button className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white transition hover:bg-brand-dark disabled:cursor-wait disabled:opacity-60" disabled={state === 'submitting'} type="submit">
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
