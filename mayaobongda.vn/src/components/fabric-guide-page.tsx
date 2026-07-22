import { ArrowLeft, ArrowRight, Check, MessageCircle, Phone, Sparkles, Wind } from 'lucide-react'
import Link from 'next/link'

import { FabricLightbox } from '@/components/fabric-lightbox'
import { PHONE_DISPLAY, PHONE_VALUE, ZALO_URL } from '@/lib/site'

const fabrics = [
  {
    name: 'Thun lạnh',
    image: 'https://static.x24sport.vn/mayaobongda/wp-1446-vai-thun-lanh.jpg',
    alt: 'Bề mặt vải thun lạnh dùng để may áo bóng đá',
    note: 'Mát tay, dễ mặc, ít nhăn',
    bestFor: 'Đội phong trào, tập luyện hằng tuần',
    feel: 'Mịn',
    breath: 'Tốt',
    tags: ['Mát lạnh', 'Chống nhăn', 'Dễ chọn'],
  },
  {
    name: 'Mè sọc mịn',
    image: 'https://static.x24sport.vn/mayaobongda/wp-1447-vai-me-soc-min.jpg',
    alt: 'Bề mặt vải mè sọc mịn may áo bóng đá',
    note: 'Sọc nhỏ, co giãn ổn, lên form thể thao',
    bestFor: 'Đội cần áo thoáng và sắc nét',
    feel: 'Êm',
    breath: 'Rất tốt',
    tags: ['Co giãn', 'Thoáng khí', 'Bóng nhẹ'],
  },
  {
    name: 'Mè luxury',
    image: 'https://static.x24sport.vn/mayaobongda/wp-1445-vai-me-luxury.jpg',
    alt: 'Bề mặt vải mè luxury cao cấp may áo bóng đá',
    note: 'Dày dặn hơn, bề mặt sang, giữ dáng tốt',
    bestFor: 'Đội thi đấu, áo sự kiện, áo premium',
    feel: 'Đầm',
    breath: 'Tốt',
    tags: ['Cao cấp', 'Bền form', 'Sang'],
  },
  {
    name: 'Mè Thái',
    image: 'https://static.x24sport.vn/mayaobongda/wp-1444-vai-me-thai.jpg',
    alt: 'Bề mặt vải mè Thái nhập khẩu may áo bóng đá',
    note: 'Nhẹ, thoát khí nhanh, hợp trời nóng',
    bestFor: 'Trận cường độ cao, sân 7 và sân 11',
    feel: 'Nhẹ',
    breath: 'Xuất sắc',
    tags: ['Nhập khẩu', 'Siêu thoáng', 'Nhanh khô'],
  },
  {
    name: 'Mè nano',
    image: 'https://static.x24sport.vn/mayaobongda/wp-1443-vai-me-nano.jpg',
    alt: 'Bề mặt vải mè nano công nghệ may áo bóng đá',
    note: 'Nhẹ, khô nhanh, bền màu sau nhiều lần giặt',
    bestFor: 'Đội muốn hiệu năng và độ bền cao',
    feel: 'Mượt',
    breath: 'Xuất sắc',
    tags: ['Nano', 'Kháng khuẩn', 'Bền màu'],
  },
]

const quickPicks = [
  ['Dễ mặc nhất', 'Thun lạnh'],
  ['Cân bằng nhất', 'Mè sọc mịn'],
  ['Cảm giác cao cấp', 'Mè luxury'],
  ['Đá trời nóng', 'Mè Thái'],
  ['Hiệu năng cao', 'Mè nano'],
]

