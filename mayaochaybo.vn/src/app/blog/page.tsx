import type { Metadata } from 'next'
import { PostArchivePage } from '@/components/post-archive-page'
import { pageMetadata } from '@/lib/site'
export const dynamic = 'force-dynamic'
type SearchParams = Promise<Record<string, string | string[] | undefined>>
export async function generateMetadata({ searchParams }: { searchParams: SearchParams }): Promise<Metadata> { const query = await searchParams; const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1); return pageMetadata({ title: `Kinh nghiệm chạy bộ${page > 1 ? ` – Trang ${page}` : ''}`, description: 'Kiến thức chọn áo, thiết kế và chuẩn bị cho đội nhóm, câu lạc bộ và giải chạy.', path: page > 1 ? `/blog/?page=${page}` : '/blog/' }) }
export default async function BlogPage({ searchParams }: { searchParams: SearchParams }) { const query = await searchParams; const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1); return <PostArchivePage canonicalPath="/blog/" description="Kiến thức chọn áo, thiết kế và chuẩn bị cho đội nhóm, câu lạc bộ và giải chạy." page={page} title="Kinh nghiệm cho đội và giải chạy." /> }
