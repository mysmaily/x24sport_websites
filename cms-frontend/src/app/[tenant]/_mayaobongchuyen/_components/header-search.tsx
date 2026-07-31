'use client'

import { Search, X } from 'lucide-react'
import { useState } from 'react'

export function HeaderSearch() {
  const [open, setOpen] = useState(false)

  return (
    <div className="relative">
      <button aria-expanded={open} aria-label="Mở tìm kiếm" className="inline-flex h-12 w-12 items-center justify-center rounded-full border border-white/16 text-white transition duration-200 hover:-translate-y-px hover:border-[rgba(238,43,36,.8)]" onClick={() => setOpen((value) => !value)} type="button">
        <Search size={21} />
      </button>
      {open ? (
        <div className="absolute right-0 top-[calc(100%+10px)] z-50 w-[min(520px,calc(100vw-32px))] bg-[#080909] p-1.5 shadow-[0_14px_40px_rgba(0,0,0,.32)]">
          <form action="/tim-kiem" className="grid grid-cols-[1fr_auto_auto] gap-1.5" role="search">
            <label className="sr-only" htmlFor="header-search-q">Tìm mẫu áo</label>
            <input autoComplete="off" className="min-h-11 min-w-0 bg-white px-3 text-sm text-[#111] outline-none" id="header-search-q" name="q" placeholder="Tên mẫu, màu áo, tag ảnh..." type="search" />
            <button className="bg-[var(--accent)] px-4 text-sm font-black text-white" type="submit">Tìm</button>
            <button aria-label="Đóng tìm kiếm" className="grid h-11 w-11 place-items-center text-white/85 hover:bg-white/10" onClick={() => setOpen(false)} type="button"><X size={17} /></button>
          </form>
        </div>
      ) : null}
    </div>
  )
}
