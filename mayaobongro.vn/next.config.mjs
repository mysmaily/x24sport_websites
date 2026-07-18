/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  async redirects() {
    return [
      {
        source: '/mau-ao-bong-ro/',
        destination: '/san-pham/',
        permanent: true,
      },
    ]
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'cdn.mayaobongro.vn' },
      { protocol: 'https', hostname: 'mayaobongro.vn' },
      { protocol: 'https', hostname: 'wp.mayaobongro.vn' },
      { protocol: 'https', hostname: 'static.x24sport.vn' },
    ],
  },
}

export default nextConfig
