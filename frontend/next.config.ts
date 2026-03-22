import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false, // prevents double-mount in dev (duplicate API calls)
};

export default nextConfig;
