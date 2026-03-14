import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import { useOnboardingStore } from "@/store/onboarding-store";
import { onboardingService } from "@/services/onboarding";
import { resolveOnboardingStep } from "@/lib/utils";
import { ONBOARDING_STEP_ROUTES } from "@/constants/onboarding-routes";
import { typedReplace } from "@/lib/navigation";

/**
 * Handles app bootstrap logic: waits for Clerk + onboarding store to load,
 * then routes to auth, onboarding, or main tabs.
 */
export function useAppBootstrap() {
  const router = useRouter();
  const { isSignedIn, isLoaded: isClerkLoaded } = useAuth();
  const { step, isLoaded: isOnboardingLoaded, setStep } = useOnboardingStore();
  const hasRouted = useRef(false);

  useEffect(() => {
    if (!isClerkLoaded || !isOnboardingLoaded || hasRouted.current) return;

    if (!isSignedIn) {
      hasRouted.current = true;
      router.replace("/(auth)/welcome");
      return;
    }

    hasRouted.current = true;

    onboardingService
      .getAccountStatus()
      .then(async (accountData) => {
        const serverStep = resolveOnboardingStep(accountData);
        await setStep(serverStep);
        const target = ONBOARDING_STEP_ROUTES[serverStep] || "/(onboarding)/profile";
        typedReplace(router, target);
      })
      .catch(() => {
        // Don't fall back to potentially tampered local state — show error
        typedReplace(router, "/(auth)/welcome" as never);
      });
  }, [isClerkLoaded, isOnboardingLoaded, isSignedIn]);
}
