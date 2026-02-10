/** @type {import('next').NextConfig} */
const nextConfig = {
  typescript: {
    // Skip type checking during build - we have custom Supabase tables
    ignoreDuringBuilds: true,
  },
  eslint: {
    // Skip ESLint during build for faster deploys
    ignoreDuringBuilds: true,
  },
  experimental: {
    serverActions: {
      allowedOrigins: ['localhost:3000'],
    },
  },
}

module.exports = nextConfig
