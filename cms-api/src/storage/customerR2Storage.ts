import { S3 } from '@aws-sdk/client-s3'
import { cloudStoragePlugin } from '@payloadcms/plugin-cloud-storage'
import { getFileKey } from '@payloadcms/plugin-cloud-storage/utilities'
import type { Adapter, GeneratedAdapter } from '@payloadcms/plugin-cloud-storage/types'
import fs from 'fs'
import type { Plugin } from 'payload'

import {
  resolveCustomerR2Storage,
  resolveR2StorageForCustomer,
  type ResolvedCustomerR2Storage,
} from './r2'

const clients = new Map<string, S3>()

const trimSlashes = (value: string) => value.replace(/^\/+|\/+$/g, '')
const trim = (value: unknown) => (typeof value === 'string' ? value.trim() : '')

const getClient = (storage: ResolvedCustomerR2Storage) => {
  const cacheKey = `${storage.endpoint}:${storage.accessKeyId}`
  const existingClient = clients.get(cacheKey)
  if (existingClient) return existingClient

  const client = new S3({
    credentials: {
      accessKeyId: storage.accessKeyId,
      secretAccessKey: storage.secretAccessKey,
    },
    endpoint: storage.endpoint,
    forcePathStyle: true,
    region: 'auto',
  })

  clients.set(cacheKey, client)
  return client
}

const fileKey = ({
  collectionPrefix,
  docPrefix,
  filename,
}: {
  collectionPrefix?: string
  docPrefix?: string
  filename: string
}) =>
  getFileKey({
    collectionPrefix,
    docPrefix,
    filename,
  }).fileKey

const publicBaseURLFromDocument = (data: any) => {
  const publicBaseUrl = trim(data?.r2StoragePublicBaseUrl)

  return publicBaseUrl
    ? publicBaseUrl.startsWith('http')
      ? trimSlashes(publicBaseUrl)
      : `https://${trimSlashes(publicBaseUrl)}`
    : null
}

export const createCustomerR2Adapter: Adapter =
  ({ collection, prefix: collectionPrefix = '' }): GeneratedAdapter => ({
    name: 'customer-r2',
    generateURL: ({ data, filename, prefix: docPrefix = '' }) => {
      const publicBaseUrl = publicBaseURLFromDocument(data)
      if (!publicBaseUrl) return ''

      const key = fileKey({ collectionPrefix, docPrefix, filename })
      return `${publicBaseUrl}/${key}`
    },
    handleDelete: async ({ doc, filename, req }) => {
      const mediaDoc = doc as any
      const storageCustomer =
        typeof mediaDoc.storageCustomer === 'number' || typeof mediaDoc.storageCustomer === 'string'
          ? mediaDoc.storageCustomer
          : mediaDoc.storageCustomer?.id
      const storage = storageCustomer
        ? await resolveR2StorageForCustomer({
            customerID: storageCustomer,
            req,
            tenantSlug: doc.prefix || '',
          })
        : await resolveCustomerR2Storage({
            req,
            tenant: mediaDoc.tenant,
          })

      await getClient(storage).deleteObject({
        Bucket: storage.bucket,
        Key: fileKey({ collectionPrefix, docPrefix: doc.prefix, filename }),
      })
    },
    handleUpload: async ({ data, file, req }) => {
      const storage = await resolveCustomerR2Storage({
        req,
        tenant: data.tenant,
      })
      const body = file.tempFilePath ? fs.createReadStream(file.tempFilePath) : file.buffer

      await getClient(storage).putObject({
        Body: body,
        Bucket: storage.bucket,
        ContentType: file.mimeType,
        Key: fileKey({ collectionPrefix, docPrefix: data.prefix, filename: file.filename }),
      })

      return {
        r2StorageBucket: storage.bucket,
        r2StorageEndpoint: storage.endpoint,
        r2StoragePublicBaseUrl: storage.publicBaseUrl,
        storageCustomer: storage.customerID,
      } as any
    },
    staticHandler: () => new Response(null, { status: 404 }),
  })

export const customerR2Storage = (): Plugin =>
  cloudStoragePlugin({
    alwaysInsertFields: true,
    collections: {
      media: {
        adapter: createCustomerR2Adapter,
        disablePayloadAccessControl: true,
        prefix: '',
      },
    },
  })
