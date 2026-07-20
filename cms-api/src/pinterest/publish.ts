import type { Payload } from 'payload'

import type { Product, Tenant, TenantPinterestConnection } from '../payload-types'
import type { PinterestEnvironment } from './config'

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
  environment = 'production',
  payload,
  persistConnection = true,
  product,
  tenant,
}: {
  connection: TenantPinterestConnection
  environment?: PinterestEnvironment
  payload: Payload
  persistConnection?: boolean
  product: Product
  tenant: Tenant
}) => {
  if (persistConnection && !connection.id) {
    throw new Error('Pinterest connection record is missing an ID.')
  }

  const updateConnection = async (data: Partial<TenantPinterestConnection>) => {
    if (persistConnection && connection.id) {
      await payload.update({
        collection: 'tenant-pinterest-connections',
        data,
        id: connection.id,
        overrideAccess: true,
      })
    }

    Object.assign(connection, data)
  }

  const accessToken = await ensureFreshPinterestToken({
    connection,
    environment,
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
    environment,
    tenant,
    updateConnection,
  })

  const pin = await createPinterestPin({
    accessToken,
    boardId,
    description: buildPinterestProductDescription(product, tenant),
    environment,
    imageUrl,
    link: productLink,
    title: product.name,
  })

  await updateConnection({
    lastPublishedAt: new Date().toISOString(),
    lastPublishedPinId: pin.id,
    lastPublishedProductId: String(product.id),
  })

  const pinURL = `https://www.pinterest.com/pin/${pin.id}/`

  await payload.update({
    collection: 'products',
    data: {
      pinterestBoardId: boardId,
      pinterestBoardName: boardName,
      pinterestPinId: pin.id,
      pinterestPinUrl: pinURL,
      pinterestPublishedAt: new Date().toISOString(),
      pinterestPublishEnvironment: environment,
    },
    id: product.id,
    overrideAccess: true,
  })

  return {
    boardId,
    boardName,
    pinId: pin.id,
    pinURL,
    productLink,
    productId: String(product.id),
  }
}
