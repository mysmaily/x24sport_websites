import type { Payload } from 'payload'

import type { Product, Tenant, TenantPinterestConnection } from '../payload-types'

import {
  buildPinterestProductDescription,
  buildTenantProductURL,
  createPinterestPin,
  ensureFreshPinterestToken,
  ensureTenantBoard,
  getPrimaryProductImageURL,
} from './client'

export const publishProductToPinterest = async ({
  connection,
  payload,
  product,
  tenant,
}: {
  connection: TenantPinterestConnection
  payload: Payload
  product: Product
  tenant: Tenant
}) => {
  if (!connection.id) {
    throw new Error('Pinterest connection record is missing an ID.')
  }

  const updateConnection = async (data: Partial<TenantPinterestConnection>) => {
    await payload.update({
      collection: 'tenant-pinterest-connections',
      data,
      id: connection.id,
      overrideAccess: true,
    })

    Object.assign(connection, data)
  }

  const accessToken = await ensureFreshPinterestToken({
    connection,
    updateConnection,
  })

  const imageUrl = getPrimaryProductImageURL(product)

  if (!imageUrl) {
    throw new Error('Sản phẩm chưa có ảnh để đăng Pinterest.')
  }

  const productLink = buildTenantProductURL({
    product,
    tenant,
  })

  const { boardId, boardName } = await ensureTenantBoard({
    accessToken,
    connection,
    tenant,
    updateConnection,
  })

  const pin = await createPinterestPin({
    accessToken,
    boardId,
    description: buildPinterestProductDescription(product, tenant),
    imageUrl,
    link: productLink,
    title: product.name,
  })

  await updateConnection({
    lastPublishedAt: new Date().toISOString(),
    lastPublishedPinId: pin.id,
    lastPublishedProductId: String(product.id),
  })

  return {
    boardId,
    boardName,
    pinId: pin.id,
    productLink,
  }
}
