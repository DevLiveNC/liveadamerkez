/** ?iskelet=1 yalnız yerel ve Vercel preview’da. Production’da kapalı. */
export function skeletonQueryEnabled() {
  return process.env.VERCEL_ENV !== "production";
}
