/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  async headers() {
    return [{ source: '/:path*', headers: [
      { key: 'X-Robots-Tag', value: 'noindex, nofollow, noarchive' },
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
