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
    const data = error.response?.data;

    // Standard API response: { message: "..." }
    if (data?.message && typeof data.message === "string") {
      return data.message;
    }
    // Array format: { errors: [{ message: "..." }] }
    if (Array.isArray(data?.errors) && data.errors[0]?.message) {
      return data.errors[0].message;
    }
    // Nested format: { error: { message: "..." } }
    if (data?.error?.message && typeof data.error.message === "string") {
      return data.error.message;
    }

    // Network/timeout errors
    if (error.code === "ECONNABORTED" || error.code === "ERR_CANCELED") {
      return "Request timed out. Please check your connection and try again.";
    }
    if (!error.response) {
      return "Unable to connect to the server. Please check your internet connection.";
    }

    return fallback;
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
  // User cancelled the auth flow — not an error
  if (error && typeof error === "object" && "code" in error) {
    const code = (error as { code: string }).code;
    if (code === "ERR_CANCELED" || code === "user_cancelled") {
      return "";
    }
  }

  if (
    error &&
    typeof error === "object" &&
    "errors" in error &&
    Array.isArray((error as { errors: unknown[] }).errors)
  ) {
    const clerkErrors = (
      error as { errors: { longMessage?: string; message?: string; code?: string }[] }
    ).errors;
    const first = clerkErrors[0];
    if (first?.longMessage) return first.longMessage;
    if (first?.message) return first.message;
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
