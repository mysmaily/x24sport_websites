import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead } from '../access/roles'

export const Pages: CollectionConfig = {
  slug: 'pages',
  admin: {
    defaultColumns: ['title', 'slug', 'updatedAt'],
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
    { name: 'heroTitle', type: 'text', required: true },
    { name: 'heroText', type: 'textarea', required: true },
    {
      name: 'sections',
      type: 'array',
      fields: [
        { name: 'heading', type: 'text', required: true },
        { name: 'body', type: 'textarea', required: true },
      ],
    },
  ],
}
