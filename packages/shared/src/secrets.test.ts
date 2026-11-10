import { afterEach, describe, expect, it } from "vitest";
import { assertProductionSecrets } from "./secrets.js";

describe("production secrets", () => {
  const prev = {
    NODE_ENV: process.env.NODE_ENV,
    VERCEL_ENV: process.env.VERCEL_ENV,
    AUTH_SECRET: process.env.AUTH_SECRET,
    OTP_PEPPER: process.env.OTP_PEPPER,
  };

  afterEach(() => {
    process.env.NODE_ENV = prev.NODE_ENV;
    process.env.VERCEL_ENV = prev.VERCEL_ENV;
    process.env.AUTH_SECRET = prev.AUTH_SECRET;
    process.env.OTP_PEPPER = prev.OTP_PEPPER;
  });

  it("throws in production when AUTH_SECRET or OTP_PEPPER is missing", () => {
    expect(() =>
      assertProductionSecrets({
        NODE_ENV: "production",
        AUTH_SECRET: "",
        OTP_PEPPER: "pepper",
      }),
    ).toThrow(/AUTH_SECRET ve OTP_PEPPER/);
    expect(() =>
      assertProductionSecrets({
        VERCEL_ENV: "production",
        AUTH_SECRET: "secret",
        OTP_PEPPER: "ada-otp-dev-unconfigured",
      }),
    ).toThrow(/AUTH_SECRET ve OTP_PEPPER/);
  });

  it("allows development without secrets and production with both set", () => {
    expect(() => assertProductionSecrets({ NODE_ENV: "test" })).not.toThrow();
    expect(() =>
      assertProductionSecrets({
        NODE_ENV: "production",
        AUTH_SECRET: "prod-auth",
        OTP_PEPPER: "prod-pepper",
      }),
    ).not.toThrow();
  });
});
