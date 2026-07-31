import { AudienceLandingPage, audienceMetadata } from '../components/audience-landing-page'
import { getBasketballAudience } from '../lib/basketball-audiences'

const audience = getBasketballAudience('hoc-sinh-ha-noi')!

export const metadata = audienceMetadata(audience)

export default function HanoiStudentBasketballPage() {
  return <AudienceLandingPage audience={audience} />
}
