import { AudienceLandingPage, audienceMetadata } from '@/components/audience-landing-page'
import { getBasketballAudience } from '@/lib/basketball-audiences'

const audience = getBasketballAudience('doi-tuyen-chuyen-nghiep')!

export const metadata = audienceMetadata(audience)

export default function ProAudiencePage() {
  return <AudienceLandingPage audience={audience} />
}
