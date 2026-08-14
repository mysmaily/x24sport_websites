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
    { name: 'facebookUrl', type: 'text' },
    { name: 'tiktokUrl', type: 'text' },
    { name: 'instagramUrl', type: 'text' },
    { name: 'pinterestUrl', type: 'text' },
    { name: 'threadsUrl', type: 'text' },
    {
      name: 'telegramChatId',
      type: 'text',
      admin: {
        description: 'Telegram chat ID nhận thông báo từ form tư vấn trên trang chi tiết sản phẩm. Để trống để ẩn form.',
      },
    },
    {
      name: 'mapLocations',
      type: 'array',
      admin: {
        description: 'Địa chỉ cửa hàng/xưởng và link Google Maps dùng cho nút Chỉ đường trên website.',
      },
      fields: [
        { name: 'label', type: 'text', required: true },
        { name: 'address', type: 'textarea', required: true },
        { name: 'googleMapUrl', type: 'text', required: true },
      ],
    },
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
        {
          name: 'metaPixelEnabled',
          type: 'checkbox',
          defaultValue: false,
          admin: {
            description: 'Bật nhúng Meta Pixel trên frontend nếu tenant có Pixel ID.',
          },
        },
        {
          name: 'metaPixelId',
          type: 'text',
          admin: {
            description: 'Meta Pixel ID dạng số để frontend ghi nhận PageView.',
          },
        },
        {
          name: 'customScripts',
          type: 'array',
          admin: {
            description: 'Thêm mã HTML/JS như Google Tag, Meta Pixel, TikTok Pixel hoặc thẻ xác minh. Chỉ quản trị viên đáng tin cậy nên chỉnh mục này.',
          },
          fields: [
            {
              name: 'label',
              type: 'text',
              required: true,
              admin: {
                description: 'Tên nội bộ để nhận biết đoạn mã, ví dụ: Google Tag, Meta Pixel, TikTok Pixel.',
              },
            },
            {
              name: 'enabled',
              type: 'checkbox',
              defaultValue: true,
            },
            {
              name: 'position',
              type: 'select',
              required: true,
              defaultValue: 'bodyEnd',
              options: [
                { label: 'Trong thẻ <head>', value: 'head' },
                { label: 'Ngay sau khi mở <body>', value: 'bodyStart' },
                { label: 'Cuối thẻ <body>', value: 'bodyEnd' },
              ],
              admin: {
                description: 'Chọn đúng vị trí theo hướng dẫn của nền tảng cung cấp mã.',
              },
            },
            {
              name: 'code',
              type: 'textarea',
              required: true,
              admin: {
                rows: 12,
                description: 'Dán nguyên đoạn mã HTML/JS do nền tảng cung cấp.',
              },
            },
          ],
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
