import type { ServerProps } from 'payload'
import React from 'react'

import type { Config } from '../../payload-types'
import { DashboardWebsiteCard } from './DashboardWebsiteCard'

type DashboardWelcomeProps = Pick<ServerProps, 'payload'> & {
  req?: {
    user?: Config['user'] | null
  }
  user?: Config['user'] | null
}

export async function DashboardWelcome({ payload, req, user }: DashboardWelcomeProps) {
  const activeUser = user || req?.user
  const result = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 100,
    overrideAccess: false,
    pagination: false,
    select: {
      domains: true,
      name: true,
      slug: true,
    },
    sort: 'name',
    ...(activeUser ? { user: activeUser } : {}),
  })

  const websites = result.docs.map((website) => {
    const domains = website.domains?.map(({ domain }) => domain).filter(Boolean) || []
    const primaryDomain =
      website.slug === 'mayaochaybo'
        ? domains.find((domain) => domain.startsWith('next.')) || domains[0]
        : domains.find((domain) => !domain.startsWith('next.')) || domains[0]

    return {
      domain: primaryDomain,
      id: website.id,
      name: website.name,
    }
  })

  return <DashboardWebsiteCard websites={websites} />
}
