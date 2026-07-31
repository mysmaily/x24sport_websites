import { AudienceLandingPage, audienceMetadata } from '../components/audience-landing-page'
import { getBasketballAudience } from '../lib/basketball-audiences'

const audience = getBasketballAudience('dong-phuc-clb')!

export const metadata = audienceMetadata(audience)

export default function BasketballClubUniformPage() {
  return <AudienceLandingPage audience={audience} />
}
