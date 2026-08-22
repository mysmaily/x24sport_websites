import type { PayloadRequest } from 'payload'

import { isAllowedNavigationURL, sameRelation } from './navigationIdentity'
import { relationID } from './tenantIdentity'

type DocumentData = Record<string, unknown> | null | undefined
type TenantScopedCollection =
  | 'catalog-views'
  | 'navigation-items'
  | 'navigation-menus'
  | 'pages'
  | 'product-categories'

const effectiveValue = (data: DocumentData, originalDoc: DocumentData, field: string) =>
  data?.[field] ?? originalDoc?.[field]

const findTenantDocument = async ({
  collection,
  id,
  req,
}: {
  collection: TenantScopedCollection
  id: number | string
  req: PayloadRequest
}) =>
  (await req.payload.findByID({
    collection,
    id,
    depth: 0,
    draft: true,
    overrideAccess: true,
  })) as unknown as Record<string, unknown>

export const assertSameTenantRelationship = async ({
  collection,
  label,
  relation,
  req,
  tenant,
}: {
  collection: TenantScopedCollection
  label: string
  relation: unknown
  req: PayloadRequest
  tenant: unknown
}) => {
  const id = relationID(relation as Parameters<typeof relationID>[0])
  if (id === undefined) return undefined

  const document = await findTenantDocument({ collection, id, req })
  if (!sameRelation(document.tenant, tenant)) {
    throw new Error(`${label} phải thuộc cùng website với bản ghi hiện tại.`)
  }
  return document
}

export const validateCategoryHierarchy = async ({
  data,
  originalDoc,
  req,
}: {
  data: DocumentData
  originalDoc: DocumentData
  req: PayloadRequest
}) => {
  const tenant = effectiveValue(data, originalDoc, 'tenant')
  const currentID = relationID(originalDoc?.id as Parameters<typeof relationID>[0])
  let parentID = relationID(effectiveValue(data, originalDoc, 'parent') as Parameters<typeof relationID>[0])
  const visited = new Set(currentID === undefined ? [] : [String(currentID)])

  while (parentID !== undefined) {
    const parentKey = String(parentID)
    if (visited.has(parentKey)) throw new Error('Cây danh mục không được tạo chu trình.')
    visited.add(parentKey)

    const parent = await findTenantDocument({ collection: 'product-categories', id: parentID, req })
    if (tenant && !sameRelation(parent.tenant, tenant)) {
      throw new Error('Danh mục cha phải thuộc cùng website với danh mục con.')
    }
    parentID = relationID(parent.parent as Parameters<typeof relationID>[0])
  }
}

export const validateNavigationItem = async ({
  data,
  originalDoc,
  req,
}: {
  data: DocumentData
  originalDoc: DocumentData
  req: PayloadRequest
}) => {
  const tenant = effectiveValue(data, originalDoc, 'tenant')
  const menu = effectiveValue(data, originalDoc, 'menu')
  const menuID = relationID(menu as Parameters<typeof relationID>[0])

  if (tenant && menuID !== undefined) {
    await assertSameTenantRelationship({
      collection: 'navigation-menus',
      label: 'Menu',
      relation: menuID,
      req,
      tenant,
    })
  }

  const currentID = relationID(originalDoc?.id as Parameters<typeof relationID>[0])
  let parentID = relationID(effectiveValue(data, originalDoc, 'parent') as Parameters<typeof relationID>[0])
  const visited = new Set(currentID === undefined ? [] : [String(currentID)])
  let depth = 1

  while (parentID !== undefined) {
    const parentKey = String(parentID)
    if (visited.has(parentKey)) throw new Error('Cây navigation item không được tạo chu trình.')
    visited.add(parentKey)
    depth += 1
    if (depth > 3) throw new Error('Navigation item chỉ được sâu tối đa ba cấp.')

    const parent = await findTenantDocument({ collection: 'navigation-items', id: parentID, req })
    if (tenant && !sameRelation(parent.tenant, tenant)) {
      throw new Error('Navigation item cha phải thuộc cùng website.')
    }
    if (menuID !== undefined && !sameRelation(parent.menu, menuID)) {
      throw new Error('Navigation item cha phải thuộc cùng menu.')
    }
    parentID = relationID(parent.parent as Parameters<typeof relationID>[0])
  }

  const targetType = effectiveValue(data, originalDoc, 'targetType')
  const targetFields = {
    category: effectiveValue(data, originalDoc, 'targetCategory'),
    catalogView: effectiveValue(data, originalDoc, 'targetCatalogView'),
    page: effectiveValue(data, originalDoc, 'targetPage'),
    customUrl: effectiveValue(data, originalDoc, 'customUrl'),
  }
  const populatedTargets = Object.entries(targetFields).filter(([, value]) => {
    if (typeof value === 'string') return value.trim().length > 0
    return relationID(value as Parameters<typeof relationID>[0]) !== undefined
  })
  const isDraft = effectiveValue(data, originalDoc, '_status') !== 'published'

  if (targetType === 'group') {
    if (populatedTargets.length) throw new Error('Navigation group không được có href hoặc target.')
  } else if (typeof targetType === 'string') {
    const expectedTarget = populatedTargets.find(([name]) => name === targetType)
    if ((!isDraft && !expectedTarget) || populatedTargets.length > 1 || (populatedTargets.length === 1 && !expectedTarget)) {
      throw new Error('Navigation item phải có đúng một target khớp với targetType.')
    }
  }

  if (targetFields.customUrl && !isAllowedNavigationURL(targetFields.customUrl)) {
    throw new Error('Custom URL chỉ được dùng path nội bộ, http, https, mailto, tel hoặc anchor.')
  }

  if (tenant && targetFields.category) {
    await assertSameTenantRelationship({
      collection: 'product-categories',
      label: 'Danh mục đích',
      relation: targetFields.category,
      req,
      tenant,
    })
  }
  if (tenant && targetFields.catalogView) {
    await assertSameTenantRelationship({
      collection: 'catalog-views',
      label: 'Catalog view đích',
      relation: targetFields.catalogView,
      req,
      tenant,
    })
  }
  if (tenant && targetFields.page) {
    await assertSameTenantRelationship({
      collection: 'pages',
      label: 'Trang đích',
      relation: targetFields.page,
      req,
      tenant,
    })
  }

  const childrenSource = effectiveValue(data, originalDoc, 'childrenSource')
  if (!isDraft && childrenSource === 'category_query') {
    const query = effectiveValue(data, originalDoc, 'categoryQuery')
    if (!query || typeof query !== 'object') throw new Error('Category query phải có cấu hình truy vấn.')
  }
  if (!isDraft && childrenSource === 'catalog_view_query') {
    const query = effectiveValue(data, originalDoc, 'catalogViewQuery')
    if (!query || typeof query !== 'object') throw new Error('Catalog view query phải có cấu hình truy vấn.')
  }
}
