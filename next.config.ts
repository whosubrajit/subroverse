import type { NextConfig } from "next"

const nextConfig: NextConfig = {
  poweredByHeader: false,
  reactStrictMode: true,
  experimental: {
    optimizePackageImports: ["drizzle-orm"],
  },
  async rewrites() {
    return [
      { source: "/about", destination: "/" },
      { source: "/write", destination: "/" },
      { source: "/stories", destination: "/" },
    ]
  },
}

export default nextConfig
