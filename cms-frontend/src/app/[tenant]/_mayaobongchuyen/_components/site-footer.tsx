import { ArrowUpRight, MessageCircle, Phone } from 'lucide-react'

import { FooterStoreDetails } from '../../../_components/footer-store-details'
import { getPublicStoreSettings } from '../../../../lib/store-settings'

const PHONE_DISPLAY = '0989.353.247'
const PHONE_VALUE = '0989353247'
const ZALO_URL = 'https://zalo.me/0989353247'

export async function SiteFooter() {
  const settings = await getPublicStoreSettings()

  return (
    <>
      <section className="mbc-footer-cta border-t border-[var(--line)] bg-[var(--accent)] px-[clamp(20px,5vw,76px)] py-[48px] text-white">
        <div className="mbc-footer-cta-shell mx-auto flex max-w-[1360px] flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          <div className="mbc-footer-cta-copy max-w-3xl">
            <p className="text-sm font-black uppercase text-white/80">Đội bóng đã có ý tưởng?</p>
            <h2 className="mbc-footer-cta-title mt-3 text-[clamp(30px,3.6vw,48px)] font-black leading-[1.02]">Gửi logo, màu áo và số lượng. Xưởng lên mẫu bóng chuyền cho đội bạn.</h2>
          </div>
          <a className="mbc-footer-cta-link inline-flex min-h-12 items-center justify-center gap-2 border border-white bg-white px-5 text-sm font-black text-[#080b12]" href={ZALO_URL} rel="noreferrer" target="_blank">
            Nhận tư vấn <ArrowUpRight size={18} />
          </a>
        </div>
      </section>
      <footer className="border-t border-[var(--line)] bg-[#05070c] px-[clamp(20px,5vw,76px)] pb-24 pt-[58px] lg:pb-[58px]">
        <div className="mx-auto grid max-w-[1360px] gap-10 md:grid-cols-2 lg:grid-cols-[1.25fr_1fr_1fr_1fr]">
          <div>
            <a className="mb-5 inline-flex items-center gap-3 uppercase" href="/" aria-label="MayaoBongChuyen.vn">
              <span className="inline-flex h-11 w-11 items-center justify-center rounded-full border-2 border-white/90 bg-[linear-gradient(135deg,var(--accent),#911410)] text-[13px] font-black text-white">VB</span>
              <span className="inline-flex flex-col justify-center leading-[0.92]">
                <strong className="text-lg font-black italic text-white">MAYAOBONGCHUYEN</strong>
                <small className="text-[13px] font-black tracking-[0.08em] text-[var(--accent)]">.VN</small>
              </span>
            </a>
            <FooterStoreDetails settings={settings} />
            <p className="mt-5 max-w-md text-sm leading-7 text-[var(--muted)]">Thiết kế và may đồng phục bóng chuyền theo yêu cầu cho câu lạc bộ, trường học, công ty và giải phong trào.</p>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.08em] text-white">Theo nhu cầu</h3>
            <nav className="grid gap-3 text-sm text-[var(--muted)]">
              <a href="/ao-bong-chuyen-nam">Áo bóng chuyền nam</a>
              <a href="/ao-bong-chuyen-nu">Áo bóng chuyền nữ</a>
              <a href="/ao-doi-clb">Áo đội/CLB</a>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.08em] text-white">Khám phá</h3>
            <nav className="grid gap-3 text-sm text-[var(--muted)]">
              <a href="/tim-kiem/">Tìm mẫu áo</a>
              <a href="/bang-gia-may-ao-bong-chuyen/">Bảng giá</a>
              <a href="/chat-lieu-size">Chất liệu & Size</a>
              <a href="/mau-da-lam">Mẫu đã làm</a>
            </nav>
          </div>
          <div>
            <h3 className="mb-4 text-sm font-black uppercase tracking-[0.08em] text-white">Liên hệ</h3>
            <div className="grid gap-3 text-sm text-[var(--muted)]">
              <a className="inline-flex items-center gap-2" href={`tel:${PHONE_VALUE}`}><Phone size={16} /> {PHONE_DISPLAY}</a>
              <a className="inline-flex items-center gap-2" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle size={16} /> Zalo tư vấn</a>
            </div>
          </div>
        </div>
        <div className="mx-auto mt-10 max-w-[1360px] border-t border-white/10 pt-5 text-center text-xs text-[var(--muted)]">© {new Date().getFullYear()} MayaoBongChuyen.vn</div>
      </footer>
      <div className="mbc-mobile-contact-bar fixed inset-x-0 bottom-0 z-40 grid grid-cols-2 border-t border-white/10 bg-[#05070c] p-2 lg:hidden">
        <a className="inline-flex min-h-12 items-center justify-center gap-2 bg-white text-sm font-black text-[#080b12]" href={`tel:${PHONE_VALUE}`}><Phone size={17} /> Gọi ngay</a>
        <a className="inline-flex min-h-12 items-center justify-center gap-2 bg-[var(--accent)] text-sm font-black text-white" href={ZALO_URL} rel="noreferrer" target="_blank"><MessageCircle size={17} /> Zalo</a>
      </div>
    </>
  )
}
