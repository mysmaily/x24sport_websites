import { SearchDialog } from '../../../_components/search-dialog'

export function HeaderSearch() {
  return <SearchDialog action="/tim-kiem" iconSize={21} triggerClassName="h-12 w-12 rounded-full border border-white/16 text-white transition duration-200 hover:-translate-y-px hover:border-[rgba(238,43,36,.8)]" />
}
