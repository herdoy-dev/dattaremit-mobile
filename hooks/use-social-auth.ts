import { useState, useCallback } from "react";
import { useRouter } from "expo-router";
import { useSSO } from "@clerk/clerk-expo";
import { useOnboardingStore } from "@/store/onboarding-store";

export function useSocialAuth() {
  const router = useRouter();
  const { setStep } = useOnboardingStore();
  const { startSSOFlow } = useSSO();
  const [loadingAction, setLoadingAction] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleSocialAuth = useCallback(
    async (strategy: "oauth_google" | "oauth_apple") => {
      setLoadingAction(strategy);
      setAuthError(null);

      try {
        const { createdSessionId, setActive: ssoSetActive } =
          await startSSOFlow({ strategy });

        if (createdSessionId && ssoSetActive) {
          await ssoSetActive({ session: createdSessionId });
          await setStep("profile");
          router.replace("/(onboarding)/profile");
        }
      } catch (err: any) {
        setAuthError(
          err?.errors?.[0]?.longMessage ||
            "Social sign-in failed. Please try again."
        );
      } finally {
        setLoadingAction(null);
      }
    },
    [startSSOFlow, setStep, router]
  );

  return {
    handleSocialAuth,
    loadingAction,
    setLoadingAction,
    authError,
    setAuthError,
  };
}
