import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "images.unsplash.com" },
      { protocol: "https", hostname: "picsum.photos" },
      { protocol: "https", hostname: "fastly.picsum.photos" },
      { protocol: "https", hostname: "cbu01.alicdn.com" },
      { protocol: "https", hostname: "img.alicdn.com" },
      { protocol: "https", hostname: "**.alicdn.com" },
      { protocol: "https", hostname: "flagcdn.com" },
    ],
  },
  eslint: { ignoreDuringBuilds: true },
  typescript: { ignoreBuildErrors: false },
  serverExternalPackages: ["@electric-sql/pglite", "pg"],
  // better-auth ships ESM that must be compiled with the app's React instance,
  // otherwise the client hooks hit "invalid hook call" (duplicate React).
  transpilePackages: ["better-auth", "@better-auth/drizzle-adapter"],
};

export default nextConfig;
