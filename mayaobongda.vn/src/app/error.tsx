'use client'

export default function ErrorPage({ reset }: { reset: () => void }) {
  return <div className="section-shell flex min-h-[65dvh] flex-col items-start justify-center py-20" role="alert"><span className="font-display text-[clamp(7rem,20vw,16rem)] font-bold leading-none text-brand">24</span><p className="mt-4 text-sm font-black uppercase tracking-wider text-brand">Đường truyền vừa gián đoạn.</p><h1 className="mt-2 font-display text-5xl font-bold text-slate-950 sm:text-7xl">Chưa thể tải nội dung.</h1><button className="mt-7 min-h-12 cursor-pointer rounded-lg bg-slate-950 px-6 text-sm font-black text-white transition hover:bg-brand" onClick={reset} type="button">Thử lại</button></div>
}
