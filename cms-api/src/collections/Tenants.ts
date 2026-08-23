import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead, superAdminsOnly } from '../access/roles'
import { syncCustomerTenantUsersForTenantChange } from '../util/customerTenantAccess'

export const normalizeTenantDomain = (value: unknown) => {
  if (typeof value !== 'string') return ''

  const withoutProtocol = value
    .trim()
    .toLowerCase()
    .replace(/^[a-z][a-z0-9+.-]*:\/\//, '')
    .replace(/^\/\//, '')

  return withoutProtocol
    .split(/[/?#]/)[0]
    .replace(/\.$/, '')
}

export const Tenants: CollectionConfig = {
  slug: 'tenants',
  labels: {
    plural: 'Websites',
    singular: 'Website',
  },
  admin: {
    group: 'Platform',
    useAsTitle: 'name',
  },
  access: {
    create: superAdminsOnly,
    delete: superAdminsOnly,
    read: publicRead,
    update: adminsOnly,
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, unique: true },
    {
      name: 'customer',
      type: 'relationship',
      relationTo: 'customers',
      required: true,
      index: true,
      admin: {
        position: 'sidebar',
      },
    },
    {
      name: 'domains',
      type: 'array',
      required: true,
      fields: [
        { name: 'domain', type: 'text', required: true },
        { name: 'domainKey', type: 'text', unique: true, admin: { hidden: true } },
      ],
    },
    {
      name: 'brand',
      type: 'group',
      fields: [
        { name: 'headline', type: 'text', required: true },
        { name: 'subheadline', type: 'textarea', required: true },
        { name: 'primaryColor', type: 'text', defaultValue: '#101010' },
        { name: 'accentColor', type: 'text', defaultValue: '#e63946' },
        { name: 'style', type: 'select', options: ['flevo-inspired', 'arenix-inspired'] },
      ],
    },
  ],
  hooks: {
    afterChange: [
      async ({ doc, previousDoc, req }) => syncCustomerTenantUsersForTenantChange({ doc, previousDoc, req }),
    ],
    afterDelete: [
      async ({ doc, req }) => syncCustomerTenantUsersForTenantChange({ doc, req }),
    ],
    beforeValidate: [
      ({ data }) => {
        if (!data || !Array.isArray(data.domains)) return data

        const seen = new Set<string>()
        data.domains = data.domains.map((domainRow) => {
          const domain = normalizeTenantDomain(domainRow?.domain)
          if (!domain) return domainRow

          if (seen.has(domain)) {
            throw new Error(`Domain ${domain} bị nhập trùng trong cùng một website.`)
          }
          seen.add(domain)

          return {
            ...domainRow,
            domain,
            domainKey: domain,
          }
        })

        return data
      },
    ],
  },
}
