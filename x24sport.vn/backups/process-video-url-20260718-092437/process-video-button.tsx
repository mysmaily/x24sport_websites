"use client"

import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Play, X } from 'lucide-react'

const rawVideoUrl = process.env.NEXT_PUBLIC_PROCESS_VIDEO_URL?.trim() ?? ''

function toEmbeddableUrl(url: string) {
  if (!url) return ''

  try {
    const parsed = new URL(url)

    if (parsed.hostname === 'youtu.be') {
      const videoId = parsed.pathname.split('/').filter(Boolean)[0]
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }

    if (parsed.hostname.includes('youtube.com')) {
      const videoId = parsed.searchParams.get('v')
      return videoId ? `https://www.youtube.com/embed/${videoId}` : url
    }

    return url
  } catch {
    return url
  }
}

function isDirectVideo(url: string) {
  return /\.(mp4|webm|ogg)(\?.*)?$/i.test(url)
}

const videoUrl = toEmbeddableUrl(rawVideoUrl)

export function ProcessVideoButton() {
  const [isOpen, setIsOpen] = useState(false)
  const closeButtonRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    if (!isOpen) return

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setIsOpen(false)
    }

    const originalOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    window.addEventListener('keydown', handleKeyDown)
    closeButtonRef.current?.focus()

    return () => {
      document.body.style.overflow = originalOverflow
      window.removeEventListener('keydown', handleKeyDown)
    }
  }, [isOpen])

  return (
    <>
      <button className="brand-story-link" type="button" onClick={() => setIsOpen(true)}>
        Khám phá quy trình <ArrowRight size={18} />
      </button>
      {isOpen ? (
        <div className="video-modal-backdrop" role="presentation" onMouseDown={() => setIsOpen(false)}>
          <section
            className="video-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="process-video-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="video-modal-header">
              <div>
                <p>X24SPORT CUSTOM TEAMWEAR</p>
                <h2 id="process-video-title">Quy trình thiết kế đồng phục</h2>
              </div>
              <button ref={closeButtonRef} type="button" onClick={() => setIsOpen(false)} aria-label="Đóng video quy trình">
                <X size={22} />
              </button>
            </div>
            <div className="video-modal-frame">
              {videoUrl ? (
                isDirectVideo(videoUrl) ? (
                  <video src={videoUrl} controls autoPlay playsInline preload="metadata" />
                ) : (
                  <iframe
                    src={videoUrl}
                    title="Video quy trình thiết kế đồng phục X24Sport"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
                    allowFullScreen
                  />
                )
              ) : (
                <div className="video-modal-empty">
                  <Play size={42} />
                  <strong>Video quy trình đang chờ cập nhật</strong>
                  <p>Thêm URL video vào biến môi trường <code>NEXT_PUBLIC_PROCESS_VIDEO_URL</code> để popup phát video thật.</p>
                  <a href="tel:0989353247">Tư vấn quy trình ngay</a>
                </div>
              )}
            </div>
          </section>
        </div>
      ) : null}
    </>
  )
}
