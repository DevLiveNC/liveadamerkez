import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ada-merkez/copy", "@ada-merkez/brand", "@ada-merkez/shared", "@ada-merkez/ui"],
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
