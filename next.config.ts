import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // ⚠ let `next build` succeed even if there are TS errors
    ignoreBuildErrors: true,        // :contentReference[oaicite:1]{index=1}
  },
  eslint: {
    // ⚠ skip ESLint during builds
    ignoreDuringBuilds: true,
  },};

export default nextConfig;