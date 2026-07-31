import type { Metadata } from 'next'

import { FootballAudienceLandingPage } from '../components/audience-landing-page'
import { getFootballAudienceLanding } from '../lib/audience-landings'

const landing = getFootballAudienceLanding('ao-bong-da-doi-bong-cau-lac-bo')

export const metadata: Metadata = {
  title: landing.metaTitle,
  description: landing.metaDescription,
  alternates: { canonical: `/${landing.slug}/` },
  openGraph: { title: landing.metaTitle, description: landing.metaDescription, url: `/${landing.slug}/`, images: [{ url: landing.heroImage, width: 1536, height: 1024, alt: landing.heroAlt }] },
}

export default function FootballClubLanding() {
  return <FootballAudienceLandingPage landing={landing} />
}
