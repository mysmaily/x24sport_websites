import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead } from '../access/roles'
import { buildTenantIdentity } from '../util/tenantIdentity'

export const WebContent: CollectionConfig = {
  slug: 'web-content',
  admin: {
    defaultColumns: ['title', 'kind', 'legacyPath', 'publicationStatus', 'updatedAt'],
    group: 'Content',
    useAsTitle: 'title',
  },
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: publicRead,
    update: adminsOnly,
  },
  hooks: {
    beforeValidate: [
      ({ data, originalDoc }) => ({
        ...data,
        ...buildTenantIdentity({ data, originalDoc }),
      }),
    ],
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true, index: true },
    { name: 'tenantSlugKey', type: 'text', unique: true, admin: { hidden: true } },
    {
      name: 'kind',
      type: 'select',
      required: true,
      options: ['page', 'post'],
    },
    { name: 'legacyPath', type: 'text', required: true, index: true },
    { name: 'tenantLegacyPathKey', type: 'text', unique: true, admin: { hidden: true } },
    { name: 'contentHtml', type: 'textarea', maxLength: 2_000_000 },
    { name: 'excerpt', type: 'textarea' },
    {
      name: 'publicationStatus',
      type: 'select',
      defaultValue: 'publish',
      options: ['publish', 'draft', 'private', 'pending'],
    },
    { name: 'sourceSystem', type: 'text', admin: { hidden: true } },
    { name: 'sourceId', type: 'text', index: true, admin: { hidden: true } },
    { name: 'tenantSourceKey', type: 'text', unique: true, admin: { hidden: true } },
    { name: 'sourceModifiedAt', type: 'date', admin: { hidden: true } },
    { name: 'sourceChecksum', type: 'text', admin: { hidden: true } },
  ],
}
