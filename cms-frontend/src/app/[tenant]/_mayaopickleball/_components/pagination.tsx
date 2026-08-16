import { Pagination as NumberedPagination } from '../../../_components/pagination'

export type PaginationProps = {
  page: number
  totalPages: number
  baseHref: string
}

export function Pagination({ page, totalPages, baseHref }: PaginationProps) {
  const hrefForPage = (item: number) => item === 1
    ? baseHref
    : `${baseHref}${baseHref.includes('?') ? '&' : '?'}page=${item}`

  return (
    <NumberedPagination
      ariaLabel="Phân trang sản phẩm"
      hrefForPage={hrefForPage}
      page={page}
      totalPages={totalPages}
    />
  )
}
