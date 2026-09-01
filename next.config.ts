import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["drizzle-orm"],
  },
}

export default nextConfig
