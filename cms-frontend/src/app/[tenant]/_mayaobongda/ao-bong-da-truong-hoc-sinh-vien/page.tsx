import type { Metadata } from 'next'

import { FootballAudienceLandingPage } from '../components/audience-landing-page'
import { getFootballAudienceLanding } from '../lib/audience-landings'

const landing = getFootballAudienceLanding('ao-bong-da-truong-hoc-sinh-vien')

export async function generateMetadata({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }): Promise<Metadata> {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  const canonical = page > 1 ? `/${landing.slug}/?page=${page}` : `/${landing.slug}/`
  return {
    title: `${landing.metaTitle}${page > 1 ? ` - Trang ${page}` : ''}`,
    description: landing.metaDescription,
    alternates: { canonical },
    openGraph: { title: landing.metaTitle, description: landing.metaDescription, url: canonical, images: [{ url: landing.heroImage, width: 1536, height: 1024, alt: landing.heroAlt }] },
  }
}

export default async function SchoolLanding({ searchParams }: { searchParams: Promise<Record<string, string | string[] | undefined>> }) {
  const query = await searchParams
  const page = Math.max(1, Number(Array.isArray(query.page) ? query.page[0] : query.page) || 1)
  return <FootballAudienceLandingPage landing={landing} page={page} />
}
