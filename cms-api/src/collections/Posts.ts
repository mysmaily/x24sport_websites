import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead } from '../access/roles'

export const Posts: CollectionConfig = {
  slug: 'posts',
  admin: {
    defaultColumns: ['title', 'slug', 'publishedAt'],
    group: 'Content',
    useAsTitle: 'title',
  },
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: publicRead,
    update: adminsOnly,
  },
  fields: [
    { name: 'title', type: 'text', required: true },
    { name: 'slug', type: 'text', required: true },
    { name: 'excerpt', type: 'textarea', required: true },
    { name: 'body', type: 'richText' },
    { name: 'publishedAt', type: 'date', required: true },
  ],
}
