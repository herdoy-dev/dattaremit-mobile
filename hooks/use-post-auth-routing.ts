import { useCallback } from "react";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import { resolveOnboardingStep } from "@/lib/utils";
import { ONBOARDING_STEP_ROUTES } from "@/constants/onboarding-routes";
import { typedReplace } from "@/lib/navigation";

/**
 * Fetches account status from server, resolves the onboarding step,
 * updates the store, and navigates to the correct screen.
 * Replaces the duplicated "fetch -> resolve -> route" pattern
 * found in register, login, verify-email, and social auth.
 */
export function usePostAuthRouting() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();

  const routeAfterAuth = useCallback(async () => {
    try {
      const accountData = await onboardingService.getAccountStatus();
      const step = resolveOnboardingStep(accountData);
      await setStep(step);
      const route = ONBOARDING_STEP_ROUTES[step] || "/(onboarding)/profile";
      typedReplace(router, route);
    } catch {
      await setStep("profile");
      router.replace("/(onboarding)/profile");
    }
  }, [router, setStep]);

  return { routeAfterAuth };
}
