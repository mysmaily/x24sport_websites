import type { Metadata } from 'next'
import { PostArchivePage } from '@/components/post-archive-page'

export const dynamic = 'force-dynamic'
type SearchParams = Promise<Record<string, string | string[] | undefined>>

export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  return {
    title: `Tin tức áo bóng đá${page > 1 ? ` - Trang ${page}` : ''}`,
    description: 'Bài viết về chất liệu, quy trình đặt may và kinh nghiệm chọn mẫu áo bóng đá cho đội bóng và câu lạc bộ.',
    alternates: { canonical: page > 1 ? `/blog/?page=${page}` : '/blog/' },
  }
}

export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  return <PostArchivePage canonicalPath="/blog/" description="Tổng hợp bài viết hữu ích để chọn mẫu áo, vật liệu và quy trình đặt may cho đội bóng hoặc giải đấu." page={page} title="Tin tức áo bóng đá" />
}
