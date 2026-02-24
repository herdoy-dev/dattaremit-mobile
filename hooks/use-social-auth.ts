import { useState, useCallback } from "react";
import { useSSO } from "@clerk/clerk-expo";
import { usePostAuthRouting } from "@/hooks/use-post-auth-routing";
import { getClerkErrorMessage } from "@/lib/utils";

export function useSocialAuth() {
  const { startSSOFlow } = useSSO();
  const { routeAfterAuth } = usePostAuthRouting();
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
          await routeAfterAuth();
        }
      } catch (err: unknown) {
        setAuthError(
          getClerkErrorMessage(err, "Social sign-in failed. Please try again.")
        );
      } finally {
        setLoadingAction(null);
      }
    },
    [startSSOFlow, routeAfterAuth]
  );

  return {
    handleSocialAuth,
    loadingAction,
    setLoadingAction,
    authError,
    setAuthError,
  };
}
