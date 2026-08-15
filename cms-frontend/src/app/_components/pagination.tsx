import Link from 'next/link'

export type PaginationProps = {
  ariaLabel?: string
  basePath?: string
  className?: string
  hrefForPage?: (page: number) => string
  page: number
  params?: Record<string, string | undefined>
  totalPages: number
}

export function getPaginationItems(currentPage: number, totalPages: number) {
  if (totalPages <= 0) return []
  if (totalPages <= 7) return Array.from({ length: totalPages }, (_, index) => index + 1)

  const safePage = Math.min(Math.max(currentPage, 1), totalPages)
  const visiblePages = new Set([
    1,
    2,
    safePage - 1,
    safePage,
    safePage + 1,
    totalPages - 1,
    totalPages,
  ])
  const pages = [...visiblePages]
    .filter((item) => item >= 1 && item <= totalPages)
    .sort((a, b) => a - b)
  const items: Array<number | `ellipsis-${number}`> = []

  pages.forEach((item, index) => {
    if (index > 0 && item - pages[index - 1] > 1) items.push(`ellipsis-${item}`)
    items.push(item)
  })

  return items
}

export function Pagination({
  ariaLabel = 'Phân trang',
  basePath,
  className = '',
  hrefForPage,
  page,
  totalPages,
  params = {},
}: PaginationProps) {
  if (totalPages <= 1) return null
  const items = getPaginationItems(page, totalPages)

  const defaultHrefForPage = (item: number) => {
    const query = new URLSearchParams()
    Object.entries(params).forEach(([key, value]) => { if (value) query.set(key, value) })
    if (item > 1) query.set('page', String(item))
    return `${basePath || '/'}${query.size ? `?${query.toString()}` : ''}`
  }

  return (
    <nav className={`numbered-pagination ${className}`.trim()} aria-label={ariaLabel}>
      {items.map((item) => typeof item === 'number' ? (
        <Link
          aria-current={item === page ? 'page' : undefined}
          aria-label={`Trang ${item}`}
          className={`${item === page ? 'is-current' : ''}${item === 2 || item === totalPages - 1 ? ' is-edge-secondary' : ''}`}
          href={(hrefForPage || defaultHrefForPage)(item)}
          key={item}
        >
          {item}
        </Link>
      ) : (
        <span aria-hidden="true" className="numbered-pagination-ellipsis" key={item}>…</span>
      ))}
    </nav>
  )
}
