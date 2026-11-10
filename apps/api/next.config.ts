import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ada-merkez/db", "@ada-merkez/shared", "@ada-merkez/copy"],
  serverExternalPackages: ["pg"],
  poweredByHeader: false,
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    return config;
  },
};

export default nextConfig;
