import type { OnboardingStep } from "@/store/onboarding-store";

/**
 * Maps an onboarding step to its route — used after auth to navigate
 * to the correct onboarding screen or the main app.
 */
export const ONBOARDING_STEP_ROUTES: Record<OnboardingStep, string> = {
  welcome: "/(onboarding)/referral",
  auth: "/(onboarding)/referral",
  referral: "/(onboarding)/referral",
  profile: "/(onboarding)/profile",
  address: "/(onboarding)/address",
  kyc: "/(onboarding)/kyc",
  completed: "/(tabs)",
};

/**
 * Maps an incomplete step to the correct onboarding screen.
 * Used by layout guards (tabs, transfer) to redirect users
 * who haven't completed onboarding yet.
 */
export const GUARD_STEP_ROUTES: Record<string, string> = {
  welcome: "/(onboarding)/profile",
  auth: "/(onboarding)/profile",
  profile: "/(onboarding)/profile",
  address: "/(onboarding)/address",
  kyc: "/(onboarding)/kyc",
};
