import Link from 'next/link'

export function Pagination({
  basePath,
  page,
  totalPages,
  params = {},
}: {
  basePath: string
  page: number
  totalPages: number
  params?: Record<string, string | undefined>
}) {
  if (totalPages <= 1) return null
  const pages = Array.from({ length: totalPages }, (_, index) => index + 1)
    .filter((item) => item === 1 || item === totalPages || Math.abs(item - page) <= 2)

  return (
    <nav className="pagination" aria-label="Phân trang">
      {pages.map((item, index) => {
        const query = new URLSearchParams()
        Object.entries(params).forEach(([key, value]) => { if (value) query.set(key, value) })
        if (item > 1) query.set('page', String(item))
        const previous = pages[index - 1]
        const href = `${basePath}${query.size ? `?${query.toString()}` : ''}`
        return (
          <span key={item}>
            {previous && item - previous > 1 && <i aria-hidden="true">…</i>}
            <Link className={item === page ? 'active' : ''} aria-current={item === page ? 'page' : undefined} href={href}>{item}</Link>
          </span>
        )
      })}
    </nav>
  )
}
