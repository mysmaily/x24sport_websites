/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  poweredByHeader: false,
  async redirects() {
    return [
      { source: '/shop', destination: '/san-pham/', permanent: true },
      { source: '/tu-khoa/:path*', destination: '/san-pham/', permanent: true },
      { source: '/category/:path*', destination: '/blog/', permanent: true },
      { source: '/author/:path*', destination: '/blog/', permanent: true },
    ]
  },
  async headers() {
    const securityHeaders = [
      { key: 'X-Content-Type-Options', value: 'nosniff' },
      { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
      { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
      { key: 'Content-Security-Policy', value: "object-src 'none'; base-uri 'self'; frame-ancestors 'self'; upgrade-insecure-requests" },
      { key: 'Strict-Transport-Security', value: 'max-age=31536000; includeSubDomains' },
    ]
    const immutableAssetHeaders = [
      { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
      ...securityHeaders,
    ]
    return [
      { source: '/fonts/:path*', headers: immutableAssetHeaders },
      { source: '/images/:path*', headers: immutableAssetHeaders },
      { source: '/(.*)', headers: securityHeaders },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'static.x24sport.vn' },
      { protocol: 'https', hostname: 'x24sport.vn' },
      { protocol: 'https', hostname: 'cdn.x24sport.vn' },
    ],
  },
}

export default nextConfig
