import { AudienceLandingPage, audienceMetadata } from '../components/audience-landing-page'
import { getBasketballAudience } from '../lib/basketball-audiences'

const audience = getBasketballAudience('thpt')!

export const metadata = audienceMetadata(audience)

export default function HighSchoolBasketballUniformPage() {
  return <AudienceLandingPage audience={audience} />
}
