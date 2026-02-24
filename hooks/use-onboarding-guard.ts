import { useEffect } from "react";
import { useRouter } from "expo-router";
import { useOnboardingStore } from "@/store/onboarding-store";
import { GUARD_STEP_ROUTES } from "@/constants/onboarding-routes";

/**
 * Redirects users away from protected layouts (tabs, transfer)
 * if they haven't completed onboarding.
 */
export function useOnboardingGuard() {
  const router = useRouter();
  const { step, isLoaded } = useOnboardingStore();

  useEffect(() => {
    if (!isLoaded) return;
    if (step !== "completed") {
      const route = GUARD_STEP_ROUTES[step] || "/(onboarding)/profile";
      router.replace(route as never);
    }
  }, [isLoaded, step, router]);
}
