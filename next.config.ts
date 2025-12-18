import type { NextConfig } from "next";
const isProd = process.env.NODE_ENV === "production";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  output: isProd ? "export" : undefined,
  distDir: "../dist/frontend",
  basePath: "",
  assetPrefix: isProd ? "./" : undefined,
  images: {
    unoptimized: true,
  },
  trailingSlash: true,
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
