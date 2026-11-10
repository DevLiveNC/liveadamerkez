import { defineConfig } from "vitest/config";
import path from "node:path";

export default defineConfig({
  test: {
    include: [
      "packages/**/*.test.ts",
      "apps/api/**/*.test.ts",
      "scripts/**/*.test.ts",
    ],
    environment: "node",
    fileParallelism: false,
    testTimeout: 30_000,
    hookTimeout: 30_000,
  },
  resolve: {
    alias: {
<<<<<<< HEAD
      "@ada-merkez/shared/secrets": path.resolve(__dirname, "packages/shared/src/secrets.ts"),
      "@ada-merkez/shared/node": path.resolve(__dirname, "packages/shared/src/node.ts"),
      "@ada-merkez/shared": path.resolve(__dirname, "packages/shared/src/index.ts"),
      "@ada-merkez/copy": path.resolve(__dirname, "packages/copy/src/index.ts"),
      "@ada-merkez/db": path.resolve(__dirname, "packages/db/src/index.ts"),
    },
  },
});
