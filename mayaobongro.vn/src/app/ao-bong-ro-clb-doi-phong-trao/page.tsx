import { AudienceLandingPage, audienceMetadata } from '@/components/audience-landing-page'
import { getBasketballAudience } from '@/lib/basketball-audiences'

const audience = getBasketballAudience('clb-doi-bong-phong-trao')!

export const metadata = audienceMetadata(audience)

export default function ClubAudiencePage() {
  return <AudienceLandingPage audience={audience} />
}
