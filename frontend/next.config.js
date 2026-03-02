/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'http',
        hostname: '46.225.210.163',
        port: '3001',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'josmardev.me',
        pathname: '/uploads/**',
      },
      {
        protocol: 'https',
        hostname: 'www.josmardev.me',
        pathname: '/uploads/**',
      },
    ],
  },
}

module.exports = nextConfig
