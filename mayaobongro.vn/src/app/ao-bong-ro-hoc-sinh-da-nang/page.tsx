import { AudienceLandingPage, audienceMetadata } from '@/components/audience-landing-page'
import { getBasketballAudience } from '@/lib/basketball-audiences'

const audience = getBasketballAudience('hoc-sinh-da-nang')!

export const metadata = audienceMetadata(audience)

export default function DaNangStudentBasketballPage() {
  return <AudienceLandingPage audience={audience} />
}
