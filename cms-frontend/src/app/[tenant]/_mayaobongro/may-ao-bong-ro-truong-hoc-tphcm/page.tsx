import { AudienceLandingPage, audienceMetadata } from '../components/audience-landing-page'
import { getBasketballAudience } from '../lib/basketball-audiences'

const audience = getBasketballAudience('truong-hoc-tphcm')!

export const metadata = audienceMetadata(audience)

export default function HcmcSchoolBasketballPage() {
  return <AudienceLandingPage audience={audience} />
}
