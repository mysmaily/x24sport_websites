import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

export type PaginationProps = {
  page: number
  totalPages: number
  baseHref: string
}

function PageLink({
  page,
  currentPage,
  baseHref,
  disabled = false,
  children,
}: {
  page: number
  currentPage: number
  baseHref: string
  disabled?: boolean
  children: React.ReactNode
}) {
  if (disabled) {
    return (
      <span className="pagination-link is-disabled" aria-disabled="true">
        {children}
      </span>
    )
  }

  return (
    <Link
      className={`pagination-link${page === currentPage ? ' is-active' : ''}`}
      href={page === 1 ? baseHref : `${baseHref}?page=${page}`}
      aria-current={page === currentPage ? 'page' : undefined}
    >
      {children}
    </Link>
  )
}

export function Pagination({ page, totalPages, baseHref }: PaginationProps) {
  if (totalPages <= 1) return null

  // Build visible page numbers with ellipsis
  const pages: (number | 'ellipsis-start' | 'ellipsis-end')[] = []

  if (totalPages <= 7) {
    for (let i = 1; i <= totalPages; i++) pages.push(i)
  } else {
    pages.push(1)

    if (page > 3) {
      pages.push('ellipsis-start')
    }

    const start = Math.max(2, page - 1)
    const end = Math.min(totalPages - 1, page + 1)

    for (let i = start; i <= end; i++) {
      pages.push(i)
    }

    if (page < totalPages - 2) {
      pages.push('ellipsis-end')
    }

    pages.push(totalPages)
  }

  return (
    <nav className="pagination-nav" aria-label="Phân trang sản phẩm">
      <PageLink page={page - 1} currentPage={page} baseHref={baseHref} disabled={page <= 1}>
        <ChevronLeft size={18} />
        <span>Trước</span>
      </PageLink>

      <div className="pagination-pages">
        {pages.map((p) =>
          typeof p === 'number' ? (
            <PageLink key={p} page={p} currentPage={page} baseHref={baseHref}>
              {p}
            </PageLink>
          ) : (
            <span key={p} className="pagination-ellipsis" aria-hidden="true">
              …
            </span>
          ),
        )}
      </div>

      <PageLink page={page + 1} currentPage={page} baseHref={baseHref} disabled={page >= totalPages}>
        <span>Sau</span>
        <ChevronRight size={18} />
      </PageLink>
    </nav>
  )
}
