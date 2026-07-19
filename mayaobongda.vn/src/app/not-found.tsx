import { ArrowLeft } from 'lucide-react'
import Link from 'next/link'

export default function NotFound() {
  return <div className="section-shell flex min-h-[65dvh] flex-col items-start justify-center py-20"><span className="font-display text-[clamp(7rem,20vw,16rem)] font-bold leading-none text-brand">404</span><p className="mt-4 text-sm font-black uppercase tracking-wider text-brand">Đường bóng đã ra ngoài sân.</p><h1 className="mt-2 font-display text-5xl font-bold text-slate-950 sm:text-7xl">Không tìm thấy trang bạn cần.</h1><Link className="mt-7 inline-flex min-h-12 items-center gap-2 rounded-lg bg-slate-950 px-6 text-sm font-black text-white transition hover:bg-brand" href="/"><ArrowLeft size={18} /> Trở về trang chủ</Link></div>
}
