import { AudienceLandingPage, audienceMetadata } from '../components/audience-landing-page'
import { getBasketballAudience } from '../lib/basketball-audiences'

const audience = getBasketballAudience('tre-em')!

export const metadata = audienceMetadata(audience)

export default function ChildrenBasketballUniformPage() {
  return <AudienceLandingPage audience={audience} />
}
