// Build-time feature flags, read once from env (NEXT_PUBLIC_* are inlined at
// build time — changing them in production requires a rebuild/redeploy).

/**
 * Membership is temporarily closed. Set NEXT_PUBLIC_MEMBERSHIP_ENABLED=false
 * to show "Coming soon" instead of the checkout flow. Missing or any other
 * value = enabled (safe default).
 */
export const MEMBERSHIP_ENABLED =
  process.env.NEXT_PUBLIC_MEMBERSHIP_ENABLED !== "false";
