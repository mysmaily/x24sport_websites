import type { CollectionConfig } from 'payload'

import { distributionRead, superAdminsOnly } from '../access/roles'

type RelationValue = number | string | { id?: number | string } | null | undefined

const relationID = (value: RelationValue) =>
  typeof value === 'number' || typeof value === 'string' ? value : value?.id

export const CatalogDistributions: CollectionConfig = {
  slug: 'catalog-distributions',
  admin: {
    defaultColumns: ['status', 'sourceTenant', 'sourceProduct', 'targetTenant', 'targetProduct', 'syncedAt'],
    group: 'Catalog',
    useAsTitle: 'distributionKey',
  },
  access: {
    create: superAdminsOnly,
    delete: superAdminsOnly,
    read: distributionRead,
    update: superAdminsOnly,
  },
  hooks: {
    beforeValidate: [
      async ({ data, originalDoc, req }) => {
        const sourceTenant = relationID(data?.sourceTenant ?? originalDoc?.sourceTenant)
        const sourceProduct = relationID(data?.sourceProduct ?? originalDoc?.sourceProduct)
        const targetTenant = relationID(data?.targetTenant ?? originalDoc?.targetTenant)

        if (sourceTenant && targetTenant && String(sourceTenant) === String(targetTenant)) {
          throw new Error('Nguồn và đích phân phối phải thuộc hai website khác nhau.')
        }

        const [sourceTenantDoc, targetTenantDoc] = await Promise.all([
          sourceTenant ? req.payload.findByID({ collection: 'tenants', id: sourceTenant, depth: 0, overrideAccess: true }) : undefined,
          targetTenant ? req.payload.findByID({ collection: 'tenants', id: targetTenant, depth: 0, overrideAccess: true }) : undefined,
        ])

        return {
          ...data,
          ...(sourceTenant && sourceProduct && targetTenant
            ? { distributionKey: `${sourceTenant}:${sourceProduct}:${targetTenant}` }
            : {}),
          ...(sourceTenantDoc ? { sourceTenantLabel: sourceTenantDoc.name || sourceTenantDoc.slug } : {}),
          ...(targetTenantDoc ? { targetTenantLabel: targetTenantDoc.name || targetTenantDoc.slug } : {}),
        }
      },
    ],
  },
  fields: [
    { name: 'distributionKey', type: 'text', required: true, unique: true, index: true, admin: { hidden: true } },
    {
      type: 'row',
      fields: [
        { name: 'sourceTenant', type: 'relationship', relationTo: 'tenants', required: true, admin: { width: '50%' } },
        { name: 'targetTenant', type: 'relationship', relationTo: 'tenants', required: true, admin: { width: '50%' } },
      ],
    },
    { name: 'sourceTenantLabel', type: 'text', admin: { readOnly: true } },
    { name: 'targetTenantLabel', type: 'text', admin: { readOnly: true } },
    {
      type: 'row',
      fields: [
        { name: 'sourceProduct', type: 'relationship', relationTo: 'products', required: true, admin: { width: '50%' } },
        { name: 'targetProduct', type: 'relationship', relationTo: 'products', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'ready',
          options: ['ready', 'draft_created', 'published', 'needs_review', 'blocked', 'archived'],
          admin: { width: '50%' },
        },
        {
          name: 'copyMode',
          type: 'select',
          required: true,
          defaultValue: 'auto',
          options: ['auto', 'manual_locked'],
          admin: { width: '50%' },
        },
      ],
    },
    { name: 'sourceFactFingerprint', type: 'text', admin: { readOnly: true } },
    { name: 'targetCopyFingerprint', type: 'text', admin: { readOnly: true } },
    { name: 'syncedAt', type: 'date', admin: { date: { pickerAppearance: 'dayAndTime' } } },
    { name: 'lastError', type: 'textarea', admin: { rows: 3 } },
    { name: 'reviewNote', type: 'textarea', admin: { rows: 3 } },
    {
      name: 'proposedCopy',
      type: 'group',
      admin: { condition: (_, siblingData) => siblingData?.copyMode !== 'manual_locked' },
      fields: [
        { name: 'name', type: 'text' },
        { name: 'shortDescription', type: 'textarea' },
        { name: 'description', type: 'textarea', admin: { rows: 8 } },
        { name: 'seoTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'model', type: 'text', admin: { readOnly: true } },
        { name: 'promptVersion', type: 'text', admin: { readOnly: true } },
      ],
    },
  ],
}
