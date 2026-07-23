import { ArrowRight, Images, MessageCircle } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'

import { getFinishedSamplePosts } from '@/lib/cms'
import { excerpt, pageMetadata, ZALO_URL } from '@/lib/site'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = pageMetadata({
  title: 'Mẫu Đã Làm',
  description: 'Xem các mẫu áo bóng rổ thực tế đã may cho trường học, câu lạc bộ và đội nhóm.',
  path: '/mau-da-lam/',
})

function firstImage(html?: string | null) {
  if (!html) return null
  const match = html.match(/<img[^>]+src=["']([^"']+)["'][^>]*>/i)
  return match?.[1] ?? null
}

export default async function FinishedSamplesPage() {
  const samples = await getFinishedSamplePosts(12)

  return (
    <main>
      <section className="border-b border-slate-200 bg-white">
        <div className="section-shell grid gap-8 py-10 sm:py-14 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <p className="section-kicker">Hình ảnh thực tế</p>
            <h1 className="section-title">Mẫu đã làm</h1>
            <p className="section-lead">
              Tham khảo các mẫu áo bóng rổ đã may cho trường học và đội nhóm. Mỗi mẫu có thể dùng làm điểm bắt đầu để đổi màu, thêm logo, tên và số theo nhận diện riêng.
            </p>
          </div>
          <a className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white transition hover:-translate-y-0.5 hover:bg-brand-dark" href={ZALO_URL} rel="noreferrer" target="_blank">
            <MessageCircle aria-hidden="true" size={18} /> Gửi mẫu muốn làm
          </a>
        </div>
      </section>

      <section className="section-shell py-10 sm:py-14">
        {samples.docs.length ? (
          <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
            {samples.docs.map((sample) => {
              const image = firstImage(sample.contentHtml)
              return (
                <article className="group overflow-hidden rounded-lg border border-slate-200 bg-white shadow-[0_16px_45px_rgba(15,23,42,.06)]" key={sample.id}>
                  <Link className="block bg-slate-100" href={sample.legacyPath} aria-label={sample.title}>
                    <div className="aspect-[4/3] overflow-hidden">
                      {image ? (
                        <img className="h-full w-full object-cover transition duration-500 group-hover:scale-105" src={image} alt={sample.title} loading="lazy" />
                      ) : (
                        <div className="grid h-full place-items-center text-brand"><Images aria-hidden="true" size={44} strokeWidth={1.5} /></div>
                      )}
                    </div>
                  </Link>
                  <div className="p-5">
                    <p className="text-xs font-black uppercase tracking-wider text-brand">Mẫu đã may</p>
                    <h2 className="mt-3 font-display text-2xl font-bold leading-tight text-slate-950">
                      <Link className="hover:text-brand" href={sample.legacyPath}>{sample.title}</Link>
                    </h2>
                    <p className="mt-3 text-sm leading-6 text-slate-600">{excerpt(sample.excerpt, 135)}</p>
                    <Link className="mt-5 inline-flex min-h-11 items-center gap-2 text-sm font-black text-brand" href={sample.legacyPath}>
                      Xem chi tiết <ArrowRight aria-hidden="true" size={17} />
                    </Link>
                  </div>
                </article>
              )
            })}
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-slate-300 bg-white p-10 text-center">
            <Images className="mx-auto text-brand" aria-hidden="true" size={42} strokeWidth={1.5} />
            <h2 className="mt-5 font-display text-3xl font-bold text-slate-950">Chưa có mẫu đã làm để hiển thị.</h2>
            <p className="mx-auto mt-3 max-w-xl text-sm leading-6 text-slate-600">Bạn vẫn có thể xem catalog mẫu áo hoặc gửi mẫu tham khảo để được tư vấn phối lại theo đội.</p>
            <Link className="mt-6 inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-brand px-5 text-sm font-black text-white" href="/san-pham/">
              Xem mẫu áo <ArrowRight aria-hidden="true" size={17} />
            </Link>
          </div>
        )}
      </section>
    </main>
  )
}
