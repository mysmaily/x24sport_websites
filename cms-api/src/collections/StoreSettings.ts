import type { CollectionConfig } from 'payload'

import { adminsOnly, publicRead } from '../access/roles'

export const StoreSettings: CollectionConfig = {
  slug: 'store-settings',
  admin: {
    group: 'Platform',
    useAsTitle: 'siteName',
  },
  access: {
    create: adminsOnly,
    delete: adminsOnly,
    read: publicRead,
    update: adminsOnly,
  },
  fields: [
    { name: 'siteName', type: 'text', required: true },
    { name: 'contactPhone', type: 'text' },
    { name: 'zaloUrl', type: 'text' },
    {
      name: 'analytics',
      type: 'group',
      fields: [
        {
          name: 'ga4Enabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Bật nhúng Google Analytics 4 trên frontend nếu tenant có Measurement ID.',
          },
        },
        {
          name: 'gaMeasurementId',
          type: 'text',
          admin: {
            description: 'Measurement ID dạng G-XXXXXXX để frontend nhúng Google tag.',
          },
        },
        {
          name: 'gaPropertyId',
          type: 'text',
          admin: {
            description: 'GA4 Property ID dùng cho báo cáo Telegram hằng ngày từ Data API.',
          },
        },
        {
          name: 'dailyTelegramReportEnabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Nếu bật và có GA4 Property ID, tenant sẽ được đưa vào báo cáo 23:00 hằng ngày.',
          },
        },
      ],
    },
    {
      name: 'navigation',
      type: 'array',
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'href', type: 'text', required: true },
      ],
    },
  ],
}
