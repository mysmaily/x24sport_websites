import { ArrowRight } from 'lucide-react'
import type { Metadata } from 'next'
import Link from 'next/link'
import { getLatestPosts } from '@/lib/cms'
import { excerpt } from '@/lib/site'
export const dynamic = 'force-dynamic'
export const metadata: Metadata = { title: 'Kinh nghiệm chạy bộ', alternates: { canonical: '/blog/' } }
export default async function BlogPage() { const posts = await getLatestPosts(100); return <div className="section-shell py-12 sm:py-20"><p className="section-kicker">Góc chạy bộ</p><h1 className="section-title">Kinh nghiệm cho đội và giải chạy.</h1><div className="mt-10 grid gap-4 md:grid-cols-2 lg:grid-cols-3">{posts.docs.map((post) => <article className="flex min-h-72 flex-col rounded-2xl border border-slate-200 bg-white p-6" key={post.id}><h2 className="font-display text-3xl font-bold leading-tight"><Link href={post.legacyPath}>{post.title}</Link></h2><p className="mt-4 text-sm leading-6 text-slate-600">{excerpt(post.excerpt, 150)}</p><Link className="mt-auto inline-flex items-center gap-2 pt-6 text-sm font-black text-brand" href={post.legacyPath}>Đọc bài <ArrowRight size={17} /></Link></article>)}</div></div> }
