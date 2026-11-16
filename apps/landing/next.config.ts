import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  transpilePackages: [
    "@ada-merkez/copy",
    "@ada-merkez/brand",
    "@ada-merkez/shared",
    "@ada-merkez/ui",
  ],
  poweredByHeader: false,
  reactStrictMode: true,
  async rewrites() {
    const upstream = process.env.API_URL?.replace(/\/$/, "");
    return upstream
      ? [{ source: "/v1/:path*", destination: `${upstream}/v1/:path*` }]
      : [];
  },
  async headers() {
    return [
      {
        source: "/app/sw.js",
        headers: [
          {
            key: "Content-Type",
            value: "application/javascript; charset=utf-8",
          },
          { key: "Service-Worker-Allowed", value: "/app" },
          { key: "Cache-Control", value: "no-cache" },
        ],
      },
    ];
  },
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