export function FabricGuidePage() {
  return (
    <article className="bg-[#f5f3ee] text-[#10131a]">
      <section className="relative isolate overflow-hidden border-b border-black/10 bg-[#111827] text-white">
        <div className="absolute inset-0 -z-10 opacity-40 [background-image:linear-gradient(120deg,rgba(241,90,36,.55),transparent_36%),radial-gradient(circle_at_82%_12%,rgba(255,255,255,.2),transparent_24%),linear-gradient(rgba(255,255,255,.08)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,.08)_1px,transparent_1px)] [background-size:auto,auto,34px_34px,34px_34px]" />
        <div className="section-shell grid gap-8 py-6 sm:py-8 lg:grid-cols-[minmax(0,.98fr)_minmax(340px,.68fr)] lg:items-center lg:py-11">
          <div>
            <Link className="inline-flex min-h-10 items-center gap-2 text-sm font-black text-white/80 transition hover:text-white" href="/">
              <ArrowLeft size={18} /> Trang chủ
            </Link>
            <p className="mt-7 text-xs font-black uppercase tracking-[.2em] text-brand">Chất liệu vải X24 Sport</p>
            <h1 className="mt-3 max-w-3xl font-display text-[clamp(2.55rem,6.25vw,5.9rem)] font-extrabold uppercase leading-[.9] tracking-normal">
              Chọn vải trước khi chọn mẫu áo
            </h1>
            <p className="mt-5 max-w-xl text-base font-medium leading-7 text-slate-200 sm:text-[17px]">
              5 chất liệu thường dùng cho áo bóng đá, được đặt cạnh nhau để đội dễ so sánh cảm giác mặc, độ thoáng và tình huống sử dụng.
            </p>
          </div>
          <div className="rounded-lg border border-white/15 bg-white/[.06] p-3 shadow-2xl backdrop-blur">
            <div className="grid grid-cols-2 gap-2">
              {quickPicks.map(([label, value]) => (
                <div className="rounded-md border border-white/10 bg-black/20 p-3" key={label}>
                  <p className="text-[11px] font-black uppercase tracking-[.14em] text-white/45">{label}</p>
                  <p className="mt-1 font-display text-xl font-bold text-white">{value}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="section-shell py-10 sm:py-14">
        <div className="grid gap-4 lg:grid-cols-[280px_minmax(0,1fr)]">
          <aside className="lg:sticky lg:top-28 lg:self-start">
            <p className="text-xs font-black uppercase tracking-[.18em] text-brand">Bảng vật liệu</p>
            <h2 className="mt-2 font-display text-4xl font-bold leading-none">Sờ bằng mắt trước.</h2>
            <p className="mt-4 text-sm leading-7 text-slate-600">Ảnh vải được giữ lớn để nhìn bề mặt sợi, sau đó đọc nhanh gợi ý dùng cho đội bóng.</p>
          </aside>

          <div className="grid gap-4">
            {fabrics.map((fabric, index) => (
              <section className="group grid overflow-hidden rounded-lg border border-black/10 bg-white shadow-[0_18px_50px_rgba(16,19,26,.08)] transition duration-300 hover:-translate-y-0.5 hover:shadow-[0_24px_70px_rgba(16,19,26,.14)] md:grid-cols-[minmax(240px,.92fr)_minmax(0,1.08fr)]" key={fabric.name}>
                <FabricLightbox
                  alt={fabric.alt}
                  className="relative block aspect-[4/3] cursor-zoom-in overflow-hidden bg-slate-200 text-left md:aspect-auto"
                  image={fabric.image}
                  title={fabric.name}
                >
                  <img alt={fabric.alt} className="h-full w-full object-cover transition duration-500 group-hover:scale-[1.04]" fetchPriority={index === 0 ? 'high' : undefined} loading={index === 0 ? 'eager' : 'lazy'} src={fabric.image} />
                  <span className="absolute left-3 top-3 rounded-md bg-[#10131a] px-2.5 py-1 font-display text-xl font-bold text-white">{String(index + 1).padStart(2, '0')}</span>
                </FabricLightbox>
                <div className="grid gap-5 p-5 sm:p-7">
                  <div>
                    <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-brand"><Sparkles size={14} /> {fabric.note}</p>
                    <h3 className="mt-2 font-display text-4xl font-bold leading-none sm:text-5xl">{fabric.name}</h3>
                  </div>
                  <p className="text-base font-semibold leading-7 text-slate-700">{fabric.bestFor}</p>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="rounded-md bg-[#f5f3ee] p-3">
                      <p className="text-[11px] font-black uppercase tracking-[.14em] text-slate-500">Cảm giác</p>
                      <p className="mt-1 font-bold">{fabric.feel}</p>
                    </div>
                    <div className="rounded-md bg-[#f5f3ee] p-3">
                      <p className="text-[11px] font-black uppercase tracking-[.14em] text-slate-500">Độ thoáng</p>
                      <p className="mt-1 font-bold">{fabric.breath}</p>
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {fabric.tags.map((tag) => (
                      <span className="inline-flex min-h-9 items-center gap-1 rounded-md border border-black/10 px-3 text-xs font-black" key={tag}><Check size={14} /> {tag}</span>
                    ))}
                  </div>
                </div>
              </section>
            ))}
          </div>
        </div>
      </section>

      <section className="section-shell grid gap-6 pb-12 sm:pb-16 lg:grid-cols-[minmax(0,.8fr)_minmax(0,1.2fr)] lg:items-center">
        <div className="rounded-lg bg-[#10131a] p-6 text-white sm:p-8">
          <p className="flex items-center gap-2 text-xs font-black uppercase tracking-[.16em] text-brand"><Wind size={15} /> Size và form áo</p>
          <h2 className="mt-3 font-display text-4xl font-bold leading-none sm:text-5xl">Chọn vải xong, chốt size cho cả đội.</h2>
          <p className="mt-4 text-sm leading-7 text-slate-300">Dùng bảng size làm mốc, sau đó gửi chiều cao và cân nặng nếu đội có nhiều dáng người khác nhau.</p>
        </div>
        <div className="overflow-hidden rounded-lg border border-black/10 bg-white p-2 shadow-[0_18px_50px_rgba(16,19,26,.08)]">
          <img alt="Bảng size may áo bóng đá X24 Sport" className="h-auto w-full rounded-md" loading="eager" src="https://static.x24sport.vn/mayaobongda/wp-1442-bang-size-may-ao-bong-da.jpg" />
        </div>
      </section>

      <section className="border-y border-black/10 bg-white">
        <div className="section-shell flex flex-col gap-5 py-8 sm:py-10 lg:flex-row lg:items-center lg:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[.16em] text-brand">Tư vấn nhanh</p>
            <h2 className="mt-2 font-display text-4xl font-bold leading-none">Gửi mẫu áo, số lượng và ngân sách.</h2>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white transition hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">
              <MessageCircle size={18} /> Zalo tư vấn <ArrowRight size={17} />
            </a>
            <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg border border-black/15 px-5 text-sm font-black transition hover:border-brand hover:text-brand" href={`tel:${PHONE_VALUE}`}>
              <Phone size={18} /> {PHONE_DISPLAY}
            </a>
          </div>
        </div>
      </section>
    </article>
  )
}
