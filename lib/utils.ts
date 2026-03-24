import { isAxiosError } from "axios";
import type { OnboardingStep } from "@/store/onboarding-store";
import type { AccountStatusResponse } from "@/types/api";

export const delay = (ms: number) => new Promise<void>((resolve) => setTimeout(resolve, ms));

/**
 * Determines the correct onboarding step based on server account data.
 * Used after login/register to sync local state with server state.
 */
export function resolveOnboardingStep(accountData: AccountStatusResponse): OnboardingStep {
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

/**
 * Extracts a user-friendly error message from API errors.
 */
export function getApiErrorMessage(error: unknown, fallback: string): string {
  if (isAxiosError(error)) {
    return error.response?.data?.message || fallback;
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

/**
 * Extracts a user-friendly error message from Clerk SDK errors.
 */
export function getClerkErrorMessage(error: unknown, fallback: string): string {
  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as { errors: unknown[] }).errors)
  ) {
    const clerkErrors = (error as { errors: { longMessage?: string }[] }).errors;
    if (clerkErrors[0]?.longMessage) {
      return clerkErrors[0].longMessage;
    }
  }
  if (error instanceof Error) {
    return error.message || fallback;
  }
  return fallback;
}

/**
 * Converts a hex color to rgba string.
 */
export function hexToRgba(hex: string, alpha: number): string {
  const r = parseInt(hex.slice(1, 3), 16);
  const g = parseInt(hex.slice(3, 5), 16);
  const b = parseInt(hex.slice(5, 7), 16);
  return `rgba(${r}, ${g}, ${b}, ${alpha})`;
}
