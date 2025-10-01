/** @type {import('next').NextConfig} */
const nextConfig = {
  // App directory is now stable in Next.js 13+, no experimental flag needed
  output: 'standalone',
  trailingSlash: false,
  skipTrailingSlashRedirect: true,
  images: {
    unoptimized: true
  },
  experimental: {
    missingSuspenseWithCSRBailout: false
  }
}

module.exports = nextConfig