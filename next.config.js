/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    domains: ['localhost'],
    unoptimized: true,
  },
  // 启用严格模式
  reactStrictMode: true,
  // 启用SWC压缩
  swcMinify: true,
}

module.exports = nextConfig
