/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  async redirects() {
    return [
      { source: '/2025/06/', destination: '/blog/', permanent: true },
      { source: '/2025/07/', destination: '/blog/', permanent: true },
      { source: '/2026/06/', destination: '/blog/', permanent: true },
      { source: '/author/hienx24/', destination: '/blog/', permanent: true },
      { source: '/author/x24-macb/', destination: '/blog/', permanent: true },
      { source: '/elements/pages/gioi-thieu/', destination: '/gioi-thieu/', permanent: true },
      { source: '/my-account/lost-password/', destination: '/lien-he/', permanent: true },
      { source: '/cdn-cgi/l/email-protection', destination: '/lien-he/', permanent: true },
    ]
  },
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'Cache-Control', value: 'private, no-store, max-age=0' },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
    ] }]
  },
  images: { remotePatterns: [
    { protocol: 'https', hostname: 'static.x24sport.vn' },
    { protocol: 'https', hostname: 'mayaochaybo.vn' },
    { protocol: 'https', hostname: 'www.mayaochaybo.vn' },
  ] },
}
export default nextConfig
