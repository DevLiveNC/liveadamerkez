const DEV_PLACEHOLDER = "ada-otp-dev-unconfigured";

export function isProductionEnv(env: NodeJS.ProcessEnv = process.env): boolean {
  return env.VERCEL_ENV === "production" || env.NODE_ENV === "production";
}

export function assertProductionSecrets(env: NodeJS.ProcessEnv = process.env): void {
  if (!isProductionEnv(env)) return;
  const auth = env.AUTH_SECRET?.trim();
  const pepper = env.OTP_PEPPER?.trim();
  if (!auth || !pepper || auth === DEV_PLACEHOLDER || pepper === DEV_PLACEHOLDER) {
    throw new Error("AUTH_SECRET ve OTP_PEPPER production ortamında zorunludur.");
  }
}
