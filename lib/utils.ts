import type { OnboardingStep } from "@/store/onboarding-store";

export const delay = (ms: number) =>
  new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Determines the correct onboarding step based on server account data.
 * Used after login/register to sync local state with server state.
 */
export function resolveOnboardingStep(accountData: {
  data?: {
    user: unknown | null;
    addresses: unknown[];
    accountStatus: string;
  };
}): OnboardingStep {
  const data = accountData?.data;
  if (!data?.user) return "referral";
  if (!data.addresses || data.addresses.length === 0) return "address";

  switch (data.accountStatus) {
    case "INITIAL":
    case "REJECTED":
      return "kyc";
    case "PENDING":
    case "ACTIVE":
      return "completed";
    default:
      return "profile";
  }
}
