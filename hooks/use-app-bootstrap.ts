import { useEffect, useRef } from "react";
import { useRouter } from "expo-router";
import { useAuth } from "@clerk/clerk-expo";
import * as Sentry from "@sentry/react-native";
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

    Sentry.startSpan({ name: "app.bootstrap", op: "app.lifecycle" }, async (span) => {
      try {
        const accountData = await onboardingService.getAccountStatus();
        const serverStep = resolveOnboardingStep(accountData);
        await setStep(serverStep);
        const target = ONBOARDING_STEP_ROUTES[serverStep] || "/(onboarding)/profile";
        span.setAttribute("onboarding.step", serverStep);
        span.setAttribute("onboarding.target", target);
        typedReplace(router, target);
      } catch {
        span.setStatus({ code: 2, message: "error" });
        typedReplace(router, "/(auth)/welcome");
      }
    });
  }, [isClerkLoaded, isOnboardingLoaded, isSignedIn]);
}
