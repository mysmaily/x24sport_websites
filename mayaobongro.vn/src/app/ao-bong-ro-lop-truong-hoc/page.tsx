import { AudienceLandingPage, audienceMetadata } from '@/components/audience-landing-page'
import { getBasketballAudience } from '@/lib/basketball-audiences'

const audience = getBasketballAudience('lop-truong-hoc')!

export const metadata = audienceMetadata(audience)

export default function SchoolAudiencePage() {
  return <AudienceLandingPage audience={audience} />
}
