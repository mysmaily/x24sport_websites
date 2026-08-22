import type { CollectionConfig } from 'payload'

import { distributionRead, superAdminsOnly } from '../access/roles'
import { relationID } from '../util/tenantIdentity'
import { assertSameTenantRelationship } from '../util/navigationValidation'

const effective = (
  data: Record<string, unknown> | null | undefined,
  originalDoc: Record<string, unknown> | null | undefined,
  field: string,
) => data?.[field] ?? originalDoc?.[field]

export const CategoryDistributions: CollectionConfig = {
  slug: 'category-distributions',
  admin: {
    defaultColumns: ['status', 'sourceTenant', 'sourceKind', 'targetTenant', 'copyMode', 'syncedAt'],
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
        const sourceTenant = effective(data, originalDoc, 'sourceTenant')
        const targetTenant = effective(data, originalDoc, 'targetTenant')
        const sourceTenantID = relationID(sourceTenant as Parameters<typeof relationID>[0])
        const targetTenantID = relationID(targetTenant as Parameters<typeof relationID>[0])
        const sourceKind = effective(data, originalDoc, 'sourceKind')
        const sourceCategory = effective(data, originalDoc, 'sourceCategory')
        const sourceCatalogView = effective(data, originalDoc, 'sourceCatalogView')
        const targetCategory = effective(data, originalDoc, 'targetCategory')
        const targetCatalogView = effective(data, originalDoc, 'targetCatalogView')

        if (
          sourceTenantID !== undefined &&
          targetTenantID !== undefined &&
          String(sourceTenantID) === String(targetTenantID)
        ) {
          throw new Error('Nguồn và đích phân phối phải thuộc hai website khác nhau.')
        }

        const sourceRecord = sourceKind === 'category' ? sourceCategory : sourceCatalogView
        const targetRecord = sourceKind === 'category' ? targetCategory : targetCatalogView
        const wrongSource = sourceKind === 'category' ? sourceCatalogView : sourceCategory
        const wrongTarget = sourceKind === 'category' ? targetCatalogView : targetCategory
        const sourceRecordID = relationID(sourceRecord as Parameters<typeof relationID>[0])

        if (!['category', 'catalog_view'].includes(String(sourceKind))) {
          throw new Error('sourceKind phải là category hoặc catalog_view.')
        }
        if (sourceRecordID === undefined || relationID(wrongSource as Parameters<typeof relationID>[0]) !== undefined) {
          throw new Error('Nguồn phân phối phải có đúng một record khớp với sourceKind.')
        }
        if (relationID(wrongTarget as Parameters<typeof relationID>[0]) !== undefined) {
          throw new Error('Record đích phải khớp với sourceKind.')
        }

        const sourceCollection = sourceKind === 'category' ? 'product-categories' : 'catalog-views'
        if (sourceTenantID !== undefined) {
          await assertSameTenantRelationship({
            collection: sourceCollection,
            label: 'Record nguồn',
            relation: sourceRecord,
            req,
            tenant: sourceTenant,
          })
        }
        if (targetTenantID !== undefined && targetRecord) {
          await assertSameTenantRelationship({
            collection: sourceCollection,
            label: 'Record đích',
            relation: targetRecord,
            req,
            tenant: targetTenant,
          })
        }

        const [sourceTenantDoc, targetTenantDoc] = await Promise.all([
          sourceTenantID === undefined
            ? undefined
            : req.payload.findByID({
                collection: 'tenants',
                id: sourceTenantID,
                depth: 0,
                overrideAccess: true,
              }),
          targetTenantID === undefined
            ? undefined
            : req.payload.findByID({
                collection: 'tenants',
                id: targetTenantID,
                depth: 0,
                overrideAccess: true,
              }),
        ])

        return {
          ...data,
          ...(sourceTenantID !== undefined && sourceRecordID !== undefined && targetTenantID !== undefined
            ? {
                distributionKey: `${sourceTenantID}:${sourceKind}:${sourceRecordID}:${targetTenantID}`,
              }
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
      name: 'sourceKind',
      type: 'select',
      required: true,
      options: [
        { label: 'Danh mục', value: 'category' },
        { label: 'Catalog view', value: 'catalog_view' },
      ],
    },
    {
      name: 'sourceCategory',
      type: 'relationship',
      relationTo: 'product-categories',
      admin: { condition: (_, siblingData) => siblingData?.sourceKind === 'category' },
    },
    {
      name: 'sourceCatalogView',
      type: 'relationship',
      relationTo: 'catalog-views',
      admin: { condition: (_, siblingData) => siblingData?.sourceKind === 'catalog_view' },
    },
    {
      name: 'targetCategory',
      type: 'relationship',
      relationTo: 'product-categories',
      admin: { condition: (_, siblingData) => siblingData?.sourceKind === 'category' },
    },
    {
      name: 'targetCatalogView',
      type: 'relationship',
      relationTo: 'catalog-views',
      admin: { condition: (_, siblingData) => siblingData?.sourceKind === 'catalog_view' },
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
        { name: 'navigationLabel', type: 'text' },
        { name: 'path', type: 'text' },
        { name: 'navigationOrder', type: 'number' },
        { name: 'description', type: 'textarea', admin: { rows: 6 } },
        { name: 'seoTitle', type: 'text' },
        { name: 'metaDescription', type: 'textarea' },
        { name: 'model', type: 'text', admin: { readOnly: true } },
        { name: 'promptVersion', type: 'text', admin: { readOnly: true } },
      ],
    },
  ],
}
