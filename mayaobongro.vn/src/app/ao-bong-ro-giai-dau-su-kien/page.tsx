import { AudienceLandingPage, audienceMetadata } from '@/components/audience-landing-page'
import { getBasketballAudience } from '@/lib/basketball-audiences'

const audience = getBasketballAudience('giai-dau-su-kien')!

export const metadata = audienceMetadata(audience)

export default function EventAudiencePage() {
  return <AudienceLandingPage audience={audience} />
}
