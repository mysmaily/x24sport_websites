import type { ServerProps } from 'payload'
import React from 'react'

import { DashboardWebsiteCard } from './DashboardWebsiteCard'

export async function DashboardWelcome({ payload }: Pick<ServerProps, 'payload'>) {
  const result = await payload.find({
    collection: 'tenants',
    depth: 0,
    limit: 100,
    pagination: false,
    select: {
      domains: true,
      name: true,
      slug: true,
    },
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
