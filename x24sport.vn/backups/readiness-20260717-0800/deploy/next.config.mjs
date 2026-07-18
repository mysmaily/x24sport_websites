/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  trailingSlash: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'static.x24sport.vn' },
      { protocol: 'https', hostname: 'x24sport.vn' },
    ],
  },
}

export default nextConfig
