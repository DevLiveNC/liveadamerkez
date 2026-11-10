import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: ["@ada-merkez/copy", "@ada-merkez/brand", "@ada-merkez/shared", "@ada-merkez/ui"],
  poweredByHeader: false,
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.extensionAlias = {
      ".js": [".ts", ".tsx", ".js"],
    };
    config.module.rules.push({
      test: /\.svg$/,
      include: /packages\/ui\/dekor/,
      type: "asset/resource",
    });
    return config;
  },
};

export default nextConfig;
