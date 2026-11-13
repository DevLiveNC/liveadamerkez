import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.LANDING_PORT ?? 3100);
const apiPort = Number(process.env.API_PORT ?? 3001);
const baseURL = process.env.PLAYWRIGHT_BASE_URL ?? `http://127.0.0.1:${port}`;
const apiURL = process.env.PLAYWRIGHT_API_URL ?? `http://127.0.0.1:${apiPort}`;

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: false,
  forbidOnly: Boolean(process.env.CI),
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    locale: "tr-TR",
    timezoneId: "Europe/Nicosia",
    trace: "on-first-retry",
    launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE
      ? {
          executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE,
          args: ["--no-sandbox", "--disable-dev-shm-usage"],
        }
      : undefined,
  },
  webServer: process.env.PLAYWRIGHT_BASE_URL
    ? undefined
    : [
        {
          command: `npm run start -w @ada-merkez/api -- --port ${apiPort} --hostname 127.0.0.1`,
          url: `${apiURL}/health`,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            PORT: String(apiPort),
            DATABASE_URL: process.env.DATABASE_URL ?? "",
            INTERNAL_EXPORT_TOKEN:
              process.env.INTERNAL_EXPORT_TOKEN ?? "e2e-export-token",
            AUTH_SECRET:
              process.env.E2E_AUTH_SECRET ??
              process.env.AUTH_SECRET ??
              "e2e-auth-secret",
            OTP_PEPPER:
              process.env.E2E_OTP_PEPPER ??
              process.env.OTP_PEPPER ??
              "e2e-otp-pepper",
            OTP_RETURN_CODE: process.env.OTP_RETURN_CODE ?? "true",
            AUTH_TEST_LOGIN: process.env.AUTH_TEST_LOGIN ?? "off",
            CORS_ORIGINS: process.env.CORS_ORIGINS ?? baseURL,
            WAITLIST_OPEN: process.env.WAITLIST_OPEN ?? "",
          },
        },
        {
          command: `npm run start -w @ada-merkez/landing -- --port ${port} --hostname 127.0.0.1`,
          url: baseURL,
          reuseExistingServer: !process.env.CI,
          timeout: 120_000,
          env: {
            ...process.env,
            PORT: String(port),
            NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL ?? apiURL,
            AUTH_SECRET:
              process.env.E2E_AUTH_SECRET ??
              process.env.AUTH_SECRET ??
              "e2e-auth-secret",
            OTP_PEPPER:
              process.env.E2E_OTP_PEPPER ??
              process.env.OTP_PEPPER ??
              "e2e-otp-pepper",
            AUTH_TEST_LOGIN: process.env.AUTH_TEST_LOGIN ?? "off",
            COOKIE_SECURE: process.env.COOKIE_SECURE ?? "false",
          },
        },
      ],
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
});
